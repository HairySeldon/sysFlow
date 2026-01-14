import { Entity, ID, Vec2, SIZE, Port } from "./Entity";

export class Node extends Entity {
  constructor(id: ID, label: string, position: Vec2, size: SIZE, parentId?: ID, ports?: Port[]) {
    super(id, label, position, size, parentId, ports);
  }
}

