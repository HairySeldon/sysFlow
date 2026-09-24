import React from 'react';
import { LogicalGraph, ID } from '@sysflow/core';
interface ToolbarProps {
    graph: LogicalGraph;
    selectedIds: ID[];
    direction?: 'LR' | 'TB';
    onToggleDirection?: () => void;
    onAddNode: (label: string, parentId?: string | null) => void;
    onAddContainer: (label: string) => void;
    onDeleteSelected: () => void;
    onUpdateGraph: (graph: LogicalGraph) => void;
    extraActions?: React.ReactNode;
}
export declare const Toolbar: React.FC<ToolbarProps>;
export {};
//# sourceMappingURL=Toolbar.d.ts.map