import { ID } from '../../models';

export class LayerAssignment {
  public static assignLayers(allEntities: ID[], adjList: Map<ID, Set<ID>>): Map<number, ID[]> {
    const inDegree = new Map<ID, number>();
    for (const id of allEntities) {
      inDegree.set(id, 0);
    }

    for (const [, targets] of adjList.entries()) {
      for (const target of targets) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }

    const layers = new Map<ID, number>();
    // Roots have in-degree 0
    const queue: ID[] = [];
    for (const id of allEntities) {
      if ((inDegree.get(id) || 0) === 0) {
        layers.set(id, 0);
        queue.push(id);
      }
    }

    // Topological longest path assignment
    const processed = new Set<ID>();
    while (queue.length > 0) {
      const current = queue.shift()!;
      processed.add(current);
      const currentLayer = layers.get(current) || 0;

      const targets = adjList.get(current) || new Set();
      for (const target of targets) {
        const currentTargetLayer = layers.get(target) ?? 0;
        layers.set(target, Math.max(currentTargetLayer, currentLayer + 1));

        inDegree.set(target, (inDegree.get(target) || 1) - 1);
        if (inDegree.get(target) === 0) {
          queue.push(target);
        }
      }
    }

    // Fallback for isolated disconnected cycles or remaining nodes
    for (const id of allEntities) {
      if (!layers.has(id)) {
        layers.set(id, 0);
      }
    }

    const layeredNodes = new Map<number, ID[]>();
    for (const [nodeId, layerIndex] of layers.entries()) {
      if (!layeredNodes.has(layerIndex)) {
        layeredNodes.set(layerIndex, []);
      }
      layeredNodes.get(layerIndex)!.push(nodeId);
    }

    return layeredNodes;
  }
}
