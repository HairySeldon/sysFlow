import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { pruneDanglingEdges } from '@sysflow/core';
export const InspectorDrawer = ({ graph, selectedIds, boundFilePath, initialSourceCode, onSaveSource, onClose, onUpdateEntity }) => {
    const [activeTab, setActiveTab] = useState('source');
    const [sourceCode, setSourceCode] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const [saveStatus, setSaveStatus] = useState('');
    const selectedId = selectedIds[0];
    const selectedNode = selectedId ? graph.nodes[selectedId] : null;
    const selectedContainer = selectedId ? graph.containers[selectedId] : null;
    const entity = selectedNode || selectedContainer;
    const isNode = Boolean(selectedNode);
    // Safe default template with null checks
    const defaultTemplate = selectedNode
        ? `// Module: ${selectedNode.label}\n` +
            `module ${selectedNode.label.replace(/[^a-zA-Z0-9_]/g, '_')} (\n` +
            selectedNode.ports.map((p) => `  input wire [31:0] ${p.label}`).join(',\n') +
            `\n);\n\n` +
            `  // Internal signals & registers\n` +
            `  reg [31:0] internal_reg;\n\n` +
            `  always @(posedge clk) begin\n` +
            `    // Pipeline execution logic\n` +
            `    internal_reg <= 32'h0;\n` +
            `  end\n\n` +
            `endmodule\n`
        : `// Container: ${selectedContainer?.label || ''}\n`;
    // Sync initial code safely
    useEffect(() => {
        if (!entity)
            return;
        const code = initialSourceCode ?? entity.data?.sourceCode ?? defaultTemplate;
        setSourceCode(code);
        setIsDirty(false);
        setSaveStatus('');
    }, [selectedId, initialSourceCode, entity]);
    // Guard: if entity was deleted or not found, do not render
    if (!entity)
        return null;
    const handleSave = async () => {
        if (onSaveSource) {
            setSaveStatus('Saving...');
            const success = await onSaveSource(sourceCode);
            if (success) {
                setIsDirty(false);
                setSaveStatus('Saved to disk ✓');
                setTimeout(() => setSaveStatus(''), 3000);
            }
            else {
                setSaveStatus('Save failed ✕');
            }
        }
        else {
            onUpdateEntity(entity.id, {
                data: { ...entity.data, sourceCode }
            });
            setIsDirty(false);
            setSaveStatus('Saved in-memory ✓');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };
    const handleClose = async () => {
        if (isDirty) {
            await handleSave();
        }
        onClose();
    };
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            handleSave();
        }
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
            width: 640,
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
                }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: 14, color: '#38bdf8' }, children: isNode ? 'Module Inspector' : 'Container Inspector' }), _jsx("span", { style: { fontSize: 11, background: '#1e293b', padding: '2px 8px', borderRadius: 4, color: '#94a3b8' }, children: entity.id }), isDirty && (_jsx("span", { style: { fontSize: 10, color: '#f59e0b', background: '#451a03', padding: '2px 6px', borderRadius: 4 }, children: "Unsaved changes" }))] }), _jsx("button", { onClick: handleClose, style: { background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }, title: "Save & Close", children: "\u2715" })] }), _jsxs("div", { style: { display: 'flex', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }, children: [_jsx("button", { onClick: () => setActiveTab('source'), style: {
                            ...tabBtnStyle,
                            borderBottom: activeTab === 'source' ? '2px solid #38bdf8' : 'none',
                            color: activeTab === 'source' ? '#38bdf8' : '#94a3b8'
                        }, children: "Source Code (HDL)" }), _jsx("button", { onClick: () => setActiveTab('properties'), style: {
                            ...tabBtnStyle,
                            borderBottom: activeTab === 'properties' ? '2px solid #38bdf8' : 'none',
                            color: activeTab === 'properties' ? '#38bdf8' : '#94a3b8'
                        }, children: "Ports & Meta" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto', padding: 20 }, children: activeTab === 'source' ? (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }, children: [_jsx("span", { style: { fontSize: 12, color: '#94a3b8' }, children: "Path:" }), _jsx("span", { style: {
                                                fontSize: 12,
                                                color: boundFilePath ? '#38bdf8' : '#f59e0b',
                                                fontWeight: 600,
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden'
                                            }, title: boundFilePath || 'No file bound in Config', children: boundFilePath || '(Not bound in config)' })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [saveStatus && (_jsx("span", { style: { fontSize: 11, color: saveStatus.includes('✓') ? '#4ade80' : '#f87171' }, children: saveStatus })), _jsx("button", { style: {
                                                ...btnStyle,
                                                background: isDirty ? '#0284c7' : '#1e293b',
                                                borderColor: isDirty ? '#38bdf8' : '#334155'
                                            }, onClick: handleSave, children: "Save (Ctrl+S)" })] })] }), _jsx("textarea", { value: sourceCode, onChange: (e) => {
                                setSourceCode(e.target.value);
                                setIsDirty(true);
                            }, onKeyDown: handleKeyDown, spellCheck: false, style: {
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
                                                        { id: `p_${Date.now()}`, label: name, data: { busWidth: '32b' } }
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
                                                }, style: { ...inputStyle, marginTop: 0, flex: 2 } }), _jsx("button", { onClick: () => {
                                                    const updated = selectedNode.ports.filter((_, i) => i !== idx);
                                                    handleUpdatePorts(updated);
                                                }, style: { background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }, title: "Delete Port", children: "\u2715" })] }, port.id))) })] }))] })) })] }));
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
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 12
};
