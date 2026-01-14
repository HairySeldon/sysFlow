// src/commands/UndoManager.ts

import { GraphCommand } from "./GraphCommand";
import { GraphModel } from "../models/GraphModel";

export class UndoManager {
  private undoStack: GraphCommand[] = [];
  private redoStack: GraphCommand[] = [];

  execute(command: GraphCommand, model: GraphModel) {
    command.apply(model);
    this.undoStack.push(command);
    this.redoStack.length = 0;
  }

  undo(model: GraphModel) {
    const command = this.undoStack.pop();
    if (!command) return;

    command.undo(model);
    this.redoStack.push(command);
  }

  redo(model: GraphModel) {
    const command = this.redoStack.pop();
    if (!command) return;

    command.apply(model);
    this.undoStack.push(command);
  }

  clear() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}

