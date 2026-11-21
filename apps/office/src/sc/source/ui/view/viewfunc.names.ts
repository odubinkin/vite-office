/** @fileoverview Original Create Names selection defaults. */
import { ScAddress, ScRange } from "../../../inc/address";
import { CreateNameFlags } from "../inc/scui_def";
import { ScMarkType, type ScViewData } from "../inc/viewdata";

/** Suggests the source left-or-right and top-or-bottom label edges. @param view - Native view selection. @returns Source flags. */
export function GetCreateNameFlags(view: ScViewData): CreateNameFlags {
  const range = new ScRange();
  if (view.GetSimpleArea(range) !== ScMarkType.SC_MARK_SIMPLE) return CreateNameFlags.NONE;
  const { aStart, aEnd } = range;
  const left = aStart.Col(),
    right = aEnd.Col(),
    top = aStart.Row(),
    bottom = aEnd.Row();
  const tab = view.CurrentTabForData();
  const doc = view.GetDocument();
  const insetCol = right - left > 1 ? 1 : 0;
  const insetRow = bottom - top > 1 ? 1 : 0;

  /** Tests the part of a row used by the native edge detector. @param row - Candidate edge. @returns Whether it consists of strings. */
  function textRow(row: number): boolean {
    for (let col = left + insetCol; col <= right - insetCol; col++)
      if (!doc.GetRefCellValue(new ScAddress(col, row, tab)).hasString()) return false;
    return true;
  }

  /** Tests the part of a column used by the native edge detector. @param col - Candidate edge. @returns Whether it consists of strings. */
  function textColumn(col: number): boolean {
    for (let row = top + insetRow; row <= bottom - insetRow; row++)
      if (!doc.GetRefCellValue(new ScAddress(col, row, tab)).hasString()) return false;
    return true;
  }

  let flags = CreateNameFlags.NONE;
  if (top !== bottom) {
    if (textRow(top)) flags |= CreateNameFlags.Top;
    else if (textRow(bottom)) flags |= CreateNameFlags.Bottom;
  }
  if (left !== right) {
    if (textColumn(left)) flags |= CreateNameFlags.Left;
    else if (textColumn(right)) flags |= CreateNameFlags.Right;
  }
  return flags;
}
