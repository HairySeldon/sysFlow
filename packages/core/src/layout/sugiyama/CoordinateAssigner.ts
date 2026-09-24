import { ID, LogicalGraph, NodeEntity, ContainerEntity, PortSide } from '../../models';
import { LayoutResult, NodeLayoutResult, LayoutOptions } from '../LayoutEngine';

const COLUMN_GAP = 100;
const ROW_GAP = 40;
const CONTAINER_PADDING_X = 28;
const CONTAINER_PADDING_Y = 24;
const HEADER_HEIGHT = 42;
const COLLAPSED_CONTAINER_WIDTH = 260;
const COLLAPSED_CONTAINER_HEIGHT = 36;
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 64;

export class CoordinateAssigner {
  public static assignCoordinates(
    graph: LogicalGraph,
    orderedLayers: Map<number, ID[]>,
    measurements: Map<ID, { width: number; height: number }>,
    options: LayoutOptions = { direction: 'LR' }
  ): LayoutResult {
    const isTB = options.direction === 'TB';
    const nodesLayout: Record<ID, NodeLayoutResult> = {};
    const containersLayout: Record<ID, NodeLayoutResult> = {};

    // 1. Group entities by container hierarchy & sort siblings together
    const clusteredLayers = new Map<number, ID[]>();
    for (const [layerIdx, layerEntities] of orderedLayers.entries()) {
      const sorted = [...layerEntities].sort((a, b) => {
        const parentA = graph.nodes[a]?.parentId ?? graph.containers[a]?.parentId ?? '';
        const parentB = graph.nodes[b]?.parentId ?? graph.containers[b]?.parentId ?? '';
        return parentA.localeCompare(parentB);
      });
      clusteredLayers.set(layerIdx, sorted);
    }

    const sortedLayerIndices = Array.from(clusteredLayers.keys()).sort((a, b) => a - b);

    // 2. Compute primary axis offsets per layer
    // For LR: Primary = X (columns), Secondary = Y (rows)
    // For TB: Primary = Y (rows), Secondary = X (columns)
    const layerBreadths = new Map<number, number>();
    for (const layerIdx of sortedLayerIndices) {
      const entityIds = clusteredLayers.get(layerIdx) || [];
      let maxBreadth = isTB ? DEFAULT_NODE_HEIGHT : 180;
      for (const id of entityIds) {
        const isCollapsed = graph.containers[id]?.collapsed;
        let b = isTB
          ? (measurements.get(id)?.height || DEFAULT_NODE_HEIGHT)
          : (measurements.get(id)?.width || DEFAULT_NODE_WIDTH);
        if (isCollapsed) b = isTB ? COLLAPSED_CONTAINER_HEIGHT : COLLAPSED_CONTAINER_WIDTH;
        maxBreadth = Math.max(maxBreadth, b);
      }
      layerBreadths.set(layerIdx, maxBreadth);
    }

    const layerPrimaryOffsets = new Map<number, number>();
    let currentPrimary = 80;
    for (const layerIdx of sortedLayerIndices) {
      layerPrimaryOffsets.set(layerIdx, currentPrimary);
      currentPrimary += (layerBreadths.get(layerIdx) || (isTB ? DEFAULT_NODE_HEIGHT : DEFAULT_NODE_WIDTH)) + (isTB ? ROW_GAP * 2 : COLUMN_GAP);
    }

    // 3. Place entities with container-aware padding
    for (const layerIdx of sortedLayerIndices) {
      const entityIds = clusteredLayers.get(layerIdx) || [];
      const primary = layerPrimaryOffsets.get(layerIdx) || 80;
      let secondary = 80;
      let lastParentId: ID | null | undefined = undefined;

      for (const id of entityIds) {
        const isContainer = Boolean(graph.containers[id]);
        const isCollapsed = Boolean(graph.containers[id]?.collapsed);
        const parentId = graph.nodes[id]?.parentId ?? graph.containers[id]?.parentId ?? null;

        // Extra cushion between different container groups
        if (lastParentId !== undefined && lastParentId !== parentId) {
          secondary += isTB ? COLUMN_GAP : ROW_GAP * 1.5;
        }
        lastParentId = parentId;

        let width = measurements.get(id)?.width || DEFAULT_NODE_WIDTH;
        let height = measurements.get(id)?.height || DEFAULT_NODE_HEIGHT;

        if (isContainer && isCollapsed) {
          width = COLLAPSED_CONTAINER_WIDTH;
          height = COLLAPSED_CONTAINER_HEIGHT;
        }

        const x = isTB ? secondary : primary;
        const y = isTB ? primary : secondary;
        const layoutItem: NodeLayoutResult = { id, x, y, width, height };

        if (isContainer) {
          containersLayout[id] = layoutItem;
        } else {
          nodesLayout[id] = layoutItem;
        }

        secondary += (isTB ? width + COLUMN_GAP : height + ROW_GAP);
      }
    }

    // 4. Container Bubble-Up: Calculate initial bounding boxes strictly enclosing children
    const containerDepths = CoordinateAssigner.getContainerDepths(graph);
    const containersByDepthDesc = Object.keys(graph.containers).sort(
      (a, b) => (containerDepths.get(b) || 0) - (containerDepths.get(a) || 0)
    );

    for (const containerId of containersByDepthDesc) {
      const container = graph.containers[containerId];
      if (container.collapsed) {
        if (!containersLayout[containerId]) {
          containersLayout[containerId] = {
            id: containerId,
            x: 80,
            y: 80,
            width: COLLAPSED_CONTAINER_WIDTH,
            height: COLLAPSED_CONTAINER_HEIGHT
          };
        }
        continue;
      }

      const childNodes = (Object.values(nodesLayout) as NodeLayoutResult[]).filter(
        (n) => graph.nodes[n.id]?.parentId === containerId
      );
      const childContainers = (Object.values(containersLayout) as NodeLayoutResult[]).filter(
        (c) => graph.containers[c.id]?.parentId === containerId && c.id !== containerId
      );

      const allChildren = [...childNodes, ...childContainers];

      if (allChildren.length > 0) {
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (const child of allChildren) {
          minX = Math.min(minX, child.x);
          minY = Math.min(minY, child.y);
          maxX = Math.max(maxX, child.x + child.width);
          maxY = Math.max(maxY, child.y + child.height);
        }

        const boxX = minX - CONTAINER_PADDING_X;
        const boxY = minY - CONTAINER_PADDING_Y - HEADER_HEIGHT;
        const boxWidth = maxX - minX + CONTAINER_PADDING_X * 2;
        const boxHeight = maxY - minY + CONTAINER_PADDING_Y * 2 + HEADER_HEIGHT;

        containersLayout[containerId] = {
          id: containerId,
          x: boxX,
          y: boxY,
          width: Math.max(boxWidth, measurements.get(containerId)?.width || 240),
          height: Math.max(boxHeight, HEADER_HEIGHT + CONTAINER_PADDING_Y * 2)
        };
      } else if (!containersLayout[containerId]) {
        containersLayout[containerId] = {
          id: containerId,
          x: 80,
          y: 80,
          width: measurements.get(containerId)?.width || 240,
          height: HEADER_HEIGHT + CONTAINER_PADDING_Y * 2
        };
      }
    }

    // 5. Container Overlap Prevention Pass
    CoordinateAssigner.resolveContainerCollisions(graph, nodesLayout, containersLayout, isTB);

    // 6. Dynamic Port Side Assignment based on Connection Angle
    CoordinateAssigner.assignDynamicPortSides(graph, nodesLayout, containersLayout, isTB);

    return { nodes: nodesLayout, containers: containersLayout };
  }

  /**
   * Detects bounding box collisions between sibling containers and pushes overlapping containers
   * along with all their descendant nodes/containers down (in LR) or right (in TB).
   */
  private static resolveContainerCollisions(
    graph: LogicalGraph,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>,
    isTB: boolean
  ) {
    const rootContainers = Object.values(containersLayout).filter(
      (c) => !graph.containers[c.id]?.parentId
    );

    // Sort by secondary axis
    rootContainers.sort((a, b) => (isTB ? a.x - b.x : a.y - b.y));

    for (let i = 0; i < rootContainers.length; i++) {
      for (let j = i + 1; j < rootContainers.length; j++) {
        const c1 = rootContainers[i];
        const c2 = rootContainers[j];

        // Check AABB overlap with padding
        const overlapX = Math.min(c1.x + c1.width + COLUMN_GAP, c2.x + c2.width + COLUMN_GAP) - Math.max(c1.x, c2.x);
        const overlapY = Math.min(c1.y + c1.height + ROW_GAP, c2.y + c2.height + ROW_GAP) - Math.max(c1.y, c2.y);

        if (overlapX > 0 && overlapY > 0) {
          if (isTB) {
            const shiftX = (c1.x + c1.width + COLUMN_GAP) - c2.x;
            if (shiftX > 0) {
              CoordinateAssigner.shiftContainerTree(c2.id, shiftX, 0, graph, nodesLayout, containersLayout);
            }
          } else {
            const shiftY = (c1.y + c1.height + ROW_GAP) - c2.y;
            if (shiftY > 0) {
              CoordinateAssigner.shiftContainerTree(c2.id, 0, shiftY, graph, nodesLayout, containersLayout);
            }
          }
        }
      }
    }
  }

  private static shiftContainerTree(
    containerId: ID,
    deltaX: number,
    deltaY: number,
    graph: LogicalGraph,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>
  ) {
    if (containersLayout[containerId]) {
      containersLayout[containerId].x += deltaX;
      containersLayout[containerId].y += deltaY;
    }

    for (const [nId, nLayout] of Object.entries(nodesLayout)) {
      if (graph.nodes[nId]?.parentId === containerId) {
        nLayout.x += deltaX;
        nLayout.y += deltaY;
      }
    }

    for (const [cId] of Object.entries(containersLayout)) {
      if (graph.containers[cId]?.parentId === containerId && cId !== containerId) {
        CoordinateAssigner.shiftContainerTree(cId, deltaX, deltaY, graph, nodesLayout, containersLayout);
      }
    }
  }

  /**
   * Evaluates layout coordinates to dynamically assign optimal perimeter sides
   * for any ports set to 'auto' based on the direction of their connected edges.
   */
  private static assignDynamicPortSides(
    graph: LogicalGraph,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>,
    isTB: boolean
  ) {
    const getPos = (id: ID) => nodesLayout[id] || containersLayout[id];

    for (const edge of Object.values(graph.edges)) {
      const srcPos = getPos(edge.sourceId);
      const tgtPos = getPos(edge.targetId);
      if (!srcPos || !tgtPos) continue;

      const srcEntity = graph.nodes[edge.sourceId] || graph.containers[edge.sourceId];
      const tgtEntity = graph.nodes[edge.targetId] || graph.containers[edge.targetId];

      const dx = (tgtPos.x + tgtPos.width / 2) - (srcPos.x + srcPos.width / 2);
      const dy = (tgtPos.y + tgtPos.height / 2) - (srcPos.y + srcPos.height / 2);

      // Auto side for source port
      const srcPort = srcEntity?.ports?.find((p) => p.id === edge.sourcePortId);
      if (srcPort && (!srcPort.side || srcPort.side === 'auto')) {
        if (isTB) {
          srcPort.side = dy >= 0 ? 'bottom' : 'top';
        } else {
          srcPort.side = dx >= 0 ? 'right' : 'left';
        }
      }

      // Auto side for target port
      const tgtPort = tgtEntity?.ports?.find((p) => p.id === edge.targetPortId);
      if (tgtPort && (!tgtPort.side || tgtPort.side === 'auto')) {
        if (isTB) {
          tgtPort.side = dy >= 0 ? 'top' : 'bottom';
        } else {
          tgtPort.side = dx >= 0 ? 'left' : 'right';
        }
      }
    }
  }

  private static getContainerDepths(graph: LogicalGraph): Map<ID, number> {
    const depths = new Map<ID, number>();
    const getDepth = (id: ID): number => {
      if (depths.has(id)) return depths.get(id)!;
      const parentId = graph.containers[id]?.parentId;
      if (!parentId || !graph.containers[parentId]) {
        depths.set(id, 0);
        return 0;
      }
      const d = 1 + getDepth(parentId);
      depths.set(id, d);
      return d;
    };
    for (const cId of Object.keys(graph.containers)) {
      getDepth(cId);
    }
    return depths;
  }
}
