/** @fileoverview Real OOXML sheet cell/formula/table models and source row/merge range predicates over actual Calc address and RTL owners. Complete worksheet filtering is not claimed. */
import { expect, it } from "vitest";
import {
  CellModel,
  CellFormulaModel,
  DataTableModel,
  XfIdRowRange,
  MergedRange,
} from "../inc/sheetdatabuffer";
import { ScAddress, ScRange } from "../../../inc/address";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("retains original cell/formula defaults and independent address/range copy construction", /** Native source uses unset token and style/shared ID minus one. @returns Nothing. */ () => {
  const cell = new CellModel(),
    formula = new CellFormulaModel();
  expect(cell.maCellAddr.equals(new ScAddress())).toBe(true);
  expect(cell.mnCellType).toBe(-1);
  expect(cell.mnXfId).toBe(-1);
  expect(cell.mbShowPhonetic).toBe(false);
  expect(formula.mnFormulaType).toBe(-1);
  expect(formula.mnSharedId).toBe(-1);
  expect(formula.isValidArrayRef(new ScAddress())).toBe(true);
  expect(formula.isValidSharedRef(new ScAddress())).toBe(true);
  cell.maCellAddr.Set(3, 4, 1);
  cell.mnCellType = token("n");
  cell.mnXfId = 7;
  cell.mbShowPhonetic = true;
  formula.maFormulaRef.assign(new ScRange(3, 4, 1, 7, 8, 1));
  formula.mnFormulaType = token("shared");
  formula.mnSharedId = 9;
  const cellCopy = new CellModel(cell),
    formulaCopy = new CellFormulaModel(formula);
  cell.maCellAddr.IncRow();
  formula.maFormulaRef.aEnd.IncRow();
  expect(cellCopy.maCellAddr.Row()).toBe(4);
  expect(cellCopy.maCellAddr).not.toBe(cell.maCellAddr);
  expect(cellCopy.mnCellType).toBe(token("n"));
  expect(cellCopy.mnXfId).toBe(7);
  expect(cellCopy.mbShowPhonetic).toBe(true);
  expect(formulaCopy.maFormulaRef.aEnd.Row()).toBe(8);
  expect(formulaCopy.maFormulaRef).not.toBe(formula.maFormulaRef);
  expect(formulaCopy.mnFormulaType).toBe(token("shared"));
  expect(formulaCopy.mnSharedId).toBe(9);
});
it("checks array start identity and every original inclusive shared-formula boundary", /** End-sheet mismatch remains outside the implied same-sheet source invariant and is not silently normalized. @returns Nothing. */ () => {
  const formula = new CellFormulaModel();
  formula.maFormulaRef.assign(new ScRange(3, 4, 1, 7, 8, 3));
  expect(formula.isValidArrayRef(new ScAddress(3, 4, 1))).toBe(true);
  expect(formula.isValidArrayRef(new ScAddress(4, 4, 1))).toBe(false);
  for (const address of [new ScAddress(3, 4, 1), new ScAddress(7, 8, 1), new ScAddress(5, 6, 1)])
    expect(formula.isValidSharedRef(address)).toBe(true);
  for (const address of [
    new ScAddress(5, 6, 0),
    new ScAddress(5, 6, 3),
    new ScAddress(2, 6, 1),
    new ScAddress(8, 6, 1),
    new ScAddress(5, 3, 1),
    new ScAddress(5, 9, 1),
  ])
    expect(formula.isValidSharedRef(address)).toBe(false);
});
it("owns table-reference strings and copies all original flags by value", /** Unicode fields are actual counted RTL owners. @returns Nothing. */ () => {
  const table = new DataTableModel(),
    first = unicode("A1\0字😀"),
    second = unicode("B2");
  expect(table.maRef1.isEmpty()).toBe(true);
  expect(table.maRef2.isEmpty()).toBe(true);
  expect([table.mb2dTable, table.mbRowTable, table.mbRef1Deleted, table.mbRef2Deleted]).toEqual([
    false,
    false,
    false,
    false,
  ]);
  table.maRef1.assign(first);
  table.maRef2.assign(second);
  table.mb2dTable = true;
  table.mbRowTable = true;
  table.mbRef1Deleted = true;
  table.mbRef2Deleted = true;
  const copy = new DataTableModel(table);
  try {
    table.maRef1.clear();
    expect(text(copy.maRef1)).toBe("A1\0字😀");
    expect(text(copy.maRef2)).toBe("B2");
    expect([copy.mb2dTable, copy.mbRowTable, copy.mbRef1Deleted, copy.mbRef2Deleted]).toEqual([
      true,
      true,
      true,
      true,
    ]);
    expect(copy.maRef1).not.toBe(table.maRef1);
  } finally {
    copy.dispose();
    table.dispose();
    first.dispose();
    second.dispose();
  }
});
it("expands original equal-style row ranges in both directions and rejects gaps/repeats/style changes", /** Signed-overflow inputs are not admitted. @returns Nothing. */ () => {
  const rows = new XfIdRowRange();
  expect(rows.mnXfId).toBe(-1);
  expect(rows.maRowRange.mnFirst).toBe(-1);
  expect(rows.maRowRange.mnLast).toBe(-1);
  rows.set(4, 7);
  expect(rows.tryExpand(5, 7)).toBe(true);
  expect(rows.tryExpand(3, 7)).toBe(true);
  expect(rows.tryExpand(5, 7)).toBe(false);
  expect(rows.tryExpand(7, 7)).toBe(false);
  expect(rows.tryExpand(6, 8)).toBe(false);
  const copy = new XfIdRowRange(rows);
  rows.set(10, 9);
  expect(copy.maRowRange.mnFirst).toBe(3);
  expect(copy.maRowRange.mnLast).toBe(5);
  expect(copy.mnXfId).toBe(7);
  expect(copy.maRowRange).not.toBe(rows.maRowRange);
});
it("retains source merge overloads, single-row/right-neighbor checks and unchecked sheet identity", /** The worksheet owner is expected to supply same-sheet addresses; this value predicate itself does not check that. @returns Nothing. */ () => {
  const address = new ScAddress(2, 3, 1),
    merge = new MergedRange(address, token("fill"));
  address.IncCol();
  expect(merge.maRange.aStart.Col()).toBe(2);
  expect(merge.tryExpand(new ScAddress(3, 3, 1), token("fill"))).toBe(true);
  expect(merge.tryExpand(new ScAddress(4, 3, 1), token("centerContinuous"))).toBe(false);
  expect(merge.tryExpand(new ScAddress(4, 4, 1), token("fill"))).toBe(false);
  expect(merge.tryExpand(new ScAddress(5, 3, 1), token("fill"))).toBe(false);
  expect(merge.tryExpand(new ScAddress(4, 3, 9), token("fill"))).toBe(true);
  expect(merge.maRange.aEnd.Tab()).toBe(1);
  expect(merge.maRange.aEnd.Col()).toBe(4);
  const copy = new MergedRange(merge);
  expect(copy.mnHorAlign).toBe(token("fill"));
  expect(copy.maRange).not.toBe(merge.maRange);
  const explicit = new MergedRange(new ScRange(2, 3, 1, 4, 4, 1));
  expect(explicit.mnHorAlign).toBe(-1);
  expect(explicit.tryExpand(new ScAddress(5, 3, 1), -1)).toBe(false);
});
