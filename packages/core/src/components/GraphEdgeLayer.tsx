import React, { useState } from 'react';
import {
  LogicalGraph,
  ID,
  EdgeEntity,
  ContainerEntity,
  computeEntityPortLocations,
  ComputePortOptions
} from '../models';
import { LayoutResult } from '../layout/LayoutEngine';

interface GraphEdgeLayerProps {
  graph: LogicalGraph;
  layout: LayoutResult;
  selectedIds: ID[];
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  showArrows?: boolean;
  routing?: 'bezier' | 'step' | 'auto';
  portOptions?: ComputePortOptions;
  enableEdgeQuickAdd?: boolean;
  onEdgeClick?: (edgeId: ID) => void;
  onInsertNodeOnEdge?: (edge: EdgeEntity) => void;
}

interface EndpointResult {
  x: number;
  y: number;
  side: 'left' | 'right' | 'top' | 'bottom';
  valid: boolean;
  entityId: ID;
}

interface PathCalculationResult {
  pathStr: string;
  center: { x: number; y: number };
}

export const GraphEdgeLayer: React.FC<GraphEdgeLayerProps> = ({
  graph,
  layout,
  selectedIds,
  direction = 'TB',
  showArrows = true,
  routing = 'auto',
  portOptions,
  enableEdgeQuickAdd = true,
  onEdgeClick,
  onInsertNodeOnEdge
}) => {
  const [hoveredEdgeId, setHoveredEdgeId] = useState<ID | null>(null);

  const isOrthogonal =
    routing === 'step' ||
    (routing === 'auto' && (direction === 'LR' || direction === 'RL'));

  const resolveEffectiveEndpoint = (
    entityId: ID,
    portId: ID,
    isSource: boolean
  ): EndpointResult => {
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
      if (!cLayout) {
        return { x: 0, y: 0, side: isSource ? 'right' : 'left', valid: false, entityId: collapsedContainer.id };
      }

      let defaultSide: 'left' | 'right' | 'top' | 'bottom';
      let x: number;
      let y: number;

      if (direction === 'TB') {
        defaultSide = isSource ? 'bottom' : 'top';
        x = cLayout.x + cLayout.width / 2;
        y = isSource ? cLayout.y + cLayout.height : cLayout.y;
      } else if (direction === 'BT') {
        defaultSide = isSource ? 'top' : 'bottom';
        x = cLayout.x + cLayout.width / 2;
        y = isSource ? cLayout.y : cLayout.y + cLayout.height;
      } else if (direction === 'RL') {
        defaultSide = isSource ? 'left' : 'right';
        x = isSource ? cLayout.x : cLayout.x + cLayout.width;
        y = cLayout.y + cLayout.height / 2;
      } else {
        defaultSide = isSource ? 'right' : 'left';
        x = isSource ? cLayout.x + cLayout.width : cLayout.x;
        y = cLayout.y + cLayout.height / 2;
      }

      return { x, y, side: defaultSide, valid: true, entityId: collapsedContainer.id };
    }

    const isContainer = Boolean(graph.containers[entityId]);
    if (isContainer) {
      const cLayout = layout.containers[entityId];
      if (!cLayout) return { x: 0, y: 0, side: isSource ? 'right' : 'left', valid: false, entityId };

      let x: number;
      let y: number;
      let side: 'left' | 'right' | 'top' | 'bottom';

      if (direction === 'TB') {
        x = cLayout.x + cLayout.width / 2;
        y = isSource ? cLayout.y + cLayout.height : cLayout.y;
        side = isSource ? 'bottom' : 'top';
      } else if (direction === 'BT') {
        x = cLayout.x + cLayout.width / 2;
        y = isSource ? cLayout.y : cLayout.y + cLayout.height;
        side = isSource ? 'top' : 'bottom';
      } else if (direction === 'RL') {
        x = isSource ? cLayout.x : cLayout.x + cLayout.width;
        y = cLayout.y + cLayout.height / 2;
        side = isSource ? 'left' : 'right';
      } else {
        x = isSource ? cLayout.x + cLayout.width : cLayout.x;
        y = cLayout.y + cLayout.height / 2;
        side = isSource ? 'right' : 'left';
      }
      return { x, y, side, valid: true, entityId };
    }

    const node = graph.nodes[entityId];
    const nLayout = layout.nodes[entityId];

    if (!node || !nLayout) {
      return { x: 0, y: 0, side: isSource ? 'right' : 'left', valid: false, entityId };
    }

    const portLocs = computeEntityPortLocations(
      node,
      nLayout,
      direction,
      graph.edges,
      portOptions
    );
    const loc = portLocs.get(portId);

    if (loc) {
      return { x: loc.worldX, y: loc.worldY, side: loc.side, valid: true, entityId };
    }

    let fallbackX: number;
    let fallbackY: number;
    let fallbackSide: 'left' | 'right' | 'top' | 'bottom';

    if (direction === 'TB') {
      fallbackX = nLayout.x + nLayout.width / 2;
      fallbackY = isSource ? nLayout.y + nLayout.height : nLayout.y;
      fallbackSide = isSource ? 'bottom' : 'top';
    } else if (direction === 'BT') {
      fallbackX = nLayout.x + nLayout.width / 2;
      fallbackY = isSource ? nLayout.y : nLayout.y + nLayout.height;
      fallbackSide = isSource ? 'top' : 'bottom';
    } else if (direction === 'RL') {
      fallbackX = isSource ? nLayout.x : nLayout.x + nLayout.width;
      fallbackY = nLayout.y + nLayout.height / 2;
      fallbackSide = isSource ? 'left' : 'right';
    } else {
      fallbackX = isSource ? nLayout.x + nLayout.width : nLayout.x;
      fallbackY = nLayout.y + nLayout.height / 2;
      fallbackSide = isSource ? 'right' : 'left';
    }
    return { x: fallbackX, y: fallbackY, side: fallbackSide, valid: true, entityId };
  };

  const calculateStepPath = (p0: EndpointResult, p1: EndpointResult): PathCalculationResult => {
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;

    if (p0.side === 'right' && p1.side === 'left') {
      if (p1.x >= p0.x + 20) {
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${midX} ${p0.y} L ${midX} ${p1.y} L ${p1.x} ${p1.y}`,
          center: { x: midX, y: midY }
        };
      } else {
        const yOffset = p1.y >= p0.y ? p0.y - 40 : p0.y + 40;
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${p0.x + 20} ${p0.y} L ${p0.x + 20} ${yOffset} L ${p1.x - 20} ${yOffset} L ${p1.x - 20} ${p1.y} L ${p1.x} ${p1.y}`,
          center: { x: midX, y: yOffset }
        };
      }
    }

    if (p0.side === 'left' && p1.side === 'right') {
      if (p1.x <= p0.x - 20) {
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${midX} ${p0.y} L ${midX} ${p1.y} L ${p1.x} ${p1.y}`,
          center: { x: midX, y: midY }
        };
      } else {
        const yOffset = p1.y >= p0.y ? p0.y - 40 : p0.y + 40;
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${p0.x - 20} ${p0.y} L ${p0.x - 20} ${yOffset} L ${p1.x + 20} ${yOffset} L ${p1.x + 20} ${p1.y} L ${p1.x} ${p1.y}`,
          center: { x: midX, y: yOffset }
        };
      }
    }

    if (p0.side === 'bottom' && p1.side === 'top') {
      if (p1.y >= p0.y + 16) {
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${p0.x} ${midY} L ${p1.x} ${midY} L ${p1.x} ${p1.y}`,
          center: { x: midX, y: midY }
        };
      } else {
        const xOffset = p1.x >= p0.x ? p0.x + 50 : p0.x - 50;
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${p0.x} ${p0.y + 20} L ${xOffset} ${p0.y + 20} L ${xOffset} ${p1.y - 20} L ${p1.x} ${p1.y - 20} L ${p1.x} ${p1.y}`,
          center: { x: xOffset, y: midY }
        };
      }
    }

    if (p0.side === 'top' && p1.side === 'bottom') {
      if (p1.y <= p0.y - 16) {
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${p0.x} ${midY} L ${p1.x} ${midY} L ${p1.x} ${p1.y}`,
          center: { x: midX, y: midY }
        };
      } else {
        const xOffset = p1.x >= p0.x ? p0.x + 50 : p0.x - 50;
        return {
          pathStr: `M ${p0.x} ${p0.y} L ${p0.x} ${p0.y - 20} L ${xOffset} ${p0.y - 20} L ${xOffset} ${p1.y + 20} L ${p1.x} ${p1.y + 20} L ${p1.x} ${p1.y}`,
          center: { x: xOffset, y: midY }
        };
      }
    }

    return {
      pathStr: `M ${p0.x} ${p0.y} L ${midX} ${p0.y} L ${midX} ${p1.y} L ${p1.x} ${p1.y}`,
      center: { x: midX, y: midY }
    };
  };

  const calculateBezierPath = (p0: EndpointResult, p1: EndpointResult): PathCalculationResult => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;

    let cx0 = p0.x;
    let cy0 = p0.y;
    let cx1 = p1.x;
    let cy1 = p1.y;

    if (p0.side === 'bottom' && p1.side === 'top') {
      if (dy > 0) {
        const verticalDrop = Math.min(28, dy * 0.4);
        cy0 = p0.y + Math.max(verticalDrop, dy * 0.5);
        cy1 = p1.y - Math.max(verticalDrop, dy * 0.5);
      } else {
        const loopSide = dx >= 0 ? 1 : -1;
        const clearanceX = Math.max(40, Math.abs(dx) * 0.2);
        cx0 = p0.x + clearanceX * loopSide;
        cy0 = p0.y + 40;
        cx1 = p1.x + clearanceX * loopSide;
        cy1 = p1.y - 40;
      }
    } else if (p0.side === 'top' && p1.side === 'bottom') {
      if (dy < 0) {
        const verticalRise = Math.min(28, Math.abs(dy) * 0.4);
        cy0 = p0.y - Math.max(verticalRise, Math.abs(dy) * 0.5);
        cy1 = p1.y + Math.max(verticalRise, Math.abs(dy) * 0.5);
      } else {
        const loopSide = dx >= 0 ? 1 : -1;
        const clearanceX = Math.max(40, Math.abs(dx) * 0.2);
        cx0 = p0.x + clearanceX * loopSide;
        cy0 = p0.y - 40;
        cx1 = p1.x + clearanceX * loopSide;
        cy1 = p1.y + 40;
      }
    } else if (p0.side === 'right' && p1.side === 'left') {
      if (dx > 0) {
        cx0 = p0.x + dx * 0.5;
        cx1 = p1.x - dx * 0.5;
      } else {
        cx0 = p0.x + 50;
        cy0 = p0.y - 50;
        cx1 = p1.x - 50;
        cy1 = p1.y - 50;
      }
    } else if (p0.side === 'left' && p1.side === 'right') {
      if (dx < 0) {
        cx0 = p0.x + dx * 0.5;
        cx1 = p1.x - dx * 0.5;
      } else {
        cx0 = p0.x - 50;
        cy0 = p0.y - 50;
        cx1 = p1.x + 50;
        cy1 = p1.y - 50;
      }
    } else {
      const normalMap: Record<string, { x: number; y: number }> = {
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
        top: { x: 0, y: -1 },
        bottom: { x: 0, y: 1 }
      };
      const n0 = normalMap[p0.side] || { x: 0, y: 1 };
      const n1 = normalMap[p1.side] || { x: 0, y: -1 };
      const clearance = Math.min(60, Math.hypot(dx, dy) * 0.35);

      cx0 = p0.x + n0.x * clearance;
      cy0 = p0.y + n0.y * clearance;
      cx1 = p1.x + n1.x * clearance;
      cy1 = p1.y + n1.y * clearance;
    }

    // Exact Bézier Midpoint (t = 0.5): B(0.5) = (p0 + 3*c0 + 3*c1 + p1) / 8
    const midX = 0.125 * p0.x + 0.375 * cx0 + 0.375 * cx1 + 0.125 * p1.x;
    const midY = 0.125 * p0.y + 0.375 * cy0 + 0.375 * cy1 + 0.125 * p1.y;

    return {
      pathStr: `M ${p0.x} ${p0.y} C ${cx0} ${cy0} ${cx1} ${cy1} ${p1.x} ${p1.y}`,
      center: { x: midX, y: midY }
    };
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
        const isHovered = hoveredEdgeId === edge.id;
        const { pathStr, center } = isOrthogonal ? calculateStepPath(p0, p1) : calculateBezierPath(p0, p1);

        return (
          <g
            key={edge.id}
            onMouseEnter={() => setHoveredEdgeId(edge.id)}
            onMouseLeave={() => setHoveredEdgeId(null)}
          >
            {/* Wide invisible hit area */}
            <path
              d={pathStr}
              fill="none"
              stroke="transparent"
              strokeWidth={24}
              style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
              onClick={(e) => {
                e.stopPropagation();
                onEdgeClick?.(edge.id);
              }}
            />

            {/* Visible edge line */}
            <path
              d={pathStr}
              fill="none"
              stroke={
                isSelected
                  ? 'var(--sysflow-edge-selected)'
                  : isHovered
                  ? 'var(--sysflow-edge-hover, #38bdf8)'
                  : 'var(--sysflow-edge-stroke)'
              }
              strokeWidth={isSelected ? 2.5 : isHovered ? 2.25 : 1.75}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ pointerEvents: 'none' }}
              markerEnd={
                showArrows
                  ? isSelected
                    ? 'url(#sysflow-arrow-selected)'
                    : 'url(#sysflow-arrow)'
                  : undefined
              }
            />

            {/* Centered Quick-Add (+) Button on Edge Hover */}
            {enableEdgeQuickAdd && isHovered && onInsertNodeOnEdge && (
              <g transform={`translate(${center.x}, ${center.y})`}>
                <g
                  className="sysflow-edge-quick-add"
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onInsertNodeOnEdge(edge);
                  }}
                >
                  {/* Outer invisible hit-pad to prevent hover loss */}
                  <circle r={16} fill="transparent" />
                  {/* Button background circle */}
                  <circle
                    r={10}
                    className="sysflow-edge-add-circle"
                    fill="#0ea5e9"
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                  {/* Plus glyph */}
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#ffffff"
                    fontSize={14}
                    fontWeight="bold"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    +
                  </text>
                </g>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};
