import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SysFlowCanvas, EdgeRewireStrategy } from '@sysflow/core';
import { Toolbar } from '../../components/Toolbar';
import { InspectorDrawer } from '../../components/InspectorDrawer';
import { useGraphHistory } from '../../hooks/useGraphHistory';
import '@sysflow/core/dist/style.css';
const INITIAL_PIPELINE_GRAPH = {
    version: '2.0.0',
    containers: {},
    nodes: {
        INGEST: {
            id: 'INGEST',
            label: 'Task: Ingest Telemetry',
            ports: [{ id: 'p_out', label: 'out' }],
            data: { priority: 'P0', duration: '12ms' }
        },
        VALIDATE: {
            id: 'VALIDATE',
            label: 'Task: Schema Validation',
            ports: [
                { id: 'p_in', label: 'in' },
                { id: 'p_out', label: 'out' }
            ],
            data: { priority: 'P0', duration: '5ms' }
        },
        ENRICH: {
            id: 'ENRICH',
            label: 'Task: AI Classification',
            ports: [
                { id: 'p_in', label: 'in' },
                { id: 'p_out', label: 'out' }
            ],
            data: { priority: 'P1', duration: '140ms' }
        },
        PERSIST: {
            id: 'PERSIST',
            label: 'Task: Cold Storage Sink',
            ports: [{ id: 'p_in', label: 'in' }],
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
    const [inspectorOpen, setInspectorOpen] = useState(false);
    // Keybinds (L, N, Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+X, Ctrl+V, Del/Backspace)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
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
            }
            else if (e.key.toLowerCase() === 'n') {
                const name = prompt('New task label:', 'Task: Process Batch');
                if (name)
                    handleAddTask(name);
            }
            else if (e.key.toLowerCase() === 'l') {
                setGraphDirect({ ...graph });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, graph, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection, setGraphDirect]);
    const handleGraphChange = (action) => {
        if (action.type === 'SELECTION_CHANGE') {
            setSelectedIds(action.payload.selectedIds);
        }
        else {
            applyAction(action);
        }
    };
    const handleAddTask = (label) => {
        const id = `task_${Date.now()}`;
        const newTask = {
            id,
            label,
            ports: [
                { id: `p_in_${Date.now()}`, label: 'in' },
                { id: `p_out_${Date.now()}`, label: 'out' }
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
            ports: [{ id: `p_stage_${Date.now()}`, label: 'sync' }],
            collapsed: false
        };
        setGraphDirect({
            ...graph,
            containers: { ...graph.containers, [id]: newContainer }
        });
    };
    const handleUpdateEntity = (id, updates) => {
        if (graph.nodes[id]) {
            setGraphDirect({
                ...graph,
                nodes: { ...graph.nodes, [id]: { ...graph.nodes[id], ...updates } }
            });
        }
        else if (graph.containers[id]) {
            setGraphDirect({
                ...graph,
                containers: { ...graph.containers, [id]: { ...graph.containers[id], ...updates } }
            });
        }
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
                }, children: [_jsx("strong", { style: { color: '#38bdf8' }, children: "Flow Priority Flow Reference:" }), _jsxs("ul", { style: { margin: '4px 0 0 16px', padding: 0, lineHeight: 1.6 }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Pipeline Reordering:" }), " Drag any task node and drop it onto an edge or another node to splice and reorder the pipeline."] }), _jsxs("li", { children: [_jsx("strong", { children: "CRUD & Keybinds:" }), " ", _jsx("code", { children: "N" }), " (New Task), ", _jsx("code", { children: "L" }), " (Layout), ", _jsx("code", { children: "Ctrl+Z/Y" }), ", ", _jsx("code", { children: "Del" }), "."] })] })] }), _jsx(Toolbar, { graph: graph, selectedIds: selectedIds, onAddNode: handleAddTask, onAddContainer: handleAddContainer, onDeleteSelected: () => {
                    deleteSelection(selectedIds);
                    setSelectedIds([]);
                }, onUpdateGraph: setGraphDirect, onOpenInspector: () => setInspectorOpen(true) }), _jsx(SysFlowCanvas, { graph: graph, onChange: handleGraphChange, interactionStrategy: rewireStrategy, selectedIds: selectedIds }), inspectorOpen && (_jsx(InspectorDrawer, { graph: graph, selectedIds: selectedIds, onClose: () => setInspectorOpen(false), onUpdateEntity: handleUpdateEntity }))] }));
};
