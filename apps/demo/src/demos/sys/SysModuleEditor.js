import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const SysModuleRenderer = ({ node, selected }) => {
    return (_jsxs("div", { style: {
            padding: '10px 14px',
            backgroundColor: node.data?.isClock ? '#1e1b4b' : '#1e293b',
            border: selected ? '2px solid #60a5fa' : '1px solid #334155',
            borderRadius: '6px',
            minWidth: '150px'
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsx("span", { style: { fontWeight: 700, fontSize: '12px', color: '#38bdf8' }, children: String(node.data?.logicGate || 'MODULE') }), _jsx("span", { style: { fontSize: '10px', color: '#94a3b8' }, children: node.label })] }), _jsx("div", { style: { marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }, children: node.ports.map((port) => (_jsxs("div", { style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '10px',
                        color: '#cbd5e1'
                    }, children: [_jsxs("span", { children: ["\u2022 ", port.label] }), _jsx("span", { style: { opacity: 0.5 }, children: String(port.data?.busWidth || '1b') })] }, port.id))) })] }));
};
