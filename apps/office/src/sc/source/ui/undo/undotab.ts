/** @fileoverview ScUndoShowHideTab and ScUndoTabColor from undotab.cxx. */
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { Color } from "../../../../tools/inc/color";
import type { ScPrintRangeSaver } from "../../core/tool/prnsave";
import type { ScDocShell } from "../docshell/docsh";
import type { ScTabView } from "../view/tabview3";

/** Original visibility action replays the sheet sequence on the owning view. */
export class ScUndoShowHideTab extends SfxUndoAction<ScDocShell> {
  /** Owns the tabs affected by one command. @param tabs - Affected tabs in operation order. @param show - Original direction. @param view - Actual view. @returns Action. */
  constructor(
    private readonly tabs: readonly number[],
    private readonly show: boolean,
    private readonly view: ScTabView,
  ) {
    super();
  }

  /** Replays the native visibility and activation sequence. @param show - Desired visibility. @returns Nothing. */
  private DoChange(show: boolean): void {
    const doc = this.view.GetViewData().GetDocument();
    for (const tab of this.tabs) {
      doc.SetVisible(tab, show);
      this.view.SetTabNo(tab, true);
    }
  }

  /** Reverses visibility. @returns Nothing. */
  override UndoWithContext(): void {
    this.DoChange(!this.show);
  }

  /** Reapplies visibility. @returns Nothing. */
  override RedoWithContext(): void {
    this.DoChange(this.show);
  }

  /** Returns the source history caption. @returns Caption. */
  override GetComment(): string {
    return (this.show ? "Show Sheet" : "Hide sheet") + (this.tabs.length > 1 ? "s" : "");
  }
}

/** Old and new color for one tab, as carried by ScUndoTabColorInfo. */
export interface ScUndoTabColorInfo {
  readonly tab: number;
  readonly oldColor: Readonly<Color>;
  readonly newColor: Readonly<Color>;
}

/** Original tab color history stores each sheet's color independently. */
export class ScUndoTabColor extends SfxUndoAction<ScDocShell> {
  /** Receives the document function's owned change list. @param colors - Ordered changes. @returns Action. */
  constructor(private readonly colors: readonly ScUndoTabColorInfo[]) {
    super();
  }

  /** Reverts the captured colors. @param shell - Document shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    for (const { tab, oldColor } of this.colors) shell.GetDocument().SetTabBgColor(tab, oldColor);
  }

  /** Reapplies the captured colors. @param shell - Document shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    for (const { tab, newColor } of this.colors) shell.GetDocument().SetTabBgColor(tab, newColor);
  }

  /** Returns the native singular or grouped caption. @returns Caption. */
  override GetComment(): string {
    return this.colors.length > 1 ? "Color Tabs" : "Color Tab";
  }
}

/** Replays the native print-range snapshot and reactivates its originating sheet. */
export class ScUndoPrintRange extends SfxUndoAction<ScDocShell> {
  /** Saves both aggregate states without copying cells. @param view - Active view. @param tab - Originating sheet. @param oldRanges - Before. @param newRanges - After. @returns History action. */
  constructor(
    private readonly view: ScTabView,
    private readonly tab: number,
    private readonly oldRanges: ScPrintRangeSaver,
    private readonly newRanges: ScPrintRangeSaver,
  ) {
    super();
  }

  /** Reinstates the earlier workbook settings. @param shell - Actual document shell. @returns Nothing. */
  override UndoWithContext(shell: ScDocShell): void {
    shell.GetDocument().RestorePrintRanges(this.oldRanges);
    this.view.SetTabNo(this.tab);
  }

  /** Reinstates the changed workbook settings. @param shell - Actual document shell. @returns Nothing. */
  override RedoWithContext(shell: ScDocShell): void {
    shell.GetDocument().RestorePrintRanges(this.newRanges);
    this.view.SetTabNo(this.tab);
  }

  /** Returns the original Calc history caption. @returns Caption. */
  override GetComment(): string {
    return "Print range";
  }
}
