import { ID, LogicalGraph } from '../../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../LayoutEngine';
import { SugiyamaEngine } from '../sugiyama/SugiyamaEngine';

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
        this.worker = new Worker(new URL('./layout.worker.ts', import.meta.url), {
          type: 'module'
        });

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
          console.warn('[SysFlow Worker] Error in worker, failing gracefully:', err);
        };
      } catch {
        this.worker = null;
      }
    }
  }

  public execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>,
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        return reject(new Error('Worker is not initialized'));
      }

      const id = `req_${Date.now()}_${Math.random()}`;
      this.pendingRequests.set(id, { resolve, reject });

      const measurementEntries = Array.from(measurements.entries());
      this.worker.postMessage({
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
