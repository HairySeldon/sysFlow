// packages/core/src/layout/sugiyama/SugiyamaEngine.ts

import { ID, LogicalGraph, ContainerEntity, EdgeEntity } from '../../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../LayoutEngine';
import { CompoundLayoutManager } from '../CompoundLayoutManager';
import { FlowArranger } from './FlowArranger';
import { ConcurrentArranger } from './ConcurrentArranger';

export function resolveEffectiveEntityId(
  id: ID,
  graph: LogicalGraph,
  collapsedContainerIds: Set<ID>
): ID {
  let curr: ID | undefined = id;
  let outermostCollapsed: ID | null = null;

  while (curr) {
    if (collapsedContainerIds.has(curr)) {
      outermostCollapsed = curr;
    }
    curr = graph.nodes[curr]?.parentId ?? graph.containers[curr]?.parentId ?? undefined;
  }

  return outermostCollapsed ?? id;
}

export class SugiyamaEngine implements LayoutEngine {
  public async execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>,
    options?: LayoutOptions
  ): Promise<LayoutResult> {
    const containers = Object.values(graph.containers) as ContainerEntity[];
    const collapsedContainerIds = new Set<ID>(
      containers.filter((c) => Boolean(c.collapsed)).map((c) => c.id)
    );

    // Remap endpoints only when connected to elements inside collapsed containers
    const effectiveEdges: Record<ID, EdgeEntity> = {};
    for (const [edgeId, edge] of Object.entries(graph.edges)) {
      const effectiveSource = resolveEffectiveEntityId(edge.sourceId, graph, collapsedContainerIds);
      const effectiveTarget = resolveEffectiveEntityId(edge.targetId, graph, collapsedContainerIds);

      // Exclude internal edges whose endpoints collapse into the same container
      if (effectiveSource !== effectiveTarget) {
        effectiveEdges[edgeId] = {
          ...edge,
          sourceId: effectiveSource,
          targetId: effectiveTarget
        };
      }
    }

    const virtualGraph: LogicalGraph = {
      ...graph,
      edges: effectiveEdges
    };

    const numContainers = Object.keys(graph.containers).length;
    const mode =
      options?.mode && options.mode !== 'auto'
        ? options.mode
        : numContainers > 0
        ? 'concurrent'
        : 'flow';

    const arranger =
      mode === 'concurrent'
        ? new ConcurrentArranger(options?.aspectRatio ?? 1.55)
        : new FlowArranger(options);

    return CompoundLayoutManager.execute(virtualGraph, arranger, measurements);
  }
}
