/** @fileoverview Real document-to-formula-cell numeric arithmetic integration. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, MAXROW } from "../../../inc/address";
import { ScColumn } from "../../../inc/column";
import { CellType } from "../../../inc/global";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;

it("edits actual numeric formula cells with lazy results and no separate grid", /** Covers arithmetic source-to-token/RPN-to-result with native precedence. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(0, 0, 0);
  doc.InsertTab(0, unicode("Data"));
  for (const [source, value] of [
    ["=1+2*3", 7],
    ["=(1+2)*3", 9],
    ["=2^3^2", 64],
    ["=-2^2", 4],
    ["=-8^(1/3)", -2],
    ["=2^-3", 0.125],
    ["=25%", 0.25],
    ["=8/2-3", 1],
    ["==1.2E2 + .5", 120.5],
    ["  =1+2  ", 3],
    ["=(1+2", 3],
    ["=1\t+\n2\r", 3],
    ["=0.3-0.2-0.1", 0],
    ["=1+-2", -1],
    ["=--2", 2],
  ] as const) {
    doc.SetFormula(pos, unicode(source), grammar);
    const cell = doc.GetFormulaCell(pos);
    expect(cell?.GetDirty()).toBe(true);
    expect(doc.GetCellType(pos)).toBe(CellType.CELLTYPE_FORMULA);
    expect(cell?.IsValue()).toBe(true);
    expect(doc.GetValue(pos)).toBeCloseTo(value, 14);
    expect(cell?.GetDirty()).toBe(false);
    expect(doc.GetErrCode(pos)).toBe(FormulaError.NONE);
    expect(cell?.GetCode().GetCodeLen()).toBeGreaterThan(0);
    expect(doc.GetSharedString(pos).getLength()).toBe(0);
    expect(doc.GetValue(pos)).toBeCloseTo(value, 14);
  }
  expect(doc.GetNonThreadedContext().mpDoc).toBe(doc);
  expect(doc.GetNonThreadedContext().mpFormatter).toBeNull();
  expect(doc.GetNonThreadedContext().pInterpreter).toBeNull();
  expect(doc.GetSheetLimits().MaxRow()).toBe(MAXROW);
  doc.SetValue(pos, 5);
  expect(doc.GetFormulaCell(pos)).toBeNull();
  expect(doc.GetErrCode(pos)).toBe(FormulaError.NONE);
  doc.SetFormula(pos, unicode("=3"), grammar);
  doc.SetEmptyCell(pos);
  expect(doc.GetCellType(pos)).toBe(CellType.CELLTYPE_NONE);
});

it("preserves compiler/runtime errors and explicit unsupported boundaries", /** Failed formulas have native zero numeric projection and original error IDs. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(0, 0, 0);
  doc.InsertTab(0, unicode("Data"));
  for (const [source, error] of [
    ["=1/0", FormulaError.DivisionByZero],
    ["=1+", FormulaError.UnknownToken],
    ["=()", FormulaError.ParameterExpected],
    ["=1)", FormulaError.PairExpected],
    ["=1 2", FormulaError.OperatorExpected],
    ["=1e999", FormulaError.IllegalArgument],
    ["=1e308*1e308", FormulaError.IllegalFPOperation],
    ["=(-2)^.5", FormulaError.IllegalFPOperation],
  ] as const) {
    doc.SetFormula(pos, unicode(source), grammar);
    expect(doc.GetErrCode(pos)).toBe(error);
    expect(doc.GetValue(pos)).toBe(0);
    expect(doc.GetFormulaCell(pos)?.GetDirty()).toBe(false);
  }
  const original = doc.GetFormulaCell(pos);
  expect(
    /** Rejects the explicitly missing reference scanner. @returns Nothing. */ () =>
      doc.SetFormula(pos, unicode("=A1+1"), grammar),
  ).toThrow(/not implemented/);
  expect(doc.GetFormulaCell(pos)).toBe(original);
  expect(
    /** Rejects missing localized grammar/formatter. @returns Nothing. */ () =>
      doc.SetFormula(pos, unicode("=1"), FormulaGrammar.Grammar.GRAM_DEFAULT),
  ).toThrow(/ODFF/);
});

it("tracks actual formula blocks and updates positions when a sheet is inserted", /** Native block events count splits/merges, not formula objects or memory lifetimes. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    column = new ScColumn(doc);
  column.Init(0, 0);
  column.SetFormula(0, unicode("=1"), grammar);
  column.SetFormula(1, unicode("=2"), grammar);
  expect(column.mnBlkCountFormula).toBe(1);
  column.SetFormula(3, unicode("=3"), grammar);
  expect(column.mnBlkCountFormula).toBe(2);
  column.SetValue(1, 4);
  expect(column.GetFormulaCell(1)).toBeNull();
  column.Delete(0);
  column.Delete(3);
  expect(column.mnBlkCountFormula).toBe(0);
  column.SetFormula(-1, unicode("=5"), grammar);
  expect(column.mnBlkCountFormula).toBe(0);
  doc.InsertTab(0, unicode("Data"));
  doc.SetFormula(new ScAddress(2, MAXROW, 0), unicode("=6"), grammar);
  const cell = doc.GetFormulaCell(new ScAddress(2, MAXROW, 0));
  doc.InsertTab(0, unicode("First"));
  expect(cell?.aPos.Tab()).toBe(1);
  expect(doc.GetValue(new ScAddress(2, MAXROW, 1))).toBe(6);
  for (const invalid of [
    new ScAddress(-1, 0, 0),
    new ScAddress(0, -1, 0),
    new ScAddress(0, 0, 99),
  ]) {
    doc.SetFormula(invalid, unicode("=1"), grammar);
    expect(doc.GetFormulaCell(invalid)).toBeNull();
    expect(doc.GetErrCode(invalid)).toBe(FormulaError.NONE);
  }
});
