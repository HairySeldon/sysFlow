import React from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity } from '@sysflow/core';
interface InspectorDrawerProps {
    graph: LogicalGraph;
    selectedIds: ID[];
    onClose: () => void;
    onUpdateEntity: (id: string, updates: Partial<NodeEntity | ContainerEntity>) => void;
}
export declare const InspectorDrawer: React.FC<InspectorDrawerProps>;
export {};
//# sourceMappingURL=InspectorDrawer.d.ts.map