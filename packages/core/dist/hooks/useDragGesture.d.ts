import { NodeEntity, ContainerEntity, LogicalGraph, GraphAction } from '../models';
import { InteractionStrategy } from '../strategies/InteractionStrategy';
import { LayoutResult } from '../layout/LayoutEngine';

export declare function useDragGesture(graph: LogicalGraph, layout: LayoutResult, strategy: InteractionStrategy, screenToWorld: (x: number, y: number) => {
    x: number;
    y: number;
}, onChange: (action: GraphAction) => void): {
    dragState: {
        draggedEntity: NodeEntity | ContainerEntity;
        ghostPosition: {
            x: number;
            y: number;
        };
    } | null;
    hoveredContainerId: string | null;
    handlePointerDown: (entity: NodeEntity | ContainerEntity, e: React.PointerEvent) => void;
    handlePointerMove: (e: React.PointerEvent) => void;
    handlePointerUp: (e: React.PointerEvent) => void;
};
//# sourceMappingURL=useDragGesture.d.ts.map