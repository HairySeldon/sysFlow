// packages/core/src/layout/sugiyama/CrossingMinimizer.ts

import { ID, LogicalGraph } from '../../models';

export class CrossingMinimizer {
  public static minimizeCrossings(
    layeredNodes: Map<number, ID[]>,
    adjList: Map<ID, Set<ID>>,
    iterations: number = 4,
    graph?: LogicalGraph
  ): Map<number, ID[]> {
    const sortedLayers = Array.from(layeredNodes.keys()).sort((a, b) => a - b);
    if (sortedLayers.length <= 1) return layeredNodes;

    // Upstream adjacency lookup (inverted adjList)
    const inAdjList = new Map<ID, Set<ID>>();
    for (const [src, targets] of adjList.entries()) {
      for (const tgt of targets) {
        if (!inAdjList.has(tgt)) inAdjList.set(tgt, new Set());
        inAdjList.get(tgt)!.add(src);
      }
    }

    const result = new Map<number, ID[]>();
    for (const [layer, nodes] of layeredNodes.entries()) {
      result.set(layer, [...nodes]);
    }

    for (let iter = 0; iter < iterations; iter++) {
      // Forward sweep
      for (let i = 1; i < sortedLayers.length; i++) {
        const prevLayerNodes = result.get(sortedLayers[i - 1])!;
        const currentLayerNodes = result.get(sortedLayers[i])!;

        const nodeOrderMap = new Map<ID, number>();
        prevLayerNodes.forEach((id, idx) => nodeOrderMap.set(id, idx));

        CrossingMinimizer.sortLayerNodes(currentLayerNodes, inAdjList, nodeOrderMap, graph);
      }

      // Backward sweep
      for (let i = sortedLayers.length - 2; i >= 0; i--) {
        const nextLayerNodes = result.get(sortedLayers[i + 1])!;
        const currentLayerNodes = result.get(sortedLayers[i])!;

        const nodeOrderMap = new Map<ID, number>();
        nextLayerNodes.forEach((id, idx) => nodeOrderMap.set(id, idx));

        CrossingMinimizer.sortLayerNodes(currentLayerNodes, adjList, nodeOrderMap, graph);
      }
    }

    return result;
  }

  private static sortLayerNodes(
    nodes: ID[],
    connections: Map<ID, Set<ID>>,
    neighborIndices: Map<ID, number>,
    graph?: LogicalGraph
  ) {
    if (!graph || Object.keys(graph.containers).length === 0) {
      nodes.sort((a, b) => {
        const baryA = CrossingMinimizer.getBarycenter(a, connections, neighborIndices);
        const baryB = CrossingMinimizer.getBarycenter(b, connections, neighborIndices);
        return baryA - baryB;
      });
      return;
    }

    // 1. Calculate individual barycenters
    const nodeBarycenters = new Map<ID, number>();
    for (const id of nodes) {
      nodeBarycenters.set(id, CrossingMinimizer.getBarycenter(id, connections, neighborIndices));
    }

    // 2. Aggregate barycenters across container ancestors
    const containerSums = new Map<ID, number>();
    const containerCounts = new Map<ID, number>();

    for (const id of nodes) {
      const b = nodeBarycenters.get(id) ?? 0;
      let curr = graph.nodes[id]?.parentId ?? graph.containers[id]?.parentId;
      while (curr) {
        containerSums.set(curr, (containerSums.get(curr) || 0) + b);
        containerCounts.set(curr, (containerCounts.get(curr) || 0) + 1);
        curr = graph.containers[curr]?.parentId;
      }
    }

    const getBary = (id: ID): number => {
      if (graph.containers[id]) {
        const count = containerCounts.get(id) || 0;
        return count === 0 ? 0 : (containerSums.get(id) || 0) / count;
      }
      return nodeBarycenters.get(id) ?? 0;
    };

    // 3. Hierarchical sort: common-ancestor branching prevents interleaving
    nodes.sort((a, b) => {
      const pathA = CrossingMinimizer.getAncestorPath(a, graph);
      const pathB = CrossingMinimizer.getAncestorPath(b, graph);

      let idx = 0;
      while (idx < pathA.length && idx < pathB.length && pathA[idx] === pathB[idx]) {
        idx++;
      }

      const itemA = pathA[idx] ?? a;
      const itemB = pathB[idx] ?? b;

      const diff = getBary(itemA) - getBary(itemB);
      if (Math.abs(diff) > 1e-5) return diff;

      return itemA.localeCompare(itemB);
    });
  }

  private static getAncestorPath(id: ID, graph: LogicalGraph): ID[] {
    const path: ID[] = [id];
    let curr = graph.nodes[id]?.parentId ?? graph.containers[id]?.parentId;
    while (curr) {
      path.unshift(curr);
      curr = graph.containers[curr]?.parentId;
    }
    return path;
  }

  private static getBarycenter(
    nodeId: ID,
    connections: Map<ID, Set<ID>>,
    neighborIndices: Map<ID, number>
  ): number {
    const neighbors = connections.get(nodeId);
    if (!neighbors || neighbors.size === 0) return 0;

    let sum = 0;
    let count = 0;
    for (const neighbor of neighbors) {
      if (neighborIndices.has(neighbor)) {
        sum += neighborIndices.get(neighbor)!;
        count++;
      }
    }

    return count === 0 ? 0 : sum / count;
  }
}
