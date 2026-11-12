/** @fileoverview Original import formula overloads, native default constructors, cached results and real shared-group replacement. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScDocumentImport } from "../../../inc/documentimport";
import { ScAddress } from "../../../inc/address";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScTokenArray } from "../../../inc/tokenarray";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
/** Actual Calc document and distinct initial sheet. @returns Document. */
function document(): ScDocument {
  const doc = new ScDocument(),
    name = unicode("Import");
  try {
    doc.InsertTab(0, name);
  } finally {
    name.dispose();
  }
  return doc;
}
it("retains empty-constructor clean state and native default-grammar source/token construction", /** Native overload defaults are independent of importer policy. @returns Nothing. */ () => {
  const doc = document(),
    pos = new ScAddress(),
    empty = new ScFormulaCell(doc, pos),
    source = unicode("=1+2"),
    formula = new ScFormulaCell(doc, pos, source),
    tokens = new ScTokenArray(doc);
  tokens.AddDouble(42);
  const adopted = new ScFormulaCell(doc, pos, tokens);
  try {
    expect(empty.GetDirty()).toBe(false);
    expect(empty.GetCode().GetLen()).toBe(0);
    expect(formula.GetDirty()).toBe(true);
    expect(formula.GetValue()).toBe(3);
    expect(adopted.GetCode()).toBe(tokens);
    expect(adopted.GetValue()).toBe(42);
  } finally {
    source.dispose();
    empty.Dispose();
    formula.Dispose();
    adopted.Dispose();
    doc.Dispose();
  }
});
it.each(["cached", "", "a\0b\n字"])(
  "keeps the original hybrid string cache %s until lazy calculation",
  /** Import never clears dirty state merely because a cache is present. @param cached - Actual stored Unicode value. @returns Nothing. */ (
    cached,
  ) => {
    const doc = document(),
      importer = new ScDocumentImport(doc),
      formula = unicode("=1+2"),
      result = unicode(cached),
      pos = new ScAddress();
    doc.SetAutoCalc(false);
    try {
      importer.setFormulaCell(pos, formula, grammar, result);
      const cell = doc.GetFormulaCell(pos);
      assert(cell);
      expect(cell.GetDirty()).toBe(true);
      expect(text(cell.GetString().getString())).toBe(cached);
      importer.finalize();
      expect(text(cell.GetString().getString())).toBe(cached);
      doc.SetAutoCalc(true);
      expect(doc.GetValue(pos)).toBe(3);
      expect(cell.GetDirty()).toBe(false);
    } finally {
      formula.dispose();
      result.dispose();
      doc.Dispose();
    }
  },
);
it("adopts actual tokens at the native default grammar and initializes them only on finalization", /** No normal editing setter or second formula model participates. @returns Nothing. */ () => {
  const doc = document(),
    importer = new ScDocumentImport(doc),
    pos = new ScAddress(1, 2, 0),
    tokens = new ScTokenArray(doc);
  tokens.AddDouble(17);
  try {
    importer.setFormulaCell(pos, tokens);
    const cell = doc.GetFormulaCell(pos);
    assert(cell);
    expect(cell.GetCode()).toBe(tokens);
    expect(tokens.GetCodeLen()).toBe(1);
    expect(doc.FetchTable(0)?.FetchColumn(1)?.GetCellTextAttr(2)).toBeNull();
    importer.finalize();
    expect(doc.GetValue(pos)).toBe(17);
  } finally {
    doc.Dispose();
  }
});
it.each([0, 2, 4])(
  "unshares a real imported formula group before replacing raw cell at row %s",
  /** Uses source group construction and public cell state; no private group graph is fabricated. @param replacedRow - Native group member. @returns Nothing. */ (
    replacedRow,
  ) => {
    const doc = document(),
      importer = new ScDocumentImport(doc);
    try {
      for (let row = 0; row < 5; ++row) {
        const formula = unicode(`=A${row + 1}*2`);
        try {
          importer.setFormulaCell(new ScAddress(1, row, 0), formula, grammar);
        } finally {
          formula.dispose();
        }
        importer.setNumericCell(new ScAddress(0, row, 0), row + 1);
      }
      importer.finalize();
      expect(doc.GetFormulaCell(new ScAddress(1, 0, 0))?.GetSharedLength()).toBe(5);
      const pos = new ScAddress(1, replacedRow, 0),
        source = unicode("=99"),
        raw = new ScFormulaCell(doc, pos, source, grammar);
      source.dispose();
      importer.setFormulaCell(pos, raw);
      expect(doc.GetFormulaCell(pos)).toBe(raw);
      for (let row = 0; row < 5; ++row) {
        const cell = doc.GetFormulaCell(new ScAddress(1, row, 0));
        assert(cell);
        expect(doc.GetValue(cell.aPos)).toBe(row === replacedRow ? 99 : (row + 1) * 2);
        if (row !== replacedRow && cell.IsShared()) {
          expect(cell.GetSharedLength()).toBeLessThan(5);
          expect(cell.GetCellGroup()?.mpTopCell).not.toBeNull();
        }
      }
      importer.finalize();
      expect(doc.GetValue(pos)).toBe(99);
    } finally {
      doc.Dispose();
    }
  },
);
it("leaves rejected raw formulas caller-owned and accepts every source result overload's ordinary rejection", /** Rejection precedes compilation and target column allocation. @returns Nothing. */ () => {
  const doc = document(),
    importer = new ScDocumentImport(doc),
    formula = unicode("=7"),
    cached = unicode("saved"),
    pos = new ScAddress(0, 0, 99),
    raw = new ScFormulaCell(doc, pos, formula, grammar);
  try {
    for (const target of [pos, new ScAddress(doc.MaxCol() + 1, 0, 0)]) {
      importer.setFormulaCell(target, raw);
      importer.setFormulaCell(target, formula, grammar, cached);
      const tokens = new ScTokenArray(doc);
      tokens.AddDouble(7);
      importer.setFormulaCell(target, tokens);
    }
    expect(raw.GetCode().GetLen()).toBe(1);
    expect(doc.GetFormulaCell(new ScAddress())).toBeNull();
  } finally {
    raw.Dispose();
    formula.dispose();
    cached.dispose();
    doc.Dispose();
  }
});

import { FormulaByteToken, FormulaStringToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";
/** Actual well-formed precompiled single-argument WEBSERVICE expression; it is never evaluated or sent to an external service. @param doc - Native document. @returns Transferred token array. */
function webservice(doc: ScDocument): ScTokenArray {
  const code = new ScTokenArray(doc),
    url = unicode("https://example.invalid/value"),
    shared = new SharedString(url);
  try {
    const argument = new FormulaStringToken(shared),
      operation = new FormulaByteToken(OpCode.ocWebservice, 1);
    code.AddToken(operation);
    code.AddOpCode(OpCode.ocOpen);
    code.AddToken(argument);
    code.AddOpCode(OpCode.ocClose);
    code.CreateNewRPNArrayFromData([argument, operation], 2);
    return code;
  } finally {
    shared.dispose();
    url.dispose();
  }
}
it.each(["tokens", "raw"] as const)(
  "checks link-formula policy on the original %s transfer route",
  /** Valid native tokens trigger only the document's existing inspection flag. @param route - Native overload. @returns Nothing. */ (
    route,
  ) => {
    const doc = document(),
      importer = new ScDocumentImport(doc),
      pos = new ScAddress(),
      code = webservice(doc);
    doc.SetAutoCalc(false);
    try {
      expect(doc.HasLinkFormulaNeedingCheck()).toBe(false);
      if (route === "tokens") importer.setFormulaCell(pos, code);
      else importer.setFormulaCell(pos, new ScFormulaCell(doc, pos, code, grammar));
      expect(doc.HasLinkFormulaNeedingCheck()).toBe(true);
      expect(doc.GetFormulaCell(pos)?.GetCode()).toBe(code);
    } finally {
      doc.Dispose();
    }
  },
);
