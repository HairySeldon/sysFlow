import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LogicalGraph,
  GraphAction,
  SysFlowCanvas,
  EdgeRewireStrategy,
  NodeEntity,
  ContainerEntity,
  Port,
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

interface FlowDemoProps {
  theme?: 'dark' | 'light';
}


export const FlowDemo: React.FC<FlowDemoProps> = ({ theme }) => {
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
  } = useGraphHistory(INITIAL_PIPELINE_GRAPH);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editorNodeId, setEditorNodeId] = useState<string | null>(null);
  const direction = 'TB' as const;

  const selectedNode = editorNodeId ? graph.nodes[editorNodeId] : null;

  // Handler for Top (+) and Bottom (+) shadow buttons
  const handleAddConnectedNode = useCallback(
    (currentNode: NodeEntity, position: 'top' | 'bottom') => {
      const newId = `task_${Date.now()}`;
      const inPortId = `p_in_${Date.now()}`;
      const outPortId = `p_out_${Date.now()}`;

      const newNode: NodeEntity = {
        id: newId,
        label: `Task: Sub-Process ${Object.keys(graph.nodes).length + 1}`,
        type: 'FlowTask',
        ports: [
          { id: inPortId, label: 'in', side: 'bottom' },
          { id: outPortId, label: 'out', side: 'top' }
        ],
      };

      const edgeId = `edge_${Date.now()}`;

      let currentInPort = currentNode.ports.find((p) => p.side === 'bottom' || p.label === 'in');
      let currentOutPort = currentNode.ports.find((p) => p.side === 'top' || p.label === 'out');

      // Guarantee fallback ports if node lacks them
      if (!currentInPort) currentInPort = currentNode.ports[0];
      if (!currentOutPort) currentOutPort = currentNode.ports[0];

      let newEdge;
      if (position === 'top') {
        // Placing a node ABOVE: New Node (source) -> Current Node (target)
        newEdge = {
          id: edgeId,
          sourceId: newId,
          sourcePortId: outPortId,     // from new node's output
          targetId: currentNode.id,
          targetPortId: currentInPort.id // into current node's input
        };
      } else {
        // Placing a node BELOW: Current Node (source) -> New Node (target)
        newEdge = {
          id: edgeId,
          sourceId: currentNode.id,
          sourcePortId: currentOutPort.id, // from current node's output
          targetId: newId,
          targetPortId: inPortId           // into new node's input
        };
      }

      // Requirement 3: Preserves existing edges and adds parallel branch
      setGraphDirect({
        ...graph,
        nodes: {
          ...graph.nodes,
          [newId]: newNode
        },
        edges: {
          ...graph.edges,
          [edgeId]: newEdge
        }
      });

      setSelectedIds([newId]);
      setEditorNodeId(newId);
    },
    [graph, setGraphDirect]
  );

  // Memoize custom node renderer mapping to supply the handler
  const nodeTypes = useMemo(
    () => ({
      FlowTask: (props: any) => (
        <FlowNodeRenderer {...props} onAddConnectedNode={handleAddConnectedNode} />
      )
    }),
    [handleAddConnectedNode]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (e.key === 'Escape') {
        setSelectedIds([]);
        setEditorNodeId(null);
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
        setEditorNodeId(null);
      } else if (e.key.toLowerCase() === 'n') {
        const name = prompt('New task label:', 'Task: Process Batch');
        if (name) handleAddTask(name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, undo, redo, copyEntity, cutEntity, pasteEntity, deleteSelection]);

  const handleGraphChange = (action: GraphAction) => {
    if (action.type === 'SELECTION_CHANGE') {
      setSelectedIds(action.payload.selectedIds);
      const firstId = action.payload.selectedIds[0];
      if (firstId && graph.nodes[firstId]) {
        setEditorNodeId(firstId);
      } else {
        setEditorNodeId(null);
      }
    } else {
      applyAction(action);
    }
  };

  const handleAddTask = (label: string) => {
    const id = `task_${Date.now()}`;
    const newTask: NodeEntity = {
      id,
      label,
      type: 'FlowTask',
      ports: [
        { id: `p_in_${Date.now()}`, label: 'in', side: 'bottom' },
        { id: `p_out_${Date.now()}`, label: 'out', side: 'top' }
      ],
    };
    setGraphDirect({
      ...graph,
      nodes: { ...graph.nodes, [id]: newTask }
    });
  };

  const handleAddContainer = (label: string) => {
    const id = `stage_${Date.now()}`;
    const newContainer: ContainerEntity = {
      id,
      label,
      collapsed: false
    };
    setGraphDirect({
      ...graph,
      containers: { ...graph.containers, [id]: newContainer }
    });
  };

  const updateSelectedNode = (updates: Partial<NodeEntity>) => {
    if (!editorNodeId || !graph.nodes[editorNodeId]) return;
    setGraphDirect({
      ...graph,
      nodes: {
        ...graph.nodes,
        [editorNodeId]: { ...graph.nodes[editorNodeId], ...updates }
      }
    });
  };

  return (
   <div style={{ width: '100vw', height: 'calc(100vh - 50px)', position: 'relative' }}>
      <Toolbar
        graph={graph}
        selectedIds={selectedIds}
        direction={direction}
        onAddNode={handleAddTask}
        onAddContainer={handleAddContainer}
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
        onChange={handleGraphChange}
        interactionStrategy={rewireStrategy}
        direction={direction}
        routing="bezier"
        portPlacementMode="strict-flow"
        layoutOptions={{ mode: 'flow', channelSpacing: 30 }}
        showEdgeArrows={true}
        nodeTypes={nodeTypes}
        selectedIds={selectedIds}
      />

      {/* Demo 2 Dedicated Node Editor */}
      {selectedNode && (
        <div
          style={{
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
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#38bdf8' }}>Task Node Editor</h3>
            <button
              onClick={() => setEditorNodeId(null)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
            >
              ✕
            </button>
          </div>

          <div>
            <label style={labelStyle}>Task Name</label>
            <input
              type="text"
              value={selectedNode.label}
              onChange={(e) => updateSelectedNode({ label: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1 }}>
            </div>
            <div style={{ flex: 1 }}>
            </div>
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
  textTransform: 'uppercase'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 4,
  background: '#131b2e',
  border: '1px solid #1e293b',
  color: '#f8fafc',
  padding: '6px 10px',
  borderRadius: 4,
  fontSize: 12,
  boxSizing: 'border-box'
};

const smallBtnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '4px 8px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 11,
  fontWeight: 600
};
