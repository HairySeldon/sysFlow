import { ID, NodeEntity, ContainerEntity, Port, PortSide } from './Entity';
import { EdgeEntity } from './Edge';
import { NodeLayoutResult } from '../layout/LayoutEngine';

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
 * Distributes ports evenly along each perimeter side (top, bottom, left, right).
 */
export function computeEntityPortLocations(
  entity: NodeEntity,
  layout: NodeLayoutResult,
  defaultLayoutDirection: 'LR' | 'TB' = 'LR'
): Map<ID, PortPerimeterLocation> {
  const result = new Map<ID, PortPerimeterLocation>();
  if (!entity || !layout || !entity.ports || entity.ports.length === 0) {
    return result;
  }

  // 1. Group ports by their resolved perimeter side
  const sides: Record<'left' | 'right' | 'top' | 'bottom', Port[]> = {
    left: [],
    right: [],
    top: [],
    bottom: []
  };

  entity.ports.forEach((port) => {
    let side: PortSide = port.side || 'auto';

    if (side === 'auto') {
      if (defaultLayoutDirection === 'TB') {
        side = port.direction === 'in' ? 'top' : 'bottom';
      } else {
        // 'LR' default: inputs on left, outputs on right
        side = port.direction === 'in' ? 'left' : 'right';
      }
    }

    sides[side as 'left' | 'right' | 'top' | 'bottom'].push(port);
  });

  // 2. Distribute ports along each perimeter boundary
  // Left perimeter
  sides.left.forEach((port, idx) => {
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
  sides.right.forEach((port, idx) => {
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
  sides.top.forEach((port, idx) => {
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
  sides.bottom.forEach((port, idx) => {
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

/**
 * Removes any edges whose source/target entity or port no longer exists.
 */
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
