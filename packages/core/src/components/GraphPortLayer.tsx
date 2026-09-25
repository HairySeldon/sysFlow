import React from 'react';
import { NodeEntity, LogicalGraph, computeEntityPortLocations } from '../models';
import { NodeLayoutResult, LayoutResult } from '../layout/LayoutEngine';

interface GraphPortLayerProps {
  entity: NodeEntity | ContainerEntity;
  layout: NodeLayoutResult;
  allLayouts?: LayoutResult;
  graph?: LogicalGraph;
  direction?: 'LR' | 'TB';
  onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
  onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
}

export const GraphPortLayer: React.FC<GraphPortLayerProps> = ({
  entity,
  layout,
  allLayouts,
  graph,
  direction = 'LR',
  onPortPointerDown,
  onPortPointerUp
}) => {
  if (!entity.ports || entity.ports.length === 0) {
    return null;
  }

  const portLocations = computeEntityPortLocations(entity, layout, direction, graph, allLayouts);

  return (
    <>
      {entity.ports.map((port) => {
        const loc = portLocations.get(port.id);
        if (!loc) return null;

        const canBeSource = port.direction !== 'in';
        const canBeTarget = port.direction !== 'out';

        return (
          <div
            key={port.id}
            className={`sysflow-port-anchor sysflow-port-${loc.side}`}
            style={{
              position: 'absolute',
              left: `${loc.localX}px`,
              top: `${loc.localY}px`,
              transform: 'translate(-50%, -50%)',
              cursor: canBeSource ? 'crosshair' : 'default',
              zIndex: 10
            }}
            title={`${port.label} (${port.direction || 'inout'} · ${loc.side})`}
            onPointerDown={(e) => {
              e.stopPropagation();
              if (canBeSource) {
                onPortPointerDown?.(entity.id, port.id, true, e);
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (canBeTarget) {
                onPortPointerUp?.(entity.id, port.id, false);
              }
            }}
          />
        );
      })}
    </>
  );
};
