import { Entity, ID, Vec2, SIZE, Port} from "./Entity";

export class Container extends Entity {
  nodeIds: ID[];
  childContainerIds?: ID[];
  collapsed: boolean;

  constructor(id: ID, label: string, position: Vec2, size: SIZE, parentId?: ID, ports?: Port[]) {
    super(id, label, position, size, parentId, ports);

    this.label = label;
    this.nodeIds = [];
    this.childContainerIds = [];
    this.collapsed = false;
  }
}

