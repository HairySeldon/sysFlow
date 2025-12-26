import React from 'react';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';

export function ReactFlowAdapter({registry}) {
  const nodes = useGraphStore(state => mapModelToNodes(state.model));
  const edges = useGraphStore(state => mapModelToEdges(state.model));

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(changes) => applyNodeChanges(changes)}
      onEdgesChange={(changes) => applyEdgeChanges(changes)}
      onConnect={(params) => {
         // validate with registry or graph.validateEdge(...)
      }}
      nodeTypes={registeredReactNodeTypes} // provided by registry
      edgeTypes={registeredReactEdgeTypes}
    >
      <Controls />
      <Background />
    </ReactFlow>
  );
}

