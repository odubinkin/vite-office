/** @fileoverview Source-backed HTML cell/row/column and layout-value contracts using real Writer cell sections and format owners. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { HTMLTableCnts } from "./htmltab.contents";
import { HTMLTableCell } from "./htmltab.cell";
import { HTMLTableRow } from "./htmltab.row";
import { HTMLTableColumn } from "./htmltab.column";
import { SwHTMLTableLayoutColumn } from "../../../inc/htmltbl";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { Color } from "../../../../tools/inc/color";
import { RES_BACKGROUND, RES_BOX } from "../../../inc/hintids";
import { MINLAY } from "../../../inc/swtypes";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual documents after native borrowed values are no longer used. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Creates actual native cell sections in the current SwTable owner. @returns Document and native boxes. */
function boxes() {
  const doc = new SwDoc();
  docs.push(doc);
  const table = doc.nodes.MakeTableNode("Native HTML contents"),
    row = doc.nodes.AppendTableRow(table, 3);
  const [first, second, third] = row.GetTabBoxes();
  assert(first && second && third);
  return { doc, first, second, third };
}
it("uses real core sections, native box rebinding and next-first cached layout identity", /** No fake SwStartNode/table/layout provider stands in for native ownership. @returns Nothing. */ () => {
  const { first, second, third } = boxes(),
    a = new HTMLTableCnts(second.GetSttNd()),
    b = new HTMLTableCnts(third.GetSttNd());
  expect(first.GetSttNd()).toBe(first.GetStartNode());
  expect(a.GetStartNode()).toBe(second.GetSttNd());
  expect(a.GetTable()).toBeNull();
  a.SetTableBox(first);
  a.Add(b);
  b.SetNoBreak();
  const layout = a.CreateLayoutInfo();
  expect(layout.GetTableBox()).toBeNull();
  expect(layout.GetStartNode()).toBe(second.GetSttNd());
  expect(layout.GetTable()).toBeNull();
  expect(layout.GetNext()).toBe(b.CreateLayoutInfo());
  expect(layout.GetNext()?.HasNoBreakTag()).toBe(true);
  expect(layout.HasNoBreakTag()).toBe(false);
  a.SetTableBox(first);
  expect(layout.GetTableBox()).toBe(first);
  expect(layout.GetStartNode()).toBe(first.GetSttNd());
  expect(a.GetStartNode()).toBe(second.GetSttNd());
  a.SetNoBreak();
  a.Add(new HTMLTableCnts(first.GetSttNd()));
  expect(a.CreateLayoutInfo()).toBe(layout);
  expect(layout.HasNoBreakTag()).toBe(false);
  expect(b.Next()).not.toBeNull();
  expect(layout.GetNext()?.GetNext()).toBeNull();
});
it("retains native nullable contents and uint8 pass reference rollover", /** Public setters exercise source unsigned argument conversion without private counter writes. @returns Nothing. */ () => {
  const layout = new HTMLTableCnts(null).CreateLayoutInfo();
  expect(layout.GetStartNode()).toBeNull();
  expect(layout.GetNext()).toBeNull();
  expect(layout.IsPass1Done(0)).toBe(true);
  expect(layout.IsWidthSet(0)).toBe(true);
  layout.SetPass1Done(255);
  layout.SetWidthSet(255);
  expect(layout.IsPass1Done(255)).toBe(true);
  expect(layout.IsWidthSet(254)).toBe(false);
  layout.SetPass1Done(256);
  layout.SetWidthSet(256);
  expect(layout.IsPass1Done(0)).toBe(true);
  expect(layout.IsWidthSet(256)).toBe(true);
});
it("preserves every original empty-cell observable default and output write", /** GetNumFormat/GetValue write zero even when returning false; layout is an actual native value. @returns Nothing. */ () => {
  const cell = new HTMLTableCell(),
    output: [number] = [99],
    value: [number] = [99];
  expect(cell.GetNumFormat(output)).toBe(false);
  expect(output[0]).toBe(0);
  expect(cell.GetValue(value)).toBe(false);
  expect(value[0]).toBe(0);
  expect([
    cell.GetRowSpan(),
    cell.GetColSpan(),
    cell.GetVertOri(),
    cell.IsUsed(),
    cell.IsCovered(),
  ]).toEqual([1, 1, V.NONE, false, false]);
  expect(cell.GetContents()).toBeNull();
  expect(cell.GetBGBrush()).toBeNull();
  expect(cell.GetBoxItem()).toBeNull();
  const layout = cell.CreateLayoutInfo();
  expect(layout.GetContents()).toBeNull();
  expect([
    layout.GetRowSpan(),
    layout.GetColSpan(),
    layout.GetWidthOption(),
    layout.IsPercentWidthOption(),
    layout.HasNoWrapOption(),
  ]).toEqual([1, 1, 0, false, false]);
});
it.each([false, true])(
  "writes cell numeric output even when presence=%s",
  /** Native output assignment is independent from the returned presence flag. @param present - Source presence selectors. @returns Nothing. */
  (present) => {
    const cell = new HTMLTableCell(),
      format: [number] = [99],
      value: [number] = [99];
    cell.Set(null, 2, 3, V.BOTTOM, null, null, present, 0xffffffff, present, 12.5, true, true);
    expect(cell.GetNumFormat(format)).toBe(present);
    expect(format[0]).toBe(0xffffffff);
    expect(cell.GetValue(value)).toBe(present);
    expect(value[0]).toBe(12.5);
    expect(cell.IsUsed()).toBe(false);
    expect(cell.IsCovered()).toBe(true);
  },
);
it("shares original cell contents/brush/box and protection clones only the background", /** Protection retains source width/numeric/covered/wrap/orientation state while clearing contents/spans. @returns Nothing. */ () => {
  const { first } = boxes(),
    contents = new HTMLTableCnts(first.GetSttNd()),
    brush = new SvxBrushItem(new Color(0x123456), RES_BACKGROUND),
    box = new SvxBoxItem(RES_BOX),
    cell = new HTMLTableCell();
  cell.SetWidth(80, true);
  cell.Set(contents, 3, 4, V.BOTTOM, brush, box, true, 7, true, 2.5, true, true);
  expect(cell.GetContents()).toBe(contents);
  expect(cell.GetBGBrush()).toBe(brush);
  expect(cell.GetBoxItem()).toBe(box);
  cell.SetProtected();
  const protectedBrush = cell.GetBGBrush();
  assert(protectedBrush);
  expect(cell.GetContents()).toBeNull();
  expect(cell.IsUsed()).toBe(true);
  expect(cell.IsCovered()).toBe(true);
  expect([cell.GetRowSpan(), cell.GetColSpan(), cell.GetVertOri()]).toEqual([1, 1, V.BOTTOM]);
  expect(protectedBrush).not.toBe(brush);
  expect(cell.GetBoxItem()).toBe(box);
  brush.GetColor().SetRed(0xff);
  expect(protectedBrush.GetColor().toUInt32()).toBe(0x123456);
  const format: [number] = [0],
    value: [number] = [0];
  expect(cell.GetNumFormat(format)).toBe(true);
  expect(cell.GetValue(value)).toBe(true);
  expect([format[0], value[0]]).toEqual([7, 2.5]);
  const layout = cell.CreateLayoutInfo();
  expect([
    layout.GetWidthOption(),
    layout.IsPercentWidthOption(),
    layout.HasNoWrapOption(),
  ]).toEqual([80, true, true]);
  cell.Set(null, 1, 1, V.NONE, null, null, false, 0, false, 0, false, false);
  expect(cell.IsUsed()).toBe(false);
  expect(cell.CreateLayoutInfo().GetWidthOption()).toBe(80);
});
it("creates independent layout-cell values while retaining cached content layout identity", /** Layout protection does not mutate the parser's cell or another independent layout value. @returns Nothing. */ () => {
  const { first } = boxes(),
    contents = new HTMLTableCnts(first.GetSttNd()),
    cell = new HTMLTableCell();
  cell.Set(contents, 2, 3, V.CENTER, null, null, false, 0, false, 0, true, false);
  cell.SetWidth(25, true);
  const a = cell.CreateLayoutInfo(),
    b = cell.CreateLayoutInfo();
  expect(a).not.toBe(b);
  expect(a.GetContents()).toBe(b.GetContents());
  a.SetProtected();
  expect([a.GetRowSpan(), a.GetColSpan(), a.GetContents()]).toEqual([1, 1, null]);
  expect([a.GetWidthOption(), a.IsPercentWidthOption(), a.HasNoWrapOption()]).toEqual([
    25,
    true,
    true,
  ]);
  expect([b.GetRowSpan(), b.GetColSpan()]).toEqual([2, 3]);
  expect(cell.GetContents()).toBe(contents);
  a.SetRowSpan(4);
  expect(a.GetRowSpan()).toBe(4);
  a.SetContents(b.GetContents());
  expect(a.GetContents()).toBe(b.GetContents());
});
it("preserves row defaults, unique brush transfer, height maximum and markers", /** Real native option values mutate actual row owners; a moved brush output is cleared. @returns Nothing. */ () => {
  const row = new HTMLTableRow(2),
    brush = new SvxBrushItem(new Color(0x112233), RES_BACKGROUND),
    owner: [SvxBrushItem | null] = [brush];
  expect(row.GetCell(0)).not.toBe(row.GetCell(1));
  expect([
    row.GetAdjust(),
    row.GetVertOri(),
    row.GetHeight(),
    row.GetEmptyRows(),
    row.IsEndOfGroup(),
    row.GetBottomBorder(),
  ]).toEqual([A.End, V.TOP, 0, 0, false, false]);
  row.SetBGBrush(owner);
  expect(owner[0]).toBeNull();
  expect(row.GetBGBrush()).toBe(brush);
  row.SetHeight(100);
  row.SetHeight(50);
  expect(row.GetHeight()).toBe(100);
  row.SetAdjust(A.Right);
  row.SetVertOri(V.CENTER);
  row.SetBottomBorder(true);
  row.SetEndOfGroup();
  row.IncEmptyRows();
  expect([
    row.GetAdjust(),
    row.GetVertOri(),
    row.GetEmptyRows(),
    row.IsEndOfGroup(),
    row.GetBottomBorder(),
  ]).toEqual([A.Right, V.CENTER, 1, true, true]);
  expect(
    /** Uses the native vector-at domain. @returns Cell borrow. */ () => row.GetCell(2),
  ).toThrow(RangeError);
});
it("expands only new cells with decreasing spans and shrinks contentless tails", /** Original tail maintenance checks contents, including protected cells, rather than IsUsed. @returns Nothing. */ () => {
  const { first } = boxes(),
    row = new HTMLTableRow(1),
    contents = new HTMLTableCnts(first.GetSttNd());
  row.GetCell(0).SetContents(contents);
  row.Expand(4, true);
  expect([
    row.GetCell(0).GetColSpan(),
    row.GetCell(1).GetColSpan(),
    row.GetCell(2).GetColSpan(),
    row.GetCell(3).GetColSpan(),
  ]).toEqual([1, 3, 2, 1]);
  row.GetCell(1).SetProtected();
  row.Shrink(3);
  expect(row.GetCell(1).IsUsed()).toBe(true);
  expect([row.GetCell(1).GetColSpan(), row.GetCell(2).GetColSpan()]).toEqual([2, 1]);
  expect(row.GetCell(0).GetContents()).toBe(contents);
  expect(
    /** Removed native vector tail cannot be borrowed. @returns Cell. */ () => row.GetCell(3),
  ).toThrow(RangeError);
  row.Expand(4);
  expect(row.GetCell(3).GetColSpan()).toBe(1);
});
it("keeps width-family changes distinct between parser and layout column merges", /** Original HTMLTableColumn replaces width on family changes, while layout-cell merge ignores a mismatched nonzero family. @returns Nothing. */ () => {
  const column = new HTMLTableColumn();
  expect([
    column.GetAdjust(),
    column.GetVertOri(),
    column.IsEndOfGroup(),
    column.m_bLeftBorder,
  ]).toEqual([A.End, V.TOP, false, false]);
  column.SetWidth(100, false);
  column.SetWidth(50, false);
  expect(column.CreateLayoutInfo().GetWidthOption()).toBe(100);
  column.SetWidth(20, true);
  column.SetWidth(10, true);
  const layout = column.CreateLayoutInfo();
  expect([layout.GetWidthOption(), layout.IsRelWidthOption()]).toEqual([20, true]);
  layout.MergeCellWidthOption(100, false);
  expect([layout.GetWidthOption(), layout.IsRelWidthOption()]).toEqual([20, true]);
  layout.MergeCellWidthOption(25, true);
  expect(layout.GetWidthOption()).toBe(25);
  column.SetWidth(5, false);
  expect([
    column.CreateLayoutInfo().GetWidthOption(),
    column.CreateLayoutInfo().IsRelWidthOption(),
  ]).toEqual([5, false]);
  column.SetAdjust(A.Center);
  column.SetVertOri(V.BOTTOM);
  column.SetEndOfGroup();
  column.m_bLeftBorder = true;
  expect([
    column.GetAdjust(),
    column.GetVertOri(),
    column.IsEndOfGroup(),
    column.CreateLayoutInfo().HasLeftBorder(),
  ]).toEqual([A.Center, V.BOTTOM, true, true]);
});
it("uses the original six borrowed frame-format cache slots", /** All cached values are real document-pooled frame owners, independently selected by border and orientation. @returns Nothing. */ () => {
  const { doc } = boxes(),
    column = new HTMLTableColumn();
  for (const border of [false, true])
    for (const orientation of [V.NONE, V.CENTER, V.BOTTOM]) {
      expect(column.GetFrameFormat(border, orientation)).toBeNull();
      const frame = doc.MakeTableBoxFormat();
      column.SetFrameFormat(frame, border, orientation);
      expect(column.GetFrameFormat(border, orientation)).toBe(frame);
    }
  const first = column.GetFrameFormat(false, V.NONE),
    second = column.GetFrameFormat(true, V.CENTER);
  expect(first).not.toBe(second);
  column.SetFrameFormat(null, false, V.NONE);
  expect(column.GetFrameFormat(false, V.NONE)).toBeNull();
  expect(column.GetFrameFormat(true, V.CENTER)).toBe(second);
});
it("preserves original provisional/final layout-column reset boundaries", /** Values are source state only; no automatic text measurement is claimed. @returns Nothing. */ () => {
  const column = new SwHTMLTableLayoutColumn(30, false, true);
  expect([
    column.GetMinNoAlign(),
    column.GetMaxNoAlign(),
    column.GetAbsMinNoAlign(),
    column.GetMin(),
    column.GetMax(),
    column.GetAbsColWidth(),
    column.GetRelColWidth(),
  ]).toEqual([MINLAY, MINLAY, MINLAY, 0, 0, 0, 0]);
  column.MergeMinMaxNoAlign(10, 100, 30);
  column.MergeMinMaxNoAlign(40, 50, 20);
  expect([column.GetMinNoAlign(), column.GetMaxNoAlign(), column.GetAbsMinNoAlign()]).toEqual([
    40, 100, 30,
  ]);
  column.SetMinMax(50, 100);
  column.AddToMin(5);
  column.AddToMax(7);
  column.SetMax(200);
  expect([column.GetMin(), column.GetMax()]).toEqual([55, 200]);
  column.SetAbsColWidth(11);
  column.SetRelColWidth(12);
  column.ClearPass1Info(false);
  expect([
    column.GetMinNoAlign(),
    column.GetMaxNoAlign(),
    column.GetAbsMinNoAlign(),
    column.GetMin(),
    column.GetMax(),
  ]).toEqual([MINLAY, MINLAY, MINLAY, 0, 0]);
  expect([
    column.GetWidthOption(),
    column.IsRelWidthOption(),
    column.GetAbsColWidth(),
    column.GetRelColWidth(),
  ]).toEqual([30, false, 11, 12]);
  column.SetWidthOption(25);
  expect(column.IsRelWidthOption()).toBe(true);
  column.ClearPass1Info(true);
  expect([
    column.GetWidthOption(),
    column.IsRelWidthOption(),
    column.GetAbsColWidth(),
    column.GetRelColWidth(),
    column.HasLeftBorder(),
  ]).toEqual([0, false, 11, 12, true]);
  column.MergeCellWidthOption(0, true);
  expect(column.IsRelWidthOption()).toBe(true);
});
