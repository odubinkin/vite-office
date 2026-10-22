/** @fileoverview Native detached formula relocation, reference ordering and token ownership contracts. */
import { expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScFormulaCell } from "../../../inc/formulacell";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("relocates mixed relative and absolute references through tokens and adopts dependency listeners only on insertion", /** Original copy retains its cached value until the document inserts and dirties it. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const sourcePosition = new ScAddress(2, 2, 0),
    destination = new ScAddress(3, 3, 0),
    grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
  doc.SetValue(new ScAddress(0, 0, 0), 2);
  doc.SetValue(new ScAddress(0, 1, 0), 3);
  doc.SetValue(new ScAddress(1, 0, 0), 5);
  doc.SetValue(new ScAddress(1, 1, 0), 7);
  doc.SetFormula(sourcePosition, unicode("=A1+$A1+A$1+$A$1"), grammar);
  const source = doc.GetFormulaCell(sourcePosition) as ScFormulaCell;
  expect(source.GetValue()).toBe(8);
  const copy = source.Clone(destination);
  expect(text(copy.GetFormula(grammar))).toBe("=B2+$A2+B$1+$A$1");
  expect(copy.GetCode()).not.toBe(source.GetCode());
  expect(copy.GetCode().GetArray()?.[0]).not.toBe(source.GetCode().GetArray()?.[0]);
  expect(copy.GetValue()).toBe(8);
  expect(copy.GetDirty()).toBe(false);
  doc.SetValue(new ScAddress(1, 1, 0), 11);
  expect(copy.GetDirty()).toBe(false);
  doc.SetFormulaCell(destination, copy);
  expect(doc.GetValue(destination)).toBe(21);
  doc.SetValue(new ScAddress(1, 0, 0), 13);
  expect(copy.GetDirty()).toBe(true);
  expect(doc.GetValue(destination)).toBe(29);
  expect(doc.GetValue(sourcePosition)).toBe(8);
});

it("orders mixed range endpoints at the new position without changing source tokens", /** Moving an absolute/relative endpoint across the other swaps native coordinate flags. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const grammar = FormulaGrammar.Grammar.GRAM_NATIVE,
    source = new ScFormulaCell(doc, new ScAddress(2, 2, 0), unicode("=SUM(A1:$B$2)"), grammar),
    copy = source.Clone(new ScAddress(5, 5, 0));
  expect(text(source.GetFormula(grammar))).toBe("=SUM(A1:$B$2)");
  expect(text(copy.GetFormula(grammar))).toBe("=SUM($B$2:D4)");
  source.Dispose();
  copy.Dispose();
});

it("retains cached values on detached out-of-bounds copies and reports the native reference error after adoption", /** Relative coordinates remain relative rather than being clamped to the sheet. @returns Nothing. */ () => {
  for (const bottom of [false, true]) {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    const sourcePosition = bottom ? new ScAddress() : new ScAddress(1, 0, 0),
      input = bottom ? new ScAddress(0, 1, 0) : new ScAddress(),
      destination = bottom ? new ScAddress(0, doc.MaxRow(), 0) : new ScAddress();
    doc.SetValue(input, 4);
    doc.SetFormula(
      sourcePosition,
      unicode(bottom ? "=A2*2" : "=A1*2"),
      FormulaGrammar.Grammar.GRAM_NATIVE,
    );
    const source = doc.GetFormulaCell(sourcePosition) as ScFormulaCell;
    expect(source.GetValue()).toBe(8);
    const copy = source.Clone(destination);
    expect(copy.GetValue()).toBe(8);
    expect(copy.GetDirty()).toBe(false);
    doc.SetFormulaCell(destination, copy);
    expect(copy.GetErrCode()).toBe(FormulaError.NoRef);
    expect(copy.GetDirty()).toBe(false);
    doc.Dispose();
  }
});
