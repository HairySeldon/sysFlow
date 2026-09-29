import { ID, LogicalGraph } from '../../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../LayoutEngine';

export declare class WorkerBridge implements LayoutEngine {
    private worker;
    private pendingRequests;
    private fallbackEngine;
    constructor();
    execute(graph: LogicalGraph, measurements: Map<ID, {
        width: number;
        height: number;
    }>, options?: LayoutOptions): Promise<LayoutResult>;
    dispose(): void;
}
//# sourceMappingURL=WorkerBridge.d.ts.map