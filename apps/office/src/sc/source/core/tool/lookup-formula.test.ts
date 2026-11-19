/** @fileoverview Native matrix VLOOKUP and HLOOKUP through Calc's formula cells. */
import { assert, expect, it } from "vitest";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";

/** Compiles and puts the formula into the native document. @param doc - Document. @param position - Cell. @param source - Native formula. @returns Nothing. */
function setFormula(doc: ScDocument, position: ScAddress, source: string): void {
  const input = unicode(source);
  try {
    doc.SetFormula(position, input, FormulaGrammar.Grammar.GRAM_NATIVE);
  } finally {
    input.dispose();
  }
}

it("applies native matrix lookup ordering, typing and arity", /** Exercises both search axes, exact matches and the default approximate search. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const name = unicode("Local");
  const pos = new ScAddress(2, 2, 0);
  try {
    doc.InsertTab(0, name);
    doc.SetValue(new ScAddress(0, 0, 0), 2);
    for (const [source, expected] of [
      ["=VLOOKUP(2;{1;11|2;22|2;23|4;40};2;0)", 22],
      ["=VLOOKUP(3;{1;11|2;22|2;23|4;40};2)", 23],
      ['=VLOOKUP(3;{"text";10|2;20|4;40};2;1)', 20],
      ['=VLOOKUP("b";{"Z";10|"B";20|"C";40};2;1)', 20],
      ['=VLOOKUP("b";{"B";20|"b";30};2.9;0)', 20],
      ['=VLOOKUP("b";{"B";"answer"};2;0)', "answer"],
      ['=VLOOKUP("b";{"A";10|"C";20|"B";30};2;0)', 30],
      ['=VLOOKUP("b";{"A";10|"C";20|"B";30};2)', 10],
      ['=HLOOKUP("a";{"A";"B"|21;22};2;0)', 21],
      ["=HLOOKUP(3;{1;2;4|11;22;44};2)", 22],
      ["=HLOOKUP(2;{1;2;2|11;22;23};2;0)", 22],
      ["=VLOOKUP({2};{1;10|2;20};2;0)", 20],
      ["=VLOOKUP(A1;{1;10|2;20};2;0)", 20],
    ] as const) {
      setFormula(doc, pos, source);
      expect(doc.GetErrCode(pos), source).toBe(FormulaError.NONE);
      if (typeof expected === "number") expect(doc.GetValue(pos), source).toBe(expected);
      else {
        const formula = doc.GetFormulaCell(pos);
        assert(formula);
        expect(text(formula.GetString().getString()), source).toBe(expected);
      }
    }
    for (const [source, expected] of [
      ["=VLOOKUP(1;{1;2})", FormulaError.ParameterExpected],
      ["=VLOOKUP(1;{1;2};2;0;0)", FormulaError.IllegalParameter],
      ["=HLOOKUP(1;{1;2};2)", FormulaError.IllegalArgument],
      ["=VLOOKUP(1;{1;2};0)", FormulaError.IllegalArgument],
      ["=VLOOKUP(1;99;1)", FormulaError.IllegalParameter],
      ["=VLOOKUP(0;{1;10|2;20};2)", FormulaError.NotAvailable],
      ['=VLOOKUP("c";{"b";10|1;20};2)', FormulaError.NotAvailable],
      ['=VLOOKUP("2";{2;20};2;0)', FormulaError.NotAvailable],
      ['=VLOOKUP("b*";{"bee";20};2;0)', FormulaError.NotAvailable],
      ["=VLOOKUP(1;{1;2};1;1/0)", FormulaError.DivisionByZero],
    ] as const) {
      setFormula(doc, pos, source);
      expect(doc.GetErrCode(pos), source).toBe(expected);
    }
  } finally {
    name.dispose();
    doc.Dispose();
  }
});

it("retains the distinct exact-search handling of empty horizontal and vertical candidates", /** Checks original matrix empties using the external cache's full-table marker. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const name = unicode("Local");
  const pos = new ScAddress(6, 6, 0);
  const manager = doc.GetExternalRefManager();
  const cache = manager.getCacheTable(
    manager.getExternalFileId("file:///cache.xlsx"),
    "Data",
    true,
  );
  assert(cache);
  try {
    doc.InsertTab(0, name);
    cache.setWholeTableCached();
    cache.setCell(0, 1, new FormulaDoubleToken(21));
    cache.setCell(1, 0, new FormulaDoubleToken(12));
    cache.setCell(1, 1, new FormulaDoubleToken(22));
    const word = unicode("Code");
    const shared = doc.GetSharedStringPool().intern(word);
    cache.setCell(0, 2, new FormulaStringToken(shared));
    shared.dispose();
    word.dispose();
    const ref = "'file:///cache.xlsx'#$Data.";
    setFormula(doc, pos, `=HLOOKUP("";${ref}A1:.B2;2;0)`);
    expect(doc.GetValue(pos)).toBe(21);
    setFormula(doc, pos, `=VLOOKUP("";${ref}A1:.B2;2;0)`);
    expect(doc.GetErrCode(pos)).toBe(FormulaError.NotAvailable);
    setFormula(doc, pos, `=VLOOKUP(${ref}A2;${ref}A2;1;0)`);
    expect(doc.GetValue(pos)).toBe(21);
    setFormula(doc, pos, `=VLOOKUP(21;${ref}A2:.A2;1;0)`);
    expect(doc.GetValue(pos)).toBe(21);
    setFormula(doc, pos, `=VLOOKUP(21;${ref}A1;1;0)`);
    expect(doc.GetErrCode(pos)).toBe(FormulaError.NotAvailable);
    setFormula(doc, pos, `=VLOOKUP("code";${ref}A3;1;0)`);
    const formula = doc.GetFormulaCell(pos);
    assert(formula);
    expect(text(formula.GetString().getString())).toBe("Code");
    setFormula(doc, pos, `=VLOOKUP(21;'file:///cache.xlsx'#$Missing.A1;1;0)`);
    expect(doc.GetErrCode(pos)).toBe(FormulaError.NoRef);
  } finally {
    name.dispose();
    doc.Dispose();
  }
});
