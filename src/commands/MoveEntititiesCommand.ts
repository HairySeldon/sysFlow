// src/commands/MoveEntitiesCommand.ts

import { GraphCommand } from "./GraphCommand";
import { GraphModel } from "../models/GraphModel";
import { ID, Vec2 } from "../models/Entity";

type PositionSnapshot = Map<ID, Vec2>;

export class MoveEntitiesCommand implements GraphCommand {
  private before: PositionSnapshot;
  private after: PositionSnapshot;

  constructor(before: PositionSnapshot, after: PositionSnapshot) {
    this.before = before;
    this.after = after;
  }

  apply(model: GraphModel): void {
    this.applySnapshot(model, this.after);
  }

  undo(model: GraphModel): void {
    this.applySnapshot(model, this.before);
  }

  private applySnapshot(model: GraphModel, snapshot: PositionSnapshot) {
    snapshot.forEach((pos, id) => {
      if (model.nodesById[id]) {
        model.moveNode(id, pos);
      } else if (model.containersById[id]) {
        model.moveContainer(id, pos);
      }
    });
  }
}

