/** @fileoverview Checks native changed-item publication from original Writer table pages. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatTablePage, SwTableColumnPage, SwTextFlowPage } from "./tabledlg";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SwPtrItem } from "../../uibase/utlui/uiitems";
import { FN_TABLE_REP, FN_PARAM_TABLE_NAME, FN_PARAM_TABLE_HEADLINE } from "../../../inc/cmdid";
import { RES_UL_SPACE, RES_LAYOUT_SPLIT, RES_ROW_SPLIT } from "../../../inc/hintids";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
/** Creates connected original table pages and a fresh native output set. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Original", { width: 6000, horiOrient: H.LEFT });
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 2);
  const page = new SwFormatTablePage(table, 9000),
    columns = new SwTableColumnPage(page.data),
    flow = new SwTextFlowPage(table),
    output = new SfxItemSet(doc.GetAttrPool(), [[1, 32767]]);
  return { doc, table, page, columns, flow, output };
}
it("native Columns publishes its borrowed representation while untouched format and flow publish no deltas", /** Checks exact empty output. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.page.DeactivatePage(undefined, f.output)).toBe(true);
  f.columns.DeactivatePage(undefined, f.output);
  expect(f.flow.FillItemSet(f.output)).toEqual({});
  expect(f.output.Count()).toBe(1);
  expect((f.output.Get(FN_TABLE_REP) as SwPtrItem).GetValue()).toBe(f.page.data);
});
it("native name-only publication leaves the original representation unadvertised", /** Checks changed-name ownership and source saved value. @returns Nothing. */ () => {
  const f = fixture();
  f.page.SetName("Renamed");
  expect(f.page.DeactivatePage(undefined, f.output)).toBe(true);
  expect(f.output.Count()).toBe(1);
  expect((f.output.Get(FN_PARAM_TABLE_NAME) as SfxStringItem).GetValue()).toBe("Renamed");
  expect(f.output.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  expect(f.table.GetName()).toBe("Original");
});
it("native upper-lower publication emits the complete changed pair without frame geometry", /** Checks native spacing item and saved-value reset. @returns Nothing. */ () => {
  const f = fixture();
  f.page.ValueChangedHdl("above", 240);
  f.page.DeactivatePage(undefined, f.output);
  expect(f.output.Count()).toBe(1);
  expect((f.output.Get(RES_UL_SPACE) as SvxULSpaceItem).QueryValue()).toEqual([240, 0]);
  expect(f.output.GetItemIfSet(FN_TABLE_REP, false)).toBeUndefined();
  f.page.Reset();
  const reset = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]);
  f.page.FillItemSet(undefined, reset);
  expect(reset.Count()).toBe(0);
});
it("native width publication borrows the original shared representation", /** Checks change flags and literal owner identity. @returns Nothing. */ () => {
  const f = fixture();
  f.page.ValueChangedHdl("width", 4000);
  f.page.DeactivatePage(undefined, f.output);
  expect(f.output.Count()).toBe(1);
  expect((f.output.Get(FN_TABLE_REP) as SwPtrItem).GetValue()).toBe(f.page.data);
  expect([f.page.data.width, f.page.data.HasWidthChanged(), f.page.data.HasColsChanged()]).toEqual([
    4000,
    true,
    false,
  ]);
});
it("native constant-width columns publish their original owner with only the columns flag", /** Checks native page output without a new width vector. @returns Nothing. */ () => {
  const f = fixture();
  f.columns.ValueChangedHdl(0, 2500);
  f.columns.DeactivatePage(undefined, f.output);
  expect((f.output.Get(FN_TABLE_REP) as SwPtrItem).GetValue()).toBe(f.page.data);
  expect(
    f.page.data.columns.map(
      /** Reads native intervals. @param column - Interval. @returns Width. */ (column) =>
        column.nWidth,
    ),
  ).toEqual([2500, 3500]);
  expect([f.page.data.HasWidthChanged(), f.page.data.HasColsChanged()]).toEqual([false, true]);
});
it("native Text Flow emits only changed headline and split items", /** Checks saved-value native item gates. @returns Nothing. */ () => {
  const f = fixture();
  f.flow.HeadLineCBClickHdl(true);
  f.flow.ValueChangedHdl(2);
  f.flow.SplitHdl_Impl(false);
  f.flow.SetRowSplitState(false);
  expect(f.flow.FillItemSet(f.output)).toEqual({
    headerRows: 2,
    layoutSplit: false,
    rowSplit: false,
  });
  expect((f.output.Get(FN_PARAM_TABLE_HEADLINE) as SfxUInt16Item).GetValue()).toBe(2);
  expect((f.output.Get(RES_LAYOUT_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
  expect((f.output.Get(RES_ROW_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
  expect(f.output.Count()).toBe(3);
  f.flow.Reset();
  const reset = new SfxItemSet(f.doc.GetAttrPool(), [[1, 32767]]);
  expect(f.flow.FillItemSet(reset)).toEqual({});
  expect(reset.Count()).toBe(0);
});

it.each([
  [H.RIGHT, 3500, 3000, 0, 2500, 0, 6500],
  [H.LEFT, 3500, 0, 3000, 0, 2500, 6500],
  [H.CENTER, 3500, 1500, 1500, 1250, 1250, 6500],
  [H.NONE, 3500, 1000, 2000, 750, 1750, 6500],
  [H.NONE, 3500, 500, 6000, 0, 2500, 6500],
  [H.NONE, 3500, 6000, 500, 2500, 0, 6500],
  [H.LEFT_AND_WIDTH, 3500, 1000, 2000, 1000, 1500, 6500],
  [H.LEFT_AND_WIDTH, 2500, 2000, 100, 3500, 0, 5500],
])(
  "native changed-item Columns orientation%s input%s retains literal accepted LR metrics",
  /** Checks source LR reconciliation and borrowed output. @param orient - Native orientation. @param value - Changed first column. @param left - Initial side. @param right - Initial side. @param expectedLeft - Accepted side. @param expectedRight - Accepted side. @param width - Accepted width. @returns Nothing. */ (
    orient,
    value,
    left,
    right,
    expectedLeft,
    expectedRight,
    width,
  ) => {
    const f = fixture(),
      data = f.page.data;
    data.align = orient;
    data.left = left;
    data.right = right;
    f.columns.ModeHdl("adapt", true);
    f.columns.ValueChangedHdl(0, value);
    f.columns.DeactivatePage(undefined, f.output);
    expect([data.width, data.left, data.right]).toEqual([width, expectedLeft, expectedRight]);
    expect([data.HasWidthChanged(), data.HasColsChanged()]).toEqual([true, true]);
    expect((f.output.Get(FN_TABLE_REP) as SwPtrItem).GetValue()).toBe(data);
    expect(f.output.Count()).toBe(1);
    expect(f.table.GetFormat()).toStrictEqual({
      width: 6000,
      horiOrient: H.LEFT,
      align: "left",
      headerRows: 1,
      repeatHeaderRows: true,
    });
  },
);
