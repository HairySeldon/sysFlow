import { ID, LogicalGraph } from '../../models';
import { LayoutResult, LayoutOptions } from '../LayoutEngine';

export declare class CoordinateAssigner {
    static assignCoordinates(graph: LogicalGraph, orderedLayers: Map<number, ID[]>, measurements: Map<ID, {
        width: number;
        height: number;
    }>, options?: LayoutOptions): LayoutResult;
    private static layoutConcurrentHierarchy;
    private static findBestTightPacking;
    private static simulateSkylinePacking;
    private static layoutFlowTree;
    private static assignDynamicPortSides;
    private static getContainerDepths;
}
//# sourceMappingURL=CoordinateAssigner.d.ts.map