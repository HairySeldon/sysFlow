import { default as React } from 'react';
import { LogicalGraph, ID, ComputePortOptions } from '../models';
import { LayoutResult } from '../layout/LayoutEngine';

interface GraphEdgeLayerProps {
    graph: LogicalGraph;
    layout: LayoutResult;
    selectedIds: ID[];
    direction?: 'LR' | 'TB' | 'RL' | 'BT';
    showArrows?: boolean;
    routing?: 'bezier' | 'step' | 'auto';
    portOptions?: ComputePortOptions;
    onEdgeClick?: (edgeId: ID) => void;
}
export declare const GraphEdgeLayer: React.FC<GraphEdgeLayerProps>;
export {};
//# sourceMappingURL=GraphEdgeLayer.d.ts.map