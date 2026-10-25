/** @fileoverview Original normal unmerged-cell block selection over native view/mark state;VCL paint and merged/device services stay outside this admitted profile. */
import type { ScTabView } from "../inc/tabview";
import { ScRange } from "../../../inc/address";
/** Native IsMarking compares the retained block anchor. @param this - Actual view. @param col - Column. @param row - Row. @param tab - Sheet. @returns Anchor matches. */
export function IsMarking(this: ScTabView, col: number, row: number, tab: number): boolean {
  return (
    this.IsBlockMode() &&
    this["nBlockStartX"] === col &&
    this["nBlockStartY"] === row &&
    this["nBlockStartZ"] === tab
  );
}
/** Original normal block initialization preserves negative/full-axis tests and source defaults. @param this - Actual view. @param col - Anchor column. @param row - Anchor row. @param tab - Anchor sheet. @param testNegative - Test existing selection. @param cols - Full columns. @param rows - Full rows. @param forceNegative - Force subtract mode. @returns Nothing. */
export function InitBlockMode(
  this: ScTabView,
  col: number,
  row: number,
  tab: number,
  testNegative: boolean,
  cols: boolean,
  rows: boolean,
  forceNegative: boolean,
): void {
  if (this.IsBlockMode()) return;
  const data = this.GetViewData(),
    doc = data.GetDocument(),
    mark = data.GetMarkData();
  if (!doc.ValidCol(col)) col = doc.MaxCol();
  if (!doc.ValidRow(row)) row = doc.MaxRow();
  this["bBlockNeg"] =
    forceNegative ||
    (testNegative &&
      (cols
        ? mark.IsColumnMarked(col)
        : rows
          ? mark.IsRowMarked(row)
          : mark.IsCellMarked(col, row)));
  mark.SetMarkNegative(this["bBlockNeg"]);
  this["meBlockMode"] = 1;
  this["bBlockCols"] = cols;
  this["bBlockRows"] = rows;
  this["nBlockStartX"] = this["nBlockStartXOrig"] = col;
  this["nBlockStartY"] = this["nBlockStartYOrig"] = row;
  this["nBlockStartZ"] = tab;
  this["nBlockEndX"] = this["nOldCurX"] = col;
  this["nBlockEndY"] = this["nOldCurY"] = row;
  this["nBlockEndZ"] = tab;
  if (cols) {
    this["nBlockStartY"] = this["nBlockStartYOrig"] = 0;
    this["nBlockEndY"] = doc.MaxRow();
  }
  if (rows) {
    this["nBlockStartX"] = this["nBlockStartXOrig"] = 0;
    this["nBlockEndX"] = doc.MaxCol();
  }
  mark.SetMarkArea(
    new ScRange(
      this["nBlockStartX"],
      this["nBlockStartY"],
      data.GetTabNumber(),
      this["nBlockEndX"],
      this["nBlockEndY"],
      data.GetTabNumber(),
    ),
  );
}
/** Original Own block initialization retains selection endpoints without synthesizing a marked rectangle. @param this - Actual view. @param range - Existing selection. @returns Nothing. */
export function InitOwnBlockMode(this: ScTabView, range: ScRange): void {
  if (this.IsBlockMode()) return;
  const mark = this.GetViewData().GetMarkData();
  if (!mark.IsMarked() && !mark.IsMultiMarked()) this.GetFunctionSet().DeselectAll();
  this["meBlockMode"] = 2;
  this["nBlockStartX"] = range.aStart.Col();
  this["nBlockStartY"] = range.aStart.Row();
  this["nBlockStartZ"] = range.aStart.Tab();
  this["nBlockEndX"] = range.aEnd.Col();
  this["nBlockEndY"] = range.aEnd.Row();
  this["nBlockEndZ"] = range.aEnd.Tab();
}
/** Original DoneBlockMode applies native multi-mark conversion before finishing;paint-only effects are projected by the browser. @param this - Actual view. @param continued - Retain completed selection as multi marks. @returns Nothing. */
export function DoneBlockMode(this: ScTabView, continued: boolean): void {
  if (!this.IsBlockMode() || this["bMoveIsShift"]) return;
  const mark = this.GetViewData().GetMarkData(),
    marking = mark.GetMarkingFlag();
  mark.SetMarking(false);
  if (this["bBlockNeg"] && !continued) mark.MarkToMulti();
  if (continued) mark.MarkToMulti();
  else mark.ResetMark();
  this["meBlockMode"] = 0;
  mark.SetMarking(marking);
  mark.SetMarkNegative(false);
}
/** Original MarkCursor updates the block endpoint while leaving the editing/active cursor at its anchor. Current storage cannot contain merged cells. @param this - Actual view. @param col - Endpoint column. @param row - Endpoint row. @param tab - Endpoint sheet. @param cols - Full-column gesture. @param rows - Full-row gesture. @param cellSelection - Original merged-expansion selector,whose admitted unmerged result is identical. @returns Nothing. */
export function MarkCursor(
  this: ScTabView,
  col: number,
  row: number,
  tab: number,
  cols: boolean,
  rows: boolean,
  cellSelection: boolean,
): void {
  const data = this.GetViewData(),
    doc = data.GetDocument(),
    mark = data.GetMarkData();
  if (!doc.ValidCol(col)) col = doc.MaxCol();
  if (!doc.ValidRow(row)) row = doc.MaxRow();
  if (!this.IsBlockMode()) this.InitBlockMode(col, row, tab, false, cols, rows);
  if (cols) row = doc.MaxRow();
  if (rows) col = doc.MaxCol();
  const area = new ScRange(mark.GetMarkArea());
  if (
    (area.aStart.Col() !== this["nBlockStartX"] && area.aEnd.Col() !== this["nBlockStartX"]) ||
    (area.aStart.Row() !== this["nBlockStartY"] && area.aEnd.Row() !== this["nBlockStartY"]) ||
    this["meBlockMode"] === 2
  ) {
    const oldShift = this["bMoveIsShift"];
    this["bMoveIsShift"] = false;
    this.DoneBlockMode();
    this["bMoveIsShift"] = oldShift;
    this.InitBlockMode(
      area.aStart.Col(),
      area.aStart.Row(),
      this["nBlockStartZ"],
      mark.IsMarkNegative(),
      cols,
      rows,
    );
  }
  if (!cols && !rows) this.GetHeaderFunctionSet().SetAnchorFlag(false);
  if (col === this["nOldCurX"] && row === this["nOldCurY"]) return;
  if (cellSelection) {
    this["nBlockStartX"] = this["nBlockStartXOrig"];
    this["nBlockStartY"] = this["nBlockStartYOrig"];
  }
  this["nBlockEndX"] = col;
  this["nBlockEndY"] = row;
  mark.SetMarkArea(new ScRange(this["nBlockStartX"], this["nBlockStartY"], tab, col, row, tab));
  this["nOldCurX"] = col;
  this["nOldCurY"] = row;
}
