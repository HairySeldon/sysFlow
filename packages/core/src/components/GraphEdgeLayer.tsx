import React from 'react';
import { LogicalGraph, ID, EdgeEntity, ContainerEntity, computeEntityPortLocations } from '../models';
import { LayoutResult } from '../layout/LayoutEngine';

interface GraphEdgeLayerProps {
  graph: LogicalGraph;
  layout: LayoutResult;
  selectedIds: ID[];
  direction?: 'LR' | 'TB';
  showArrows?: boolean;
  onEdgeClick?: (edgeId: ID) => void;
}

export const GraphEdgeLayer: React.FC<GraphEdgeLayerProps> = ({
  graph,
  layout,
  selectedIds,
  direction = 'LR',
  showArrows = true,
  onEdgeClick
}) => {
  const resolveEffectiveEndpoint = (entityId: ID, portId: ID, isSource: boolean) => {
    let currentId: ID | null = entityId;
    let collapsedContainer: ContainerEntity | null = null;

    if (graph.containers[entityId]?.collapsed) {
      collapsedContainer = graph.containers[entityId];
    }

    while (currentId) {
      const parentId: ID | null =
        graph.nodes[currentId]?.parentId ?? graph.containers[currentId]?.parentId ?? null;
      if (parentId && graph.containers[parentId]?.collapsed) {
        collapsedContainer = graph.containers[parentId];
      }
      currentId = parentId;
    }

    if (collapsedContainer) {
      const cLayout = layout.containers[collapsedContainer.id];
      if (!cLayout) return { x: 0, y: 0, valid: false, entityId: collapsedContainer.id, side: 'bottom' as const };

      const x = isSource ? cLayout.x + cLayout.width / 2 : cLayout.x + cLayout.width / 2;
      const y = isSource ? cLayout.y + cLayout.height : cLayout.y;
      return { x, y, valid: true, entityId: collapsedContainer.id, side: (isSource ? 'bottom' : 'top') as const };
    }

    const node = graph.nodes[entityId];
    const nodeLayout = layout.nodes[entityId];

    if (!node || !nodeLayout) {
      return { x: 0, y: 0, valid: false, entityId, side: 'bottom' as const };
    }

    const portLocs = computeEntityPortLocations(node, nodeLayout, direction, graph, layout);
    const loc = portLocs.get(portId);

    if (loc) {
      return { x: loc.worldX, y: loc.worldY, valid: true, entityId, side: loc.side };
    }

    // Fallback if portId is missing
    const fallbackX = isSource ? nodeLayout.x + nodeLayout.width : nodeLayout.x;
    const fallbackY = nodeLayout.y + nodeLayout.height / 2;
    return { x: fallbackX, y: fallbackY, valid: true, entityId, side: (isSource ? 'right' : 'left') as const };
  };

  return (
    <svg className="sysflow-edge-layer">
      <defs>
        <marker
          id="sysflow-arrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--sysflow-edge-stroke)" />
        </marker>
        <marker
          id="sysflow-arrow-selected"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--sysflow-edge-selected)" />
        </marker>
      </defs>

      {Object.values(graph.edges).map((edge: EdgeEntity) => {
        const p0 = resolveEffectiveEndpoint(edge.sourceId, edge.sourcePortId, true);
        const p1 = resolveEffectiveEndpoint(edge.targetId, edge.targetPortId, false);

        if (!p0.valid || !p1.valid) return null;
        if (p0.entityId === p1.entityId) return null;

        const isSelected = selectedIds.includes(edge.id);
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;

        const getControlPoint = (
          p: { x: number; y: number; side?: 'left' | 'right' | 'top' | 'bottom' },
          dist: number,
          isSource: boolean
        ) => {
          const side = p.side || (direction === 'TB' ? (isSource ? 'bottom' : 'top') : (isSource ? 'right' : 'left'));
          switch (side) {
            case 'top':
              return { x: p.x, y: p.y - dist };
            case 'bottom':
              return { x: p.x, y: p.y + dist };
            case 'left':
              return { x: p.x - dist, y: p.y };
            case 'right':
              return { x: p.x + dist, y: p.y };
          }
        };

        const dist = Math.max(30, Math.min(120, Math.hypot(dx, dy) * 0.4));
        const c0 = getControlPoint(p0, dist, true);
        const c1 = getControlPoint(p1, dist, false);
        const pathStr = `M ${p0.x} ${p0.y} C ${c0.x} ${c0.y} ${c1.x} ${c1.y} ${p1.x} ${p1.y}`;

        return (
          <g key={edge.id} style={{ pointerEvents: 'stroke' }}>
            <path
              d={pathStr}
              fill="none"
              stroke="transparent"
              strokeWidth={14}
              onClick={(e) => {
                e.stopPropagation();
                onEdgeClick?.(edge.id);
              }}
              style={{ cursor: 'pointer' }}
            />
            <path
              d={pathStr}
              fill="none"
              stroke={isSelected ? 'var(--sysflow-edge-selected)' : 'var(--sysflow-edge-stroke)'}
              strokeWidth={isSelected ? 2.5 : 1.75}
              markerEnd={
                showArrows
                  ? isSelected
                    ? 'url(#sysflow-arrow-selected)'
                    : 'url(#sysflow-arrow)'
                  : undefined
              }
            />
          </g>
        );
      })}
    </svg>
  );
};
