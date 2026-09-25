// packages/core/src/layout/LayoutEngine.ts

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

export interface LayoutOptions {
  direction?: 'LR' | 'TB';
  /**
   * 'flow' for sequential DAGs/trees (median-centered hierarchy)
   * 'concurrent' for modular/nested CAD architectures (aspect-ratio multi-row packing)
   * 'auto' chooses based on graph topology (presence of deep containment vs pure edge flow)
   */
  mode?: 'flow' | 'concurrent' | 'auto';
  /** Target width/height ratio for concurrent packing (defaults to 16/9 ~ 1.77) */
  aspectRatio?: number;
}

export interface LayoutEngine {
  execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>,
    options?: LayoutOptions
  ): Promise<LayoutResult>;
  dispose?(): void;
}
