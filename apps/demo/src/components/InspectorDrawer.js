import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { pruneDanglingEdges } from '@sysflow/core';
export const InspectorDrawer = ({ graph, selectedIds, onClose, onUpdateEntity }) => {
    const [activeTab, setActiveTab] = useState('source');
    const fileInputRef = useRef(null);
    const selectedId = selectedIds[0];
    const selectedNode = selectedId ? graph.nodes[selectedId] : null;
    const selectedContainer = selectedId ? graph.containers[selectedId] : null;
    if (!selectedNode && !selectedContainer)
        return null;
    const entity = (selectedNode || selectedContainer);
    const isNode = Boolean(selectedNode);
    const defaultTemplate = isNode && selectedNode
        ? `// Module: ${entity.label}\n` +
            `module ${entity.label.replace(/[^a-zA-Z0-9_]/g, '_')} (\n` +
            selectedNode.ports.map((p) => `  input wire [31:0] ${p.label}`).join(',\n') +
            `\n);\n\n` +
            `  // Internal signals & registers\n` +
            `  reg [31:0] internal_reg;\n\n` +
            `  always @(posedge clk) begin\n` +
            `    // Pipeline execution logic\n` +
            `    internal_reg <= 32'h0;\n` +
            `  end\n\n` +
            `endmodule\n`
        : `// Container: ${entity.label}\n`;
    const sourceCode = entity.data?.sourceCode || defaultTemplate;
    const handleOpenFile = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result;
            onUpdateEntity(entity.id, {
                data: { ...entity.data, sourceCode: content, boundFile: file.name }
            });
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    const handleSaveFile = () => {
        const blob = new Blob([sourceCode], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entity.label.replace(/[^a-zA-Z0-9_]/g, '_')}.v`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    };
    const handleUpdatePorts = (updatedPorts) => {
        if (!selectedNode)
            return;
        const nextGraph = {
            ...graph,
            nodes: {
                ...graph.nodes,
                [selectedNode.id]: { ...selectedNode, ports: updatedPorts }
            }
        };
        const cleanGraph = pruneDanglingEdges(nextGraph);
        onUpdateEntity(selectedNode.id, { ports: updatedPorts }, cleanGraph);
    };
    return (_jsxs("div", { style: {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 620,
            height: '100%',
            backgroundColor: '#090d16',
            borderLeft: '1px solid #1e293b',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.7)',
            color: '#f8fafc'
        }, children: [_jsxs("div", { style: {
                    height: 52,
                    borderBottom: '1px solid #1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    background: '#0b1120'
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: 14, color: '#38bdf8' }, children: isNode ? 'Module Inspector' : 'Container Inspector' }), _jsx("span", { style: { fontSize: 11, background: '#1e293b', padding: '2px 8px', borderRadius: 4, color: '#94a3b8' }, children: entity.id })] }), _jsx("button", { onClick: onClose, style: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }, children: "\u2715" })] }), _jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }, children: [_jsx("button", { onClick: () => setActiveTab('source'), style: {
                            ...tabBtnStyle,
                            borderBottom: activeTab === 'source' ? '2px solid #38bdf8' : 'none',
                            color: activeTab === 'source' ? '#38bdf8' : '#94a3b8'
                        }, children: "Source Binding (HDL)" }), _jsx("button", { onClick: () => setActiveTab('properties'), style: {
                            ...tabBtnStyle,
                            borderBottom: activeTab === 'properties' ? '2px solid #38bdf8' : 'none',
                            color: activeTab === 'properties' ? '#38bdf8' : '#94a3b8'
                        }, children: "Configuration & Ports" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: 20 }, children: activeTab === 'source' ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { style: { fontSize: 12, color: '#94a3b8' }, children: ["Bound Source: ", _jsx("strong", { children: String(entity.data?.boundFile || `${entity.label}.v`) })] }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".v,.sv,.vhd,.txt", style: { display: 'none' }, onChange: handleOpenFile }), _jsx("button", { style: { ...btnStyle, fontSize: 11 }, onClick: () => fileInputRef.current?.click(), children: "Open HDL File..." }), _jsx("button", { style: { ...btnStyle, fontSize: 11 }, onClick: handleSaveFile, children: "Export .v File" })] })] }), _jsx("textarea", { value: sourceCode, onChange: (e) => onUpdateEntity(entity.id, {
                                data: { ...entity.data, sourceCode: e.target.value }
                            }), spellCheck: false, style: {
                                flex: 1,
                                minHeight: 480,
                                backgroundColor: '#030712',
                                border: '1px solid #1e293b',
                                color: '#38bdf8',
                                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                fontSize: 12.5,
                                lineHeight: '1.6',
                                padding: 16,
                                borderRadius: 6,
                                outline: 'none',
                                resize: 'none'
                            } })] })) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [_jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Label / Module Name" }), _jsx("input", { type: "text", value: entity.label, onChange: (e) => onUpdateEntity(entity.id, { label: e.target.value }), style: inputStyle })] }), _jsxs("div", { children: [_jsx("label", { style: labelStyle, children: "Parent Container" }), _jsxs("select", { value: entity.parentId || '', onChange: (e) => onUpdateEntity(entity.id, { parentId: e.target.value || null }), style: inputStyle, children: [_jsx("option", { value: "", children: "Canvas Root (No Parent Container)" }), Object.values(graph.containers).map((c) => (_jsxs("option", { value: c.id, disabled: c.id === entity.id, children: [c.label, " (", c.id, ")"] }, c.id)))] })] }), selectedNode && (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("label", { style: labelStyle, children: ["Ports & Pins (", selectedNode.ports.length, ")"] }), _jsx("button", { style: { ...btnStyle, fontSize: 11 }, onClick: () => {
                                                const name = prompt('New port label (e.g. data_in, clk):', 'port_1');
                                                if (name) {
                                                    handleUpdatePorts([
                                                        ...selectedNode.ports,
                                                        { id: `p_${Date.now()}`, label: name, side: 'auto', direction: 'out', data: { busWidth: '32b' } }
                                                    ]);
                                                }
                                            }, children: "+ Add Port" })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }, children: selectedNode.ports.map((port, idx) => (_jsxs("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            background: '#131b2e',
                                            padding: '8px 12px',
                                            borderRadius: 6,
                                            border: '1px solid #1e293b'
                                        }, children: [_jsxs("span", { style: { fontSize: 11, color: '#38bdf8', fontWeight: 600 }, children: ["#", idx + 1] }), _jsx("input", { type: "text", value: port.label, onChange: (e) => {
                                                    const updated = [...selectedNode.ports];
                                                    updated[idx] = { ...port, label: e.target.value };
                                                    handleUpdatePorts(updated);
                                                }, style: { ...inputStyle, marginTop: 0, flex: 2 } }), _jsxs("select", { value: port.side || 'auto', onChange: (e) => {
                                                    const updated = [...selectedNode.ports];
                                                    updated[idx] = { ...port, side: e.target.value };
                                                    handleUpdatePorts(updated);
                                                }, style: { ...inputStyle, marginTop: 0, flex: 1.2 }, title: "Perimeter Edge Side", children: [_jsx("option", { value: "auto", children: "Auto Side" }), _jsx("option", { value: "left", children: "Left" }), _jsx("option", { value: "right", children: "Right" }), _jsx("option", { value: "top", children: "Top" }), _jsx("option", { value: "bottom", children: "Bottom" })] }), _jsxs("select", { value: port.direction || 'out', onChange: (e) => {
                                                    const updated = [...selectedNode.ports];
                                                    updated[idx] = { ...port, direction: e.target.value };
                                                    handleUpdatePorts(updated);
                                                }, style: { ...inputStyle, marginTop: 0, flex: 1 }, title: "Port Flow Direction", children: [_jsx("option", { value: "in", children: "In" }), _jsx("option", { value: "out", children: "Out" }), _jsx("option", { value: "inout", children: "InOut" })] }), _jsx("button", { onClick: () => {
                                                    const updated = selectedNode.ports.filter((_, i) => i !== idx);
                                                    handleUpdatePorts(updated);
                                                }, style: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }, title: "Delete Port and Connected Edges", children: "\u2715" })] }, port.id))) })] }))] })) })] }));
};
const tabBtnStyle = {
    flex: 1,
    padding: '12px 0',
    background: 'transparent',
    border: 'none',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer'
};
const labelStyle = {
    fontSize: 11,
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase'
};
const inputStyle = {
    width: '100%',
    marginTop: 6,
    background: '#131b2e',
    border: '1px solid #1e293b',
    color: '#f8fafc',
    padding: '8px 12px',
    borderRadius: 4,
    fontSize: 12,
    boxSizing: 'border-box'
};
const btnStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '6px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 600
};
