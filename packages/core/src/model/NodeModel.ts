export class BaseNode {
  readonly id: ID;
  type: string;
  data: NodeData;
  parent?: ID | null;
  children: ID[];
  position: Position;
  size: { w: number; h: number };
  collapsed: boolean;
  meta: Record<string, any>;

  constructor(dto: NodeDTO) { ... }

  // override in subclasses
  validate?(): boolean;
  onSelect?(): void;
  onDoubleClick?(): void;
  // returns serializable data only - DOM/UI rendering is adapter responsibility
  toDTO(): NodeDTO { ... }
}

