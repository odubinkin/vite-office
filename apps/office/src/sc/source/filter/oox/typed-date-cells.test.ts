/** @fileoverview Explicit SpreadsheetML date cells and the native Calc serial-value path. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { Date } from "../../../../offapi/com/sun/star/util/Date";
import { DateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ScCellFormat } from "../../core/tool/cellform";
import { exportXlsx } from "../excel/xetable";
import { readOdsDocument, writeOdsDocument } from "../xml/xmlwrap";
import { ExcelFilter } from "./excelfilter";
import { UnitConverter } from "./unitconverter";
import { spreadsheetNamespace, strictSpreadsheetNamespace } from "./workbookfragment";

it.each([
  ["tdf165180_date1904.xlsx", spreadsheetNamespace, ' s="1"', 19040101, 60, -1],
  ["universal-content-strict.xlsx", strictSpreadsheetNamespace, "", 18991230, 1522, 1461],
] as const)(
  "reopens explicit date, invalid text and formula values from %s",
  /** Tests worksheet scalar parsing in the original Strict and Transitional package envelopes. @param fixture - Reference package. @param namespace - Actual SpreadsheetML namespace. @param style - First cell XF attribute. @param epoch - Packed date mode. @param serial - March 1 date serial. @param earlier - December 31 date serial. @returns Completion. */ async (
    fixture,
    namespace,
    style,
    epoch,
    serial,
    earlier,
  ) => {
    const source = await DocumentArchive.open(
      new Uint8Array(
        readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/" + fixture),
      ),
    );
    const sheet = `<worksheet xmlns="${namespace}"><sheetData><row r="1">
    <c r="A1" t="d"${style}><v>1904-03-01</v></c>
    <c r="B1" t="d"><v>1904-03-01T13:02:03.999+01:00</v></c>
    <c r="C1" t="d"${style}><v>1904-02-30</v></c>
    <c r="D1" t="d"${style}><v/></c>
    <c r="E1" t="d"><v>1903-12-31</v></c>
    <c r="F1" t="d"><f>1+2</f><v>1904-03-01</v></c>
    <c r="G1" t="d"><v>60</v></c>
    <c r="H1" t="b"><v>TrUe</v></c>
    <c r="I1" t="b"><v>0</v></c>
    <c r="J1" t="b"><v>-1</v></c>
    <c r="K1" t="b"><v>false</v></c>
    <c r="L1" t="e"><v>#DIV/0!</v></c>
    <c r="M1" t="e"><v>#N/A</v></c>
    <c r="N1" t="e"><v>#SPILL!</v></c>
  </row></sheetData></worksheet>`;
    const external = new DocumentArchiveWriter();
    for (const path of source.getEntryNames())
      external.putNextEntry(
        path,
        path === "xl/worksheets/sheet1.xml"
          ? new TextEncoder().encode(sheet)
          : await source.readEntry(path),
      );
    const doc = await ExcelFilter.importDocument(await external.finish());
    let primary: ScDocument | undefined, reopened: ScDocument | undefined;
    try {
      primary = await readOdsDocument(await writeOdsDocument(doc));
      const bytes = await exportXlsx(primary);
      const xml = await (
        await DocumentArchive.open(bytes)
      ).readTextEntry("xl/worksheets/sheet1.xml");
      expect(xml).toMatch(new RegExp('<c r="A1"[^>]*><v>' + serial + "</v></c>", "u"));
      expect(xml).toMatch(/<c r="H1"[^>]*t="b"><f>TRUE\(\)<\/f><v>1<\/v><\/c>/u);
      expect(xml).toMatch(/<c r="I1"[^>]*t="b"><f>FALSE\(\)<\/f><v>0<\/v><\/c>/u);
      expect(xml).toMatch(/<c r="L1"[^>]*t="e"><f>#DIV\/0!<\/f><v>#DIV\/0!<\/v><\/c>/u);
      expect(xml).toMatch(/<c r="N1"[^>]*t="e"><f>#SPILL!<\/f><v>#VALUE!<\/v><\/c>/u);
      reopened = await ExcelFilter.importDocument(bytes);
      for (const [copyIndex, copy] of [doc, primary, reopened].entries()) {
        expect(copy.GetFormatTable().GetNullDate().GetDate()).toBe(epoch);
        expect(copy.GetValue(new ScAddress(0, 0, 0))).toBe(serial);
        expect(copy.GetValue(new ScAddress(1, 0, 0))).toBeCloseTo(
          serial + 0.5 + 2 / 1440 + 3 / 86400,
          10,
        );
        const fallback = copy.GetRefCellValue(new ScAddress(2, 0, 0)).getSharedString();
        assert(fallback);
        expect(text(fallback.getString())).toBe("1904-02-30");
        expect(copy.GetCellType(new ScAddress(3, 0, 0))).toBe(CellType.CELLTYPE_NONE);
        expect(copy.GetValue(new ScAddress(4, 0, 0))).toBe(earlier);
        expect(copy.GetFormulaCell(new ScAddress(5, 0, 0))?.GetValue()).toBe(3);
        const raw = copy.GetRefCellValue(new ScAddress(6, 0, 0)).getSharedString();
        assert(raw);
        expect(text(raw.getString())).toBe("60");
        for (const [i, value] of [1, 0, 1, 0].entries()) {
          const address = new ScAddress(7 + i, 0, 0);
          const boolean = copy.GetFormulaCell(address);
          assert(boolean);
          expect(boolean.GetValue()).toBe(value);
          const formatted = ScCellFormat.GetOutputString(
            copy,
            address,
            copy.GetRefCellValue(address),
          );
          try {
            const formatKey = copy.GetPattern(address)?.GetNumberFormatKey();
            expect(text(formatted), `Workbook ${copyIndex}, number format ${formatKey}`).toBe(
              value ? "TRUE" : "FALSE",
            );
          } finally {
            formatted.dispose();
          }
        }
        expect(copy.GetErrCode(new ScAddress(11, 0, 0))).toBe(FormulaError.DivisionByZero);
        expect(copy.GetErrCode(new ScAddress(12, 0, 0))).toBe(FormulaError.NotAvailable);
        expect(copy.GetErrCode(new ScAddress(13, 0, 0))).toBe(FormulaError.Spill);
        const format = copy.GetPattern(new ScAddress(0, 0, 0))?.GetNumberFormatKey();
        expect(format === 0).toBe(style === "");
      }
    } finally {
      reopened?.Dispose();
      primary?.Dispose();
      doc.Dispose();
    }
  },
);

it("counts January and leap-day boundaries using the source Gregorian rules", /** Checks the original calendar coefficient independently of XML. @returns Nothing. */ () => {
  const units = new UnitConverter();
  expect(units.calcSerialFromDateTime(new DateTime(0, 0, 0, 0, 1, 3, 1900, false))).toBe(61);
  units.finalizeNullDate(new Date(28, 2, 2000));
  expect(units.calcSerialFromDateTime(new DateTime(0, 0, 0, 0, 1, 3, 2000, false))).toBe(2);
  units.finalizeNullDate(new Date(28, 2, 2100));
  expect(units.calcSerialFromDateTime(new DateTime(0, 0, 0, 0, 1, 3, 2100, false))).toBe(1);
});
