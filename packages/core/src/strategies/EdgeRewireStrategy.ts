import { InteractionStrategy, DragContext } from './InteractionStrategy';
import { GraphAction, NodeEntity, ContainerEntity, EdgeEntity, LogicalGraph } from '../models';

// EdgeRewireStrategy.ts
export class EdgeRewireStrategy implements InteractionStrategy {
  // ...
  public onDragEnd(context: DragContext): GraphAction | null {
    const { draggedEntity, hoveredEdge, hoveredEntity, graph } = context;

    // Helper to find the best input port on the target
    const findTargetPort = (entity: NodeEntity | ContainerEntity): string => {
      const node = graph.nodes[entity.id] || (entity as NodeEntity);
      const inPort = node.ports?.find(p => p.direction === 'in' || p.direction === 'inout');
      return inPort ? inPort.id : node.ports?.[0]?.id || '';
    };

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
          newTargetId: draggedEntity.id,
          newTargetPortId: findTargetPort(draggedEntity) // ✅ Pass matching port
        }
      };
    }

    // 2. Reorder when dropped over an adjacent node
    if (hoveredEntity && hoveredEntity.id !== draggedEntity.id) {
      const incomingEdge = Object.values(graph.edges).find(
        (e) => e.targetId === hoveredEntity.id && e.sourceId !== draggedEntity.id
      );

      if (incomingEdge) {
        return {
          type: 'EDGE_REWIRE',
          payload: {
            edgeId: incomingEdge.id,
            newSourceId: incomingEdge.sourceId,
            newTargetId: draggedEntity.id,
            newTargetPortId: findTargetPort(draggedEntity) // ✅ Pass matching port
          }
        };
      }
    }

    return null;
  }
}
