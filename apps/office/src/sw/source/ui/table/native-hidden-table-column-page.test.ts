/** @fileoverview Native visible column-page fields aggregate and rewrite hidden interval runs. */
import { expect, it } from "vitest";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwTableRep } from "../../uibase/table/swtablerep";
import { SwTableColumnPage, SwFormatTablePage } from "./tabledlg";
import { SwDoc } from "../../core/doc/doc";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";

/** Authors an independent current-row geometry. @param hidden - Hidden constraints. @returns Native owners. */
function fixture(hidden = [false, true, true]) {
  const columns = new SwTabCols();
  columns.SetRight(6000);
  columns.SetRightMax(9000);
  for (const [i, position] of [1000, 2000, 4000].entries())
    columns.Insert(position, hidden[i] as boolean, columns.Count());
  const data = new SwTableRep(columns);
  data.width = 6000;
  data.space = 9000;
  data.right = 3000;
  data.align = H.LEFT;
  const page = new SwTableColumnPage(data);
  return { columns, data, page };
}
it("native visible fields aggregate hidden runs and keep five source slots", /** Checks source counts and literal hidden field mapping. @returns Nothing. */ () => {
  const f = fixture();
  expect([f.data.GetColCount(), f.data.GetAllColCount()]).toEqual([2, 4]);
  expect([f.page.GetVisibleWidth(0), f.page.GetVisibleWidth(1)]).toEqual([1000, 5000]);
  expect(
    [0, 1, 2, 3, 4].map(
      /** Reads actual metric slots. @param slot - Native field. @returns Value. */ (slot) =>
        f.page.GetFieldValue(slot),
    ),
  ).toEqual([1000, 5000, undefined, undefined, undefined]);
  expect([f.page.CanScroll("back"), f.page.CanScroll("next")]).toEqual([false, false]);
  expect(f.page.GetMinimum()).toBe(23);
  f.page.ValueChangedHdl(0, 1500);
  expect(f.data.columns).toEqual([
    { nWidth: 1500, bVisible: true },
    { nWidth: 4500, bVisible: false },
    { nWidth: 0, bVisible: false },
    { nWidth: 0, bVisible: true },
  ]);
  expect([f.page.GetVisibleWidth(0), f.page.GetVisibleWidth(1)]).toEqual([1500, 4500]);
  f.page.DeactivatePage();
  expect([f.data.HasColsChanged(), f.data.HasWidthChanged(), f.data.width]).toEqual([
    true,
    false,
    6000,
  ]);
  expect(f.data.FillTabCols(f.columns)).toBe(true);
  expect([
    f.columns.GetEntry(0).nPos,
    f.columns.GetEntry(1).nPos,
    f.columns.GetEntry(2).nPos,
  ]).toEqual([1500, 2000, 4000]);
});
it("native current-row fields use visible count for compensation and preserve hidden zero minimum on Reset", /** Checks three-column independent arithmetic and complete copy restoration. @returns Nothing. */ () => {
  const f = fixture([false, false, true]),
    vector = f.data.columns;
  expect(
    [0, 1, 2].map(
      /** Reads original fields. @param i - Field. @returns Width. */ (i) =>
        f.page.GetFieldValue(i),
    ),
  ).toEqual([1000, 1000, 4000]);
  f.page.ValueChangedHdl(2, 5000);
  expect(f.data.columns).toEqual([
    { nWidth: 23, bVisible: true },
    { nWidth: 977, bVisible: true },
    { nWidth: 5000, bVisible: false },
    { nWidth: 0, bVisible: true },
  ]);
  f.page.DeactivatePage();
  expect(f.data.FillTabCols(f.columns)).toBe(true);
  expect([
    f.columns.GetEntry(0).nPos,
    f.columns.GetEntry(1).nPos,
    f.columns.GetEntry(2).nPos,
  ]).toEqual([23, 1000, 4000]);
  expect(new SwTableColumnPage(f.data).GetMinimum()).toBe(0);
  f.page.Reset();
  expect(f.data.columns).toBe(vector);
  expect(f.data.columns).toEqual([
    { nWidth: 1000, bVisible: true },
    { nWidth: 1000, bVisible: true },
    { nWidth: 2000, bVisible: false },
    { nWidth: 2000, bVisible: true },
  ]);
  expect(f.data.HasColsChanged()).toBe(false);
});
it("native hidden page mode arithmetic updates absolute table width and selection sensitivity", /** Checks adaptive visible width and source selection flags. @returns Nothing. */ () => {
  const f = fixture();
  f.page.ModeHdl("adapt", true);
  f.page.ValueChangedHdl(0, 2000);
  f.page.DeactivatePage();
  expect([f.data.width, f.data.right, f.page.GetVisibleWidth(1)]).toEqual([7000, 2000, 5000]);
  expect(f.data.HasWidthChanged()).toBe(true);
  f.data.SetLineSelected(true);
  f.page.ActivatePage();
  expect([f.page.IsSensitive("adapt"), f.page.IsSensitive("proportional")]).toEqual([false, false]);
});
it("native format correction retains first visible-count interval semantics", /** Checks literal source correction over hidden entries rather than a flattened vector. @returns Nothing. */ () => {
  const f = fixture(),
    doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("HiddenFormat", { width: 6000, horiOrient: H.LEFT });
  const format = new SwFormatTablePage(table, 9000, false, f.columns);
  format.ValueChangedHdl("width", 5000);
  expect(format.DeactivatePage()).toBe(true);
  expect(format.data.columns).toEqual([
    { nWidth: 2500, bVisible: true },
    { nWidth: 2500, bVisible: false },
    { nWidth: 2000, bVisible: false },
    { nWidth: 2000, bVisible: true },
  ]);
  expect(format.data.width).toBe(5000);
  expect(format.data.HasColsChanged()).toBe(false);
  expect(format.data.HasWidthChanged()).toBe(true);
});
it("native hidden proportional mode scales visible widths and clears covered interval pieces", /** Checks literal source proportional cap and complete hidden flags. @returns Nothing. */ () => {
  const f = fixture();
  f.page.ModeHdl("proportional", true);
  f.page.ValueChangedHdl(0, 2000);
  f.page.DeactivatePage();
  expect(f.data.columns).toEqual([
    { nWidth: 1500, bVisible: true },
    { nWidth: 7500, bVisible: false },
    { nWidth: 0, bVisible: false },
    { nWidth: 0, bVisible: true },
  ]);
  expect([f.data.width, f.data.right]).toEqual([9000, 0]);
  expect([f.data.HasColsChanged(), f.data.HasWidthChanged()]).toEqual([true, true]);
});
it("native hidden column window scrolls by visible count and edits the seventh visible column", /** Checks independent visible window and wrapped compensation. @returns Nothing. */ () => {
  const geometry = new SwTabCols();
  geometry.SetRight(900);
  geometry.SetRightMax(1800);
  for (let i = 0; i < 8; i++) geometry.Insert((i + 1) * 100, i === 1 || i === 3, i);
  const data = new SwTableRep(geometry);
  data.width = 900;
  data.space = 1800;
  data.right = 900;
  data.align = H.LEFT;
  const page = new SwTableColumnPage(data);
  expect([data.GetColCount(), data.GetAllColCount()]).toEqual([7, 9]);
  page.AutoClickHdl("next");
  expect([page.GetFieldColumn(0), page.GetFieldColumn(4), page.CanScroll("next")]).toEqual([
    1,
    5,
    true,
  ]);
  page.AutoClickHdl("next");
  expect([page.GetFieldColumn(0), page.GetFieldColumn(4), page.CanScroll("next")]).toEqual([
    2,
    6,
    false,
  ]);
  page.ValueChangedHdl(4, 200);
  expect(
    Array.from(
      { length: 7 },
      /** Reads native visible widths. @param _unused - Array value. @param i - Column. @returns Width. */ (
        _unused,
        i,
      ) => page.GetVisibleWidth(i),
    ),
  ).toEqual([23, 177, 200, 100, 100, 100, 200]);
  expect(data.columns[1]).toEqual({ nWidth: 177, bVisible: false });
  expect(data.columns[2]).toEqual({ nWidth: 0, bVisible: true });
  page.AutoClickHdl("back");
  expect(page.GetFieldColumn(0)).toBe(1);
  page.DeactivatePage();
  expect(data.HasColsChanged()).toBe(true);
  expect(data.width).toBe(900);
});
