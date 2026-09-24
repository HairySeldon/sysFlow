import React, { useRef } from 'react';
import { LogicalGraph, ID } from '@sysflow/core';

interface ToolbarProps {
  graph: LogicalGraph;
  selectedIds: ID[];
  direction?: 'LR' | 'TB';
  onToggleDirection?: () => void;
  onAddNode: (label: string, parentId?: string | null) => void;
  onAddContainer: (label: string) => void;
  onDeleteSelected: () => void;
  onUpdateGraph: (graph: LogicalGraph) => void;
  extraActions?: React.ReactNode;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  graph,
  selectedIds,
  direction = 'LR',
  onToggleDirection,
  onAddNode,
  onAddContainer,
  onDeleteSelected,
  onUpdateGraph,
  extraActions
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSaveJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(graph, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `sysflow-graph-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const validateGraphJson = (raw: string): LogicalGraph => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Invalid JSON syntax: ${(e as Error).message}`);
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Root JSON must be an object.');
    }

    const g = parsed as Record<string, unknown>;

    if (typeof g.nodes !== 'object' || g.nodes === null || Array.isArray(g.nodes)) {
      throw new Error('Schema error: "nodes" property must be a valid object map.');
    }
    if (typeof g.containers !== 'object' || g.containers === null || Array.isArray(g.containers)) {
      throw new Error('Schema error: "containers" property must be a valid object map.');
    }
    if (typeof g.edges !== 'object' || g.edges === null || Array.isArray(g.edges)) {
      throw new Error('Schema error: "edges" property must be a valid object map.');
    }

    const nodeIds = new Set(Object.keys(g.nodes as object));
    const containerIds = new Set(Object.keys(g.containers as object));

    for (const [eId, edge] of Object.entries(g.edges as Record<string, any>)) {
      if (!edge.sourceId || (!nodeIds.has(edge.sourceId) && !containerIds.has(edge.sourceId))) {
        throw new Error(`Schema error in edge "${eId}": sourceId "${edge.sourceId}" does not exist.`);
      }
      if (!edge.targetId || (!nodeIds.has(edge.targetId) && !containerIds.has(edge.targetId))) {
        throw new Error(`Schema error in edge "${eId}": targetId "${edge.targetId}" does not exist.`);
      }
    }

    return parsed as LogicalGraph;
  };

  const handleUploadJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const validated = validateGraphJson(event.target?.result as string);
        onUpdateGraph(validated);
      } catch (err) {
        alert(`Failed to load graph:\n${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 30,
        display: 'flex',
        gap: 8,
        background: 'rgba(15, 23, 42, 0.92)',
        padding: '8px 12px',
        borderRadius: 8,
        border: '1px solid #334155',
        alignItems: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
      }}
    >
      {onToggleDirection && (
        <button
          style={{ ...actionBtnStyle, background: '#0369a1', borderColor: '#38bdf8' }}
          onClick={onToggleDirection}
          title="Toggle Layout Direction"
        >
          {direction === 'LR' ? '⇄ Left to Right' : '⇅ Top to Bottom'}
        </button>
      )}

      <button
        style={actionBtnStyle}
        onClick={() => {
          const name = prompt('Enter node label:', 'New_Node');
          if (name) onAddNode(name, null);
        }}
      >
        + Add Node
      </button>

      <button
        style={actionBtnStyle}
        onClick={() => {
          const name = prompt('Enter container label:', 'Group_Container');
          if (name) onAddContainer(name);
        }}
      >
        + Add Container
      </button>

      {selectedIds.length > 0 && (
        <button
          style={{ ...actionBtnStyle, backgroundColor: '#7f1d1d', borderColor: '#ef4444' }}
          onClick={onDeleteSelected}
        >
          Delete Selected ({selectedIds.length})
        </button>
      )}

      {extraActions}

      <button style={actionBtnStyle} onClick={handleSaveJson}>
        Save JSON
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleUploadJson}
      />
      <button style={actionBtnStyle} onClick={() => fileInputRef.current?.click()}>
        Upload JSON
      </button>
    </div>
  );
};

const actionBtnStyle: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#f8fafc',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 600
};
