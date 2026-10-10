/** @fileoverview Verifies native Text Flow headline defaults, widget limits, saved comparisons and original item inheritance. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import type { SwTableFormat } from "../../core/table/swtable";
import { SwTextFlowPage } from "./tabledlg";
/** Builds actual canonical headline input. @param format - Initial native storage. @param rows - Physical rows. @returns Original owner and source page. */
function fixture(format: SwTableFormat = { headerRows: 0 }, rows = 3) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Headlines", format);
  table.AddColumnWidth(6000);
  for (let r = 0; r < rows; r++) doc.nodes.AppendTableRow(table, 1);
  return { doc, table, page: new SwTextFlowPage(table) };
}
it.each<[SwTableFormat, number]>([
  [{}, 1],
  [{ headerRows: 2 }, 2],
  [{ headerRows: 2, repeatHeaderRows: false }, 0],
  [{ headerRows: 0, repeatHeaderRows: true }, 0],
])(
  "native headline Reset reads native default/count-only/disabled input%s",
  /** Checks source item with native count. @param format - Existing values. @param expected - Native count. @returns Nothing. */ (
    format,
    expected,
  ) => {
    const f = fixture(format);
    expect(f.page.IsHeadline()).toBe(expected !== 0);
    expect(f.page.IsSensitive()).toBe(expected !== 0);
    expect(f.page.GetHeaderRows()).toBe(Math.max(1, expected));
    expect(f.page.FillItemSet()).toEqual({});
    expect(f.page.GetRowsToRepeat()).toBe(expected);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("native headline checkbox/count retain widgets while source Fill publishes zero or selected count", /** Checks source saved-value tests across repeated toggles. @returns Nothing. */ () => {
  const f = fixture({ headerRows: 2, repeatHeaderRows: true });
  expect(f.page.IsHeadline()).toBe(true);
  expect(f.page.GetHeaderRows()).toBe(2);
  expect(f.page.FillItemSet()).toEqual({});
  f.page.HeadLineCBClickHdl(false);
  expect(f.page.IsSensitive()).toBe(false);
  expect(f.page.FillItemSet()).toEqual({ headerRows: 0 });
  expect(f.page.GetHeaderRows()).toBe(2);
  f.page.HeadLineCBClickHdl(true);
  expect(f.page.FillItemSet()).toEqual({});
  f.page.ValueChangedHdl(3);
  expect(f.page.FillItemSet()).toEqual({ headerRows: 3 });
  expect(f.table.GetRowsToRepeat()).toBe(2);
  f.page.HeadLineCBClickHdl(false);
  expect(f.page.FillItemSet()).toEqual({ headerRows: 0 });
  f.page.Reset();
  expect([f.page.IsHeadline(), f.page.GetHeaderRows(), f.page.GetRowsToRepeat()]).toEqual([
    true,
    2,
    2,
  ]);
  expect(f.page.FillItemSet()).toEqual({});
});
it("native headline field has source integer1..100 range independent of physical rows", /** Checks source .ui bounds without browser table-count validation. @returns Nothing. */ () => {
  const f = fixture();
  f.page.HeadLineCBClickHdl(true);
  for (const [value, expected] of [
    [0, 1],
    [-9, 1],
    [2.8, 3],
    [12, 12],
    [101, 100],
  ] as const) {
    f.page.ValueChangedHdl(value);
    expect(f.page.GetHeaderRows()).toBe(expected);
    expect(f.page.FillItemSet()).toEqual({ headerRows: expected });
  }
  f.page.HeadLineCBClickHdl(false);
  expect(f.page.GetRowsToRepeat()).toBe(0);
  f.page.Reset();
  expect([f.page.IsHeadline(), f.page.GetHeaderRows(), f.page.GetRowsToRepeat()]).toEqual([
    false,
    1,
    0,
  ]);
  expect(f.page.FillItemSet()).toEqual({});
});
it("native unchanged bounded headline widgets preserve the original inherited item", /** Checks no accidental source count publication on Reset. @returns Nothing. */ () => {
  const f = fixture({ headerRows: 120, repeatHeaderRows: true }, 150);
  expect(f.page.GetHeaderRows()).toBe(100);
  expect(f.page.FillItemSet()).toEqual({});
  expect(f.page.GetRowsToRepeat()).toBe(120);
  f.page.ValueChangedHdl(99);
  expect(f.page.FillItemSet()).toEqual({ headerRows: 99 });
  f.page.Reset();
  expect(f.page.GetRowsToRepeat()).toBe(120);
});
