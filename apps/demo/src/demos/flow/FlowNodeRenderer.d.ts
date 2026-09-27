import React from 'react';
import { NodeEntity } from '@sysflow/core';
interface FlowNodeRendererProps {
    node: NodeEntity;
    selected: boolean;
    onAddConnectedNode?: (currentNode: NodeEntity, position: 'top' | 'bottom') => void;
}
export declare const FlowNodeRenderer: React.FC<FlowNodeRendererProps>;
export {};
//# sourceMappingURL=FlowNodeRenderer.d.ts.map