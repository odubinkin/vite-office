/** @fileoverview Native paste/fill selection admission over actual Calc view marks,merge items and compressed filter segments. */
import { expect, it } from "vitest";
import { ScViewData, ScMarkType } from "../inc/viewdata";
import { ScViewUtil } from "./viewutil";
import { ScDocument, ScDocumentMode } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { ScMergeAttr } from "../../../inc/attrib";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates actual native document ownership. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
it("returns original cursor/simple/multi areas without changing view marks and preserves all coordinate outputs", /** Explicit working marks may simplify;view-owned marks remain independent. @returns Nothing. */ () => {
  const empty = new ScDocument(),
    absent = new ScViewData(empty),
    output = new ScRange();
  expect(absent.GetSimpleArea(output)).toBe(ScMarkType.SC_MARK_SIMPLE);
  empty.Dispose();
  const doc = document(),
    view = new ScViewData(doc),
    marks = view.GetMarkData();
  view.SetCurX(2);
  view.SetCurY(4);
  const coords: [[number], [number], [number], [number], [number], [number]] = [
    [-1],
    [-1],
    [-1],
    [-1],
    [-1],
    [-1],
  ];
  expect(view.CurrentTabForData()).toBe(0);
  expect(view.GetSimpleArea(...coords)).toBe(ScMarkType.SC_MARK_SIMPLE);
  expect(
    coords.map(
      /** Unwraps native reference outputs. @param value - Output. @returns Coordinate. */ (
        value,
      ) => value[0],
    ),
  ).toEqual([2, 4, 0, 2, 4, 0]);
  marks.SetMarkArea(new ScRange(0, 1, 0, 3, 5, 0));
  marks.MarkToMulti();
  expect(view.GetSimpleArea(output)).toBe(ScMarkType.SC_MARK_SIMPLE);
  expect(marks.IsMultiMarked()).toBe(true);
  expect(output.equals(new ScRange(0, 1, 0, 3, 5, 0))).toBe(true);
  const working = new ScMarkData(marks);
  expect(view.GetSimpleArea(output, working)).toBe(ScMarkType.SC_MARK_SIMPLE);
  expect(working.IsMultiMarked()).toBe(false);
  marks.ResetMark();
  marks.SetMultiMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  marks.SetMultiMarkArea(new ScRange(5, 5, 0, 6, 6, 0));
  expect(view.GetSimpleArea(output)).toBe(ScMarkType.SC_MARK_MULTI);
  expect(output.equals(new ScRange(2, 4, 0, 2, 4, 0))).toBe(true);
  doc.Dispose();
});
it("preserves actual merged cursor bounds,degenerate merge fallback and filtered mark-type overrides", /** A filtered merged cursor can replace MULTI type as in source (CALC284). @returns Nothing. */ () => {
  const doc = document(),
    view = new ScViewData(doc),
    range = new ScRange(),
    marks = view.GetMarkData();
  view.SetCurX(2);
  view.SetCurY(4);
  doc.ApplyAttr(2, 4, 0, new ScMergeAttr(2, 3));
  expect(view.GetSimpleArea(range)).toBe(ScMarkType.SC_MARK_SIMPLE);
  expect(range.equals(new ScRange(2, 4, 0, 3, 6, 0))).toBe(true);
  doc.SetRowFiltered(6, 6, 0, true);
  expect(view.GetSimpleArea(range)).toBe(ScMarkType.SC_MARK_SIMPLE_FILTERED);
  marks.SetMultiMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  marks.SetMultiMarkArea(new ScRange(5, 5, 0, 6, 6, 0));
  expect(view.GetSimpleArea(range)).toBe(ScMarkType.SC_MARK_SIMPLE_FILTERED);
  expect(marks.IsMultiMarked()).toBe(true);
  marks.ResetMark();
  marks.SetMarkArea(new ScRange(0, 5, 0, 1, 7, 0));
  expect(view.GetSimpleArea(range)).toBe(ScMarkType.SC_MARK_SIMPLE_FILTERED);
  marks.ResetMark();
  doc.ApplyAttr(2, 4, 0, new ScMergeAttr(0, 0));
  expect(view.GetSimpleArea(range)).toBe(ScMarkType.SC_MARK_SIMPLE);
  expect(range.equals(new ScRange(2, 4, 0, 2, 4, 0))).toBe(true);
  doc.ApplyAttr(2, 4, 0, new ScMergeAttr(2, 0));
  expect(view.GetSimpleArea(range)).toBe(ScMarkType.SC_MARK_SIMPLE);
  doc.Dispose();
});
it("retains native23Mi-cell fill bounds and exact source-axis paste exceptions without allocating cells", /** Admission checks use actual range values rather than scanning or populating cells. @returns Nothing. */ () => {
  const doc = document(),
    view = new ScViewData(doc),
    marks = view.GetMarkData(),
    clip = new ScDocument(ScDocumentMode.SCDOCMODE_CLIP);
  const allocated = doc.FetchTable(0)?.GetAllocatedColumnsCount();
  marks.SetMarkArea(new ScRange(0, 0, 0, 22, doc.MaxRow(), 0));
  expect(view.SelectionForbidsCellFill()).toBe(false);
  marks.SetMarkArea(new ScRange(0, 0, 0, 23, doc.MaxRow(), 0));
  expect(view.SelectionForbidsCellFill()).toBe(true);
  expect(view.SelectionForbidsPaste(1, 1)).toBe(true);
  expect(view.SelectionForbidsPaste(24, 1)).toBe(false);
  expect(view.SelectionForbidsPaste(1, doc.MaxRow() + 1)).toBe(false);
  clip.ResetClip(doc, 0);
  clip.SetClipArea(new ScRange());
  expect(view.SelectionForbidsPaste(clip)).toBe(true);
  marks.SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  expect(view.SelectionForbidsPaste(1, 1)).toBe(false);
  expect(view.SelectionForbidsCellFill()).toBe(false);
  marks.MarkToMulti();
  marks.SetMultiMarkArea(new ScRange(5, 5, 0, 6, 6, 0));
  expect(view.SelectionForbidsPaste(1, 1)).toBe(false);
  expect(view.SelectionForbidsCellFill()).toBe(false);
  expect(doc.FetchTable(0)?.GetAllocatedColumnsCount()).toBe(allocated);
  clip.Dispose();
  doc.Dispose();
});
it("preserves source whole-tail fitting,mutation on failure and first-sheet behavior", /** Actual filter runs exercise the unusual native FitToUnfilteredRows contract (CALC283). @returns Nothing. */ () => {
  const doc = document();
  doc.InsertTab(1, unicode("Other"));
  const range = new ScRange(0, 5, 0, 1, 7, 0);
  expect(ScViewUtil.FitToUnfilteredRows(range, doc, 2)).toBe(false);
  expect(range.aEnd.Row()).toBe(doc.MaxRow());
  doc.SetRowFiltered(10, doc.MaxRow(), 0, true);
  expect(doc.HasFilteredRows(0, 9, 0)).toBe(false);
  expect(doc.HasFilteredRows(0, 10, 0)).toBe(true);
  expect(doc.HasFilteredRows(10, 9, 0)).toBe(false);
  expect(doc.HasFilteredRows(doc.MaxRow() + 1, doc.MaxRow() + 1, 0)).toBe(false);
  expect(doc.HasFilteredRows(0, doc.MaxRow(), 3)).toBe(false);
  expect(ScViewUtil.HasFiltered(new ScRange(0, 0, 1, 0, 10, 1), doc)).toBe(false);
  expect(ScViewUtil.HasFiltered(new ScRange(0, 0, 0, 0, 10, 1), doc)).toBe(true);
  range.aEnd.SetRow(7);
  expect(ScViewUtil.FitToUnfilteredRows(range, doc, 5)).toBe(true);
  expect(range.aEnd.Row()).toBe(9);
  expect(ScViewUtil.FitToUnfilteredRows(range, doc, 2)).toBe(false);
  range.aEnd.SetTab(1);
  expect(ScViewUtil.FitToUnfilteredRows(range, doc, 5)).toBe(false);
  doc.SetRowFiltered(0, 9, 0, true);
  range.aEnd.SetTab(0);
  range.aEnd.SetRow(7);
  expect(ScViewUtil.FitToUnfilteredRows(range, doc, 0)).toBe(true);
  expect(range.aEnd.Row()).toBe(7);
  expect(doc.LastNonFilteredRow(0, doc.MaxRow(), 2)).toBe(2147483647);
  expect(doc.LastNonFilteredRow(0, doc.MaxRow() + 1, 0)).toBe(2147483647);
  expect(doc.LastNonFilteredRow(10, 5, 0)).toBe(2147483647);
  expect(doc.GetCellType(new ScAddress())).toBe(0);
  doc.Dispose();
});
