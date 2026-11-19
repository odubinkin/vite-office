/** @fileoverview Worksheet VLOOKUP and HLOOKUP over native Calc cell stores. */
import { assert, expect, it } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScDocOptions } from "../tool/docoptio";

/** Assigns typed worksheet input through the document's regular input path. @param doc - Sheet owner. @param col - Column. @param row - Row. @param source - Cell input. @returns Nothing. */
function put(doc: ScDocument, col: number, row: number, source: string): void {
  const value = unicode(source);
  try {
    const pos = new ScAddress(col, row, 0);
    if (source.startsWith("=")) doc.SetFormula(pos, value, FormulaGrammar.Grammar.GRAM_NATIVE);
    else doc.SetString(pos, value);
  } finally {
    value.dispose();
  }
}

/** Reads a successful calculated scalar or a native formula error. @param doc - Sheet owner. @param col - Column. @param row - Row. @returns Result. */
function result(doc: ScDocument, col: number, row: number): string | number {
  const cell = doc.GetFormulaCell(new ScAddress(col, row, 0));
  assert(cell);
  const error = cell.GetErrCode();
  if (error !== FormulaError.NONE) {
    expect(error).toBe(FormulaError.NotAvailable);
    return "#N/A";
  }
  if (cell.IsEmptyDisplayedAsString()) return "";
  return cell.IsValue() ? cell.GetValue() : text(cell.GetString().getString());
}

/** Creates the worksheet used by the upstream formula fixtures. @returns Document. */
function makeDocument(): ScDocument {
  const doc = new ScDocument();
  const name = unicode("foo");
  try {
    doc.InsertTab(0, name);
    return doc;
  } finally {
    name.dispose();
  }
}

it("replays the worksheet cases in LibreOffice testFuncVLOOKUP", /** Ports the four original data and lookup sequences without formula substitution. @returns Nothing. */ () => {
  const doc = makeDocument();
  try {
    const values = ["Key", 10, 20, 30, 40, 50, 60, 70, "B", "B", "C", "D", "E", "F"];
    for (const [row, value] of values.entries()) {
      put(doc, 0, row, String(value));
      put(doc, 1, row, row ? String(row + 2) : "Val");
    }
    const queries = [
      [12, 3],
      [29, 4],
      [31, 5],
      [45, 6],
      [56, 7],
      [65, 8],
      [78, 9],
      ["Andy", "#N/A"],
      ["Bruce", 11],
      ["Charlie", 12],
      ["David", 13],
      ["Edward", 14],
      ["Frank", 15],
      ["Henry", 15],
      [100, 9],
      [1000, 9],
      ["Zena", 15],
    ] as const;
    for (const [i, [key, expected]] of queries.entries()) {
      const row = i + 1;
      put(doc, 3, row, String(key));
      put(doc, 4, row, `=VLOOKUP(D${row + 1};A2:B14;2;1)`);
      expect(result(doc, 4, row), String(key)).toBe(expected);
    }
    for (let row = 0; row < 18; ++row)
      for (const col of [0, 1, 3, 4]) doc.SetEmptyCell(new ScAddress(col, row, 0));
    for (const [row, key, value] of [
      [2, 1, "One"],
      [4, 2, "Two"],
      [7, 4, "Four"],
    ] as const) {
      put(doc, 0, row, String(key));
      put(doc, 1, row, value);
    }
    for (const [row, expected] of ["One", "Two", "Two", "Four", "Four"].entries()) {
      put(doc, 3, row, String(row + 1));
      put(doc, 4, row, `=VLOOKUP(D${row + 1};$A$1:$B$8;2)`);
      expect(result(doc, 4, row)).toBe(expected);
    }
    for (let row = 0; row < 8; ++row) doc.SetEmptyCell(new ScAddress(0, row, 0));
    for (const [row, value] of [..."ABCDEFG"].entries()) put(doc, 0, row, value);
    put(doc, 2, 0, '=VLOOKUP("C";A1:A16;1)');
    expect(result(doc, 2, 0)).toBe("C");

    const data = [
      [1, "one", 3, "three"],
      [2, "two", 1, "one"],
      [3, "three", 4, "four"],
      [4, "four", 2, "two"],
    ] as const;
    for (const [i, [key, value, query]] of data.entries()) {
      const row = i + 20;
      put(doc, 0, row, String(key));
      put(doc, 1, row, value);
      put(doc, 2, row, String(query));
      put(doc, 3, row, "=VLOOKUP(C21:C24;A21:B24;2;0)");
    }
    for (const [i, entry] of data.entries()) expect(result(doc, 3, i + 20)).toBe(entry[3]);
  } finally {
    doc.Dispose();
  }
});

it("uses the original wildcard escape, mixed types and result-cell ownership", /** Exercises worksheet query modes and native dependency recalculation. @returns Nothing. */ () => {
  const doc = makeDocument();
  try {
    for (const [col, key] of ["cap", "Cat*", "cats", "dog"].entries()) {
      put(doc, col, 0, key);
      if (col !== 3) put(doc, col, 1, String(col + 1));
    }
    for (const [row, source, expected] of [
      [3, '=HLOOKUP("cat~*";A1:D2;2;0)', 2],
      [4, '=HLOOKUP("c?t*";A1:D2;2;0)', 2],
      [5, '=HLOOKUP("cats";A1:D2;2)', 3],
      [6, '=HLOOKUP("dog";A1:D2;2;0)', ""],
      [7, '=HLOOKUP("zzz*";A1:D2;2;0)', "#N/A"],
      [8, '=HLOOKUP("c?t*";A1:D2;2)', 3],
      [9, '=HLOOKUP("cap";A1;1;0)', "cap"],
      [10, '=HLOOKUP("a*";A1:D2;2)', "#N/A"],
    ] as const) {
      put(doc, 5, row, source);
      expect(result(doc, 5, row), source).toBe(expected);
    }
    put(doc, 1, 1, "22");
    expect(result(doc, 5, 3)).toBe(22);
    put(doc, 0, 11, "70");
    put(doc, 1, 11, "formatted");
    put(doc, 5, 11, '=VLOOKUP("70";A12:B12;2;0)');
    expect(result(doc, 5, 11)).toBe("formatted");
    put(doc, 0, 12, "=1/0");
    put(doc, 1, 12, "error key");
    put(doc, 5, 12, '=VLOOKUP("#DIV/0!";A13:B13;2;0)');
    expect(result(doc, 5, 12)).toBe("error key");

    const options = new ScDocOptions(doc.GetDocOptions());
    options.SetFormulaWildcardsEnabled(false);
    options.SetMatchWholeCell(false);
    doc.SetDocOptions(options);
    put(doc, 5, 13, '=HLOOKUP("at";A1:D2;2;0)');
    expect(result(doc, 5, 13)).toBe(22);
    options.SetFormulaRegexEnabled(true);
    doc.SetDocOptions(options);
    put(doc, 5, 14, '=HLOOKUP("c.*";A1:D2;2;0)');
    expect(doc.GetErrCode(new ScAddress(5, 14, 0))).toBe(FormulaError.NoValue);
    put(doc, 5, 15, '=HLOOKUP("cats";A1:D2;2;0)');
    expect(result(doc, 5, 15)).toBe(3);
    put(doc, 5, 16, '=HLOOKUP(".";A1:D2;2;0)');
    expect(doc.GetErrCode(new ScAddress(5, 16, 0))).toBe(FormulaError.NoValue);
  } finally {
    doc.Dispose();
  }
});
