import { ID } from "../models/Entity";

export class Edge {
  id: ID;
  targetNodeId: ID;
  sourceNodeId: ID;
  sourcePortId?: ID;
  targetPortId?: ID;
  name?: string;

  constructor(id: ID, sourceNodeId: ID, targetNodeId: ID, name?: string) {
    this.id = id;
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.name = name;
  }
}

