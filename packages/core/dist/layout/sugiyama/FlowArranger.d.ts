import { ID, LogicalGraph } from '../../models';
import { ChildArranger, ContainerArrangement } from '../CompoundArranger';
import { LayoutOptions } from '../LayoutEngine';

export declare class FlowArranger implements ChildArranger {
    private options;
    constructor(options?: LayoutOptions);
    arrange(_containerId: ID | null, childIds: ID[], graph: LogicalGraph, getItemDim: (id: ID) => {
        width: number;
        height: number;
    }): ContainerArrangement;
    /**
     * Ascends the entity hierarchy to locate the direct child in this scope
     * that owns or is the target entity.
     */
    private resolveToDirectChild;
}
//# sourceMappingURL=FlowArranger.d.ts.map