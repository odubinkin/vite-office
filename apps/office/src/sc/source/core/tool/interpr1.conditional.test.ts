/** @fileoverview Native scalar worksheet conditional aggregates through compiler and document recalculation. */
import { assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScDocOptions } from "./docoptio";

const grammar = FormulaGrammar.Grammar.GRAM_OOXML;

it("evaluates Excel criteria, mapped ranges, extrema and range validation", /** Drives native criteria and result geometry through actual formula recalculation. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const output = new ScAddress(4, 0);
  const sheet = unicode("Sheet1");
  const rates = unicode("Rates");
  try {
    const options = new ScDocOptions(doc.GetDocOptions());
    options.SetFormulaWildcardsEnabled(true);
    doc.SetDocOptions(options);
    doc.InsertTab(0, sheet);
    doc.InsertTab(1, rates);
    for (const [row, value] of [0, 5, 2, 8].entries()) doc.SetValue(new ScAddress(0, row), value);
    for (const [row, value] of [10, 20, 30, 40, 50].entries())
      doc.SetValue(new ScAddress(1, row), value);
    for (const [row, value] of ["keep", "skip", "keep", "keep"].entries()) {
      const label = unicode(value);
      try {
        doc.SetString(new ScAddress(2, row), label);
      } finally {
        label.dispose();
      }
      doc.SetValue(new ScAddress(0, row, 1), 100 + row);
    }
    doc.SetValue(new ScAddress(1, 6), Number.MAX_VALUE);
    doc.SetValue(new ScAddress(1, 7), -Number.MAX_VALUE);
    const errorValue = unicode("1/0");
    try {
      doc.SetFormula(new ScAddress(1, 8), errorValue, grammar);
    } finally {
      errorValue.dispose();
    }

    for (const [formula, expected] of [
      ['AVERAGEIF(A1:A4,">=2",B1)', 30],
      ['AVERAGEIF(A1:A4,">=2")', 5],
      ['AVERAGEIF(A1:A4,"<=2",Rates!A1)', 101],
      ['AVERAGEIF(A1:A5,"=",B1)', 50],
      ['AVERAGEIF(A1:A5,"<>",B1)', 25],
      ['AVERAGEIF(A1:A5,"",B1)', 50],
      ["AVERAGEIF(A1:A5,A5,B1)", 10],
      ["AVERAGEIF(A1:A5,,B1)", 10],
      ['_xlfn.MINIFS(B1:B4,A1:A4,">0",C1:C4,"k*")', 30],
      ['_xlfn.MAXIFS(B1:B4,A1:A4,">0",C1:C4,"k*")', 40],
      ["_xlfn.MINIFS(B1:B4,A1:A4,5)", 20],
      ['_xlfn.MAXIFS(B1:B4,A1:A4,"<>2")', 40],
      ['_xlfn.MAXIFS(B1:B4,A1:A4,"<2")', 10],
      ['_xlfn.MINIFS(B1:B4,C1:C4,"<>keep")', 20],
      ['_xlfn.MINIFS(B1:B4,C1:C4,">j")', 10],
      ['_xlfn.MAXIFS(B1:B4,C1:C4,"<=keep")', 40],
      ['_xlfn.MINIFS(B1:B4,C1:C4,">=skip")', 20],
      ['_xlfn.MINIFS(B1:B4,A1:A4,">500")', 0],
      ['_xlfn.MAXIFS(B1:B4,A1:A4,">500")', 0],
      ['_xlfn.MAXIFS(B9:B10,A1:A2,">0")', 0],
      ["_xlfn.MINIFS(B7,A1,0)", 0],
      ["_xlfn.MAXIFS(B8,A1,0)", 0],
    ] as const) {
      const source = unicode(formula);
      try {
        doc.SetFormula(output, source, grammar);
        const cell = doc.GetFormulaCell(output);
        assert(cell);
        expect(cell.GetErrCode(), formula).toBe(FormulaError.NONE);
        expect(cell.GetValue(), formula).toBe(expected);
      } finally {
        source.dispose();
      }
    }
    for (const [formula, expected] of [
      ['AVERAGEIF(A1:A4,"absent",B1)', FormulaError.DivisionByZero],
      ["AVERAGEIF(A1:A4)", FormulaError.ParameterExpected],
      ["AVERAGEIF(A1:A4,0,B1,B2)", FormulaError.IllegalParameter],
      ['_xlfn.MINIFS(B1:B4,A1:A3,">0")', FormulaError.IllegalArgument],
      ["_xlfn.MAXIFS(B1:B4,A1:A4)", FormulaError.ParameterExpected],
      ["_xlfn.MINIFS(3,A1,0)", FormulaError.IllegalParameter],
      ["_xlfn.MAXIFS(B1,3,0)", FormulaError.IllegalParameter],
      ["_xlfn.MINIFS(B1,A1,NA())", FormulaError.NotAvailable],
      ["_xlfn.MINIFS(B9,A1,0)", FormulaError.DivisionByZero],
      ["_xlfn.MINIFS(B1,A1,#REF!)", FormulaError.NoRef],
    ] as const) {
      const source = unicode(formula);
      try {
        doc.SetFormula(output, source, grammar);
        expect(doc.GetFormulaCell(output)?.GetErrCode(), formula).toBe(expected);
      } finally {
        source.dispose();
      }
    }
    options.SetFormulaRegexEnabled(true);
    doc.SetDocOptions(options);
    const regexp = unicode('AVERAGEIF(C1:C4,"k.+",B1)');
    try {
      doc.SetFormula(output, regexp, grammar);
      expect(doc.GetFormulaCell(output)?.GetErrCode()).toBe(FormulaError.NoValue);
    } finally {
      regexp.dispose();
    }
  } finally {
    sheet.dispose();
    rates.dispose();
    doc.Dispose();
  }
});
