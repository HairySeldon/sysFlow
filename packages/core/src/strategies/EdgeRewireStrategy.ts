import { InteractionStrategy, DragContext } from './InteractionStrategy';
import { GraphAction, NodeEntity, ContainerEntity, EdgeEntity, LogicalGraph } from '../models';

export class EdgeRewireStrategy implements InteractionStrategy {
  public onDragEnd(context: DragContext): GraphAction | null {
    const { draggedEntity, hoveredEdge, hoveredEntity, graph } = context;

    // Helper to find the best input port on the target using edge history
    const findTargetPort = (entity: NodeEntity | ContainerEntity): string => {
      const node = graph.nodes[entity.id] || (entity as NodeEntity);
      if (!node.ports || node.ports.length === 0) return '';

      // 1. Check if there's an existing edge targeting this node
      const incomingEdge = Object.values(graph.edges).find((e) => e.targetId === entity.id);
      if (incomingEdge) {
        const matchingPort = node.ports.find((p) => p.id === incomingEdge.targetPortId);
        if (matchingPort) return matchingPort.id;
      }

      // 2. Otherwise pick a port not currently used as a source port
      const sourcePortIds = new Set(
        Object.values(graph.edges)
          .filter((e) => e.sourceId === entity.id)
          .map((e) => e.sourcePortId)
      );
      const availableTargetPort = node.ports.find((p) => !sourcePortIds.has(p.id));

      return availableTargetPort ? availableTargetPort.id : node.ports[0].id;
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
          newTargetPortId: findTargetPort(draggedEntity)
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
            newTargetPortId: findTargetPort(draggedEntity)
          }
        };
      }
    }

    return null;
  }
}
