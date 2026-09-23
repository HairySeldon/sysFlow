import { InteractionStrategy, DragContext } from './InteractionStrategy';
import { GraphAction } from '../models';

export class ReparentStrategy implements InteractionStrategy {
  public canDrag(): boolean {
    return true;
  }

  public onDragMove(context: DragContext): { x: number; y: number } | null {
    return context.cursorWorld;
  }

  public onDragEnd(context: DragContext): GraphAction | null {
    const { draggedEntity, hoveredEntity, graph } = context;

    // Prevent parenting to self or recursive nesting
    if (hoveredEntity && hoveredEntity.id === draggedEntity.id) {
      return null;
    }

    // If dropped over a container
    if (hoveredEntity && graph.containers[hoveredEntity.id]) {
      if (draggedEntity.parentId === hoveredEntity.id) {
        return null; // Snap back to existing parent
      }
      return {
        type: 'ENTITY_REPARENT',
        payload: {
          entityId: draggedEntity.id,
          newParentId: hoveredEntity.id
        }
      };
    }

    // If dropped over empty canvas root
    if (!hoveredEntity) {
      if (draggedEntity.parentId !== null && draggedEntity.parentId !== undefined) {
        return {
          type: 'ENTITY_REPARENT',
          payload: {
            entityId: draggedEntity.id,
            newParentId: null
          }
        };
      }
    }

    return null; // Snap-back
  }
}
