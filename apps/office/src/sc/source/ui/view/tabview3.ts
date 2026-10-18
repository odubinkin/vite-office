/** @fileoverview ScTabView sheet navigation/selection subset from tabview3.cxx and tabview2.cxx over canonical ScViewData. The current document slice has only visible sheets;hidden-sheet,reference-mode,VCL drawing and window services remain unported. */
import { ValidTab } from "../../../inc/address";
import type { ScViewData } from "../inc/viewdata";
/** Native sheet navigation/grouping owner for the existing all-visible document slice. */
export class ScTabView {
  /** Borrows canonical view data and native Calc Input/WrapNextPrevSheetTab default. @param aViewData - Actual view state. @param wrapNextPrevSheetTab - Pinned Calc.xcs default,true. @returns View. */
  constructor(
    private readonly aViewData: ScViewData,
    private readonly wrapNextPrevSheetTab = true,
  ) {}
  /** Selects the next/previous existing sheet with native wrapping and group extension. @param nDir - Signed movement;zero does nothing. @param bExtendSelection - Extend the sheet group. @returns Nothing. */
  SelectNextTab(nDir: number, bExtendSelection = false): void {
    if (!nDir) return;
    const nTab = this.aViewData.GetTabNumber(),
      nCount = this.aViewData.GetDocument().GetTableCount();
    let nNextTab = nTab + (nDir < 0 ? -1 : 1);
    if (nNextTab < 0 || nNextTab >= nCount) {
      if (!this.wrapNextPrevSheetTab) return;
      nNextTab = nDir < 0 ? nCount - 1 : 0;
    }
    if (nNextTab !== nTab) this.SetTabNo(nNextTab, false, bExtendSelection);
  }
  /** Switches actual per-sheet view data with native group retention/collapse rules. @param nTab - Existing sheet. @param bNew - Refresh same sheet when true. @param bExtendSelection - Requested group extension. @returns Nothing. */
  SetTabNo(nTab: number, bNew = false, bExtendSelection = false): void {
    if (!ValidTab(nTab) || !this.aViewData.GetDocument().FetchTable(nTab)) return;
    if (!bNew && nTab === this.aViewData.GetTabNumber()) return;
    const rMark = this.aViewData.GetMarkData(),
      nTabCount = this.aViewData.GetDocument().GetTableCount();
    rMark.ResetMark();
    this.aViewData.SetTabNo(nTab);
    let bAllSelected = true;
    for (let nSelTab = 0; nSelTab < nTabCount; ++nSelTab) {
      if (rMark.GetTableSelect(nSelTab)) {
        if (nTab === nSelTab) bExtendSelection = true;
      } else {
        bAllSelected = false;
        if (bExtendSelection) break;
      }
    }
    if (bAllSelected && !bNew) bExtendSelection = false;
    if (bExtendSelection) rMark.SelectTable(nTab, true);
    else rMark.SelectOneTable(nTab);
    this.aViewData.ResetOldCursor();
  }
  /** Selects every actual sheet without moving the cursor or changing cell marks. @returns Nothing. */
  SelectAllTables(): void {
    const nCount = this.aViewData.GetDocument().GetTableCount();
    if (nCount > 1)
      for (let i = 0; i < nCount; i++) this.aViewData.GetMarkData().SelectTable(i, true);
  }
  /** Keeps only the active sheet selected,as native DeselectAllTables. @returns Nothing. */
  DeselectAllTables(): void {
    const rMark = this.aViewData.GetMarkData(),
      nTab = this.aViewData.GetTabNumber(),
      nCount = this.aViewData.GetDocument().GetTableCount();
    for (let i = 0; i < nCount; i++) rMark.SelectTable(i, i === nTab);
  }
}
