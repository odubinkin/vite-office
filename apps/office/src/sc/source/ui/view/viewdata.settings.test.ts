/** @fileoverview Calc active view across XLSX, native view data, the Worker and ODS settings. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { exportXlsx } from "../../filter/excel/xetable";
import { ExcelFilter } from "../../filter/oox/excelfilter";
import { readOdsDocument, writeOdsXml } from "../../filter/xml/xmlwrap";
import { ReadUserDataSequence, WriteUserDataSequence } from "./viewdata.settings";
import type { ScDocument } from "../../../inc/document";

/** Reads an unchanged pinned LibreOffice fixture. @param name - Reference path under Calc unit data. @returns Bytes. */
function fixture(name: string): Uint8Array {
  return new Uint8Array(readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/" + name));
}

it("preserves the original Excel sheet names and the fifth active sheet through primary ODS", /** Ports testSheetNamesXLSX and checks the active view by name, not position alone. @returns Completion. */ async () => {
  const source = await ExcelFilter.importDocument(fixture("xlsx/sheet-names.xlsx"));
  let worker: ScDocument | undefined;
  let stored: ScDocument | undefined;
  let reopened: ScDocument | undefined;
  try {
    worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
    const primary = await writeOdsXml(worker);
    expect(primary.files["settings.xml"]).toContain(
      'config:name="ActiveTable" config:type="string">C&gt;D</config:config-item>',
    );
    expect(primary.files["META-INF/manifest.xml"]).toContain('manifest:full-path="settings.xml"');
    stored = await readOdsDocument(primary);
    const bytes = await exportXlsx(stored);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("xl/workbook.xml")).toContain(
      '<workbookView activeTab="4"/>',
    );
    reopened = await ExcelFilter.importDocument(bytes);
    for (const graph of [source, worker, stored, reopened]) {
      const names = graph.GetAllTableNames();
      try {
        expect(names.map(text)).toEqual(["S&P", "Sam's Club", '"The Sheet"', "A<B", "C>D"]);
        expect(graph.GetVisibleTab()).toBe(4);
      } finally {
        for (const name of names) name.dispose();
      }
    }
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});

it("reads the native ODS first view and ignores unresolved properties", /** Verifies the pinned print-range workbook's existing ActiveTable and view lookup guards. @returns Completion. */ async () => {
  const document = await readOdsDocument(fixture("ods/print-range.ods"));
  try {
    expect(document.GetVisibleTab()).toBe(1);
    ReadUserDataSequence(document, []);
    ReadUserDataSequence(document, [
      [
        ["Unrelated", "Sheet1"],
        ["ActiveTable", "Unknown"],
      ],
      [["ActiveTable", "Sheet1"]],
    ]);
    expect(document.GetVisibleTab()).toBe(1);
    expect(WriteUserDataSequence(document)).toEqual([
      [
        ["ViewId", "view1"],
        ["ActiveTable", "Sheet2"],
      ],
    ]);
    document.SetVisible(1, false);
    expect(WriteUserDataSequence(document)).toEqual([]);
  } finally {
    document.Dispose();
  }
});
