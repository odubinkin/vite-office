/** @fileoverview Verifies native widget-local table-format lifecycle, saved metrics, flags and reset ownership. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatTablePage } from "./tabledlg";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwTableFormat } from "../../core/table/swtable";
/** Creates original native table parameters and the source format page. @param format - Authored attributes. @param columns - Original widths. @param space - Native print width. @param partial - Native selection flag. @returns Actual owners. */
function fixture(
  format: SwTableFormat = { width: 6000, horiOrient: H.LEFT },
  columns = [2000, 2000, 2000],
  space = 9000,
  partial = false,
) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Format", format);
  for (const width of columns) table.AddColumnWidth(width);
  doc.nodes.AppendTableRow(table, columns.length);
  return { doc, table, page: new SwFormatTablePage(table, space, partial) };
}
it("native format metrics remain local until source deactivation and flag publication", /** Checks independent widget and committed carrier values. @returns Nothing. */ () => {
  const f = fixture(),
    data = f.page.data,
    vector = data.columns;
  expect(f.page.FillItemSet()).toBe(false);
  f.page.ValueChangedHdl("width", 4000);
  expect([
    f.page.GetFieldValue("width"),
    f.page.GetFieldValue("left"),
    f.page.GetFieldValue("right"),
  ]).toEqual([4000, 0, 5000]);
  expect([
    data.width,
    data.left,
    data.right,
    data.HasWidthChanged(),
    data.HasColsChanged(),
  ]).toEqual([6000, 0, 3000, false, false]);
  expect(data.columns).toEqual([2000, 2000, 2000]);
  f.page.DeactivatePage();
  expect(f.page.data).toBe(data);
  expect(data.columns).toBe(vector);
  expect([
    data.width,
    data.left,
    data.right,
    data.HasWidthChanged(),
    data.HasColsChanged(),
  ]).toEqual([4000, 0, 5000, true, false]);
  expect(data.columns).toEqual([1334, 1334, 1334]);
  expect(f.table.GetColumnWidths()).toEqual([2000, 2000, 2000]);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native source focused unchanged width admits modification without a width-change flag", /** Checks FillItemSet focus and saved metric comparisons. @returns Nothing. */ () => {
  const f = fixture();
  f.page.DeactivatePage();
  expect(f.page.FillItemSet()).toBe(false);
  expect(f.page.FillItemSet("width")).toBe(true);
  f.page.DeactivatePage("width");
  expect([f.page.data.width, f.page.data.HasWidthChanged(), f.page.data.HasColsChanged()]).toEqual([
    6000,
    false,
    false,
  ]);
  expect(f.page.data.columns).toEqual([2000, 2000, 2000]);
});
it("native format side fields publish literal saved-spacing changes and balanced remainder", /** Checks actual native manual arithmetic and staged publication. @returns Nothing. */ () => {
  const f = fixture({ width: 6000, horiOrient: H.NONE, marginLeft: 1000, marginRight: 2000 });
  f.page.ValueChangedHdl("left", 1200);
  f.page.ValueChangedHdl("right", 1000);
  expect([
    f.page.GetFieldValue("width"),
    f.page.GetFieldValue("left"),
    f.page.GetFieldValue("right"),
  ]).toEqual([6800, 1200, 1000]);
  expect([f.page.data.width, f.page.data.left, f.page.data.right]).toEqual([6000, 1000, 2000]);
  f.page.DeactivatePage();
  expect([f.page.data.width, f.page.data.left, f.page.data.right]).toEqual([6800, 1200, 1000]);
  expect(f.page.data.columns).toEqual([2266, 2266, 2266]);
  expect(f.page.data.HasWidthChanged()).toBe(true);
});
it("native vertical metrics mark the page without publishing unrelated width changes", /** Checks top/bottom modification and shared native geometry. @returns Nothing. */ () => {
  const f = fixture({ width: 6000, horiOrient: H.LEFT, marginTop: 42, marginBottom: 51 });
  f.page.ValueChangedHdl("above", 150);
  f.page.ValueChangedHdl("below", -1);
  expect([f.page.GetFieldValue("above"), f.page.GetFieldValue("below")]).toEqual([150, 0]);
  expect(f.page.FillItemSet("above")).toBe(true);
  f.page.DeactivatePage("below");
  expect(f.page.data.HasWidthChanged()).toBe(false);
  expect(f.page.data.columns).toEqual([2000, 2000, 2000]);
  expect([f.table.GetFormat().marginTop, f.table.GetFormat().marginBottom]).toEqual([42, 51]);
});
it("native format Reset restores an independent snapshot and preserves shared pointer vector and selection", /** Checks source reset copy, saved values and retained native modified bit. @returns Nothing. */ () => {
  const f = fixture(
      { width: 6000, horiOrient: H.LEFT, marginTop: 42, marginBottom: 51 },
      undefined,
      undefined,
      true,
    ),
    data = f.page.data,
    vector = data.columns;
  f.page.AutoClickHdl(H.FULL);
  f.page.ValueChangedHdl("above", 100);
  f.page.ValueChangedHdl("below", 200);
  f.page.DeactivatePage();
  data.columns[0] = 99;
  data.SetLineSelected(false);
  data.SetColsChanged();
  f.page.Reset();
  expect(f.page.data).toBe(data);
  expect(data.columns).toBe(vector);
  expect(data.columns).toEqual([2000, 2000, 2000]);
  expect([
    data.width,
    data.left,
    data.right,
    data.IsLineSelected(),
    data.HasWidthChanged(),
    data.HasColsChanged(),
  ]).toEqual([6000, 0, 3000, true, false, false]);
  expect([f.page.GetFieldValue("width"), f.page.GetAlign(), f.page.above, f.page.below]).toEqual([
    6000,
    H.LEFT,
    42,
    51,
  ]);
  expect(f.page.FillItemSet()).toBe(true);
  f.page.AutoClickHdl(H.RIGHT);
  expect([
    f.page.GetFieldValue("width"),
    f.page.GetFieldValue("left"),
    f.page.GetFieldValue("right"),
  ]).toEqual([6000, 3000, 0]);
  expect(data.align).toBe(H.LEFT);
});
it("native format Activate refreshes changed width and saves external spacing before a restored automatic excursion", /** Checks cross-page saved-value ownership. @returns Nothing. */ () => {
  const f = fixture(),
    data = f.page.data;
  data.width = 7000;
  data.right = 2000;
  f.page.ActivatePage();
  expect([f.page.GetFieldValue("width"), f.page.GetFieldValue("right")]).toEqual([7000, 2000]);
  f.page.AutoClickHdl(H.FULL);
  expect([f.page.GetFieldValue("width"), f.page.GetAlign(), data.width, data.align]).toEqual([
    9000,
    H.FULL,
    7000,
    H.LEFT,
  ]);
  f.page.AutoClickHdl(H.LEFT);
  expect([f.page.GetFieldValue("width"), f.page.GetFieldValue("right")]).toEqual([7000, 2000]);
  f.page.DeactivatePage();
  expect(data.HasWidthChanged()).toBe(false);
  expect(f.table.GetFormat().width).toBe(6000);
});
it("native equal-width Activate retains widget spacing despite carrier-only spacing changes", /** Checks source early-return contract without data-to-field aliasing. @returns Nothing. */ () => {
  const f = fixture();
  f.page.data.left = 1000;
  f.page.data.right = 2000;
  f.page.ActivatePage();
  expect([f.page.GetFieldValue("left"), f.page.GetFieldValue("right")]).toEqual([0, 3000]);
  expect(f.page.FillItemSet()).toBe(false);
  f.page.DeactivatePage();
  expect([f.page.data.left, f.page.data.right]).toEqual([1000, 2000]);
});
it("native automatic format Activate publishes the new available width through source dirty lifecycle", /** Checks FULL activation and automatic sentinel path. @returns Nothing. */ () => {
  const f = fixture({ width: 6000, horiOrient: H.FULL });
  f.page.data.space = 10000;
  f.page.ActivatePage();
  expect(f.page.GetFieldValue("width")).toBe(10000);
  expect(f.page.data.width).toBe(9000);
  f.page.DeactivatePage("above");
  expect([f.page.data.width, f.page.data.HasWidthChanged()]).toEqual([10000, true]);
  expect(f.page.data.columns).toEqual([3333, 3333, 3333]);
});
it("native automatic width sentinel suppresses a redundant change flag", /** Checks the represented table-manager INVALID_TWIPS contract. @returns Nothing. */ () => {
  const maximum = Number(0x7fffffffffffffffn),
    f = fixture({ width: maximum, horiOrient: H.FULL }, [maximum], maximum);
  f.page.ValueChangedHdl("above", 1);
  f.page.DeactivatePage();
  expect([f.page.data.width, f.page.data.HasWidthChanged()]).toEqual([maximum, false]);
});
