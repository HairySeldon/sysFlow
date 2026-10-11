import { ID, NodeEntity, ContainerEntity, EdgeEntity, LogicalGraph, GraphAction } from '../models';
import { LayoutResult } from '../layout/LayoutEngine';

export interface DragContext {
  draggedEntity: NodeEntity | ContainerEntity;
  cursorWorld: { x: number; y: number };
  startWorldPos: { x: number; y: number };
  hoveredEntity: NodeEntity | ContainerEntity | null;
  hoveredEdge: EdgeEntity | null;
  graph: LogicalGraph;
  layout?: LayoutResult;
}

export interface InteractionStrategy {
  canDrag?(entity: NodeEntity | ContainerEntity, graph: LogicalGraph): boolean;
  onDragMove?(context: DragContext): { x: number; y: number } | null;
  onDragEnd(context: DragContext): GraphAction | null;
}
