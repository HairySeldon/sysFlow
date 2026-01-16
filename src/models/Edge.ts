import { ID } from "../models/Entity";

export class Edge {
  id: ID;
  targetNodeId: ID;
  sourceNodeId: ID;
  sourcePortId?: ID;
  targetPortId?: ID;
  label?: string;

  constructor(id: ID, sourceNodeId: ID, targetNodeId: ID, label?: string) {
    this.id = id;
    this.sourceNodeId = sourceNodeId;
    this.targetNodeId = targetNodeId;
    this.label = label;
  }
}

