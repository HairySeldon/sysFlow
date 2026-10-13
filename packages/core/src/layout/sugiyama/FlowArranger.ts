// packages/core/src/layout/sugiyama/FlowArranger.ts

import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement, LocalBox } from '../CompoundArranger';
import { LayoutOptions } from '../LayoutEngine';

const PRIMARY_GAP = 20;
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

    // 1. Cross-Hierarchy Edge Lifting:
    // Any edge connecting to/from a descendant inside a child container
    // is lifted to represent that child container in this scope.
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

    // 2. DAG Layering on direct children
    const inDegree = new Map<ID, number>();
    const outgoing = new Map<ID, ID[]>();
    for (const id of childIds) {
      inDegree.set(id, 0);
      outgoing.set(id, []);
    }
    for (const e of liftedEdges) {
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

    // Handle disconnected entities or remaining cycle nodes
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

    // 3. Calculate secondary breadth for centering ranks
    const rankSecondaryBreadths = new Map<number, number>();
    let maxTotalSecondary = 0;

    for (const rank of placementRanks) {
      const entities = layers.get(rank)!;
      let totalSec = 0;
      for (let i = 0; i < entities.length; i++) {
        const dim = getItemDim(entities[i]);
        const sb = isVertical ? dim.width : dim.height;
        totalSec += sb + (i > 0 ? SECONDARY_GAP : 0);
      }
      rankSecondaryBreadths.set(rank, totalSec);
      maxTotalSecondary = Math.max(maxTotalSecondary, totalSec);
    }

    // 4. Coordinate Assignment with centering
    const boxes: LocalBox[] = [];
    let curPrimary = 0;

    for (const rank of placementRanks) {
      const entities = layers.get(rank)!;
      let maxPrimaryBreadth = 0;

      const rankBreadth = rankSecondaryBreadths.get(rank) || 0;
      let curSecondary = Math.max(0, (maxTotalSecondary - rankBreadth) / 2);

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

  /**
   * Ascends the entity hierarchy to locate the direct child in this scope
   * that owns or is the target entity.
   */
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
