import { ID, LogicalGraph } from '../../models';

export interface DecoupledGraph {
    adjList: Map<ID, Set<ID>>;
    reversedEdges: Set<string>;
    allEntityIds: string[];
}
export declare class CycleDecoupler {
    static decouple(graph: LogicalGraph, activeEntities: Set<ID>): DecoupledGraph;
}
//# sourceMappingURL=CycleDecoupler.d.ts.map