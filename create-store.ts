export const useGraphStore = create<GraphState>((set, get) => ({
  model: new GraphModel(),
  selection: { nodes: new Set(), edges: new Set() },
  viewport: { zoom: 1, pan: { x: 0, y: 0 } },
  ui: { inspectorOpen: false },
  addNode: (dto) => {
    return get()._addNode(dto); // internal method uses model.transact
  },
  // ... other APIs
}));

