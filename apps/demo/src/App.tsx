import React, { useState, useEffect } from 'react';
import { SysDemo } from './demos/sys/SysDemo';
import { FlowDemo } from './demos/flow/FlowDemo';

export const App: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'system' | 'flow'>('system');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

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

  return (
    <div
      data-theme={theme}
      className={isDark ? 'sysflow-theme-dark' : 'sysflow-theme-light'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        backgroundColor: isDark ? '#0b1120' : '#f8fafc',
        color: isDark ? '#f8fafc' : '#0f172a'
      }}
    >
      <header
        style={{
          height: '50px',
          backgroundColor: headerBg,
          borderBottom: `1px solid ${headerBorder}`,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: '16px',
          transition: 'background-color 0.2s ease, border-color 0.2s ease'
        }}
      >
        <span style={{ color: isDark ? '#38bdf8' : '#0284c7', fontWeight: 800, letterSpacing: '0.05em' }}>
          SYSFLOW ENGINE
        </span>
        <button
          onClick={() => setCurrentDemo('system')}
          style={{
            background: currentDemo === 'system' ? navBtnActiveBg : 'transparent',
            color: currentDemo === 'system' ? navBtnActiveText : navBtnText,
            border: '1px solid',
            borderColor: currentDemo === 'system' ? (isDark ? '#38bdf8' : '#0284c7') : navBtnBorder,
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          Demo 1: System CAD (Reparenting)
        </button>
        <button
          onClick={() => setCurrentDemo('flow')}
          style={{
            background: currentDemo === 'flow' ? navBtnActiveBg : 'transparent',
            color: currentDemo === 'flow' ? navBtnActiveText : navBtnText,
            border: '1px solid',
            borderColor: currentDemo === 'flow' ? (isDark ? '#38bdf8' : '#0284c7') : navBtnBorder,
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          Demo 2: Flow (Rewiring)
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          style={{
            marginLeft: 'auto',
            background: isDark ? '#1e293b' : '#f1f5f9',
            border: `1px solid ${isDark ? '#334155' : '#cbd5e1'}`,
            color: isDark ? '#f8fafc' : '#0f172a',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </header>

      <main style={{ flex: 1, position: 'relative' }}>
        {currentDemo === 'system' ? <SysDemo theme={theme}/> : <FlowDemo theme={theme}/>}
      </main>
    </div>
  );
};
