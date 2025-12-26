export class GraphModel {
  nodesById: Record<ID, BaseNode>;
  edgesById: Record<ID, BaseEdge>;
  rootNodes: ID[]; // nodes with no parent
  // indexes for quick lookup
  incomingIndex: Record<ID, ID[]>;
  outgoingIndex: Record<ID, ID[]>;

  constructor();
  addNode(node: BaseNode): void;
  removeNode(nodeId: ID): void;
  addEdge(edge: BaseEdge): void;
  removeEdge(edgeId: ID): void;
  moveNode(nodeId: ID, pos: Position): void;
  reparentNode(nodeId: ID, newParentId?: ID): void;
  collapseNode(nodeId: ID): void;
  expandNode(nodeId: ID): void;
  // queries:
  getNode(id: ID): BaseNode | undefined;
  getEdgesForNode(id: ID): BaseEdge[];
  toJSON(): { nodes: NodeDTO[]; edges: EdgeDTO[] };
  // transaction helper for batched edits (used by history)
  transact(fn: (g: GraphModel) => void): PatchResult;
}

