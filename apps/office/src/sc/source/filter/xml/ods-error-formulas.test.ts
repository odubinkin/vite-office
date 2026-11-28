/** @fileoverview Native scalar conditional and information formula results across ODS. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { decodeCalcDocument } from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const grammar = FormulaGrammar.Grammar.GRAM_ODFF;

/** Creates a Calc model with the native test sheet owner. @returns Owned workbook. */
function createDocument(): ScDocument {
  const document = new ScDocument();
  const name = unicode("foo");
  try {
    assert(document.InsertTab(0, name));
    return document;
  } finally {
    name.dispose();
  }
}

/** Assigns a native formula to the given cell. @param document - Actual model. @param address - Original position. @param source - ODFF expression. */
function setFormula(document: ScDocument, address: ScAddress, source: string): void {
  const value = unicode(source);
  try {
    document.SetFormula(address, value, grammar);
  } finally {
    value.dispose();
  }
}

const nativeChecks = [
  ["=IFERROR([.A1];9)", 1],
  ["=IFERROR([.A2];9)", "e"],
  ["=IFERROR([.A3];9)", 2],
  ["=IFERROR([.A4];-7)", -7],
  ["=IFERROR([.A5];-7)", -7],
  ["=IFERROR([.A6];-7)", -7],
  ["=IFERROR([.A7];-7)", -7],
  ["=IFNA([.A6];9)", FormulaError.DivisionByZero, true],
  ["=IFNA([.A7];-7)", -7],
  ['=IFNA(VLOOKUP("4";[.A8:.A10];1;0);-2)', 4],
  ['=IFNA(VLOOKUP("fop";[.A8:.A10];1;0);-2)', -2],
  ["=IFERROR(IF(NA();1;2);4)", 4],
  ["=IFNA(IF(0;1;NA());4)", 4],
  ["=IFERROR(12;NA())", 12],
  ['=IF(ISERROR(SEARCH("z";"abc"));6;7)', 6],
  ["=IFERROR(;3)", FormulaError.ParameterExpected, true],
  ["=IFNA(;[.A1])", FormulaError.ParameterExpected, true],
  ["=IFERROR(NA();)", 0],
] as const;

/** Checks the native typed results after hard recalc. @param document - Workbook. */
function checkFallbacks(document: ScDocument): void {
  document.CalcAll();
  for (const [row, [source, expected, isError]] of nativeChecks.entries()) {
    const address = new ScAddress(0, 20 + row, 0);
    const cell = document.GetFormulaCell(address);
    assert(cell, source);
    expect(cell.GetErrCode(), source).toBe(isError ? expected : FormulaError.NONE);
    if (!isError && typeof expected === "number") expect(cell.GetValue(), source).toBe(expected);
    if (!isError && typeof expected === "string")
      expect(text(cell.GetString().getString()), source).toBe(expected);
  }
}

it("replays the scalar portion of native testFuncIFERROR through an ODS Worker round trip", /** Exercises original values, lazy fallback and scalar error paths. @returns Completion. */ async () => {
  const source = createDocument();
  try {
    for (const [row, input] of [
      1,
      "e",
      "=SQRT(4)",
      "=SQRT(-2)",
      "=[.A4]",
      "=1/0",
      "=NA()",
      "bar",
      4,
      "gee",
      "=1/0",
      23,
    ].entries()) {
      const address = new ScAddress(0, row, 0);
      if (typeof input === "number") source.SetValue(address, input);
      else if (input.startsWith("=")) setFormula(source, address, input);
      else {
        const value = unicode(input);
        try {
          source.SetTextCell(address, value);
        } finally {
          value.dispose();
        }
      }
    }
    for (const [row, [expression]] of nativeChecks.entries())
      setFormula(source, new ScAddress(0, 20 + row, 0), expression);
    checkFallbacks(source);
    const bytes = await writeOdsDocument(source);
    const result = await processOdsWorkerRequest({
      id: 1,
      operation: "import",
      input: bytes.buffer as ArrayBuffer,
      options: {},
    });
    assert("sheets" in result);
    const restored = decodeCalcDocument(structuredClone(result));
    try {
      checkFallbacks(restored);
      const reopened = await readOdsDocument(await writeOdsDocument(restored));
      try {
        checkFallbacks(reopened);
      } finally {
        reopened.Dispose();
      }
    } finally {
      restored.Dispose();
    }
  } finally {
    source.Dispose();
  }
});

it.each([
  ["iserror", [5, 6, 11, 12]],
  ["iserr", [5, 6, 11, 12]],
  ["isna", [2, 5, 6, 7, 8]],
] as const)(
  "replays the scalar error predicates from %s.fods",
  /** Reuses the exact source expressions and expected booleans in pinned information fixtures. @param file - Fixture stem. @param selectedRows - Native fixture rows. */ (
    file,
    selectedRows,
  ) => {
    const content = readFileSync(
      `../../vendor/libreoffice-reference/sc/qa/unit/data/functions/information/fods/${file}.fods`,
      "utf8",
    );
    const xml = new DOMParser().parseFromString(content, "application/xml");
    const table = xml.getElementsByTagNameNS(ODF_NAMESPACES.table, "table")[1];
    assert(table);
    const rows = table.getElementsByTagNameNS(ODF_NAMESPACES.table, "table-row");
    const document = createDocument();
    try {
      for (const row of selectedRows) {
        const [input, expected] = Array.from(rows[row - 1]?.children ?? []);
        const formula = input?.getAttributeNS(ODF_NAMESPACES.table, "formula");
        const boolean = expected?.getAttributeNS(ODF_NAMESPACES.office, "boolean-value");
        assert(formula && formula.startsWith("of:="));
        assert(boolean === "true" || boolean === "false");
        const address = new ScAddress(0, row, 0);
        setFormula(document, address, formula.slice(3));
        const cell = document.GetFormulaCell(address);
        assert(cell);
        expect(cell.GetErrCode(), formula).toBe(FormulaError.NONE);
        expect(cell.GetValue(), formula).toBe(Number(boolean === "true"));
        expect(cell.GetFormatType() & SvNumFormatType.LOGICAL).not.toBe(0);
      }
    } finally {
      document.Dispose();
    }
  },
);
