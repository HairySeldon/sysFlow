// packages/core/src/layout/CompoundLayoutManager.ts

import { ID, LogicalGraph } from '../models';
import { LayoutResult, NodeLayoutResult } from './LayoutEngine';
import { ChildArranger, LocalBox } from './CompoundArranger';
import { CoordinateAssigner } from './sugiyama/CoordinateAssigner';

const CONTAINER_PADDING_X = 22;
const CONTAINER_PADDING_Y = 18;
const HEADER_HEIGHT = 38;
const COLLAPSED_CONTAINER_WIDTH = 210;
const COLLAPSED_CONTAINER_HEIGHT = 36;
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 54;
const EMPTY_CONTAINER_WIDTH = 260;
const EMPTY_CONTAINER_HEIGHT = 160;

export class CompoundLayoutManager {
  public static execute(
    graph: LogicalGraph,
    arranger: ChildArranger,
    measurements: Map<ID, { width: number; height: number }>
  ): LayoutResult {
    const nodesLayout: Record<ID, NodeLayoutResult> = {};
    const containersLayout: Record<ID, NodeLayoutResult> = {};

    const getBaseDim = (id: ID) => {
      const isContainer = Boolean(graph.containers[id]);
      const isCollapsed = Boolean(graph.containers[id]?.collapsed);
      if (isContainer && isCollapsed) {
        return { width: COLLAPSED_CONTAINER_WIDTH, height: COLLAPSED_CONTAINER_HEIGHT };
      }
      if (isContainer && !isCollapsed) {
        return {
          width: measurements.get(id)?.width || EMPTY_CONTAINER_WIDTH,
          height: measurements.get(id)?.height || EMPTY_CONTAINER_HEIGHT
        };
      }
      return {
        width: measurements.get(id)?.width || DEFAULT_NODE_WIDTH,
        height: measurements.get(id)?.height || DEFAULT_NODE_HEIGHT
      };
    };

    // 1. Build strict parent -> children hierarchy map
    const childrenMap = new Map<ID | null, ID[]>();
    for (const [id, node] of Object.entries(graph.nodes)) {
      const p = node.parentId ?? null;
      if (!childrenMap.has(p)) childrenMap.set(p, []);
      childrenMap.get(p)!.push(id);
    }
    for (const [id, cont] of Object.entries(graph.containers)) {
      const p = cont.parentId ?? null;
      if (!childrenMap.has(p)) childrenMap.set(p, []);
      childrenMap.get(p)!.push(id);
    }

    // 2. Sort containers bottom-up (deepest first)
    const depths = CompoundLayoutManager.getContainerDepths(graph);
    const sortedContainers = Object.keys(graph.containers).sort(
      (a, b) => (depths.get(b) || 0) - (depths.get(a) || 0)
    );

    const containerCalculatedDims = new Map<ID, { width: number; height: number }>();
    const localPositions = new Map<ID, LocalBox>();

    const getItemDim = (id: ID): { width: number; height: number } => {
      if (containerCalculatedDims.has(id)) {
        return containerCalculatedDims.get(id)!;
      }
      return getBaseDim(id);
    };

    // 3. BOTTOM-UP: Compute local sizes for each container
    for (const containerId of sortedContainers) {
      const isCollapsed = Boolean(graph.containers[containerId]?.collapsed);
      if (isCollapsed) {
        containerCalculatedDims.set(containerId, {
          width: COLLAPSED_CONTAINER_WIDTH,
          height: COLLAPSED_CONTAINER_HEIGHT
        });
        continue;
      }

      const directChildren = childrenMap.get(containerId) || [];
      if (directChildren.length === 0) {
        containerCalculatedDims.set(containerId, {
          width: EMPTY_CONTAINER_WIDTH,
          height: EMPTY_CONTAINER_HEIGHT
        });
        continue;
      }

      const arrangement = arranger.arrange(containerId, directChildren, graph, getItemDim);

      for (const box of arrangement.boxes) {
        localPositions.set(box.id, box);
      }

      const totalW = Math.max(arrangement.width + CONTAINER_PADDING_X * 2, COLLAPSED_CONTAINER_WIDTH);
      const totalH = arrangement.height + HEADER_HEIGHT + CONTAINER_PADDING_Y * 2;
      containerCalculatedDims.set(containerId, { width: totalW, height: totalH });
    }

    // 4. ROOT LEVEL: Arrange root-level nodes and containers
    const rootItems = childrenMap.get(null) || [];
    let rootBoxes: LocalBox[] = [];

    if (rootItems.length > 0) {
      const rootArrangement = arranger.arrange(null, rootItems, graph, getItemDim);
      rootBoxes = rootArrangement.boxes.map((b) => ({
        ...b,
        localX: b.localX + 60,
        localY: b.localY + 60
      }));
    }

    // 5. TOP-DOWN: Recursively compute world coordinates
    const assignWorldCoordinates = (
      itemId: ID,
      worldX: number,
      worldY: number,
      width: number,
      height: number
    ) => {
      const isContainer = Boolean(graph.containers[itemId]);
      const layoutItem: NodeLayoutResult = { id: itemId, x: worldX, y: worldY, width, height };

      if (isContainer) {
        containersLayout[itemId] = layoutItem;

        // If collapsed, halt recursion. Descendants are omitted from layout!
        if (graph.containers[itemId]?.collapsed) return;

        const innerOriginX = worldX + CONTAINER_PADDING_X;
        const innerOriginY = worldY + HEADER_HEIGHT + CONTAINER_PADDING_Y;

        const children = childrenMap.get(itemId) || [];
        for (const childId of children) {
          const lBox = localPositions.get(childId);
          if (!lBox) continue;
          assignWorldCoordinates(
            childId,
            innerOriginX + lBox.localX,
            innerOriginY + lBox.localY,
            lBox.width,
            lBox.height
          );
        }
      } else {
        nodesLayout[itemId] = layoutItem;
      }
    };

    for (const rBox of rootBoxes) {
      assignWorldCoordinates(rBox.id, rBox.localX, rBox.localY, rBox.width, rBox.height);
    }

    CoordinateAssigner.assignDynamicPortSides(graph, nodesLayout, containersLayout);

    return { nodes: nodesLayout, containers: containersLayout };
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
