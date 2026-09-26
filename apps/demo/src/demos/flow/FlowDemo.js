import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SysFlowCanvas, EdgeRewireStrategy } from '@sysflow/core';
import { Toolbar } from '../../components/Toolbar';
import { useGraphHistory } from '../../hooks/useGraphHistory';
import '@sysflow/core/dist/style.css';
const INITIAL_PIPELINE_GRAPH = {
    version: '2.0.0',
    containers: {},
    nodes: {
        INGEST: {
            id: 'INGEST',
            label: 'Task: Ingest Telemetry',
            ports: [{ id: 'p_out', label: 'out', direction: 'out' }],
            data: { priority: 'P0', duration: '12ms' }
        },
        VALIDATE: {
            id: 'VALIDATE',
            label: 'Task: Schema Validation',
            ports: [
                { id: 'p_in', label: 'in', direction: 'in' },
                { id: 'p_out', label: 'out', direction: 'out' }
            ],
            data: { priority: 'P0', duration: '5ms' }
        },
        ENRICH: {
            id: 'ENRICH',
            label: 'Task: AI Classification',
            ports: [
                { id: 'p_in', label: 'in', direction: 'in' },
                { id: 'p_out', label: 'out', direction: 'out' }
            ],
            data: { priority: 'P1', duration: '140ms' }
        },
        PERSIST: {
            id: 'PERSIST',
            label: 'Task: Cold Storage Sink',
            ports: [{ id: 'p_in', label: 'in', direction: 'in' }],
            data: { priority: 'P2', duration: '45ms' }
        }
    },
    edges: {
        STEP1: {
            id: 'STEP1',
            sourceId: 'INGEST',
            sourcePortId: 'p_out',
            targetId: 'VALIDATE',
            targetPortId: 'p_in'
        },
        STEP2: {
            id: 'STEP2',
            sourceId: 'VALIDATE',
            sourcePortId: 'p_out',
            targetId: 'ENRICH',
            targetPortId: 'p_in'
        },
        STEP3: {
            id: 'STEP3',
            sourceId: 'ENRICH',
            sourcePortId: 'p_out',
            targetId: 'PERSIST',
            targetPortId: 'p_in'
        }
    }
};
const rewireStrategy = new EdgeRewireStrategy();
export const FlowDemo = () => {
    const { graph, setGraphDirect, applyAction, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection } = useGraphHistory(INITIAL_PIPELINE_GRAPH);
    const [selectedIds, setSelectedIds] = useState([]);
    const [direction, setDirection] = useState('TB');
    const [editorNodeId, setEditorNodeId] = useState(null);
    const selectedNode = editorNodeId ? graph.nodes[editorNodeId] : null;
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
    // FlowDemo.tsx
    const handleAddTask = (label) => {
        const id = `task_${Date.now()}`;
        const newTask = {
            id,
            label,
            ports: [
                { id: `p_in_${Date.now()}`, label: 'in', direction: 'in' },
                { id: `p_out_${Date.now()}`, label: 'out', direction: 'out' }
            ],
            data: { priority: 'P1', duration: '20ms' }
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
    return (_jsxs("div", { style: { width: '100vw', height: 'calc(100vh - 50px)', position: 'relative' }, children: [_jsxs("div", { style: {
                    position: 'absolute',
                    top: 14,
                    left: 14,
                    zIndex: 20,
                    background: 'rgba(15, 23, 42, 0.88)',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    padding: '10px 16px',
                    color: '#f8fafc',
                    fontSize: '12px',
                    maxWidth: 450
                }, children: [_jsx("strong", { style: { color: '#38bdf8' }, children: "Flow Pipeline Demo:" }), _jsxs("ul", { style: { margin: '4px 0 0 16px', padding: 0, lineHeight: 1.6 }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Clean Edges:" }), " Arrows removed for clean modern graph connections."] }), _jsxs("li", { children: [_jsx("strong", { children: "Reordering:" }), " Drag any task onto an edge to splice it in."] }), _jsxs("li", { children: [_jsx("strong", { children: "Keys:" }), " ", _jsx("code", { children: "Tab" }), "/", _jsx("code", { children: "Arrows" }), ": Navigate | ", _jsx("code", { children: "F" }), ": Fit | ", _jsx("code", { children: "Ctrl+A" }), ": All | ", _jsx("code", { children: "Del" }), ": Delete."] })] })] }), _jsx(Toolbar, { graph: graph, selectedIds: selectedIds, direction: direction, onToggleDirection: () => setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR')), onAddNode: handleAddTask, onAddContainer: handleAddContainer, onDeleteSelected: () => {
                    deleteSelection(selectedIds);
                    setSelectedIds([]);
                    setEditorNodeId(null);
                }, onUpdateGraph: setGraphDirect }), _jsx(SysFlowCanvas, { graph: graph, onChange: handleGraphChange, interactionStrategy: rewireStrategy, direction: direction, layoutOptions: { mode: 'flow' }, showEdgeArrows: false, selectedIds: selectedIds }), selectedNode && (_jsxs("div", { style: {
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
                }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h3", { style: { margin: 0, fontSize: 16, color: '#38bdf8' }, children: "Task Node Editor" }), _jsx("button", { onClick: () => setEditorNodeId(null), style: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }, children: "\u2715" })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Task Name" }), _jsx("input", { type: "text", value: selectedNode.label, onChange: (e) => updateSelectedNode({ label: e.target.value }), style: inputStyle })] }), _jsxs("div", { style: { display: 'flex', gap: 10 }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: labelStyle, children: "Priority" }), _jsxs("select", { value: String(selectedNode.data?.priority || 'P1'), onChange: (e) => updateSelectedNode({ data: { ...selectedNode.data, priority: e.target.value } }), style: inputStyle, children: [_jsx("option", { value: "P0", children: "P0 (Critical)" }), _jsx("option", { value: "P1", children: "P1 (High)" }), _jsx("option", { value: "P2", children: "P2 (Normal)" })] })] }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("label", { style: labelStyle, children: "Duration" }), _jsx("input", { type: "text", value: String(selectedNode.data?.duration || '10ms'), onChange: (e) => updateSelectedNode({ data: { ...selectedNode.data, duration: e.target.value } }), style: inputStyle })] })] }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("label", { style: labelStyle, children: ["Ports (", selectedNode.ports.length, ")"] }), _jsx("button", { style: smallBtnStyle, onClick: () => {
                                            const name = prompt('Port name:', `port_${selectedNode.ports.length + 1}`);
                                            if (name) {
                                                updateSelectedNode({
                                                    ports: [
                                                        ...selectedNode.ports,
                                                        { id: `p_${Date.now()}`, label: name, direction: 'inout' }
                                                    ]
                                                });
                                            }
                                        }, children: "+ Add Port" })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }, children: selectedNode.ports.map((port, idx) => (_jsxs("div", { style: {
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        background: '#131b2e',
                                        padding: '6px 10px',
                                        borderRadius: 4
                                    }, children: [_jsx("input", { type: "text", value: port.label, onChange: (e) => {
                                                const updated = [...selectedNode.ports];
                                                updated[idx] = { ...port, label: e.target.value };
                                                updateSelectedNode({ ports: updated });
                                            }, style: { ...inputStyle, marginTop: 0, flex: 2 } }), _jsxs("select", { value: port.direction || 'inout', onChange: (e) => {
                                                const updated = [...selectedNode.ports];
                                                updated[idx] = { ...port, direction: e.target.value };
                                                updateSelectedNode({ ports: updated });
                                            }, style: { ...inputStyle, marginTop: 0, flex: 1.5 }, children: [_jsx("option", { value: "in", children: "In" }), _jsx("option", { value: "out", children: "Out" }), _jsx("option", { value: "inout", children: "InOut" })] }), _jsx("button", { onClick: () => {
                                                const updated = selectedNode.ports.filter((_, i) => i !== idx);
                                                updateSelectedNode({ ports: updated });
                                            }, style: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }, children: "\u2715" })] }, port.id))) })] })] }))] }));
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
