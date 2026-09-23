import React, { useRef, useState, useEffect, useCallback } from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity, GraphAction } from '../models';
import { LayoutEngine, LayoutResult } from '../layout/LayoutEngine';
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
    isPanning
  } = useCanvasTransform(containerRef, zoomBounds);

  const { measurements, registerMeasureElement } = useMeasurement(graph);
  const [layout, setLayout] = useState<LayoutResult>({ nodes: {}, containers: {} });

  // Active wire-drawing state (drag from source port to target port)
  const [activeWire, setActiveWire] = useState<{
    sourceId: ID;
    sourcePortId: ID;
    currentWorldPos: { x: number; y: number };
  } | null>(null);

  const {
    dragState,
    hoveredContainerId,
    handlePointerDown: onEntityPointerDown,
    handlePointerMove: onEntityPointerMove,
    handlePointerUp: onEntityPointerUp
  } = useDragGesture(graph, layout, interactionStrategy, screenToWorld, onChange);

  // Layout resolution
  useEffect(() => {
    let cancelled = false;
    activeEngine.execute(graph, measurements).then((computed) => {
      if (!cancelled) {
        setLayout(computed);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [graph, measurements, activeEngine]);

  // Port wiring handlers
  const handlePortPointerDown = (
    entityId: string,
    portId: string,
    isSource: boolean,
    e: React.PointerEvent
  ) => {
    if (isSource) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setActiveWire({
        sourceId: entityId,
        sourcePortId: portId,
        currentWorldPos: worldPos
      });
    }
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
    if (e.button === 1 || e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      startPan(e.clientX, e.clientY);
      onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (isPanning.current) {
      updatePan(e.clientX, e.clientY);
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
        {/* Layer 0: SVG Background Edge System */}
        <GraphEdgeLayer
          graph={graph}
          layout={layout}
          selectedIds={selectedIds}
          onEdgeClick={(edgeId) =>
            onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [edgeId] } })
          }
        />

        {/* Live Wiring preview curve */}
        {activeWire && (
          <svg className="sysflow-edge-layer" style={{ pointerEvents: 'none' }}>
            <line
              x1={layout.nodes[activeWire.sourceId]?.x || layout.containers[activeWire.sourceId]?.x || 0}
              y1={layout.nodes[activeWire.sourceId]?.y || layout.containers[activeWire.sourceId]?.y || 0}
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
                onPortPointerDown={handlePortPointerDown}
                onPortPointerUp={handlePortPointerUp}
              />
            );
          })}

          {nodesList.map((node: NodeEntity) => {
            const nodeLayout = layout.nodes[node.id];
            if (!nodeLayout) return null;

            return (
              <GraphNode
                key={node.id}
                node={node}
                layout={nodeLayout}
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
