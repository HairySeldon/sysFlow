import { ID, LogicalGraph } from '../models';
import { LayoutResult } from './LayoutEngine';
import { ChildArranger } from './CompoundArranger';

export declare class CompoundLayoutManager {
    static execute(graph: LogicalGraph, arranger: ChildArranger, measurements: Map<ID, {
        width: number;
        height: number;
    }>): LayoutResult;
    private static getContainerDepths;
}
//# sourceMappingURL=CompoundLayoutManager.d.ts.map