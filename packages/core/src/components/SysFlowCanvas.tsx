import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity, GraphAction, computeEntityPortLocations } from '../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../layout/LayoutEngine';
import { WorkerBridge } from '../layout/worker/WorkerBridge';
import { InteractionStrategy } from '../strategies/InteractionStrategy';
import { ReparentStrategy } from '../strategies/ReparentStrategy';
import { useCanvasTransform } from '../hooks/useCanvasTransform';
import { useMeasurement } from '../hooks/useMeasurement';
import { useDragGesture } from '../hooks/useDragGesture';
import { MeasureLayer } from './MeasureLayer';
import { GraphEdgeLayer } from './GraphEdgeLayer';
import { GraphNode } from './GraphNode';
import { GraphContainer } from './GraphContainer';

export interface SysFlowCanvasProps {
  graph: LogicalGraph;
  onChange: (action: GraphAction) => void;
  layoutEngine?: LayoutEngine;
  interactionStrategy?: InteractionStrategy;
  direction?: 'LR' | 'TB';
  layoutOptions?: LayoutOptions; // <-- NEW
  showEdgeArrows?: boolean;
  nodeTypes?: Record<string, React.ComponentType<{ node: NodeEntity; selected: boolean }>>;
  containerTypes?: Record<string, React.ComponentType<{ container: ContainerEntity; selected: boolean }>>;
  zoomBounds?: { min: number; max: number };
  className?: string;
  selectedIds?: ID[];
}

const DEFAULT_STRATEGY = new ReparentStrategy();

export const SysFlowCanvas: React.FC<SysFlowCanvasProps> = ({
  graph,
  onChange,
  layoutEngine,
  interactionStrategy = DEFAULT_STRATEGY,
  direction = 'TB',
  layoutOptions,
  showEdgeArrows = true,
  nodeTypes,
  containerTypes,
  zoomBounds,
  className = '',
  selectedIds = []
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const internalEngineRef = useRef<LayoutEngine | null>(null);

  if (!layoutEngine && !internalEngineRef.current) {
    internalEngineRef.current = new WorkerBridge();
  }
  const activeEngine = layoutEngine || internalEngineRef.current!;

  const {
    transform,
    screenToWorld,
    onWheel,
    startPan,
    updatePan,
    endPan,
    resetTransform,
    zoomIn,
    zoomOut,
    zoomToFit,
    isPanning
  } = useCanvasTransform(containerRef, zoomBounds);

  const { measurements, registerMeasureElement } = useMeasurement(graph);
  const [layout, setLayout] = useState<LayoutResult>({ nodes: {}, containers: {} });

  // Active wire-drawing state (drag from source port to target port)
  const [activeWire, setActiveWire] = useState<{
    sourceId: ID;
    sourcePortId: ID;
    startWorldPos: { x: number; y: number };
    currentWorldPos: { x: number; y: number };
  } | null>(null);

  // Marquee box-selection state in world coordinates
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const isSpacePressedRef = useRef(false);

  const {
    dragState,
    hoveredContainerId,
    handlePointerDown: onEntityPointerDown,
    handlePointerMove: onEntityPointerMove,
    handlePointerUp: onEntityPointerUp
  } = useDragGesture(graph, layout, interactionStrategy, screenToWorld, onChange);

  // Keyboard Navigation: Tab, Arrow keys, 'F' (zoom-to-fit), Ctrl+A (select all)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }

      // 'F' Key: Zoom to fit
      if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        zoomToFit(layout);
        return;
      }

      // Ctrl+A / Cmd+A: Select all nodes
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const allIds = [
          ...Object.keys(graph.nodes),
          ...Object.keys(graph.containers)
        ];
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: allIds } });
        return;
      }

      const nodeIds = Object.keys(graph.nodes);
      if (nodeIds.length === 0) return;

      // Tab / Shift+Tab: Cycle through nodes
      if (e.key === 'Tab') {
        e.preventDefault();
        const currentIdx = selectedIds.length > 0 ? nodeIds.indexOf(selectedIds[0]) : -1;
        let nextIdx: number;
        if (e.shiftKey) {
          nextIdx = currentIdx <= 0 ? nodeIds.length - 1 : currentIdx - 1;
        } else {
          nextIdx = (currentIdx + 1) % nodeIds.length;
        }
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [nodeIds[nextIdx]] } });
        return;
      }

      // Arrow Key Spatial Navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const currentId = selectedIds[0] || nodeIds[0];
        const currentPos = layout.nodes[currentId] || layout.containers[currentId];
        if (!currentPos) return;

        const currentCenter = {
          x: currentPos.x + currentPos.width / 2,
          y: currentPos.y + currentPos.height / 2
        };

        let bestCandidateId: ID | null = null;
        let minDistance = Infinity;

        for (const id of nodeIds) {
          if (id === currentId) continue;
          const targetPos = layout.nodes[id];
          if (!targetPos) continue;

          const targetCenter = {
            x: targetPos.x + targetPos.width / 2,
            y: targetPos.y + targetPos.height / 2
          };

          const dx = targetCenter.x - currentCenter.x;
          const dy = targetCenter.y - currentCenter.y;

          // Check if candidate lies in directional quadrant
          let isInDirection = false;
          if (e.key === 'ArrowRight' && dx > 20) isInDirection = true;
          if (e.key === 'ArrowLeft' && dx < -20) isInDirection = true;
          if (e.key === 'ArrowDown' && dy > 20) isInDirection = true;
          if (e.key === 'ArrowUp' && dy < -20) isInDirection = true;

          if (isInDirection) {
            const distance = Math.hypot(dx, dy);
            if (distance < minDistance) {
              minDistance = distance;
              bestCandidateId = id;
            }
          }
        }

        if (bestCandidateId) {
          onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [bestCandidateId] } });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [graph, layout, selectedIds, zoomToFit, onChange]);

  // Layout resolution
  useEffect(() => {
    let cancelled = false;

    // Detect actual container aspect ratio from the DOM
    let dynamicAspect = 16 / 9;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        dynamicAspect = rect.width / rect.height;
      }
    }

    const options: LayoutOptions = {
      direction,
      aspectRatio: dynamicAspect,
      ...layoutOptions
    };

    activeEngine.execute(graph, measurements, options).then((computed) => {
      if (!cancelled) {
        setLayout(computed);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [graph, measurements, activeEngine, direction, layoutOptions]);

  // Port wiring handlers
  const handlePortPointerDown = (
    entityId: string,
    portId: string,
    isSource: boolean,
    e: React.PointerEvent
  ) => {
    const entity = graph.nodes[entityId] || graph.containers[entityId];
    const itemLayout = layout.nodes[entityId] || layout.containers[entityId];
    if (!entity || !itemLayout) return;

    const portLocs = computeEntityPortLocations(entity, itemLayout, direction);
    const loc = portLocs.get(portId);

    const startPos = loc
      ? { x: loc.worldX, y: loc.worldY }
      : { x: itemLayout.x + itemLayout.width, y: itemLayout.y + itemLayout.height / 2 };

    setActiveWire({
      sourceId: entityId,
      sourcePortId: portId,
      startWorldPos: startPos,
      currentWorldPos: screenToWorld(e.clientX, e.clientY)
    });
  };

  const handlePortPointerUp = (entityId: string, portId: string, isSource: boolean) => {
    if (activeWire && !isSource) {
      if (activeWire.sourceId !== entityId) {
        onChange({
          type: 'EDGE_CREATE',
          payload: {
            edge: {
              sourceId: activeWire.sourceId,
              sourcePortId: activeWire.sourcePortId,
              targetId: entityId,
              targetPortId: portId
            }
          }
        });
      }
    }
    setActiveWire(null);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Pan canvas if middle mouse or spacebar held
    if (e.button === 1 || isSpacePressedRef.current) {
      startPan(e.clientX, e.clientY);
      return;
    }

    // Left click on empty canvas starts marquee selection
    if (e.button === 0 && (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg')) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMarqueeBox({
        startX: worldPos.x,
        startY: worldPos.y,
        currentX: worldPos.x,
        currentY: worldPos.y
      });
      onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
      updatePan(e.clientX, e.clientY);
    } else if (marqueeBox) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMarqueeBox((prev) => (prev ? { ...prev, currentX: worldPos.x, currentY: worldPos.y } : null));
    } else if (dragState) {
      onEntityPointerMove(e);
    } else if (activeWire) {
      setActiveWire((prev) =>
        prev ? { ...prev, currentWorldPos: screenToWorld(e.clientX, e.clientY) } : null
      );
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (isPanning.current) {
      endPan();
    }

    // Commit Marquee Selection
    if (marqueeBox) {
      const boxLeft = Math.min(marqueeBox.startX, marqueeBox.currentX);
      const boxTop = Math.min(marqueeBox.startY, marqueeBox.currentY);
      const boxRight = Math.max(marqueeBox.startX, marqueeBox.currentX);
      const boxBottom = Math.max(marqueeBox.startY, marqueeBox.currentY);

      // Only perform box selection if drag moved more than 4px
      if (boxRight - boxLeft > 4 || boxBottom - boxTop > 4) {
        const selected: ID[] = [];

        // Check node intersections
        for (const [id, nLayout] of Object.entries(layout.nodes)) {
          if (
            nLayout.x < boxRight &&
            nLayout.x + nLayout.width > boxLeft &&
            nLayout.y < boxBottom &&
            nLayout.y + nLayout.height > boxTop
          ) {
            selected.push(id);
          }
        }

        // Check container intersections
        for (const [id, cLayout] of Object.entries(layout.containers)) {
          if (
            cLayout.x < boxRight &&
            cLayout.x + cLayout.width > boxLeft &&
            cLayout.y < boxBottom &&
            cLayout.y + cLayout.height > boxTop
          ) {
            selected.push(id);
          }
        }

        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: selected } });
      }

      setMarqueeBox(null);
    }

    if (dragState) {
      onEntityPointerUp(e);
    }
    if (activeWire) {
      setActiveWire(null);
    }
  };

  const containersList = Object.values(graph.containers) as ContainerEntity[];
  const nodesList = Object.values(graph.nodes) as NodeEntity[];

  return (
    <div
      ref={containerRef}
      className={`sysflow-canvas ${className}`}
      onWheel={onWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <MeasureLayer
        graph={graph}
        registerMeasureElement={registerMeasureElement}
        nodeTypes={nodeTypes}
        containerTypes={containerTypes}
      />

      {/* Floating Canvas Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 50,
          display: 'flex',
          gap: 6,
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '6px 10px',
          borderRadius: 8,
          border: '1px solid #334155'
        }}
      >
        <button onClick={zoomIn} style={btnStyle} title="Zoom In (+)">
          +
        </button>
        <button onClick={zoomOut} style={btnStyle} title="Zoom Out (-)">
          −
        </button>
        <button onClick={resetTransform} style={btnStyle} title="Reset Zoom (0)">
          {Math.round(transform.zoom * 100)}%
        </button>
      </div>

      <div
        className="sysflow-viewport"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`
        }}
      >

        {/* Marquee Selection Rectangle */}
        {marqueeBox && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(marqueeBox.startX, marqueeBox.currentX)}px`,
              top: `${Math.min(marqueeBox.startY, marqueeBox.currentY)}px`,
              width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX)}px`,
              height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY)}px`,
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px dashed #38bdf8',
              borderRadius: '2px',
              pointerEvents: 'none',
              zIndex: 90
            }}
          />
        )}

        {/* Layer 0: SVG Background Edge System */}
        <GraphEdgeLayer
          graph={graph}
          layout={layout}
          selectedIds={selectedIds}
          direction={direction}
          showArrows={showEdgeArrows}
          onEdgeClick={(edgeId) =>
            onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [edgeId] } })
          }
        />

        {/* Live Wiring preview curve */}
        {activeWire && (
          <svg className="sysflow-edge-layer" style={{ pointerEvents: 'none' }}>
            <line
              x1={activeWire.startWorldPos.x}
              y1={activeWire.startWorldPos.y}
              x2={activeWire.currentWorldPos.x}
              y2={activeWire.currentWorldPos.y}
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          </svg>
        )}

        {/* Layer 10: HTML DOM Node & Container System */}
        <div className="sysflow-dom-layer">
          {containersList.map((container: ContainerEntity) => {
            const containerLayout = layout.containers[container.id];
            if (!containerLayout) return null;

            return (
              <GraphContainer
                key={container.id}
                container={container}
                layout={containerLayout}
                selected={selectedIds.includes(container.id)}
                isHovered={hoveredContainerId === container.id}
                customRenderer={container.type ? containerTypes?.[container.type] : undefined}
                onToggleCollapse={(cId, collapsed) =>
                  onChange({
                    type: 'CONTAINER_TOGGLE_COLLAPSE',
                    payload: { containerId: cId, collapsed }
                  })
                }
                onPointerDown={onEntityPointerDown}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [container.id] } });
                }}
              />
            );
          })}

          {Object.values(graph.nodes).map((node) => {
            const nodeLayout = layout.nodes[node.id];
            if (!nodeLayout) return null;

            return (
              <GraphNode
                key={node.id}
                node={node}
                layout={nodeLayout}
                direction={direction}
                selected={selectedIds.includes(node.id)}
                customRenderer={node.type ? nodeTypes?.[node.type] : undefined}
                onPointerDown={onEntityPointerDown}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [node.id] } });
                }}
                onPortPointerDown={handlePortPointerDown}
                onPortPointerUp={handlePortPointerUp}
              />
            );
          })}
        </div>

        {/* Ghost feedback during drag */}
        {dragState && (
          <div
            className="sysflow-node sysflow-ghost-node"
            style={{
              transform: `translate(${dragState.ghostPosition.x}px, ${dragState.ghostPosition.y}px)`,
              width: `${measurements.get(dragState.draggedEntity.id)?.width || 200}px`,
              height: `${measurements.get(dragState.draggedEntity.id)?.height || 64}px`
            }}
          >
            <div style={{ padding: '8px 12px', fontWeight: 600 }}>
              {dragState.draggedEntity.label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const btnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '4px 8px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600
};
