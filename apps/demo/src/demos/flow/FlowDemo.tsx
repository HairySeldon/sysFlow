import React, { useState, useCallback } from 'react';
import {
  LogicalGraph,
  SysFlowCanvas,
  EdgeRewireStrategy,
  NodeEntity,
  LayoutDirection,
  useGraphHistory
} from '@sysflow/core';
import { Toolbar } from '../../components/Toolbar';
import { FlowNodeRenderer } from './FlowNodeRenderer';
import '@sysflow/core/dist/style.css';

const INITIAL_PIPELINE_GRAPH: LogicalGraph = {
  version: '2.0.0',
  containers: {},
  nodes: {
    task_1: {
      id: 'task_1',
      label: 'Fetch Raw Data',
      type: 'FlowTask',
      ports: [
        { id: 'p_in_1', label: 'in', side: 'bottom' },
        { id: 'p_out_1', label: 'out', side: 'top' }
      ],
      data: { status: 'completed', description: 'Query batch API endpoint' }
    },
    task_2: {
      id: 'task_2',
      label: 'Transform & Normalize',
      type: 'FlowTask',
      ports: [
        { id: 'p_in_2', label: 'in', side: 'bottom' },
        { id: 'p_out_2', label: 'out', side: 'top' }
      ],
      data: { status: 'running', description: 'Clean data frames' }
    },
    task_3: {
      id: 'task_3',
      label: 'Export Artifacts',
      type: 'FlowTask',
      ports: [
        { id: 'p_in_3', label: 'in', side: 'bottom' },
        { id: 'p_out_3', label: 'out', side: 'top' }
      ],
      data: { status: 'ready', description: 'Upload artifacts to S3' }
    }
  },
  edges: {
    e_1_2: {
      id: 'e_1_2',
      sourceId: 'task_1',
      sourcePortId: 'p_out_1',
      targetId: 'task_2',
      targetPortId: 'p_in_2'
    },
    e_2_3: {
      id: 'e_2_3',
      sourceId: 'task_2',
      sourcePortId: 'p_out_2',
      targetId: 'task_3',
      targetPortId: 'p_in_3'
    }
  }
};

const rewireStrategy = new EdgeRewireStrategy();

export const FlowDemo: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorNodeId, setEditorNodeId] = useState<string | null>(null);
  const [direction, setDirection] = useState<LayoutDirection>('BT');

  // Provide factory to useGraphHistory for generating connected and spliced nodes
  const history = useGraphHistory(INITIAL_PIPELINE_GRAPH, {
    createNodeEntity: (context) => {
      const isBT = (context.direction || direction) === 'BT';
      const isTB = (context.direction || direction) === 'TB';
      const inSide = isBT ? 'bottom' : isTB ? 'top' : 'left';
      const outSide = isBT ? 'top' : isTB ? 'bottom' : 'right';

      const inPortId = `p_in_${Date.now()}`;
      const outPortId = `p_out_${Date.now() + 1}`;

      return {
        type: context.suggestedType || 'FlowTask',
        label: `Task ${Date.now().toString().slice(-4)}`,
        ports: [
          { id: inPortId, label: 'in', side: inSide },
          { id: outPortId, label: 'out', side: outSide }
        ],
        data: { status: 'ready', description: 'Pipeline task' }
      };
    }
  });

  const { graph, setGraphDirect, applyAction, deleteSelection } = history;
  const selectedNode = editorNodeId ? graph.nodes[editorNodeId] : null;

  // Add node from toolbar
  const handleAddToolbarNode = useCallback(
    (label: string) => {
      const id = `task_${Date.now()}`;
      const isBT = direction === 'BT';
      const isTB = direction === 'TB';
      const inSide = isBT ? 'bottom' : isTB ? 'top' : 'left';
      const outSide = isBT ? 'top' : isTB ? 'bottom' : 'right';

      const newNode: NodeEntity = {
        id,
        label: label || 'New Task',
        type: 'FlowTask',
        parentId: null,
        ports: [
          { id: `p_in_${Date.now()}`, label: 'in', side: inSide },
          { id: `p_out_${Date.now() + 1}`, label: 'out', side: outSide }
        ],
        data: { status: 'ready', description: 'Pipeline task' }
      };

      setGraphDirect({
        ...graph,
        nodes: {
          ...graph.nodes,
          [id]: newNode
        }
      });
      setSelectedIds([id]);
      setEditorNodeId(id);
    },
    [direction, graph, setGraphDirect]
  );

  // Update node properties in inspector
  const handleUpdateNode = useCallback(
    (id: string, updates: Partial<NodeEntity>) => {
      if (!graph.nodes[id]) return;
      setGraphDirect({
        ...graph,
        nodes: {
          ...graph.nodes,
          [id]: { ...graph.nodes[id], ...updates }
        }
      });
    },
    [graph, setGraphDirect]
  );

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 50px)', position: 'relative' }}>
      <Toolbar
        graph={graph}
        selectedIds={selectedIds}
        direction={direction}
        onToggleDirection={() => setDirection((d) => (d === 'BT' ? 'TB' : 'BT'))}
        onAddNode={handleAddToolbarNode}
        onAddContainer={(label) => {
          const id = `stage_${Date.now()}`;
          setGraphDirect({
            ...graph,
            containers: { ...graph.containers, [id]: { id, label, collapsed: false } }
          });
        }}
        onDeleteSelected={() => {
          deleteSelection(selectedIds);
          setSelectedIds([]);
          setEditorNodeId(null);
        }}
        onUpdateGraph={setGraphDirect}
      />

      <SysFlowCanvas
        theme={theme}
        graph={graph}
        history={history}
        onChange={(action) => {
          if (action.type === 'SELECTION_CHANGE') {
            setSelectedIds(action.payload.selectedIds);
            setEditorNodeId(action.payload.selectedIds[0] || null);
          } else {
            applyAction(action);
          }
        }}
        onNodeClick={(id) => setEditorNodeId(id)}
        interactionStrategy={rewireStrategy}
        direction={direction}
        routing="bezier"
        portPlacementMode="strict-flow"
        layoutOptions={{ mode: 'flow', channelSpacing: 35 }}
        showEdgeArrows={true}
        nodeTypes={{ FlowTask: FlowNodeRenderer }}
        selectedIds={selectedIds}
      />

      {/* Task Properties Drawer */}
      {selectedNode && (
        <div style={editorStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#38bdf8', fontSize: 16 }}>Task Properties</h3>
            <button
              onClick={() => setEditorNodeId(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 16 }}
            >
              ✕
            </button>
          </div>

          <div>
            <label style={labelStyle}>Task Label</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={(e) => handleUpdateNode(selectedNode.id, { label: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Execution Status</label>
            <select
              value={(selectedNode.data?.status as string) || 'ready'}
              onChange={(e) =>
                handleUpdateNode(selectedNode.id, {
                  data: { ...selectedNode.data, status: e.target.value }
                })
              }
              style={inputStyle}
            >
              <option value="ready">Ready</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={(selectedNode.data?.description as string) || ''}
              onChange={(e) =>
                handleUpdateNode(selectedNode.id, {
                  data: { ...selectedNode.data, description: e.target.value }
                })
              }
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #1e293b' }}>
            <button
              onClick={() => {
                deleteSelection([selectedNode.id]);
                setEditorNodeId(null);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                backgroundColor: '#7f1d1d',
                border: '1px solid #ef4444',
                color: '#ffffff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Delete Task Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#131b2e',
  border: '1px solid #1e293b',
  color: '#f8fafc',
  padding: '8px 10px',
  borderRadius: 4,
  boxSizing: 'border-box',
  fontSize: 13
};

const editorStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: 320,
  height: '100%',
  background: '#0b1120',
  borderLeft: '1px solid #1e293b',
  zIndex: 40,
  padding: 20,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  boxShadow: '-8px 0 24px rgba(0,0,0,0.5)'
};
