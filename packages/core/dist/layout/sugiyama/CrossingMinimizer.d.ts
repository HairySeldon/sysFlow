import { ID, LogicalGraph } from '../../models';

export declare class CrossingMinimizer {
    static minimizeCrossings(layeredNodes: Map<number, ID[]>, adjList: Map<ID, Set<ID>>, iterations?: number, graph?: LogicalGraph): Map<number, ID[]>;
    private static sortLayerNodes;
    private static getAncestorPath;
    private static getBarycenter;
}
//# sourceMappingURL=CrossingMinimizer.d.ts.map