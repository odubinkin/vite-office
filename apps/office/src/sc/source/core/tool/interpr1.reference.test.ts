/** @fileoverview Native formula and add-in regressions consumed by XLSX names and conditional rules. */
import { assert, expect, it, vi } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaDoubleToken } from "../../../../formula/inc/token";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Date as CalcDate } from "../../../../tools/source/datetime/tdate";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScCompiler } from "./compiler";
import { ScDocOptions } from "./docoptio";
import { InsertRangeNames, RangeDataType } from "./rangenam";

const grammar = FormulaGrammar.Grammar.GRAM_OOXML;

/** Installs a source expression through Calc's normal formula owner. @param document - Workbook. @param position - Formula address. @param source - Source spelling. @param syntax - Original formula grammar. @returns Native formula cell. */
function setFormula(document: ScDocument, position: ScAddress, source: string, syntax = grammar) {
  const value = unicode(source);
  try {
    document.SetFormula(position, value, syntax);
    const formula = document.GetFormulaCell(position);
    assert(formula);
    return formula;
  } finally {
    value.dispose();
  }
}

/** Creates a workbook with one original sheet. @returns Owned document. */
function createBook(): ScDocument {
  const document = new ScDocument();
  const name = unicode("Sheet1");
  try {
    assert(document.InsertTab(0, name));
    return document;
  } finally {
    name.dispose();
  }
}

it("ports the scalar LibreOffice COUNTIF regression and counts sparse blank cells", /** Replays testFuncCOUNTIF and checks an unallocated target range. @returns Nothing. */ () => {
  const document = createBook();
  const address = new ScAddress(4, 0);
  try {
    for (const [row, value] of [1999, 2000, 0, 0, 0, 2002, 2001, "X", 2002].entries()) {
      const position = new ScAddress(0, row);
      if (typeof value === "number") document.SetValue(position, value);
      else {
        const string = unicode(value);
        document.SetTextCell(position, string);
        string.dispose();
      }
    }
    setFormula(document, new ScAddress(0, 9), '""');
    for (const [source, expected] of [
      ["COUNTIF(A1:A12,1999)", 1],
      ["COUNTIF(A1:A12,2002)", 2],
      ["COUNTIF(A1:A12,1998)", 0],
      ['COUNTIF(A1:A12,">=1999")', 5],
      ['COUNTIF(A1:A12,">1999")', 4],
      ['COUNTIF(A1:A12,"<2001")', 5],
      ['COUNTIF(A1:A12,">0")', 5],
      ['COUNTIF(A1:A12,">=0")', 8],
      ["COUNTIF(A1:A12,0)", 3],
      ['COUNTIF(A1:A12,"X")', 1],
      ["COUNTIF(A1:A12,)", 3],
      ['COUNTIF(A1:A12,"")', 3],
      ['COUNTIF(A1:A12,"=")', 2],
      ['COUNTIF(XFD1:XFD1048576,"")', 1_048_576],
      ["COUNTIF(A1,A1)", 1],
    ] as const) {
      const formula = setFormula(document, address, source);
      expect(formula.GetErrCode(), source).toBe(FormulaError.NONE);
      expect(formula.GetValue(), source).toBe(expected);
    }
    for (const [source, result] of [
      ["COUNTIF(A1)", FormulaError.ParameterExpected],
      ["COUNTIF(A1,0,A2)", FormulaError.IllegalParameter],
      ["COUNTIF(#REF!,0)", FormulaError.NoRef],
    ] as const)
      expect(setFormula(document, address, source).GetErrCode(), source).toBe(result);
  } finally {
    document.Dispose();
  }
});

it("retains dynamic OFFSET references and named formula defaults", /** Exercises nested range results, omitted sizes, native arity and volatile recalculation. @returns Nothing. */ () => {
  const document = createBook();
  const address = new ScAddress(4, 0);
  try {
    for (const [row, value] of [11, 22, 33, 44].entries())
      document.SetValue(new ScAddress(0, row), value);
    InsertRangeNames(
      document,
      [
        {
          name: "Moving",
          symbol: "OFFSET($A$1,1,,2)",
          pos: new ScAddress(),
          scope: -1,
          type: RangeDataType.Name,
        },
      ],
      grammar,
    );
    for (const [source, expected] of [
      ["OFFSET(A1,1,0)", 22],
      ["OFFSET(A1,0,65536)", 11],
      ["OFFSET(A2,-1.9,0)", 11],
      ["OFFSET(A1,1.9,0,1,1)", 22],
      ["SUM(OFFSET(A1:A2,1,0,,))", 55],
      ["SUM(OFFSET(A1,1,0,2))", 55],
      ["SUM(A1:OFFSET(A1,1,0))", 33],
      ["COUNTIF(OFFSET(A1,1,0,2),33)", 1],
      ["SUM(Moving)", 55],
    ] as const) {
      const formula = setFormula(document, address, source);
      expect(formula.GetErrCode(), source).toBe(FormulaError.NONE);
      expect(formula.GetValue(), source).toBe(expected);
      expect(formula.GetCode().IsRecalcModeAlways(), source).toBe(true);
    }
    for (const [source, result] of [
      ["OFFSET(A1,1)", FormulaError.ParameterExpected],
      ["OFFSET(A1,1,0,1,1,0)", FormulaError.IllegalParameter],
      ["OFFSET(9,1,0)", FormulaError.IllegalParameter],
      ["SUM(OFFSET(A1,1,0):9)", FormulaError.IllegalArgument],
      ["OFFSET(A1,-1,0)", FormulaError.IllegalArgument],
      ["OFFSET(A1,0,0,0)", FormulaError.IllegalArgument],
      ["OFFSET(A1,0,0,1,-2)", FormulaError.IllegalArgument],
      ["OFFSET(A1,2147483648,0)", FormulaError.IllegalArgument],
      ["OFFSET(A1,0,-2147483649)", FormulaError.IllegalArgument],
      ['OFFSET(#REF!,,,12-COUNTIF(#REF!,""))', FormulaError.NoRef],
    ] as const)
      expect(setFormula(document, address, source).GetErrCode(), source).toBe(result);
  } finally {
    document.Dispose();
  }
});

it("evaluates scalar occupancy and date functions with the workbook null date", /** Uses real source tokens and the original local clock/date owners. @returns Nothing. */ () => {
  const document = createBook();
  const address = new ScAddress(4, 1);
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new globalThis.Date(2026, 5, 16, 12));
  try {
    const options = new ScDocOptions(document.GetDocOptions());
    options.SetDate(1, 1, 1904);
    document.SetDocOptions(options);
    document.SetValue(new ScAddress(0, 0), 5);
    setFormula(document, new ScAddress(0, 2), '""');
    const nullDate = new CalcDate(1, 1, 1904).GetAsNormalizedDays();
    const today = new CalcDate(16, 6, 2026).GetAsNormalizedDays() - nullDate;
    for (const [source, expected] of [
      ["NOT(0)", 1],
      ["NOT(A1)", 0],
      ["NOT(ISBLANK(A1))", 1],
      ["ISBLANK(A2)", 1],
      ["ISBLANK(A3)", 0],
      ["ISBLANK(A1:A3)", 1],
      ["ISBLANK(#REF!)", 0],
      ["ISBLANK({1})", 0],
      ["MONTH(TODAY())", 6],
      ["TODAY()", today],
      ["MONTH(-0.1)", 12],
      ["EDATE(30,1)", 59],
      ["EDATE(30,1.9)", 59],
      ["EDATE(59,1)", 88],
      ["EDATE(59,-1)", 28],
      ["MONTH(EDATE(30,1))", 2],
      ["MONTH(EDATE(0,-1))", 12],
      [`EDATE(${-nullDate},0)`, -nullDate],
      [`EDATE(${-nullDate},1)`, 30 - nullDate],
    ] as const) {
      const formula = setFormula(document, address, source);
      expect(formula.GetErrCode(), source).toBe(FormulaError.NONE);
      expect(formula.GetValue(), source).toBe(expected);
    }
    for (const [source, result] of [
      ["EDATE(30,)", FormulaError.IllegalArgument],
      ["EDATE(-2147483648,1)", FormulaError.IllegalArgument],
      ["EDATE(30,2147483647)", FormulaError.IllegalArgument],
      ["EDATE(11274306,0)", FormulaError.IllegalArgument],
      ["MONTH(2147483648)", FormulaError.IllegalArgument],
      ["MONTH()", FormulaError.ParameterExpected],
      ["MONTH(0,1)", FormulaError.IllegalParameter],
      ["ISBLANK()", FormulaError.ParameterExpected],
      ["NOT(1,2)", FormulaError.IllegalParameter],
      ["EDATE(30)", FormulaError.ParameterExpected],
      ["EDATE(30,1,2)", FormulaError.IllegalParameter],
    ] as const)
      expect(setFormula(document, address, source).GetErrCode(), source).toBe(result);
  } finally {
    vi.useRealTimers();
    document.Dispose();
  }
});

it("applies OFFSET to an existing external cache and exports a literal invalid reference as #REF!", /** Ports the first-class reference behavior from testExtRefFuncOFFSET and the original OOXML output branch. @returns Nothing. */ () => {
  const document = createBook();
  const position = new ScAddress(4, 0);
  const output = new OUString();
  try {
    const manager = document.GetExternalRefManager();
    const id = manager.getExternalFileId("file:///extdata.fake");
    const cache = manager.getCacheTable(id, "Data", true);
    assert(cache);
    cache.setCell(0, 0, new FormulaDoubleToken(2.8));
    cache.setCell(0, 1, new FormulaDoubleToken(1.2));
    const ref = "'file:///extdata.fake'#Data.";
    for (const [source, expected] of [
      [`OFFSET(${ref}$A$1;1;0;1;1)`, 1.2],
      [`OFFSET(${ref}$A$1;1;0)`, 1.2],
      [`SUM(OFFSET(${ref}$A$1:.$A$2;0;0))`, 4],
      [`ISBLANK(${ref}$A$2)`, 0],
      [`ISBLANK(${ref}$A$1:.$A$2)`, 0],
    ] as const) {
      const cell = setFormula(document, position, source, FormulaGrammar.Grammar.GRAM_ODFF);
      expect(cell.GetErrCode(), source).toBe(FormulaError.NONE);
      expect(cell.GetValue(), source).toBe(expected);
    }

    for (const source of ["OFFSET(9,1,0)", 'OFFSET("A1",1,0)']) {
      const cell = setFormula(document, position, source);
      expect(cell.GetErrCode()).toBe(FormulaError.IllegalParameter);
      new ScCompiler(document, position, cell.GetCode(), grammar).CreateStringFromTokenArray(
        output,
      );
      expect(text(output)).toBe("OFFSET(#REF!,1,0)");
    }
  } finally {
    output.dispose();
    document.Dispose();
  }
});
