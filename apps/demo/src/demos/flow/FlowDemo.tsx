import React, { useState } from 'react';
import {
  LogicalGraph,
  SysFlowCanvas,
  EdgeRewireStrategy,
  NodeEntity,
  ContainerEntity,
  LayoutDirection,
  useGraphHistory
} from '@sysflow/core';
import { Toolbar } from '../../components/Toolbar';
import { FlowNodeRenderer } from './FlowNodeRenderer';
import '@sysflow/core/dist/style.css';

const INITIAL_PIPELINE_GRAPH: LogicalGraph = {
  version: '2.0.0',
  containers: {},
  nodes: {},
  edges: {}
};

const rewireStrategy = new EdgeRewireStrategy();

export const FlowDemo: React.FC<{ theme?: 'dark' | 'light' }> = ({ theme }) => {
  const history = useGraphHistory(INITIAL_PIPELINE_GRAPH);
  const { graph, setGraphDirect, applyAction, deleteSelection } = history;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorNodeId, setEditorNodeId] = useState<string | null>(null);
  const direction: LayoutDirection = 'BT';

  const selectedNode = editorNodeId ? graph.nodes[editorNodeId] : null;

  return (
    <div style={{ width: '100vw', height: 'calc(100vh - 50px)', position: 'relative' }}>
      <Toolbar
        graph={graph}
        selectedIds={selectedIds}
        direction={direction}
        onAddNode={(label) => {
          const id = `task_${Date.now()}`;
          const isBT = direction === 'BT';
          setGraphDirect({
            ...graph,
            nodes: {
              ...graph.nodes,
              [id]: {
                id,
                label,
                type: 'FlowTask',
                ports: [
                  { id: `p_in_${Date.now()}`, label: 'in', side: isBT ? 'bottom' : 'top' },
                  { id: `p_out_${Date.now()}`, label: 'out', side: isBT ? 'top' : 'bottom' }
                ]
              }
            }
          });
        }}
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
        layoutOptions={{ mode: 'flow', channelSpacing: 30 }}
        showEdgeArrows={true}
        nodeTypes={{ FlowTask: FlowNodeRenderer }}
        selectedIds={selectedIds}
      />

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div style={editorStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: '#38bdf8' }}>Task Node Editor</h3>
            <button onClick={() => setEditorNodeId(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#94a3b8' }}>Task Name</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={(e) =>
                setGraphDirect({
                  ...graph,
                  nodes: {
                    ...graph.nodes,
                    [selectedNode.id]: { ...selectedNode, label: e.target.value }
                  }
                })
              }
              style={{ width: '100%', background: '#131b2e', border: '1px solid #1e293b', color: '#fff', padding: 6, borderRadius: 4 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const editorStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  right: 0,
  width: 340,
  height: '100%',
  background: '#090d16',
  borderLeft: '1px solid #1e293b',
  zIndex: 40,
  padding: 20,
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: 16
};
