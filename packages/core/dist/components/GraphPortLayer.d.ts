import { default as React } from 'react';
import { NodeEntity, EdgeEntity, ID, ComputePortOptions } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

export interface GraphPortLayerProps {
    entity: NodeEntity;
    layout: NodeLayoutResult;
    direction?: 'LR' | 'TB' | 'RL' | 'BT';
    edges?: Record<ID, EdgeEntity>;
    portOptions?: ComputePortOptions;
    enableQuickAdd?: boolean;
    onAddConnectedNode?: (entity: NodeEntity, portId: ID, side: 'top' | 'bottom' | 'left' | 'right') => void;
}
export declare const GraphPortLayer: React.FC<GraphPortLayerProps>;
//# sourceMappingURL=GraphPortLayer.d.ts.map