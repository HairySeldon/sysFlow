import { ID, NodeEntity } from './Entity';
import { EdgeEntity } from './Edge';
import { LayoutDirection } from './Graph';

export type GraphAction = {
    type: 'ENTITY_REPARENT';
    payload: {
        entityId: ID;
        newParentId: ID | null;
    };
} | {
    type: 'EDGE_CREATE';
    payload: {
        edge: Omit<EdgeEntity, 'id'>;
        id?: ID;
    };
} | {
    type: 'EDGE_DELETE';
    payload: {
        edgeId: ID;
    };
} | {
    type: 'EDGE_REWIRE';
    payload: {
        edgeId: ID;
        newSourceId?: ID;
        newTargetId?: ID;
        newSourcePortId?: ID;
        newTargetPortId?: ID;
    };
} | {
    type: 'CONTAINER_TOGGLE_COLLAPSE';
    payload: {
        containerId: ID;
        collapsed: boolean;
    };
} | {
    type: 'SELECTION_CHANGE';
    payload: {
        selectedIds: ID[];
    };
} | {
    type: 'NODE_ADD_CONNECTED';
    payload: {
        sourceNode: NodeEntity;
        position: 'top' | 'bottom' | 'left' | 'right';
        direction: LayoutDirection;
        suggestedNewNodeId: ID;
        suggestedNewEdgeId: ID;
    };
} | {
    type: 'EDGE_SPLIT_INSERT_NODE';
    payload: {
        edge: EdgeEntity;
        direction: LayoutDirection;
        suggestedNewNodeId: ID;
        suggestedNewEdge1Id: ID;
        suggestedNewEdge2Id: ID;
    };
};
//# sourceMappingURL=Events.d.ts.map