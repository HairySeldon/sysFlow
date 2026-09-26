import React, { useState, useEffect } from 'react';
import {
  LogicalGraph,
  GraphAction,
  SysFlowCanvas,
  ReparentStrategy,
  NodeEntity,
  ContainerEntity
} from '@sysflow/core';
import { SysModuleRenderer } from './SysModuleEditor';
import { Toolbar } from '../../components/Toolbar';
import { InspectorDrawer } from '../../components/InspectorDrawer';
import { useGraphHistory } from '../../hooks/useGraphHistory';
import '@sysflow/core/dist/style.css';

const INITIAL_VERILOG_GRAPH: LogicalGraph = {
  version: '2.0.0',
  containers: {
    ALU_BLOCK: {
      id: 'ALU_BLOCK',
      label: 'module ALU (Arithmetic Logic Unit)',
      collapsed: false
    },
    REG_BANK: {
      id: 'REG_BANK',
      label: 'module RegisterBank',
      collapsed: false
    }
  },
  nodes: {
    CLK_GEN: {
      id: 'CLK_GEN',
      label: 'Clock_Oscillator',
      type: 'Module',
      ports: [{ id: 'out_clk', label: 'clk_out', data: { busWidth: '1b' } }],
      data: { logicGate: 'OSC', isClock: true }
    },
    ADDER: {
      id: 'ADDER',
      parentId: 'ALU_BLOCK',
      label: '32b_FullAdder',
      type: 'Module',
      ports: [
        { id: 'in_a', label: 'A', data: { busWidth: '32b' } },
        { id: 'in_b', label: 'B', data: { busWidth: '32b' } },
        { id: 'out_sum', label: 'SUM', data: { busWidth: '32b' } }
      ],
      data: { logicGate: 'ADDER_32' }
    },
    MULTIPLIER: {
      id: 'MULTIPLIER',
      parentId: 'ALU_BLOCK',
      label: 'WallaceTree_Mul',
      type: 'Module',
      ports: [
        { id: 'mul_a', label: 'A', data: { busWidth: '32b' } },
        { id: 'mul_b', label: 'B', data: { busWidth: '32b' } },
        { id: 'mul_out', label: 'PROD', data: { busWidth: '64b' } }
      ],
      data: { logicGate: 'MUL_32' }
    },
    REG_R0: {
      id: 'REG_R0',
      parentId: 'REG_BANK',
      label: 'R0_Register',
      type: 'Module',
      ports: [
        { id: 'd_in', label: 'D', data: { busWidth: '32b' } },
        { id: 'q_out', label: 'Q', data: { busWidth: '32b' } }
      ],
      data: { logicGate: 'DFF_32' }
    }
  },
  edges: {
    E1: {
      id: 'E1',
      sourceId: 'CLK_GEN',
      sourcePortId: 'out_clk',
      targetId: 'REG_R0',
      targetPortId: 'd_in'
    },
    E2: {
      id: 'E2',
      sourceId: 'REG_R0',
      sourcePortId: 'q_out',
      targetId: 'ADDER',
      targetPortId: 'in_a'
    },
    E3: {
      id: 'E3',
      sourceId: 'ADDER',
      sourcePortId: 'out_sum',
      targetId: 'REG_R0',
      targetPortId: 'd_in'
    }
  }
};

const reparentStrategy = new ReparentStrategy();

export const SysDemo: React.FC = () => {
  const {
    graph,
    setGraphDirect,
    applyAction,
    undo,
    redo,
    copyEntity,
    cutEntity,
    pasteEntity,
    deleteSelection
  } = useGraphHistory(INITIAL_VERILOG_GRAPH);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [direction, setDirection] = useState<'LR' | 'TB'>('LR');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [showConfigTable, setShowConfigTable] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedIds[0]) copyEntity(selectedIds[0]);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'x') {
        if (selectedIds[0]) cutEntity(selectedIds[0]);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        pasteEntity();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelection(selectedIds);
        setSelectedIds([]);
      } else if (e.key.toLowerCase() === 'n') {
        const name = prompt('New module label:', 'Module_Instance');
        if (name) handleAddNode(name, null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection]);

  const handleGraphChange = (action: GraphAction) => {
    if (action.type === 'SELECTION_CHANGE') {
      setSelectedIds(action.payload.selectedIds);
      if (action.payload.selectedIds.length > 0) {
        setInspectorOpen(true);
      }
    } else {
      applyAction(action);
    }
  };

  const handleAddNode = (label: string, parentId?: string | null) => {
    const id = `node_${Date.now()}`;
    const newNode: NodeEntity = {
      id,
      label,
      parentId: parentId || null,
      type: 'Module',
      ports: [{ id: `p_${Date.now()}`, label: 'port_1', data: { busWidth: '32b' } }],
      data: { logicGate: 'CUSTOM_LOGIC' }
    };
    setGraphDirect({ ...graph, nodes: { ...graph.nodes, [id]: newNode } });
  };

  const handleAddContainer = (label: string) => {
    const id = `cnt_${Date.now()}`;
    const newContainer: ContainerEntity = {
      id,
      label,
      collapsed: false
    };
    setGraphDirect({ ...graph, containers: { ...graph.containers, [id]: newContainer } });
  };

  const handleUpdateEntity = (
    id: string,
    updates: Partial<NodeEntity | ContainerEntity>,
    cleanGraph?: LogicalGraph
  ) => {
    if (cleanGraph) {
      setGraphDirect(cleanGraph);
      return;
    }

    if (graph.nodes[id]) {
      setGraphDirect({
        ...graph,
        nodes: { ...graph.nodes, [id]: { ...graph.nodes[id], ...updates } }
      });
    } else if (graph.containers[id]) {
      setGraphDirect({
        ...graph,
        containers: { ...graph.containers, [id]: { ...graph.containers[id], ...updates } }
      });
    }
  };

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 50px)', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 20,
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '10px 16px',
          color: '#f8fafc',
          fontSize: '12px',
          maxWidth: 440
        }}
      >
        <strong style={{ color: '#38bdf8' }}>Interactive Sys CAD:</strong>
        <ul style={{ margin: '4px 0 0 16px', padding: 0, lineHeight: 1.6 }}>
          <li><strong>Config Table:</strong> Click "Config Table" in toolbar to view and edit all modules and ports.</li>
          <li><strong>Keys:</strong> <code>Tab</code>/<code>Arrows</code> | <code>F</code> (Fit) | <code>Ctrl+A</code> | <code>Del</code>.</li>
        </ul>
      </div>

      <Toolbar
        graph={graph}
        selectedIds={selectedIds}
        direction={direction}
        onToggleDirection={() => setDirection((prev) => (prev === 'LR' ? 'TB' : 'LR'))}
        onAddNode={handleAddNode}
        onAddContainer={handleAddContainer}
        onDeleteSelected={() => {
          deleteSelection(selectedIds);
          setSelectedIds([]);
        }}
        onUpdateGraph={setGraphDirect}
        extraActions={
          <button
            style={{
              background: showConfigTable ? '#38bdf8' : '#1e293b',
              color: showConfigTable ? '#0f172a' : '#f8fafc',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700
            }}
            onClick={() => setShowConfigTable(!showConfigTable)}
          >
            📋 Config Table
          </button>
        }
      />

      <SysFlowCanvas
        graph={graph}
        onChange={handleGraphChange}
        interactionStrategy={reparentStrategy}
        direction={direction}
        layoutOptions={{ mode: 'concurrent' }}
        nodeTypes={{ Module: SysModuleRenderer }}
        selectedIds={selectedIds}
      />

      {/* Demo 1 Configuration Table Modal */}
      {showConfigTable && (
        <div
          style={{
            position: 'absolute',
            top: 70,
            left: 20,
            right: 20,
            bottom: 20,
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: 8,
            zIndex: 60,
            boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '12px 20px',
              background: '#0b1120',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ margin: 0, color: '#38bdf8', fontSize: 16 }}>
              System Configuration Table: Modules & Ports
            </h3>
            <button
              onClick={() => setShowConfigTable(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#1e293b', textAlign: 'left' }}>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>ID / Label</th>
                  <th style={thStyle}>Parent</th>
                  <th style={thStyle}>Ports ({Object.values(graph.nodes).reduce((acc, n) => acc + n.ports.length, 0)} total)</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Modules */}
                {Object.values(graph.nodes).map((node) => (
                  <tr key={node.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={tdStyle}><span style={{ color: '#38bdf8', fontWeight: 600 }}>Module</span></td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={node.label}
                        onChange={(e) => handleUpdateEntity(node.id, { label: e.target.value })}
                        style={tableInputStyle}
                      />
                    </td>
                    <td style={tdStyle}>
                      <select
                        value={node.parentId || ''}
                        onChange={(e) => handleUpdateEntity(node.id, { parentId: e.target.value || null })}
                        style={tableInputStyle}
                      >
                        <option value="">(Root)</option>
                        {Object.values(graph.containers).map((c) => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {node.ports.map((p, pIdx) => (
                          <span
                            key={p.id}
                            style={{
                              background: '#131b2e',
                              border: '1px solid #334155',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 11
                            }}
                          >
                            {p.label}
                            <button
                              onClick={() => {
                                const nextPorts = node.ports.filter((_, i) => i !== pIdx);
                                handleUpdateEntity(node.id, { ports: nextPorts });
                              }}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', marginLeft: 4, cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                        <button
                          onClick={() => {
                            const name = prompt('Port name:');
                            if (name) {
                              handleUpdateEntity(node.id, {
                                ports: [...node.ports, { id: `p_${Date.now()}`, label: name }]
                              });
                            }
                          }}
                          style={{ ...tableInputStyle, width: 'auto', cursor: 'pointer' }}
                        >
                          + Port
                        </button>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteSelection([node.id])}
                        style={{ background: '#7f1d1d', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Subsystems / Containers */}
                {Object.values(graph.containers).map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #1e293b', background: 'rgba(30, 41, 59, 0.3)' }}>
                    <td style={tdStyle}><span style={{ color: '#a855f7', fontWeight: 600 }}>Container</span></td>
                    <td style={tdStyle}>
                      <input
                        type="text"
                        value={c.label}
                        onChange={(e) => handleUpdateEntity(c.id, { label: e.target.value })}
                        style={tableInputStyle}
                      />
                    </td>
                    <td style={tdStyle}><span style={{ opacity: 0.5 }}>-</span></td>
                    <td style={tdStyle}>
                      <span style={{ opacity: 0.4 }}>N/A (Group Container)</span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => deleteSelection([c.id])}
                        style={{ background: '#7f1d1d', border: 'none', color: '#fff', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {inspectorOpen && !showConfigTable && (
        <InspectorDrawer
          graph={graph}
          selectedIds={selectedIds}
          onClose={() => setInspectorOpen(false)}
          onUpdateEntity={handleUpdateEntity}
        />
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '2px solid #334155'
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px'
};

const tableInputStyle: React.CSSProperties = {
  background: '#131b2e',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '4px 8px',
  borderRadius: 4,
  fontSize: 12
};
