import { useState, useCallback } from 'react';
import { pruneDanglingEdges } from '@sysflow/core';
export function useGraphHistory(initialGraph) {
    const [history, setHistory] = useState([initialGraph]);
    const [index, setIndex] = useState(0);
    const [clipboard, setClipboard] = useState(null);
    const currentGraph = history[index];
    const pushState = useCallback((next) => {
        const cleanGraph = pruneDanglingEdges(next);
        setHistory((prev) => [...prev.slice(0, index + 1), cleanGraph]);
        setIndex((prev) => prev + 1);
    }, [index]);
    const undo = useCallback(() => {
        if (index > 0)
            setIndex((prev) => prev - 1);
    }, [index]);
    const redo = useCallback(() => {
        if (index < history.length - 1)
            setIndex((prev) => prev + 1);
    }, [index, history.length]);
    const applyAction = useCallback((action) => {
        const prev = history[index];
        if (action.type === 'ENTITY_REPARENT') {
            const { entityId, newParentId } = action.payload;
            const next = {
                ...prev,
                nodes: { ...prev.nodes },
                containers: { ...prev.containers }
            };
            if (next.nodes[entityId]) {
                next.nodes[entityId] = { ...next.nodes[entityId], parentId: newParentId };
            }
            else if (next.containers[entityId]) {
                next.containers[entityId] = { ...next.containers[entityId], parentId: newParentId };
            }
            pushState(next);
        }
        else if (action.type === 'CONTAINER_TOGGLE_COLLAPSE') {
            const { containerId, collapsed } = action.payload;
            if (prev.containers[containerId]) {
                pushState({
                    ...prev,
                    containers: {
                        ...prev.containers,
                        [containerId]: { ...prev.containers[containerId], collapsed }
                    }
                });
            }
        }
        else if (action.type === 'EDGE_CREATE') {
            const id = action.payload.id || `E_${Date.now()}`;
            pushState({
                ...prev,
                edges: {
                    ...prev.edges,
                    [id]: { id, ...action.payload.edge }
                }
            });
        }
        else if (action.type === 'EDGE_DELETE') {
            const nextEdges = { ...prev.edges };
            delete nextEdges[action.payload.edgeId];
            pushState({ ...prev, edges: nextEdges });
        }
        else if (action.type === 'EDGE_REWIRE') {
            const { edgeId, newTargetId } = action.payload;
            if (!newTargetId || !prev.edges[edgeId])
                return;
            const splicedNodeId = newTargetId;
            const oldEdge = prev.edges[edgeId];
            const origTarget = oldEdge.targetId;
            // 1. Bypass old connections of splicedNodeId
            const oldIn = Object.values(prev.edges).find((e) => e.targetId === splicedNodeId);
            const oldOut = Object.values(prev.edges).find((e) => e.sourceId === splicedNodeId);
            const nextEdges = { ...prev.edges };
            if (oldIn && oldOut) {
                nextEdges[oldIn.id] = { ...oldIn, targetId: oldOut.targetId, targetPortId: oldOut.targetPortId };
                delete nextEdges[oldOut.id];
            }
            // 2. Splice splicedNodeId into edgeId: source -> splicedNode -> origTarget
            const targetPort = prev.nodes[splicedNodeId]?.ports[0]?.id || 'p_in';
            const sourcePort = prev.nodes[splicedNodeId]?.ports.find(p => p.id !== targetPort)?.id || targetPort;
            nextEdges[edgeId] = {
                ...oldEdge,
                targetId: splicedNodeId,
                targetPortId: targetPort
            };
            const secondEdgeId = `REWIRE_${Date.now()}`;
            nextEdges[secondEdgeId] = {
                id: secondEdgeId,
                sourceId: splicedNodeId,
                sourcePortId: sourcePort,
                targetId: origTarget,
                targetPortId: oldEdge.targetPortId
            };
            pushState({ ...prev, edges: nextEdges });
        }
    }, [history, index, pushState]);
    const copyEntity = useCallback((id) => {
        const ent = currentGraph.nodes[id] || currentGraph.containers[id];
        if (ent)
            setClipboard({ entity: JSON.parse(JSON.stringify(ent)), isCut: false });
    }, [currentGraph]);
    const cutEntity = useCallback((id) => {
        const ent = currentGraph.nodes[id] || currentGraph.containers[id];
        if (ent) {
            setClipboard({ entity: JSON.parse(JSON.stringify(ent)), isCut: true });
            const nextNodes = { ...currentGraph.nodes };
            const nextContainers = { ...currentGraph.containers };
            delete nextNodes[id];
            delete nextContainers[id];
            pushState({ ...currentGraph, nodes: nextNodes, containers: nextContainers });
        }
    }, [currentGraph, pushState]);
    const pasteEntity = useCallback(() => {
        if (!clipboard)
            return;
        const base = clipboard.entity;
        const newId = `${base.id}_copy_${Date.now().toString().slice(-4)}`;
        const cloned = { ...base, id: newId, label: `${base.label} (Copy)` };
        if ('collapsed' in cloned) {
            pushState({
                ...currentGraph,
                containers: { ...currentGraph.containers, [newId]: cloned }
            });
        }
        else {
            pushState({
                ...currentGraph,
                nodes: { ...currentGraph.nodes, [newId]: cloned }
            });
        }
    }, [clipboard, currentGraph, pushState]);
    const deleteSelection = useCallback((selectedIds) => {
        if (selectedIds.length === 0)
            return;
        const nextNodes = { ...currentGraph.nodes };
        const nextContainers = { ...currentGraph.containers };
        const nextEdges = { ...currentGraph.edges };
        for (const id of selectedIds) {
            delete nextNodes[id];
            delete nextContainers[id];
            delete nextEdges[id];
        }
        // pushState will automatically invoke pruneDanglingEdges to clean connected edges
        pushState({
            ...currentGraph,
            nodes: nextNodes,
            containers: nextContainers,
            edges: nextEdges
        });
    }, [currentGraph, pushState]);
    return {
        graph: currentGraph,
        setGraphDirect: pushState,
        applyAction,
        undo,
        redo,
        copyEntity,
        cutEntity,
        pasteEntity,
        deleteSelection,
        canUndo: index > 0,
        canRedo: index < history.length - 1
    };
}
