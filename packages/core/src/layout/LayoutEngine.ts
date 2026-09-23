import { ID, LogicalGraph } from '../models';

export interface NodeLayoutResult {
  id: ID;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutResult {
  nodes: Record<ID, NodeLayoutResult>;
  containers: Record<ID, NodeLayoutResult>;
}

export interface LayoutEngine {
  execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>
  ): Promise<LayoutResult>;
  dispose?(): void;
}
