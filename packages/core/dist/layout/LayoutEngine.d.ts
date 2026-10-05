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
export type FlowDirection = 'LR' | 'TB' | 'RL' | 'BT';
export interface LayoutOptions {
    direction?: FlowDirection;
    mode?: 'flow' | 'concurrent' | 'auto';
    aspectRatio?: number;
    channelSpacing?: number;
}
export interface LayoutEngine {
    execute(graph: LogicalGraph, measurements: Map<ID, {
        width: number;
        height: number;
    }>, options?: LayoutOptions): Promise<LayoutResult>;
    dispose?(): void;
}
//# sourceMappingURL=LayoutEngine.d.ts.map