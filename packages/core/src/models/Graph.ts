// packages/core/src/models/Graph.ts

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
 * Uses edge connections (source vs target) to determine input vs output sides if side is 'auto'.
 */
export function computeEntityPortLocations(
  entity: NodeEntity,
  layout: NodeLayoutResult,
  defaultLayoutDirection: 'LR' | 'TB' = 'LR',
  edges?: Record<ID, EdgeEntity> | EdgeEntity[]
): Map<ID, PortPerimeterLocation> {
  const result = new Map<ID, PortPerimeterLocation>();
  if (!entity || !layout || !entity.ports || entity.ports.length === 0) {
    return result;
  }

  // Extract edges involving this entity
  const edgeList: EdgeEntity[] = edges
    ? Array.isArray(edges)
      ? edges
      : (Object.values(edges) as EdgeEntity[])
    : [];

  const incomingPorts = new Set(
    edgeList.filter((e) => e.targetId === entity.id).map((e) => e.targetPortId)
  );
  const outgoingPorts = new Set(
    edgeList.filter((e) => e.sourceId === entity.id).map((e) => e.sourcePortId)
  );

  const sides: Record<'left' | 'right' | 'top' | 'bottom', Port[]> = {
    left: [],
    right: [],
    top: [],
    bottom: []
  };

  entity.ports.forEach((port: Port, idx: number) => {
    let side: PortSide = port.side || 'auto';

    if (side === 'auto') {
      const isIncoming = incomingPorts.has(port.id);
      const isOutgoing = outgoingPorts.has(port.id);

      if (defaultLayoutDirection === 'TB') {
        if (isIncoming && !isOutgoing) {
          side = 'top';
        } else if (isOutgoing && !isIncoming) {
          side = 'bottom';
        } else {
          // If port has both or no edges yet, distribute: first half top, second half bottom
          side = idx < Math.ceil(entity.ports.length / 2) ? 'top' : 'bottom';
        }
      } else {
        // 'LR'
        if (isIncoming && !isOutgoing) {
          side = 'left';
        } else if (isOutgoing && !isIncoming) {
          side = 'right';
        } else {
          // Distribute: first half left, second half right
          side = idx < Math.ceil(entity.ports.length / 2) ? 'left' : 'right';
        }
      }
    }

    sides[side as 'left' | 'right' | 'top' | 'bottom'].push(port);
  });

  // Distribute along perimeters
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
