import { default as React } from 'react';
import { NodeEntity, EdgeEntity, ID, ComputePortOptions } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

export interface GraphPortLayerProps {
    entity: NodeEntity;
    layout: NodeLayoutResult;
    direction?: 'LR' | 'TB' | 'RL' | 'BT';
    edges?: Record<ID, EdgeEntity>;
    portOptions?: ComputePortOptions;
    onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
    onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
}
export declare const GraphPortLayer: React.FC<GraphPortLayerProps>;
//# sourceMappingURL=GraphPortLayer.d.ts.map