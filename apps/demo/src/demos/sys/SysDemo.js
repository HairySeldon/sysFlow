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
            collapsed: false
        },
        REG_BANK: {
            id: 'REG_BANK',
            label: 'module RegisterBank',
            collapsed: false
        }
    },
    nodes: {
        CLK_GEN: {
            id: 'CLK_GEN',
            label: 'Clock_Oscillator',
            type: 'Module',
            ports: [{ id: 'out_clk', label: 'clk_out', direction: 'out', data: { busWidth: '1b' } }],
            data: { logicGate: 'OSC', isClock: true }
        },
        ADDER: {
            id: 'ADDER',
            parentId: 'ALU_BLOCK',
            label: '32b_FullAdder',
            type: 'Module',
            ports: [
                { id: 'in_a', label: 'A', direction: 'in', data: { busWidth: '32b' } },
                { id: 'in_b', label: 'B', direction: 'in', data: { busWidth: '32b' } },
                { id: 'out_sum', label: 'SUM', direction: 'out', data: { busWidth: '32b' } }
            ],
            data: { logicGate: 'ADDER_32' }
        },
        MULTIPLIER: {
            id: 'MULTIPLIER',
            parentId: 'ALU_BLOCK',
            label: 'WallaceTree_Mul',
            type: 'Module',
            ports: [
                { id: 'mul_a', label: 'A', direction: 'in', data: { busWidth: '32b' } },
                { id: 'mul_b', label: 'B', direction: 'in', data: { busWidth: '32b' } },
                { id: 'mul_out', label: 'PROD', direction: 'out', data: { busWidth: '64b' } }
            ],
            data: { logicGate: 'MUL_32' }
        },
        REG_R0: {
            id: 'REG_R0',
            parentId: 'REG_BANK',
            label: 'R0_Register',
            type: 'Module',
            ports: [
                { id: 'd_in', label: 'D', direction: 'in', data: { busWidth: '32b' } },
                { id: 'q_out', label: 'Q', direction: 'out', data: { busWidth: '32b' } }
            ],
            data: { logicGate: 'DFF_32' }
        }
    },
    edges: {
        E1: {
            id: 'E1',
            sourceId: 'CLK_GEN',
            sourcePortId: 'out_clk',
            targetId: 'REG_R0',
            targetPortId: 'd_in'
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
    const [direction, setDirection] = useState('LR');
    const [inspectorOpen, setInspectorOpen] = useState(false);
    const [showConfigTable, setShowConfigTable] = useState(false);
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
            }
            else if (e.key.toLowerCase() === 'n') {
                const name = prompt('New module label:', 'Module_Instance');
                if (name)
                    handleAddNode(name, null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection]);
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
            ports: [{ id: `p_${Date.now()}`, label: 'port_1', direction: 'inout', data: { busWidth: '32b' } }],
            data: { logicGate: 'CUSTOM_LOGIC' }
        };
        setGraphDirect({ ...graph, nodes: { ...graph.nodes, [id]: newNode } });
    };
    const handleAddContainer = (label) => {
        const id = `cnt_${Date.now()}`;
        const newContainer = {
            id,
            label,
            collapsed: false
        };
        setGraphDirect({ ...graph, containers: { ...graph.containers, [id]: newContainer } });
    };
    const handleUpdateEntity = (id, updates, cleanGraph) => {
        if (cleanGraph) {
            setGraphDirect(cleanGraph);
            return;
        }
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
                }, children: [_jsx("strong", { style: { color: '#38bdf8' }, children: "Interactive Sys CAD:" }), _jsxs("ul", { style: { margin: '4px 0 0 16px', padding: 0, lineHeight: 1.6 }, children: [_jsxs("li", { children: [_jsx("strong", { children: "Config Table:" }), " Click \"Config Table\" in toolbar to view and edit all modules and ports."] }), _jsxs("li", { children: [_jsx("strong", { children: "Keys:" }), " ", _jsx("code", { children: "Tab" }), "/", _jsx("code", { children: "Arrows" }), " | ", _jsx("code", { children: "F" }), " (Fit) | ", _jsx("code", { children: "Ctrl+A" }), " | ", _jsx("code", { children: "Del" }), "."] })] })] }), _jsx(Toolbar, { graph: graph, selectedIds: selectedIds, direction: direction, onToggleDirection: () => setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR')), onAddNode: handleAddNode, onAddContainer: handleAddContainer, onDeleteSelected: () => {
                    deleteSelection(selectedIds);
                    setSelectedIds([]);
                }, onUpdateGraph: setGraphDirect, extraActions: _jsx("button", { style: {
                        background: showConfigTable ? '#38bdf8' : '#1e293b',
                        color: showConfigTable ? '#0f172a' : '#f8fafc',
                        border: '1px solid #334155',
                        padding: '6px 12px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700
                    }, onClick: () => setShowConfigTable(!showConfigTable), children: "\uD83D\uDCCB Config Table" }) }), _jsx(SysFlowCanvas, { graph: graph, onChange: handleGraphChange, interactionStrategy: reparentStrategy, direction: direction, layoutOptions: { mode: 'concurrent' }, nodeTypes: { Module: SysModuleRenderer }, selectedIds: selectedIds }), showConfigTable && (_jsxs("div", { style: {
                    position: 'absolute',
                    top: 70,
                    left: 20,
                    right: 20,
                    bottom: 20,
                    background: '#090d16',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    zIndex: 60,
                    boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }, children: [_jsxs("div", { style: {
                            padding: '12px 20px',
                            background: '#0b1120',
                            borderBottom: '1px solid #1e293b',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }, children: [_jsx("h3", { style: { margin: 0, color: '#38bdf8', fontSize: 16 }, children: "System Configuration Table: Modules & Ports" }), _jsx("button", { onClick: () => setShowConfigTable(false), style: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }, children: "\u2715" })] }), _jsx("div", { style: { flex: 1, overflow: 'auto', padding: 16 }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: 12 }, children: [_jsx("thead", { children: _jsxs("tr", { style: { background: '#1e293b', textAlign: 'left' }, children: [_jsx("th", { style: thStyle, children: "Type" }), _jsx("th", { style: thStyle, children: "ID / Label" }), _jsx("th", { style: thStyle, children: "Parent" }), _jsxs("th", { style: thStyle, children: ["Ports (", Object.values(graph.nodes).reduce((acc, n) => acc + n.ports.length, 0), " total)"] }), _jsx("th", { style: thStyle, children: "Actions" })] }) }), _jsxs("tbody", { children: [Object.values(graph.nodes).map((node) => (_jsxs("tr", { style: { borderBottom: '1px solid #1e293b' }, children: [_jsx("td", { style: tdStyle, children: _jsx("span", { style: { color: '#38bdf8', fontWeight: 600 }, children: "Module" }) }), _jsx("td", { style: tdStyle, children: _jsx("input", { type: "text", value: node.label, onChange: (e) => handleUpdateEntity(node.id, { label: e.target.value }), style: tableInputStyle }) }), _jsx("td", { style: tdStyle, children: _jsxs("select", { value: node.parentId || '', onChange: (e) => handleUpdateEntity(node.id, { parentId: e.target.value || null }), style: tableInputStyle, children: [_jsx("option", { value: "", children: "(Root)" }), Object.values(graph.containers).map((c) => (_jsx("option", { value: c.id, children: c.label }, c.id)))] }) }), _jsx("td", { style: tdStyle, children: _jsxs("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 6 }, children: [node.ports.map((p, pIdx) => (_jsxs("span", { style: {
                                                                    background: '#131b2e',
                                                                    border: '1px solid #334155',
                                                                    padding: '2px 6px',
                                                                    borderRadius: 4,
                                                                    fontSize: 11
                                                                }, children: [p.label, " (", p.direction || 'inout', ")", _jsx("button", { onClick: () => {
                                                                            const nextPorts = node.ports.filter((_, i) => i !== pIdx);
                                                                            handleUpdateEntity(node.id, { ports: nextPorts });
                                                                        }, style: { background: 'transparent', border: 'none', color: '#ef4444', marginLeft: 4, cursor: 'pointer' }, children: "\u2715" })] }, p.id))), _jsx("button", { onClick: () => {
                                                                    const name = prompt('Port name:');
                                                                    if (name) {
                                                                        handleUpdateEntity(node.id, {
                                                                            ports: [...node.ports, { id: `p_${Date.now()}`, label: name, direction: 'inout' }]
                                                                        });
                                                                    }
                                                                }, style: { ...tableInputStyle, width: 'auto', cursor: 'pointer' }, children: "+ Port" })] }) }), _jsx("td", { style: tdStyle, children: _jsx("button", { onClick: () => deleteSelection([node.id]), style: { background: '#7f1d1d', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }, children: "Delete" }) })] }, node.id))), Object.values(graph.containers).map((c) => (_jsxs("tr", { style: { borderBottom: '1px solid #1e293b', background: 'rgba(30, 41, 59, 0.3)' }, children: [_jsx("td", { style: tdStyle, children: _jsx("span", { style: { color: '#a855f7', fontWeight: 600 }, children: "Container" }) }), _jsx("td", { style: tdStyle, children: _jsx("input", { type: "text", value: c.label, onChange: (e) => handleUpdateEntity(c.id, { label: e.target.value }), style: tableInputStyle }) }), _jsx("td", { style: tdStyle, children: _jsx("span", { style: { opacity: 0.5 }, children: "-" }) }), _jsx("td", { style: tdStyle, children: _jsx("span", { style: { opacity: 0.4 }, children: "N/A (Group Container)" }) }), _jsx("td", { style: tdStyle, children: _jsx("button", { onClick: () => deleteSelection([c.id]), style: { background: '#7f1d1d', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }, children: "Delete" }) })] }, c.id)))] })] }) })] })), inspectorOpen && !showConfigTable && (_jsx(InspectorDrawer, { graph: graph, selectedIds: selectedIds, onClose: () => setInspectorOpen(false), onUpdateEntity: handleUpdateEntity }))] }));
};
const thStyle = {
    padding: '10px 12px',
    borderBottom: '2px solid #334155'
};
const tdStyle = {
    padding: '8px 12px'
};
const tableInputStyle = {
    background: '#131b2e',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: 12
};
