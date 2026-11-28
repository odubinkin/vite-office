/** @fileoverview Native Calc typed ODF scalars, formats and hybrid formula caches. */
import { assert, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  encodeCalcDocument,
  decodeCalcDocument,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScAddress } from "../../../inc/address";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScDocument } from "../../../inc/document";
import { ScCellFormat } from "../../core/tool/cellform";
import { SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScXMLImport } from "./xmlimprt";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";

it("recalculates the original ODS volatile value and its cached dependent", /** Replays the volatile and typed-error assertions of testCachedFormulaResultsODS_cachedValue. @returns Completion. */ async () => {
  const fixture = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/cachedValue.ods";
  const source = await readOdsDocument(new Uint8Array(readFileSync(fixture)));
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(source)));
  try {
    const reopened = await readOdsDocument(await writeOdsDocument(worker));
    try {
      for (const doc of [source, worker, reopened]) {
        const now = doc.GetFormulaCell(new ScAddress(0, 0, 1));
        const dependent = doc.GetFormulaCell(new ScAddress(1, 0, 1));
        expect(now?.GetCode().IsRecalcModeAlways()).toBe(true);
        expect(now?.GetValue()).toBeGreaterThan(45000);
        expect(dependent?.GetValue()).toBe(now?.GetValue());
        expect(doc.GetFormatTable().GetType(doc.GetNumberFormat(0, 0, 1)) & T.DATETIME).toBe(
          T.DATETIME,
        );
        expect(doc.GetNumberFormat(1, 0, 1)).toBe(doc.GetNumberFormat(0, 0, 1));
        for (let col = 0; col < 4; ++col) {
          for (let row = 0; row < 2; ++row) {
            const cell = doc.GetFormulaCell(new ScAddress(col, row, 2));
            assert(cell);
            expect(cell.GetErrCode()).not.toBe(FormulaError.NONE);
            expect(text(cell.GetString().getString())).toBe("");
          }
        }
      }
    } finally {
      reopened.Dispose();
    }
  } finally {
    worker.Dispose();
    source.Dispose();
  }
});

it("matches the original hybrid shared-string formula after a native recalculation", /** Replays testHybridSharedStringODS. @returns Completion. */ async () => {
  const fixture = "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/hybrid-shared-string.ods";
  const document = await readOdsDocument(new Uint8Array(readFileSync(fixture)));
  try {
    const value = document.GetFormulaCell(new ScAddress(0, 1, 0));
    expect(value?.GetValue()).toBe(2);
    document.CalcAll();
    expect(value?.GetValue()).toBe(2);
  } finally {
    document.Dispose();
  }
});

const namespaces = Object.entries(ODF_NAMESPACES)
  .map(
    /** Opens the actual SAX namespaces. @param entry - Prefix and URI. @returns Namespace declaration. */ ([
      prefix,
      uri,
    ]) => `xmlns:${prefix}="${uri}"`,
  )
  .join(" ");

/** Opens an independent ODS content stream with the native importer. @param row - Authored cells. @param declarations - Automatic styles. @param settings - Calculation settings. @returns Loaded model. */
function load(row: string, declarations = "", settings = ""): ScDocument {
  const document = new ScDocument();
  new ScXMLImport(document).importContent(
    `<office:document-content ${namespaces} office:version="1.3"><office:automatic-styles>${declarations}</office:automatic-styles><office:body><office:spreadsheet>${settings}<table:table table:name="Sheet1"><table:table-column table:number-columns-repeated="8"/><table:table-row>${row}</table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
  );
  return document;
}

it("routes ODS scalar types through the document's format table and date origin", /** Exercises ordinary values through real package export and reopen. @returns Completion. */ async () => {
  const source = load(
    [
      '<table:table-cell office:value-type="date" office:date-value="2000-01-03T05:30:00+05:30"/>',
      '<table:table-cell office:value-type="time" office:time-value="-P1DT12H"/>',
      '<table:table-cell office:value-type="percentage" office:value="0.25"/>',
      '<table:table-cell office:value-type="boolean" office:boolean-value="2"/>',
      '<table:table-cell office:value-type="date"/>',
      '<table:table-cell office:value-type="currency" office:currency="EUR" office:value="12.5" table:style-name="Currency"/>',
      '<table:table-cell office:value-type="currency" office:currency="EUR" office:value="4"/>',
    ].join(""),
    '<number:currency-style style:name="USD"><number:currency-symbol>USD</number:currency-symbol><number:number number:min-integer-digits="1" number:decimal-places="2"/></number:currency-style><style:style style:name="Currency" style:family="table-cell" style:data-style-name="USD"/>',
    '<table:calculation-settings><table:null-date table:date-value="2000-01-01"/></table:calculation-settings>',
  );
  const bytes = await writeOdsDocument(source);
  const reopened = await readOdsDocument(bytes);
  try {
    for (const document of [source, reopened]) {
      const formatter = document.GetFormatTable();
      for (const [col, expected, type] of [
        [0, 2 + 30 / 1440, T.DATETIME],
        [1, -1.5, T.TIME],
        [2, 0.25, T.PERCENT],
        [3, 2, T.LOGICAL],
        [4, 0, T.DATETIME],
        [5, 12.5, T.CURRENCY],
        [6, 4, T.NUMBER],
      ] as const) {
        const address = new ScAddress(col, 0, 0);
        expect(document.GetValue(address)).toBe(expected);
        const key = document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
        expect(formatter.GetType(key) & ~T.DEFINED).toBe(type);
      }
    }
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("content.xml");
    expect(xml).toContain('office:value-type="date" office:date-value="2000-01-03T00:30:00"');
    expect(xml).toContain('office:value-type="time" office:time-value="-PT36H00M00S"');
    expect(xml).toContain('office:value-type="percentage" office:value="0.25"');
    expect(xml).toContain('office:value-type="boolean" office:boolean-value="2"');
    expect(xml).toContain('office:value-type="currency" office:currency="EUR" office:value="12.5"');
  } finally {
    source.Dispose();
    reopened.Dispose();
  }
});

it("retains both assertions from Calc tdf126116 with the original column defaults", /** Ports the native short-date display and edit-format assertions. @returns Nothing. */ () => {
  const flat = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/fods/tdf126116.fods",
    "utf8",
  );
  const document = new ScDocument();
  new ScXMLImport(document).importContent(
    flat.replace(/(<\/?office:document)(?=[\s>])/gu, "$1-content"),
  );
  const input = unicode("03/03");
  try {
    const address = new ScAddress();
    const formatter = document.GetFormatTable();
    const before = document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0;
    const rendered = ScCellFormat.GetString(
      new ScRefCellValue(document.GetValue(address)),
      before,
      [null],
      null,
      document,
    );
    try {
      expect(text(rendered)).toBe("02/02/21");
    } finally {
      rendered.dispose();
    }
    document.SetString(address, input);
    const after = formatter.GetEntry(document.GetPattern(address)?.GetNumberFormat(formatter) ?? 0);
    assert(after);
    expect(text(after.GetFormatstring())).toBe("MM/DD/YY");
  } finally {
    input.dispose();
    document.Dispose();
  }
});

it("retains numeric and text formula caches and recalculates an explicit error result", /** Exercises import's formula cache and date-format exception. @returns Nothing. */ () => {
  const document = load(
    [
      '<table:table-cell table:formula="of:=1" office:value-type="date" office:date-value="1900-01-02"/>',
      '<table:table-cell table:formula="of:=2" office:value-type="string" office:string-value="cached"/>',
      '<table:table-cell table:formula="of:=3" office:value-type="string" office:string-value="wrong" calcext:value-type="error"/>',
    ].join(""),
  );
  const worker = decodeCalcDocument(structuredClone(encodeCalcDocument(document)));
  try {
    for (const model of [document, worker]) {
      const address = new ScAddress();
      const first = model.GetFormulaCell(address);
      const cachedText = model.GetFormulaCell(new ScAddress(1, 0, 0));
      assert(first && cachedText);
      expect(first.GetValue()).toBe(3);
      expect(model.GetPattern(address)?.GetNumberFormat(model.GetFormatTable())).toBe(0);
      expect(text(cachedText.GetString().getString())).toBe("cached");
      expect(model.GetFormulaCell(new ScAddress(2, 0, 0))?.GetValue()).toBe(3);
    }
  } finally {
    worker.Dispose();
    document.Dispose();
  }
});
