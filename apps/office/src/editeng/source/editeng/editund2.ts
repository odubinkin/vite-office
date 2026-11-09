/** @fileoverview Original EditUndo base contract over the existing shared SfxUndoAction owner. Original GetComment returns an owned OUString; shared context entry points are explicit host call bindings; no alternate undo manager is supplied. */
import { SfxUndoAction, SfxUndoManager } from "../../../svl/source/undo/undo";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { EditEngine } from "./editeng.lifecycle";
/** Original EditUndoManager storage and inherited action-recording contract. */
export class EditUndoManager extends SfxUndoManager<unknown, OUString> {}

/** Consumed original OutlinerViewShell declaration; no view-shell implementation/default is supplied. */
export interface OutlinerViewShell {
  /** Original signed view-shell identity. @returns Actual identity. */
  GetViewShellId(): number;
}
/** Original abstract EditUndo state and calls. The shared context entry points bind the original parameterless action execution without changing the source comment value contract. */
export abstract class EditUndo extends SfxUndoAction<unknown, OUString> {
  private readonly nId: number;
  private readonly mpEditEngine: EditEngine | null;
  private mnViewShellId = -1;
  /** Original source action identity, engine pointer and active view-shell capture. @param id - Source unsigned16 identifier. @param engine - Actual source outer owner. @returns Action. */
  constructor(id: number, engine: EditEngine | null) {
    super();
    this.nId = id & 0xffff;
    this.mpEditEngine = engine;
    const view = engine ? engine.GetActiveView() : null,
      shell = view ? view.getImpl().GetViewShell() : null;
    if (shell) this.mnViewShellId = shell.GetViewShellId();
  }
  /** Original abstract parameterless action execution. @returns Nothing. */
  abstract Undo(): void;
  /** Original abstract parameterless redo execution. @returns Nothing. */
  abstract Redo(): void;
  /** Existing shared context call binds the original parameterless execution. @param context - Shared unused context. @returns Nothing. */
  override UndoWithContext(context: unknown): void {
    void context;
    this.Undo();
  }
  /** Existing shared context call binds the original parameterless redo. @param context - Shared unused context. @returns Nothing. */
  override RedoWithContext(context: unknown): void {
    void context;
    this.Redo();
  }
  /** Original borrowed engine pointer. @returns Actual owner or null. */
  GetEditEngine(): EditEngine | null {
    return this.mpEditEngine;
  }
  /** Original action identifier. @returns Unsigned16 source ID. */
  GetId(): number {
    return this.nId;
  }
  /** Original unconditional repeat rejection. @param target - Unused source repeat target. @returns False. */
  CanRepeat(target: unknown): boolean {
    void target;
    return false;
  }
  /** Original optional engine comment lookup returns an independently owned source string. @returns Original owned comment or empty string. */
  override GetComment(): OUString {
    return this.mpEditEngine ? this.mpEditEngine.GetUndoComment(this.GetId()) : new OUString();
  }
  /** Original captured view-shell identity. @returns Actual identity or original minus-one default. */
  GetViewShellId(): number {
    return this.mnViewShellId;
  }
}
