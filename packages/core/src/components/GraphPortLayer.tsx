import React from 'react';
import { NodeEntity, ContainerEntity, Port } from '../models';
import { NodeLayoutResult } from '../layout/LayoutEngine';

interface GraphPortLayerProps {
  entity: NodeEntity | ContainerEntity;
  layout: NodeLayoutResult;
  onPortPointerDown?: (entityId: string, portId: string, isSource: boolean, e: React.PointerEvent) => void;
  onPortPointerUp?: (entityId: string, portId: string, isSource: boolean) => void;
}

export const GraphPortLayer: React.FC<GraphPortLayerProps> = ({
  entity,
  layout,
  onPortPointerDown,
  onPortPointerUp
}) => {
  const portsCount = entity.ports.length;

  return (
    <>
      {/* Input Ports (Left) */}
      {entity.ports.map((port: Port, idx: number) => {
        const top = (layout.height / (portsCount + 1)) * (idx + 1);
        return (
          <div
            key={`in-${port.id}`}
            className="sysflow-port-anchor"
            style={{ top: `${top}px`, left: '0px' }}
            title={`Input Port: ${port.label}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPortPointerDown?.(entity.id, port.id, false, e);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              onPortPointerUp?.(entity.id, port.id, false);
            }}
          />
        );
      })}

      {/* Output Ports (Right) */}
      {entity.ports.map((port: Port, idx: number) => {
        const top = (layout.height / (portsCount + 1)) * (idx + 1);
        return (
          <div
            key={`out-${port.id}`}
            className="sysflow-port-anchor"
            style={{ top: `${top}px`, left: `${layout.width}px` }}
            title={`Output Port: ${port.label}`}
            onPointerDown={(e) => {
              e.stopPropagation();
              onPortPointerDown?.(entity.id, port.id, true, e);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              onPortPointerUp?.(entity.id, port.id, true);
            }}
          />
        );
      })}
    </>
  );
};
