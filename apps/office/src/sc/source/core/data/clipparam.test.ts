/** @fileoverview Source-derived ScClipParam dimensions,filtered transpose and document value-ownership vectors. */
import { expect, it } from "vitest";
import { ScClipParam } from "../../../inc/clipparam";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Builds the actual source document with independent hidden/filtered row segments. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.SetRowFiltered(4, 5, 0, true);
  doc.SetRowHidden(2, 3, 0, true);
  return doc;
}
/** Reads independent coordinates for a native range list. @param parameter - Actual clip values. @returns Coordinates. */
function ranges(parameter: ScClipParam): number[][] {
  return Array.from(
    parameter.maRanges,
    /** Reads initialized endpoints. @param range - Range. @returns Coordinates. */ (range) => [
      ...range.aStart.GetVars(),
      ...range.aEnd.GetVars(),
    ],
  );
}
it("retains original defaults and copies every owned range collection through the document", /** Replacing parameters must not retain mutable source-list identities. @returns Nothing. */ () => {
  const doc = document(),
    initial = doc.GetClipParam();
  expect(doc.GetClipParam()).toBe(initial);
  expect([
    initial.meDirection,
    initial.mbCutMode,
    initial.getSourceDocID(),
    initial.isTransposed(),
    initial.isMultiRange(),
  ]).toEqual([0, false, 0, false, false]);
  expect(initial.getPasteColSize()).toBe(0);
  expect(initial.getPasteRowSize(doc, false)).toBe(0);
  expect(initial.getWholeRange()).toEqual(new ScRange());
  const area = new ScRange(2, 3, 0, 4, 8, 0),
    source = new ScClipParam(area, true);
  source.setSourceDocID(-1);
  source.meDirection = ScClipParam.Row;
  source.mbTransposed = true;
  source.maOriginalRange.assign(area);
  source.maMatrixRanges.push_back(area);
  source.maOriginMatrixRanges.push_back(area);
  source.maProtectedChartRangesVector.push(new ScRangeList(area));
  doc.SetClipParam(source);
  const copy = doc.GetClipParam();
  expect(copy).not.toBe(initial);
  expect(copy).not.toBe(source);
  expect([copy.meDirection, copy.mbCutMode, copy.getSourceDocID(), copy.isTransposed()]).toEqual([
    2,
    true,
    0xffffffff,
    true,
  ]);
  for (const list of [
    copy.maRanges,
    copy.maMatrixRanges,
    copy.maOriginMatrixRanges,
    copy.maProtectedChartRangesVector[0] as ScRangeList,
  ]) {
    expect(list.at(0)).toEqual(area);
    list.at(0).aStart.SetCol(7);
  }
  copy.maOriginalRange.aStart.SetCol(7);
  expect(source.maRanges.at(0)).toEqual(area);
  expect(source.maMatrixRanges.at(0)).toEqual(area);
  expect(source.maOriginMatrixRanges.at(0)).toEqual(area);
  expect(source.maProtectedChartRangesVector[0]?.at(0)).toEqual(area);
  expect(source.maOriginalRange).toEqual(area);
});
it("compresses dimensions according to direction and counts filtered segments rather than hidden rows", /** Native column mode uses the first height;row mode adds all heights. @returns Nothing. */ () => {
  const doc = document(),
    clip = new ScClipParam(new ScRange(2, 2, 0, 4, 7, 0));
  clip.maRanges.push_back(new ScRange(7, 2, 0, 8, 7, 0));
  expect(clip.isMultiRange()).toBe(true);
  expect(clip.getPasteColSize()).toBe(0);
  expect(clip.getPasteRowSize(doc, true)).toBe(0);
  clip.meDirection = ScClipParam.Column;
  expect(clip.getPasteColSize()).toBe(5);
  expect(clip.getPasteRowSize(doc, true)).toBe(6);
  expect(clip.getPasteRowSize(doc, false)).toBe(4);
  clip.meDirection = ScClipParam.Row;
  expect(clip.getPasteColSize()).toBe(3);
  expect(clip.getPasteRowSize(doc, true)).toBe(12);
  expect(clip.getPasteRowSize(doc, false)).toBe(8);
  expect(clip.getWholeRange()).toEqual(new ScRange(2, 2, 0, 8, 7, 0));
  expect(doc.CountNonFilteredRows(7, 2, 0)).toBe(0);
  expect(doc.CountNonFilteredRows(0, 2, 1)).toBe(0);
  expect(doc.CountNonFilteredRows(-1, 2, 0)).toBe(0);
  expect(doc.CountNonFilteredRows(doc.MaxRow(), doc.MaxRow() + 3, 0)).toBe(1);
  const wide = new ScClipParam(new ScRange(0, 0, 0, 16383, 0, 0));
  wide.maRanges.push_back(wide.maRanges.front());
  wide.meDirection = ScClipParam.Column;
  expect(wide.getPasteColSize()).toBe(-32768);
});
it("transposes each range around the first origin and filters using actual document rows", /** Native deltas preserve holes for ordinary transpose. @returns Nothing. */ () => {
  const doc = document();
  for (const includeFiltered of [false, true]) {
    const clip = new ScClipParam(new ScRange(2, 2, 0, 4, 7, 0));
    clip.meDirection = ScClipParam.Column;
    clip.maRanges.push_back(new ScRange(7, 2, 0, 8, 7, 0));
    clip.transpose(doc, includeFiltered, false);
    expect(clip.meDirection).toBe(ScClipParam.Row);
    expect(clip.isTransposed()).toBe(true);
    expect(ranges(clip)).toEqual([
      [2, 2, 0, includeFiltered ? 7 : 5, 4, 0],
      [2, 7, 0, includeFiltered ? 7 : 5, 8, 0],
    ]);
  }
  const empty = new ScClipParam();
  empty.transpose(doc, true, false);
  expect(empty.isTransposed()).toBe(true);
  expect(empty.maRanges.empty()).toBe(true);
  expect(empty.meDirection).toBe(ScClipParam.Unspecified);
});
it("compresses filtered multirow selections into one transposed range", /** The special source branch totals nonfiltered rows and keeps the first width. @returns Nothing. */ () => {
  const doc = document(),
    clip = new ScClipParam(new ScRange(2, 2, 0, 4, 4, 0));
  clip.meDirection = ScClipParam.Row;
  clip.maRanges.push_back(new ScRange(2, 6, 0, 4, 7, 0));
  clip.transpose(doc, false, true);
  expect(clip.meDirection).toBe(ScClipParam.Column);
  expect(ranges(clip)).toEqual([[2, 2, 0, 5, 4, 0]]);
  expect(clip.maOriginalRange).toEqual(new ScRange(new ScAddress()));
});
