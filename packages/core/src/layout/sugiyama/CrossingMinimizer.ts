import { ID } from '../../models';

export class CrossingMinimizer {
  public static minimizeCrossings(
    layeredNodes: Map<number, ID[]>,
    adjList: Map<ID, Set<ID>>,
    iterations: number = 4
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

        currentLayerNodes.sort((a, b) => {
          const baryA = CrossingMinimizer.getBarycenter(a, inAdjList, nodeOrderMap);
          const baryB = CrossingMinimizer.getBarycenter(b, inAdjList, nodeOrderMap);
          return baryA - baryB;
        });
      }

      // Backward sweep
      for (let i = sortedLayers.length - 2; i >= 0; i--) {
        const nextLayerNodes = result.get(sortedLayers[i + 1])!;
        const currentLayerNodes = result.get(sortedLayers[i])!;

        const nodeOrderMap = new Map<ID, number>();
        nextLayerNodes.forEach((id, idx) => nodeOrderMap.set(id, idx));

        currentLayerNodes.sort((a, b) => {
          const baryA = CrossingMinimizer.getBarycenter(a, adjList, nodeOrderMap);
          const baryB = CrossingMinimizer.getBarycenter(b, adjList, nodeOrderMap);
          return baryA - baryB;
        });
      }
    }

    return result;
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
