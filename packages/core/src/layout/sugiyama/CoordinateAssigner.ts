import { ID, LogicalGraph, NodeEntity, ContainerEntity } from '../../models';
import { LayoutResult, NodeLayoutResult } from '../LayoutEngine';

const COLUMN_GAP = 100;
const ROW_GAP = 40;
const CONTAINER_PADDING_X = 24;
const CONTAINER_PADDING_Y = 20;
const HEADER_HEIGHT = 40;
const COLLAPSED_CONTAINER_WIDTH = 260;
const COLLAPSED_CONTAINER_HEIGHT = 36;
const DEFAULT_NODE_WIDTH = 200;
const DEFAULT_NODE_HEIGHT = 64;

export class CoordinateAssigner {
  public static assignCoordinates(
    graph: LogicalGraph,
    orderedLayers: Map<number, ID[]>,
    measurements: Map<ID, { width: number; height: number }>
  ): LayoutResult {
    const nodesLayout: Record<ID, NodeLayoutResult> = {};
    const containersLayout: Record<ID, NodeLayoutResult> = {};

    // 1. Group entities by container hierarchy
    const childrenByParent = new Map<ID | null, ID[]>();
    childrenByParent.set(null, []);
    for (const cId of Object.keys(graph.containers)) {
      childrenByParent.set(cId, []);
    }

    // Determine effective parent for each active node
    for (const [, layerEntities] of orderedLayers.entries()) {
      for (const id of layerEntities) {
        const parentId = graph.nodes[id]?.parentId ?? graph.containers[id]?.parentId ?? null;
        const validParent = parentId && graph.containers[parentId] && !graph.containers[parentId].collapsed ? parentId : null;
        if (!childrenByParent.has(validParent)) {
          childrenByParent.set(validParent, []);
        }
        childrenByParent.get(validParent)!.push(id);
      }
    }

    // 2. Sort layer nodes so siblings sharing the same parent are adjacent
    const clusteredLayers = new Map<number, ID[]>();
    for (const [layerIdx, layerEntities] of orderedLayers.entries()) {
      const sorted = [...layerEntities].sort((a, b) => {
        const parentA = graph.nodes[a]?.parentId ?? graph.containers[a]?.parentId ?? '';
        const parentB = graph.nodes[b]?.parentId ?? graph.containers[b]?.parentId ?? '';
        return parentA.localeCompare(parentB);
      });
      clusteredLayers.set(layerIdx, sorted);
    }

    // 3. Compute layer column widths
    const sortedLayerIndices = Array.from(clusteredLayers.keys()).sort((a, b) => a - b);
    const layerWidths = new Map<number, number>();

    for (const layerIdx of sortedLayerIndices) {
      const entityIds = clusteredLayers.get(layerIdx) || [];
      let maxWidth = 180;
      for (const id of entityIds) {
        const isCollapsed = graph.containers[id]?.collapsed;
        let w = measurements.get(id)?.width || DEFAULT_NODE_WIDTH;
        if (isCollapsed) w = COLLAPSED_CONTAINER_WIDTH;
        maxWidth = Math.max(maxWidth, w);
      }
      layerWidths.set(layerIdx, maxWidth);
    }

    // 4. Calculate X positions per layer
    const layerXOffsets = new Map<number, number>();
    let currentX = 80;
    for (const layerIdx of sortedLayerIndices) {
      layerXOffsets.set(layerIdx, currentX);
      currentX += (layerWidths.get(layerIdx) || DEFAULT_NODE_WIDTH) + COLUMN_GAP;
    }

    // 5. Initial Y placement with vertical spacing
    const layerCurrentY = new Map<number, number>();
    for (const layerIdx of sortedLayerIndices) {
      layerCurrentY.set(layerIdx, 80);
    }

    for (const layerIdx of sortedLayerIndices) {
      const entityIds = clusteredLayers.get(layerIdx) || [];
      const x = layerXOffsets.get(layerIdx) || 80;

      for (const id of entityIds) {
        const isContainer = Boolean(graph.containers[id]);
        const isCollapsed = Boolean(graph.containers[id]?.collapsed);

        let width = measurements.get(id)?.width || DEFAULT_NODE_WIDTH;
        let height = measurements.get(id)?.height || DEFAULT_NODE_HEIGHT;

        if (isContainer && isCollapsed) {
          width = COLLAPSED_CONTAINER_WIDTH;
          height = COLLAPSED_CONTAINER_HEIGHT;
        }

        const y = layerCurrentY.get(layerIdx) || 80;
        const layoutItem: NodeLayoutResult = { id, x, y, width, height };

        if (isContainer) {
          containersLayout[id] = layoutItem;
        } else {
          nodesLayout[id] = layoutItem;
        }

        layerCurrentY.set(layerIdx, y + height + ROW_GAP);
      }
    }

    // 6. Container Bubble-Up: Calculate container bounds strictly from children
    const containerDepths = CoordinateAssigner.getContainerDepths(graph);
    const containersByDepthDesc = Object.keys(graph.containers).sort((a, b) => {
      return (containerDepths.get(b) || 0) - (containerDepths.get(a) || 0);
    });

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
      } else {
        if (!containersLayout[containerId]) {
          const defaultX = layerXOffsets.get(0) || 80;
          const defaultY = (layerCurrentY.get(0) || 80);
          containersLayout[containerId] = {
            id: containerId,
            x: defaultX,
            y: defaultY,
            width: measurements.get(containerId)?.width || 240,
            height: HEADER_HEIGHT + CONTAINER_PADDING_Y * 2
          };
          layerCurrentY.set(0, defaultY + HEADER_HEIGHT + CONTAINER_PADDING_Y * 2 + ROW_GAP);
        }
      }
    }

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
