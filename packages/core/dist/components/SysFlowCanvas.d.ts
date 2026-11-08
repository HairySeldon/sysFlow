import { default as React } from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity, GraphAction } from '../models';
import { LayoutEngine, LayoutOptions } from '../layout/LayoutEngine';
import { InteractionStrategy } from '../strategies/InteractionStrategy';

export interface SysFlowThemeTokens {
    bg?: string;
    grid?: string;
    nodeBg?: string;
    nodeBorder?: string;
    nodeSelected?: string;
    nodeText?: string;
    nodeSubtext?: string;
    containerBg?: string;
    containerHeaderBg?: string;
    containerBorder?: string;
    containerHover?: string;
    edgeStroke?: string;
    edgeSelected?: string;
    portBg?: string;
    portHover?: string;
    panelBg?: string;
    panelBorder?: string;
    panelBtnBg?: string;
    panelBtnHover?: string;
    panelBtnText?: string;
    shadow?: string;
}
export declare function themeTokensToStyle(tokens?: Partial<SysFlowThemeTokens>): React.CSSProperties;
export interface SysFlowHistoryControls {
    undo: () => void;
    redo: () => void;
    copyEntity?: (id: ID) => void;
    cutEntity?: (id: ID) => void;
    pasteEntity?: () => void;
    deleteSelection?: (selectedIds: ID[]) => void;
}
export interface SysFlowCanvasProps {
    graph: LogicalGraph;
    onChange: (action: GraphAction) => void;
    history?: SysFlowHistoryControls;
    enableShortcuts?: boolean;
    onNodeClick?: (nodeId: ID, node: NodeEntity) => void;
    onEdgeClick?: (edgeId: ID) => void;
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
    themeTokens?: Partial<SysFlowThemeTokens>;
    style?: React.CSSProperties;
    enableQuickAdd?: boolean;
    enableEdgeQuickAdd?: boolean;
    onNodeCreate?: (node: Partial<NodeEntity>) => void;
    onEdgeCreate?: (sourceId: ID, targetId: ID, edgeId: ID) => void;
    onNodeDelete?: (nodeId: ID) => void;
    onContainerDelete?: (containerId: ID) => void;
    onEdgeDelete?: (edgeId: ID) => void;
}
export declare const SysFlowCanvas: React.FC<SysFlowCanvasProps>;
//# sourceMappingURL=SysFlowCanvas.d.ts.map