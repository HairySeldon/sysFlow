import { ID, LogicalGraph, NodeEntity, ContainerEntity } from '../../models';
import { LayoutEngine, LayoutResult } from '../LayoutEngine';
import { CycleDecoupler } from './CycleDecoupler';
import { LayerAssignment } from './LayerAssignment';
import { CrossingMinimizer } from './CrossingMinimizer';
import { CoordinateAssigner } from './CoordinateAssigner';

export class SugiyamaEngine implements LayoutEngine {
  public async execute(
    graph: LogicalGraph,
    measurements: Map<ID, { width: number; height: number }>
  ): Promise<LayoutResult> {
    const containers = Object.values(graph.containers) as ContainerEntity[];
    const nodes = Object.values(graph.nodes) as NodeEntity[];

    const collapsedContainerIds = new Set<ID>(
      containers.filter((c) => Boolean(c.collapsed)).map((c) => c.id)
    );

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
      const typedNode = node as NodeEntity;
      if (!isDescendantOfCollapsed(typedNode.parentId)) {
        activeEntities.add(id);
      }
    }

    for (const [id, container] of Object.entries(graph.containers)) {
      const typedContainer = container as ContainerEntity;
      if (typedContainer.collapsed) {
        if (!isDescendantOfCollapsed(typedContainer.parentId)) {
          activeEntities.add(id);
        }
      } else {
        const hasChildren =
          nodes.some((n) => n.parentId === id) ||
          containers.some((c) => c.parentId === id);

        if (!hasChildren && !isDescendantOfCollapsed(typedContainer.parentId)) {
          activeEntities.add(id);
        }
      }
    }

    // 1. Cycle Decoupling
    const decoupled = CycleDecoupler.decouple(graph, activeEntities);

    // 2. Topological Layer Assignment
    const layeredNodes = LayerAssignment.assignLayers(decoupled.allEntityIds, decoupled.adjList);

    // 3. Crossing Minimization (Barycenter)
    const orderedLayers = CrossingMinimizer.minimizeCrossings(layeredNodes, decoupled.adjList, 4);

    // 4. Coordinate & Bubble-Up Assignment
    return CoordinateAssigner.assignCoordinates(graph, orderedLayers, measurements);
  }
}
