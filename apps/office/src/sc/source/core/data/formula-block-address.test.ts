/** @fileoverview Original const column lookup and borrowed formula-block pointer identity used by group listeners. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("borrows real mdds formula block storage at an offset and returns the original full block size", /** No copied pointer vector or secondary cell index is introduced. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const table = doc.FetchTable(0);
  assert(table);
  expect(table.FetchColumn(-1)).toBeNull();
  expect(table.FetchColumn(doc.MaxCol() + 1)).toBeNull();
  expect(table.FetchColumn(5)).toBeNull();
  expect(table.GetAllocatedColumnsCount()).toBe(1);
  for (let row = 3; row <= 5; row++)
    doc.SetFormula(new ScAddress(0, row, 0), unicode("=2"), FormulaGrammar.Grammar.GRAM_NATIVE);
  const column = table.FetchColumn(0);
  assert(column);
  const size: [number] = [99],
    pointer = column.GetFormulaCellBlockAddress(4, size);
  assert(pointer);
  expect(size[0]).toBe(3);
  expect(pointer.get()).toBe(doc.GetFormulaCell(new ScAddress(0, 4, 0)));
  expect(pointer.copy().advance(1).get()).toBe(doc.GetFormulaCell(new ScAddress(0, 5, 0)));
  expect(column.GetFormulaCellBlockAddress(0, size)).toBeNull();
  expect(size[0]).toBe(0);
  for (const row of [-1, doc.MaxRow() + 1]) {
    size[0] = 99;
    expect(column.GetFormulaCellBlockAddress(row, size)).toBeNull();
    expect(size[0]).toBe(0);
  }
  doc.Dispose();
});
