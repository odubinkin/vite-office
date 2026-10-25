/** @fileoverview Native default-sheet block editability consumes actual cells and explicit matrix-admission boundaries. */
import { expect, it } from "vitest";
import { ScEditableTester } from "../inc/editable";
import { ScColumn } from "../../../inc/column";
import { ScDocument } from "../../../inc/document";
import type { ScTable } from "../../../inc/table";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell, ScMatrixMode } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScPatternAttr } from "../../../inc/patattr";
import { MatrixEdge } from "../../../inc/types";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Creates actual default native sheet state. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  return doc;
}
it("retains cumulative tester state and actual missing-sheet/invalid-end defaults", /** Default tester fields and repeated failed states follow source rather than a fake document peer. @returns Nothing. */ () => {
  const doc = document(),
    initial = new ScEditableTester(),
    result: [boolean] = [true];
  expect(initial.IsEditable()).toBe(true);
  expect(initial.IsFormatEditable()).toBe(true);
  const table = doc.FetchTable(0) as ScTable,
    emptyPattern = new ScPatternAttr(doc.getCellAttributeHelper());
  doc.ApplyPattern(0, 0, 0, emptyPattern);
  const fresh = new ScColumn(doc),
    unchanged = fresh.GetPattern(0);
  fresh.ApplyPattern(doc.MaxRow() + 1, emptyPattern);
  expect(fresh.GetPattern(0)).toBe(unchanged);
  fresh.Dispose();
  emptyPattern.Dispose();
  expect(table.IsBlockEditable(0, 0, 0, 0)).toBe(true);
  expect(table.IsBlockEditable(0, 0, doc.MaxCol() + 1, 0)).toBe(false);
  expect(doc.IsBlockEditable(0, 0, 0, 0, 0)).toBe(true);
  expect(doc.IsBlockEditable(0, 0, 0, 0, 0, result, true)).toBe(true);
  expect(result[0]).toBe(false);
  expect(doc.IsBlockEditable(2, 0, 0, 0, 0)).toBe(false);
  result[0] = true;
  expect(doc.IsBlockEditable(2, 0, 0, 0, 0, result)).toBe(false);
  expect(result[0]).toBe(false);
  result[0] = true;
  expect(doc.IsBlockEditable(0, 0, 0, doc.MaxCol() + 1, 0, result)).toBe(false);
  expect(result[0]).toBe(false);
  expect(doc.IsBlockEditable(0, 0, 0, 0, doc.MaxRow() + 1)).toBe(false);
  const tester = ScEditableTester.CreateAndTestBlock(doc, 0, 0, 0, 0, 0);
  expect(tester.IsEditable()).toBe(true);
  tester.TestBlock(doc, 2, 0, 0, 0, 0);
  expect(tester.IsEditable()).toBe(false);
  expect(tester.IsFormatEditable()).toBe(false);
  tester.TestBlock(doc, 0, 0, 0, 0, 0, true);
  expect(tester.IsEditable()).toBe(false);
  doc.Dispose();
});
it("queries real sparse typed blocks and native edge visit shapes without interpreting ordinary formulas", /** Single/multiple columns,full-domain tails and source matrix policies use genuine allocated stores. @returns Nothing. */ () => {
  const doc = document(),
    table = doc.FetchTable(0) as ScTable,
    column = table.CreateColumnIfNotExists(1),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  column.SetValue(0, 9);
  column.SetFormula(1, unicode("=A2+1"), grammar);
  column.SetFormula(2, unicode("=A3+1"), grammar);
  column.SetFormula(4, unicode("=A5+1"), grammar);
  expect(column.GetBlockMatrixEdges(-1, 0, MatrixEdge.Left, false)).toBe(MatrixEdge.Nothing);
  expect(column.GetBlockMatrixEdges(0, doc.MaxRow() + 1, MatrixEdge.Left, false)).toBe(
    MatrixEdge.Nothing,
  );
  expect(column.GetBlockMatrixEdges(4, 3, MatrixEdge.Left, false)).toBe(MatrixEdge.Nothing);
  expect(column.GetBlockMatrixEdges(0, 0, MatrixEdge.Left, false)).toBe(MatrixEdge.Nothing);
  expect(column.GetBlockMatrixEdges(1, 1, MatrixEdge.Left, false)).toBe(MatrixEdge.Nothing);
  expect(
    column.GetBlockMatrixEdges(2, doc.MaxRow(), MatrixEdge.Left | MatrixEdge.Right, false),
  ).toBe(MatrixEdge.Nothing);
  expect(table.HasBlockMatrixFragment(-1, 0, 1, 4)).toBe(false);
  expect(table.HasBlockMatrixFragment(5, 0, 5, 4)).toBe(false);
  expect(table.HasBlockMatrixFragment(1, 0, 1, 4, true)).toBe(false);
  expect(table.HasBlockMatrixFragment(0, 1, doc.MaxCol(), 1, false)).toBe(false);
  expect(table.HasBlockMatrixFragment(0, 0, 1, 4, false)).toBe(false);
  expect(doc.IsBlockEditable(0, 0, 0, 1, 4)).toBe(true);
  expect(column.GetFormulaCell(1)?.GetDirty()).toBe(true);
  doc.Dispose();
});
it("rejects actual matrix-mode owners before unsupported boundary geometry can admit an edit", /** A real formula-cell constructor/token owner is used,without forged stores or virtual service peers. @returns Nothing. */ () => {
  const doc = document(),
    position = new ScAddress(0, 3, 0),
    code = new ScTokenArray(doc),
    cell = new ScFormulaCell(
      doc,
      position,
      code,
      FormulaGrammar.Grammar.GRAM_NATIVE,
      ScMatrixMode.Formula,
    );
  doc.SetFormulaCell(position, cell);
  const column = (doc.FetchTable(0) as ScTable).CreateColumnIfNotExists(0);
  expect(
    /** Original positive matrix-edge family remains explicit. @returns Native edge flags. */ () =>
      column.GetBlockMatrixEdges(3, 3, MatrixEdge.Left, false),
  ).toThrow("matrix edge");
  expect(
    /** Actual block scanning also reaches the original unsupported matrix family. @returns Native edge flags. */ () =>
      column.GetBlockMatrixEdges(0, 5, MatrixEdge.Right, true),
  ).toThrow("matrix edge");
  expect(
    /** Editability never fabricates an empty matrix result. @returns Actual tester. */ () =>
      ScEditableTester.CreateAndTestBlock(doc, 0, 0, 0, 0, 5),
  ).toThrow("matrix edge");
  expect(doc.GetFormulaCell(position)).toBe(cell);
  doc.Dispose();
});
