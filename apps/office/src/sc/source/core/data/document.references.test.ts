/** @fileoverview Actual document references, shared broadcasters and native logical formula tracking. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { CellType } from "../../../inc/global";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;

it("invalidates and lazily recalculates native reference chains through actual broadcasters", /** No graph Map, global cell scan or alternate model participates. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    c = new ScAddress(2, 0, 0);
  doc.InsertTab(0, unicode("Data"));
  doc.SetValue(a, 3);
  doc.SetFormula(b, unicode("=[.A1]+1"), grammar);
  doc.SetFormula(c, unicode("=[.B1]*2"), grammar);
  const fb = doc.GetFormulaCell(b),
    fc = doc.GetFormulaCell(c);
  expect(fb?.HasBroadcaster()).toBe(true);
  expect(doc.GetBroadcaster(a)?.HasListeners()).toBe(true);
  expect(doc.GetValue(c)).toBe(8);
  expect(fb?.GetDirty()).toBe(false);
  expect(fc?.GetDirty()).toBe(false);
  expect(doc.GetFormulaCodeInTree()).toBe(0);
  doc.SetValue(a, 7);
  expect(fb?.GetDirty()).toBe(true);
  expect(fc?.GetDirty()).toBe(true);
  expect(doc.GetFormulaCodeInTree()).toBeGreaterThan(0);
  expect(doc.GetValue(c)).toBe(16);
  expect(doc.GetFormulaCodeInTree()).toBe(0);
  doc.SetFormula(b, unicode("=[.$A$1]+[.A1]"), grammar);
  expect(doc.GetBroadcaster(a)?.GetAllListeners().length).toBe(1);
  expect(doc.GetValue(c)).toBe(28);
  doc.SetEmptyCell(a);
  expect(doc.GetValue(c)).toBe(0);
  doc.SetValue(b, 10);
  expect(doc.GetBroadcaster(a)).toBeNull();
  expect(doc.GetValue(c)).toBe(20);
  doc.SetEmptyCell(c);
  expect(doc.GetFormulaCodeInTree()).toBe(0);
  expect(doc.GetBroadcaster(b)).toBeNull();
});

it("resolves absolute/relative data and actual string/empty reference results", /** Keeps native formula GetString separate from document GetSharedString. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0),
    c = new ScAddress(2, 0, 0);
  doc.InsertTab(0, unicode("Data"));
  doc.SetFormula(b, unicode("=[.A1]"), grammar);
  doc.SetFormula(c, unicode("=[.B1]"), grammar);
  expect(doc.GetValue(c)).toBe(0);
  expect(doc.GetFormulaCell(b)?.IsEmpty()).toBe(true);
  expect(doc.GetFormulaCell(c)?.IsEmpty()).toBe(true);
  doc.SetTextCell(a, unicode("hello"));
  expect(
    text(
      (doc.GetFormulaCell(c) as NonNullable<ReturnType<ScDocument["GetFormulaCell"]>>)
        .GetString()
        .getString(),
    ),
  ).toBe("hello");
  expect(doc.GetFormulaCell(c)?.IsValue()).toBe(false);
  expect(doc.GetSharedString(c).getLength()).toBe(0);
  const value = new ScRefCellValue(doc, b);
  expect(value.getType()).toBe(CellType.CELLTYPE_FORMULA);
  expect(value.getFormula()).toBe(doc.GetFormulaCell(b));
  expect(value.hasString()).toBe(true);
  doc.SetValue(a, 9);
  expect(doc.GetValue(c)).toBe(9);
  expect(doc.GetFormulaCell(c)?.IsValue()).toBe(true);
  doc.InsertTab(0, unicode("First"));
  expect(doc.GetFormulaCell(new ScAddress(1, 0, 1))?.aPos.Tab()).toBe(1);
  doc.SetValue(new ScAddress(0, 0, 1), 11);
  expect(doc.GetValue(new ScAddress(2, 0, 1))).toBe(11);
});

it("preserves source error/cycle handling and detaches stale formulas", /** A source edit breaks cycles through real reciprocal subscriptions. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    a = new ScAddress(0, 0, 0),
    b = new ScAddress(1, 0, 0);
  doc.InsertTab(0, unicode("Data"));
  doc.SetFormula(a, unicode("=[.B1]+1"), grammar);
  doc.SetFormula(b, unicode("=[.A1]+1"), grammar);
  expect(doc.GetErrCode(a)).toBe(FormulaError.CircularReference);
  expect(doc.GetValue(b)).toBe(0);
  doc.SetValue(b, 5);
  expect(doc.GetValue(a)).toBe(6);
  expect(doc.GetErrCode(a)).toBe(FormulaError.NONE);
  doc.SetFormula(b, unicode("=1/0"), grammar);
  expect(doc.GetErrCode(a)).toBe(FormulaError.DivisionByZero);
  doc.SetFormula(a, unicode("=[.A1]"), grammar);
  expect(doc.GetErrCode(a)).toBe(FormulaError.CircularReference);
  doc.SetTextCell(a, unicode("2"));
  doc.SetFormula(b, unicode("=[.A1]+1"), grammar);
  expect(
    /** Refuses a fake replacement for the missing native LOCALE formatter. @returns Number. */ () =>
      doc.GetValue(b),
  ).toThrow(/Locale/);
});
