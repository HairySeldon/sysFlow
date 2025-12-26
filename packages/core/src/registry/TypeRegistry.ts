export type NodeCtor = new (dto: NodeDTO) => BaseNode;
export type EdgeCtor = new (dto: EdgeDTO) => BaseEdge;

export class TypeRegistry {
  private nodeConstructors = new Map<string, NodeCtor>();
  private edgeConstructors = new Map<string, EdgeCtor>();

  registerNodeType(typeName: string, ctor: NodeCtor) { ... }
  registerEdgeType(typeName: string, ctor: EdgeCtor) { ... }

  createNode(dto: NodeDTO): BaseNode { 
    const Ctor = this.nodeConstructors.get(dto.type) ?? BaseNode;
    return new Ctor(dto);
  }
  createEdge(dto: EdgeDTO): BaseEdge { ... }
}

