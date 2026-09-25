import React from 'react';
import { NodeEntity } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';
import { GraphPortLayer } from './GraphPortLayer';

interface GraphNodeProps {
  node: NodeEntity;
  layout: NodeLayoutResult;
  selected: boolean;
  onPointerDown: (node: NodeEntity, e: React.PointerEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
  onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
  customRenderer?: React.ComponentType<{ node: NodeEntity; selected: boolean }>;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  layout,
  selected,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onPortPointerDown,
  onPortPointerUp,
  customRenderer: CustomRenderer
}) => {
  return (
    <div
      className={`sysflow-node ${selected ? 'sysflow-selected' : ''} ${node.className || ''}`}
      style={{
        transform: `translate(${layout.x}px, ${layout.y}px)`,
        width: `${layout.width}px`,
        height: `${layout.height}px`
      }}
      onPointerDown={(e) => onPointerDown(node, e)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <GraphPortLayer
        entity={node}
        layout={layout}
        onPortPointerDown={onPortPointerDown}
        onPortPointerUp={onPortPointerUp}
      />
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
