import { LogicalGraph, ID, NodeEntity, ContainerEntity, EdgeEntity, GraphAction } from '../models';

export interface GraphClipboardState {
    entity: NodeEntity | ContainerEntity;
    isCut: boolean;
}
export interface CreateNodeContext {
    sourceNode?: NodeEntity;
    edge?: EdgeEntity;
    direction?: 'LR' | 'TB' | 'RL' | 'BT';
    position?: 'top' | 'bottom' | 'left' | 'right';
    suggestedType?: string;
}
export interface GraphMutationDiff {
    createdNodes: NodeEntity[];
    updatedNodes: NodeEntity[];
    deletedNodes: ID[];
    createdEdges: EdgeEntity[];
    deletedEdges: EdgeEntity[];
}
export interface GraphHistoryOptions {
    createNodeEntity?: (context: CreateNodeContext) => Partial<NodeEntity>;
    canConnect?: (sourceId: ID, targetId: ID, sourcePortId?: ID, targetPortId?: ID) => boolean;
    canDelete?: (entityIds: ID[]) => ID[] | boolean;
    onMutate?: (diff: GraphMutationDiff) => void;
}
export declare function useGraphHistory(initialGraph: LogicalGraph, options?: GraphHistoryOptions): {
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