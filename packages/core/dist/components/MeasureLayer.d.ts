import { default as React } from 'react';
import { LogicalGraph, ID, NodeEntity, ContainerEntity } from '../models';

interface MeasureLayerProps {
    graph: LogicalGraph;
    registerMeasureElement: (id: ID, el: HTMLElement | null) => void;
    nodeTypes?: Record<string, React.ComponentType<{
        node: NodeEntity;
        selected: boolean;
    }>>;
    containerTypes?: Record<string, React.ComponentType<{
        container: ContainerEntity;
        selected: boolean;
    }>>;
}
export declare const MeasureLayer: React.FC<MeasureLayerProps>;
export {};
//# sourceMappingURL=MeasureLayer.d.ts.map