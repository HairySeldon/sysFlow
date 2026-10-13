// packages/core/src/layout/sugiyama/FlowArranger.ts

import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement, LocalBox } from '../CompoundArranger';
import { LayoutOptions } from '../LayoutEngine';

const PRIMARY_GAP = 36;
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
    const outgoing = new Map<ID, ID[]>();
    const incoming = new Map<ID, ID[]>();

    for (const id of childIds) {
      inDegree.set(id, 0);
      outgoing.set(id, []);
      incoming.set(id, []);
    }
    for (const e of liftedEdges) {
      outgoing.get(e.sourceId)!.push(e.targetId);
      incoming.get(e.targetId)!.push(e.sourceId);
      inDegree.set(e.targetId, (inDegree.get(e.targetId) || 0) + 1);
    }

    const rankMap = new Map<ID, number>();
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
      let prevEnd = -Infinity;

      for (const id of entities) {
        const breadth = getBreadth(id);
        const parents = incoming.get(id) || [];

        let idealCenter: number | null = null;
        if (parents.length > 0) {
          const parentCenters = parents
            .map((p) => {
              const pPos = secondaryPos.get(p);
              if (pPos === undefined) return null;
              return pPos + getBreadth(p) / 2;
            })
            .filter((v): v is number => v !== null);

          if (parentCenters.length > 0) {
            idealCenter = parentCenters.reduce((a, b) => a + b, 0) / parentCenters.length;
          }
        }

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

        const childCenters = children
          .map((c) => {
            const cPos = secondaryPos.get(c);
            if (cPos === undefined) return null;
            return cPos + getBreadth(c) / 2;
          })
          .filter((v): v is number => v !== null);

        if (childCenters.length > 0) {
          const avgChildCenter = childCenters.reduce((a, b) => a + b, 0) / childCenters.length;
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
    const secShift = minSecondary < 0 ? -minSecondary : 0;

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
