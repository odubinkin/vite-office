/** @fileoverview Undo for the source Calc definition dialog and name entry. */
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { ScRangeData, ScRangeNameMap } from "../../core/tool/rangenam";
import { SetAllRangeNames, type ScRangeNameFormula } from "../../core/data/document10.rangenames";
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

/** Native name manager history owns both full scope snapshots and affected hybrids. */
export class ScUndoAllRangeNames extends SfxUndoAction<ScDocShell> {
  /** Takes both manager snapshots. @param before - Old names. @param after - Edited names. @param formulas - Original and renamed hybrid strings. @returns Action. */
  constructor(
    private readonly before: ScRangeNameMap,
    private readonly after: ScRangeNameMap,
    private readonly formulas: readonly ScRangeNameFormula[],
  ) {
    super();
  }

  /** Restores the previous name map and reference spellings. @param shell - Workbook. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    SetAllRangeNames(shell.GetDocument(), this.before, this.formulas, false);
    shell.Broadcast(new SfxHint(SfxHintId.ScAreasChanged));
  }

  /** Reinstates the edited map and reference spellings. @param shell - Workbook. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    SetAllRangeNames(shell.GetDocument(), this.after, this.formulas, true);
    shell.Broadcast(new SfxHint(SfxHintId.ScAreasChanged));
  }

  /** Releases both snapshots. @returns Nothing. */
  override Dispose(): void {
    for (const snapshot of [this.before, this.after])
      for (const names of snapshot.values()) names.clear();
  }

  /** Returns source undo label. @returns Caption. */
  override GetComment(): string {
    return "Edit range names";
  }
}
