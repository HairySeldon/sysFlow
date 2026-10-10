// packages/core/src/layout/sugiyama/CoordinateAssigner.ts

import { ID, LogicalGraph } from '../../models';
import { LayoutResult, NodeLayoutResult, LayoutOptions } from '../LayoutEngine';

const COLUMN_GAP = 32;
const ROW_GAP = 24;
const CONTAINER_PADDING_X = 22;
const CONTAINER_PADDING_Y = 18;
const HEADER_HEIGHT = 38;
const COLLAPSED_CONTAINER_WIDTH = 210;
const COLLAPSED_CONTAINER_HEIGHT = 36;
const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 54;
const EMPTY_CONTAINER_WIDTH = 260;
const EMPTY_CONTAINER_HEIGHT = 160;

interface LocalBox {
  id: ID;
  localX: number;
  localY: number;
  width: number;
  height: number;
}

interface ItemDim {
  id: ID;
  width: number;
  height: number;
}

interface PackingCandidate {
  width: number;
  height: number;
  boxes: LocalBox[];
  score: number;
}

interface SkylineSegment {
  x: number;
  width: number;
  y: number;
}

export class CoordinateAssigner {
  public static assignCoordinates(
    graph: LogicalGraph,
    orderedLayers: Map<number, ID[]>,
    measurements: Map<ID, { width: number; height: number }>,
    options: LayoutOptions = { direction: 'TB', mode: 'auto', aspectRatio: 1.55 }
  ): LayoutResult {
    const direction = options.direction ?? 'TB';
    const isVertical = direction === 'TB' || direction === 'BT';
    const isReverse = direction === 'BT' || direction === 'RL';
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
        isVertical,
        isReverse,
        options,
        nodesLayout,
        containersLayout
      );
    }

    CoordinateAssigner.assignDynamicPortSides(graph, nodesLayout, containersLayout);

    return { nodes: nodesLayout, containers: containersLayout };
  }

  // ===========================================================================
  // CONCURRENT COMPOUND PACKING WITH SKYLINE 2D BIN PACKING
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

    // 1. Bottom-up: Find optimal packing for every container
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
          width: COLLAPSED_CONTAINER_WIDTH,
          height: HEADER_HEIGHT + CONTAINER_PADDING_Y * 2
        });
        continue;
      }

      const items: ItemDim[] = children.map((cId) => {
        const dims = containerInnerDimensions.has(cId)
          ? containerInnerDimensions.get(cId)!
          : getBaseDim(cId);
        return { id: cId, width: dims.width, height: dims.height };
      });

      const best = CoordinateAssigner.findBestTightPacking(items, targetAspect);

      for (const box of best.boxes) {
        localPositions.set(box.id, box);
      }

      const totalW = Math.max(best.width + CONTAINER_PADDING_X * 2, COLLAPSED_CONTAINER_WIDTH);
      const totalH = best.height + HEADER_HEIGHT + CONTAINER_PADDING_Y * 2;

      containerInnerDimensions.set(containerId, { width: totalW, height: totalH });
    }

    // 2. Root-level packing
    const rootItems = childrenMap.get(null) || [];
    let rootBoxes: LocalBox[] = [];

    if (rootItems.length > 0) {
      const rootItemDims: ItemDim[] = rootItems.map((rId) => {
        const dims = containerInnerDimensions.get(rId) || getBaseDim(rId);
        return { id: rId, width: dims.width, height: dims.height };
      });

      const bestRoot = CoordinateAssigner.findBestTightPacking(rootItemDims, targetAspect);
      rootBoxes = bestRoot.boxes.map((b) => ({
        ...b,
        localX: b.localX + 60,
        localY: b.localY + 60
      }));
    }

    // 3. Top-down: World coordinates
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

  private static findBestTightPacking(items: ItemDim[], targetAspect: number): PackingCandidate {
    if (items.length === 1) {
      return {
        width: items[0].width,
        height: items[0].height,
        boxes: [{ id: items[0].id, localX: 0, localY: 0, width: items[0].width, height: items[0].height }],
        score: 0
      };
    }

    const totalItemArea = items.reduce((acc, it) => acc + it.width * it.height, 0);
    const maxSingleW = Math.max(...items.map((it) => it.width));
    const sortedByWidth = [...items].sort((a, b) => b.width - a.width);

    const candidateWidths = new Set<number>();
    const singleRowW = items.reduce((acc, it) => acc + it.width, 0) + (items.length - 1) * COLUMN_GAP;
    candidateWidths.add(singleRowW);
    candidateWidths.add(maxSingleW);

    const idealAspectW = Math.max(maxSingleW, Math.sqrt(totalItemArea * targetAspect));
    candidateWidths.add(idealAspectW);
    candidateWidths.add(idealAspectW * 0.85);
    candidateWidths.add(idealAspectW * 1.15);

    const maxCols = Math.min(items.length, 6);
    for (let c = 2; c <= maxCols; c++) {
      let colWidthEstimate = 0;
      for (let i = 0; i < c && i < sortedByWidth.length; i++) {
        colWidthEstimate += sortedByWidth[i].width;
      }
      colWidthEstimate += (c - 1) * COLUMN_GAP;
      if (colWidthEstimate >= maxSingleW) {
        candidateWidths.add(colWidthEstimate);
      }
    }

    let bestCandidate: PackingCandidate | null = null;

    for (const maxRowWidth of candidateWidths) {
      const candidate = CoordinateAssigner.simulateSkylinePacking(items, maxRowWidth);

      const boundingArea = candidate.width * candidate.height;
      const wastedArea = Math.max(0, boundingArea - totalItemArea);
      const aspect = candidate.width / Math.max(1, candidate.height);
      const aspectDeviation = Math.abs(Math.log(aspect / targetAspect));

      const score = (wastedArea / totalItemArea) * 2.0 + aspectDeviation * 0.25;
      candidate.score = score;

      if (!bestCandidate || score < bestCandidate.score) {
        bestCandidate = candidate;
      }
    }

    return bestCandidate!;
  }

  private static simulateSkylinePacking(items: ItemDim[], maxRowWidth: number): PackingCandidate {
    const sorted = [...items].sort((a, b) => b.height - a.height);
    const skyline: SkylineSegment[] = [{ x: 0, width: maxRowWidth, y: 0 }];
    const boxes: LocalBox[] = [];

    for (const item of sorted) {
      let bestY = Infinity;
      let bestIdx = -1;

      for (let i = 0; i < skyline.length; i++) {
        const seg = skyline[i];
        if (seg.x + item.width > maxRowWidth) continue;

        let maxH = 0;
        let wCovered = 0;
        for (let j = i; j < skyline.length && wCovered < item.width; j++) {
          maxH = Math.max(maxH, skyline[j].y);
          wCovered += skyline[j].width;
        }

        if (maxH < bestY) {
          bestY = maxH;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) {
        const maxY = Math.max(...skyline.map((s) => s.y));
        const posY = maxY === 0 ? 0 : maxY + ROW_GAP;
        boxes.push({
          id: item.id,
          localX: 0,
          localY: posY,
          width: item.width,
          height: item.height
        });

        skyline.length = 0;
        skyline.push({ x: 0, width: item.width + COLUMN_GAP, y: posY + item.height });
        if (maxRowWidth > item.width + COLUMN_GAP) {
          skyline.push({
            x: item.width + COLUMN_GAP,
            width: maxRowWidth - (item.width + COLUMN_GAP),
            y: 0
          });
        }
        continue;
      }

      const startX = skyline[bestIdx].x;
      const startY = bestY === 0 ? 0 : bestY + ROW_GAP;

      boxes.push({
        id: item.id,
        localX: startX,
        localY: startY,
        width: item.width,
        height: item.height
      });

      const itemSpanW = item.width + COLUMN_GAP;
      const newY = startY + item.height;
      const newSeg: SkylineSegment = { x: startX, width: itemSpanW, y: newY };

      const updatedSkyline: SkylineSegment[] = [];
      for (const seg of skyline) {
        if (seg.x + seg.width <= startX || seg.x >= startX + itemSpanW) {
          updatedSkyline.push(seg);
        } else {
          if (seg.x < startX) {
            updatedSkyline.push({ x: seg.x, width: startX - seg.x, y: seg.y });
          }
          if (seg.x + seg.width > startX + itemSpanW) {
            updatedSkyline.push({
              x: startX + itemSpanW,
              width: seg.x + seg.width - (startX + itemSpanW),
              y: seg.y
            });
          }
        }
      }
      updatedSkyline.push(newSeg);
      updatedSkyline.sort((a, b) => a.x - b.x);
      skyline.length = 0;
      skyline.push(...updatedSkyline);
    }

    const overallW = Math.max(...boxes.map((b) => b.localX + b.width), 0);
    const overallH = Math.max(...boxes.map((b) => b.localY + b.height), 0);

    return { width: overallW, height: overallH, boxes, score: 0 };
  }

  // ===========================================================================
  // FLOW TREE WITH COMPOUND CONTAINER SUPPORT
  // ===========================================================================
  private static layoutFlowTree(
    graph: LogicalGraph,
    orderedLayers: Map<number, ID[]>,
    getBaseDim: (id: ID) => { width: number; height: number },
    isVertical: boolean,
    isReverse: boolean,
    options: LayoutOptions,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>
  ) {
    const layerIndices = Array.from(orderedLayers.keys()).sort((a, b) => a - b);
    const primaryOffsets = new Map<number, number>();
    let curPrimary = 80;

    // Buffer layer gap to prevent container headers/padding from colliding across ranks
    const extraPrimaryPad = isVertical ? HEADER_HEIGHT + CONTAINER_PADDING_Y * 2 : CONTAINER_PADDING_X * 2;
    const primGap = (isVertical ? ROW_GAP * 1.5 : COLUMN_GAP * 1.5) + extraPrimaryPad;
    const secGap = isVertical ? COLUMN_GAP : ROW_GAP;

    const placementOrder = isReverse ? [...layerIndices].reverse() : [...layerIndices];

    for (const layerIdx of placementOrder) {
      const entities = orderedLayers.get(layerIdx) || [];
      let maxPrimaryBreadth = 0;
      for (const id of entities) {
        const dim = getBaseDim(id);
        const pb = isVertical ? dim.height : dim.width;
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

    const getParentId = (id: ID) =>
      graph.nodes[id]?.parentId ?? graph.containers[id]?.parentId ?? null;

    // Pass 1: Median positioning along secondary axis with container boundary padding
    for (const layerIdx of layerIndices) {
      const entities = orderedLayers.get(layerIdx) || [];
      let prevEnd = -Infinity;
      let prevParent: ID | null | undefined = undefined;

      for (const id of entities) {
        const dim = getBaseDim(id);
        const breadth = isVertical ? dim.width : dim.height;
        const parents = parentsOf.get(id) || [];
        const currentParent = getParentId(id);

        let effectiveGap = secGap;
        if (prevParent !== undefined && prevParent !== currentParent) {
          effectiveGap = secGap + (isVertical ? CONTAINER_PADDING_X * 2 : HEADER_HEIGHT + CONTAINER_PADDING_Y * 2);
        }

        let idealCenter: number | null = null;
        if (parents.length > 0) {
          const parentCenters = parents
            .map((p) => {
              const pos = secondaryPos.get(p);
              if (pos === undefined) return null;
              const pDim = getBaseDim(p);
              return pos + (isVertical ? pDim.width : pDim.height) / 2;
            })
            .filter((v): v is number => v !== null);

          if (parentCenters.length > 0) {
            idealCenter = parentCenters.reduce((a, b) => a + b, 0) / parentCenters.length;
          }
        }

        let startPos = idealCenter !== null ? idealCenter - breadth / 2 : 80;
        if (startPos < prevEnd + effectiveGap) {
          startPos = prevEnd === -Infinity ? 80 : prevEnd + effectiveGap;
        }

        secondaryPos.set(id, startPos);
        prevEnd = startPos + breadth;
        prevParent = currentParent;
      }
    }

    // Pass 2: Centering along secondary axis
    for (let i = layerIndices.length - 1; i >= 0; i--) {
      const layerIdx = layerIndices[i];
      const entities = orderedLayers.get(layerIdx) || [];

      for (const id of entities) {
        const children = childrenOf.get(id) || [];
        if (children.length === 0) continue;

        const childCenters = children
          .map((c) => {
            const pos = secondaryPos.get(c);
            if (pos === undefined) return null;
            const cDim = getBaseDim(c);
            return pos + (isVertical ? cDim.width : cDim.height) / 2;
          })
          .filter((v): v is number => v !== null);

        if (childCenters.length > 0) {
          const avgChildCenter = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;
          const dim = getBaseDim(id);
          const breadth = isVertical ? dim.width : dim.height;
          secondaryPos.set(id, avgChildCenter - breadth / 2);
        }
      }

      let prevEnd = -Infinity;
      let prevParent: ID | null | undefined = undefined;
      for (const id of entities) {
        const dim = getBaseDim(id);
        const breadth = isVertical ? dim.width : dim.height;
        const currentParent = getParentId(id);

        let effectiveGap = secGap;
        if (prevParent !== undefined && prevParent !== currentParent) {
          effectiveGap = secGap + (isVertical ? CONTAINER_PADDING_X * 2 : HEADER_HEIGHT + CONTAINER_PADDING_Y * 2);
        }

        let pos = secondaryPos.get(id) ?? 80;
        if (pos < prevEnd + effectiveGap) {
          pos = prevEnd + effectiveGap;
          secondaryPos.set(id, pos);
        }
        prevEnd = pos + breadth;
        prevParent = currentParent;
      }
    }

    let minSec = Infinity;
    for (const p of secondaryPos.values()) minSec = Math.min(minSec, p);
    const secShift = minSec < 80 ? 80 - minSec : 0;

    for (const layerIdx of layerIndices) {
      const entities = orderedLayers.get(layerIdx) || [];
      const primary = primaryOffsets.get(layerIdx) || 80;

      for (const id of entities) {
        const dim = getBaseDim(id);
        const secondary = (secondaryPos.get(id) ?? 80) + secShift;
        const x = isVertical ? secondary : primary;
        const y = isVertical ? primary : secondary;

        const item: NodeLayoutResult = { id, x, y, width: dim.width, height: dim.height };
        if (graph.containers[id]) {
          containersLayout[id] = item;
        } else {
          nodesLayout[id] = item;
        }
      }
    }

    // -------------------------------------------------------------------------
    // Compound Container Bounding Boxes (Bottom-up depth traversal)
    // -------------------------------------------------------------------------
    const depths = CoordinateAssigner.getContainerDepths(graph);
    const sortedContainers = Object.keys(graph.containers).sort(
      (a, b) => (depths.get(b) || 0) - (depths.get(a) || 0)
    );

    const childrenMap = new Map<ID, ID[]>();
    for (const [nId, n] of Object.entries(graph.nodes)) {
      if (n.parentId) {
        if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
        childrenMap.get(n.parentId)!.push(nId);
      }
    }
    for (const [cId, c] of Object.entries(graph.containers)) {
      if (c.parentId) {
        if (!childrenMap.has(c.parentId)) childrenMap.set(c.parentId, []);
        childrenMap.get(c.parentId)!.push(cId);
      }
    }

    for (const cId of sortedContainers) {
      if (graph.containers[cId]?.collapsed) {
        if (!containersLayout[cId]) {
          containersLayout[cId] = {
            id: cId,
            x: 80,
            y: 80,
            width: COLLAPSED_CONTAINER_WIDTH,
            height: COLLAPSED_CONTAINER_HEIGHT
          };
        }
        continue;
      }

      const directChildren = childrenMap.get(cId) || [];
      const childBoxes: NodeLayoutResult[] = [];
      for (const chId of directChildren) {
        const l = nodesLayout[chId] || containersLayout[chId];
        if (l) childBoxes.push(l);
      }

      if (childBoxes.length === 0) {
        if (!containersLayout[cId]) {
          containersLayout[cId] = {
            id: cId,
            x: 80,
            y: 80,
            width: EMPTY_CONTAINER_WIDTH,
            height: EMPTY_CONTAINER_HEIGHT
          };
        }
      } else {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (const b of childBoxes) {
          minX = Math.min(minX, b.x);
          maxX = Math.max(maxX, b.x + b.width);
          minY = Math.min(minY, b.y);
          maxY = Math.max(maxY, b.y + b.height);
        }

        const width = Math.max(maxX - minX + CONTAINER_PADDING_X * 2, COLLAPSED_CONTAINER_WIDTH);
        const height = maxY - minY + HEADER_HEIGHT + CONTAINER_PADDING_Y * 2;
        const x = minX - CONTAINER_PADDING_X;
        const y = minY - HEADER_HEIGHT - CONTAINER_PADDING_Y;

        containersLayout[cId] = { id: cId, x, y, width, height };
      }
    }

    // Canvas boundary margin normalization
    let minWorldX = Infinity;
    let minWorldY = Infinity;
    for (const it of [...Object.values(nodesLayout), ...Object.values(containersLayout)]) {
      minWorldX = Math.min(minWorldX, it.x);
      minWorldY = Math.min(minWorldY, it.y);
    }

    const TARGET_MARGIN = 60;
    const shiftX = minWorldX < TARGET_MARGIN ? TARGET_MARGIN - minWorldX : 0;
    const shiftY = minWorldY < TARGET_MARGIN ? TARGET_MARGIN - minWorldY : 0;

    if (shiftX !== 0 || shiftY !== 0) {
      for (const n of Object.values(nodesLayout)) {
        n.x += shiftX;
        n.y += shiftY;
      }
      for (const c of Object.values(containersLayout)) {
        c.x += shiftX;
        c.y += shiftY;
      }
    }
  }

  private static assignDynamicPortSides(
    graph: LogicalGraph,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>
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

      const isHorizontalDominant = Math.abs(dx) > Math.abs(dy) * 1.25;

      const srcPort = srcEntity?.ports?.find((p) => p.id === edge.sourcePortId);
      if (srcPort && (!srcPort.side || srcPort.side === 'auto')) {
        if (isHorizontalDominant) {
          srcPort.side = dx >= 0 ? 'right' : 'left';
        } else {
          srcPort.side = dy >= 0 ? 'bottom' : 'top';
        }
      }

      const tgtPort = tgtEntity?.ports?.find((p) => p.id === edge.targetPortId);
      if (tgtPort && (!tgtPort.side || tgtPort.side === 'auto')) {
        if (isHorizontalDominant) {
          tgtPort.side = dx >= 0 ? 'left' : 'right';
        } else {
          tgtPort.side = dy >= 0 ? 'top' : 'bottom';
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
