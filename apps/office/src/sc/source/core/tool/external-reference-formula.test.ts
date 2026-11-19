/** @fileoverview External scalar and range operands through native Calc formula evaluation. */
import { assert, expect, it } from "vitest";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { FormulaError, CreateDoubleError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";

it("uses source values, known blanks and unavailable cells with the native operand rules", /** Evaluates ordinary imported scalar and range operands over canonical cell tokens. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const name = unicode("Local");
  const position = new ScAddress(2, 2, 0);
  const manager = doc.GetExternalRefManager();
  const id = manager.getExternalFileId("file:///External.ods");
  const cache = manager.getCacheTable(id, "Values", true);
  assert(cache);
  try {
    doc.InsertTab(0, name);
    const value = unicode("Text");
    const shared = doc.GetSharedStringPool().intern(value);
    cache.setCell(0, 0, new FormulaDoubleToken(5));
    cache.setCell(0, 1, new FormulaDoubleToken(13));
    cache.setCell(0, 2, new FormulaStringToken(shared));
    cache.setCell(0, 3, new FormulaDoubleToken(CreateDoubleError(FormulaError.DivisionByZero)));
    shared.dispose();
    value.dispose();
    const numericText = unicode("7");
    const sharedNumber = doc.GetSharedStringPool().intern(numericText);
    cache.setCell(0, 5, new FormulaStringToken(sharedNumber));
    sharedNumber.dispose();
    numericText.dispose();
    const ref = "'file:///External.ods'#$Values.";
    expect(manager.hasCellExternalReference(position)).toBe(false);
    for (const [source, expected] of [
      [`${ref}A1+2`, 7],
      [`${ref}A1:.A2+3`, 8],
      [`${ref}A6+1`, 8],
      [`${ref}A6:.A6+1`, 8],
      [`SUM(${ref}A1;${ref}A2:.A3)`, 18],
      [`AVERAGE(${ref}A1:.A3)`, 9],
      [`SUM(${ref}A3)`, 0],
      [`${ref}A1&" units"`, "5 units"],
      [`${ref}A3:.A3&"!"`, "Text!"],
      [`${ref}A1:.A2&"!"`, "!"],
    ] as const) {
      const formula = unicode("=" + source);
      try {
        doc.SetFormula(position, formula, FormulaGrammar.Grammar.GRAM_NATIVE);
        expect(doc.GetErrCode(position), source).toBe(FormulaError.NONE);
        if (typeof expected === "number") expect(doc.GetValue(position), source).toBe(expected);
        else {
          const cell = doc.GetFormulaCell(position);
          assert(cell);
          expect(text(cell.GetString().getString()), source).toBe(expected);
        }
        expect(manager.hasCellExternalReference(position)).toBe(true);
      } finally {
        formula.dispose();
      }
    }
    for (const [source, expected] of [
      [`${ref}A4`, FormulaError.DivisionByZero],
      [`${ref}A4:.A4+1`, FormulaError.DivisionByZero],
      [`SUM(${ref}A1:.A4)`, FormulaError.DivisionByZero],
      [`${ref}A5`, FormulaError.NoRef],
      [`SUM(${ref}A1;${ref}A5)`, FormulaError.NoRef],
      [`SUM(${ref}A1:.A3;${ref}A5)`, FormulaError.NoRef],
      [`${ref}A5+1`, FormulaError.NoRef],
      [`${ref}A5:.A5+1`, FormulaError.NoRef],
      [`${ref}A5:.A5&"!"`, FormulaError.NoRef],
      [`${ref}A5:.A5`, FormulaError.NoRef],
      [`SUM(${ref}A1:.A5)`, FormulaError.NoRef],
      [`'file:///External.ods'#$Missing.A1`, FormulaError.NoRef],
    ] as const) {
      const formula = unicode("=" + source);
      try {
        doc.SetFormula(position, formula, FormulaGrammar.Grammar.GRAM_NATIVE);
        expect(doc.GetErrCode(position), source).toBe(expected);
      } finally {
        formula.dispose();
      }
    }
    cache.setWholeTableCached();
    const empty = unicode(`=${ref}A5+1`);
    try {
      doc.SetFormula(position, empty, FormulaGrammar.Grammar.GRAM_NATIVE);
      expect(doc.GetValue(position)).toBe(1);
    } finally {
      empty.dispose();
    }
  } finally {
    name.dispose();
    doc.Dispose();
  }
});

it("projects an oversized complete cache onto its occupied area for whole-sheet references", /** Replays native bounds, shrinking and invalid-sized matrix handling. @returns Nothing. */ () => {
  const doc = new ScDocument();
  try {
    const cache = doc
      .GetExternalRefManager()
      .getCacheTable(
        doc.GetExternalRefManager().getExternalFileId("file:///External.ods"),
        "Values",
        true,
      );
    assert(cache);
    cache.setWholeTableCached();
    const entire = new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0);
    const small = new ScRange(0, 0, 0, 1, 2, 0);
    expect(cache.getCellRangeData(entire, doc)?.IsEmpty(0, 0)).toBe(true);
    cache.setCell(1, 1, new FormulaDoubleToken(5));
    cache.setCell(2, 2, new FormulaDoubleToken(13));
    cache.setCell(3, 4, new FormulaDoubleToken(22));
    const matrix = cache.getCellRangeData(entire, doc);
    const size = { column: 0, row: 0 };
    matrix?.GetDimensions(size);
    expect(size).toEqual({ column: 3, row: 4 });
    expect(cache.getCellRangeData(small, doc)?.IsEmpty(0, 2)).toBe(true);
    const large = new ScRange(1, 1, 0, doc.MaxCol(), doc.MaxRow(), 0);
    const error = cache.getCellRangeData(large, doc)?.Get(0, 0);
    try {
      expect(error?.GetError()).toBe(FormulaError.MatrixSize);
    } finally {
      error?.dispose();
    }
  } finally {
    doc.Dispose();
  }
});
