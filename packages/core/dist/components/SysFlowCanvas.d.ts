import { default as React } from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity, GraphAction } from '../models';
import { LayoutEngine, LayoutOptions } from '../layout/LayoutEngine';
import { InteractionStrategy } from '../strategies/InteractionStrategy';

export interface SysFlowCanvasProps {
    graph: LogicalGraph;
    onChange: (action: GraphAction) => void;
    layoutEngine?: LayoutEngine;
    interactionStrategy?: InteractionStrategy;
    direction?: 'LR' | 'TB' | 'RL' | 'BT';
    layoutOptions?: LayoutOptions;
    showEdgeArrows?: boolean;
    nodeTypes?: Record<string, React.ComponentType<{
        node: NodeEntity;
        selected: boolean;
    }>>;
    containerTypes?: Record<string, React.ComponentType<{
        container: ContainerEntity;
        selected: boolean;
    }>>;
    zoomBounds?: {
        min: number;
        max: number;
    };
    className?: string;
    selectedIds?: ID[];
    portPlacementMode?: 'strict-flow' | 'perimeter-optimized';
    routing?: 'bezier' | 'step' | 'auto';
    theme?: 'dark' | 'light';
}
export declare const SysFlowCanvas: React.FC<SysFlowCanvasProps>;
//# sourceMappingURL=SysFlowCanvas.d.ts.map