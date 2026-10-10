// packages/core/src/components/GraphContainer.tsx

import React from 'react';
import { ContainerEntity } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

interface GraphContainerProps {
  container: ContainerEntity;
  layout: NodeLayoutResult;
  selected: boolean;
  isHovered?: boolean;
  hasChildren?: boolean;
  onToggleCollapse: (containerId: string, currentCollapsed: boolean) => void;
  onPointerDown: (container: ContainerEntity, e: React.PointerEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
  customRenderer?: React.ComponentType<{ container: ContainerEntity; selected: boolean }>;
}

export const GraphContainer: React.FC<GraphContainerProps> = ({
  container,
  layout,
  selected,
  isHovered = false,
  hasChildren = false,
  onToggleCollapse,
  onPointerDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
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
      {CustomRenderer ? (
        <CustomRenderer container={container} selected={selected} />
      ) : (
        <>
          <div className="sysflow-container-header">
            <span className="sysflow-container-title" title={container.label}>
              {container.label}
            </span>
            <button
              className="sysflow-collapse-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(container.id, !container.collapsed);
              }}
            >
              {container.collapsed ? 'Expand ⊞' : 'Collapse ⊟'}
            </button>
          </div>
          {!container.collapsed && !hasChildren && (
            <div className="sysflow-container-empty-hint">
              Drop tasks here
            </div>
          )}
        </>
      )}
    </div>
  );
};
