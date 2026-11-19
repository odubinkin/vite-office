/** @fileoverview Native Exc1904 and WorkbookSettings epoch through XLSX, ODS and Worker transport. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeCalcDocument,
  encodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ExcelFilter } from "../oox/excelfilter";
import { readOdsDocument, writeOdsDocument, writeOdsXml } from "../xml/xmlwrap";
import { exportXlsx } from "./xetable";

/** Checks the native serial, date and displayed cell text independently. @param doc - Imported Calc document. @returns Nothing. */
function expectMarch1904(doc: ScDocument): void {
  const address = new ScAddress(0, 0, 0);
  const formats = doc.GetFormatTable();
  const pattern = doc.GetPattern(address);
  assert(pattern);
  expect(formats.GetNullDate().GetDate()).toBe(19040101);
  expect(doc.GetValue(address)).toBe(60);
  const display = new OUString();
  try {
    formats.GetOutputString(doc.GetValue(address), pattern.GetNumberFormat(formats), display, [
      null,
    ]);
    expect(text(display)).toBe("Tuesday, March 1, 1904");
  } finally {
    display.dispose();
  }
}

it("replays tdf165180 and round-trips the 1904 workbook epoch through primary ODS", /** Checks the original XLSX formatting and date1904 assertion over the actual Worker and ODS owners. @returns Completion. */ async () => {
  const bytes = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf165180_date1904.xlsx",
  );
  const source = await ExcelFilter.importDocument(new Uint8Array(bytes));
  let transferred: ScDocument | undefined,
    stored: ScDocument | undefined,
    reopened: ScDocument | undefined;
  try {
    expectMarch1904(source);
    const record = structuredClone(encodeCalcDocument(source));
    transferred = decodeCalcDocument(record);
    expectMarch1904(transferred);
    const odf = await writeOdsDocument(transferred);
    const content = await (await DocumentArchive.open(odf)).readTextEntry("content.xml");
    expect(content).toContain('<table:null-date table:date-value="1904-01-01"/>');
    expect(content).toContain('number:automatic-order="true" number:format-source="language"');
    stored = await readOdsDocument(odf);
    expectMarch1904(stored);
    const xlsx = await exportXlsx(stored);
    const workbook = await (await DocumentArchive.open(xlsx)).readTextEntry("xl/workbook.xml");
    expect(workbook).toContain('<workbookPr date1904="true"/>');
    expect(workbook).not.toContain("dateCompatibility");
    reopened = await ExcelFilter.importDocument(xlsx);
    expectMarch1904(reopened);
  } finally {
    reopened?.Dispose();
    stored?.Dispose();
    transferred?.Dispose();
    source.Dispose();
  }
});

it("keeps the native epoch default with older Worker records and absent or invalid ODS dates", /** Checks the non-1904 branch and native malformed/null-date fallback without changing cell serials. @returns Completion. */ async () => {
  const doc = new ScDocument();
  const copies: ScDocument[] = [];
  try {
    const name = unicode("Data");
    try {
      doc.InsertTab(0, name);
    } finally {
      name.dispose();
    }
    const snapshot = await writeOdsXml(doc);
    const sourceXml = snapshot.files["content.xml"];
    assert(typeof sourceXml === "string");
    const record = encodeCalcDocument(doc);
    const { nullDate, ...legacy } = record;
    expect(nullDate).toBe(18991230);
    copies.push(decodeCalcDocument(legacy));
    expect(
      /** Rejects an invalid Gregorian day. @returns Decode attempt. */ () =>
        decodeCalcDocument({ ...record, nullDate: 19040230 }),
    ).toThrow("Calc worker null date is invalid");
    expect(
      /** Rejects a packed value outside the native signed width. @returns Decode attempt. */ () =>
        decodeCalcDocument({ ...record, nullDate: 4294967296 + 19040101 }),
    ).toThrow("Calc worker null date is invalid");
    for (const child of [
      "<table:null-date/>",
      '<table:null-date table:date-value="1904-02-30"/>',
      "<table:iteration/>",
      "<table:named-expressions/>",
    ]) {
      const content = sourceXml.replace(
        "<office:spreadsheet>",
        "<office:spreadsheet><table:calculation-settings>" +
          child +
          "</table:calculation-settings>",
      );
      assert(content);
      copies.push(
        await readOdsDocument({
          ...snapshot,
          files: { ...snapshot.files, "content.xml": content },
        }),
      );
    }
    for (const copy of copies) expect(copy.GetFormatTable().GetNullDate().GetDate()).toBe(18991230);
  } finally {
    for (const copy of copies) copy.Dispose();
    doc.Dispose();
  }
});
