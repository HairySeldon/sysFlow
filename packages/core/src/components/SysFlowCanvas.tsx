import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  LogicalGraph,
  ID,
  NodeEntity,
  ContainerEntity,
  EdgeEntity,
  GraphAction,
  computeEntityPortLocations,
  ComputePortOptions
} from '../models';
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

export interface SysFlowHistoryControls {
  undo: () => void;
  redo: () => void;
  copyEntity?: (id: ID) => void;
  cutEntity?: (id: ID) => void;
  pasteEntity?: () => void;
  deleteSelection?: (selectedIds: ID[]) => void;
}

export interface SysFlowCanvasProps {
  graph: LogicalGraph;
  onChange: (action: GraphAction) => void;
  history?: SysFlowHistoryControls;
  enableShortcuts?: boolean;
  onNodeClick?: (nodeId: ID, node: NodeEntity) => void;
  onEdgeClick?: (edgeId: ID) => void;
  layoutEngine?: LayoutEngine;
  interactionStrategy?: InteractionStrategy;
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  layoutOptions?: LayoutOptions;
  showEdgeArrows?: boolean;
  nodeTypes?: Record<string, React.ComponentType<{ node: NodeEntity; selected: boolean }>>;
  containerTypes?: Record<string, React.ComponentType<{ container: ContainerEntity; selected: boolean }>>;
  zoomBounds?: { min: number; max: number };
  className?: string;
  selectedIds?: ID[];
  portPlacementMode?: 'strict-flow' | 'perimeter-optimized';
  routing?: 'bezier' | 'step' | 'auto';
  theme?: 'dark' | 'light';
  enableQuickAdd?: boolean;
  enableEdgeQuickAdd?: boolean;
  onNodeCreate?: (node: Partial<NodeEntity>) => void;
  onEdgeCreate?: (sourceId: ID, targetId: ID, edgeId: ID) => void;
  onNodeDelete?: (nodeId: ID) => void;
  onEdgeDelete?: (edgeId: ID) => void;
}

const DEFAULT_STRATEGY = new ReparentStrategy();

export const SysFlowCanvas: React.FC<SysFlowCanvasProps> = ({
  graph,
  onChange,
  history,
  enableShortcuts = true,
  onNodeClick,
  onEdgeClick,
  layoutEngine,
  interactionStrategy = DEFAULT_STRATEGY,
  direction = 'TB',
  layoutOptions,
  portPlacementMode,
  routing,
  showEdgeArrows = true,
  nodeTypes,
  containerTypes,
  zoomBounds,
  className = '',
  selectedIds = [],
  theme = 'dark',
  enableQuickAdd,
  enableEdgeQuickAdd,
  onNodeCreate,
  onEdgeCreate,
  onNodeDelete,
  onEdgeDelete
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

  // Memoized port options available everywhere in the component
  const resolvedPortOptions: ComputePortOptions = useMemo(() => ({
    direction,
    mode: portPlacementMode ?? (direction === 'TB' || direction === 'BT' ? 'strict-flow' : 'perimeter-optimized'),
    nodeLayouts: layout.nodes
  }), [direction, portPlacementMode, layout.nodes]);

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

  // Keyboard Navigation: Tab, Arrow keys, 'F' (zoom-to-fit), Ctrl+A, Undo/Redo, Copy/Paste/Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Built-in History & Clipboard shortcuts
      if (enableShortcuts !== false && history) {
        if (isMod && key === 'z') {
          e.preventDefault();
          if (e.shiftKey) history.redo();
          else history.undo();
          return;
        }

        if (isMod && key === 'y') {
          e.preventDefault();
          history.redo();
          return;
        }

        if (isMod && key === 'c' && selectedIds[0]) {
          e.preventDefault();
          history.copyEntity?.(selectedIds[0]);
          return;
        }

        if (isMod && key === 'x' && selectedIds[0]) {
          e.preventDefault();
          history.cutEntity?.(selectedIds[0]);
          return;
        }

        if (isMod && key === 'v') {
          e.preventDefault();
          history.pasteEntity?.();
          return;
        }

        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          history.deleteSelection?.(selectedIds);
          onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
          return;
        }
      }

      // Escape Key: Deselect all and cancel active marquee
      if (e.key === 'Escape') {
        e.preventDefault();
        setMarqueeBox(null);
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
        return;
      }

      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }

      // 'F' Key: Zoom to fit
      if (e.key.toLowerCase() === 'f' && !isMod) {
        e.preventDefault();
        zoomToFit(layout);
        return;
      }

      // Ctrl+A / Cmd+A: Select all
      if (isMod && key === 'a') {
        e.preventDefault();
        const allIds = [
          ...Object.keys(graph.nodes),
          ...Object.keys(graph.containers)
        ];
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: allIds } });
        return;
      }

      // Tab & Spatial navigation
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

    const portLocs = computeEntityPortLocations(
      entity,
      itemLayout,
      direction,
      graph.edges,
      resolvedPortOptions
    );
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
    if (activeWire && activeWire.sourceId !== entityId) {
      const fromEntity = graph.nodes[activeWire.sourceId] || graph.containers[activeWire.sourceId];
      const toEntity = graph.nodes[entityId] || graph.containers[entityId];

      const fromPort = fromEntity?.ports?.find((p) => p.id === activeWire.sourcePortId);
      const toPort = toEntity?.ports?.find((p) => p.id === portId);

      let finalSourceId = activeWire.sourceId;
      let finalSourcePortId = activeWire.sourcePortId;
      let finalTargetId = entityId;
      let finalTargetPortId = portId;

      const isFromIn = fromPort?.label?.toLowerCase().includes('in') || fromPort?.side === (direction === 'BT' ? 'bottom' : 'top');
      const isFromOut = fromPort?.label?.toLowerCase().includes('out') || fromPort?.side === (direction === 'BT' ? 'top' : 'bottom');
      const isToIn = toPort?.label?.toLowerCase().includes('in') || toPort?.side === (direction === 'BT' ? 'bottom' : 'top');
      const isToOut = toPort?.label?.toLowerCase().includes('out') || toPort?.side === (direction === 'BT' ? 'top' : 'bottom');

      // Rule 1: Dragged backwards from input to output: normalize so out -> in
      if (isFromIn && isToOut) {
        finalSourceId = entityId;
        finalSourcePortId = portId;
        finalTargetId = activeWire.sourceId;
        finalTargetPortId = activeWire.sourcePortId;
      } 
      // Rule 2: Already valid output -> input: preserve user's explicit intent!
      else if (isFromOut && isToIn) {
        finalSourceId = activeWire.sourceId;
        finalSourcePortId = activeWire.sourcePortId;
        finalTargetId = entityId;
        finalTargetPortId = portId;
      }
      // Rule 3: Fallback spatial normalization only for ambiguous/untyped ports
      else if (layout.nodes[activeWire.sourceId] && layout.nodes[entityId]) {
        const fromLayout = layout.nodes[activeWire.sourceId];
        const toLayout = layout.nodes[entityId];

        const shouldFlipBT = direction === 'BT' && fromLayout.y < toLayout.y;
        const shouldFlipTB = direction === 'TB' && fromLayout.y > toLayout.y;

        if (shouldFlipBT || shouldFlipTB) {
          finalSourceId = entityId;
          finalTargetId = activeWire.sourceId;

          const newSourceNode = graph.nodes[finalSourceId];
          const newTargetNode = graph.nodes[finalTargetId];

          finalSourcePortId =
            newSourceNode?.ports?.find((p) => p.label.includes('out') || p.side === (direction === 'BT' ? 'top' : 'bottom'))?.id || portId;
          finalTargetPortId =
            newTargetNode?.ports?.find((p) => p.label.includes('in') || p.side === (direction === 'BT' ? 'bottom' : 'top'))?.id || activeWire.sourcePortId;
        }
      }

      onChange({
        type: 'EDGE_CREATE',
        payload: {
          edge: {
            sourceId: finalSourceId,
            sourcePortId: finalSourcePortId,
            targetId: finalTargetId,
            targetPortId: finalTargetPortId
          }
        }
      });
    }

    setActiveWire(null);
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || isSpacePressedRef.current) {
      startPan(e.clientX, e.clientY);
      return;
    }

    // Allow clicking on container, viewport, svg layers, or the canvas itself
    const target = e.target as HTMLElement;
    const isBackgroundClick =
      target === containerRef.current ||
      target.classList.contains('sysflow-viewport') ||
      target.classList.contains('sysflow-dom-layer') ||
      target.tagName.toLowerCase() === 'svg';

    if (e.button === 0 && isBackgroundClick) {
      // Prevent browser native drag/selection
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

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
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (isPanning.current) {
      endPan();
    }

    if (marqueeBox) {
      const boxLeft = Math.min(marqueeBox.startX, marqueeBox.currentX);
      const boxTop = Math.min(marqueeBox.startY, marqueeBox.currentY);
      const boxRight = Math.max(marqueeBox.startX, marqueeBox.currentX);
      const boxBottom = Math.max(marqueeBox.startY, marqueeBox.currentY);

      if (boxRight - boxLeft > 4 || boxBottom - boxTop > 4) {
        const selected: ID[] = [];

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

  const shouldEnableQuickAdd =
    enableQuickAdd ?? (layoutOptions?.mode === 'flow');

  // Helper to guarantee standard UUIDv4 format
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback UUID RFC4122 generator if running in non-crypto environment
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const shouldEnableEdgeQuickAdd =
    enableEdgeQuickAdd ?? (enableQuickAdd ?? (layoutOptions?.mode === 'flow'));

  const handleAddConnectedNode = useCallback(
    (currentNode: NodeEntity, position: 'top' | 'bottom') => {
      const newNodeId = generateId();
      const newEdgeId = generateId();

      const isBT = direction === 'BT';
      const isPrepending = (isBT && position === 'bottom') || (!isBT && position === 'top');

      // 1. If consumer provided onNodeCreate, invoke it directly (same as "T", "Q", "W")
      if (onNodeCreate) {
        onNodeCreate({
          id: newNodeId,
          type: currentNode.type || 'task',
          label: `New ${currentNode.type || 'task'}`,
          parentId: currentNode.parentId ?? null,
        });
      }

      // 2. If consumer provided onEdgeCreate, connect source & target directly
      if (onEdgeCreate) {
        if (isPrepending) {
          onEdgeCreate(newNodeId, currentNode.id, newEdgeId);
        } else {
          onEdgeCreate(currentNode.id, newNodeId, newEdgeId);
        }
      }

      // 3. Keep local SysFlow history/canvas in sync
      onChange({
        type: 'NODE_ADD_CONNECTED',
        payload: {
          sourceNode: currentNode,
          position,
          direction,
          suggestedNewNodeId: newNodeId,
          suggestedNewEdgeId: newEdgeId,
        },
      });

      onChange({
        type: 'SELECTION_CHANGE',
        payload: { selectedIds: [newNodeId] },
      });
    },
    [direction, onChange, onNodeCreate, onEdgeCreate]
  );

  const handleInsertNodeOnEdge = useCallback(
    (edge: EdgeEntity) => {
      const newNodeId = generateId();
      const newEdge1Id = generateId();
      const newEdge2Id = generateId();

      const sourceNode = graph.nodes[edge.sourceId];
      const nodeType = sourceNode?.type || 'task';

      // 1. Delete old edge if callback provided
      if (onEdgeDelete) {
        onEdgeDelete(edge.id);
      }

      // 2. Create the new spliced node
      if (onNodeCreate) {
        onNodeCreate({
          id: newNodeId,
          type: nodeType,
          label: `New ${nodeType}`,
          parentId: sourceNode?.parentId ?? null,
        });
      }

      // 3. Create the two new connected edges
      if (onEdgeCreate) {
        onEdgeCreate(edge.sourceId, newNodeId, newEdge1Id);
        onEdgeCreate(newNodeId, edge.targetId, newEdge2Id);
      }

      // 4. Update local canvas state
      onChange({
        type: 'EDGE_SPLIT_INSERT_NODE',
        payload: {
          edge,
          direction,
          suggestedNewNodeId: newNodeId,
          suggestedNewEdge1Id: newEdge1Id,
          suggestedNewEdge2Id: newEdge2Id,
        },
      });

      onChange({
        type: 'SELECTION_CHANGE',
        payload: { selectedIds: [newNodeId] },
      });
    },
    [direction, graph.nodes, onChange, onNodeCreate, onEdgeCreate, onEdgeDelete]
  );

  const containersList = Object.values(graph.containers) as ContainerEntity[];
  const themeClass = theme === 'light' ? 'sysflow-theme-light' : 'sysflow-theme-dark';

  return (
    <div
      ref={containerRef}
      className={`sysflow-canvas ${themeClass} ${className}`}
      data-theme={theme}
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
      <div className="sysflow-controls-panel">
        <button onClick={zoomIn} className="sysflow-control-btn" title="Zoom In (+)">
          +
        </button>
        <button onClick={zoomOut} className="sysflow-control-btn" title="Zoom Out (-)">
          −
        </button>
        <button onClick={resetTransform} className="sysflow-control-btn" title="Reset Zoom (0)">
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

        {/* 1. Container Layer */}
        <div className="sysflow-containers-layer" style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none' }}>
          {containersList.map((container: ContainerEntity) => {
            const containerLayout = layout.containers[container.id];
            if (!containerLayout) return null;

            const hasChildren =
              Object.values(graph.nodes).some((n) => n.parentId === container.id) ||
              Object.values(graph.containers).some((c) => c.parentId === container.id);

            return (
              <GraphContainer
                key={container.id}
                container={container}
                layout={containerLayout}
                selected={selectedIds.includes(container.id)}
                isHovered={hoveredContainerId === container.id}
                hasChildren={hasChildren}
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
        </div>

        {/* 2. Edges Layer (z-index: 5) */}
        <GraphEdgeLayer
          graph={graph}
          layout={layout}
          selectedIds={selectedIds}
          direction={direction}
          showArrows={showEdgeArrows}
          routing={routing}
          portOptions={resolvedPortOptions}
          enableEdgeQuickAdd={shouldEnableEdgeQuickAdd}
          onInsertNodeOnEdge={handleInsertNodeOnEdge}
          onEdgeClick={(edgeId) =>
            onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [edgeId] } })
          }
        />

        {/* 3. Node Layer */}
        <div className="sysflow-nodes-layer" style={{ position: 'absolute', zIndex: 10, pointerEvents: 'none' }}>
          {Object.values(graph.nodes).map((node) => {
            const nodeLayout = layout.nodes[node.id];
            if (!nodeLayout) return null;

            return (
              <GraphNode
                key={node.id}
                node={node}
                layout={nodeLayout}
                direction={direction}
                edges={graph.edges}
                portOptions={resolvedPortOptions}
                selected={selectedIds.includes(node.id)}
                customRenderer={node.type ? nodeTypes?.[node.type] : undefined}
                enableQuickAdd={shouldEnableQuickAdd}
                onAddConnectedNode={handleAddConnectedNode}
                onPointerDown={onEntityPointerDown}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [node.id] } });
                  onNodeClick?.(node.id, node);
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
