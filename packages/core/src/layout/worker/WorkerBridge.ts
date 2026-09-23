import { ID, LogicalGraph } from '../../models';
import { LayoutEngine, LayoutResult } from '../LayoutEngine';
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

  public async execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>
  ): Promise<LayoutResult> {
    if (!this.worker) {
      return this.fallbackEngine.execute(graph, measurements);
    }

    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const measurementsArray = Array.from(measurements.entries());

    return new Promise<LayoutResult>((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.worker!.postMessage({
        id,
        graph,
        measurements: measurementsArray
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
