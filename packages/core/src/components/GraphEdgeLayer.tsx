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
  // Resolve an entity to its outermost collapsed ancestor if it or its parent is collapsed
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
      if (!cLayout) return { x: 0, y: 0, valid: false, entityId: collapsedContainer.id };

      const x = isSource ? cLayout.x + cLayout.width : cLayout.x;
      const y = cLayout.y + cLayout.height / 2;
      return { x, y, valid: true, entityId: collapsedContainer.id };
    }

    const isContainer = Boolean(graph.containers[entityId]);

    if (isContainer) {
      const cLayout = layout.containers[entityId];
      if (!cLayout) return { x: 0, y: 0, valid: false, entityId };

      let x: number;
      let y: number;
      if (direction === 'TB') {
        x = cLayout.x + cLayout.width / 2;
        y = isSource ? cLayout.y + cLayout.height : cLayout.y;
      } else {
        x = isSource ? cLayout.x + cLayout.width : cLayout.x;
        y = cLayout.y + cLayout.height / 2;
      }
      return { x, y, valid: true, entityId };
    }

    // Nodes have ports:
    const node = graph.nodes[entityId];
    const nLayout = layout.nodes[entityId];

    if (!node || !nLayout) {
      return { x: 0, y: 0, valid: false, entityId };
    }

    const portLocs = computeEntityPortLocations(node, nLayout, direction, graph.edges);
    const loc = portLocs.get(portId);

    if (loc) {
      return { x: loc.worldX, y: loc.worldY, valid: true, entityId };
    }

    // Fallback if portId is missing on node
    let fallbackX: number;
    let fallbackY: number;
    if (direction === 'TB') {
      fallbackX = nLayout.x + nLayout.width / 2;
      fallbackY = isSource ? nLayout.y + nLayout.height : nLayout.y;
    } else {
      fallbackX = isSource ? nLayout.x + nLayout.width : nLayout.x;
      fallbackY = nLayout.y + nLayout.height / 2;
    }
    return { x: fallbackX, y: fallbackY, valid: true, entityId };
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

        // If both endpoints collapse into the exact same container, hide the internal edge
        if (p0.entityId === p1.entityId) return null;

        const isSelected = selectedIds.includes(edge.id);
        const deltaX = p1.x - p0.x;
        const deltaY = p1.y - p0.y;

        let pathStr: string;
        if (direction === 'TB') {
          // Vertical Tree Flow (Top to Bottom)
          if (p1.y >= p0.y) {
            const c0x = p0.x;
            const c0y = p0.y + Math.max(30, 0.5 * deltaY);
            const c1x = p1.x;
            const c1y = p1.y - Math.max(30, 0.5 * deltaY);
            pathStr = `M ${p0.x} ${p0.y} C ${c0x} ${c0y} ${c1x} ${c1y} ${p1.x} ${p1.y}`;
          } else {
            // Feedback loop around the side
            const c0x = p0.x + 80;
            const c0y = p0.y + 40;
            const c1x = p1.x + 80;
            const c1y = p1.y - 40;
            pathStr = `M ${p0.x} ${p0.y} C ${c0x} ${c0y} ${c1x} ${c1y} ${p1.x} ${p1.y}`;
          }
        } else {
          // Horizontal Pipeline Flow (Left to Right)
          if (p1.x >= p0.x) {
            const c0x = p0.x + Math.max(40, 0.5 * deltaX);
            const c0y = p0.y;
            const c1x = p1.x - Math.max(40, 0.5 * deltaX);
            const c1y = p1.y;
            pathStr = `M ${p0.x} ${p0.y} C ${c0x} ${c0y} ${c1x} ${c1y} ${p1.x} ${p1.y}`;
          } else {
            // Feedback / loop back over top
            const c0x = p0.x + 60;
            const c0y = p0.y - 80;
            const c1x = p1.x - 60;
            const c1y = p1.y - 80;
            pathStr = `M ${p0.x} ${p0.y} C ${c0x} ${c0y} ${c1x} ${c1y} ${p1.x} ${p1.y}`;
          }
        }

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
