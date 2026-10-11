import React, { useState } from 'react';
import { NodeEntity, ContainerEntity, EdgeEntity, ID, ComputePortOptions } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';
import { GraphPortLayer } from './GraphPortLayer';

export interface GraphNodeProps {
  node: NodeEntity;
  layout: NodeLayoutResult;
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  edges?: Record<ID, EdgeEntity>;
  selected?: boolean;
  customRenderer?: React.ComponentType<{ node: NodeEntity; selected: boolean }>;
  portOptions?: ComputePortOptions;
  enableQuickAdd?: boolean;
  onAddConnectedNode?: (node: NodeEntity, position: 'top' | 'bottom') => void;
  onPointerDown?: (entity: NodeEntity | ContainerEntity, e: React.PointerEvent) => void;
  onMouseEnter?: (entityId: ID) => void;
  onMouseLeave?: (entityId: ID) => void;
  onClick?: (e: React.MouseEvent) => void;
  onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
  onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  layout,
  selected = false,
  direction = 'LR',
  edges,
  portOptions,
  enableQuickAdd = false,
  onAddConnectedNode,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onPortPointerDown,
  onPortPointerUp,
  customRenderer: CustomRenderer
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`sysflow-node ${selected ? 'sysflow-selected' : ''} ${node.className || ''}`}
      style={{
        transform: `translate(${layout.x}px, ${layout.y}px)`,
        width: `${layout.width}px`,
        height: `${layout.height}px`
      }}
      onPointerDown={(e) => onPointerDown?.(node, e)}
      onMouseEnter={() => {
        setIsHovered(true);
        onMouseEnter?.(node.id);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        onMouseLeave?.(node.id);
      }}
      onClick={onClick}
    >
      {/* Native Hitbox Extender Bridges */}
      {enableQuickAdd && isHovered && (
        <>
          <div className="sysflow-hover-bridge sysflow-hover-bridge-top" />
          <div className="sysflow-hover-bridge sysflow-hover-bridge-bottom" />
        </>
      )}

      {/* Top Quick-Add (+) */}
      {enableQuickAdd && isHovered && onAddConnectedNode && (
        <button
          type="button"
          className="sysflow-quick-add-btn sysflow-quick-add-top"
          title="Add connected node above"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddConnectedNode(node, 'top');
          }}
        >
          +
        </button>
      )}

      {/* Port Anchors */}
      <GraphPortLayer
        entity={node}
        layout={layout}
        direction={direction}
        edges={edges}
        portOptions={portOptions}
        onPortPointerDown={onPortPointerDown}
        onPortPointerUp={onPortPointerUp}
      />

      {/* Node Content (Custom or Default Fallback) */}
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

      {/* Bottom Quick-Add (+) */}
      {enableQuickAdd && isHovered && onAddConnectedNode && (
        <button
          className="sysflow-quick-add-btn sysflow-quick-add-bottom"
          title="Add connected node below"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddConnectedNode(node, 'bottom');
          }}
        >
          +
        </button>
      )}
    </div>
  );
};
