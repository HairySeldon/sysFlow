// src/commands/GraphCommand.ts

import { GraphModel } from "../models/GraphModel";

export interface GraphCommand {
  apply(model: GraphModel): void;
  undo(model: GraphModel): void;
}

