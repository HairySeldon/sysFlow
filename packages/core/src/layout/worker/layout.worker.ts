import { LogicalGraph, ID } from '../../models';
import { LayoutOptions } from '../LayoutEngine';
import { SugiyamaEngine } from '../sugiyama/SugiyamaEngine';

const engine = new SugiyamaEngine();

self.onmessage = async (e: MessageEvent) => {
  const { id, graph, measurements, options } = e.data as {
    id: string;
    graph: LogicalGraph;
    measurements: Array<[ID, { width: number; height: number }]>;
    options?: LayoutOptions;
  };

  try {
    const measurementMap = new Map<ID, { width: number; height: number }>(measurements);
    const layout = await engine.execute(graph, measurementMap, options);
    self.postMessage({ id, success: true, layout });
  } catch (error) {
    self.postMessage({ id, success: false, error: (error as Error).message });
  }
};
