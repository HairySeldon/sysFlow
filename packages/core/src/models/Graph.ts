import { ID, NodeEntity, ContainerEntity } from './Entity';
import { EdgeEntity } from './Edge';

export interface LogicalGraph {
  version: string;
  nodes: Record<ID, NodeEntity>;
  containers: Record<ID, ContainerEntity>;
  edges: Record<ID, EdgeEntity>;
}
