import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement } from '../CompoundArranger';

export declare class ConcurrentArranger implements ChildArranger {
    private targetAspect;
    constructor(targetAspect?: number);
    arrange(_containerId: ID | null, childIds: ID[], _graph: LogicalGraph, getItemDim: (id: ID) => {
        width: number;
        height: number;
    }): ContainerArrangement;
    private findBestTightPacking;
    private simulateSkylinePacking;
}
//# sourceMappingURL=ConcurrentArranger.d.ts.map