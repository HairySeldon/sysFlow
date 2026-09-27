import React, { useState, useEffect } from 'react';
import { LogicalGraph, NodeEntity, ContainerEntity, Port, pruneDanglingEdges } from '@sysflow/core';

interface InspectorDrawerProps {
  graph: LogicalGraph;
  selectedIds: string[];
  boundFilePath?: string | null;
  initialSourceCode?: string;
  onSaveSource?: (code: string) => Promise<boolean>;
  onClose: () => void;
  onUpdateEntity: (id: string, updates: Partial<NodeEntity | ContainerEntity>, prunedGraph?: LogicalGraph) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  graph,
  selectedIds,
  boundFilePath,
  initialSourceCode,
  onSaveSource,
  onClose,
  onUpdateEntity
}) => {
  const [activeTab, setActiveTab] = useState<'source' | 'properties'>('source');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const selectedId = selectedIds[0];
  const selectedNode = selectedId ? graph.nodes[selectedId] : null;
  const selectedContainer = selectedId ? graph.containers[selectedId] : null;

  const entity = (selectedNode || selectedContainer)!;
  const isNode = Boolean(selectedNode);

  const defaultTemplate = isNode && selectedNode
    ? `// Module: ${entity.label}\n` +
      `module ${entity.label.replace(/[^a-zA-Z0-9_]/g, '_')} (\n` +
      selectedNode.ports.map((p: Port) => `  input wire [31:0] ${p.label}`).join(',\n') +
      `\n);\n\n` +
      `  // Internal signals & registers\n` +
      `  reg [31:0] internal_reg;\n\n` +
      `  always @(posedge clk) begin\n` +
      `    // Pipeline execution logic\n` +
      `    internal_reg <= 32'h0;\n` +
      `  end\n\n` +
      `endmodule\n`
    : `// Container: ${entity.label}\n`;

  // Sync initial code whenever selected entity or loaded initialSourceCode changes
  useEffect(() => {
    const code = initialSourceCode ?? (entity?.data?.sourceCode as string) ?? defaultTemplate;
    setSourceCode(code);
    setIsDirty(false);
    setSaveStatus('');
  }, [selectedId, initialSourceCode]);

  if (!selectedNode && !selectedContainer) return null;

  const handleSave = async () => {
    if (onSaveSource) {
      setSaveStatus('Saving...');
      const success = await onSaveSource(sourceCode);
      if (success) {
        setIsDirty(false);
        setSaveStatus('Saved to disk ✓');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Save failed ✕');
      }
    } else {
      // In-memory fallback
      onUpdateEntity(entity.id, {
        data: { ...entity.data, sourceCode }
      });
      setIsDirty(false);
      setSaveStatus('Saved in-memory ✓');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleClose = async () => {
    if (isDirty) {
      await handleSave();
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const handleUpdatePorts = (updatedPorts: Port[]) => {
    if (!selectedNode) return;
    const nextGraph: LogicalGraph = {
      ...graph,
      nodes: {
        ...graph.nodes,
        [selectedNode.id]: { ...selectedNode, ports: updatedPorts }
      }
    };
    const cleanGraph = pruneDanglingEdges(nextGraph);
    onUpdateEntity(selectedNode.id, { ports: updatedPorts }, cleanGraph);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 640,
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
          {isDirty && (
            <span style={{ fontSize: 10, color: '#f59e0b', background: '#451a03', padding: '2px 6px', borderRadius: 4 }}>
              Unsaved changes
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
          title="Save & Close"
        >
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
          Source Code (HDL)
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          style={{
            ...tabBtnStyle,
            borderBottom: activeTab === 'properties' ? '2px solid #38bdf8' : 'none',
            color: activeTab === 'properties' ? '#38bdf8' : '#94a3b8'
          }}
        >
          Ports & Meta
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {activeTab === 'source' ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Path:</span>
                <span
                  style={{
                    fontSize: 12,
                    color: boundFilePath ? '#38bdf8' : '#f59e0b',
                    fontWeight: 600,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden'
                  }}
                  title={boundFilePath || 'No file bound in Config'}
                >
                  {boundFilePath || '(Not bound in config)'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {saveStatus && (
                  <span style={{ fontSize: 11, color: saveStatus.includes('✓') ? '#4ade80' : '#f87171' }}>
                    {saveStatus}
                  </span>
                )}
                <button
                  style={{
                    ...btnStyle,
                    background: isDirty ? '#0284c7' : '#1e293b',
                    borderColor: isDirty ? '#38bdf8' : '#334155'
                  }}
                  onClick={handleSave}
                >
                  Save (Ctrl+S)
                </button>
              </div>
            </div>

            <textarea
              value={sourceCode}
              onChange={(e) => {
                setSourceCode(e.target.value);
                setIsDirty(true);
              }}
              onKeyDown={handleKeyDown}
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

            {selectedNode && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>Ports & Pins ({selectedNode.ports.length})</label>
                  <button
                    style={{ ...btnStyle, fontSize: 11 }}
                    onClick={() => {
                      const name = prompt('New port label (e.g. data_in, clk):', 'port_1');
                      if (name) {
                        handleUpdatePorts([
                          ...selectedNode.ports,
                          { id: `p_${Date.now()}`, label: name, data: { busWidth: '32b' } }
                        ]);
                      }
                    }}
                  >
                    + Add Port
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                  {selectedNode.ports.map((port: Port, idx: number) => (
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
                          const updated = [...selectedNode.ports];
                          updated[idx] = { ...port, label: e.target.value };
                          handleUpdatePorts(updated);
                        }}
                        style={{ ...inputStyle, marginTop: 0, flex: 2 }}
                      />

                      <button
                        onClick={() => {
                          const updated = selectedNode.ports.filter((_: Port, i: number) => i !== idx);
                          handleUpdatePorts(updated);
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Delete Port"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
  padding: '6px 12px',
  borderRadius: 4,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 12
};
