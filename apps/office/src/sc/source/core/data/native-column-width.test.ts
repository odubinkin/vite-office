/** @fileoverview Native compressed column geometry/default/visibility and geometry-only document copy witnesses. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScMarkData } from "../../../inc/markdata";
import { InsertDeleteFlags, STD_COL_WIDTH, MAX_COL_WIDTH } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates an actual source document and sheet. @returns Document. */
function document(): ScDocument {
  const result = new ScDocument(),
    name = unicode("Sheet");
  result.InsertTab(0, name);
  name.dispose();
  return result;
}
it("uses original1280twip widths,UInt16/zero fallback and source hidden span outputs without allocating cells", /** Native arrays and FilterData own state. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0) as NonNullable<ReturnType<typeof doc.FetchTable>>,
    first: [number] = [-1],
    last: [number] = [-1];
  try {
    expect([STD_COL_WIDTH, MAX_COL_WIDTH]).toEqual([1280, 56693]);
    expect(doc.GetColWidth(0, 0)).toBe(1280);
    expect(table.GetColWidthRange(0).mnRow2).toBe(doc.MaxCol() + 1);
    doc.SetColWidth(2, 0, 1440);
    doc.SetColWidth(2, 0, 1440);
    expect(doc.GetColWidth(2, 0)).toBe(1440);
    doc.SetColWidthOnly(2, 0, 65536);
    expect(doc.GetColWidth(2, 0)).toBe(1280);
    doc.SetColWidth(2, 0, 1440);
    doc.SetColHidden(1, 3, 0, true);
    expect(doc.GetColWidth(2, 0)).toBe(0);
    expect(doc.GetColWidth(2, 0, false)).toBe(1440);
    expect(doc.ColHidden(2, 0, first, last)).toBe(true);
    expect([first[0], last[0]]).toEqual([1, 3]);
    doc.ShowCol(2, 0, true);
    doc.ShowCol(2, 0, true);
    expect(doc.GetColWidth(2, 0)).toBe(1440);
    doc.ShowCol(2, 0, false);
    expect(doc.GetColWidth(2, 0)).toBe(0);
    expect(table.ColHidden(-1, first, last)).toBe(true);
    expect([first[0], last[0]]).toEqual([1, 3]);
    doc.SetColWidth(-1, 0, 600);
    doc.ShowCol(-1, 0, true);
    expect(doc.GetColWidth(-1, 0)).toBe(1280);
    doc.SetColWidth(0, 5, 600);
    doc.SetColWidthOnly(0, 5, 600);
    doc.SetColHidden(0, 0, 5, true);
    doc.ShowCol(0, 5, false);
    expect(doc.GetColWidth(0, 5)).toBe(0);
    expect(doc.ColHidden(7, 5, first, last)).toBe(false);
    expect([first[0], last[0]]).toEqual([7, 7]);
    expect(doc.ColHidden(8, 5)).toBe(false);
    expect(table.GetAllocatedColumnsCount()).toBe(1);
  } finally {
    doc.DisposeAttributes();
  }
});
it("copies source geometry without changing cells or allocating data columns and uses range sheet bounds independently of marks", /** Real compressed-array/hidden-run copies distinguish geometry from attribute or content transfer. @returns Nothing. */ () => {
  const source = document(),
    target = document(),
    marks = new ScMarkData(source.GetSheetLimits());
  marks.SelectOneTable(0);
  try {
    source.SetColWidth(0, 0, 900);
    source.SetColWidth(2, 0, 1500);
    source.SetColHidden(1, 2, 0, true);
    target.SetValue(new ScAddress(), 17);
    source.CopyToDocument(
      new ScRange(0, 0, 0, 3, source.MaxRow(), 0),
      InsertDeleteFlags.NONE,
      false,
      target,
      marks,
    );
    expect(
      [0, 1, 2, 3].map(
        /** Reads actual destination widths. @param col - Column. @returns Twips. */ (col) =>
          target.GetColWidth(col, 0, false),
      ),
    ).toEqual([900, 1280, 1500, 1280]);
    expect(target.ColHidden(1, 0)).toBe(true);
    expect(target.ColHidden(3, 0)).toBe(false);
    expect(target.GetValue(new ScAddress())).toBe(17);
    source.SetColWidth(0, 0, 800);
    source.CopyToDocument(new ScRange(0, 0, 0, 0, 1, 0), InsertDeleteFlags.NONE, false, target);
    expect(target.GetColWidth(0, 0)).toBe(900);
    marks.SelectOneTable(1);
    source.CopyToDocument(
      new ScRange(0, 0, 0, 0, source.MaxRow(), 0),
      InsertDeleteFlags.NONE,
      false,
      target,
      marks,
    );
    expect(target.GetColWidth(0, 0)).toBe(800);
    source.CopyToDocument(
      new ScRange(0, 0, 2, 0, source.MaxRow(), 2),
      InsertDeleteFlags.NONE,
      false,
      target,
    );
    expect(
      (
        source.FetchTable(0) as NonNullable<ReturnType<typeof source.FetchTable>>
      ).GetAllocatedColumnsCount(),
    ).toBe(1);
  } finally {
    source.DisposeAttributes();
    target.DisposeAttributes();
  }
});
