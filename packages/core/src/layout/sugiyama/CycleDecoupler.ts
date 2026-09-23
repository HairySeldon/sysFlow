import { ID, LogicalGraph, EdgeEntity } from '../../models';

export interface DecoupledGraph {
  adjList: Map<ID, Set<ID>>;
  reversedEdges: Set<string>;
  allEntityIds: string[];
}

export class CycleDecoupler {
  public static decouple(graph: LogicalGraph, activeEntities: Set<ID>): DecoupledGraph {
    const adjList = new Map<ID, Set<ID>>();
    for (const id of activeEntities) {
      adjList.set(id, new Set<ID>());
    }

    const edges = Object.values(graph.edges) as EdgeEntity[];
    for (const edge of edges) {
      if (activeEntities.has(edge.sourceId) && activeEntities.has(edge.targetId)) {
        adjList.get(edge.sourceId)!.add(edge.targetId);
      }
    }

    const visited = new Set<ID>();
    const recStack = new Set<ID>();
    const reversedEdges = new Set<string>();

    const dfs = (nodeId: ID) => {
      visited.add(nodeId);
      recStack.add(nodeId);

      const targets = Array.from(adjList.get(nodeId) || []);
      for (const targetId of targets) {
        if (!visited.has(targetId)) {
          dfs(targetId);
        } else if (recStack.has(targetId)) {
          adjList.get(nodeId)!.delete(targetId);
          adjList.get(targetId)!.add(nodeId);
          reversedEdges.add(`${nodeId}->${targetId}`);
        }
      }

      recStack.delete(nodeId);
    };

    for (const nodeId of activeEntities) {
      if (!visited.has(nodeId)) {
        dfs(nodeId);
      }
    }

    return {
      adjList,
      reversedEdges,
      allEntityIds: Array.from(activeEntities)
    };
  }
}
