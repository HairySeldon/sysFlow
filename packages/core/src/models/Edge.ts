import { ID } from './Entity';

export interface EdgeEntity {
  id: ID;
  sourceId: ID;
  sourcePortId: ID;
  targetId: ID;
  targetPortId: ID;
  label?: string;
  data?: Record<string, unknown>;
  className?: string;
}
