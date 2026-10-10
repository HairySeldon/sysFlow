// packages/core/src/strategies/EdgeRewireStrategy.ts

import { InteractionStrategy, DragContext } from './InteractionStrategy';
import { GraphAction, NodeEntity, ContainerEntity } from '../models';

export class EdgeRewireStrategy implements InteractionStrategy {
  public canDrag(): boolean {
    return true;
  }

  public onDragMove(context: DragContext): { x: number; y: number } | null {
    return context.cursorWorld;
  }

  public onDragEnd(context: DragContext): GraphAction | null {
    const { draggedEntity, hoveredEdge, hoveredEntity, graph } = context;

    // 1. Reparenting: Dropped onto a container
    if (hoveredEntity && graph.containers[hoveredEntity.id]) {
      if (hoveredEntity.id !== draggedEntity.id && draggedEntity.parentId !== hoveredEntity.id) {
        return {
          type: 'ENTITY_REPARENT',
          payload: {
            entityId: draggedEntity.id,
            newParentId: hoveredEntity.id
          }
        };
      }
      return null;
    }

    // 2. Unparenting: Dropped onto empty root canvas while having a parent
    if (!hoveredEntity && !hoveredEdge) {
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

    // Helper to find the best input port on the target
    const findTargetPort = (entity: NodeEntity | ContainerEntity): string => {
      const node = graph.nodes[entity.id] || (entity as NodeEntity);
      if (!node.ports || node.ports.length === 0) return '';

      const incomingEdge = Object.values(graph.edges).find((e) => e.targetId === entity.id);
      if (incomingEdge) {
        const matchingPort = node.ports.find((p) => p.id === incomingEdge.targetPortId);
        if (matchingPort) return matchingPort.id;
      }

      const sourcePortIds = new Set(
        Object.values(graph.edges)
          .filter((e) => e.sourceId === entity.id)
          .map((e) => e.sourcePortId)
      );
      const availableTargetPort = node.ports.find((p) => !sourcePortIds.has(p.id));
      return availableTargetPort ? availableTargetPort.id : node.ports[0].id;
    };

    // 3. Edge Rewire: Spliced directly into hovered edge
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

    // 4. Edge Rewire: Reorder when dropped over an adjacent node
    if (hoveredEntity && hoveredEntity.id !== draggedEntity.id && graph.nodes[hoveredEntity.id]) {
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
