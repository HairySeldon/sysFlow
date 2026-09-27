import React from 'react';
import { LogicalGraph, NodeEntity, ContainerEntity } from '@sysflow/core';
interface InspectorDrawerProps {
    graph: LogicalGraph;
    selectedIds: string[];
    boundFilePath?: string | null;
    initialSourceCode?: string;
    onSaveSource?: (code: string) => Promise<boolean>;
    onClose: () => void;
    onUpdateEntity: (id: string, updates: Partial<NodeEntity | ContainerEntity>, prunedGraph?: LogicalGraph) => void;
}
export declare const InspectorDrawer: React.FC<InspectorDrawerProps>;
export {};
//# sourceMappingURL=InspectorDrawer.d.ts.map