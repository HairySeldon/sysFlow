import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
export const Toolbar = ({ graph, selectedIds, onAddNode, onAddContainer, onDeleteSelected, onUpdateGraph, onOpenInspector }) => {
    const fileInputRef = useRef(null);
    // Download JSON
    const handleSaveJson = () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(graph, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `sysflow-graph-${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };
    // Upload JSON
    const handleUploadJson = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target?.result);
                if (parsed && parsed.nodes && parsed.edges && parsed.containers) {
                    onUpdateGraph(parsed);
                }
                else {
                    alert('Invalid SysFlow LogicalGraph JSON file structure.');
                }
            }
            catch (err) {
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };
    return (_jsxs("div", { style: {
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 30,
            display: 'flex',
            gap: 8,
            background: 'rgba(15, 23, 42, 0.92)',
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #334155',
            alignItems: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
        }, children: [_jsx("button", { style: actionBtnStyle, onClick: () => {
                    const name = prompt('Enter node label:', 'New_Module');
                    if (name)
                        onAddNode(name, null);
                }, children: "+ Add Node" }), _jsx("button", { style: actionBtnStyle, onClick: () => {
                    const name = prompt('Enter container label:', 'module Subsystem');
                    if (name)
                        onAddContainer(name);
                }, children: "+ Add Container" }), selectedIds.length > 0 && (_jsxs(_Fragment, { children: [_jsx("button", { style: { ...actionBtnStyle, backgroundColor: '#7f1d1d', borderColor: '#ef4444' }, onClick: onDeleteSelected, children: "Delete Selected (Del)" }), onOpenInspector && (_jsx("button", { style: { ...actionBtnStyle, backgroundColor: '#2563eb', borderColor: '#60a5fa' }, onClick: onOpenInspector, children: "Inspect Module" }))] })), _jsx("button", { style: actionBtnStyle, onClick: handleSaveJson, children: "Save JSON" }), _jsx("input", { ref: fileInputRef, type: "file", accept: ".json", style: { display: 'none' }, onChange: handleUploadJson }), _jsx("button", { style: actionBtnStyle, onClick: () => fileInputRef.current?.click(), children: "Upload JSON" })] }));
};
const actionBtnStyle = {
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#f8fafc',
    padding: '6px 12px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600
};
