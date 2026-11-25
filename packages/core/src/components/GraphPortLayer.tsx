import React, { useState } from 'react';
import {
  NodeEntity,
  EdgeEntity,
  ID,
  computeEntityPortLocations,
  ComputePortOptions,
} from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

export interface GraphPortLayerProps {
  entity: NodeEntity;
  layout: NodeLayoutResult;
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  edges?: Record<ID, EdgeEntity>;
  portOptions?: ComputePortOptions;
  enableQuickAdd?: boolean;
  onAddConnectedNode?: (
    entity: NodeEntity,
    portId: ID,
    side: 'top' | 'bottom' | 'left' | 'right'
  ) => void;
}

export const GraphPortLayer: React.FC<GraphPortLayerProps> = ({
  entity,
  layout,
  direction = 'LR',
  edges,
  portOptions,
  enableQuickAdd = false,
  onAddConnectedNode,
}) => {
  const [hoveredPortId, setHoveredPortId] = useState<ID | null>(null);

  if (!entity.ports || entity.ports.length === 0) {
    return null;
  }

  const portLocations = computeEntityPortLocations(
    entity,
    layout,
    direction,
    edges,
    portOptions
  );

  return (
    <>
      {entity.ports.map((port) => {
        const loc = portLocations.get(port.id);
        if (!loc) return null;

        const isPortHovered = hoveredPortId === port.id;

        return (
          <div
            key={port.id}
            className="sysflow-port-hit-area"
            style={{
              left: `${loc.localX}px`,
              top: `${loc.localY}px`,
            }}
            title={`${port.label} (${loc.side})`}
            onMouseEnter={() => setHoveredPortId(port.id)}
            onMouseLeave={() =>
              setHoveredPortId((prev) => (prev === port.id ? null : prev))
            }
          >
            <div className={`sysflow-port-anchor sysflow-port-${loc.side}`} />

            {enableQuickAdd && isPortHovered && onAddConnectedNode && (
              <button
                type="button"
                className="sysflow-port-quick-add-btn"
                title={`Add connected node on "${port.label}"`}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onAddConnectedNode(entity, port.id, loc.side);
                }}
              >
                +
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};
