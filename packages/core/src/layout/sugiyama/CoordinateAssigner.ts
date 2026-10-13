// packages/core/src/layout/sugiyama/CoordinateAssigner.ts

import { ID, LogicalGraph } from '../../models';
import { NodeLayoutResult } from '../LayoutEngine';

export class CoordinateAssigner {
  public static assignDynamicPortSides(
    graph: LogicalGraph,
    nodesLayout: Record<ID, NodeLayoutResult>,
    containersLayout: Record<ID, NodeLayoutResult>
  ) {
    const getPos = (id: ID) => nodesLayout[id] || containersLayout[id];

    for (const edge of Object.values(graph.edges)) {
      const srcPos = getPos(edge.sourceId);
      const tgtPos = getPos(edge.targetId);
      if (!srcPos || !tgtPos) continue;

      const srcEntity = graph.nodes[edge.sourceId] || graph.containers[edge.sourceId];
      const tgtEntity = graph.nodes[edge.targetId] || graph.containers[edge.targetId];

      const dx = tgtPos.x + tgtPos.width / 2 - (srcPos.x + srcPos.width / 2);
      const dy = tgtPos.y + tgtPos.height / 2 - (srcPos.y + srcPos.height / 2);

      const isHorizontalDominant = Math.abs(dx) > Math.abs(dy) * 1.25;

      const srcPort = srcEntity?.ports?.find((p) => p.id === edge.sourcePortId);
      if (srcPort && (!srcPort.side || srcPort.side === 'auto')) {
        if (isHorizontalDominant) {
          srcPort.side = dx >= 0 ? 'right' : 'left';
        } else {
          srcPort.side = dy >= 0 ? 'bottom' : 'top';
        }
      }

      const tgtPort = tgtEntity?.ports?.find((p) => p.id === edge.targetPortId);
      if (tgtPort && (!tgtPort.side || tgtPort.side === 'auto')) {
        if (isHorizontalDominant) {
          tgtPort.side = dx >= 0 ? 'left' : 'right';
        } else {
          tgtPort.side = dy >= 0 ? 'top' : 'bottom';
        }
      }
    }
  }
}
