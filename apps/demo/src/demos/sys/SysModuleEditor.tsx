import React from 'react';
import { NodeEntity } from '@sysflow/core';

export const SysModuleRenderer: React.FC<{ node: NodeEntity; selected: boolean }> = ({
  node,
  selected
}) => {
  return (
    <div
      style={{
        padding: '10px 14px',
        backgroundColor: node.data?.isClock ? '#1e1b4b' : '#1e293b',
        border: selected ? '2px solid #60a5fa' : '1px solid #334155',
        borderRadius: '6px',
        minWidth: '150px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: '12px', color: '#38bdf8' }}>
          {String(node.data?.logicGate || 'MODULE')}
        </span>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>{node.label}</span>
      </div>
      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {node.ports.map((port) => (
          <div
            key={port.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#cbd5e1'
            }}
          >
            <span>• {port.label}</span>
            <span style={{ opacity: 0.5 }}>{String(port.data?.busWidth || '1b')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
