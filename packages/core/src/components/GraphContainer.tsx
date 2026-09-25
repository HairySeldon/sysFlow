import React from 'react';
import { ContainerEntity } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';
import { GraphPortLayer } from './GraphPortLayer';

interface GraphContainerProps {
  container: ContainerEntity;
  layout: NodeLayoutResult;
  selected: boolean;
  isHovered?: boolean;
  onToggleCollapse: (containerId: string, currentCollapsed: boolean) => void;
  onPointerDown: (container: ContainerEntity, e: React.PointerEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
  onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
  customRenderer?: React.ComponentType<{ container: ContainerEntity; selected: boolean }>;
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
  container,
  layout,
  selected,
  isHovered = false,
  onToggleCollapse,
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
      className={`sysflow-container ${selected ? 'sysflow-selected' : ''} ${isHovered ? 'sysflow-hovered' : ''} ${container.className || ''}`}
      style={{
        transform: `translate(${layout.x}px, ${layout.y}px)`,
        width: `${layout.width}px`,
        height: `${layout.height}px`
      }}
      onPointerDown={(e) => onPointerDown(container, e)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <GraphPortLayer
        entity={container}
        layout={layout}
        onPortPointerDown={onPortPointerDown}
        onPortPointerUp={onPortPointerUp}
      />
      {CustomRenderer ? (
        <CustomRenderer container={container} selected={selected} />
      ) : (
        <div className="sysflow-container-header">
          <span
            title={container.label}
            style={{
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              flex: 1,
              marginRight: 8
            }}
          >
            {container.label}
          </span>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '11px',
              padding: '2px 6px',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse(container.id, !container.collapsed);
            }}
          >
            {container.collapsed ? 'Expand ⊞' : 'Collapse ⊟'}
          </button>
        </div>
      )}
    </div>
  );
};
