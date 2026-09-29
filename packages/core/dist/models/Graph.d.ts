import { ID, NodeEntity, ContainerEntity } from './Entity';
import { EdgeEntity } from './Edge';
import { NodeLayoutResult } from '../layout/LayoutEngine';

export interface LogicalGraph {
    version: string;
    nodes: Record<ID, NodeEntity>;
    containers: Record<ID, ContainerEntity>;
    edges: Record<ID, EdgeEntity>;
}
export interface PortPerimeterLocation {
    portId: ID;
    side: 'left' | 'right' | 'top' | 'bottom';
    /** Local coordinates relative to the entity box */
    localX: number;
    localY: number;
    /** Global canvas coordinates */
    worldX: number;
    worldY: number;
}
export type PortPlacementMode = 'strict-flow' | 'perimeter-optimized';
export interface ComputePortOptions {
    direction?: 'LR' | 'TB';
    mode?: PortPlacementMode;
    nodeLayouts?: Record<ID, NodeLayoutResult>;
}
/**
 * Calculates exact perimeter port locations for an entity after layout dimensions are resolved.
 * Uses edge connections (source vs target) to determine input vs output sides if side is 'auto'.
 */
export declare function computeEntityPortLocations(entity: NodeEntity, layout: NodeLayoutResult, defaultLayoutDirection?: 'LR' | 'TB', edges?: Record<ID, EdgeEntity> | EdgeEntity[], options?: ComputePortOptions): Map<ID, PortPerimeterLocation>;
/**
 * Removes any edges whose source/target entity or port no longer exists.
 */
export declare function pruneDanglingEdges(graph: LogicalGraph): LogicalGraph;
//# sourceMappingURL=Graph.d.ts.map