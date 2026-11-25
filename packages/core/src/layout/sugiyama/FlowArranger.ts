// packages/core/src/layout/sugiyama/FlowArranger.ts

import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement, LocalBox } from '../CompoundArranger';
import { LayoutOptions } from '../LayoutEngine';

const PRIMARY_GAP = 70;
const SECONDARY_GAP = 28;
const RELAXATION_PASSES = 2;

interface BlockItem {
  id: ID;
  breadth: number;
  idealCenter: number | null;
}

interface Block {
  items: BlockItem[];
  totalBreadth: number;
  start: number;
}

export class FlowArranger implements ChildArranger {
  constructor(private options: LayoutOptions = {}) {}

  public arrange(
    _containerId: ID | null,
    childIds: ID[],
    graph: LogicalGraph,
    getItemDim: (id: ID) => { width: number; height: number }
  ): ContainerArrangement {
    if (childIds.length === 0) {
      return { width: 0, height: 0, boxes: [] };
    }

    const direction = this.options.direction ?? 'TB';
    const isVertical = direction === 'TB' || direction === 'BT';
    const isReverse = direction === 'BT' || direction === 'RL';

    const childSet = new Set(childIds);

    // 1. Cross-Hierarchy Edge Lifting
    const liftedEdges: Array<{ sourceId: ID; targetId: ID }> = [];
    const seenEdges = new Set<string>();

    for (const edge of Object.values(graph.edges)) {
      const effectiveSrc = this.resolveToDirectChild(edge.sourceId, childSet, graph);
      const effectiveTgt = this.resolveToDirectChild(edge.targetId, childSet, graph);

      if (effectiveSrc && effectiveTgt && effectiveSrc !== effectiveTgt) {
        const edgeKey = `${effectiveSrc}->${effectiveTgt}`;
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          liftedEdges.push({ sourceId: effectiveSrc, targetId: effectiveTgt });
        }
      }
    }

    // 2. DAG Layering
    const inDegree = new Map<ID, number>();
    const outDegree = new Map<ID, number>();
    const outgoing = new Map<ID, ID[]>();
    const incoming = new Map<ID, ID[]>();

    for (const id of childIds) {
      inDegree.set(id, 0);
      outDegree.set(id, 0);
      outgoing.set(id, []);
      incoming.set(id, []);
    }
    for (const e of liftedEdges) {
      outgoing.get(e.sourceId)!.push(e.targetId);
      incoming.get(e.targetId)!.push(e.sourceId);
      inDegree.set(e.targetId, (inDegree.get(e.targetId) || 0) + 1);
      outDegree.set(e.sourceId, (outDegree.get(e.sourceId) || 0) + 1);
    }

    const rankMap = new Map<ID, number>();

    if (isReverse) {
      // Sink-aligned (ALAP) layering for BT / RL
      const distFromSink = new Map<ID, number>();
      const queue: ID[] = childIds.filter((id) => (outDegree.get(id) || 0) === 0);
      for (const id of queue) distFromSink.set(id, 0);

      const processed = new Set<ID>();
      while (queue.length > 0) {
        const v = queue.shift()!;
        processed.add(v);
        const d = distFromSink.get(v)!;

        for (const u of incoming.get(v)!) {
          const nextDist = Math.max(distFromSink.get(u) || 0, d + 1);
          distFromSink.set(u, nextDist);
          outDegree.set(u, outDegree.get(u)! - 1);
          if (outDegree.get(u) === 0) queue.push(u);
        }
      }

      let maxDist = 0;
      for (const d of distFromSink.values()) {
        maxDist = Math.max(maxDist, d);
      }

      for (const id of childIds) {
        const d = processed.has(id) ? distFromSink.get(id)! : maxDist;
        rankMap.set(id, maxDist - d);
      }
    } else {
      // Source-aligned (ASAP) layering for TB / LR
      const queue: ID[] = childIds.filter((id) => (inDegree.get(id) || 0) === 0);
      for (const id of queue) rankMap.set(id, 0);

      const processed = new Set<ID>();
      while (queue.length > 0) {
        const u = queue.shift()!;
        processed.add(u);
        const r = rankMap.get(u)!;

        for (const v of outgoing.get(u)!) {
          const nextRank = Math.max(rankMap.get(v) || 0, r + 1);
          rankMap.set(v, nextRank);
          inDegree.set(v, inDegree.get(v)! - 1);
          if (inDegree.get(v) === 0) queue.push(v);
        }
      }

      for (const id of childIds) {
        if (!processed.has(id)) {
          rankMap.set(id, 0);
        }
      }
    }

    const layers = new Map<number, ID[]>();
    for (const [id, rank] of rankMap.entries()) {
      if (!layers.has(rank)) layers.set(rank, []);
      layers.get(rank)!.push(id);
    }

    const sortedRankKeys = Array.from(layers.keys()).sort((a, b) => a - b);
    const placementRanks = isReverse ? [...sortedRankKeys].reverse() : sortedRankKeys;

    // 3. Symmetric Block-Centered Secondary Axis Positioning
    const secondaryPos = new Map<ID, number>();

    const getBreadth = (id: ID) => {
      const dim = getItemDim(id);
      return isVertical ? dim.width : dim.height;
    };

    const getIncomingRefs = (id: ID) => {
      const r = rankMap.get(id);
      return (incoming.get(id) || []).filter((n) => rankMap.get(n) !== r);
    };

    const getOutgoingRefs = (id: ID) => {
      const r = rankMap.get(id);
      return (outgoing.get(id) || []).filter((n) => rankMap.get(n) !== r);
    };

    for (let pass = 0; pass < RELAXATION_PASSES; pass++) {
      // Forward pass: center each layer's sibling blocks against upstream neighbors
      for (const rank of sortedRankKeys) {
        this.alignLayer(
          layers.get(rank) || [],
          getIncomingRefs,
          secondaryPos,
          getBreadth,
          pass === 0
        );
      }

      // Backward pass: center each layer's sibling blocks against downstream neighbors
      for (let i = sortedRankKeys.length - 1; i >= 0; i--) {
        const rank = sortedRankKeys[i];
        this.alignLayer(
          layers.get(rank) || [],
          getOutgoingRefs,
          secondaryPos,
          getBreadth,
          false
        );
      }
    }

    // Normalize secondary axis to start at 0
    let minSecondary = Infinity;
    for (const pos of secondaryPos.values()) {
      minSecondary = Math.min(minSecondary, pos);
    }
    const secShift = Number.isFinite(minSecondary) && minSecondary !== 0 ? -minSecondary : 0;

    // 4. Primary-Axis Layout & Local Coordinate Assignment
    const boxes: LocalBox[] = [];
    let curPrimary = 0;

    for (const rank of placementRanks) {
      const entities = layers.get(rank)!;
      let maxPrimaryBreadth = 0;

      for (const id of entities) {
        const dim = getItemDim(id);
        const pb = isVertical ? dim.height : dim.width;
        const sPos = (secondaryPos.get(id) ?? 0) + secShift;

        const x = isVertical ? sPos : curPrimary;
        const y = isVertical ? curPrimary : sPos;

        boxes.push({ id, localX: x, localY: y, width: dim.width, height: dim.height });

        maxPrimaryBreadth = Math.max(maxPrimaryBreadth, pb);
      }

      curPrimary += maxPrimaryBreadth + PRIMARY_GAP;
    }

    const overallW = Math.max(...boxes.map((b) => b.localX + b.width), 0);
    const overallH = Math.max(...boxes.map((b) => b.localY + b.height), 0);

    return { width: overallW, height: overallH, boxes };
  }

  private alignLayer(
    entities: ID[],
    getRefs: (id: ID) => ID[],
    secondaryPos: Map<ID, number>,
    getBreadth: (id: ID) => number,
    isInitialPass: boolean
  ): void {
    if (entities.length === 0) return;

    const idealCenters = new Map<ID, number | null>();
    for (const id of entities) {
      idealCenters.set(id, this.getAvgNeighborPos(getRefs(id), secondaryPos, getBreadth));
    }

    entities.sort((a, b) => {
      const aIdeal = idealCenters.get(a) ?? null;
      const bIdeal = idealCenters.get(b) ?? null;

      if (isInitialPass) {
        const aHas = aIdeal !== null ? 0 : 1;
        const bHas = bIdeal !== null ? 0 : 1;
        if (aHas !== bHas) return aHas - bHas;
      }

      const aPos = secondaryPos.get(a);
      const bPos = secondaryPos.get(b);
      const aKey = aIdeal ?? (aPos !== undefined ? aPos + getBreadth(a) / 2 : 0);
      const bKey = bIdeal ?? (bPos !== undefined ? bPos + getBreadth(b) / 2 : 0);

      if (aKey !== bKey) return aKey - bKey;

      if (aPos !== undefined && bPos !== undefined && aPos !== bPos) {
        return aPos - bPos;
      }
      return 0;
    });

    const placeMergedBlock = (items: BlockItem[], fallbackStart: number): Block => {
      let offset = 0;
      let anchoredSum = 0;
      let anchoredCount = 0;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (i > 0) offset += SECONDARY_GAP;
        const relCenter = offset + item.breadth / 2;
        if (item.idealCenter !== null) {
          anchoredSum += item.idealCenter - relCenter;
          anchoredCount++;
        }
        offset += item.breadth;
      }

      const start = anchoredCount > 0 ? anchoredSum / anchoredCount : fallbackStart;
      return { items, totalBreadth: offset, start };
    };

    const blocks: Block[] = [];
    let prevEnd = -Infinity;

    for (const id of entities) {
      const breadth = getBreadth(id);
      const idealCenter = idealCenters.get(id) ?? null;

      let initialStart: number;
      if (idealCenter !== null) {
        initialStart = idealCenter - breadth / 2;
      } else if (!isInitialPass && secondaryPos.has(id)) {
        initialStart = secondaryPos.get(id)!;
      } else {
        initialStart = prevEnd === -Infinity ? 0 : prevEnd + SECONDARY_GAP;
      }

      let currBlock: Block = {
        items: [{ id, breadth, idealCenter }],
        totalBreadth: breadth,
        start: initialStart
      };

      // Merge backward while overlapping so sibling groups stay centered on their target
      while (blocks.length > 0) {
        const prev = blocks[blocks.length - 1];
        if (prev.start + prev.totalBreadth + SECONDARY_GAP <= currBlock.start + 1e-6) {
          break;
        }
        blocks.pop();
        currBlock = placeMergedBlock([...prev.items, ...currBlock.items], prev.start);
      }

      blocks.push(currBlock);
      prevEnd = currBlock.start + currBlock.totalBreadth;
    }

    for (const block of blocks) {
      let cursor = block.start;
      for (const item of block.items) {
        secondaryPos.set(item.id, cursor);
        cursor += item.breadth + SECONDARY_GAP;
      }
    }
  }

  private getAvgNeighborPos(
    neighbors: ID[],
    secondaryPos: Map<ID, number>,
    getBreadth: (id: ID) => number
  ): number | null {
    if (neighbors.length === 0) return null;
    const centers = neighbors
      .map((n) => {
        const pos = secondaryPos.get(n);
        if (pos === undefined) return null;
        return pos + getBreadth(n) / 2;
      })
      .filter((v): v is number => v !== null);

    if (centers.length === 0) return null;
    return centers.reduce((a, b) => a + b, 0) / centers.length;
  }

  private resolveToDirectChild(
    entityId: ID,
    directChildSet: Set<ID>,
    graph: LogicalGraph
  ): ID | null {
    let curr: ID | null = entityId;
    while (curr) {
      if (directChildSet.has(curr)) return curr;
      curr = graph.nodes[curr]?.parentId ?? graph.containers[curr]?.parentId ?? null;
    }
    return null;
  }
}
