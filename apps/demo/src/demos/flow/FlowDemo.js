import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SysFlowCanvas, EdgeRewireStrategy, useGraphHistory } from '@sysflow/core';
import { Toolbar } from '../../components/Toolbar';
import { FlowNodeRenderer } from './FlowNodeRenderer';
import '@sysflow/core/dist/style.css';
const INITIAL_PIPELINE_GRAPH = {
    version: '2.0.0',
    containers: {},
    nodes: {},
    edges: {}
};
const rewireStrategy = new EdgeRewireStrategy();
export const FlowDemo = ({ theme }) => {
    const { graph, setGraphDirect, applyAction, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection } = useGraphHistory(INITIAL_PIPELINE_GRAPH);
    const [selectedIds, setSelectedIds] = useState([]);
    const [editorNodeId, setEditorNodeId] = useState(null);
    const direction = 'BT';
    const selectedNode = editorNodeId ? graph.nodes[editorNodeId] : null;
    // Handler for Top (+) and Bottom (+) shadow buttons
    const handleAddConnectedNode = useCallback((currentNode, position) => {
        const newId = `task_${Date.now()}`;
        const inPortId = `p_in_${Date.now()}`;
        const outPortId = `p_out_${Date.now()}`;
        const isBT = direction === 'BT';
        // Declare newNode in outer scope with direction-aware port positions
        const newNode = {
            id: newId,
            label: `Task: Sub-Process ${Object.keys(graph.nodes).length + 1}`,
            type: 'FlowTask',
            ports: [
                { id: inPortId, label: 'in', side: isBT ? 'bottom' : 'top' },
                { id: outPortId, label: 'out', side: isBT ? 'top' : 'bottom' }
            ],
        };
        const edgeId = `edge_${Date.now()}`;
        // Lookup strictly by role (label), with fallback to first/last port
        let currentInPort = currentNode.ports.find((p) => p.label === 'in') || currentNode.ports[0];
        let currentOutPort = currentNode.ports.find((p) => p.label === 'out') || currentNode.ports[currentNode.ports.length - 1];
        let newEdge;
        if (isBT) {
            if (position === 'top') {
                newEdge = {
                    id: edgeId,
                    sourceId: currentNode.id,
                    sourcePortId: currentOutPort.id,
                    targetId: newId,
                    targetPortId: inPortId
                };
            }
            else {
                newEdge = {
                    id: edgeId,
                    sourceId: newId,
                    sourcePortId: outPortId,
                    targetId: currentNode.id,
                    targetPortId: currentInPort.id
                };
            }
        }
        else {
            // TB (Top-to-Bottom)
            if (position === 'bottom') {
                // Appending below: currentNode (source, bottom port) -> newNode (target, top port)
                newEdge = {
                    id: edgeId,
                    sourceId: currentNode.id,
                    sourcePortId: currentOutPort.id,
                    targetId: newId,
                    targetPortId: inPortId
                };
            }
            else {
                // Prepending above: newNode (source, bottom port) -> currentNode (target, top port)
                newEdge = {
                    id: edgeId,
                    sourceId: newId,
                    sourcePortId: outPortId,
                    targetId: currentNode.id,
                    targetPortId: currentInPort.id
                };
            }
        }
        setGraphDirect({
            ...graph,
            nodes: { ...graph.nodes, [newId]: newNode },
            edges: { ...graph.edges, [edgeId]: newEdge }
        });
        setSelectedIds([newId]);
        setEditorNodeId(newId);
    }, [graph, setGraphDirect, direction]);
    // Memoize custom node renderer mapping to supply the handler
    const nodeTypes = useMemo(() => ({
        FlowTask: (props) => (_jsx(FlowNodeRenderer, { ...props, onAddConnectedNode: handleAddConnectedNode }))
    }), [handleAddConnectedNode]);
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
                return;
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey)
                    redo();
                else
                    undo();
            }
            else if (e.key === 'Escape') {
                setSelectedIds([]);
                setEditorNodeId(null);
            }
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
                if (selectedIds[0])
                    copyEntity(selectedIds[0]);
            }
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
                if (selectedIds[0])
                    cutEntity(selectedIds[0]);
            }
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
                pasteEntity();
            }
            else if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteSelection(selectedIds);
                setSelectedIds([]);
                setEditorNodeId(null);
            }
            else if (e.key.toLowerCase() === 'n') {
                const name = prompt('New task label:', 'Task: Process Batch');
                if (name)
                    handleAddTask(name);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection]);
    const handleGraphChange = (action) => {
        if (action.type === 'SELECTION_CHANGE') {
            setSelectedIds(action.payload.selectedIds);
            const firstId = action.payload.selectedIds[0];
            if (firstId && graph.nodes[firstId]) {
                setEditorNodeId(firstId);
            }
            else {
                setEditorNodeId(null);
            }
        }
        else {
            applyAction(action);
        }
    };
    const handleAddTask = (label) => {
        const id = `task_${Date.now()}`;
        const isBT = direction === 'BT';
        const newTask = {
            id,
            label,
            type: 'FlowTask',
            ports: [
                { id: `p_in_${Date.now()}`, label: 'in', side: isBT ? 'bottom' : 'top' },
                { id: `p_out_${Date.now()}`, label: 'out', side: isBT ? 'top' : 'bottom' }
            ],
        };
        setGraphDirect({
            ...graph,
            nodes: { ...graph.nodes, [id]: newTask }
        });
    };
    const handleAddContainer = (label) => {
        const id = `stage_${Date.now()}`;
        const newContainer = {
            id,
            label,
            collapsed: false
        };
        setGraphDirect({
            ...graph,
            containers: { ...graph.containers, [id]: newContainer }
        });
    };
    const updateSelectedNode = (updates) => {
        if (!editorNodeId || !graph.nodes[editorNodeId])
            return;
        setGraphDirect({
            ...graph,
            nodes: {
                ...graph.nodes,
                [editorNodeId]: { ...graph.nodes[editorNodeId], ...updates }
            }
        });
    };
    return (_jsxs("div", { style: { width: '100vw', height: 'calc(100vh - 50px)', position: 'relative' }, children: [_jsx(Toolbar, { graph: graph, selectedIds: selectedIds, direction: direction, onAddNode: handleAddTask, onAddContainer: handleAddContainer, onDeleteSelected: () => {
                    deleteSelection(selectedIds);
                    setSelectedIds([]);
                    setEditorNodeId(null);
                }, onUpdateGraph: setGraphDirect }), _jsx(SysFlowCanvas, { theme: theme, graph: graph, onChange: handleGraphChange, interactionStrategy: rewireStrategy, direction: direction, routing: "bezier", portPlacementMode: "strict-flow", layoutOptions: { mode: 'flow', channelSpacing: 30 }, showEdgeArrows: true, nodeTypes: nodeTypes, selectedIds: selectedIds }), selectedNode && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 340,
                    height: '100%',
                    background: '#090d16',
                    borderLeft: '1px solid #1e293b',
                    zIndex: 40,
                    padding: 20,
                    boxSizing: 'border-box',
                    color: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, color: '#38bdf8' }, children: "Task Node Editor" }), _jsx("button", { onClick: () => setEditorNodeId(null), style: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }, children: "\u2715" })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Task Name" }), _jsx("input", { type: "text", value: selectedNode.label, onChange: (e) => updateSelectedNode({ label: e.target.value }), style: inputStyle })] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsx("div", { style: { flex: 1 } }), _jsx("div", { style: { flex: 1 } })] })] }))] }));
};
const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase'
};
const inputStyle = {
    width: '100%',
    marginTop: 4,
    background: '#131b2e',
    border: '1px solid #1e293b',
    color: '#f8fafc',
    padding: '6px 10px',
    borderRadius: 4,
    fontSize: 12,
    boxSizing: 'border-box'
};
const smallBtnStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '4px 8px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600
};
