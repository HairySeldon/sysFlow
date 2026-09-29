import { ID, LogicalGraph } from '../../models';
import { LayoutResult, LayoutOptions } from '../LayoutEngine';

export declare class CoordinateAssigner {
    static assignCoordinates(graph: LogicalGraph, orderedLayers: Map<number, ID[]>, measurements: Map<ID, {
        width: number;
        height: number;
    }>, options?: LayoutOptions): LayoutResult;
    private static layoutConcurrentHierarchy;
    /**
     * Evaluates multiple candidate bounding widths using 2D skyline bin packing
     * and picks the configuration that minimizes empty space while respecting targetAspect.
     */
    private static findBestTightPacking;
    /**
     * Bottom-Left Skyline 2D Bin Packing:
     * Sorts items descending by height (First-Fit Decreasing) and packs into the lowest
     * available height valley, preventing tall items from locking the vertical baseline.
     */
    private static simulateSkylinePacking;
    private static layoutFlowTree;
    private static assignDynamicPortSides;
    private static getContainerDepths;
}
//# sourceMappingURL=CoordinateAssigner.d.ts.map