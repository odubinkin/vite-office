/** @fileoverview Native standard row arithmetic, compressed ranges, flags, shared contexts and actual font/history integration. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScTable } from "../../../inc/table";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScAddress } from "../../../inc/address";
import { RowHeightContext } from "../../../inc/rowheightcontext";
import { CRFlags } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/source/items/textitem.effects";
import { FontEmphasisMark } from "../../../../tools/inc/fontenum";
import { SvxMarginItem } from "../../../../svx/inc/algitem";
import { ScLineBreakCell, ScVerticalStackCell, ScRotateValueItem } from "../../../inc/attrib";
import { SvxHorJustifyItem } from "../../../../editeng/inc/justifyitem";
import { SvxCellHorJustify } from "../../../../editeng/inc/svxenum";
import { lcl_GetAttribHeight, supportsStandardRowHeight } from "./column2";
import { CalcViewController } from "../../../browser/controller/calc-view-controller";
import { ScViewData } from "../../ui/inc/viewdata";
import { rowPixels, rowAtPixel } from "../../../browser/presentation/row-geometry";
/** Creates actual sheet storage. @returns Document and sheet. */
function sheet(): [ScDocument, ScTable] {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  return [doc, doc.FetchTable(0) as ScTable];
}
it("retains source 256-twip minimum,23-twip correction,margins,emphasis and UInt16 narrowing", /** Exercises source arithmetic without a substitute font device. @returns Nothing. */ () => {
  const [doc] = sheet(),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  expect(lcl_GetAttribHeight(pattern, 101, 256)).toBe(256);
  pattern.ItemSetPut(new SvxFontHeightItem(480, 100, 101));
  expect(lcl_GetAttribHeight(pattern, 101, 256)).toBe(583);
  pattern.ItemSetPut(new SvxEmphasisMarkItem(FontEmphasisMark.Dot, 121));
  expect(lcl_GetAttribHeight(pattern, 101, 256)).toBe(724);
  pattern.ItemSetPut(new SvxFontHeightItem(65536, 100, 101));
  pattern.ItemSetPut(new SvxMarginItem(0, 0, 0, 0, 143));
  expect(lcl_GetAttribHeight(pattern, 101, 0)).toBe(0);
  pattern.Dispose();
  doc.DisposeAttributes();
});
it("keeps device-dependent layouts outside the represented uniform-script standard path", /** Uses real native items. @returns Nothing. */ () => {
  const [doc] = sheet(),
    pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  expect(supportsStandardRowHeight(pattern)).toBe(true);
  pattern.ItemSetPut(new SvxFontHeightItem(220, 100, 112));
  expect(supportsStandardRowHeight(pattern)).toBe(false);
  pattern.ItemSetPut(new SvxFontHeightItem(200, 100, 112));
  pattern.ItemSetPut(new SvxFontHeightItem(220, 100, 117));
  expect(supportsStandardRowHeight(pattern)).toBe(false);
  pattern.ItemSetPut(new SvxFontHeightItem(200, 100, 117));
  pattern.ItemSetPut(new ScLineBreakCell(true));
  expect(supportsStandardRowHeight(pattern)).toBe(false);
  pattern.ItemSetPut(new ScLineBreakCell(false));
  pattern.ItemSetPut(new SvxHorJustifyItem(SvxCellHorJustify.Block, 129));
  expect(supportsStandardRowHeight(pattern)).toBe(false);
  pattern.ItemSetPut(new SvxHorJustifyItem(SvxCellHorJustify.Standard, 129));
  pattern.ItemSetPut(new ScVerticalStackCell(true));
  expect(supportsStandardRowHeight(pattern)).toBe(false);
  pattern.ItemSetPut(new ScVerticalStackCell(false));
  pattern.ItemSetPut(new ScRotateValueItem(1));
  expect(supportsStandardRowHeight(pattern)).toBe(false);
  doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, pattern);
  expect(
    (doc.FetchTable(0) as ScTable).SetOptimalHeight(
      new RowHeightContext(doc.MaxRow(), 1 / 15),
      0,
      0,
      true,
    ),
  ).toBe(false);
  pattern.Dispose();
  doc.DisposeAttributes();
});
it("retains pixel-change storage conditions,zero fallback and native single interactive shrink heuristic", /** Checks compressed sheet boundaries and manual flags. @returns Nothing. */ () => {
  const [doc, table] = sheet();
  expect(table.GetRowHeight(-1)).toBe(256);
  table.SetOptimalMinRowHeight(300);
  expect(table.GetOptimalMinRowHeight()).toBe(300);
  table.SetRowHeightOnly(-1, 0, 500);
  table.SetRowHeightOnly(0, -1, 500);
  expect(table.GetRowHeight(0)).toBe(256);
  table.SetRowHeightOnly(0, 2, 0);
  expect(table.GetRowHeight(1)).toBe(300);
  expect(table.SetRowHeightRange(-1, 0, 500, 1 / 15, true)).toBe(false);
  expect(table.SetRowHeightRange(0, -1, 500, 1 / 15, true)).toBe(false);
  expect(table.SetRowHeightRange(0, 0, 301, 1 / 15, true)).toBe(false);
  expect(table.SetRowHeightRange(0, 0, 600, 1 / 15, false)).toBe(true);
  expect(table.SetRowHeightRange(0, 0, 300, 1 / 15, false)).toBe(false);
  expect(table.SetRowHeightRange(0, 1, 300, 1 / 15, false)).toBe(true);
  expect(table.SetRowHeightRange(0, 1, 300, 1 / 15, true)).toBe(false);
  expect(table.SetRowHeightRange(0, 1, 0, 1 / 15, true)).toBe(false);
  table.SetManualHeight(-1, 0, true);
  table.SetManualHeight(0, -1, true);
  table.SetManualHeight(0, 1, true);
  expect(table.GetRowFlagsRange(0).maValue).toBe(CRFlags.ManualSize);
  table.SetManualHeight(0, 1, false);
  expect(table.GetRowFlagsRange(0).maValue).toBe(0);
  table.SetOptimalMinRowHeight(0);
  expect(table.GetOptimalMinRowHeight()).toBe(256);
  doc.DisposeAttributes();
});
it("applies grouped calculated heights,manual skipping,forced reset and extra-height flags", /** Actual reducer runs through the real sheet. @returns Nothing. */ () => {
  const [doc, table] = sheet(),
    context = new RowHeightContext(doc.MaxRow(), 1 / 15);
  table.SetRowHeightOnly(0, 7, 600);
  table.SetManualHeight(2, 3, true);
  table.SetManualHeight(6, 6, true);
  expect(table.SetOptimalHeight(context, 0, 7, true)).toBe(true);
  expect([table.GetRowHeight(0), table.GetRowHeight(2), table.GetRowHeight(7)]).toEqual([
    256, 600, 256,
  ]);
  expect(table.SetOptimalHeight(context, 0, 7, true)).toBe(false);
  context.setExtraHeight(100);
  expect(context.getExtraHeight()).toBe(100);
  expect(table.SetOptimalHeight(context, 0, 7, true)).toBe(true);
  expect(table.GetRowFlagsRange(0).maValue).toBe(CRFlags.ManualSize);
  expect(table.GetRowHeight(2)).toBe(600);
  context.setForceAutoSize(true);
  expect(context.isForceAutoSize()).toBe(true);
  expect(table.SetOptimalHeight(context, 0, 7, true)).toBe(true);
  expect(table.GetRowHeight(2)).toBe(356);
  context.setExtraHeight(0);
  expect(table.SetOptimalHeight(context, 0, 7, true)).toBe(true);
  expect(table.GetRowFlagsRange(2).maValue).toBe(0);
  context.setForceAutoSize(false);
  expect(context.isForceAutoSize()).toBe(false);
  doc.DisposeAttributes();
});
it("uses every column in affected rows and restores geometry through real attribute Undo/Redo", /** Drives the actual font command. @returns Nothing. */ () => {
  const controller = new CalcViewController(),
    table = controller.shell.GetDocument().FetchTable(0) as ScTable;
  controller.SetFontSize(24);
  expect(table.GetRowHeight(0)).toBe(583);
  controller.Select(1, 0);
  controller.SetFontSize(12);
  expect(table.GetRowHeight(0)).toBe(583);
  controller.Select(0, 0);
  controller.SetFontSize(10);
  expect(table.GetRowHeight(0)).toBe(300);
  controller.Undo();
  expect(table.GetRowHeight(0)).toBe(583);
  controller.Redo();
  expect(table.GetRowHeight(0)).toBe(300);
  table.SetManualHeight(0, 0, true);
  controller.SetFontSize(48);
  expect(table.GetRowHeight(0)).toBe(300);
  expect(controller.shell.GetDocument().GetPattern(new ScAddress())).not.toBeNull();
  controller.Close();
});
it("projects variable native heights and bounded scroll offsets without per-row expansion", /** Verifies exact prefix/inverse and final row clamping. @returns Nothing. */ () => {
  const controller = new CalcViewController(),
    doc = controller.shell.GetDocument(),
    table = doc.FetchTable(0) as ScTable;
  table.SetRowHeightOnly(1, 2, 600);
  expect(rowPixels(table, 0, 3)).toBe(114);
  expect(rowPixels(table, 2, 1)).toBe(0);
  expect(rowAtPixel(table, -1, doc.MaxRow())).toBe(0);
  expect(rowAtPixel(table, 17, doc.MaxRow())).toBe(1);
  expect(rowAtPixel(table, 56, doc.MaxRow())).toBe(1);
  expect(rowAtPixel(table, 57, doc.MaxRow())).toBe(2);
  expect(rowAtPixel(table, 1e12, doc.MaxRow())).toBe(doc.MaxRow());
  expect(ScViewData.ToPixel(1, 0.01)).toBe(1);
  expect(ScViewData.ToPixel(0, 1)).toBe(0);
  controller.Scroll(0, controller.ScrollTopForRow(2, 400), 400, 400);
  expect(controller.viewport.firstRow).toBe(2);
  controller.Scroll(0, 1e6, 400, 400);
  expect(controller.viewport.firstRow).toBeLessThanOrEqual(doc.MaxRow());
  controller.InsertSheet();
  expect(controller.Undo()).toBe(true);
  expect(controller.viewData.GetTabNumber()).toBe(0);
  controller.Close();
});
it("retains one shared context across selected sheets and source MAX accumulation order", /** Preserves native cross-sheet ordering rather than silently resetting context. @returns Nothing. */ () => {
  const controller = new CalcViewController(),
    doc = controller.shell.GetDocument();
  controller.SetFontSize(24);
  doc.InsertTab(1, unicode("Second"));
  controller.viewData.GetMarkData().SelectTable(1, true);
  controller.Select(1, 0);
  controller.SetFontSize(12);
  expect((doc.FetchTable(0) as ScTable).GetRowHeight(0)).toBe(583);
  expect((doc.FetchTable(1) as ScTable).GetRowHeight(0)).toBe(583);
  const table = doc.FetchTable(0) as ScTable;
  table.SetManualHeight(2, 3, true);
  expect(table.SetOptimalHeight(new RowHeightContext(doc.MaxRow(), 1 / 15), 2, 3, true)).toBe(
    false,
  );
  controller.Select(0, 1);
  controller.SetFontSize(18);
  expect(table.SetOptimalHeight(new RowHeightContext(doc.MaxRow(), 1 / 15), 0, 1, true)).toBe(
    false,
  );
  controller.Close();
});

it("excludes the unused default-column tail when all native columns are allocated", /** Uses the full real column domain rather than a mocked sheet limit. @returns Nothing. */ () => {
  const [doc, table] = sheet();
  table.CreateColumnIfNotExists(doc.MaxCol());
  const delta = new ScPatternAttr(doc.getCellAttributeHelper());
  for (const which of [101, 112, 117]) delta.ItemSetPut(new SvxFontHeightItem(480, 100, which));
  table.GetDefaultColumnData().ApplyPatternArea(0, 0, delta);
  expect(table.SetOptimalHeight(new RowHeightContext(doc.MaxRow(), 1 / 15), 0, 0, true)).toBe(
    false,
  );
  expect(table.GetRowHeight(0)).toBe(256);
  delta.Dispose();
  doc.DisposeAttributes();
});
