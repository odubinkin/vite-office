/** @fileoverview Verifies Sfx action stacks, merging, compounds, save marks, redo branches, and limits. */

import { describe, expect, it } from "vitest";
import {
  DEFAULT_MAX_UNDO_ACTION_COUNT,
  SfxListUndoAction,
  SfxUndoAction,
  SfxUndoManager,
} from "./undo";

/** Mutable context used to observe generic actions. */
interface TextContext {
  /** Current test value. */
  value: string;
}

/** Reversible generic text replacement with optional grouping. */
class TextAction extends SfxUndoAction<TextContext> {
  /** Creates one action. @param before - Prior value. @param after - Next value. @param group - Optional merge identity. @param fails - Whether undo/redo throws. @returns Nothing. */
  public constructor(
    private readonly before: string,
    private after: string,
    private readonly group?: string,
    private readonly fails = false,
  ) {
    super();
  }

  /** Restores the prior value. @param context - Mutable context. @returns Nothing. */
  public override UndoWithContext(context: TextContext): void {
    if (this.fails) throw new Error("undo failed");
    context.value = this.before;
  }

  /** Applies the next value. @param context - Mutable context. @returns Nothing. */
  public override RedoWithContext(context: TextContext): void {
    if (this.fails) throw new Error("redo failed");
    context.value = this.after;
  }

  /** Returns a deterministic test label. @returns Label. */
  public override GetComment(): string {
    return `Set ${this.after}`;
  }

  /** Merges matching groups. @param next - Newer action. @returns Whether absorbed. */
  public override Merge(next: SfxUndoAction<TextContext>): boolean {
    if (!(next instanceof TextAction) || this.group === undefined || next.group !== this.group)
      return false;
    this.after = next.after;
    return true;
  }

  /** Counts retained test text. @returns Character count. */
  public override GetPayloadSize(): number {
    return this.before.length + this.after.length;
  }
}

/** Executes then records one action like a document shell. @param manager - Target manager. @param context - Mutable context. @param action - New action. @param merge - Whether grouping is allowed. @returns Nothing. */
function apply(
  manager: SfxUndoManager<TextContext>,
  context: TextContext,
  action: TextAction,
  merge = false,
): void {
  action.RedoWithContext(context);
  manager.AddUndoAction(action, merge);
}

describe("SfxUndoManager" /** Groups generic action-manager behavior. @returns Nothing. */, function defineUndoManagerTests(): void {
  it("undoes, redoes, truncates a redo branch, and exposes stack actions" /** Verifies the upstream current-action cursor model. @returns Nothing. */, function navigatesActions(): void {
    const context = { value: "one" };
    const manager = new SfxUndoManager<TextContext>();
    apply(manager, context, new TextAction("one", "two"));
    apply(manager, context, new TextAction("two", "three"));
    expect(manager.GetUndoActionCount()).toBe(2);
    expect(manager.GetRedoActionCount()).toBe(0);
    expect(manager.GetUndoAction()?.GetComment()).toBe("Set three");
    expect(manager.GetUndoAction(1)?.GetComment()).toBe("Set two");
    expect(manager.GetUndoAction(2)).toBeUndefined();
    expect(manager.Undo(context)).toBe(true);
    expect(context.value).toBe("two");
    expect(manager.GetRedoAction()?.GetComment()).toBe("Set three");
    expect(manager.Redo(context)).toBe(true);
    expect(context.value).toBe("three");
    expect(manager.Redo(context)).toBe(false);
    expect(manager.Undo(context)).toBe(true);
    apply(manager, context, new TextAction("two", "four"));
    expect(manager.GetRedoActionCount()).toBe(0);
    expect(manager.GetRedoAction()).toBeUndefined();
    expect(manager.GetUndoAction()?.GetComment()).toBe("Set four");
  });

  it("groups only an open compatible action and invalidates a save position changed in place" /** Verifies Merge and explicit grouping barriers. @returns Nothing. */, function groupsActions(): void {
    const context = { value: "" };
    const manager = new SfxUndoManager<TextContext>();
    apply(manager, context, new TextAction("", "a", "typing"), true);
    manager.SetSavePosition();
    apply(manager, context, new TextAction("a", "ab", "typing"), true);
    expect(manager.GetUndoActionCount()).toBe(2);
    expect(manager.IsAtSavePosition()).toBe(false);
    apply(manager, context, new TextAction("ab", "abc", "typing"), true);
    expect(manager.GetUndoActionCount()).toBe(2);
    expect(manager.GetUndoAction()?.GetComment()).toBe("Set abc");
    manager.BreakUndoGrouping();
    apply(manager, context, new TextAction("abc", "abcd", "typing"), true);
    expect(manager.GetUndoActionCount()).toBe(3);
    expect(manager.ClearSavePosition()).toBe(true);
    expect(manager.ClearSavePosition()).toBe(false);
    expect(manager.SetSavePosition()).toBe(true);
    expect(manager.ClearSavePosition()).toBe(true);
    expect(manager.SetSavePosition()).toBe(true);
    expect(manager.SetSavePosition()).toBe(false);
    expect(manager.IsAtSavePosition()).toBe(true);
  });

  it("records nested and empty list actions as one top-level operation" /** Verifies EnterListAction/LeaveListAction ordering and payload. @returns Nothing. */, function recordsCompoundActions(): void {
    const context = { value: "a" };
    const manager = new SfxUndoManager<TextContext>();
    manager.EnterListAction("Replace");
    expect(manager.IsInListAction()).toBe(true);
    expect(manager.GetListActionDepth()).toBe(1);
    expect(manager.Undo(context)).toBe(false);
    expect(manager.Redo(context)).toBe(false);
    apply(manager, context, new TextAction("a", "b", "child"), true);
    apply(manager, context, new TextAction("b", "c", "child"), true);
    manager.EnterListAction("Nested");
    apply(manager, context, new TextAction("c", "d"));
    expect(manager.LeaveListAction()).toBe(1);
    expect(manager.LeaveListAction()).toBe(2);
    expect(manager.GetUndoActionCount()).toBe(1);
    expect(manager.GetUndoAction()).toBeInstanceOf(SfxListUndoAction);
    expect(manager.GetUndoAction()?.GetComment()).toBe("Replace");
    expect(manager.GetHistoryPayloadSize()).toBeGreaterThan(0);
    expect(manager.Undo(context)).toBe(true);
    expect(context.value).toBe("a");
    expect(manager.Redo(context)).toBe(true);
    expect(context.value).toBe("d");
    manager.EnterListAction("Empty");
    expect(manager.LeaveListAction()).toBe(0);
    expect(
      /** Attempts to close a list action when none is open. @returns Invalid transition that never returns. */
      () => manager.LeaveListAction(),
    ).toThrow("No Sfx list action");
  });

  it("bounds retained actions and repairs save marks when old actions fall out" /** Verifies the default and configurable history limit. @returns Nothing. */, function boundsActions(): void {
    const context = { value: "0" };
    const manager = new SfxUndoManager<TextContext>();
    expect(manager.GetMaxUndoActionCount()).toBe(DEFAULT_MAX_UNDO_ACTION_COUNT);
    manager.SetSavePosition();
    for (let index = 1; index <= DEFAULT_MAX_UNDO_ACTION_COUNT + 5; index += 1) {
      const next = `${index}`;
      apply(manager, context, new TextAction(context.value, next));
    }
    expect(manager.GetUndoActionCount()).toBe(DEFAULT_MAX_UNDO_ACTION_COUNT);
    expect(manager.IsAtSavePosition()).toBe(false);
    manager.SetMaxUndoActionCount(2);
    expect(manager.GetMaxUndoActionCount()).toBe(2);
    expect(manager.GetUndoActionCount()).toBe(2);
    manager.SetMaxUndoActionCount(0);
    expect(manager.GetUndoActionCount()).toBe(0);
    apply(manager, context, new TextAction(context.value, "discarded"));
    expect(manager.GetUndoActionCount()).toBe(0);
    expect(manager.Undo(context)).toBe(false);
    const disabled = new SfxUndoManager<TextContext>(0);
    disabled.AddUndoAction(new TextAction(context.value, "discarded"));
    expect(disabled.IsAtSavePosition()).toBe(false);
  });

  it("rejects invalid capacities, blank compounds, unsafe clears, and restores the cursor after failed Undo" /** Verifies defensive manager invariants. @returns Nothing. */, function rejectsInvalidState(): void {
    expect(
      /** Constructs a manager with a negative capacity. @returns Invalid construction that never returns. */
      () => new SfxUndoManager(-1),
    ).toThrow("non-negative integer");
    expect(
      /** Constructs a manager with a fractional capacity. @returns Invalid construction that never returns. */
      () => new SfxUndoManager(0.5),
    ).toThrow("non-negative integer");
    expect(
      /** Constructs a compound action without a label. @returns Invalid construction that never returns. */
      () => new SfxListUndoAction(""),
    ).toThrow("must not be blank");
    const context = { value: "a" };
    const manager = new SfxUndoManager<TextContext>();
    expect(
      /** Applies an invalid runtime capacity. @returns Invalid transition that never returns. */
      () => manager.SetMaxUndoActionCount(-1),
    ).toThrow("non-negative integer");
    manager.EnterListAction("Open");
    expect(
      /** Clears history while a compound action is open. @returns Invalid transition that never returns. */
      () => manager.Clear(),
    ).toThrow("inside a list action");
    expect(manager.LeaveListAction()).toBe(0);
    context.value = "b";
    manager.AddUndoAction(new TextAction("a", "b", undefined, true));
    expect(
      /** Executes a deliberately failing action. @returns Failure propagated from the action. */
      () => manager.Undo(context),
    ).toThrow("undo failed");
    expect(manager.GetUndoActionCount()).toBe(1);
    manager.Clear();
    expect(manager.GetUndoActionCount()).toBe(0);
    expect(manager.IsAtSavePosition()).toBe(true);
  });

  it("invalidates a save position retained on a discarded redo branch" /** Verifies a new command cannot keep an unreachable primary-medium boundary. @returns Nothing. */, function invalidatesRedoSavePosition(): void {
    const context = { value: "a" };
    const manager = new SfxUndoManager<TextContext>();
    apply(manager, context, new TextAction("a", "b"));
    apply(manager, context, new TextAction("b", "c"));
    manager.SetSavePosition();
    manager.Undo(context);
    apply(manager, context, new TextAction("b", "d"));
    expect(manager.IsAtSavePosition()).toBe(false);
  });

  it("retains a reachable save position while trimming older actions" /** Verifies capacity trimming translates an in-range save boundary. @returns Nothing. */, function retainsTrimmedSavePosition(): void {
    const context = { value: "a" };
    const manager = new SfxUndoManager<TextContext>();
    apply(manager, context, new TextAction("a", "b"));
    apply(manager, context, new TextAction("b", "c"));
    apply(manager, context, new TextAction("c", "d"));
    manager.SetSavePosition();
    manager.SetMaxUndoActionCount(2);
    expect(manager.IsAtSavePosition()).toBe(true);
  });

  it("captures an exact asynchronous save boundary without allowing later action merging" /** Verifies a save token continues to identify the earlier reachable state after another grouped edit. @returns Nothing. */, function capturesSaveBoundary(): void {
    const context = { value: "a" };
    const manager = new SfxUndoManager<TextContext>();
    apply(manager, context, new TextAction("a", "b", "typing"), true);
    const position = manager.CaptureSavePosition();
    apply(manager, context, new TextAction("b", "c", "typing"), true);
    expect(manager.GetUndoActionCount()).toBe(2);
    expect(manager.SetSavePosition(position)).toBe(true);
    expect(manager.IsAtSavePosition()).toBe(false);
    manager.Undo(context);
    expect(context.value).toBe("b");
    expect(manager.IsAtSavePosition()).toBe(true);
  });

  it("rejects captured boundaries after their history branch or root is replaced" /** Verifies delayed persistence cannot attach a save mark to unrelated history. @returns Nothing. */, function rejectsStaleSaveBoundaries(): void {
    const context = { value: "a" };
    const manager = new SfxUndoManager<TextContext>();
    const root = manager.CaptureSavePosition();
    apply(manager, context, new TextAction("a", "b"));
    expect(manager.SetSavePosition(root)).toBe(false);
    expect(manager.IsAtSavePosition()).toBe(false);
    const changed = manager.CaptureSavePosition();
    manager.Clear();
    expect(manager.SetSavePosition(changed)).toBe(true);
    expect(manager.IsAtSavePosition()).toBe(false);
    manager.EnterListAction("Open");
    expect(
      /** Attempts to capture a partial compound operation. @returns Invalid token. */ () =>
        manager.CaptureSavePosition(),
    ).toThrow("inside a list action");
    expect(manager.LeaveListAction()).toBe(0);

    const branchManager = new SfxUndoManager<TextContext>();
    context.value = "a";
    apply(branchManager, context, new TextAction("a", "b"));
    const replacedBranch = branchManager.CaptureSavePosition();
    branchManager.Undo(context);
    apply(branchManager, context, new TextAction("a", "c"));
    expect(branchManager.SetSavePosition(replacedBranch)).toBe(true);
    expect(branchManager.IsAtSavePosition()).toBe(false);
  });

  it("provides base non-merge and zero-payload behavior" /** Covers default SfxUndoAction hooks. @returns Nothing. */, function usesBaseHooks(): void {
    /** Minimal action used to exercise the base optional hooks. */
    class MinimalAction extends SfxUndoAction<TextContext> {
      /** No-op undo. @param context - Test context. @returns Nothing. */
      public override UndoWithContext(context: TextContext): void {
        void context;
      }
      /** No-op redo. @param context - Test context. @returns Nothing. */
      public override RedoWithContext(context: TextContext): void {
        void context;
      }
      /** Returns label. @returns Label. */
      public override GetComment(): string {
        return "Minimal";
      }
    }
    const action = new MinimalAction();
    expect(action.Merge(new MinimalAction())).toBe(false);
    expect(action.GetPayloadSize()).toBe(0);
  });
});
