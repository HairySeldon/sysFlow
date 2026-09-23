import React, { useState } from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity } from '@sysflow/core';

interface InspectorDrawerProps {
  graph: LogicalGraph;
  selectedIds: ID[];
  onClose: () => void;
  onUpdateEntity: (id: string, updates: Partial<NodeEntity | ContainerEntity>) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  graph,
  selectedIds,
  onClose,
  onUpdateEntity
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'source'>('properties');
  const selectedId = selectedIds[0];
  const selectedNode = selectedId ? graph.nodes[selectedId] : null;
  const selectedContainer = selectedId ? graph.containers[selectedId] : null;

  if (!selectedNode && !selectedContainer) return null;

  const entity = (selectedNode || selectedContainer)!;
  const isNode = Boolean(selectedNode);

  // Default Verilog Source template if not present
  const sourceCode =
    (entity.data?.sourceCode as string) ||
    `// Verilog-HDL Module: ${entity.label}\nmodule ${entity.label.replace(/[^a-zA-Z0-9_]/g, '_')} (\n` +
      entity.ports.map((p) => `  input [31:0] ${p.label}`).join(',\n') +
      `\n);\n  // Register transfer logic\n  always @(posedge clk) begin\n    // TODO: logic implementation\n  end\nendmodule\n`;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 480,
        height: '100%',
        backgroundColor: '#090d16',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-6px 0 24px rgba(0,0,0,0.6)',
        color: '#f8fafc'
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 48,
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, color: '#38bdf8' }}>
          {isNode ? 'Module Inspector' : 'Container Inspector'}
        </span>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            ...tabBtnStyle,
            borderBottom: activeTab === 'properties' ? '2px solid #38bdf8' : 'none',
            color: activeTab === 'properties' ? '#38bdf8' : '#94a3b8'
          }}
        >
          Configuration
        </button>
        <button
          onClick={() => setActiveTab('source')}
          style={{
            ...tabBtnStyle,
            borderBottom: activeTab === 'source' ? '2px solid #38bdf8' : 'none',
            color: activeTab === 'source' ? '#38bdf8' : '#94a3b8'
          }}
        >
          Source Binding (HDL)
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 18 }}>
        {activeTab === 'properties' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={labelStyle}>Entity Identifier</label>
              <input type="text" disabled value={entity.id} style={{ ...inputStyle, opacity: 0.6 }} />
            </div>

            <div>
              <label style={labelStyle}>Label / Module Name</label>
              <input
                type="text"
                value={entity.label}
                onChange={(e) => onUpdateEntity(entity.id, { label: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Parent Container Hierarchy</label>
              <select
                value={entity.parentId || ''}
                onChange={(e) => onUpdateEntity(entity.id, { parentId: e.target.value || null })}
                style={inputStyle}
              >
                <option value="">Canvas Root (No Container)</option>
                {Object.values(graph.containers).map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === entity.id}>
                    {c.label} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Ports & Pins ({entity.ports.length})</label>
                <button
                  style={{ ...btnStyle, fontSize: 11 }}
                  onClick={() => {
                    const name = prompt('New port label (e.g. data_in, clk):', 'port_in');
                    if (name) {
                      onUpdateEntity(entity.id, {
                        ports: [
                          ...entity.ports,
                          { id: `p_${Date.now()}`, label: name, data: { busWidth: '32b' } }
                        ]
                      });
                    }
                  }}
                >
                  + Add Port
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                {entity.ports.map((port, idx) => (
                  <div
                    key={port.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#131b2e',
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: '1px solid #1e293b'
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>#{idx + 1}</span>
                    <input
                      type="text"
                      value={port.label}
                      onChange={(e) => {
                        const updatedPorts = [...entity.ports];
                        updatedPorts[idx] = { ...port, label: e.target.value };
                        onUpdateEntity(entity.id, { ports: updatedPorts });
                      }}
                      style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        const updatedPorts = entity.ports.filter((_, i) => i !== idx);
                        onUpdateEntity(entity.id, { ports: updatedPorts });
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
              Synchronized Verilog-HDL Hardware Source:
            </div>
            <textarea
              value={sourceCode}
              onChange={(e) => {
                onUpdateEntity(entity.id, {
                  data: { ...entity.data, sourceCode: e.target.value }
                });
              }}
              spellCheck={false}
              style={{
                flex: 1,
                minHeight: 400,
                backgroundColor: '#030712',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: 12,
                lineHeight: '1.5',
                padding: 12,
                borderRadius: 6,
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const tabBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  background: 'transparent',
  border: 'none',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer'
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 6,
  background: '#131b2e',
  border: '1px solid #1e293b',
  color: '#f8fafc',
  padding: '6px 10px',
  borderRadius: 4,
  fontSize: 12,
  boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '4px 8px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600
};
