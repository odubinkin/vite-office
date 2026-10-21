/** @fileoverview Source connected-area expansion and shrinking against real typed column blocks. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import type { ScTable } from "../../../inc/table";
import { ScColumn } from "../../../inc/column";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates one actual table. @returns Document. */
function document() {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Area"));
  return doc;
}
/** Runs the original reference-parameter query. @param doc - Actual document. @param bounds - Source bounds. @param include - Keep original. @param down - Only down. @param tab - Sheet. @returns Updated bounds. */
function area(doc: ScDocument, bounds: number[], include = true, down = false, tab = 0) {
  const a: [number] = [bounds[0] as number],
    b: [number] = [bounds[1] as number],
    c: [number] = [bounds[2] as number],
    d: [number] = [bounds[3] as number];
  doc.GetDataArea(tab, a, b, c, d, include, down);
  return [a[0], b[0], c[0], d[0]];
}
it("retains the source initial column,empty clamping,missing-sheet outputs and occupancy intervals", /** Checks original defaults and store boundaries. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0) as ScTable;
  expect(table.GetAllocatedColumnsCount()).toBe(1);
  expect(area(doc, [4, 8, 4, 8], true, true)).toEqual([0, 8, 0, 8]);
  expect(area(doc, [4, 8, 4, 8])).toEqual([0, 8, 0, 8]);
  expect(area(doc, [4, 8, 4, 8], true, false, 9)).toEqual([4, 8, 4, 8]);
  const column = table.CreateColumnIfNotExists(0);
  expect(column.IsEmptyData(0, 9)).toBe(true);
  doc.SetValue(new ScAddress(0, 4, 0), 9);
  expect(column.IsEmptyData(0, 3)).toBe(true);
  expect(column.IsEmptyData(0, 4)).toBe(false);
  expect(column.IsEmptyData(4, 4)).toBe(false);
  expect(column.IsEmptyData(doc.MaxRow() + 1, doc.MaxRow() + 1)).toBe(false);
  expect(column.HasDataAt(4)).toBe(true);
  expect(column.HasDataAt(5)).toBe(false);
  expect(column.GetLastDataPos(3)).toBe(0);
  expect(column.GetLastDataPos(4)).toBe(4);
  expect(column.GetLastDataPos(doc.MaxRow() + 10)).toBe(4);
  expect(table.GetLastDataRow(-1, 0, 9)).toBe(-1);
  expect(table.GetLastDataRow(1, 1, 9)).toBe(-1);
  expect(table.GetLastDataRow(0, doc.MaxCol() + 1, 9)).toBe(-1);
  expect(table.GetLastDataRow(0, 9, 9)).toBe(4);
});
it("expands all directions including diagonals,holes and chained edges while preserving disconnected blocks", /** Uses original right,left,top,bottom iteration order. @returns Nothing. */ () => {
  const doc = document();
  for (const [col, row] of [
    [1, 1],
    [2, 2],
    [3, 3],
    [1, 3],
    [0, 2],
    [6, 6],
  ])
    doc.SetValue(new ScAddress(col as number, row as number, 0), 1);
  expect(area(doc, [2, 2, 2, 2])).toEqual([0, 1, 3, 3]);
  expect(area(doc, [2, 2, 2, 2], false)).toEqual([0, 1, 3, 3]);
  expect(area(doc, [6, 6, 6, 6])).toEqual([6, 6, 6, 6]);
  expect(area(doc, [0, 0, 0, 0])).toEqual([0, 0, 3, 3]);
  expect(area(doc, [0, 0, 0, 0], false)).toEqual([0, 1, 3, 3]);
  expect(area(doc, [2, 2, 2, 2], true, true)).toEqual([2, 2, 2, 2]);
  doc.SetValue(new ScAddress(2, 3, 0), 1);
  expect(area(doc, [2, 2, 2, 2], true, true)).toEqual([2, 2, 2, 3]);
  expect(area(doc, [0, 0, 6, 6])).toEqual([0, 0, 6, 6]);
});
it("shrinks only nonextended sides and honors onlyDown/includeOld independently", /** Checks source bounded last-data aggregation. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0) as ScTable;
  doc.SetValue(new ScAddress(2, 3, 0), 7);
  table.CreateColumnIfNotExists(6);
  expect(area(doc, [0, 0, 6, 8], false)).toEqual([2, 3, 2, 3]);
  expect(area(doc, [0, 0, 6, 8], true)).toEqual([0, 0, 6, 8]);
  expect(area(doc, [0, 0, 6, 8], false, true)).toEqual([0, 0, 6, 3]);
  expect(area(doc, [0, 0, 6, 3], false, true)).toEqual([0, 0, 6, 3]);
  expect(area(doc, [0, 0, 0, 8], false, true)).toEqual([0, 0, 0, 0]);
  expect(area(doc, [0, 0, 0, 0], false)).toEqual([0, 0, 0, 0]);
  expect(area(doc, [4, 4, 6, 6], false)).toEqual([6, 6, 6, 6]);
  doc.SetValue(new ScAddress(6, doc.MaxRow(), 0), 1);
  expect(area(doc, [6, doc.MaxRow(), 6, doc.MaxRow()], false)).toEqual([
    6,
    doc.MaxRow(),
    6,
    doc.MaxRow(),
  ]);
  expect((table.CreateColumnIfNotExists(6) as ScColumn).GetLastDataPos()).toBe(doc.MaxRow());
});
