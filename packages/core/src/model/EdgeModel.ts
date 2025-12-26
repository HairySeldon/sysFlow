export class BaseEdge {
  readonly id: ID;
  type: string;
  source: ID;
  target: ID;
  label?: string;
  meta: Record<string, any>;

  constructor(dto: EdgeDTO) { ... }

  validate?(graph: GraphModel): boolean;
  toDTO(): EdgeDTO { ... }
}

