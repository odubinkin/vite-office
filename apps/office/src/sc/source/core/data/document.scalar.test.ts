/** @fileoverview First real document/sheet/column scalar editing integration,without a second grid model. */
import { expect, it } from "vitest";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { MAXCOL, MAXROW, SC_TAB_APPEND, ScAddress } from "../../../inc/address";
import { ScColumn } from "../../../inc/column";
import { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";

it("creates sheets and edits real numeric/string column blocks through the public document", /** Exercises replacements,clear,empty text and shared-string copy isolation. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a1 = new ScAddress(0, 0, 0),
    lastRow = new ScAddress(2, MAXROW, 0);
  expect(doc.GetTableCount()).toBe(0);
  expect(doc.InsertTab(SC_TAB_APPEND, unicode("Sheet1"))).toBe(true);
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetValue(a1)).toBe(0);
  doc.SetValue(a1, 12.5);
  expect(doc.GetValue(a1)).toBe(12.5);
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_VALUE);
  doc.SetTextCell(a1, unicode("=1+2"));
  expect(doc.GetValue(a1)).toBe(0);
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_STRING);
  const borrowed = doc.GetSharedString(a1);
  expect(text(borrowed.getString())).toBe("=1+2");
  borrowed.dispose();
  expect(text(doc.GetSharedString(a1).getString())).toBe("=1+2");
  doc.SetValue(a1, -0);
  expect(Object.is(doc.GetValue(a1), -0)).toBe(true);
  doc.SetValue(lastRow, 42);
  expect(doc.GetValue(lastRow)).toBe(42);
  doc.SetEmptyCell(a1);
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetValue(lastRow)).toBe(42);
  doc.SetTextCell(lastRow, unicode(""));
  expect(doc.GetCellType(lastRow)).toBe(CellType.CELLTYPE_NONE);
  expect(doc.FetchTable(0)?.GetAllocatedColumnsCount()).toBe(3);
});

it("keeps sheet positions,names and native invalid-coordinate defaults", /** Clears and reads do not allocate missing columns;inserting a sheet retains existing cell ownership. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = new OUString();
  expect(doc.InsertTab(0, unicode("Data"))).toBe(true);
  doc.SetValue(new ScAddress(0, 0, 0), 7);
  expect(doc.InsertTab(0, unicode("First"))).toBe(true);
  expect(doc.GetValue(new ScAddress(0, 0, 1))).toBe(7);
  expect(doc.GetName(1, name)).toBe(true);
  expect(text(name)).toBe("Data");
  expect(doc.InsertTab(2, unicode("data"))).toBe(false);
  expect(doc.InsertTab(2, unicode("bad/name"))).toBe(false);
  expect(doc.InsertTab(-1, unicode("bad"))).toBe(false);
  for (const invalid of ["", "a:b", "'a", "a'"])
    expect(ScDocument.ValidTabName(unicode(invalid))).toBe(false);
  expect(ScDocument.ValidTabName(unicode("a'b"))).toBe(true);
  for (const pos of [
    new ScAddress(-1, 0, 0),
    new ScAddress(MAXCOL + 1, 0, 0),
    new ScAddress(0, -1, 0),
    new ScAddress(0, MAXROW + 1, 0),
    new ScAddress(0, 0, 9),
  ]) {
    doc.SetValue(pos, 99);
    doc.SetTextCell(pos, unicode("ignored"));
    doc.SetEmptyCell(pos);
    expect(doc.GetValue(pos)).toBe(0);
    expect(doc.GetCellType(pos)).toBe(CellType.CELLTYPE_NONE);
    expect(doc.GetSharedString(pos).getLength()).toBe(0);
  }
  const count = doc.FetchTable(0)?.GetAllocatedColumnsCount();
  const shared = doc.GetSharedStringPool().intern(unicode("invalid coordinate"));
  doc.FetchTable(0)?.SetRawString(-1, 0, shared);
  shared.dispose();
  doc.SetEmptyCell(new ScAddress(500, 100, 0));
  expect(doc.FetchTable(0)?.GetAllocatedColumnsCount()).toBe(count);
  expect(doc.GetName(99, name)).toBe(false);
  expect(text(name)).toBe("");
  doc.SetTextCell(new ScAddress(0, 0, 0), unicode("a\nb"));
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_EDIT);
});

it("renames a sheet with source external-name and case-insensitive duplicate rules", /** Checks renames a sheet with source external-name and case-insensitive duplicate rules. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  expect(doc.InsertTab(0, unicode("First"))).toBe(true);
  expect(doc.InsertTab(1, unicode("Data"))).toBe(true);
  expect(doc.RenameTab(0, unicode("data"), true)).toBe(false);
  expect(doc.RenameTab(0, unicode("bad/name"))).toBe(false);
  expect(doc.RenameTab(0, unicode("bad/name"), true)).toBe(true);
  const name = new OUString();
  expect(doc.GetName(0, name)).toBe(true);
  expect(text(name)).toBe("bad/name");
  name.dispose();
});

it("reuses the real shared pool for literal strings and preserves empty-string cell identity", /** Distinguishes an explicitly stored empty shared string from a missing cell and text-input deletion. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    column = new ScColumn(doc);
  column.Init(4, 2);
  expect(column.GetDoc()).toBe(doc);
  expect(column.GetCol()).toBe(4);
  expect(column.GetTab()).toBe(2);
  expect(doc.MaxCol()).toBe(MAXCOL);
  expect(doc.MaxRow()).toBe(MAXROW);
  expect(doc.GetMaxRowCount()).toBe(MAXROW + 1);
  column.SetRawString(0, unicode("literal"));
  column.SetRawString(1, unicode("literal"));
  const a = column.GetSharedString(0),
    b = column.GetSharedString(1);
  expect(a.getData()).toBe(b.getData());
  expect(text(a.getString())).toBe("literal");
  a.dispose();
  b.dispose();
  column.SetRawString(0, unicode(""));
  expect(column.GetCellType(0)).toBe(CellType.CELLTYPE_STRING);
  expect(column.GetSharedString(0).getLength()).toBe(0);
  column.SetValue(-1, 12);
  column.SetRawString(MAXROW + 1, unicode("ignored"));
  expect(column.GetCellType(1)).toBe(CellType.CELLTYPE_STRING);
  column.SetValue(2, Number.NaN);
  expect(Number.isNaN(column.GetValue(2))).toBe(true);
  column.Delete(2);
  expect(column.GetValue(2)).toBe(0);
  expect(column.GetSharedString(2).getLength()).toBe(0);
});
