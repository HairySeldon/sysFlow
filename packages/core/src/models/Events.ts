import { ID } from './Entity';
import { EdgeEntity } from './Edge';

export type GraphAction =
  | { type: 'ENTITY_REPARENT'; payload: { entityId: ID; newParentId: ID | null } }
  | { type: 'EDGE_CREATE'; payload: { edge: Omit<EdgeEntity, 'id'>; id?: ID } }
  | { type: 'EDGE_DELETE'; payload: { edgeId: ID } }
  | { type: 'EDGE_REWIRE'; payload: { edgeId: ID; newSourceId?: ID; newTargetId?: ID; newSourcePortId?: ID; newTargetPortId?: ID } }
  | { type: 'CONTAINER_TOGGLE_COLLAPSE'; payload: { containerId: ID; collapsed: boolean } }
  | { type: 'SELECTION_CHANGE'; payload: { selectedIds: ID[] } };
