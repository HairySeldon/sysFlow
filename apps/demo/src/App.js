import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { SysDemo } from './demos/sys/SysDemo';
import { FlowDemo } from './demos/flow/FlowDemo';
export const App = () => {
    const [currentDemo, setCurrentDemo] = useState('system');
    const [theme, setTheme] = useState('dark');
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }, children: [_jsxs("header", { style: {
                    height: '50px',
                    backgroundColor: '#0b0f19',
                    borderBottom: '1px solid #1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: '16px'
                }, children: [_jsx("span", { style: { color: '#38bdf8', fontWeight: 800, letterSpacing: '0.05em' }, children: "SYSFLOW ENGINE" }), _jsx("button", { onClick: () => setCurrentDemo('system'), style: {
                            background: currentDemo === 'system' ? '#1e293b' : 'transparent',
                            color: currentDemo === 'system' ? '#38bdf8' : '#94a3b8',
                            border: '1px solid',
                            borderColor: currentDemo === 'system' ? '#38bdf8' : '#334155',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }, children: "Demo 1: System CAD (Reparenting)" }), _jsx("button", { onClick: () => setCurrentDemo('flow'), style: {
                            background: currentDemo === 'flow' ? '#1e293b' : 'transparent',
                            color: currentDemo === 'flow' ? '#38bdf8' : '#94a3b8',
                            border: '1px solid',
                            borderColor: currentDemo === 'flow' ? '#38bdf8' : '#334155',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }, children: "Demo 2: Flow (Rewiring)" }), _jsx("button", { onClick: () => setTheme(theme === 'dark' ? 'light' : 'dark'), style: {
                            marginLeft: 'auto',
                            background: 'transparent',
                            border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
                            color: theme === 'dark' ? '#f8fafc' : '#0f172a',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }, children: theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode' })] }), _jsx("main", { style: { flex: 1, position: 'relative' }, children: currentDemo === 'system' ? _jsx(SysDemo, {}) : _jsx(FlowDemo, {}) })] }));
};
