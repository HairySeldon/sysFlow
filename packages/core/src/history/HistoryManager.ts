import produce, { Patch, produceWithPatches } from 'immer';

export type PatchEntry = { forward: Patch[]; inverse: Patch[]; meta?: any };

export class HistoryManager {
  private undoStack: PatchEntry[] = [];
  private redoStack: PatchEntry[] = [];
  private maxSize = 200;

  push(forward: Patch[], inverse: Patch[], meta?: any) {
    this.undoStack.push({ forward, inverse, meta });
    if (this.undoStack.length > this.maxSize) this.undoStack.shift();
    this.redoStack = []; // clear redo on new action
  }

  canUndo() { return this.undoStack.length > 0; }
  canRedo() { return this.redoStack.length > 0; }

  undo(currentState: any, applyFn: (patches: Patch[]) => any) {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    // apply inverse patches to current state
    const res = applyFn(entry.inverse);
    this.redoStack.push(entry);
    return res;
  }

  redo(currentState: any, applyFn: (patches: Patch[]) => any) {
    const entry = this.redoStack.pop();
    if (!entry) return null;
    const res = applyFn(entry.forward);
    this.undoStack.push(entry);
    return res;
  }
}

