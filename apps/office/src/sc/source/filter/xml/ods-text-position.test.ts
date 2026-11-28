/** @fileoverview Replays scalar text-position assertions from pinned Calc FODS fixtures. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { createBrowserRegexMatcher } from "../../../../i18npool/browser/regex-matcher";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { decodeCalcDocument } from "../../../browser/filter/xml/calc-document-codec";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import { ScAddress } from "../../../inc/address";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

const fixtures = [
  ["find", [2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 21]],
  ["search", [2, 6, 7, 8, 10, 11, 21, 22, 23, 24, 25, 26]],
  ["len", [2, 3, 4, 10, 11, 12, 13]],
  ["exact", [2, 3, 4, 20, 50]],
  ["left", [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14]],
  ["right", [2, 3, 4, 10, 11, 12, 13, 14, 15, 16]],
  ["mid", [2, 3, 4, 5, 6, 8, 9, 10, 11, 12]],
  ["replace", [2, 3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]],
] as const;

/** Retains the pinned scalar test expressions and their fixture inputs. @param source - FODS stream. @param rows - Admitted result rows. @returns ODS content stream. */
function fixtureContent(source: string, rows: readonly number[]): string {
  const xml = new DOMParser().parseFromString(
    source
      .replace("<office:document ", "<office:document-content ")
      .replace("</office:document>", "</office:document-content>"),
    "application/xml",
  );
  const ns = ODF_NAMESPACES.table;
  const wanted = new Set<Element>();
  const sheet = xml.getElementsByTagNameNS(ns, "table")[1];
  assert(sheet);
  let rowNumber = 1;
  for (const row of Array.from(sheet.getElementsByTagNameNS(ns, "table-row"))) {
    const cell = row.firstElementChild;
    if (cell && rows.includes(rowNumber)) wanted.add(cell);
    rowNumber += Number(row.getAttributeNS(ns, "number-rows-repeated") ?? 1);
  }
  for (const cell of Array.from(xml.getElementsByTagNameNS(ns, "table-cell")))
    if (!wanted.has(cell)) cell.removeAttributeNS(ns, "formula");
  return new XMLSerializer().serializeToString(xml);
}

/** Replays result column A against expected column B in Sheet2. @param document - Opened Calc document. @param rows - Native one-based fixture rows. */
function checkRows(document: ScDocument, rows: readonly number[]): void {
  document.CalcAll();
  for (const row of rows) {
    const actual = document.GetFormulaCell(new ScAddress(0, row - 1, 1));
    const expected = new ScRefCellValue(document, new ScAddress(1, row - 1, 1));
    assert(actual, `A${row}`);
    expect(actual.GetErrCode(), `A${row}`).toBe(FormulaError.NONE);
    if (actual.IsValue()) {
      expect(document.GetValue(new ScAddress(0, row - 1, 1)), `A${row}`).toBe(
        document.GetValue(new ScAddress(1, row - 1, 1)),
      );
    } else {
      const string =
        expected.getType() === CellType.CELLTYPE_FORMULA
          ? expected.getFormula()?.GetString()
          : expected.getSharedString();
      expect(text(actual.GetString().getString()), `A${row}`).toBe(
        string ? text(string.getString()) : "",
      );
    }
  }
}

it.each(fixtures)(
  "recalculates the native scalar results from %s.fods",
  /** Runs the represented scalar portion of the pinned text function test. @param file - Fixture stem. @param rows - Original result cells. @returns Completion. */
  async (file, rows) => {
    const fixture = readFileSync(
      `../../vendor/libreoffice-reference/sc/qa/unit/data/functions/text/fods/${file}.fods`,
      "utf8",
    );
    const source = new ScDocument(undefined, createBrowserRegexMatcher);
    try {
      const wanted = file === "search" ? [...rows, 3, 4, 9, 12] : rows;
      new ScXMLImport(source).importContent(fixtureContent(fixture, wanted));
      checkRows(source, rows);
      if (file === "search") {
        const bytes = await writeOdsDocument(source);
        const record = await processOdsWorkerRequest({
          id: 1,
          operation: "import",
          input: bytes.buffer as ArrayBuffer,
          options: {},
        });
        assert("sheets" in record);
        const restored = decodeCalcDocument(structuredClone(record));
        try {
          const reopened = await readOdsDocument(await writeOdsDocument(restored), {
            regexMatcherFactory: createBrowserRegexMatcher,
          });
          try {
            for (const doc of [source, restored, reopened]) {
              checkRows(doc, rows);
              expect(doc.GetValue(new ScAddress(0, 2, 1))).toBe(6);
              expect(doc.GetValue(new ScAddress(0, 3, 1))).toBe(2);
              expect(doc.GetErrCode(new ScAddress(0, 8, 1))).toBe(FormulaError.NoValue);
              expect(doc.GetErrCode(new ScAddress(0, 11, 1))).toBe(FormulaError.IllegalArgument);
            }
          } finally {
            reopened.Dispose();
          }
        } finally {
          restored.Dispose();
        }
      }
    } finally {
      source.Dispose();
    }
  },
);
