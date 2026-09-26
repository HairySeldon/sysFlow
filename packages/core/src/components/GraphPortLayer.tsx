import React from 'react';
import { NodeEntity, computeEntityPortLocations } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

interface GraphPortLayerProps {
  entity: NodeEntity;
  layout: NodeLayoutResult;
  direction?: 'LR' | 'TB';
  onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
  onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
}

export const GraphPortLayer: React.FC<GraphPortLayerProps> = ({
  entity,
  layout,
  direction = 'LR',
  onPortPointerDown,
  onPortPointerUp
}) => {
  if (!entity.ports || entity.ports.length === 0) {
    return null;
  }

  const portLocations = computeEntityPortLocations(entity, layout, direction);

  return (
    <>
      {entity.ports.map((port) => {
        const loc = portLocations.get(port.id);
        if (!loc) return null;

        return (
          <div
            key={port.id}
            className={`sysflow-port-anchor sysflow-port-${loc.side}`}
            style={{
              position: 'absolute',
              left: `${loc.localX}px`,
              top: `${loc.localY}px`,
              transform: 'translate(-50%, -50%)',
              cursor: 'crosshair',
              zIndex: 10
            }}
            title={`${port.label} (${loc.side})`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPortPointerDown?.(entity.id, port.id, true, e);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              onPortPointerUp?.(entity.id, port.id, false);
            }}
          />
        );
      })}
    </>
  );
};
