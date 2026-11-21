/** @fileoverview Undo for the source Calc definition dialog and name entry. */
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScRangeData } from "../../core/tool/rangenam";
import type { ScDocShell } from "../docshell/docsh";

/** Owns the definition used to remove and restore the original token index. */
export class ScUndoAddRangeData extends SfxUndoAction<ScDocShell> {
  private readonly data: ScRangeData;

  /** Copies the admitted entry. @param data - Definition. @param tab - Global or sheet scope. @returns Undo action. */
  constructor(
    data: ScRangeData,
    private readonly tab: number,
  ) {
    super();
    this.data = data.Clone();
  }

  /** Removes the live name. @param shell - Workbook shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    const names = shell.GetDocument().GetRangeName(this.tab);
    const live = names?.findByIndex(this.data.GetIndex());
    if (live) names?.erase(live);
    this.Changed(shell);
  }

  /** Restores the original indexed name. @param shell - Workbook shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    shell.GetDocument().GetRangeName(this.tab)?.insert(this.data.Clone());
    this.Changed(shell);
  }

  /** Tells listeners and sheet persistence about a scope change. @param shell - Workbook shell. @returns Nothing. */
  private Changed(shell: ScDocShell): void {
    shell.GetDocument().FetchTable(this.tab)?.SetStreamValid(false);
    shell.Broadcast(new SfxHint(SfxHintId.ScAreasChanged));
  }

  /** Releases the owned token array. @returns Nothing. */
  override Dispose(): void {
    this.data.GetCode().Clear();
  }

  /** Returns original undo caption. @returns Caption. */
  override GetComment(): string {
    return "Edit range names";
  }
}
