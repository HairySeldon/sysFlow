import { ID, NodeEntity, ContainerEntity, Port, PortSide } from './Entity';
import { EdgeEntity } from './Edge';
import { NodeLayoutResult, LayoutResult } from '../layout/LayoutEngine';

export interface LogicalGraph {
  version: string;
  nodes: Record<ID, NodeEntity>;
  containers: Record<ID, ContainerEntity>;
  edges: Record<ID, EdgeEntity>;
}

export interface PortPerimeterLocation {
  portId: ID;
  side: 'left' | 'right' | 'top' | 'bottom';
  /** Local coordinates relative to the entity box */
  localX: number;
  localY: number;
  /** Global canvas coordinates */
  worldX: number;
  worldY: number;
}

/**
 * Calculates exact perimeter port locations for an entity after layout dimensions are resolved.
 * If port.side is 'auto', it analyzes connected edges and peer positions to choose the
 * optimal side (top, bottom, left, right).
 */
export function computeEntityPortLocations(
  entity: NodeEntity,
  layout: NodeLayoutResult,
  defaultLayoutDirection: 'LR' | 'TB' = 'LR',
  graph?: LogicalGraph,
  allLayouts?: LayoutResult
): Map<ID, PortPerimeterLocation> {
  const result = new Map<ID, PortPerimeterLocation>();
  if (!entity || !layout || !entity.ports || entity.ports.length === 0) {
    return result;
  }

  const myCenterX = layout.x + layout.width / 2;
  const myCenterY = layout.y + layout.height / 2;

  // 1. Group ports by their resolved perimeter side with peer positioning for untangling
  const sides: Record<
    'left' | 'right' | 'top' | 'bottom',
    Array<{ port: Port; peerX: number; peerY: number }>
  > = {
    left: [],
    right: [],
    top: [],
    bottom: []
  };

  entity.ports.forEach((port) => {
    let side: PortSide = port.side || 'auto';

    if (side === 'auto') {
      let resolved = false;

      // Analyze connected edges to find the average relative position of peer nodes
      if (graph && allLayouts) {
        let sumDx = 0;
        let sumDy = 0;
        let peerSumX = 0;
        let peerSumY = 0;
        let count = 0;

        for (const edge of Object.values(graph.edges)) {
          const isSource = edge.sourceId === entity.id && edge.sourcePortId === port.id;
          const isTarget = edge.targetId === entity.id && edge.targetPortId === port.id;

          if (isSource || isTarget) {
            const peerId = isSource ? edge.targetId : edge.sourceId;
            const peerLayout = allLayouts.nodes[peerId] || allLayouts.containers[peerId];
            if (peerLayout) {
              const peerCenterX = peerLayout.x + peerLayout.width / 2;
              const peerCenterY = peerLayout.y + peerLayout.height / 2;
              sumDx += peerCenterX - myCenterX;
              sumDy += peerCenterY - myCenterY;
              peerSumX += peerCenterX;
              peerSumY += peerCenterY;
              count++;
            }
          }
        }

        if (count > 0) {
          const avgDx = sumDx / count;
          const avgDy = sumDy / count;

          // Normalize vector by half-dimensions to find the intersecting perimeter side
          const halfW = Math.max(layout.width / 2, 1);
          const halfH = Math.max(layout.height / 2, 1);
          const nx = avgDx / halfW;
          const ny = avgDy / halfH;

          if (Math.abs(ny) >= Math.abs(nx)) {
            side = ny >= 0 ? 'bottom' : 'top';
          } else {
            side = nx >= 0 ? 'right' : 'left';
          }

          sides[side].push({
            port,
            peerX: peerSumX / count,
            peerY: peerSumY / count
          });
          resolved = true;
        }
      }

      // Fallback if port is unconnected
      if (!resolved) {
        if (defaultLayoutDirection === 'TB') {
          side = port.direction === 'in' ? 'top' : 'bottom';
        } else {
          side = port.direction === 'in' ? 'left' : 'right';
        }
        sides[side].push({ port, peerX: myCenterX, peerY: myCenterY });
      }
    } else {
      sides[side as 'left' | 'right' | 'top' | 'bottom'].push({
        port,
        peerX: myCenterX,
        peerY: myCenterY
      });
    }
  });

  // Sort ports on each side by peer coordinate to prevent crossing wires
  sides.top.sort((a, b) => a.peerX - b.peerX);
  sides.bottom.sort((a, b) => a.peerX - b.peerX);
  sides.left.sort((a, b) => a.peerY - b.peerY);
  sides.right.sort((a, b) => a.peerY - b.peerY);

  // 2. Distribute ports along each perimeter boundary
  // Left perimeter
  sides.left.forEach(({ port }, idx) => {
    const total = sides.left.length;
    const localY = (layout.height / (total + 1)) * (idx + 1);
    result.set(port.id, {
      portId: port.id,
      side: 'left',
      localX: 0,
      localY,
      worldX: layout.x,
      worldY: layout.y + localY
    });
  });

  // Right perimeter
  sides.right.forEach(({ port }, idx) => {
    const total = sides.right.length;
    const localY = (layout.height / (total + 1)) * (idx + 1);
    result.set(port.id, {
      portId: port.id,
      side: 'right',
      localX: layout.width,
      localY,
      worldX: layout.x + layout.width,
      worldY: layout.y + localY
    });
  });

  // Top perimeter
  sides.top.forEach(({ port }, idx) => {
    const total = sides.top.length;
    const localX = (layout.width / (total + 1)) * (idx + 1);
    result.set(port.id, {
      portId: port.id,
      side: 'top',
      localX,
      localY: 0,
      worldX: layout.x + localX,
      worldY: layout.y
    });
  });

  // Bottom perimeter
  sides.bottom.forEach(({ port }, idx) => {
    const total = sides.bottom.length;
    const localX = (layout.width / (total + 1)) * (idx + 1);
    result.set(port.id, {
      portId: port.id,
      side: 'bottom',
      localX,
      localY: layout.height,
      worldX: layout.x + localX,
      worldY: layout.y + layout.height
    });
  });

  return result;
}

export function pruneDanglingEdges(graph: LogicalGraph): LogicalGraph {
  const validEdges: Record<ID, EdgeEntity> = {};

  const getEntityPorts = (id: ID): Set<ID> => {
    const node = graph.nodes[id];
    return new Set(node?.ports?.map((p) => p.id) || []);
  };

  for (const [edgeId, edge] of Object.entries(graph.edges)) {
    const sourcePorts = getEntityPorts(edge.sourceId);
    const targetPorts = getEntityPorts(edge.targetId);

    const isSourceValid = sourcePorts.has(edge.sourcePortId);
    const isTargetValid = targetPorts.has(edge.targetPortId);

    if (isSourceValid && isTargetValid) {
      validEdges[edgeId] = edge;
    }
  }

  return {
    ...graph,
    edges: validEdges
  };
}
