import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SysFlowCanvas, ReparentStrategy } from '@sysflow/core';
import { SysModuleRenderer } from './SysModuleEditor';
import { Toolbar } from '../../components/Toolbar';
import { InspectorDrawer } from '../../components/InspectorDrawer';
import { useGraphHistory } from '../../hooks/useGraphHistory';
import '@sysflow/core/dist/style.css';
const INITIAL_VERILOG_GRAPH = {
    version: '2.0.0',
    containers: {
        ALU_BLOCK: {
            id: 'ALU_BLOCK',
            label: 'module ALU (Arithmetic Logic Unit)',
            ports: [{ id: 'ALU_CLK', label: 'clk' }],
            collapsed: false
        },
        REG_BANK: {
            id: 'REG_BANK',
            label: 'module RegisterBank',
            ports: [{ id: 'RB_CLK', label: 'clk' }],
            collapsed: false
        }
    },
    nodes: {
        CLK_GEN: {
            id: 'CLK_GEN',
            label: 'Clock_Oscillator',
            type: 'Module',
            ports: [{ id: 'out_clk', label: 'clk_out', data: { busWidth: '1b' } }],
            data: { logicGate: 'OSC', isClock: true }
        },
        ADDER: {
            id: 'ADDER',
            parentId: 'ALU_BLOCK',
            label: '32b_FullAdder',
            type: 'Module',
            ports: [
                { id: 'in_a', label: 'A', data: { busWidth: '32b' } },
                { id: 'in_b', label: 'B', data: { busWidth: '32b' } },
                { id: 'out_sum', label: 'SUM', data: { busWidth: '32b' } }
            ],
            data: { logicGate: 'ADDER_32' }
        },
        MULTIPLIER: {
            id: 'MULTIPLIER',
            parentId: 'ALU_BLOCK',
            label: 'WallaceTree_Mul',
            type: 'Module',
            ports: [
                { id: 'mul_a', label: 'A', data: { busWidth: '32b' } },
                { id: 'mul_b', label: 'B', data: { busWidth: '32b' } },
                { id: 'mul_out', label: 'PROD', data: { busWidth: '64b' } }
            ],
            data: { logicGate: 'MUL_32' }
        },
        REG_R0: {
            id: 'REG_R0',
            parentId: 'REG_BANK',
            label: 'R0_Register',
            type: 'Module',
            ports: [
                { id: 'd_in', label: 'D', data: { busWidth: '32b' } },
                { id: 'q_out', label: 'Q', data: { busWidth: '32b' } }
            ],
            data: { logicGate: 'DFF_32' }
        }
    },
    edges: {
        E1: {
            id: 'E1',
            sourceId: 'CLK_GEN',
            sourcePortId: 'out_clk',
            targetId: 'REG_BANK',
            targetPortId: 'RB_CLK'
        },
        E2: {
            id: 'E2',
            sourceId: 'REG_R0',
            sourcePortId: 'q_out',
            targetId: 'ADDER',
            targetPortId: 'in_a'
        },
        E3: {
            id: 'E3',
            sourceId: 'ADDER',
            sourcePortId: 'out_sum',
            targetId: 'REG_R0',
            targetPortId: 'd_in'
        }
    }
};
const reparentStrategy = new ReparentStrategy();
export const SysDemo = () => {
    const { graph, setGraphDirect, applyAction, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection } = useGraphHistory(INITIAL_VERILOG_GRAPH);
    const [selectedIds, setSelectedIds] = useState([]);
    const [inspectorOpen, setInspectorOpen] = useState(false);
    // Global Keybinds (L, N, Ctrl+Z, Ctrl+Y, Ctrl+C, Ctrl+X, Ctrl+V, Del/Backspace)
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
                const name = prompt('New module label:', 'Module_Instance');
                if (name)
                    handleAddNode(name, null);
            }
            else if (e.key.toLowerCase() === 'l') {
                // Trigger auto layout re-evaluation
                setGraphDirect({ ...graph });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, graph, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection, setGraphDirect]);
    const handleGraphChange = (action) => {
        if (action.type === 'SELECTION_CHANGE') {
            setSelectedIds(action.payload.selectedIds);
            if (action.payload.selectedIds.length > 0) {
                setInspectorOpen(true);
            }
        }
        else {
            applyAction(action);
        }
    };
    const handleAddNode = (label, parentId) => {
        const id = `node_${Date.now()}`;
        const newNode = {
            id,
            label,
            parentId: parentId || null,
            type: 'Module',
            ports: [
                { id: `in_${Date.now()}`, label: 'in', data: { busWidth: '32b' } },
                { id: `out_${Date.now()}`, label: 'out', data: { busWidth: '32b' } }
            ],
            data: { logicGate: 'CUSTOM_LOGIC' }
        };
        setGraphDirect({ ...graph, nodes: { ...graph.nodes, [id]: newNode } });
    };
    const handleAddContainer = (label) => {
        const id = `cnt_${Date.now()}`;
        const newContainer = {
            id,
            label,
            ports: [{ id: `clk_${Date.now()}`, label: 'clk' }],
            collapsed: false
        };
        setGraphDirect({ ...graph, containers: { ...graph.containers, [id]: newContainer } });
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
                    maxWidth: 440
                }, children: [_jsx("strong", { style: { color: '#38bdf8' }, children: "Interactive Sys CAD:" }), _jsxs("ul", { style: { margin: '4px 0 0 16px', padding: 0, lineHeight: 1.6 }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Drag node:" }), " Reparent in/out of containers."] }), _jsxs("li", { children: [_jsx("strong", { children: "Keybinds:" }), " ", _jsx("code", { children: "N" }), ": New Node | ", _jsx("code", { children: "L" }), ": Layout | ", _jsx("code", { children: "Ctrl+Z/Y" }), ": Undo/Redo | ", _jsx("code", { children: "Del" }), ": Delete."] }), _jsx("li", { children: "Click any module to edit parameters & HDL in the expanded Inspector." })] })] }), _jsx(Toolbar, { graph: graph, selectedIds: selectedIds, onAddNode: handleAddNode, onAddContainer: handleAddContainer, onDeleteSelected: () => {
                    deleteSelection(selectedIds);
                    setSelectedIds([]);
                }, onUpdateGraph: setGraphDirect, onOpenInspector: () => setInspectorOpen(true) }), _jsx(SysFlowCanvas, { graph: graph, onChange: handleGraphChange, interactionStrategy: reparentStrategy, nodeTypes: { Module: SysModuleRenderer }, selectedIds: selectedIds }), inspectorOpen && (_jsx(InspectorDrawer, { graph: graph, selectedIds: selectedIds, onClose: () => setInspectorOpen(false), onUpdateEntity: handleUpdateEntity }))] }));
};
