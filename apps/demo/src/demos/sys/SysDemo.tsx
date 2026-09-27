import React, { useState, useEffect, useRef } from 'react';
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
import {
  SourceConfig,
  DEFAULT_SOURCE_CONFIG,
  readTextFile,
  writeTextFile
} from '../../utils/fileSystem';

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

interface SysDemoProps {
  theme?: 'dark' | 'light';
}

export const SysDemo: React.FC<SysDemoProps> = ({ theme }) => {
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
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // File System & Configuration State
  const [sourceConfig, setSourceConfig] = useState<SourceConfig>(DEFAULT_SOURCE_CONFIG);
  const [projectDirHandle, setProjectDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [currentFileContent, setCurrentFileContent] = useState<string | undefined>(undefined);

  const configFileUploadRef = useRef<HTMLInputElement | null>(null);
  const direction = 'LR' as const;

  const activeNodeId = selectedIds[0] && graph.nodes[selectedIds[0]] ? selectedIds[0] : null;
  const activeFilePath = activeNodeId ? sourceConfig.mappings[activeNodeId] : null;

  // Whenever a node is opened, read its bound source code from disk
  useEffect(() => {
    let isCancelled = false;

    const loadSource = async () => {
      if (!activeNodeId) {
        setCurrentFileContent(undefined);
        return;
      }

      if (projectDirHandle && activeFilePath) {
        try {
          const content = await readTextFile(projectDirHandle, activeFilePath);
          if (!isCancelled) setCurrentFileContent(content);
          return;
        } catch (err) {
          console.warn(`File "${activeFilePath}" not found on disk, using cached template.`, err);
        }
      }

      // Fallback: graph node data or undefined
      if (!isCancelled) {
        setCurrentFileContent(graph.nodes[activeNodeId]?.data?.sourceCode as string | undefined);
      }
    };

    loadSource();

    return () => {
      isCancelled = true;
    };
  }, [activeNodeId, activeFilePath, projectDirHandle]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'Escape') {
        setSelectedIds([]);
        setInspectorOpen(false);
        setShowConfigModal(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (selectedIds[0]) copyEntity(selectedIds[0]);
      } else if (!e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCreateContainerForSelection();
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
  }, [selectedIds, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection, graph]);

  // Select project directory on disk
  const handleSelectProjectFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Your browser does not support the File System Access API. Please use Chrome, Edge, or Opera.');
      return;
    }
    try {
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setProjectDirHandle(dirHandle);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Directory picker error:', err);
      }
    }
  };

  // Save source code back to disk
  const handleSaveNodeSource = async (newContent: string): Promise<boolean> => {
    if (!activeNodeId) return false;

    if (!activeFilePath) {
      alert('This module has no source file path assigned in Configuration.');
      return false;
    }

    if (!projectDirHandle) {
      // Prompt user to select project folder if not yet chosen
      if ('showDirectoryPicker' in window) {
        const confirmPicker = confirm(
          `Project root folder is not linked yet.\nWould you like to select the project root folder to save "${activeFilePath}"?`
        );
        if (confirmPicker) {
          try {
            const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
            setProjectDirHandle(dirHandle);
            await writeTextFile(dirHandle, activeFilePath, newContent);
            setCurrentFileContent(newContent);
            handleUpdateEntity(activeNodeId, {
              data: { ...graph.nodes[activeNodeId]?.data, sourceCode: newContent }
            });
            return true;
          } catch (e) {
            return false;
          }
        }
      }
      return false;
    }

    try {
      await writeTextFile(projectDirHandle, activeFilePath, newContent);
      setCurrentFileContent(newContent);
      handleUpdateEntity(activeNodeId, {
        data: { ...graph.nodes[activeNodeId]?.data, sourceCode: newContent }
      });
      return true;
    } catch (err) {
      console.error('Failed to write file to disk:', err);
      alert(`Failed to write file: ${(err as Error).message}`);
      return false;
    }
  };

  // Config JSON: Save to file
  const handleSaveConfigJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sourceConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'sysflow.config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Config JSON: Load from file
  const handleLoadConfigJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || typeof parsed !== 'object' || typeof parsed.mappings !== 'object') {
          throw new Error('Config file must contain a "mappings" object map.');
        }
        setSourceConfig(parsed as SourceConfig);
      } catch (err) {
        alert(`Failed to load config JSON:\n${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpdateMapping = (nodeId: string, path: string) => {
    setSourceConfig((prev) => ({
      ...prev,
      mappings: {
        ...prev.mappings,
        [nodeId]: path
      }
    }));
  };

  const handleCreateContainerForSelection = () => {
    const containerId = `cnt_${Date.now()}`;
    const label = prompt('Container Name:', 'Subsystem_Block');
    if (!label) return;

    const newContainer: ContainerEntity = {
      id: containerId,
      label,
      collapsed: false
    };

    const updatedNodes = { ...graph.nodes };
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => {
        if (updatedNodes[id]) {
          updatedNodes[id] = { ...updatedNodes[id], parentId: containerId };
        }
      });
    }

    setGraphDirect({
      ...graph,
      containers: { ...graph.containers, [containerId]: newContainer },
      nodes: updatedNodes
    });
  };

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
    handleUpdateMapping(id, `rtl/${label.toLowerCase()}.v`);
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
      <Toolbar
        graph={graph}
        selectedIds={selectedIds}
        direction={direction}
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
              background: showConfigModal ? '#38bdf8' : '#1e293b',
              color: showConfigModal ? '#0f172a' : '#f8fafc',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700
            }}
            onClick={() => setShowConfigModal(!showConfigModal)}
            title="Open Module-to-File Source Configuration"
          >
            ⚙ Source Config
          </button>
        }
      />

      <SysFlowCanvas
        theme={theme}
        graph={graph}
        onChange={handleGraphChange}
        interactionStrategy={reparentStrategy}
        direction="LR"
        routing="step"
        portPlacementMode="perimeter-optimized"
        layoutOptions={{ mode: 'concurrent', channelSpacing: 60 }}
        nodeTypes={{ Module: SysModuleRenderer }}
        selectedIds={selectedIds}
      />

      {/* Source Configuration Modal (Dedicated to Module -> File Path Mapping) */}
      {showConfigModal && (
        <div
          style={{
            position: 'absolute',
            top: 60,
            left: 40,
            right: 40,
            bottom: 40,
            background: '#090d16',
            border: '1px solid #334155',
            borderRadius: 8,
            zIndex: 60,
            boxShadow: '0 16px 48px rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 20px',
              background: '#0b1120',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h3 style={{ margin: 0, color: '#38bdf8', fontSize: 16 }}>
                Source Code Configuration Editor
              </h3>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                Map schematic modules to HDL source code file paths on disk.
              </span>
            </div>
            <button
              onClick={() => setShowConfigModal(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20 }}
            >
              ✕
            </button>
          </div>

          {/* Directory & Config Bar */}
          <div
            style={{
              padding: '12px 20px',
              background: '#0f172a',
              borderBottom: '1px solid #1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={handleSelectProjectFolder}
                style={{
                  background: projectDirHandle ? '#0284c7' : '#1e293b',
                  border: '1px solid #38bdf8',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12
                }}
              >
                📁 {projectDirHandle ? `Project: ${projectDirHandle.name}` : 'Select Project Root Folder'}
              </button>
              {projectDirHandle && (
                <span style={{ fontSize: 11, color: '#4ade80' }}>Connected to local file system ✓</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={configFileUploadRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleLoadConfigJson}
              />
              <button
                onClick={() => configFileUploadRef.current?.click()}
                style={modalBtnStyle}
              >
                Load Config JSON
              </button>
              <button
                onClick={handleSaveConfigJson}
                style={{ ...modalBtnStyle, background: '#0284c7', borderColor: '#38bdf8' }}
              >
                Save Config JSON
              </button>
            </div>
          </div>

          {/* Table: Modules <-> File Paths */}
          <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#1e293b', textAlign: 'left' }}>
                  <th style={thStyle}>Module ID</th>
                  <th style={thStyle}>Module Name</th>
                  <th style={thStyle}>Source File Path (relative to project root)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(graph.nodes).map((node) => {
                  const currentPath = sourceConfig.mappings[node.id] || '';
                  return (
                    <tr key={node.id} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={tdStyle}>
                        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 600 }}>
                          {node.id}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 600 }}>{node.label}</span>
                      </td>
                      <td style={tdStyle}>
                        <input
                          type="text"
                          value={currentPath}
                          placeholder={`rtl/${node.label.toLowerCase()}.v`}
                          onChange={(e) => handleUpdateMapping(node.id, e.target.value)}
                          style={{
                            width: '100%',
                            background: '#131b2e',
                            border: '1px solid #334155',
                            color: '#38bdf8',
                            fontFamily: 'monospace',
                            padding: '6px 10px',
                            borderRadius: 4,
                            fontSize: 12
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Module / Node Inspector Drawer */}
      {inspectorOpen && !showConfigModal && (
        <InspectorDrawer
          graph={graph}
          selectedIds={selectedIds}
          boundFilePath={activeFilePath}
          initialSourceCode={currentFileContent}
          onSaveSource={handleSaveNodeSource}
          onClose={() => setInspectorOpen(false)}
          onUpdateEntity={handleUpdateEntity}
        />
      )}
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderBottom: '2px solid #334155'
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px'
};

const modalBtnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600
};
