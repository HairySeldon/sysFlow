// packages/core/src/layout/sugiyama/CoordinateAssigner.ts

import { ID, LogicalGraph } from '../../models';
import { LayoutResult, NodeLayoutResult, LayoutOptions } from '../LayoutEngine';

const COLUMN_GAP = 36;
const ROW_GAP = 28;
const CONTAINER_PADDING_X = 24;
const CONTAINER_PADDING_Y = 20;
const HEADER_HEIGHT = 40;
const COLLAPSED_CONTAINER_WIDTH = 220;
const COLLAPSED_CONTAINER_HEIGHT = 36;
const DEFAULT_NODE_WIDTH = 190;
const DEFAULT_NODE_HEIGHT = 58;

interface LocalBox {
  id: ID;
  localX: number;
  localY: number;
  width: number;
  height: number;
}

export class CoordinateAssigner {
  public static assignCoordinates(
    graph: LogicalGraph,
    orderedLayers: Map<number, ID[]>,
    measurements: Map<ID, { width: number; height: number }>,
    options: LayoutOptions = { direction: 'TB', mode: 'auto', aspectRatio: 1.55 }
  ): LayoutResult {
    const isTB = options.direction === 'TB';
    const targetAspect = options.aspectRatio ?? 1.55;

    const numContainers = Object.keys(graph.containers).length;
    const mode =
      options.mode && options.mode !== 'auto'
        ? options.mode
        : numContainers > 0
        ? 'concurrent'
        : 'flow';

    const nodesLayout: Record<ID, NodeLayoutResult> = {};
    const containersLayout: Record<ID, NodeLayoutResult> = {};

    const getBaseDim = (id: ID) => {
      const isContainer = Boolean(graph.containers[id]);
      const isCollapsed = Boolean(graph.containers[id]?.collapsed);
      if (isContainer && isCollapsed) {
        return { width: COLLAPSED_CONTAINER_WIDTH, height: COLLAPSED_CONTAINER_HEIGHT };
      }
      return {
        width: measurements.get(id)?.width || DEFAULT_NODE_WIDTH,
        height: measurements.get(id)?.height || DEFAULT_NODE_HEIGHT
      };
    };

    if (mode === 'concurrent') {
      CoordinateAssigner.layoutConcurrentHierarchy(
        graph,
        getBaseDim,
        targetAspect,
        nodesLayout,
        containersLayout
      );
    } else {
      CoordinateAssigner.layoutFlowTree(
        graph,
        orderedLayers,
        getBaseDim,
        isTB,
        nodesLayout,
        containersLayout
      );
    }

    // Dynamic port orientations
    CoordinateAssigner.assignDynamicPortSides(graph, nodesLayout, containersLayout, isTB);

    return { nodes: nodesLayout, containers: containersLayout };
  }

  // ===========================================================================
  // AREA-BALANCED WRAP PACKING FOR CONCURRENT ARCHITECTURES
  // ===========================================================================
  private static layoutConcurrentHierarchy(
    graph: LogicalGraph,
    getBaseDim: (id: ID) => { width: number; height: number },
    targetAspect: number,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>
  ) {
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

    const depths = CoordinateAssigner.getContainerDepths(graph);
    const sortedContainers = Object.keys(graph.containers).sort(
      (a, b) => (depths.get(b) || 0) - (depths.get(a) || 0)
    );

    const containerInnerDimensions = new Map<ID, { width: number; height: number }>();
    const localPositions = new Map<ID, LocalBox>();

    // Bottom-Up: Pack every container's children using Area-Balanced Shelf Packing
    for (const containerId of sortedContainers) {
      const isCollapsed = Boolean(graph.containers[containerId]?.collapsed);
      if (isCollapsed) {
        containerInnerDimensions.set(containerId, {
          width: COLLAPSED_CONTAINER_WIDTH,
          height: COLLAPSED_CONTAINER_HEIGHT
        });
        continue;
      }

      const children = childrenMap.get(containerId) || [];
      if (children.length === 0) {
        containerInnerDimensions.set(containerId, {
          width: getBaseDim(containerId).width,
          height: HEADER_HEIGHT + CONTAINER_PADDING_Y * 2
        });
        continue;
      }

      const { packedWidth, packedHeight } = CoordinateAssigner.packChildrenAspectBalanced(
        children,
        containerInnerDimensions,
        getBaseDim,
        targetAspect,
        localPositions
      );

      const totalW = Math.max(
        packedWidth + CONTAINER_PADDING_X * 2,
        getBaseDim(containerId).width
      );
      const totalH = Math.max(
        packedHeight + HEADER_HEIGHT + CONTAINER_PADDING_Y * 2,
        HEADER_HEIGHT + CONTAINER_PADDING_Y * 2
      );

      containerInnerDimensions.set(containerId, { width: totalW, height: totalH });
    }

    // Pack Root Level Elements
    const rootItems = childrenMap.get(null) || [];
    const rootBoxes: LocalBox[] = [];

    if (rootItems.length > 0) {
      const rootItemDims = rootItems.map((rId) => {
        const isContainer = Boolean(graph.containers[rId]);
        const dims = isContainer
          ? containerInnerDimensions.get(rId) || getBaseDim(rId)
          : getBaseDim(rId);
        return { id: rId, width: dims.width, height: dims.height };
      });

      // Target root canvas width based on total area
      let totalArea = 0;
      let maxItemW = 0;
      for (const d of rootItemDims) {
        totalArea += (d.width + COLUMN_GAP * 1.5) * (d.height + ROW_GAP * 1.5);
        maxItemW = Math.max(maxItemW, d.width);
      }
      const targetCanvasW = Math.max(maxItemW, Math.sqrt(totalArea * targetAspect));

      let curX = 60;
      let curY = 60;
      let shelfH = 0;

      for (const item of rootItemDims) {
        if (curX > 60 && curX + item.width > targetCanvasW + 60) {
          curX = 60;
          curY += shelfH + ROW_GAP * 1.5;
          shelfH = 0;
        }

        rootBoxes.push({
          id: item.id,
          localX: curX,
          localY: curY,
          width: item.width,
          height: item.height
        });

        curX += item.width + COLUMN_GAP * 1.5;
        shelfH = Math.max(shelfH, item.height);
      }
    }

    // Top-Down: Compute absolute world coordinates
    const assignWorldCoordinates = (
      itemId: ID,
      worldX: number,
      worldY: number,
      width: number,
      height: number
    ) => {
      const isContainer = Boolean(graph.containers[itemId]);
      const itemLayout: NodeLayoutResult = { id: itemId, x: worldX, y: worldY, width, height };

      if (isContainer) {
        containersLayout[itemId] = itemLayout;
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
        nodesLayout[itemId] = itemLayout;
      }
    };

    for (const rBox of rootBoxes) {
      assignWorldCoordinates(rBox.id, rBox.localX, rBox.localY, rBox.width, rBox.height);
    }
  }

  /**
   * Packs child boxes into an area-balanced bounding rectangle with ratio ~ targetAspect.
   * Eliminates the exponential horizontal expansion and dead vertical space.
   */
  private static packChildrenAspectBalanced(
    children: ID[],
    containerDims: Map<ID, { width: number; height: number }>,
    getBaseDim: (id: ID) => { width: number; height: number },
    targetAspect: number,
    localPositions: Map<ID, LocalBox>
  ): { packedWidth: number; packedHeight: number } {
    const items = children.map((cId) => {
      const dims = containerDims.has(cId) ? containerDims.get(cId)! : getBaseDim(cId);
      return { id: cId, width: dims.width, height: dims.height };
    });

    // 1. Calculate target row width from total area
    let totalArea = 0;
    let maxChildW = 0;
    for (const item of items) {
      totalArea += (item.width + COLUMN_GAP) * (item.height + ROW_GAP);
      maxChildW = Math.max(maxChildW, item.width);
    }

    // Ideal width to keep the container close to target aspect ratio
    const targetRowWidth = Math.max(maxChildW, Math.sqrt(totalArea * targetAspect));

    // 2. Shelf packing
    let curX = 0;
    let curY = 0;
    let shelfHeight = 0;
    let maxOverallW = 0;

    for (const item of items) {
      // Wrap to next shelf if adding this item exceeds target width
      if (curX > 0 && curX + item.width > targetRowWidth) {
        maxOverallW = Math.max(maxOverallW, curX - COLUMN_GAP);
        curX = 0;
        curY += shelfHeight + ROW_GAP;
        shelfHeight = 0;
      }

      localPositions.set(item.id, {
        id: item.id,
        localX: curX,
        localY: curY,
        width: item.width,
        height: item.height
      });

      curX += item.width + COLUMN_GAP;
      shelfHeight = Math.max(shelfHeight, item.height);
    }

    maxOverallW = Math.max(maxOverallW, curX > 0 ? curX - COLUMN_GAP : 0);
    const maxOverallH = curY + shelfHeight;

    return { packedWidth: maxOverallW, packedHeight: maxOverallH };
  }

  // ===========================================================================
  // FLOW TREE SYMMETRICAL CENTERING (DEMO 2)
  // ===========================================================================
  private static layoutFlowTree(
    graph: LogicalGraph,
    orderedLayers: Map<number, ID[]>,
    getBaseDim: (id: ID) => { width: number; height: number },
    isTB: boolean,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>
  ) {
    const sortedLayers = Array.from(orderedLayers.keys()).sort((a, b) => a - b);
    const primaryOffsets = new Map<number, number>();
    let curPrimary = 80;

    const primGap = isTB ? ROW_GAP * 1.5 : COLUMN_GAP * 1.5;
    const secGap = isTB ? COLUMN_GAP : ROW_GAP;

    for (const layerIdx of sortedLayers) {
      const entities = orderedLayers.get(layerIdx) || [];
      let maxPrimaryBreadth = 0;
      for (const id of entities) {
        const dim = getBaseDim(id);
        const pb = isTB ? dim.height : dim.width;
        maxPrimaryBreadth = Math.max(maxPrimaryBreadth, pb);
      }
      primaryOffsets.set(layerIdx, curPrimary);
      curPrimary += maxPrimaryBreadth + primGap;
    }

    const parentsOf = new Map<ID, ID[]>();
    const childrenOf = new Map<ID, ID[]>();
    for (const e of Object.values(graph.edges)) {
      if (!parentsOf.has(e.targetId)) parentsOf.set(e.targetId, []);
      parentsOf.get(e.targetId)!.push(e.sourceId);

      if (!childrenOf.has(e.sourceId)) childrenOf.set(e.sourceId, []);
      childrenOf.get(e.sourceId)!.push(e.targetId);
    }

    const secondaryPos = new Map<ID, number>();

    // Pass 1: Top-down median positioning
    for (const layerIdx of sortedLayers) {
      const entities = orderedLayers.get(layerIdx) || [];
      let prevEnd = -Infinity;

      for (const id of entities) {
        const dim = getBaseDim(id);
        const breadth = isTB ? dim.width : dim.height;
        const parents = parentsOf.get(id) || [];

        let idealCenter: number | null = null;
        if (parents.length > 0) {
          const parentCenters = parents
            .map((p) => {
              const pos = secondaryPos.get(p);
              if (pos === undefined) return null;
              const pDim = getBaseDim(p);
              return pos + (isTB ? pDim.width : pDim.height) / 2;
            })
            .filter((v): v is number => v !== null);

          if (parentCenters.length > 0) {
            idealCenter = parentCenters.reduce((a, b) => a + b, 0) / parentCenters.length;
          }
        }

        let startPos = idealCenter !== null ? idealCenter - breadth / 2 : 80;
        if (startPos < prevEnd + secGap) {
          startPos = prevEnd === -Infinity ? 80 : prevEnd + secGap;
        }

        secondaryPos.set(id, startPos);
        prevEnd = startPos + breadth;
      }
    }

    // Pass 2: Bottom-up median centering
    for (let i = sortedLayers.length - 1; i >= 0; i--) {
      const layerIdx = sortedLayers[i];
      const entities = orderedLayers.get(layerIdx) || [];

      for (const id of entities) {
        const children = childrenOf.get(id) || [];
        if (children.length === 0) continue;

        const childCenters = children
          .map((c) => {
            const pos = secondaryPos.get(c);
            if (pos === undefined) return null;
            const cDim = getBaseDim(c);
            return pos + (isTB ? cDim.width : cDim.height) / 2;
          })
          .filter((v): v is number => v !== null);

        if (childCenters.length > 0) {
          const avgChildCenter = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;
          const dim = getBaseDim(id);
          const breadth = isTB ? dim.width : dim.height;
          secondaryPos.set(id, avgChildCenter - breadth / 2);
        }
      }

      let prevEnd = -Infinity;
      for (const id of entities) {
        const dim = getBaseDim(id);
        const breadth = isTB ? dim.width : dim.height;
        let pos = secondaryPos.get(id) ?? 80;
        if (pos < prevEnd + secGap) {
          pos = prevEnd + secGap;
          secondaryPos.set(id, pos);
        }
        prevEnd = pos + breadth;
      }
    }

    let minSec = Infinity;
    for (const p of secondaryPos.values()) minSec = Math.min(minSec, p);
    const secShift = minSec < 80 ? 80 - minSec : 0;

    for (const layerIdx of sortedLayers) {
      const entities = orderedLayers.get(layerIdx) || [];
      const primary = primaryOffsets.get(layerIdx) || 80;

      for (const id of entities) {
        const dim = getBaseDim(id);
        const secondary = (secondaryPos.get(id) ?? 80) + secShift;
        const x = isTB ? secondary : primary;
        const y = isTB ? primary : secondary;

        const item: NodeLayoutResult = { id, x, y, width: dim.width, height: dim.height };
        if (graph.containers[id]) {
          containersLayout[id] = item;
        } else {
          nodesLayout[id] = item;
        }
      }
    }
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================
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

      const dx = tgtPos.x + tgtPos.width / 2 - (srcPos.x + srcPos.width / 2);
      const dy = tgtPos.y + tgtPos.height / 2 - (srcPos.y + srcPos.height / 2);

      const srcPort = srcEntity?.ports?.find((p) => p.id === edge.sourcePortId);
      if (srcPort && (!srcPort.side || srcPort.side === 'auto')) {
        srcPort.side = isTB ? (dy >= 0 ? 'bottom' : 'top') : dx >= 0 ? 'right' : 'left';
      }

      const tgtPort = tgtEntity?.ports?.find((p) => p.id === edge.targetPortId);
      if (tgtPort && (!tgtPort.side || tgtPort.side === 'auto')) {
        tgtPort.side = isTB ? (dy >= 0 ? 'top' : 'bottom') : dx >= 0 ? 'left' : 'right';
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
