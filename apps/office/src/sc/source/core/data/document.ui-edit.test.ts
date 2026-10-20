/** @fileoverview Native compiled-cell adoption and sheet deletion required by actual Calc UI history. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("adopts actual compiled formula owners and disposes deleted-sheet subscriptions before renumbering", /** Uses original core storage and dependency queues. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(1, 0, 0),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  doc.InsertTab(0, unicode("A"));
  doc.InsertTab(1, unicode("B"));
  doc.InsertTab(2, unicode("C"));
  doc.SetValue(new ScAddress(), 2);
  const cell = new ScFormulaCell(doc, pos, unicode("=A1+3"), grammar);
  expect(doc.SetFormulaCell(pos, cell)).toBe(cell);
  expect(doc.GetValue(pos)).toBe(5);
  const copy = new ScFormulaCell(doc, pos, new ScTokenArray(cell.GetCode()), grammar);
  expect(doc.SetFormulaCell(pos, copy)).toBe(copy);
  expect(doc.GetFormulaCell(pos)).toBe(copy);
  for (const invalid of [new ScAddress(-1, 0, 0), new ScAddress(0, -1, 0), new ScAddress(0, 0, 99)])
    expect(doc.SetFormulaCell(invalid, copy)).toBeNull();
  expect(doc.FetchTable(0)?.CreateColumnIfNotExists(0).SetFormulaCell(-1, copy)).toBeNull();
  doc.SetValue(new ScAddress(0, 0, 1), 10);
  doc.SetFormula(new ScAddress(1, 0, 1), unicode("=A1*2"), grammar);
  const removed = doc.GetFormulaCell(new ScAddress(1, 0, 1));
  doc.SetValue(new ScAddress(0, 0, 2), 20);
  doc.SetFormula(new ScAddress(1, 0, 2), unicode("=A1*3"), grammar);
  expect(doc.DeleteTab(-1)).toBe(false);
  expect(doc.DeleteTab(99)).toBe(false);
  expect(doc.DeleteTab(1)).toBe(true);
  expect(removed && doc.IsInFormulaTree(removed)).toBe(false);
  expect(doc.GetFormulaCell(new ScAddress(1, 0, 1))?.aPos.Tab()).toBe(1);
  doc.SetValue(new ScAddress(0, 0, 1), 30);
  expect(doc.GetValue(new ScAddress(1, 0, 1))).toBe(90);
  expect(doc.DeleteTab(0)).toBe(true);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(90);
  expect(doc.DeleteTab(0)).toBe(false);
});
