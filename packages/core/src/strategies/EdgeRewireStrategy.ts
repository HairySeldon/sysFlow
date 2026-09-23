import { InteractionStrategy, DragContext } from './InteractionStrategy';
import { GraphAction, NodeEntity, ContainerEntity, EdgeEntity, LogicalGraph } from '../models';

export class EdgeRewireStrategy implements InteractionStrategy {
  public canDrag(entity: NodeEntity | ContainerEntity, graph: LogicalGraph): boolean {
    return true;
  }

  public onDragMove(context: DragContext): { x: number; y: number } | null {
    return context.cursorWorld;
  }

  public onDragEnd(context: DragContext): GraphAction | null {
    const { draggedEntity, hoveredEdge, hoveredEntity, graph } = context;

    // 1. Splice directly into hovered edge
    if (hoveredEdge) {
      if (hoveredEdge.sourceId === draggedEntity.id || hoveredEdge.targetId === draggedEntity.id) {
        return null;
      }

      return {
        type: 'EDGE_REWIRE',
        payload: {
          edgeId: hoveredEdge.id,
          newSourceId: hoveredEdge.sourceId,
          newTargetId: draggedEntity.id
        }
      };
    }

    // 2. Reorder when dropped over an adjacent node
    if (hoveredEntity && hoveredEntity.id !== draggedEntity.id) {
      // Find edge pointing into hoveredEntity to splice ahead of it
      const incomingEdge = Object.values(graph.edges).find(
        (e) => e.targetId === hoveredEntity.id && e.sourceId !== draggedEntity.id
      );

      if (incomingEdge) {
        return {
          type: 'EDGE_REWIRE',
          payload: {
            edgeId: incomingEdge.id,
            newSourceId: incomingEdge.sourceId,
            newTargetId: draggedEntity.id
          }
        };
      }
    }

    return null;
  }
}
