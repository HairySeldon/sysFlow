import { jsx as _jsx } from "react/jsx-runtime";
// apps/demo/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '../../../packages/core/src/styles/sysflow.css'; // <-- Import live source CSS
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
