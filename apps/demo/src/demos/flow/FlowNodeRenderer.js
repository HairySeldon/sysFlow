import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const FlowNodeRenderer = ({ node, selected }) => {
    const status = node.data?.status || 'ready';
    return (_jsxs("div", { style: {
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            padding: '10px 14px',
            userSelect: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: selected ? 'rgba(14, 165, 233, 0.15)' : 'rgba(15, 23, 42, 0.85)',
            border: selected ? '1.5px solid #38bdf8' : '1px solid #334155',
            borderRadius: 8,
            transition: 'border-color 0.15s ease, background 0.15s ease'
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx("div", { style: { fontWeight: 600, fontSize: '13px', color: '#f8fafc' }, children: node.label }), _jsx("span", { style: {
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: status === 'completed' ? '#065f46' : status === 'running' ? '#854d0e' : '#1e293b',
                            color: status === 'completed' ? '#6ee7b7' : status === 'running' ? '#fde047' : '#94a3b8'
                        }, children: status })] }), _jsx("div", { style: { fontSize: '11px', color: '#64748b', marginTop: 4 }, children: node.data?.description || `Type: ${node.type || 'Task'}` })] }));
};
