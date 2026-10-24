/** @fileoverview Native AutoCalcSwitch identity,nested lifetime and real formula dependency behavior. */
import { assert, expect, it } from "vitest";
import { AutoCalcSwitch } from "../../../inc/scopetools";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Constructs a real native sheet. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument(),
    name = unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  return doc;
}
it("retains native source/destination identities and both original policy values across nested scopes", /** Restoration does not force every document into automatic calculation. @returns Nothing. */ () => {
  const source = document(),
    destination = document();
  source.SetAutoCalc(false);
  const outer = new AutoCalcSwitch(source, true);
  try {
    expect(source.GetAutoCalc()).toBe(true);
    expect(destination.GetAutoCalc()).toBe(true);
    const inner = new AutoCalcSwitch(source, false),
      receiving = new AutoCalcSwitch(destination, false);
    try {
      expect(source.GetAutoCalc()).toBe(false);
      expect(destination.GetAutoCalc()).toBe(false);
    } finally {
      receiving.Dispose();
      inner.Dispose();
    }
    expect(source.GetAutoCalc()).toBe(true);
    expect(destination.GetAutoCalc()).toBe(true);
  } finally {
    outer.Dispose();
  }
  expect(source.GetAutoCalc()).toBe(false);
  source.Dispose();
  destination.Dispose();
});
it("restores calculation after an exceptional operation without rolling back real document edits", /** Original scope state and document content have separate ownership. @returns Nothing. */ () => {
  const doc = document();
  try {
    expect(
      /** Runs an interrupted native operation under its real scope. @returns Nothing. */ () => {
        const scope = new AutoCalcSwitch(doc, false);
        try {
          doc.SetValue(new ScAddress(), 17);
          expect(doc.GetAutoCalc()).toBe(false);
          throw new Error("operation interrupted");
        } finally {
          scope.Dispose();
        }
      },
    ).toThrow("operation interrupted");
    expect(doc.GetAutoCalc()).toBe(true);
    expect(doc.GetValue(new ScAddress())).toBe(17);
    doc.SetAutoCalc(false);
    const scope = new AutoCalcSwitch(doc, false);
    scope.Dispose();
    expect(doc.GetAutoCalc()).toBe(false);
  } finally {
    doc.Dispose();
  }
});
it("preserves genuine compiled dependencies and the document's native setter on scope exit", /** No alternate evaluator or synthetic formula result supplies the restored value. @returns Nothing. */ () => {
  const doc = document(),
    input = unicode("=B1+1"),
    table = doc.FetchTable(0);
  assert(table);
  try {
    doc.SetValue(new ScAddress(1, 0, 0), 2);
    table.SetFormula(0, 0, input, FormulaGrammar.Grammar.GRAM_NATIVE);
    expect(doc.GetValue(new ScAddress())).toBe(3);
    const cell = doc.GetFormulaCell(new ScAddress());
    assert(cell);
    const code = cell.GetCode(),
      scope = new AutoCalcSwitch(doc, false);
    try {
      doc.SetValue(new ScAddress(1, 0, 0), 4);
      expect(doc.GetAutoCalc()).toBe(false);
    } finally {
      scope.Dispose();
    }
    expect(doc.GetAutoCalc()).toBe(true);
    expect(doc.GetFormulaCell(new ScAddress())?.GetCode()).toBe(code);
    expect(doc.GetValue(new ScAddress())).toBe(5);
  } finally {
    input.dispose();
    doc.Dispose();
  }
});
