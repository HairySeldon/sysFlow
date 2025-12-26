import { useGraphStore } from '../store';

export function useNode(nodeId: ID) {
  return useGraphStore(
    state => state.model.nodesById[nodeId],
    (a, b) => a === b // shallow identity check
  );
}

