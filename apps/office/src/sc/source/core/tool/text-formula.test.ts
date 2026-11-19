/** @fileoverview Original Calc scalar concatenation and reference-string coercion. */
import { assert, expect, it } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScDocOptions } from "./docoptio";

const grammar = FormulaGrammar.Grammar.GRAM_OOXML;

/** Compiles actual source and returns the owned document cell. @param doc - Workbook. @param pos - Destination. @param expression - XLSX expression. @returns Formula cell. */
function setFormula(doc: ScDocument, pos: ScAddress, expression: string) {
  const source = unicode(expression);
  try {
    doc.SetFormula(pos, source, grammar);
  } finally {
    source.dispose();
  }
  const cell = doc.GetFormulaCell(pos);
  assert(cell);
  return cell;
}

it("uses the native precedence, missing parameters and scalar string coercion for both operators", /** Tests the Calc interpreter over the actual RPN from both concatenation owners. @returns Nothing. */ () => {
  const document = new ScDocument();
  const name = unicode("Sheet");
  const result = new ScAddress(2, 0, 0);
  try {
    document.InsertTab(0, name);
    document.SetValue(new ScAddress(0, 0, 0), 12.5);
    const source = new ScAddress(1, 0, 0);
    setFormula(document, source, '="x"');
    for (const [expression, expected] of [
      ['=CONCATENATE(" ",,A1,B1,," ",2,"""")', ' 12.5x 2"'],
      ['="p"&2+3&CONCATENATE("a","z")', "p5az"],
      ['=CONCATENATE(A1:A3,"!",C3)', "12.5!"],
      ["=CONCATENATE()", ""],
    ] as const) {
      const cell = setFormula(document, result, expression);
      expect(cell.GetErrCode()).toBe(FormulaError.NONE);
      expect(text(cell.GetString().getString())).toBe(expected);
    }
    const cell = setFormula(document, result, '=CONCATENATE(A1,B1,"!")');
    setFormula(document, source, '="changed"');
    expect(text(cell.GetString().getString())).toBe("12.5changed!");
    setFormula(document, source, "=7+1");
    expect(text(cell.GetString().getString())).toBe("12.58!");
    setFormula(document, source, "=1/0");
    expect(cell.GetErrCode()).toBe(FormulaError.DivisionByZero);
    expect(setFormula(document, result, '="p"&#REF!').GetErrCode()).toBe(FormulaError.NoRef);
    expect(setFormula(document, result, '=CONCATENATE("p",1/0)').GetErrCode()).toBe(
      FormulaError.DivisionByZero,
    );
  } finally {
    name.dispose();
    document.Dispose();
  }
});

it("removes line breaks from XLSX cell references while preserving literal and formula-result breaks", /** Compares document option defaults with original compatibility mode. @returns Nothing. */ () => {
  const document = new ScDocument();
  const sheet = unicode("Sheet");
  const multiline = unicode("alpha\nbeta");
  try {
    document.InsertTab(0, sheet);
    document.SetString(new ScAddress(0, 0, 0), multiline);
    const rich = document.GetEditEngine();
    rich.SetText(multiline);
    document.SetEditText(new ScAddress(1, 0, 0), rich.CreateTextObject());
    setFormula(document, new ScAddress(2, 0, 0), '="c\nd"');
    const result = new ScAddress(3, 0, 0);
    expect(text(setFormula(document, result, "=A1").GetString().getString())).toBe("alpha\nbeta");
    expect(
      text(setFormula(document, result, '=CONCATENATE(A1,"|",B1,"|",C1)').GetString().getString()),
    ).toBe("alpha\nbeta|alpha\nbeta|c\nd");
    const options = new ScDocOptions(document.GetDocOptions());
    options.SetIgnoreLineBreaks(true);
    document.SetDocOptions(options);
    expect(
      text(setFormula(document, result, '=A1&"|"&B1&"|"&C1&"\nliteral"').GetString().getString()),
    ).toBe("alphabeta|alphabeta|c\nd\nliteral");
  } finally {
    multiline.dispose();
    sheet.dispose();
    document.Dispose();
  }
});
