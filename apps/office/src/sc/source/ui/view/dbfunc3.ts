/** @fileoverview Selection admission for manual Calc outlines from dbfunc3.cxx. */
import { ScRange } from "../../../inc/address";
import { hasOutlineEntry, outlineSpan } from "../docshell/olinefun";
import { ScMarkType, type ScViewData } from "./viewdata";

/** Original simple selection required by Calc outline mutations. @param view - Actual view. @returns Simple selected block. */
export function simpleOutlineRange(view: ScViewData): ScRange | undefined {
  const range = new ScRange();
  return view.GetSimpleArea(range) === ScMarkType.SC_MARK_SIMPLE ? range : undefined;
}

/** Matches the native full-column and full-row selection interpretation. @param view - Actual view. @param range - Selected block. @returns [columns, rows]. */
export function fullOutlineAxes(view: ScViewData, range: ScRange): readonly [boolean, boolean] {
  const doc = view.GetDocument();
  return [
    range.aStart.Row() === 0 && range.aEnd.Row() === doc.MaxRow(),
    range.aStart.Col() === 0 && range.aEnd.Col() === doc.MaxCol(),
  ];
}

/** Finds which outline axes intersect the marked area and may be removed. @param view - Actual view. @param range - Selected block. @returns [columns, rows]. */
export function TestRemoveOutline(view: ScViewData, range: ScRange): readonly [boolean, boolean] {
  const outline = view.GetDocument().FetchTable(range.aStart.Tab())?.GetOutlineTable();
  if (!outline) return [false, false];
  const [columns, rows] = fullOutlineAxes(view, range);
  return [
    (!rows || columns) &&
      hasOutlineEntry(outline.GetColArray(), outlineSpan(range, true), "remove"),
    (!columns || rows) &&
      hasOutlineEntry(outline.GetRowArray(), outlineSpan(range, false), "remove"),
  ];
}

/** Original availability for Show and Hide Details. @param view - Actual view. @param range - Selected block. @param operation - Detail command. @returns Whether either axis has a matching entry. */
export function OutlinePossible(
  view: ScViewData,
  range: ScRange,
  operation: "hide" | "show",
): boolean {
  const outline = view.GetDocument().FetchTable(range.aStart.Tab())?.GetOutlineTable();
  return (
    !!outline &&
    (hasOutlineEntry(outline.GetColArray(), outlineSpan(range, true), operation) ||
      hasOutlineEntry(outline.GetRowArray(), outlineSpan(range, false), operation))
  );
}
