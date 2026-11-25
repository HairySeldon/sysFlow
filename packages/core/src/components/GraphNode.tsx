import React from 'react';
import {
  NodeEntity,
  ContainerEntity,
  EdgeEntity,
  ID,
  ComputePortOptions,
} from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';
import { GraphPortLayer } from './GraphPortLayer';

export interface GraphNodeProps {
  node: NodeEntity;
  layout: NodeLayoutResult;
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  edges?: Record<ID, EdgeEntity>;
  selected?: boolean;
  isDrawingEdge?: boolean;
  isDrawingSource?: boolean;
  customRenderer?: React.ComponentType<{ node: NodeEntity; selected: boolean }>;
  portOptions?: ComputePortOptions;
  enableQuickAdd?: boolean;
  onAddConnectedNode?: (
    node: NodeEntity,
    portId: ID,
    side: 'top' | 'bottom' | 'left' | 'right'
  ) => void;
  onPointerDown?: (entity: NodeEntity | ContainerEntity, e: React.PointerEvent) => void;
  onMouseEnter?: (entityId: ID) => void;
  onMouseLeave?: (entityId: ID) => void;
  onClick?: (e: React.MouseEvent) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  layout,
  selected = false,
  isDrawingEdge = false,
  isDrawingSource = false,
  direction = 'LR',
  edges,
  portOptions,
  enableQuickAdd = false,
  onAddConnectedNode,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  customRenderer: CustomRenderer,
}) => {
  return (
    <div
      className={`sysflow-node ${selected ? 'sysflow-selected' : ''} ${
        isDrawingSource ? 'sysflow-drawing-source' : ''
      } ${node.className || ''}`}
      style={{
        transform: `translate(${layout.x}px, ${layout.y}px)`,
        width: `${layout.width}px`,
        height: `${layout.height}px`,
      }}
      onPointerDown={(e) => {
        if (isDrawingEdge) {
          // Prevent node dragging and prevent canvas background marquee from starting on a node click
          e.stopPropagation();
          return;
        }
        onPointerDown?.(node, e);
      }}
      onMouseEnter={() => onMouseEnter?.(node.id)}
      onMouseLeave={() => onMouseLeave?.(node.id)}
      onClick={onClick}
    >
      {/* Port Anchors & Per-Port Quick-Add (+) */}
      <GraphPortLayer
        entity={node}
        layout={layout}
        direction={direction}
        edges={edges}
        portOptions={portOptions}
        enableQuickAdd={enableQuickAdd && !isDrawingEdge}
        onAddConnectedNode={onAddConnectedNode}
      />

      {/* Node Content */}
      {CustomRenderer ? (
        <CustomRenderer node={node} selected={selected} />
      ) : (
        <div style={{ padding: '10px 14px' }}>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{node.label}</div>
          {node.ports.length > 0 && (
            <div style={{ fontSize: '11px', opacity: 0.6, marginTop: '4px' }}>
              {node.ports.length} Port{node.ports.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
