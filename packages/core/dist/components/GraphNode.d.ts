import { default as React } from 'react';
import { NodeEntity, ContainerEntity, EdgeEntity, ID, ComputePortOptions } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

export interface GraphNodeProps {
    node: NodeEntity;
    layout: NodeLayoutResult;
    direction?: 'LR' | 'TB';
    edges?: Record<ID, EdgeEntity>;
    selected?: boolean;
    customRenderer?: React.ComponentType<{
        node: NodeEntity;
        selected: boolean;
    }>;
    portOptions?: ComputePortOptions;
    onPointerDown?: (entity: NodeEntity | ContainerEntity, e: React.PointerEvent) => void;
    onMouseEnter?: (entityId: ID) => void;
    onMouseLeave?: (entityId: ID) => void;
    onClick?: (e: React.MouseEvent) => void;
    onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
    onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
}
export declare const GraphNode: React.FC<GraphNodeProps>;
//# sourceMappingURL=GraphNode.d.ts.map