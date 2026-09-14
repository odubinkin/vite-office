/**
 * @fileoverview Implements the core Sfx undo manager from pinned `svl/source/undo/undo.cxx`
 * with action stacks, list actions, save-position tracking, merging, redo truncation, and bounded retention.
 */

/** Matches LibreOffice's default top-level SfxUndoManager action capacity. */
export const DEFAULT_MAX_UNDO_ACTION_COUNT = 20;

/** Opaque history boundary captured before an asynchronous primary-medium write begins. */
export interface SfxUndoSavePosition {
  /** Action immediately before the captured boundary, absent for the history root. */
  readonly actionBefore?: SfxUndoAction<unknown>;
  /** History-root revision used to reject boundaries invalidated by trimming or clearing. */
  readonly historyRootRevision: number;
  /** Zero-based action cursor at the captured boundary. */
  readonly position: number;
}

/** Base class for one reversible operation retained by SfxUndoManager. */
export abstract class SfxUndoAction<Context> {
  /** Reverts this action against the supplied document context. @param context - Active undo context. @returns Nothing. */
  public abstract UndoWithContext(context: Context): void;

  /** Reapplies this action against the supplied document context. @param context - Active redo context. @returns Nothing. */
  public abstract RedoWithContext(context: Context): void;

  /** Returns the human-readable action label. @returns Command label. */
  public abstract GetComment(): string;

  /** Tries to absorb an immediately following compatible action. @param nextAction - Newer action candidate. @returns True when this action absorbed the candidate. */
  public Merge(nextAction: SfxUndoAction<Context>): boolean {
    void nextAction;
    return false;
  }

  /** Returns an approximate retained domain-payload size, excluding object overhead. @returns Payload units. */
  public GetPayloadSize(): number {
    return 0;
  }
}

/** Composite action whose children undo in reverse order and redo in forward order. */
export class SfxListUndoAction<Context> extends SfxUndoAction<Context> {
  private readonly actions: SfxUndoAction<Context>[] = [];

  /** Creates one compound action. @param comment - User-visible command label. @returns Nothing. */
  public constructor(private readonly comment: string) {
    super();
    if (comment.trim().length === 0) throw new Error("Undo action comment must not be blank.");
  }

  /** Adds or merges one child action. @param action - Child operation. @param tryMerge - Whether the current child may absorb it. @returns Nothing. */
  public AddAction(action: SfxUndoAction<Context>, tryMerge = false): void {
    const current = this.actions[this.actions.length - 1];
    if (tryMerge && current?.Merge(action) === true) return;
    this.actions.push(action);
  }

  /** Returns the number of child operations. @returns Child count. */
  public GetActionCount(): number {
    return this.actions.length;
  }

  /** Reverts children in reverse execution order. @param context - Active undo context. @returns Nothing. */
  public override UndoWithContext(context: Context): void {
    for (let index = this.actions.length - 1; index >= 0; index -= 1)
      (this.actions[index] as SfxUndoAction<Context>).UndoWithContext(context);
  }

  /** Reapplies children in original execution order. @param context - Active redo context. @returns Nothing. */
  public override RedoWithContext(context: Context): void {
    for (const action of this.actions) action.RedoWithContext(context);
  }

  /** Returns the compound command label. @returns Command label. */
  public override GetComment(): string {
    return this.comment;
  }

  /** Sums retained child payloads. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return this.actions.reduce(
      /** Adds one child payload. @param total - Accumulated units. @param action - Child action. @returns Updated total. */
      (total, action) => total + action.GetPayloadSize(),
      0,
    );
  }
}

/** Action-based undo manager following LibreOffice's single array plus current-action cursor model. */
export class SfxUndoManager<Context> {
  private readonly actions: SfxUndoAction<Context>[] = [];
  private currentAction = 0;
  private readonly listActions: SfxListUndoAction<Context>[] = [];
  private mergeAllowed = false;
  private savePosition: number | undefined = 0;
  private historyRootRevision = 0;

  /** Creates a bounded manager. @param maximumActionCount - Retained top-level action capacity. @returns Nothing. */
  public constructor(private maximumActionCount = DEFAULT_MAX_UNDO_ACTION_COUNT) {
    assertActionCount(maximumActionCount);
  }

  /** Records one already-executed action, optionally merging it with the current top action. @param action - Reversible operation. @param tryMerge - Whether compatible immediate grouping is allowed. @returns Nothing. */
  public AddUndoAction(action: SfxUndoAction<Context>, tryMerge = false): void {
    const listAction = this.listActions[this.listActions.length - 1];
    if (listAction !== undefined) {
      listAction.AddAction(action, tryMerge);
      return;
    }
    this.TruncateRedoBranch();
    const current = this.actions[this.currentAction - 1];
    if (tryMerge && this.mergeAllowed && current?.Merge(action) === true) {
      return;
    }
    if (this.maximumActionCount === 0) {
      if (this.savePosition === this.currentAction) this.savePosition = undefined;
      this.historyRootRevision += 1;
      this.mergeAllowed = false;
      return;
    }
    this.actions.push(action);
    this.currentAction += 1;
    this.mergeAllowed = tryMerge;
    this.TrimToMaximum();
  }

  /** Reverts the current top action. @param context - Active document context. @returns True when an action ran. */
  public Undo(context: Context): boolean {
    if (this.IsInListAction() || this.currentAction === 0) return false;
    const action = this.actions[this.currentAction - 1] as SfxUndoAction<Context>;
    this.currentAction -= 1;
    this.mergeAllowed = false;
    try {
      action.UndoWithContext(context);
      return true;
    } catch (error) {
      this.currentAction += 1;
      throw error;
    }
  }

  /** Reapplies the next redo action. @param context - Active document context. @returns True when an action ran. */
  public Redo(context: Context): boolean {
    if (this.IsInListAction() || this.currentAction >= this.actions.length) return false;
    const action = this.actions[this.currentAction] as SfxUndoAction<Context>;
    action.RedoWithContext(context);
    this.currentAction += 1;
    this.mergeAllowed = false;
    return true;
  }

  /** Begins a nested compound action. @param comment - User-visible label. @returns Nothing. */
  public EnterListAction(comment: string): void {
    this.listActions.push(new SfxListUndoAction(comment));
  }

  /** Closes the current compound action and records it in its parent or the top-level stack. @returns Number of child actions. */
  public LeaveListAction(): number {
    const action = this.listActions.pop();
    if (action === undefined) throw new Error("No Sfx list action is open.");
    const count = action.GetActionCount();
    if (count === 0) return 0;
    const parent = this.listActions[this.listActions.length - 1];
    if (parent === undefined) this.AddUndoAction(action);
    else parent.AddAction(action);
    return count;
  }

  /** Reports whether a compound action is open. @returns True inside Enter/LeaveListAction. */
  public IsInListAction(): boolean {
    return this.listActions.length > 0;
  }

  /** Returns nested compound-action depth. @returns Open list depth. */
  public GetListActionDepth(): number {
    return this.listActions.length;
  }

  /** Returns available top-level undo count. @returns Undo action count. */
  public GetUndoActionCount(): number {
    return this.currentAction;
  }

  /** Returns available top-level redo count. @returns Redo action count. */
  public GetRedoActionCount(): number {
    return this.actions.length - this.currentAction;
  }

  /** Returns an undo action counted from the stack top. @param offset - Zero-based distance from top. @returns Matching action, when present. */
  public GetUndoAction(offset = 0): SfxUndoAction<Context> | undefined {
    return this.actions[this.currentAction - 1 - offset];
  }

  /** Returns a redo action counted from the next action. @param offset - Zero-based distance from next. @returns Matching action, when present. */
  public GetRedoAction(offset = 0): SfxUndoAction<Context> | undefined {
    return this.actions[this.currentAction + offset];
  }

  /** Returns the configured top-level capacity. @returns Maximum retained actions. */
  public GetMaxUndoActionCount(): number {
    return this.maximumActionCount;
  }

  /** Changes top-level capacity and trims the oldest retained actions immediately. @param maximumActionCount - New non-negative capacity. @returns Nothing. */
  public SetMaxUndoActionCount(maximumActionCount: number): void {
    assertActionCount(maximumActionCount);
    this.maximumActionCount = maximumActionCount;
    this.TrimToMaximum();
  }

  /** Captures an exact undo boundary and closes grouping so later edits cannot merge across it. @returns Opaque boundary token suitable for asynchronous save acknowledgement. */
  public CaptureSavePosition(): SfxUndoSavePosition {
    if (this.IsInListAction())
      throw new Error("Cannot capture SfxUndoManager save position inside a list action.");
    this.mergeAllowed = false;
    return Object.freeze({
      ...(this.currentAction === 0
        ? {}
        : { actionBefore: this.actions[this.currentAction - 1] as SfxUndoAction<unknown> }),
      historyRootRevision: this.historyRootRevision,
      position: this.currentAction,
    });
  }

  /** Marks the current or a still-reachable captured stack boundary as the primary-medium save position. @param position - Optional asynchronous-save boundary. @returns Whether the mark moved. */
  public SetSavePosition(position?: SfxUndoSavePosition): boolean {
    const nextPosition =
      position === undefined ? this.currentAction : this.ResolveSavePosition(position);
    const changed = this.savePosition !== nextPosition;
    this.savePosition = nextPosition;
    this.mergeAllowed = false;
    return changed;
  }

  /** Invalidates an unreachable or unknown primary save boundary. @returns Whether a mark existed. */
  public ClearSavePosition(): boolean {
    const changed = this.savePosition !== undefined;
    this.savePosition = undefined;
    this.mergeAllowed = false;
    return changed;
  }

  /** Closes the current action-merging window without changing history. @returns Nothing. */
  public BreakUndoGrouping(): void {
    this.mergeAllowed = false;
  }

  /** Reports whether current content corresponds to the primary save mark. @returns True at the marked action boundary. */
  public IsAtSavePosition(): boolean {
    return this.savePosition === this.currentAction;
  }

  /** Returns approximate retained domain payload across undo and redo. @returns Payload units. */
  public GetHistoryPayloadSize(): number {
    return this.actions.reduce(
      /** Adds one action payload. @param total - Accumulated units. @param action - Retained action. @returns Updated total. */
      (total, action) => total + action.GetPayloadSize(),
      0,
    );
  }

  /** Clears all retained actions and treats the current state as the new clean boundary. @returns Nothing. */
  public Clear(): void {
    if (this.IsInListAction()) throw new Error("Cannot clear SfxUndoManager inside a list action.");
    this.actions.length = 0;
    this.currentAction = 0;
    this.historyRootRevision += 1;
    this.mergeAllowed = false;
    this.savePosition = 0;
  }

  /** Removes the redo branch before a newly executed command is recorded. @returns Nothing. */
  private TruncateRedoBranch(): void {
    if (this.currentAction === this.actions.length) return;
    this.actions.splice(this.currentAction);
    if (this.savePosition !== undefined && this.savePosition > this.currentAction)
      this.savePosition = undefined;
  }

  /** Drops oldest actions above the configured capacity while repairing cursor and save mark. @returns Nothing. */
  private TrimToMaximum(): void {
    const removeCount = this.actions.length - this.maximumActionCount;
    if (removeCount <= 0) return;
    this.actions.splice(0, removeCount);
    this.historyRootRevision += 1;
    this.currentAction = Math.max(0, this.currentAction - removeCount);
    if (this.savePosition !== undefined) {
      this.savePosition -= removeCount;
      if (this.savePosition < 0) this.savePosition = undefined;
    }
  }

  /** Resolves an asynchronous save token only while its exact action boundary remains reachable. @param position - Captured boundary. @returns Current index or undefined when history diverged. */
  private ResolveSavePosition(position: SfxUndoSavePosition): number | undefined {
    if (position.historyRootRevision !== this.historyRootRevision) return undefined;
    if (position.position === 0) return 0;
    return this.actions[position.position - 1] === position.actionBefore
      ? position.position
      : undefined;
  }
}

/** Validates a configured action capacity. @param count - Candidate count. @returns Nothing. */
function assertActionCount(count: number): void {
  if (!Number.isInteger(count) || count < 0)
    throw new Error("Maximum undo action count must be a non-negative integer.");
}
