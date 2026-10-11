import { ID, LogicalGraph, NodeEntity, EdgeEntity, ContainerEntity } from '../../models';
import { LayoutEngine, LayoutResult, LayoutOptions } from '../LayoutEngine';
import { CycleDecoupler } from './CycleDecoupler';
import { LayerAssignment } from './LayerAssignment';
import { CrossingMinimizer } from './CrossingMinimizer';
import { CoordinateAssigner } from './CoordinateAssigner';

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
    const nodes = Object.values(graph.nodes) as NodeEntity[];

    const collapsedContainerIds = new Set<ID>(
      containers.filter((c) => Boolean(c.collapsed)).map((c) => c.id)
    );

    // Helper to check if descendant of collapsed container
    const isDescendantOfCollapsed = (parentId?: ID | null): boolean => {
      let curr = parentId;
      while (curr) {
        if (collapsedContainerIds.has(curr)) return true;
        curr = graph.containers[curr]?.parentId;
      }
      return false;
    };

    const activeEntities = new Set<ID>();

    for (const [id, node] of Object.entries(graph.nodes)) {
      if (!isDescendantOfCollapsed(node.parentId)) {
        activeEntities.add(id);
      }
    }

    for (const [id, container] of Object.entries(graph.containers)) {
      if (container.collapsed) {
        if (!isDescendantOfCollapsed(container.parentId)) {
          activeEntities.add(id);
        }
      } else {
        const hasChildren =
          nodes.some((n) => n.parentId === id) ||
          containers.some((c) => c.parentId === id);
        if (!hasChildren && !isDescendantOfCollapsed(container.parentId)) {
          activeEntities.add(id);
        }
      }
    }

    // Synthesize effective graph edges with remapped endpoints
    const effectiveEdges: Record<ID, EdgeEntity> = {};
    for (const [edgeId, edge] of Object.entries(graph.edges)) {
      const effectiveSource = resolveEffectiveEntityId(edge.sourceId, graph, collapsedContainerIds);
      const effectiveTarget = resolveEffectiveEntityId(edge.targetId, graph, collapsedContainerIds);

      // Ignore internal edges within the same collapsed container
      if (effectiveSource !== effectiveTarget && activeEntities.has(effectiveSource) && activeEntities.has(effectiveTarget)) {
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

    // 1. Cycle Decoupling using virtualGraph
    const decoupled = CycleDecoupler.decouple(virtualGraph, activeEntities);

    // 2. Topological Layer Assignment
    const layeredNodes = LayerAssignment.assignLayers(decoupled.allEntityIds, decoupled.adjList);

    // 3. Crossing Minimization
    const orderedLayers = CrossingMinimizer.minimizeCrossings(layeredNodes, decoupled.adjList, 4, virtualGraph);

    // 4. Coordinate Assignment using virtualGraph
    return CoordinateAssigner.assignCoordinates(virtualGraph, orderedLayers, measurements, options);
  }
}
