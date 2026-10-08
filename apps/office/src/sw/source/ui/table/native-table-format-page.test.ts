/** @fileoverview Literal native absolute table-page handlers and geometry without upstream runtime access. */
import { it, expect } from "vitest";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwDoc } from "../../core/doc/doc";
import type { SwTableFormat } from "../../core/table/swtable";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { SwFormatTablePage } from "./tabledlg";

/** Constructs a real flat table and its native page draft. @param format - Attributes. @param columns - Physical columns. @returns Native owners. */
function fixture(
  format: SwTableFormat = { width: 3000, horiOrient: H.LEFT },
  columns = [1000, 2000],
) {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Geometry", format);
  for (const width of columns) table.AddColumnWidth(width);
  return { table, page: new SwFormatTablePage(table, 8000) };
}
it("retains native orientation numeric contracts", /** Checks the actual IDL IDs. @returns Nothing. */ () => {
  expect([
    H.NONE,
    H.RIGHT,
    H.CENTER,
    H.LEFT,
    H.INSIDE,
    H.OUTSIDE,
    H.FULL,
    H.LEFT_AND_WIDTH,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
});
for (const [align, left, right, width, sensitive] of [
  [H.FULL, 300, 600, 8000, [false, false, false]],
  [H.LEFT, 0, 5000, 3000, [true, false, true]],
  [H.LEFT_AND_WIDTH, 300, 4700, 3000, [true, true, false]],
  [H.RIGHT, 5000, 0, 3000, [true, true, false]],
  [H.CENTER, 2500, 2500, 3000, [true, true, false]],
  [H.NONE, 300, 600, 7100, [true, true, true]],
] as const)
  it(`resets absolute native orientation=${align}`, /** Checks literal native geometry and field sensitivity. @returns Nothing. */ () => {
    const f = fixture({
      width: 3000,
      horiOrient: align,
      marginLeft: 300,
      marginRight: 600,
      marginTop: 40,
      marginBottom: 50,
    });
    expect([
      f.page.GetFieldValue("left"),
      f.page.GetFieldValue("right"),
      f.page.GetFieldValue("width"),
    ]).toEqual([left, right, width]);
    expect([
      f.page.IsSensitive("width"),
      f.page.IsSensitive("left"),
      f.page.IsSensitive("right"),
    ]).toEqual(sensitive);
    expect([f.page.above, f.page.below]).toEqual([40, 50]);
    f.page.DeactivatePage();
    expect(
      f.page.data.columns.map(
        /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
          column,
        ) => column.nWidth,
      ),
    ).toEqual([1000, 2000]);
    expect(f.table.GetColumnWidths()).toEqual([1000, 2000]);
    expect(new SwTabFrame(f.table).Format(8000)).toEqual(
      align === H.FULL ? { left: 0, right: 0, width: 8000 } : { left, right, width },
    );
  });
it("restores saved absolute width after automatic and preserves native center transitions", /** Checks actual toggle and spacing handlers. @returns Nothing. */ () => {
  const { page } = fixture();
  page.AutoClickHdl(H.FULL);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([8000, 0, 0]);
  page.AutoClickHdl(H.RIGHT);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([3000, 5000, 0]);
  page.AutoClickHdl(H.LEFT);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([3000, 0, 5000]);
  page.AutoClickHdl(H.CENTER);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([3000, 2500, 2500]);
  page.ValueChangedHdl("left", 3000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([2000, 3000, 3000]);
  page.ValueChangedHdl("width", 3000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([3000, 2500, 2500]);
  page.AutoClickHdl(H.NONE);
  page.ValueChangedHdl("right", 1000);
  page.ValueChangedHdl("width", 4000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([4000, 2750, 1250]);
  page.ValueChangedHdl("above", -1);
  page.ValueChangedHdl("below", 80);
  expect([page.above, page.below]).toEqual([0, 80]);
});
it("keeps native from-left priorities, one width correction and signed spacing", /** Checks oversize and field limits. @returns Nothing. */ () => {
  const { page } = fixture({ width: 3000, horiOrient: H.LEFT_AND_WIDTH, marginLeft: 300 });
  page.ValueChangedHdl("left", 700);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([3000, 700, 4300]);
  page.ValueChangedHdl("width", 7700);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([7700, 300, 0]);
  page.ValueChangedHdl("width", 9000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([8000, 0, 0]);
  page.AutoClickHdl(H.LEFT_AND_WIDTH);
  page.ValueChangedHdl("left", -100);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([8000, -100, 100]);
  page.AutoClickHdl(H.LEFT);
  page.ValueChangedHdl("right", 9000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([23, 0, 7977]);
  page.ValueChangedHdl("width", 0);
  expect(page.GetFieldValue("width")).toBe(46);
  page.ValueChangedHdl("right", -1000000);
  expect(page.GetFieldValue("right")).toBe(-999999);
  page.ValueChangedHdl("width", 90000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([16000, 0, -8000]);
});
it("clamps centered and manual side edits at the native minimum", /** Checks native left-field constraints. @returns Nothing. */ () => {
  const { page } = fixture({ width: 3000, horiOrient: H.CENTER });
  page.ValueChangedHdl("left", 8000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([24, 3988, 3988]);
  page.AutoClickHdl(H.NONE);
  page.ValueChangedHdl("left", 8000);
  expect([
    page.GetFieldValue("width"),
    page.GetFieldValue("left"),
    page.GetFieldValue("right"),
  ]).toEqual([23, 3989, 3988]);
});
it("corrects a sub-minimum initial width once and clamps vertical spacing", /** Checks the MINLAY correction branch. @returns Nothing. */ () => {
  const { page } = fixture({ width: 1, horiOrient: H.LEFT });
  page.ValueChangedHdl("width", 0);
  expect([page.GetFieldValue("width"), page.GetFieldValue("right")]).toEqual([23, 7977]);
  page.ValueChangedHdl("above", 90);
  page.ValueChangedHdl("below", -1);
  expect([page.above, page.below]).toEqual([90, 0]);
});
it("reconciles visible column widths without replacing original graph owners", /** Checks native sum remainder and narrow-column floor. @returns Nothing. */ () => {
  const f = fixture({ width: 6000, horiOrient: H.LEFT }, [23, 5977]);
  f.page.ValueChangedHdl("width", 3000);
  f.page.DeactivatePage();
  expect(
    f.page.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([23, 2980]);
  expect(f.table.GetColumnWidths()).toEqual([23, 5977]);
  const balanced = fixture();
  balanced.page.ValueChangedHdl("width", 3000);
  balanced.page.DeactivatePage();
  expect(
    balanced.page.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([1000, 2000]);
  const empty = fixture({}, []);
  empty.page.AutoClickHdl(H.LEFT);
  empty.page.DeactivatePage();
  expect(
    empty.page.data.columns.map(
      /** Reads literal native widths. @param column - Native interval. @returns Width. */ (
        column,
      ) => column.nWidth,
    ),
  ).toEqual([]);
});
it("retains the Reset minimum through automatic width excursions", /** Checks thin and ordinary initial frame constraints through native transitions. @returns Nothing. */ () => {
  for (const [initial, minimum] of [
    [1, 23],
    [3000, 46],
  ]) {
    const { page } = fixture({ width: initial, horiOrient: H.LEFT });
    page.ValueChangedHdl("width", 100);
    page.AutoClickHdl(H.FULL);
    page.AutoClickHdl(H.LEFT);
    page.ValueChangedHdl("width", 0);
    expect(page.GetFieldValue("width")).toBe(minimum);
    page.AutoClickHdl(H.NONE);
    page.ValueChangedHdl("right", 600);
    page.ValueChangedHdl("left", 300);
    page.ValueChangedHdl("above", 100);
    page.ValueChangedHdl("below", 200);
    expect([
      page.GetFieldValue("width"),
      page.GetFieldValue("left"),
      page.GetFieldValue("right"),
      page.above,
      page.below,
    ]).toEqual([7100, 300, 600, 100, 200]);
  }
});
it("formats explicit native orientation with absent side-spacing items", /** Checks native item defaults independently of ODF spelling. @returns Nothing. */ () => {
  for (const [format, expected] of [
    [
      { horiOrient: H.NONE, marginRight: 200 },
      { left: 0, right: 200, width: 7800 },
    ],
    [
      { horiOrient: H.NONE, marginLeft: 300 },
      { left: 300, right: 0, width: 7700 },
    ],
    [
      { horiOrient: H.LEFT_AND_WIDTH, width: 3000 },
      { left: 0, right: 5000, width: 3000 },
    ],
  ] as readonly (readonly [SwTableFormat, { left: number; right: number; width: number }])[]) {
    const { table } = fixture(format);
    expect(new SwTabFrame(table).Format(8000)).toEqual(expected);
  }
});
for (const [format, align] of [
  [{}, H.FULL],
  [{ align: "left" }, H.FULL],
  [{ align: "left", marginLeft: 0 }, H.NONE],
  [{ align: "left", marginRight: 0 }, H.NONE],
  [{ align: "left", width: 3000 }, H.LEFT],
  [{ align: "left", width: 3000, marginLeft: 0 }, H.LEFT_AND_WIDTH],
  [{ align: "left", width: 3000, marginRight: 0 }, H.LEFT_AND_WIDTH],
  [{ align: "center", width: 3000 }, H.CENTER],
  [{ align: "center" }, H.FULL],
  [{ align: "right", width: 3000 }, H.RIGHT],
  [{ align: "right" }, H.FULL],
  [{ align: "margins" }, H.FULL],
  [{ align: "margins", marginLeft: 0 }, H.NONE],
  [{ align: "margins", marginRight: 0 }, H.NONE],
  [{ horiOrient: H.INSIDE }, H.INSIDE],
  [{ horiOrient: H.OUTSIDE }, H.OUTSIDE],
] as readonly (readonly [SwTableFormat, H])[])
  it(`admits historical ODF orientation ${JSON.stringify(format)}`, /** Checks presence rather than truthiness without rewriting attributes. @returns Nothing. */ () => {
    const f = fixture(format);
    expect(f.table.GetHoriOrient()).toBe(align);
    expect(f.table.GetFormat()).toEqual(format);
  });
