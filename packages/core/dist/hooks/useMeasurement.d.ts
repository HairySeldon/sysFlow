import { ID, LogicalGraph } from '../models';

export declare function useMeasurement(graph: LogicalGraph): {
    measurements: Map<string, {
        width: number;
        height: number;
    }>;
    registerMeasureElement: (id: ID, el: HTMLElement | null) => void;
};
//# sourceMappingURL=useMeasurement.d.ts.map