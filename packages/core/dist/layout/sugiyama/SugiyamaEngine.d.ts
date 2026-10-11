import { ID, LogicalGraph } from '../../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../LayoutEngine';

export declare function resolveEffectiveEntityId(id: ID, graph: LogicalGraph, collapsedContainerIds: Set<ID>): ID;
export declare class SugiyamaEngine implements LayoutEngine {
    execute(graph: LogicalGraph, measurements: Map<ID, {
        width: number;
        height: number;
    }>, options?: LayoutOptions): Promise<LayoutResult>;
}
//# sourceMappingURL=SugiyamaEngine.d.ts.map