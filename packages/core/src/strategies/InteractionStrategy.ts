import { ID, NodeEntity, ContainerEntity, EdgeEntity, LogicalGraph, GraphAction } from '../models';

export interface DragContext {
  draggedEntity: NodeEntity | ContainerEntity;
  cursorWorld: { x: number; y: number };
  hoveredEntity: NodeEntity | ContainerEntity | null;
  hoveredEdge: EdgeEntity | null;
  graph: LogicalGraph;
}

export interface InteractionStrategy {
  canDrag?(entity: NodeEntity | ContainerEntity, graph: LogicalGraph): boolean;
  onDragMove?(context: DragContext): { x: number; y: number } | null;
  onDragEnd(context: DragContext): GraphAction | null;
}
