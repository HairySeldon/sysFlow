import React, { useState, useRef } from 'react';
import { LogicalGraph, NodeEntity, ContainerEntity, PortSide, PortDirection, pruneDanglingEdges } from '@sysflow/core';

interface InspectorDrawerProps {
  graph: LogicalGraph;
  selectedIds: string[];
  onClose: () => void;
  onUpdateEntity: (id: string, updates: Partial<NodeEntity | ContainerEntity>, prunedGraph?: LogicalGraph) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  graph,
  selectedIds,
  onClose,
  onUpdateEntity
}) => {
  const [activeTab, setActiveTab] = useState<'source' | 'properties'>('source');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedId = selectedIds[0];
  const selectedNode = selectedId ? graph.nodes[selectedId] : null;
  const selectedContainer = selectedId ? graph.containers[selectedId] : null;

  if (!selectedNode && !selectedContainer) return null;

  const entity = (selectedNode || selectedContainer)!;
  const isNode = Boolean(selectedNode);

  const defaultTemplate =
    `// Module: ${entity.label}\n` +
    `module ${entity.label.replace(/[^a-zA-Z0-9_]/g, '_')} (\n` +
    entity.ports.map((p) => `  input wire [31:0] ${p.label}`).join(',\n') +
    `\n);\n\n` +
    `  // Internal signals & registers\n` +
    `  reg [31:0] internal_reg;\n\n` +
    `  always @(posedge clk) begin\n` +
    `    // Pipeline execution logic\n` +
    `    internal_reg <= 32'h0;\n` +
    `  end\n\n` +
    `endmodule\n`;

  const sourceCode = (entity.data?.sourceCode as string) || defaultTemplate;

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      onUpdateEntity(entity.id, {
        data: { ...entity.data, sourceCode: content, boundFile: file.name }
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveFile = () => {
    const blob = new Blob([sourceCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entity.label.replace(/[^a-zA-Z0-9_]/g, '_')}.v`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleUpdatePorts = (updatedPorts: typeof entity.ports) => {
    // 1. Construct temporary next graph state
    const nextGraph: LogicalGraph = {
      ...graph,
      nodes: isNode ? { ...graph.nodes, [entity.id]: { ...entity, ports: updatedPorts } as NodeEntity } : graph.nodes,
      containers: !isNode ? { ...graph.containers, [entity.id]: { ...entity, ports: updatedPorts } as ContainerEntity } : graph.containers
    };

    // 2. Prune edges referencing deleted ports
    const cleanGraph = pruneDanglingEdges(nextGraph);

    // 3. Dispatch update
    onUpdateEntity(entity.id, { ports: updatedPorts }, cleanGraph);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 620,
        height: '100%',
        backgroundColor: '#090d16',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.7)',
        color: '#f8fafc'
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 52,
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: '#0b1120'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#38bdf8' }}>
            {isNode ? 'Module Inspector' : 'Container Inspector'}
          </span>
          <span style={{ fontSize: 11, background: '#1e293b', padding: '2px 8px', borderRadius: 4, color: '#94a3b8' }}>
            {entity.id}
          </span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1e293b', backgroundColor: '#0f172a' }}>
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
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            ...tabBtnStyle,
            borderBottom: activeTab === 'properties' ? '2px solid #38bdf8' : 'none',
            color: activeTab === 'properties' ? '#38bdf8' : '#94a3b8'
          }}
        >
          Configuration & Ports
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {activeTab === 'source' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                Bound Source: <strong>{String(entity.data?.boundFile || `${entity.label}.v`)}</strong>
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <input ref={fileInputRef} type="file" accept=".v,.sv,.vhd,.txt" style={{ display: 'none' }} onChange={handleOpenFile} />
                <button style={{ ...btnStyle, fontSize: 11 }} onClick={() => fileInputRef.current?.click()}>
                  Open HDL File...
                </button>
                <button style={{ ...btnStyle, fontSize: 11 }} onClick={handleSaveFile}>
                  Export .v File
                </button>
              </div>
            </div>
            <textarea
              value={sourceCode}
              onChange={(e) =>
                onUpdateEntity(entity.id, {
                  data: { ...entity.data, sourceCode: e.target.value }
                })
              }
              spellCheck={false}
              style={{
                flex: 1,
                minHeight: 480,
                backgroundColor: '#030712',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                fontSize: 12.5,
                lineHeight: '1.6',
                padding: 16,
                borderRadius: 6,
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <label style={labelStyle}>Parent Container</label>
              <select
                value={entity.parentId || ''}
                onChange={(e) => onUpdateEntity(entity.id, { parentId: e.target.value || null })}
                style={inputStyle}
              >
                <option value="">Canvas Root (No Parent Container)</option>
                {Object.values(graph.containers).map((c) => (
                  <option key={c.id} value={c.id} disabled={c.id === entity.id}>
                    {c.label} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Ports Section with side and direction controls */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={labelStyle}>Ports & Pins ({entity.ports.length})</label>
                <button
                  style={{ ...btnStyle, fontSize: 11 }}
                  onClick={() => {
                    const name = prompt('New port label (e.g. data_in, clk):', 'port_1');
                    if (name) {
                      handleUpdatePorts([
                        ...entity.ports,
                        { id: `p_${Date.now()}`, label: name, side: 'auto', direction: 'out', data: { busWidth: '32b' } }
                      ]);
                    }
                  }}
                >
                  + Add Port
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {entity.ports.map((port, idx) => (
                  <div
                    key={port.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: '#131b2e',
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid #1e293b'
                    }}
                  >
                    <span style={{ fontSize: 11, color: '#38bdf8', fontWeight: 600 }}>#{idx + 1}</span>
                    <input
                      type="text"
                      value={port.label}
                      onChange={(e) => {
                        const updated = [...entity.ports];
                        updated[idx] = { ...port, label: e.target.value };
                        handleUpdatePorts(updated);
                      }}
                      style={{ ...inputStyle, marginTop: 0, flex: 2 }}
                    />

                    {/* Perimeter Side Selection */}
                    <select
                      value={port.side || 'auto'}
                      onChange={(e) => {
                        const updated = [...entity.ports];
                        updated[idx] = { ...port, side: e.target.value as PortSide };
                        handleUpdatePorts(updated);
                      }}
                      style={{ ...inputStyle, marginTop: 0, flex: 1.2 }}
                      title="Perimeter Edge Side"
                    >
                      <option value="auto">Auto Side</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                    </select>

                    {/* Direction Selection */}
                    <select
                      value={port.direction || 'out'}
                      onChange={(e) => {
                        const updated = [...entity.ports];
                        updated[idx] = { ...port, direction: e.target.value as PortDirection };
                        handleUpdatePorts(updated);
                      }}
                      style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                      title="Port Flow Direction"
                    >
                      <option value="in">In</option>
                      <option value="out">Out</option>
                      <option value="inout">InOut</option>
                    </select>

                    <button
                      onClick={() => {
                        const updated = entity.ports.filter((_, i) => i !== idx);
                        handleUpdatePorts(updated);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      title="Delete Port and Connected Edges"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const tabBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '12px 0',
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
  padding: '8px 12px',
  borderRadius: 4,
  fontSize: 12,
  boxSizing: 'border-box'
};

const btnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '6px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600
};
