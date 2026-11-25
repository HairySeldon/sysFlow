import { default as React } from 'react';
import { NodeEntity, ContainerEntity, EdgeEntity, ID, ComputePortOptions } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

export interface GraphNodeProps {
    node: NodeEntity;
    layout: NodeLayoutResult;
    direction?: 'LR' | 'TB' | 'RL' | 'BT';
    edges?: Record<ID, EdgeEntity>;
    selected?: boolean;
    isDrawingEdge?: boolean;
    isDrawingSource?: boolean;
    customRenderer?: React.ComponentType<{
        node: NodeEntity;
        selected: boolean;
    }>;
    portOptions?: ComputePortOptions;
    enableQuickAdd?: boolean;
    onAddConnectedNode?: (node: NodeEntity, portId: ID, side: 'top' | 'bottom' | 'left' | 'right') => void;
    onPointerDown?: (entity: NodeEntity | ContainerEntity, e: React.PointerEvent) => void;
    onMouseEnter?: (entityId: ID) => void;
    onMouseLeave?: (entityId: ID) => void;
    onClick?: (e: React.MouseEvent) => void;
}
export declare const GraphNode: React.FC<GraphNodeProps>;
//# sourceMappingURL=GraphNode.d.ts.map