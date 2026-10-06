/** @fileoverview Verifies native independent table/row split saved items and selected original lines. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTextFlowPage } from "./tabledlg";
import { GetSwRowSplit } from "../../core/docnode/ndtbl1";
import { SwCursor, SwTableCursor } from "../../core/crsr/swcrsr";
import { SwPosition } from "../../core/crsr/pam";
/** Authors real split input. @param split - Original table item. @param keep - Original row items. @returns Native owners. */
function fixture(split?: boolean, keep: readonly (boolean | undefined)[] = [true, false, true]) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Split", split === undefined ? {} : { layoutSplit: split });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  for (const value of keep)
    doc.nodes.AppendTableRow(table, 2, value === undefined ? {} : { keepTogether: value });
  return { doc, table, page: new SwTextFlowPage(table) };
}
it.each([undefined, true, false])(
  "native split defaults and saved items original=%s",
  /** Checks source defaults, mixed child and independent changed items. @param original - Table item. @returns Nothing. */ (
    original,
  ) => {
    const f = fixture(original);
    expect(f.page.IsSplit()).toBe(original ?? true);
    expect(f.page.GetRowSplitState()).toBeUndefined();
    expect(f.page.IsRowSplitSensitive()).toBe(original ?? true);
    expect(f.page.FillItemSet()).toEqual({});
    f.page.SetRowSplitState(true);
    expect(f.page.FillItemSet()).toEqual({ rowSplit: true });
    f.page.SplitHdl_Impl(!(original ?? true));
    expect(f.page.FillItemSet()).toEqual({ layoutSplit: !(original ?? true), rowSplit: true });
    expect(f.page.GetRowSplitState()).toBe(true);
    f.page.SetRowSplitState(false);
    expect(f.page.FillItemSet()).toEqual({ layoutSplit: !(original ?? true), rowSplit: false });
    f.page.SplitHdl_Impl(original ?? true);
    expect(f.page.FillItemSet()).toEqual({ rowSplit: false });
    f.page.HeadLineCBClickHdl(true);
    expect(f.page.FillItemSet()).toEqual({ headerRows: 1, rowSplit: false });
    f.page.Reset();
    expect(f.page.FillItemSet()).toEqual({});
    expect(f.page.GetRowSplitState()).toBeUndefined();
    expect(f.table.GetFormat().layoutSplit).toBe(original);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each([true, false, undefined])(
  "native uniform row input and default saved comparison keep=%s",
  /** Checks row default and child retention across parent toggles. @param keep - Stored inverse row item. @returns Nothing. */ (
    keep,
  ) => {
    const f = fixture(true, [keep, keep]);
    expect(f.page.GetRowSplitState()).toBe(!(keep ?? false));
    f.page.SplitHdl_Impl(false);
    expect(f.page.GetRowSplitState()).toBe(!(keep ?? false));
    expect(f.page.IsRowSplitSensitive()).toBe(false);
    expect(f.page.FillItemSet()).toEqual({ layoutSplit: false });
    f.page.SplitHdl_Impl(true);
    expect(f.page.FillItemSet()).toEqual({});
  },
);
it("native selected lines aggregate actual boxes and return no item for empty/foreign/mixed", /** Checks source collection without copied row formats. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.table.GetTabLines()[0]?.GetTabBoxes()[0],
    second = f.table.GetTabLines()[1]?.GetTabBoxes()[0];
  if (first === undefined || second === undefined) throw new Error("Missing original lines");
  expect(new SwTextFlowPage(f.table, [first]).GetRowSplitState()).toBe(false);
  expect(new SwTextFlowPage(f.table, [second]).GetRowSplitState()).toBe(true);
  expect(GetSwRowSplit(f.table, [])).toBeUndefined();
  const other = fixture(true, [false]).table.GetTabLines()[0]?.GetTabBoxes()[0];
  if (other === undefined) throw new Error("Missing foreign owner");
  expect(GetSwRowSplit(f.table, [other])).toBeUndefined();
  expect(GetSwRowSplit(fixture(true, []).table)).toBeUndefined();
  expect(GetSwRowSplit(f.table, [first, second])).toBeUndefined();
  const node = first.GetParagraphs()[0];
  if (node === undefined) throw new Error("Missing original text");
  const position = new SwPosition(node, 0),
    current = new SwCursor(position),
    selected = new SwTableCursor(position);
  position.Dispose();
  expect(SwDoc.GetRowSplit(current)).toBe(false);
  expect(SwDoc.GetRowSplit(selected)).toBeUndefined();
  selected.InsertBox(first);
  expect(SwDoc.GetRowSplit(selected)).toBe(false);
  selected.InsertBox(second);
  expect(SwDoc.GetRowSplit(selected)).toBeUndefined();
  const body = f.doc.paragraphs[0];
  if (body === undefined) throw new Error("Missing native body");
  current.GetPoint().Assign(body, 0);
  expect(SwDoc.GetRowSplit(current)).toBeUndefined();
  current.Dispose();
  selected.Dispose();
});
