import { useState, useRef, useCallback } from 'react';
import { ID, NodeEntity, ContainerEntity, EdgeEntity, LogicalGraph, GraphAction } from '../models';
import { InteractionStrategy } from '../strategies/InteractionStrategy';
import { LayoutResult } from '../layout/LayoutEngine';

export function useDragGesture(
  graph: LogicalGraph,
  layout: LayoutResult,
  strategy: InteractionStrategy,
  screenToWorld: (x: number, y: number) => { x: number; y: number },
  onChange: (action: GraphAction) => void
) {
  const [dragState, setDragState] = useState<{
    draggedEntity: NodeEntity | ContainerEntity;
    ghostPosition: { x: number; y: number };
  } | null>(null);

  const [hoveredContainerId, setHoveredContainerId] = useState<string | null>(null);
  const activeHoveredEntity = useRef<NodeEntity | ContainerEntity | null>(null);
  const activeHoveredEdge = useRef<EdgeEntity | null>(null);

  // Geometric hit-test to find target container or node under cursor
  const findEntityAtWorld = useCallback(
    (worldPos: { x: number; y: number }, draggedId: string) => {
      // Check containers first (choose deepest/innermost match)
      let matchedContainer: ContainerEntity | null = null;
      let minArea = Infinity;

      for (const [cId, cLayout] of Object.entries(layout.containers)) {
        if (cId === draggedId) continue;
        if (
          worldPos.x >= cLayout.x &&
          worldPos.x <= cLayout.x + cLayout.width &&
          worldPos.y >= cLayout.y &&
          worldPos.y <= cLayout.y + cLayout.height
        ) {
          const area = cLayout.width * cLayout.height;
          if (area < minArea) {
            minArea = area;
            matchedContainer = graph.containers[cId] || null;
          }
        }
      }

      if (matchedContainer) return matchedContainer;

      // Check nodes
      for (const [nId, nLayout] of Object.entries(layout.nodes)) {
        if (nId === draggedId) continue;
        if (
          worldPos.x >= nLayout.x &&
          worldPos.x <= nLayout.x + nLayout.width &&
          worldPos.y >= nLayout.y &&
          worldPos.y <= nLayout.y + nLayout.height
        ) {
          return graph.nodes[nId] || null;
        }
      }

      return null;
    },
    [layout, graph]
  );

  // Geometric edge distance check
  const findEdgeNearWorld = useCallback(
    (worldPos: { x: number; y: number }, draggedId: string) => {
      let closestEdge: EdgeEntity | null = null;
      let minDistance = 45; // 45px threshold

      for (const edge of Object.values(graph.edges)) {
        if (edge.sourceId === draggedId || edge.targetId === draggedId) continue;
        const srcLayout = layout.nodes[edge.sourceId] || layout.containers[edge.sourceId];
        const tgtLayout = layout.nodes[edge.targetId] || layout.containers[edge.targetId];
        if (!srcLayout || !tgtLayout) continue;

        const x0 = srcLayout.x + srcLayout.width;
        const y0 = srcLayout.y + srcLayout.height / 2;
        const x1 = tgtLayout.x;
        const y1 = tgtLayout.y + tgtLayout.height / 2;

        // Sample 10 points along the segment
        for (let step = 0; step <= 10; step++) {
          const t = step / 10;
          const sx = (1 - t) * x0 + t * x1;
          const sy = (1 - t) * y0 + t * y1;
          const dist = Math.hypot(worldPos.x - sx, worldPos.y - sy);
          if (dist < minDistance) {
            minDistance = dist;
            closestEdge = edge;
          }
        }
      }

      return closestEdge;
    },
    [layout, graph]
  );

  const handlePointerDown = useCallback(
    (entity: NodeEntity | ContainerEntity, e: React.PointerEvent) => {
      e.stopPropagation();

      if (strategy.canDrag && !strategy.canDrag(entity, graph)) {
        return;
      }

      const worldPos = screenToWorld(e.clientX, e.clientY);
      setDragState({
        draggedEntity: entity,
        ghostPosition: worldPos
      });
    },
    [graph, strategy, screenToWorld]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      const cursorWorld = screenToWorld(e.clientX, e.clientY);
      const hoveredEntity = findEntityAtWorld(cursorWorld, dragState.draggedEntity.id);
      const hoveredEdge = findEdgeNearWorld(cursorWorld, dragState.draggedEntity.id);

      activeHoveredEntity.current = hoveredEntity;
      activeHoveredEdge.current = hoveredEdge;

      if (hoveredEntity && graph.containers[hoveredEntity.id]) {
        setHoveredContainerId(hoveredEntity.id);
      } else {
        setHoveredContainerId(null);
      }

      const ghostPos = strategy.onDragMove
        ? strategy.onDragMove({
            draggedEntity: dragState.draggedEntity,
            cursorWorld,
            hoveredEntity,
            hoveredEdge,
            graph
          })
        : cursorWorld;

      if (ghostPos) {
        setDragState((prev) => (prev ? { ...prev, ghostPosition: ghostPos } : null));
      }
    },
    [dragState, screenToWorld, strategy, graph, findEntityAtWorld, findEdgeNearWorld]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      const cursorWorld = screenToWorld(e.clientX, e.clientY);
      const hoveredEntity = findEntityAtWorld(cursorWorld, dragState.draggedEntity.id);
      const hoveredEdge = findEdgeNearWorld(cursorWorld, dragState.draggedEntity.id);

      const action = strategy.onDragEnd({
        draggedEntity: dragState.draggedEntity,
        cursorWorld,
        hoveredEntity,
        hoveredEdge,
        graph
      });

      if (action) {
        onChange(action);
      }

      setDragState(null);
      setHoveredContainerId(null);
      activeHoveredEntity.current = null;
      activeHoveredEdge.current = null;
    },
    [dragState, screenToWorld, strategy, graph, findEntityAtWorld, findEdgeNearWorld, onChange]
  );

  return {
    dragState,
    hoveredContainerId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
