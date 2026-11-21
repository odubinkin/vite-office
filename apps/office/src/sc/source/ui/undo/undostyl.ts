/** @fileoverview Page-family ScStyleSaveData and ScUndoModifyStyle history. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxStyleSheetBase } from "../../../../svl/source/items/style-model";
import type { ScDocShell } from "../docshell/docsh";
import { PageStyleModified, RenamePageStyle } from "../docshell/docsh4";

/** Captures the name and directly assigned items of an actual page style. */
export class ScStyleSaveData {
  readonly name: string;
  readonly items: SfxItemSet;

  /** Copies the original style items independently of the live set. @param style - Page style. @returns Snapshot. */
  constructor(style: SfxStyleSheetBase) {
    this.name = text(style.GetName());
    this.items = style.GetItemSet().Clone();
  }
}

/** Replays native page-style modifications on the shared style owner. */
export class ScUndoModifyStyle extends SfxUndoAction<ScDocShell> {
  /** Owns both page-style snapshots. @param before - Original style. @param after - Applied style. @returns Undo action. */
  constructor(
    private readonly before: ScStyleSaveData,
    private readonly after: ScStyleSaveData,
  ) {
    super();
  }

  /** Borrows the current style, then restores its original name and explicit item states. @param shell - Actual document shell. @param current - Current snapshot. @param target - Snapshot to restore. @returns Nothing. */
  private DoChange(shell: ScDocShell, current: ScStyleSaveData, target: ScStyleSaveData): void {
    const style = shell.GetDocument().GetStyleSheetPool()?.GetPageStyle(current.name);
    if (!style || !RenamePageStyle(style, target.name)) return;
    const items = style.GetItemSet();
    items.ClearItem();
    items.PutSet(target.items, false);
    PageStyleModified(shell, current.name, target.name);
  }

  /** Reinstates the original page format. @param shell - Workbook shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.after, this.before);
  }

  /** Reinstates the accepted page format. @param shell - Workbook shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    this.DoChange(shell, this.before, this.after);
  }

  /** Returns the original history caption. @returns Undo caption. */
  override GetComment(): string {
    return "Edit Page Style";
  }

  /** Releases the independent item sets. @returns Nothing. */
  override Dispose(): void {
    this.before.items.Dispose();
    this.after.items.Dispose();
  }
}
