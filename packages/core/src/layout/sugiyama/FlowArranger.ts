// packages/core/src/layout/sugiyama/FlowArranger.ts

import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement, LocalBox } from '../CompoundArranger';
import { LayoutOptions } from '../LayoutEngine';

const PRIMARY_GAP = 80;
const SECONDARY_GAP = 50;

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

    // 1. Filter local edges among these direct children
    const localEdges = Object.values(graph.edges).filter(
      (e) => childSet.has(e.sourceId) && childSet.has(e.targetId)
    );

    // 2. Local rank assignment (Longest-path DAG layering)
    const inDegree = new Map<ID, number>();
    const outgoing = new Map<ID, ID[]>();
    for (const id of childIds) {
      inDegree.set(id, 0);
      outgoing.set(id, []);
    }
    for (const e of localEdges) {
      outgoing.get(e.sourceId)!.push(e.targetId);
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

    // Handle disconnected entities or cycles
    for (const id of childIds) {
      if (!processed.has(id)) {
        rankMap.set(id, 0);
      }
    }

    // Group into ranks
    const layers = new Map<number, ID[]>();
    for (const [id, rank] of rankMap.entries()) {
      if (!layers.has(rank)) layers.set(rank, []);
      layers.get(rank)!.push(id);
    }

    const sortedRankKeys = Array.from(layers.keys()).sort((a, b) => a - b);
    const placementRanks = isReverse ? [...sortedRankKeys].reverse() : sortedRankKeys;

    // 3. Compute local coordinates with spacing
    const boxes: LocalBox[] = [];
    let curPrimary = 0;

    for (const rank of placementRanks) {
      const entities = layers.get(rank)!;
      let maxPrimaryBreadth = 0;
      let curSecondary = 0;

      for (const id of entities) {
        const dim = getItemDim(id);
        const pb = isVertical ? dim.height : dim.width;
        const sb = isVertical ? dim.width : dim.height;

        const x = isVertical ? curSecondary : curPrimary;
        const y = isVertical ? curPrimary : curSecondary;

        boxes.push({ id, localX: x, localY: y, width: dim.width, height: dim.height });

        curSecondary += sb + SECONDARY_GAP;
        maxPrimaryBreadth = Math.max(maxPrimaryBreadth, pb);
      }

      curPrimary += maxPrimaryBreadth + PRIMARY_GAP;
    }

    const overallW = Math.max(...boxes.map((b) => b.localX + b.width), 0);
    const overallH = Math.max(...boxes.map((b) => b.localY + b.height), 0);

    return { width: overallW, height: overallH, boxes };
  }
}
