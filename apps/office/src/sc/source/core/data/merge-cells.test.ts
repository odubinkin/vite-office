/** @fileoverview Source-level regressions for Calc merge attributes and content transfer. */
import { expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("extends an anchored merge over the original rectangle and removes its coverage", /** Ports the merge geometry from ucalc.cxx testMergedCells. @returns Nothing. */ () => {
  const document = new ScDocument();
  document.InsertTab(0, unicode("Sheet1"));
  document.DoMerge(1, 1, 3, 3, 0);
  const col: [number] = [1],
    row: [number] = [1];
  expect(document.ExtendMerge(1, 1, col, row, 0)).toBe(true);
  expect([col[0], row[0]]).toEqual([3, 3]);
  expect(document.SkipOverlapped(3, 3, 0)).toEqual([1, 1]);
  document.RemoveMerge(1, 1, 0);
  expect(document.ExtendMerge(1, 1, [1], [1], 0)).toBe(false);
  expect(document.SkipOverlapped(3, 3, 0)).toEqual([3, 3]);
});

it("retains the edit object when moving a hyperlink into an empty merge anchor", /** Ports ucalc.cxx testMergedHyperlink through the actual Calc edit engine. @returns Nothing. */ () => {
  const document = new ScDocument();
  document.InsertTab(0, unicode("Table1"));
  const a1 = new ScAddress(0, 0, 0),
    b1 = new ScAddress(1, 0, 0);
  const url = unicode("https://libreoffice.org/");
  const editor = document.GetEditEngine();
  editor.SetTextCurrentDefaults(url);
  document.SetEditText(b1, editor.CreateTextObject());
  document.DoMergeContents(0, 0, 1, 0, 0);
  expect(document.GetCellType(a1)).toBe(CellType.CELLTYPE_EDIT);
  expect(document.GetRefCellValue(a1).getEditText()?.GetText(0).equals(url)).toBe(true);
  expect(document.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);
});

it("resolves an origin many rows above the covered part of a merge", /** Exercises sparse attribute runs across a sheet-sized vertical span. @returns Nothing. */ () => {
  const document = new ScDocument();
  document.InsertTab(0, unicode("Sheet1"));
  document.DoMerge(1, 1, 1, document.MaxRow(), 0);
  expect(document.SkipOverlapped(1, document.MaxRow(), 0)).toEqual([1, 1]);
});

it("joins text and values in row order and leaves the anchor intact when clearing covered cells", /** Verifies the original move and empty content paths. @returns Nothing. */ () => {
  const document = new ScDocument();
  document.InsertTab(0, unicode("Table1"));
  const a1 = new ScAddress(0, 0, 0),
    b1 = new ScAddress(1, 0, 0),
    a2 = new ScAddress(0, 1, 0);
  document.SetTextCell(a1, unicode("First"));
  document.SetValue(b1, 42);
  document.SetTextCell(a2, unicode("Last"));
  document.DoMergeContents(0, 0, 1, 1, 0);
  expect(document.GetSharedString(a1).getString().equals(unicode("First 42 Last"))).toBe(true);
  expect(document.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);
  expect(document.GetCellType(a2)).toBe(CellType.CELLTYPE_NONE);
  document.SetValue(b1, 15);
  document.DoEmptyBlock(0, 0, 1, 1, 0);
  expect(document.GetCellType(b1)).toBe(CellType.CELLTYPE_NONE);
  expect(document.GetSharedString(a1).getString().equals(unicode("First 42 Last"))).toBe(true);
});
