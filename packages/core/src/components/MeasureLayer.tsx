import React from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity, Port } from '../models';

interface MeasureLayerProps {
  graph: LogicalGraph;
  registerMeasureElement: (id: ID, el: HTMLElement | null) => void;
  nodeTypes?: Record<string, React.ComponentType<{ node: NodeEntity; selected: boolean }>>;
  containerTypes?: Record<string, React.ComponentType<{ container: ContainerEntity; selected: boolean }>>;
}

export const MeasureLayer: React.FC<MeasureLayerProps> = ({
  graph,
  registerMeasureElement,
  nodeTypes,
  containerTypes
}) => {
  const nodes = Object.values(graph.nodes) as NodeEntity[];
  const containers = Object.values(graph.containers) as ContainerEntity[];

  return (
    <div className="sysflow-measure-layer" aria-hidden="true">
      {nodes.map((node: NodeEntity) => {
        const CustomComponent = node.type ? nodeTypes?.[node.type] : null;
        return (
          <div
            key={`measure-node-${node.id}`}
            ref={(el) => registerMeasureElement(node.id, el)}
            data-sysflow-measure-id={node.id}
            className="sysflow-node"
            style={{ display: 'inline-block', position: 'relative' }}
          >
            {CustomComponent ? (
              <CustomComponent node={node} selected={false} />
            ) : (
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontWeight: 600 }}>{node.label}</div>
                {node.ports.length > 0 && (
                  <div style={{ fontSize: '11px', marginTop: 4, opacity: 0.7 }}>
                    Ports: {node.ports.map((p: Port) => p.label).join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {containers.map((container: ContainerEntity) => {
        const CustomContainer = container.type ? containerTypes?.[container.type] : null;
        return (
          <div
            key={`measure-container-${container.id}`}
            ref={(el) => registerMeasureElement(container.id, el)}
            data-sysflow-measure-id={container.id}
            className="sysflow-container"
            style={{ display: 'inline-block', position: 'relative' }}
          >
            {CustomContainer ? (
              <CustomContainer container={container} selected={false} />
            ) : (
              <div className="sysflow-container-header">{container.label}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
