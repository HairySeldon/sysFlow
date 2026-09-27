import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { SysDemo } from './demos/sys/SysDemo';
import { FlowDemo } from './demos/flow/FlowDemo';
export const App = () => {
    const [currentDemo, setCurrentDemo] = useState('system');
    const [theme, setTheme] = useState('dark');
    const isDark = theme === 'dark';
    // Keep data-theme synced on root HTML element as well
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);
    const headerBg = isDark ? '#0b0f19' : '#ffffff';
    const headerBorder = isDark ? '#1e293b' : '#e2e8f0';
    const navBtnActiveBg = isDark ? '#1e293b' : '#e0f2fe';
    const navBtnText = isDark ? '#94a3b8' : '#64748b';
    const navBtnActiveText = isDark ? '#38bdf8' : '#0284c7';
    const navBtnBorder = isDark ? '#334155' : '#cbd5e1';
    return (_jsxs("div", { "data-theme": theme, className: isDark ? 'sysflow-theme-dark' : 'sysflow-theme-light', style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100vw',
            height: '100vh',
            backgroundColor: isDark ? '#0b1120' : '#f8fafc',
            color: isDark ? '#f8fafc' : '#0f172a'
        }, children: [_jsxs("header", { style: {
                    height: '50px',
                    backgroundColor: headerBg,
                    borderBottom: `1px solid ${headerBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: '16px',
                    transition: 'background-color 0.2s ease, border-color 0.2s ease'
                }, children: [_jsx("span", { style: { color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 800, letterSpacing: '0.05em' }, children: "SYSFLOW ENGINE" }), _jsx("button", { onClick: () => setCurrentDemo('system'), style: {
                            background: currentDemo === 'system' ? navBtnActiveBg : 'transparent',
                            color: currentDemo === 'system' ? navBtnActiveText : navBtnText,
                            border: '1px solid',
                            borderColor: currentDemo === 'system' ? (isDark ? '#38bdf8' : '#0284c7') : navBtnBorder,
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }, children: "Demo 1: System CAD (Reparenting)" }), _jsx("button", { onClick: () => setCurrentDemo('flow'), style: {
                            background: currentDemo === 'flow' ? navBtnActiveBg : 'transparent',
                            color: currentDemo === 'flow' ? navBtnActiveText : navBtnText,
                            border: '1px solid',
                            borderColor: currentDemo === 'flow' ? (isDark ? '#38bdf8' : '#0284c7') : navBtnBorder,
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }, children: "Demo 2: Flow (Rewiring)" }), _jsx("button", { onClick: () => setTheme(isDark ? 'light' : 'dark'), style: {
                            marginLeft: 'auto',
                            background: isDark ? '#1e293b' : '#f1f5f9',
                            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                            color: isDark ? '#f8fafc' : '#0f172a',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600
                        }, children: isDark ? '🌙 Dark Mode' : '☀️ Light Mode' })] }), _jsx("main", { style: { flex: 1, position: 'relative' }, children: currentDemo === 'system' ? _jsx(SysDemo, { theme: theme }) : _jsx(FlowDemo, { theme: theme }) })] }));
};
