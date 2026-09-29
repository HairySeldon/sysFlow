import { InteractionStrategy, DragContext } from './InteractionStrategy';
import { GraphAction } from '../models';

export declare class ReparentStrategy implements InteractionStrategy {
    canDrag(): boolean;
    onDragMove(context: DragContext): {
        x: number;
        y: number;
    } | null;
    onDragEnd(context: DragContext): GraphAction | null;
}
//# sourceMappingURL=ReparentStrategy.d.ts.map