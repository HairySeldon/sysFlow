import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  LogicalGraph,
  ID,
  Port,
  NodeEntity,
  ContainerEntity,
  EdgeEntity,
  GraphAction,
  computeEntityPortLocations,
  ComputePortOptions,
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

// --- Theme Tokens & Converter ---
export interface SysFlowThemeTokens {
  bg?: string;
  grid?: string;
  nodeBg?: string;
  nodeBorder?: string;
  nodeSelected?: string;
  nodeText?: string;
  nodeSubtext?: string;
  containerBg?: string;
  containerHeaderBg?: string;
  containerBorder?: string;
  containerHover?: string;
  edgeStroke?: string;
  edgeSelected?: string;
  portBg?: string;
  portHover?: string;
  panelBg?: string;
  panelBorder?: string;
  panelBtnBg?: string;
  panelBtnHover?: string;
  panelBtnText?: string;
  shadow?: string;
}

const TOKEN_VAR_MAP: Record<keyof SysFlowThemeTokens, string> = {
  bg: '--sysflow-bg',
  grid: '--sysflow-grid',
  nodeBg: '--sysflow-node-bg',
  nodeBorder: '--sysflow-node-border',
  nodeSelected: '--sysflow-node-selected',
  nodeText: '--sysflow-node-text',
  nodeSubtext: '--sysflow-node-subtext',
  containerBg: '--sysflow-container-bg',
  containerHeaderBg: '--sysflow-container-header-bg',
  containerBorder: '--sysflow-container-border',
  containerHover: '--sysflow-container-hover',
  edgeStroke: '--sysflow-edge-stroke',
  edgeSelected: '--sysflow-edge-selected',
  portBg: '--sysflow-port-bg',
  portHover: '--sysflow-port-hover',
  panelBg: '--sysflow-panel-bg',
  panelBorder: '--sysflow-panel-border',
  panelBtnBg: '--sysflow-panel-btn-bg',
  panelBtnHover: '--sysflow-panel-btn-hover',
  panelBtnText: '--sysflow-panel-btn-text',
  shadow: '--sysflow-shadow',
};

export function themeTokensToStyle(
  tokens?: Partial<SysFlowThemeTokens>
): React.CSSProperties {
  if (!tokens) return {};
  const styles: Record<string, string> = {};
  for (const [key, val] of Object.entries(tokens)) {
    if (val !== undefined) {
      const varName =
        TOKEN_VAR_MAP[key as keyof SysFlowThemeTokens] ||
        `--sysflow-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      styles[varName] = val;
    }
  }
  return styles as React.CSSProperties;
}

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
  containerTypes?: Record<
    string,
    React.ComponentType<{ container: ContainerEntity; selected: boolean }>
  >;
  zoomBounds?: { min: number; max: number };
  className?: string;
  selectedIds?: ID[];
  portPlacementMode?: 'strict-flow' | 'perimeter-optimized';
  routing?: 'bezier' | 'step' | 'auto';
  theme?: 'dark' | 'light';
  themeTokens?: Partial<SysFlowThemeTokens>;
  style?: React.CSSProperties;
  enableQuickAdd?: boolean;
  enableEdgeQuickAdd?: boolean;
  isDrawingEdge?: boolean;
  onDrawingEdgeChange?: (isDrawing: boolean) => void;
  onNodeCreate?: (node: Partial<NodeEntity>) => void;
  onEdgeCreate?: (sourceId: ID, targetId: ID, edgeId: ID) => void;
  onNodeDelete?: (nodeId: ID) => void;
  onContainerDelete?: (containerId: ID) => void;
  onEdgeDelete?: (edgeId: ID) => void;
}

interface DrawingSourceState {
  nodeId: ID;
  portId: ID;
}

interface PortPromptState {
  role: 'source' | 'destination';
  node: NodeEntity;
  candidatePorts: Port[];
  source?: DrawingSourceState;
  remainingDestNodeIds?: ID[];
}

const DEFAULT_STRATEGY = new ReparentStrategy();

export const SysFlowCanvas: React.FC<SysFlowCanvasProps> = ({
  graph,
  onChange,
  history,
  enableShortcuts = true,
  onNodeClick,
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
  themeTokens,
  style,
  enableQuickAdd,
  enableEdgeQuickAdd,
  isDrawingEdge,
  onDrawingEdgeChange,
  onNodeCreate,
  onEdgeCreate,
  onNodeDelete,
  onContainerDelete,
  onEdgeDelete,
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
    isPanning,
  } = useCanvasTransform(containerRef, zoomBounds);

  const { measurements, registerMeasureElement } = useMeasurement(graph);
  const [layout, setLayout] = useState<LayoutResult>({ nodes: {}, containers: {} });

  // Controlled/uncontrolled Edge Drawing Mode
  const [internalDrawingEdge, setInternalDrawingEdge] = useState(false);
  const effectiveDrawingEdge = isDrawingEdge ?? internalDrawingEdge;

  const setDrawingEdge = useCallback(
    (next: boolean) => {
      if (isDrawingEdge === undefined) {
        setInternalDrawingEdge(next);
      }
      onDrawingEdgeChange?.(next);
    },
    [isDrawingEdge, onDrawingEdgeChange]
  );

  // Edge drawing state
  const [drawingSource, setDrawingSource] = useState<DrawingSourceState | null>(null);
  const [drawingCursorWorld, setDrawingCursorWorld] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [portPrompt, setPortPrompt] = useState<PortPromptState | null>(null);

  // Clear temporary drawing state whenever drawing mode turns off
  useEffect(() => {
    if (!effectiveDrawingEdge) {
      setDrawingSource(null);
      setDrawingCursorWorld(null);
      setPortPrompt(null);
    }
  }, [effectiveDrawingEdge]);

  const resolvedPortOptions: ComputePortOptions = useMemo(
    () => ({
      direction,
      mode:
        portPlacementMode ??
        (direction === 'TB' || direction === 'BT' ? 'strict-flow' : 'perimeter-optimized'),
      nodeLayouts: layout.nodes,
    }),
    [direction, portPlacementMode, layout.nodes]
  );

  const isFlowMode =
    layoutOptions?.mode === 'flow' || portPlacementMode === 'strict-flow';

  // Marquee box-selection state in world coordinates + screen start for click vs drag detection
  const [marqueeBox, setMarqueeBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);
  const marqueeStartScreenRef = useRef<{ x: number; y: number } | null>(null);

  const isSpacePressedRef = useRef(false);

  const {
    dragState,
    hoveredContainerId,
    handlePointerDown: onEntityPointerDown,
    handlePointerMove: onEntityPointerMove,
    handlePointerUp: onEntityPointerUp,
  } = useDragGesture(graph, layout, interactionStrategy, screenToWorld, onChange);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Resolve candidate ports for a node based on mode (flow vs system) and layout direction
  const getCandidatePorts = useCallback(
    (node: NodeEntity, role: 'source' | 'destination'): Port[] => {
      if (!node.ports || node.ports.length === 0) return [];

      // System mode: no strict port sides -> include all ports
      if (!isFlowMode) {
        return node.ports;
      }

      // Flow mode: source uses outgoing side, destination uses incoming side
      const sourceSide: 'top' | 'bottom' | 'left' | 'right' =
        direction === 'BT'
          ? 'top'
          : direction === 'TB'
          ? 'bottom'
          : direction === 'LR'
          ? 'right'
          : 'left';
      const destSide: 'top' | 'bottom' | 'left' | 'right' =
        direction === 'BT'
          ? 'bottom'
          : direction === 'TB'
          ? 'top'
          : direction === 'LR'
          ? 'left'
          : 'right';

      const expectedSide = role === 'source' ? sourceSide : destSide;
      const nodeLayout = layout.nodes[node.id];
      const portLocs = nodeLayout
        ? computeEntityPortLocations(
            node,
            nodeLayout,
            direction,
            graph.edges,
            resolvedPortOptions
          )
        : null;

      return node.ports.filter((port) => {
        const computedSide = portLocs?.get(port.id)?.side ?? port.side;
        return computedSide === expectedSide;
      });
    },
    [isFlowMode, direction, layout.nodes, graph.edges, resolvedPortOptions]
  );

  // Duplicate and self-loop guard
  const tryCreateEdge = useCallback(
    (
      sourceId: ID,
      sourcePortId: ID,
      targetId: ID,
      targetPortId: ID,
      batchKeys?: Set<string>
    ) => {
      if (sourceId === targetId) return;

      const key = `${sourceId}:${sourcePortId}->${targetId}:${targetPortId}`;
      if (batchKeys?.has(key)) return;

      const alreadyExists = Object.values(graph.edges).some(
        (e) =>
          e.sourceId === sourceId &&
          e.sourcePortId === sourcePortId &&
          e.targetId === targetId &&
          e.targetPortId === targetPortId
      );
      if (alreadyExists) return;

      batchKeys?.add(key);

      onChange({
        type: 'EDGE_CREATE',
        payload: {
          edge: {
            sourceId,
            sourcePortId,
            targetId,
            targetPortId,
          },
        },
      });
    },
    [graph.edges, onChange]
  );

  const resetAndExitDrawingMode = useCallback(() => {
    setDrawingSource(null);
    setDrawingCursorWorld(null);
    setPortPrompt(null);
    setDrawingEdge(false);
  }, [setDrawingEdge]);

  // Process a queue of destination node IDs (supports single-click or multi-node marquee)
  const processDestinationQueue = useCallback(
    (source: DrawingSourceState, queue: ID[], batchKeys = new Set<string>()) => {
      for (let i = 0; i < queue.length; i++) {
        const destNodeId = queue[i];
        if (destNodeId === source.nodeId) continue;

        const destNode = graph.nodes[destNodeId];
        if (!destNode) continue;

        const candidates = getCandidatePorts(destNode, 'destination');
        if (candidates.length === 0) continue;

        if (candidates.length === 1) {
          tryCreateEdge(
            source.nodeId,
            source.portId,
            destNode.id,
            candidates[0].id,
            batchKeys
          );
        } else {
          // Pause and prompt user to select destination port
          setPortPrompt({
            role: 'destination',
            node: destNode,
            candidatePorts: candidates,
            source,
            remainingDestNodeIds: queue.slice(i + 1),
          });
          return;
        }
      }

      // All destinations handled -> exit drawing mode
      resetAndExitDrawingMode();
    },
    [graph.nodes, getCandidatePorts, tryCreateEdge, resetAndExitDrawingMode]
  );

  // Compute world origin for the live preview line from the selected source node/port
  const sourceWorldOrigin = useMemo(() => {
    if (!drawingSource) return null;
    const node = graph.nodes[drawingSource.nodeId];
    const nodeLayout = layout.nodes[drawingSource.nodeId];
    if (!node || !nodeLayout) return null;

    const portLocs = computeEntityPortLocations(
      node,
      nodeLayout,
      direction,
      graph.edges,
      resolvedPortOptions
    );
    const loc = portLocs.get(drawingSource.portId);
    if (loc) {
      return { x: loc.worldX, y: loc.worldY };
    }
    return {
      x: nodeLayout.x + nodeLayout.width / 2,
      y: nodeLayout.y + nodeLayout.height / 2,
    };
  }, [drawingSource, graph.nodes, graph.edges, layout.nodes, direction, resolvedPortOptions]);

  // Handle clicking a node while in edge drawing mode
  const handleDrawingNodeClick = useCallback(
    (node: NodeEntity, clientX: number, clientY: number) => {
      if (portPrompt) return;

      if (!drawingSource) {
        const candidates = getCandidatePorts(node, 'source');
        if (candidates.length === 0) return;

        if (candidates.length === 1) {
          setDrawingSource({ nodeId: node.id, portId: candidates[0].id });
          setDrawingCursorWorld(screenToWorld(clientX, clientY));
        } else {
          setPortPrompt({
            role: 'source',
            node,
            candidatePorts: candidates,
          });
        }
        return;
      }

      // Disallow clicking the same node as both source and destination
      if (node.id === drawingSource.nodeId) return;

      processDestinationQueue(drawingSource, [node.id]);
    },
    [
      portPrompt,
      drawingSource,
      getCandidatePorts,
      screenToWorld,
      processDestinationQueue,
    ]
  );

  // Handle user picking a port inside the modal
  const handleSelectPortInModal = (port: Port) => {
    if (!portPrompt) return;

    if (portPrompt.role === 'source') {
      const chosenSource: DrawingSourceState = {
        nodeId: portPrompt.node.id,
        portId: port.id,
      };
      const nodeLayout = layout.nodes[portPrompt.node.id];
      if (nodeLayout) {
        const portLocs = computeEntityPortLocations(
          portPrompt.node,
          nodeLayout,
          direction,
          graph.edges,
          resolvedPortOptions
        );
        const loc = portLocs.get(port.id);
        if (loc) {
          setDrawingCursorWorld({ x: loc.worldX, y: loc.worldY });
        }
      }
      setDrawingSource(chosenSource);
      setPortPrompt(null);
    } else if (portPrompt.role === 'destination' && portPrompt.source) {
      const source = portPrompt.source;
      const remaining = portPrompt.remainingDestNodeIds || [];
      tryCreateEdge(source.nodeId, source.portId, portPrompt.node.id, port.id);
      setPortPrompt(null);

      if (remaining.length > 0) {
        processDestinationQueue(source, remaining);
      } else {
        resetAndExitDrawingMode();
      }
    }
  };

  // Keyboard navigation & shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const isMod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Escape: wipe node/port selection, cancel marquee, and exit edge drawing mode
      if (e.key === 'Escape') {
        e.preventDefault();
        setMarqueeBox(null);
        marqueeStartScreenRef.current = null;
        if (effectiveDrawingEdge || portPrompt || drawingSource) {
          resetAndExitDrawingMode();
        }
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
        return;
      }

      // "e" keybind: toggle Edge Drawing Mode
      if (enableShortcuts !== false && !isMod && !e.altKey && key === 'e') {
        e.preventDefault();
        if (effectiveDrawingEdge) {
          resetAndExitDrawingMode();
        } else {
          setDrawingEdge(true);
        }
        return;
      }

      // Deletion shortcut
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (effectiveDrawingEdge) return;
        e.preventDefault();
        if (selectedIds.length > 0) {
          if (onNodeDelete || onEdgeDelete || onContainerDelete) {
            for (const id of selectedIds) {
              if (graph.nodes[id]) onNodeDelete?.(id);
              else if (graph.containers[id]) (onContainerDelete || onNodeDelete)?.(id);
              else if (graph.edges[id]) onEdgeDelete?.(id);
            }
          }
          if (history?.deleteSelection) {
            history.deleteSelection(selectedIds);
          }
          onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
        }
        return;
      }

      // History & Clipboard shortcuts
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
      }

      if (e.code === 'Space') {
        isSpacePressedRef.current = true;
      }

      if (key === 'f' && !isMod) {
        e.preventDefault();
        zoomToFit(layout);
        return;
      }

      if (isMod && key === 'a' && !effectiveDrawingEdge) {
        e.preventDefault();
        const allIds = [
          ...Object.keys(graph.nodes),
          ...Object.keys(graph.containers),
        ];
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: allIds } });
        return;
      }

      const nodeIds = Object.keys(graph.nodes);
      if (nodeIds.length === 0 || effectiveDrawingEdge) return;

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
  }, [
    graph,
    layout,
    selectedIds,
    zoomToFit,
    onChange,
    history,
    enableShortcuts,
    onNodeDelete,
    onContainerDelete,
    onEdgeDelete,
    effectiveDrawingEdge,
    portPrompt,
    drawingSource,
    setDrawingEdge,
    resetAndExitDrawingMode,
  ]);

  // Quick-add connected node from a specific port's "+" button
  const handleAddConnectedNode = useCallback(
    (
      currentNode: NodeEntity,
      portId: ID,
      side: 'top' | 'bottom' | 'left' | 'right'
    ) => {
      const newNodeId = generateId();
      const newEdgeId = generateId();

      const clickedPort = currentNode.ports.find((p) => p.id === portId);
      const labelLower = clickedPort?.label?.toLowerCase() || '';
      const isIncomingByLabel =
        labelLower === 'in' ||
        labelLower.startsWith('in_') ||
        labelLower.endsWith('_in');
      const isOutgoingByLabel =
        labelLower === 'out' ||
        labelLower.startsWith('out_') ||
        labelLower.endsWith('_out');

      const isIncomingBySide =
        (direction === 'BT' && side === 'bottom') ||
        (direction === 'TB' && side === 'top') ||
        (direction === 'LR' && side === 'left') ||
        (direction === 'RL' && side === 'right');

      const isPrepending = isIncomingByLabel
        ? true
        : isOutgoingByLabel
        ? false
        : isIncomingBySide;

      if (onNodeCreate && onEdgeCreate) {
        onNodeCreate({
          id: newNodeId,
          type: currentNode.type || 'FlowTask',
          label: `New ${currentNode.type || 'Task'}`,
          parentId: currentNode.parentId ?? null,
        });

        if (isPrepending) {
          onEdgeCreate(newNodeId, currentNode.id, newEdgeId);
        } else {
          onEdgeCreate(currentNode.id, newNodeId, newEdgeId);
        }
      } else {
        onChange({
          type: 'NODE_ADD_CONNECTED',
          payload: {
            sourceNode: currentNode,
            position: side,
            portId,
            direction,
            suggestedNewNodeId: newNodeId,
            suggestedNewEdgeId: newEdgeId,
          },
        });
      }

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
      const nodeType = sourceNode?.type || 'FlowTask';

      if (onNodeCreate && onEdgeCreate && onEdgeDelete) {
        onEdgeDelete(edge.id);
        onNodeCreate({
          id: newNodeId,
          type: nodeType,
          label: `New ${nodeType}`,
          parentId: sourceNode?.parentId ?? null,
        });
        onEdgeCreate(edge.sourceId, newNodeId, newEdge1Id);
        onEdgeCreate(newNodeId, edge.targetId, newEdge2Id);
      } else {
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
      }

      onChange({
        type: 'SELECTION_CHANGE',
        payload: { selectedIds: [newNodeId] },
      });
    },
    [direction, graph.nodes, onChange, onNodeCreate, onEdgeCreate, onEdgeDelete]
  );

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
      ...layoutOptions,
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

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (e.button === 1 || isSpacePressedRef.current) {
      startPan(e.clientX, e.clientY);
      return;
    }

    const target = e.target as HTMLElement;
    const isBackgroundClick =
      target === containerRef.current ||
      target.classList.contains('sysflow-viewport') ||
      target.classList.contains('sysflow-dom-layer') ||
      target.tagName.toLowerCase() === 'svg';

    if (e.button === 0 && isBackgroundClick) {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const worldPos = screenToWorld(e.clientX, e.clientY);
      marqueeStartScreenRef.current = { x: e.clientX, y: e.clientY };
      setMarqueeBox({
        startX: worldPos.x,
        startY: worldPos.y,
        currentX: worldPos.x,
        currentY: worldPos.y,
      });

      if (!effectiveDrawingEdge) {
        onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
      }
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (effectiveDrawingEdge && drawingSource) {
      setDrawingCursorWorld(screenToWorld(e.clientX, e.clientY));
    }

    if (isPanning.current) {
      updatePan(e.clientX, e.clientY);
    } else if (marqueeBox) {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      setMarqueeBox((prev) =>
        prev ? { ...prev, currentX: worldPos.x, currentY: worldPos.y } : null
      );
    } else if (!effectiveDrawingEdge && dragState) {
      onEntityPointerMove(e);
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

      const startScreen = marqueeStartScreenRef.current;
      const screenDist = startScreen
        ? Math.hypot(e.clientX - startScreen.x, e.clientY - startScreen.y)
        : 0;
      const isMarqueeDrag =
        screenDist > 5 || boxRight - boxLeft > 4 || boxBottom - boxTop > 4;

      if (effectiveDrawingEdge) {
        if (!isMarqueeDrag) {
          // Canvas background click: wipe node/port selection and exit drawing mode
          resetAndExitDrawingMode();
          onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [] } });
        } else if (drawingSource) {
          // Marquee selection in drawing mode: connect source node to all enclosed nodes
          const destNodeIds: ID[] = [];
          for (const [id, nLayout] of Object.entries(layout.nodes)) {
            if (id === drawingSource.nodeId) continue;
            if (
              nLayout.x < boxRight &&
              nLayout.x + nLayout.width > boxLeft &&
              nLayout.y < boxBottom &&
              nLayout.y + nLayout.height > boxTop
            ) {
              destNodeIds.push(id);
            }
          }
          if (destNodeIds.length > 0) {
            processDestinationQueue(drawingSource, destNodeIds);
          }
        }
      } else if (isMarqueeDrag) {
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
      marqueeStartScreenRef.current = null;
    }

    if (!effectiveDrawingEdge && dragState) {
      onEntityPointerUp(e);
    }
  };

  const shouldEnableQuickAdd =
    enableQuickAdd ?? (layoutOptions?.mode === 'flow');
  const shouldEnableEdgeQuickAdd =
    (enableEdgeQuickAdd ?? (enableQuickAdd ?? layoutOptions?.mode === 'flow')) &&
    !effectiveDrawingEdge;

  const containersList = Object.values(graph.containers) as ContainerEntity[];
  const themeClass = theme === 'light' ? 'sysflow-theme-light' : 'sysflow-theme-dark';

  const containerStyle = useMemo<React.CSSProperties>(() => {
    return {
      outline: 'none',
      ...themeTokensToStyle(themeTokens),
      ...style,
    };
  }, [themeTokens, style]);

  return (
    <div
      ref={containerRef}
      className={`sysflow-canvas ${themeClass} ${
        effectiveDrawingEdge ? 'sysflow-drawing-edge' : ''
      } ${className}`}
      data-theme={theme}
      style={containerStyle}
      onWheel={onWheel}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      tabIndex={0}
    >
      <MeasureLayer
        graph={graph}
        registerMeasureElement={registerMeasureElement}
        nodeTypes={nodeTypes}
        containerTypes={containerTypes}
      />

      {/* Drawing Mode Status Banner */}
      {effectiveDrawingEdge && (
        <div
          className="sysflow-drawing-banner"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span>
            {drawingSource
              ? `Source: "${
                  graph.nodes[drawingSource.nodeId]?.label || drawingSource.nodeId
                }" — Click destination node or drag marquee to connect (Esc to cancel)`
              : 'Edge Drawing Mode — Click a source node (Esc or click background to exit)'}
          </span>
        </div>
      )}

      {/* Floating Canvas Controls */}
      <div
        className="sysflow-controls-panel"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button onClick={zoomIn} className="sysflow-control-btn" title="Zoom In (+)">
          +
        </button>
        <button onClick={zoomOut} className="sysflow-control-btn" title="Zoom Out (-)">
          −
        </button>
        <button
          onClick={resetTransform}
          className="sysflow-control-btn"
          title="Reset Zoom (0)"
        >
          {Math.round(transform.zoom * 100)}%
        </button>
      </div>

      <div
        className="sysflow-viewport"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        }}
      >
        {/* Dynamic marquee selection rectangle */}
        {marqueeBox && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(marqueeBox.startX, marqueeBox.currentX)}px`,
              top: `${Math.min(marqueeBox.startY, marqueeBox.currentY)}px`,
              width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX)}px`,
              height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY)}px`,
              backgroundColor:
                'color-mix(in srgb, var(--sysflow-node-selected, #aa9460) 15%, transparent)',
              border: '1px dashed var(--sysflow-node-selected, #aa9460)',
              borderRadius: '2px',
              pointerEvents: 'none',
              zIndex: 90,
            }}
          />
        )}

        {/* Live edge drawing preview line from selected source port to cursor */}
        {effectiveDrawingEdge && sourceWorldOrigin && drawingCursorWorld && (
          <svg className="sysflow-edge-layer" style={{ pointerEvents: 'none', zIndex: 80 }}>
            <line
              x1={sourceWorldOrigin.x}
              y1={sourceWorldOrigin.y}
              x2={drawingCursorWorld.x}
              y2={drawingCursorWorld.y}
              stroke="var(--sysflow-edge-selected, #38bdf8)"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
            <circle
              cx={sourceWorldOrigin.x}
              cy={sourceWorldOrigin.y}
              r={4}
              fill="var(--sysflow-edge-selected, #38bdf8)"
            />
          </svg>
        )}

        {/* 1. Container Layer */}
        <div
          className="sysflow-containers-layer"
          style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none' }}
        >
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
                customRenderer={
                  container.type ? containerTypes?.[container.type] : undefined
                }
                onToggleCollapse={(cId, collapsed) => {
                  if (effectiveDrawingEdge) return;
                  onChange({
                    type: 'CONTAINER_TOGGLE_COLLAPSE',
                    payload: { containerId: cId, collapsed },
                  });
                }}
                onPointerDown={(c, e) => {
                  if (effectiveDrawingEdge) {
                    e.stopPropagation();
                    return;
                  }
                  onEntityPointerDown(c, e);
                }}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                onClick={(e) => {
                  e.stopPropagation();
                  if (effectiveDrawingEdge) return;
                  onChange({
                    type: 'SELECTION_CHANGE',
                    payload: { selectedIds: [container.id] },
                  });
                }}
              />
            );
          })}
        </div>

        {/* 2. Edges Layer */}
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
          onEdgeClick={(edgeId) => {
            if (effectiveDrawingEdge) return;
            onChange({ type: 'SELECTION_CHANGE', payload: { selectedIds: [edgeId] } });
          }}
        />

        {/* 3. Node Layer */}
        <div
          className="sysflow-nodes-layer"
          style={{ position: 'absolute', zIndex: 10, pointerEvents: 'none' }}
        >
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
                isDrawingEdge={effectiveDrawingEdge}
                isDrawingSource={drawingSource?.nodeId === node.id}
                customRenderer={node.type ? nodeTypes?.[node.type] : undefined}
                enableQuickAdd={shouldEnableQuickAdd}
                onAddConnectedNode={handleAddConnectedNode}
                onPointerDown={onEntityPointerDown}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
                onClick={(e) => {
                  e.stopPropagation();
                  if (effectiveDrawingEdge) {
                    handleDrawingNodeClick(node, e.clientX, e.clientY);
                    return;
                  }
                  onChange({
                    type: 'SELECTION_CHANGE',
                    payload: { selectedIds: [node.id] },
                  });
                  onNodeClick?.(node.id, node);
                }}
              />
            );
          })}
        </div>

        {/* Ghost feedback during drag */}
        {!effectiveDrawingEdge && dragState && (
          <div
            className="sysflow-node sysflow-ghost-node"
            style={{
              transform: `translate(${dragState.ghostPosition.x}px, ${dragState.ghostPosition.y}px)`,
              width: `${measurements.get(dragState.draggedEntity.id)?.width || 200}px`,
              height: `${measurements.get(dragState.draggedEntity.id)?.height || 64}px`,
            }}
          >
            <div style={{ padding: '8px 12px', fontWeight: 600 }}>
              {dragState.draggedEntity.label}
            </div>
          </div>
        )}
      </div>

      {/* Multi-Port Selection Modal */}
      {portPrompt && (
        <div
          className="sysflow-port-modal-backdrop"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setPortPrompt(null);
          }}
        >
          <div
            className="sysflow-port-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sysflow-port-modal-header">
              <h4 style={{ margin: 0, fontSize: 15 }}>
                {portPrompt.role === 'source'
                  ? 'Select Source Port'
                  : 'Select Destination Port'}
              </h4>
              <span style={{ fontSize: 12, color: 'var(--sysflow-node-subtext)' }}>
                Node: <strong>{portPrompt.node.label}</strong>
                {portPrompt.remainingDestNodeIds &&
                  portPrompt.remainingDestNodeIds.length > 0 && (
                    <> ({portPrompt.remainingDestNodeIds.length} more queued)</>
                  )}
              </span>
            </div>

            <div className="sysflow-port-modal-list">
              {portPrompt.candidatePorts.map((port) => (
                <button
                  key={port.id}
                  type="button"
                  className="sysflow-port-modal-option"
                  onClick={() => handleSelectPortInModal(port)}
                >
                  <span style={{ fontWeight: 600 }}>{port.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>
                    {port.side ? `side: ${port.side}` : port.id}
                    {port.data?.busWidth ? ` • ${String(port.data.busWidth)}` : ''}
                  </span>
                </button>
              ))}
            </div>

            <div className="sysflow-port-modal-footer">
              {portPrompt.role === 'destination' &&
                portPrompt.remainingDestNodeIds &&
                portPrompt.remainingDestNodeIds.length > 0 && (
                  <button
                    type="button"
                    className="sysflow-control-btn"
                    onClick={() => {
                      const source = portPrompt.source!;
                      const remaining = portPrompt.remainingDestNodeIds!;
                      setPortPrompt(null);
                      processDestinationQueue(source, remaining);
                    }}
                  >
                    Skip Node
                  </button>
                )}
              <button
                type="button"
                className="sysflow-control-btn"
                onClick={() => setPortPrompt(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
