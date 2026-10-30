// packages/core/src/hooks/useGraphHistory.ts

import { useState, useCallback, useRef } from 'react';
import {
  LogicalGraph,
  ID,
  NodeEntity,
  ContainerEntity,
  EdgeEntity,
  GraphAction,
  pruneDanglingEdges,
} from '../models';

export interface GraphClipboardState {
  entity: NodeEntity | ContainerEntity;
  isCut: boolean;
}

interface HistoryState {
  history: LogicalGraph[];
  index: number;
}

export interface CreateNodeContext {
  sourceNode?: NodeEntity;
  edge?: EdgeEntity;
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  position?: 'top' | 'bottom' | 'left' | 'right';
  suggestedType?: string;
}

export interface GraphMutationDiff {
  createdNodes: NodeEntity[];
  updatedNodes: NodeEntity[];
  deletedNodes: ID[];
  createdEdges: EdgeEntity[];
  deletedEdges: EdgeEntity[];
}

export interface GraphHistoryOptions {
  createNodeEntity?: (context: CreateNodeContext) => Partial<NodeEntity>;
  canConnect?: (
    sourceId: ID,
    targetId: ID,
    sourcePortId?: ID,
    targetPortId?: ID
  ) => boolean;
  canDelete?: (entityIds: ID[]) => ID[] | boolean;
  onMutate?: (diff: GraphMutationDiff) => void;
}

function computeGraphDiff(
  prev: LogicalGraph,
  next: LogicalGraph
): GraphMutationDiff {
  const createdNodes: NodeEntity[] = [];
  const updatedNodes: NodeEntity[] = [];
  const deletedNodes: ID[] = [];

  const createdEdges: EdgeEntity[] = [];
  const deletedEdges: EdgeEntity[] = [];

  // Nodes diff
  for (const [id, node] of Object.entries(next.nodes)) {
    if (!prev.nodes[id]) {
      createdNodes.push(node);
    } else if (prev.nodes[id] !== node) {
      updatedNodes.push(node);
    }
  }
  for (const id of Object.keys(prev.nodes)) {
    if (!next.nodes[id]) {
      deletedNodes.push(id);
    }
  }

  // Edges diff
  for (const [id, edge] of Object.entries(next.edges)) {
    if (!prev.edges[id]) {
      createdEdges.push(edge);
    }
  }
  for (const [id, edge] of Object.entries(prev.edges)) {
    if (!next.edges[id]) {
      deletedEdges.push(edge);
    }
  }

  return { createdNodes, updatedNodes, deletedNodes, createdEdges, deletedEdges };
}

function hasDiff(diff: GraphMutationDiff): boolean {
  return (
    diff.createdNodes.length > 0 ||
    diff.updatedNodes.length > 0 ||
    diff.deletedNodes.length > 0 ||
    diff.createdEdges.length > 0 ||
    diff.deletedEdges.length > 0
  );
}

export function useGraphHistory(
  initialGraph: LogicalGraph,
  options?: GraphHistoryOptions
) {
  const [state, setState] = useState<HistoryState>({
    history: [initialGraph],
    index: 0,
  });
  const [clipboard, setClipboard] = useState<GraphClipboardState | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const currentGraph = state.history[state.index] ?? state.history[0] ?? initialGraph;

  // Atomically append a new state and emit mutation diff
  const pushState = useCallback((next: LogicalGraph) => {
    const cleanGraph = pruneDanglingEdges(next);

    if (optionsRef.current?.onMutate) {
      const diff = computeGraphDiff(currentGraph, cleanGraph);
      if (hasDiff(diff)) {
        optionsRef.current.onMutate(diff);
      }
    }

    setState((prev) => {
      const trimmed = prev.history.slice(0, prev.index + 1);
      return {
        history: [...trimmed, cleanGraph],
        index: trimmed.length,
      };
    });
  }, [currentGraph]);

  // Set/reset graph directly without pushing duplicate history entries or emitting mutations
  const setGraphDirect = useCallback((next: LogicalGraph) => {
    const cleanGraph = pruneDanglingEdges(next);
    setState({
      history: [cleanGraph],
      index: 0,
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.max(0, prev.index - 1),
    }));
  }, []);

  const redo = useCallback(() => {
    setState((prev) => ({
      ...prev,
      index: Math.min(prev.history.length - 1, prev.index + 1),
    }));
  }, []);

  // deleteSelection declared before applyAction so it can be called safely
  const deleteSelection = useCallback(
    (selectedIds: ID[]) => {
      if (!selectedIds || selectedIds.length === 0) return;

      let safeIds = selectedIds;
      if (optionsRef.current?.canDelete) {
        const allowed = optionsRef.current.canDelete(selectedIds);
        if (typeof allowed === 'boolean') {
          if (!allowed) return;
        } else if (Array.isArray(allowed)) {
          safeIds = allowed;
        }
      }

      if (safeIds.length === 0) return;

      const nextNodes = { ...currentGraph.nodes };
      const nextContainers = { ...currentGraph.containers };
      const nextEdges = { ...currentGraph.edges };

      for (const id of safeIds) {
        delete nextNodes[id];
        delete nextContainers[id];
        delete nextEdges[id];
      }

      pushState({
        ...currentGraph,
        nodes: nextNodes,
        containers: nextContainers,
        edges: nextEdges,
      });
    },
    [currentGraph, pushState]
  );

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const applyAction = useCallback(
    (action: GraphAction) => {
      const prev = currentGraph;
      const opts = optionsRef.current;

      if (action.type === 'ENTITY_REPARENT') {
        const { entityId, newParentId } = action.payload;
        const next: LogicalGraph = {
          ...prev,
          nodes: { ...prev.nodes },
          containers: { ...prev.containers },
        };
        if (next.nodes[entityId]) {
          next.nodes[entityId] = { ...next.nodes[entityId], parentId: newParentId };
        } else if (next.containers[entityId]) {
          next.containers[entityId] = { ...next.containers[entityId], parentId: newParentId };
        }
        pushState(next);
      } else if (action.type === 'EDGE_SPLIT_INSERT_NODE') {
        const { edge, direction, suggestedNewNodeId, suggestedNewEdge1Id, suggestedNewEdge2Id } =
          action.payload;
        const oldEdge = prev.edges[edge.id];
        if (!oldEdge) return;

        const sourceNode = prev.nodes[oldEdge.sourceId];

        // Guardrail: cycle check before splitting
        if (opts?.canConnect) {
          if (
            !opts.canConnect(oldEdge.sourceId, suggestedNewNodeId) ||
            !opts.canConnect(suggestedNewNodeId, oldEdge.targetId)
          ) {
            return;
          }
        }

        const isBT = direction === 'BT';
        const isTB = direction === 'TB';
        const fallbackInPortId = `p_in_${Date.now()}`;
        const fallbackOutPortId = `p_out_${Date.now() + 1}`;

        let inSide: 'top' | 'bottom' | 'left' | 'right' = 'left';
        let outSide: 'top' | 'bottom' | 'left' | 'right' = 'right';

        if (isBT) {
          inSide = 'bottom';
          outSide = 'top';
        } else if (isTB) {
          inSide = 'top';
          outSide = 'bottom';
        } else if (direction === 'RL') {
          inSide = 'right';
          outSide = 'left';
        }

        const customProps = opts?.createNodeEntity?.({
          edge: oldEdge,
          direction,
          suggestedType: sourceNode?.type || 'FlowTask',
        });

        const newNode: NodeEntity = {
          id: customProps?.id || suggestedNewNodeId,
          label: customProps?.label || `Node ${Object.keys(prev.nodes).length + 1}`,
          type: customProps?.type || sourceNode?.type || 'FlowTask',
          parentId: customProps?.parentId ?? sourceNode?.parentId ?? null,
          ports: customProps?.ports || [
            { id: fallbackInPortId, label: 'in', side: inSide },
            { id: fallbackOutPortId, label: 'out', side: outSide },
          ],
          data: customProps?.data || {},
          ...customProps,
        };

        // Resolve ports from the actual instantiated newNode
        const resolvedInPort =
          newNode.ports.find((p) => p.label.toLowerCase().includes('in')) ||
          newNode.ports.find((p) => p.side === (isBT ? 'bottom' : 'top')) ||
          newNode.ports[0];

        const resolvedOutPort =
          newNode.ports.find((p) => p.label.toLowerCase().includes('out')) ||
          newNode.ports.find((p) => p.side === (isBT ? 'top' : 'bottom')) ||
          newNode.ports[newNode.ports.length - 1];

        const inPortId = resolvedInPort ? resolvedInPort.id : fallbackInPortId;
        const outPortId = resolvedOutPort ? resolvedOutPort.id : fallbackOutPortId;

        // Bottom/Incoming Edge: oldSource -> newNode
        const edge1: EdgeEntity = {
          id: suggestedNewEdge1Id,
          sourceId: oldEdge.sourceId,
          sourcePortId: oldEdge.sourcePortId,
          targetId: newNode.id,
          targetPortId: inPortId,
        };

        // Top/Outgoing Edge: newNode -> oldTarget
        const edge2: EdgeEntity = {
          id: suggestedNewEdge2Id,
          sourceId: newNode.id,
          sourcePortId: outPortId,
          targetId: oldEdge.targetId,
          targetPortId: oldEdge.targetPortId,
        };

        const nextEdges = { ...prev.edges };
        delete nextEdges[oldEdge.id];
        nextEdges[suggestedNewEdge1Id] = edge1;
        nextEdges[suggestedNewEdge2Id] = edge2;

        pushState({
          ...prev,
          nodes: { ...prev.nodes, [newNode.id]: newNode },
          edges: nextEdges,
        });
      } else if (action.type === 'NODE_EXTRACT') {
        const { incomingEdgeId, outgoingEdgeId } = action.payload;
        const inEdge = prev.edges[incomingEdgeId];
        const outEdge = prev.edges[outgoingEdgeId];

        if (!inEdge || !outEdge) return;

        if (opts?.canConnect && !opts.canConnect(inEdge.sourceId, outEdge.targetId)) {
          return;
        }

        const nextEdges = { ...prev.edges };
        nextEdges[incomingEdgeId] = {
          ...inEdge,
          targetId: outEdge.targetId,
          targetPortId: outEdge.targetPortId,
        };
        delete nextEdges[outgoingEdgeId];

        pushState({
          ...prev,
          edges: nextEdges,
        });
      } else if (action.type === 'NODE_ADD_CONNECTED') {
        const { sourceNode, position, direction, suggestedNewNodeId, suggestedNewEdgeId } =
          action.payload;
        const isBT = direction === 'BT';
        const fallbackInPortId = `p_in_${Date.now()}`;
        const fallbackOutPortId = `p_out_${Date.now() + 1}`;

        const isPrepending = (isBT && position === 'bottom') || (!isBT && position === 'top');
        const sourceId = isPrepending ? suggestedNewNodeId : sourceNode.id;
        const targetId = isPrepending ? sourceNode.id : suggestedNewNodeId;

        if (opts?.canConnect && !opts.canConnect(sourceId, targetId)) {
          return;
        }

        const customProps = opts?.createNodeEntity?.({
          sourceNode,
          position,
          direction,
          suggestedType: sourceNode.type,
        });

        const newNode: NodeEntity = {
          id: customProps?.id || suggestedNewNodeId,
          label: customProps?.label || `Node ${Object.keys(prev.nodes).length + 1}`,
          type: customProps?.type || sourceNode.type,
          ports: customProps?.ports || [
            { id: fallbackInPortId, label: 'in', side: isBT ? 'bottom' : 'top' },
            { id: fallbackOutPortId, label: 'out', side: isBT ? 'top' : 'bottom' },
          ],
          data: customProps?.data || {},
          parentId: customProps?.parentId ?? sourceNode?.parentId ?? null,
          ...customProps,
        };

        // Resolve ports from the actual instantiated newNode
        const resolvedInPort =
          newNode.ports.find((p) => p.label.toLowerCase().includes('in')) ||
          newNode.ports.find((p) => p.side === (isBT ? 'bottom' : 'top')) ||
          newNode.ports[0];

        const resolvedOutPort =
          newNode.ports.find((p) => p.label.toLowerCase().includes('out')) ||
          newNode.ports.find((p) => p.side === (isBT ? 'top' : 'bottom')) ||
          newNode.ports[newNode.ports.length - 1];

        const inPortId = resolvedInPort ? resolvedInPort.id : fallbackInPortId;
        const outPortId = resolvedOutPort ? resolvedOutPort.id : fallbackOutPortId;

        const currentInPort =
          sourceNode.ports.find((p) => p.label === 'in') || sourceNode.ports[0];
        const currentOutPort =
          sourceNode.ports.find((p) => p.label === 'out') ||
          sourceNode.ports[sourceNode.ports.length - 1];

        let newEdge: EdgeEntity;
        if (isPrepending) {
          newEdge = {
            id: suggestedNewEdgeId,
            sourceId: newNode.id,
            sourcePortId: outPortId,
            targetId: sourceNode.id,
            targetPortId: currentInPort?.id || 'in',
          };
        } else {
          newEdge = {
            id: suggestedNewEdgeId,
            sourceId: sourceNode.id,
            sourcePortId: currentOutPort?.id || 'out',
            targetId: newNode.id,
            targetPortId: inPortId,
          };
        }

        pushState({
          ...prev,
          nodes: { ...prev.nodes, [newNode.id]: newNode },
          edges: { ...prev.edges, [suggestedNewEdgeId]: newEdge },
        });
      } else if (action.type === 'CONTAINER_TOGGLE_COLLAPSE') {
        const { containerId, collapsed } = action.payload;
        if (prev.containers[containerId]) {
          pushState({
            ...prev,
            containers: {
              ...prev.containers,
              [containerId]: { ...prev.containers[containerId], collapsed },
            },
          });
        }
      } else if (action.type === 'NODE_UPDATE') {
        const { id, updates } = action.payload;
        if (prev.nodes[id]) {
          pushState({
            ...prev,
            nodes: {
              ...prev.nodes,
              [id]: { ...prev.nodes[id], ...updates }
            }
          });
        }
      } else if (action.type === 'EDGE_CREATE') {
        const edge = action.payload.edge;
        const edgeSourceId = edge.sourceId;
        const edgeTargetId = edge.targetId;
        const edgeSourcePortId = edge.sourcePortId;
        const edgeTargetPortId = edge.targetPortId;

        if (
          opts?.canConnect &&
          !opts.canConnect(edgeSourceId, edgeTargetId, edgeSourcePortId, edgeTargetPortId)
        ) {
          return;
        }

        const id = (action.payload as any).id || (edge as any).id || generateUUID();
        pushState({
          ...prev,
          edges: {
            ...prev.edges,
            [id]: { id, ...edge } as EdgeEntity,
          },
        });
      } else if (action.type === 'EDGE_DELETE') {
        const edgeId = action.payload.edgeId || (action.payload as any).id;
        const nextEdges = { ...prev.edges };
        delete nextEdges[edgeId];
        pushState({ ...prev, edges: nextEdges });
      } else if (action.type === 'EDGE_REWIRE') {
        const { edgeId, newTargetId } = action.payload;
        if (!newTargetId || !prev.edges[edgeId]) return;

        const splicedNodeId = newTargetId;
        const oldEdge = prev.edges[edgeId];
        const origSource = oldEdge.sourceId;
        const origTarget = oldEdge.targetId;

        if (splicedNodeId === origSource || splicedNodeId === origTarget) return;

        const oldIn = Object.values(prev.edges).find((e) => e.targetId === splicedNodeId);
        const oldOut = Object.values(prev.edges).find((e) => e.sourceId === splicedNodeId);
        const shouldBridge = oldIn && oldOut && oldIn.sourceId !== oldOut.targetId;

        // Guardrails
        if (opts?.canConnect) {
          if (shouldBridge && !opts.canConnect(oldIn.sourceId, oldOut.targetId)) return;
          if (!opts.canConnect(origSource, splicedNodeId)) return;
          if (!opts.canConnect(splicedNodeId, origTarget)) return;
        }

        const nextEdges: Record<ID, EdgeEntity> = { ...prev.edges };

        // 1. Bridge previous connections
        if (shouldBridge) {
          nextEdges[oldIn.id] = {
            ...oldIn,
            targetId: oldOut.targetId,
            targetPortId: oldOut.targetPortId,
          };
          delete nextEdges[oldOut.id];
        } else {
          if (oldIn) delete nextEdges[oldIn.id];
          if (oldOut) delete nextEdges[oldOut.id];
        }

        // 2. Splice into target edge
        const targetPort = prev.nodes[splicedNodeId]?.ports[0]?.id || 'p_in';
        const sourcePort =
          prev.nodes[splicedNodeId]?.ports.find((p) => p.id !== targetPort)?.id || targetPort;

        nextEdges[edgeId] = {
          ...oldEdge,
          targetId: splicedNodeId,
          targetPortId: targetPort,
        };

      const secondEdgeId = generateUUID();
        nextEdges[secondEdgeId] = {
          id: secondEdgeId,
          sourceId: splicedNodeId,
          sourcePortId: sourcePort,
          targetId: origTarget,
          targetPortId: oldEdge.targetPortId,
        };

        pushState({ ...prev, edges: nextEdges });
      } else {
        // Fallback for custom delete actions passed through applyAction
        const rawAction = action as any;
        if (
          rawAction.type === 'NODE_DELETE' ||
          rawAction.type === 'DELETE_SELECTION' ||
          rawAction.type === 'SELECTION_DELETE'
        ) {
          const payload = rawAction.payload || {};
          const rawIds: string[] = [];
          if (payload.nodeId) rawIds.push(payload.nodeId);
          if (payload.id) rawIds.push(payload.id);
          if (Array.isArray(payload.selectedIds)) rawIds.push(...payload.selectedIds);
          if (Array.isArray(payload.ids)) rawIds.push(...payload.ids);
          deleteSelection(rawIds);
        }
      }
    },
    [currentGraph, pushState, deleteSelection]
  );

  const copyEntity = useCallback(
    (id: ID) => {
      const ent = currentGraph.nodes[id] || currentGraph.containers[id];
      if (ent) setClipboard({ entity: JSON.parse(JSON.stringify(ent)), isCut: false });
    },
    [currentGraph]
  );

  const cutEntity = useCallback(
    (id: ID) => {
      const ent = currentGraph.nodes[id] || currentGraph.containers[id];
      if (ent) {
        setClipboard({ entity: JSON.parse(JSON.stringify(ent)), isCut: true });
        const nextNodes = { ...currentGraph.nodes };
        const nextContainers = { ...currentGraph.containers };
        delete nextNodes[id];
        delete nextContainers[id];
        pushState({ ...currentGraph, nodes: nextNodes, containers: nextContainers });
      }
    },
    [currentGraph, pushState]
  );

  const pasteEntity = useCallback(() => {
    if (!clipboard) return;
    const base = clipboard.entity;
    const newId = `${base.id}_copy_${Date.now().toString().slice(-4)}`;
    const cloned = { ...base, id: newId, label: `${base.label} (Copy)` };

    if ('collapsed' in cloned) {
      pushState({
        ...currentGraph,
        containers: { ...currentGraph.containers, [newId]: cloned as ContainerEntity },
      });
    } else {
      pushState({
        ...currentGraph,
        nodes: { ...currentGraph.nodes, [newId]: cloned as NodeEntity },
      });
    }
  }, [clipboard, currentGraph, pushState]);

  return {
    graph: currentGraph,
    setGraphDirect,
    applyAction,
    undo,
    redo,
    copyEntity,
    cutEntity,
    pasteEntity,
    deleteSelection,
    canUndo: state.index > 0,
    canRedo: state.index < state.history.length - 1,
  };
}
