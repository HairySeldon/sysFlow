import { LogicalGraph, ID, GraphAction } from '@sysflow/core';
export declare function useGraphHistory(initialGraph: LogicalGraph): {
    graph: LogicalGraph;
    setGraphDirect: (next: LogicalGraph) => void;
    applyAction: (action: GraphAction) => void;
    undo: () => void;
    redo: () => void;
    copyEntity: (id: ID) => void;
    cutEntity: (id: ID) => void;
    pasteEntity: () => void;
    deleteSelection: (selectedIds: ID[]) => void;
    canUndo: boolean;
    canRedo: boolean;
};
//# sourceMappingURL=useGraphHistory.d.ts.map