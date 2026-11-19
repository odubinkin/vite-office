/** @fileoverview Native named array regression through XLSX, Worker, and primary ODS. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsXml } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";

const fixture = "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/named-ranges-global.xlsx";

/** Replays the assertions from testRangeNameImpl and checks the inline matrix in its native owner. @param document - Imported document. @returns Nothing. */
function verifyNames(document: ScDocument): void {
  for (const [tab, col, row, value] of [
    [0, 1, 0, 1],
    [0, 1, 2, 3],
    [1, 1, 1, 7],
    [0, 1, 1, 2],
    [0, 1, 3, 4],
    [0, 2, 0, 10],
    [1, 1, 0, 5],
    [1, 0, 5, 5],
    [1, 0, 3, 1],
  ])
    expect(document.GetValue(new ScAddress(col, row, tab))).toBe(value);
  expect(document.GetRangeName()?.findByUpperName("GLOBAL1")).toBeDefined();
  expect(document.GetRangeName(0)?.findByUpperName("LOCAL1")).toBeDefined();
  expect(document.GetRangeName(1)?.findByUpperName("LOCAL2")).toBeDefined();
  expect(
    document
      .GetRangeName()
      ?.findByUpperName("GLOBAL4")
      ?.GetSymbol(FormulaGrammar.Grammar.GRAM_OOXML),
  ).toBe("{1,2,3;4,5,6}");
  expect(document.GetVisibleTab()).toBe(1);
}

it("replays testRangeNameXLSX and preserves the named matrix across the existing filters", /** Exercises unchanged native upstream inputs with actual document owners. @returns Completion. */ async () => {
  const original = await ExcelFilter.importDocument(new Uint8Array(readFileSync(fixture)));
  let worker: ScDocument | undefined;
  let stored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    verifyNames(original);
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(original)));
    verifyNames(worker);
    const ods = await writeOdsXml(worker);
    expect(ods.files["content.xml"]).toContain("{1;2;3|4;5;6}");
    stored = await readOdsDocument(ods);
    verifyNames(stored);
    const bytes = await exportXlsx(stored);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("xl/workbook.xml")).toMatch(
      /<definedName name="Global4"[^>]*>\{1,2,3;4,5,6\}<\/definedName>/u,
    );
    reopened = await ExcelFilter.importDocument(bytes);
    verifyNames(reopened);
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    original.Dispose();
  }
});

it("replays the original ODS named range fixture over the same matrix owner", /** Ports the calculation assertions of testRangeNameODS. @returns Completion. */ async () => {
  const original = await readOdsDocument(
    new Uint8Array(
      readFileSync(
        "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/named-ranges-global.ods",
      ),
    ),
  );
  try {
    verifyNames(original);
  } finally {
    original.Dispose();
  }
});
