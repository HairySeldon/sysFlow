import { ID, LogicalGraph } from '../../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../LayoutEngine';
import { SugiyamaEngine } from '../sugiyama/SugiyamaEngine';
// Import worker inlined via Vite query parameter
// @ts-ignore
import LayoutWorker from './layout.worker?worker&inline';

export class WorkerBridge implements LayoutEngine {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (res: LayoutResult) => void; reject: (err: Error) => void }
  >();
  private fallbackEngine = new SugiyamaEngine();

  constructor() {
    if (typeof Worker !== 'undefined') {
      try {
        this.worker = new LayoutWorker();

        this.worker.onmessage = (e: MessageEvent) => {
          const { id, success, layout, error } = e.data;
          const promiseCallbacks = this.pendingRequests.get(id);
          if (!promiseCallbacks) return;

          this.pendingRequests.delete(id);
          if (success) {
            promiseCallbacks.resolve(layout);
          } else {
            promiseCallbacks.reject(new Error(error));
          }
        };

        this.worker.onerror = (err) => {
          console.warn('[SysFlow Worker] Error in worker, falling back to sync engine:', err);
        };
      } catch (e) {
        console.warn('[SysFlow Worker] Failed to instantiate worker. Falling back to sync engine:', e);
        this.worker = null;
      }
    }
  }

  public execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>,
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    // If worker failed to construct or isn't supported, seamlessly fallback to SugiyamaEngine!
    if (!this.worker) {
      return this.fallbackEngine.execute(graph, measurements, options);
    }

    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(id, { resolve, reject });

      const measurementEntries = Array.from(measurements.entries());
      this.worker!.postMessage({
        id,
        graph,
        measurements: measurementEntries,
        options
      });
    });
  }

  public dispose(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.pendingRequests.clear();
  }
}
