// packages/core/src/layout/sugiyama/FlowArranger.ts

import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement, LocalBox } from '../CompoundArranger';
import { LayoutOptions } from '../LayoutEngine';

const PRIMARY_GAP = 70;
const SECONDARY_GAP = 28;

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
      // Sink-aligned (ALAP) layering for BT / RL:
      // Pulls leaf inputs up directly under their target ("parent") node.
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

    // 3. Parent-Centered Secondary Axis Positioning
    const secondaryPos = new Map<ID, number>();

    const getBreadth = (id: ID) => {
      const dim = getItemDim(id);
      return isVertical ? dim.width : dim.height;
    };

    // Forward pass: Align children directly to the center of their parent(s)
    for (const rank of sortedRankKeys) {
      const entities = layers.get(rank) || [];

      // Keep nodes that continue an upstream chain before branch/leaf nodes
      entities.sort((a, b) => {
        const aHasIn = (incoming.get(a)?.length || 0) > 0 ? 0 : 1;
        const bHasIn = (incoming.get(b)?.length || 0) > 0 ? 0 : 1;
        if (aHasIn !== bHasIn) return aHasIn - bHasIn;

        const aAvg = this.getAvgNeighborPos(incoming.get(a) || [], secondaryPos, getBreadth);
        const bAvg = this.getAvgNeighborPos(incoming.get(b) || [], secondaryPos, getBreadth);
        if (aAvg !== null && bAvg !== null && aAvg !== bAvg) return aAvg - bAvg;

        return 0;
      });

      let prevEnd = -Infinity;

      for (const id of entities) {
        const breadth = getBreadth(id);
        const parents = incoming.get(id) || [];
        const idealCenter = this.getAvgNeighborPos(parents, secondaryPos, getBreadth);

        let startPos = idealCenter !== null ? idealCenter - breadth / 2 : 0;
        if (startPos < prevEnd + SECONDARY_GAP) {
          startPos = prevEnd === -Infinity ? 0 : prevEnd + SECONDARY_GAP;
        }

        secondaryPos.set(id, startPos);
        prevEnd = startPos + breadth;
      }
    }

    // Backward pass: Align parents directly over their children's center
    for (let i = sortedRankKeys.length - 1; i >= 0; i--) {
      const rank = sortedRankKeys[i];
      const entities = layers.get(rank) || [];

      for (const id of entities) {
        const children = outgoing.get(id) || [];
        if (children.length === 0) continue;

        const avgChildCenter = this.getAvgNeighborPos(children, secondaryPos, getBreadth);
        if (avgChildCenter !== null) {
          const breadth = getBreadth(id);
          secondaryPos.set(id, avgChildCenter - breadth / 2);
        }
      }

      // Re-pack to resolve any newly created sibling overlaps
      let prevEnd = -Infinity;
      for (const id of entities) {
        const breadth = getBreadth(id);
        let pos = secondaryPos.get(id) ?? 0;
        if (pos < prevEnd + SECONDARY_GAP) {
          pos = prevEnd === -Infinity ? 0 : prevEnd + SECONDARY_GAP;
          secondaryPos.set(id, pos);
        }
        prevEnd = pos + breadth;
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
