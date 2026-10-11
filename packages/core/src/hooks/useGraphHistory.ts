import { useState, useCallback } from 'react';
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

export function useGraphHistory(initialGraph: LogicalGraph) {
  const [state, setState] = useState<HistoryState>({
    history: [initialGraph],
    index: 0,
  });
  const [clipboard, setClipboard] = useState<GraphClipboardState | null>(null);

  // Fallback chain guarantees graph is never undefined
  const currentGraph = state.history[state.index] ?? state.history[0] ?? initialGraph;

  // Atomically append a new state and prune dangling edges
  const pushState = useCallback((next: LogicalGraph) => {
    const cleanGraph = pruneDanglingEdges(next);
    setState((prev) => {
      const trimmed = prev.history.slice(0, prev.index + 1);
      return {
        history: [...trimmed, cleanGraph],
        index: trimmed.length,
      };
    });
  }, []);

  // Set/reset graph directly without pushing duplicate history entries
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

  const applyAction = useCallback(
    (action: GraphAction) => {
      const prev = currentGraph;

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

        const isBT = direction === 'BT';
        const isTB = direction === 'TB';

        const inPortId = `p_in_${Date.now()}`;
        const outPortId = `p_out_${Date.now()}`;

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

        const sourceNode = prev.nodes[oldEdge.sourceId];
        const newNode: NodeEntity = {
          id: suggestedNewNodeId,
          label: `Node ${Object.keys(prev.nodes).length + 1}`,
          type: sourceNode?.type || 'FlowTask',
          parentId: sourceNode?.parentId ?? null,
          ports: [
            { id: inPortId, label: 'in', side: inSide },
            { id: outPortId, label: 'out', side: outSide },
          ],
        };

        const edge1: EdgeEntity = {
          id: suggestedNewEdge1Id,
          sourceId: oldEdge.sourceId,
          sourcePortId: oldEdge.sourcePortId,
          targetId: suggestedNewNodeId,
          targetPortId: inPortId,
        };

        const edge2: EdgeEntity = {
          id: suggestedNewEdge2Id,
          sourceId: suggestedNewNodeId,
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
          nodes: { ...prev.nodes, [suggestedNewNodeId]: newNode },
          edges: nextEdges,
        });
      } else if (action.type === 'NODE_EXTRACT') {
        const { incomingEdgeId, outgoingEdgeId } = action.payload;
        const inEdge = prev.edges[incomingEdgeId];
        const outEdge = prev.edges[outgoingEdgeId];

        if (!inEdge || !outEdge) return;

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
        const inPortId = `p_in_${Date.now()}`;
        const outPortId = `p_out_${Date.now()}`;

        const newNode: NodeEntity = {
          id: suggestedNewNodeId,
          label: `Node ${Object.keys(prev.nodes).length + 1}`,
          type: sourceNode.type,
          ports: [
            { id: inPortId, label: 'in', side: isBT ? 'bottom' : 'top' },
            { id: outPortId, label: 'out', side: isBT ? 'top' : 'bottom' },
          ],
        };

        const currentInPort =
          sourceNode.ports.find((p) => p.label === 'in') || sourceNode.ports[0];
        const currentOutPort =
          sourceNode.ports.find((p) => p.label === 'out') ||
          sourceNode.ports[sourceNode.ports.length - 1];

        let newEdge: EdgeEntity;
        const isPrepending = (isBT && position === 'bottom') || (!isBT && position === 'top');

        if (isPrepending) {
          newEdge = {
            id: suggestedNewEdgeId,
            sourceId: suggestedNewNodeId,
            sourcePortId: outPortId,
            targetId: sourceNode.id,
            targetPortId: currentInPort?.id || 'in',
          };
        } else {
          newEdge = {
            id: suggestedNewEdgeId,
            sourceId: sourceNode.id,
            sourcePortId: currentOutPort?.id || 'out',
            targetId: suggestedNewNodeId,
            targetPortId: inPortId,
          };
        }

        pushState({
          ...prev,
          nodes: { ...prev.nodes, [suggestedNewNodeId]: newNode },
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
      } else if (action.type === 'EDGE_CREATE') {
        const id = action.payload.id || `E_${Date.now()}`;
        pushState({
          ...prev,
          edges: {
            ...prev.edges,
            [id]: { id, ...action.payload.edge },
          },
        });
      } else if (action.type === 'EDGE_DELETE') {
        const nextEdges = { ...prev.edges };
        delete nextEdges[action.payload.edgeId];
        pushState({ ...prev, edges: nextEdges });
      } else if (action.type === 'EDGE_REWIRE') {
        const { edgeId, newTargetId } = action.payload;
        if (!newTargetId || !prev.edges[edgeId]) return;

        const splicedNodeId = newTargetId;
        const oldEdge = prev.edges[edgeId];
        const origTarget = oldEdge.targetId;

        const oldIn = Object.values(prev.edges).find((e) => e.targetId === splicedNodeId);
        const oldOut = Object.values(prev.edges).find((e) => e.sourceId === splicedNodeId);

        const nextEdges: Record<ID, EdgeEntity> = { ...prev.edges };
        if (oldIn && oldOut) {
          nextEdges[oldIn.id] = {
            ...oldIn,
            targetId: oldOut.targetId,
            targetPortId: oldOut.targetPortId,
          };
          delete nextEdges[oldOut.id];
        }

        const targetPort = prev.nodes[splicedNodeId]?.ports[0]?.id || 'p_in';
        const sourcePort =
          prev.nodes[splicedNodeId]?.ports.find((p) => p.id !== targetPort)?.id || targetPort;

        nextEdges[edgeId] = {
          ...oldEdge,
          targetId: splicedNodeId,
          targetPortId: targetPort,
        };

        const secondEdgeId = `REWIRE_${Date.now()}`;
        nextEdges[secondEdgeId] = {
          id: secondEdgeId,
          sourceId: splicedNodeId,
          sourcePortId: sourcePort,
          targetId: origTarget,
          targetPortId: oldEdge.targetPortId,
        };

        pushState({ ...prev, edges: nextEdges });
      }
    },
    [currentGraph, pushState]
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

  const deleteSelection = useCallback(
    (selectedIds: ID[]) => {
      if (selectedIds.length === 0) return;

      const nextNodes = { ...currentGraph.nodes };
      const nextContainers = { ...currentGraph.containers };
      const nextEdges = { ...currentGraph.edges };

      for (const id of selectedIds) {
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
