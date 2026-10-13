import { ID, LogicalGraph } from '../models';

export interface LocalBox {
    id: ID;
    localX: number;
    localY: number;
    width: number;
    height: number;
}
export interface ContainerArrangement {
    width: number;
    height: number;
    boxes: LocalBox[];
}
export interface ChildArranger {
    arrange(containerId: ID | null, childIds: ID[], graph: LogicalGraph, getItemDim: (id: ID) => {
        width: number;
        height: number;
    }): ContainerArrangement;
}
//# sourceMappingURL=CompoundArranger.d.ts.map