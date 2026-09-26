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

export type PortPlacementMode = 'strict-flow' | 'perimeter-optimized';

export interface ComputePortOptions {
  direction?: 'LR' | 'TB';
  mode?: PortPlacementMode;
  nodeLayouts?: Record<ID, NodeLayoutResult>;
}

/**
 * Sorts ports along edges so wires do not cross on the same perimeter
 */
function sortPortsByTargetCoordinates(
  sides: Record<'left' | 'right' | 'top' | 'bottom', Port[]>,
  entityId: ID,
  edges: EdgeEntity[],
  nodeLayouts: Record<ID, NodeLayoutResult>
) {
  const getPortTargetCenter = (portId: ID): { x: number; y: number } | null => {
    const edge = edges.find((e) =>
      (e.sourceId === entityId && e.sourcePortId === portId) ||
      (e.targetId === entityId && e.targetPortId === portId)
    );
    if (!edge) return null;
    const otherId = edge.sourceId === entityId ? edge.targetId : edge.sourceId;
    const l = nodeLayouts[otherId];
    return l ? { x: l.x + l.width / 2, y: l.y + l.height / 2 } : null;
  };

  // Vertical sides: sort top-to-bottom by target's y
  ['left', 'right'].forEach((sideKey) => {
    sides[sideKey as 'left' | 'right'].sort((a, b) => {
      const posA = getPortTargetCenter(a.id)?.y ?? 0;
      const posB = getPortTargetCenter(b.id)?.y ?? 0;
      return posA - posB;
    });
  });

  // Horizontal sides: sort left-to-right by target's x
  ['top', 'bottom'].forEach((sideKey) => {
    sides[sideKey as 'top' | 'bottom'].sort((a, b) => {
      const posA = getPortTargetCenter(a.id)?.x ?? 0;
      const posB = getPortTargetCenter(b.id)?.x ?? 0;
      return posA - posB;
    });
  });
}

/**
 * Chooses the perimeter side facing the connected neighbor node
 */
function resolveOptimalPerimeterSide(
  entityId: ID,
  portId: ID,
  isIncoming: boolean,
  edges: EdgeEntity[],
  nodeLayouts?: Record<ID, NodeLayoutResult>,
  currentLayout?: NodeLayoutResult
): 'left' | 'right' | 'top' | 'bottom' {
  if (!nodeLayouts || !currentLayout) {
    return isIncoming ? 'left' : 'right';
  }

  const edge = edges.find((e) =>
    isIncoming
      ? e.targetId === entityId && e.targetPortId === portId
      : e.sourceId === entityId && e.sourcePortId === portId
  );

  if (!edge) return isIncoming ? 'left' : 'right';

  const otherId = isIncoming ? edge.sourceId : edge.targetId;
  const otherLayout = nodeLayouts[otherId];
  if (!otherLayout) return isIncoming ? 'left' : 'right';

  const dx = otherLayout.x + otherLayout.width / 2 - (currentLayout.x + currentLayout.width / 2);
  const dy = otherLayout.y + otherLayout.height / 2 - (currentLayout.y + currentLayout.height / 2);

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  } else {
    return dy > 0 ? 'bottom' : 'top';
  }
}


/**
 * Calculates exact perimeter port locations for an entity after layout dimensions are resolved.
 * Uses edge connections (source vs target) to determine input vs output sides if side is 'auto'.
 */
export function computeEntityPortLocations(
  entity: NodeEntity,
  layout: NodeLayoutResult,
  defaultLayoutDirection: 'LR' | 'TB' = 'LR',
  edges?: Record<ID, EdgeEntity> | EdgeEntity[],
  options?: ComputePortOptions
): Map<ID, PortPerimeterLocation> {
  const result = new Map<ID, PortPerimeterLocation>();
  if (!entity || !layout || !entity.ports || entity.ports.length === 0) {
    return result;
  }

  const mode = options?.mode || (defaultLayoutDirection === 'TB' ? 'strict-flow' : 'perimeter-optimized');
  const edgeList: EdgeEntity[] = edges
    ? Array.isArray(edges) ? edges : Object.values(edges)
    : [];

  const sides: Record<'left' | 'right' | 'top' | 'bottom', Port[]> = {
    left: [],
    right: [],
    top: [],
    bottom: []
  };

  const incomingPorts = new Set(
    edgeList.filter((e) => e.targetId === entity.id).map((e) => e.targetPortId)
  );
  const outgoingPorts = new Set(
    edgeList.filter((e) => e.sourceId === entity.id).map((e) => e.sourcePortId)
  );

  entity.ports.forEach((port: Port) => {
    let side: PortSide = port.side || 'auto';

    if (side === 'auto') {
      if (mode === 'strict-flow') {
        // Flow Requirement: Top = target (in), Bottom = source (out)
        if (defaultLayoutDirection === 'TB') {
          side = incomingPorts.has(port.id) ? 'top' : 'bottom';
        } else {
          side = incomingPorts.has(port.id) ? 'left' : 'right';
        }
      } else {
        // Sys Requirement: Dynamically choose the side facing connected nodes
        // to reduce wire crossings and route length
        side = resolveOptimalPerimeterSide(
          entity.id,
          port.id,
          incomingPorts.has(port.id),
          edgeList,
          options?.nodeLayouts,
          layout
        );
      }
    }

    sides[side as 'left' | 'right' | 'top' | 'bottom'].push(port);
  });

  // Optimize ordering of ports on each face according to target positions
  if (mode === 'perimeter-optimized' && options?.nodeLayouts) {
    sortPortsByTargetCoordinates(sides, entity.id, edgeList, options.nodeLayouts);
  }

  // Calculate local & world coordinates along perimeters
  const assignSideCoords = (sideList: Port[], side: 'left' | 'right' | 'top' | 'bottom') => {
    const total = sideList.length;
    sideList.forEach((port, idx) => {
      let localX = 0;
      let localY = 0;

      if (side === 'left' || side === 'right') {
        localY = (layout.height / (total + 1)) * (idx + 1);
        localX = side === 'left' ? 0 : layout.width;
      } else {
        localX = (layout.width / (total + 1)) * (idx + 1);
        localY = side === 'top' ? 0 : layout.height;
      }

      result.set(port.id, {
        portId: port.id,
        side,
        localX,
        localY,
        worldX: layout.x + localX,
        worldY: layout.y + localY
      });
    });
  };

  assignSideCoords(sides.left, 'left');
  assignSideCoords(sides.right, 'right');
  assignSideCoords(sides.top, 'top');
  assignSideCoords(sides.bottom, 'bottom');

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
