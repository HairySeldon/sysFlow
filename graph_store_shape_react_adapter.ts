import create from 'zustand';

type GraphState = {
  model: GraphModel;
  selection: { nodes: Set<ID>; edges: Set<ID> };
  viewport: { zoom: number; pan: Position };
  ui: { inspectorOpen: boolean; hoveredId?: ID };
  // action APIs
  addNode(dto: NodeDTO): ID;
  removeNode(id: ID): void;
  addEdge(dto: EdgeDTO): ID;
  removeEdge(id: ID): void;
  moveNode(id: ID, position: Position): void;
  reparentNode(id: ID, parentId?: ID): void;
  setSelection(nodes: ID[], edges?: ID[]): void;
  undo(): void;
  redo(): void;
};

