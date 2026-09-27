// apps/demo/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '../../../packages/core/src/styles/sysflow.css'; // <-- Import live source CSS

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
