import { default as React } from 'react';
import { ContainerEntity } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

interface GraphContainerProps {
    container: ContainerEntity;
    layout: NodeLayoutResult;
    selected: boolean;
    isHovered?: boolean;
    onToggleCollapse: (containerId: string, currentCollapsed: boolean) => void;
    onPointerDown: (container: ContainerEntity, e: React.PointerEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: (e: React.MouseEvent) => void;
    customRenderer?: React.ComponentType<{
        container: ContainerEntity;
        selected: boolean;
    }>;
}
export declare const GraphContainer: React.FC<GraphContainerProps>;
export {};
//# sourceMappingURL=GraphContainer.d.ts.map