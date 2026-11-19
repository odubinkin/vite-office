/** @fileoverview Regressions for full Calc worker filtering and supported native graph transport. */
import { assert, expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { writeOdsDocument, writeOdsXml, readOdsDocument } from "../../../source/filter/xml/xmlwrap";
import {
  encodeCalcDocument,
  decodeCalcDocument,
  type CalcDocumentRecord,
} from "./calc-document-codec";
import { processOdsWorkerRequest } from "./ods-worker-runtime";
import type { XmlPackage } from "../../../../svl/source/misc/storage";
import { NfIndexTableOffset } from "../../../../svl/inc/zforlist";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SvxFontHeightItem } from "../../../../editeng/source/items/textitem";
import { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { ATTR_CJK_FONT_HEIGHT, ATTR_FONT_HEIGHT, ATTR_VALUE_FORMAT } from "../../../inc/scitems";
/** Builds sparse native state that must survive graph transport. @returns Source. */
function fixture(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.InsertTab(1, unicode("Empty"));
  doc.SetValue(new ScAddress(0, 0, 0), 3);
  doc.SetNumberFormat(
    new ScAddress(0, 0, 0),
    doc.GetFormatTable().GetFormatIndex(NfIndexTableOffset.NF_PERCENT_DEC2),
  );
  doc.SetFormula(new ScAddress(1, 0, 0), unicode("=[.$A$1]*2"), FormulaGrammar.Grammar.GRAM_ODFF);
  doc.SetTextCell(new ScAddress(2, 4999, 0), unicode("001 & 😀"));
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxColorItem(new Color(0x123456), 109));
  doc.ApplyPatternAreaTab(0, 4998, 2, 4999, 0, pattern);
  pattern.Dispose();
  doc.SetRowHeightOnly(4999, 4999, 0, 900);
  doc.SetManualHeight(4999, 4999, 0, true);
  doc.SetRowHidden(10, 15, 0, true);
  doc.SetRowFiltered(12, 13, 0, true);
  doc.SetColWidthOnly(2, 0, 1700);
  doc.SetColHidden(4, 5, 0, true);
  const table = doc.FetchTable(0);
  table?.SetMergedCells(4, 7, 5, 8);
  const outline = table?.StartOutlineTable();
  const group = outline?.GetRowArray().Insert(10, 15, true);
  const child = outline?.GetRowArray().Insert(10, 13, true);
  if (child && group) outline?.GetRowArray().SetVisibleBelow(0, group, false);
  outline?.GetColArray().Insert(4, 5, true);
  return doc;
}

it("transfers the native Default style and a direct General override through worker and ODS", /** Checks the named styles stream and realm-local number format identity. @returns Completion. */ async () => {
  const source = new ScDocument();
  const style = new ScPatternAttr(source.getCellAttributeHelper());
  const name = unicode("Default metrics");
  let worker: ScDocument | undefined, reopened: ScDocument | undefined;
  const result = new OUString();
  try {
    const formatter = source.GetFormatTable();
    const currency = new SfxUInt32Item(
      ATTR_VALUE_FORMAT,
      formatter.GetFormatIndex(NfIndexTableOffset.NF_PERCENT_DEC2),
    );
    const font = new SvxFontHeightItem(320, 100, ATTR_FONT_HEIGHT);
    const cjk = new SvxFontHeightItem(260, 100, ATTR_CJK_FONT_HEIGHT);
    try {
      style.ItemSetPut(font);
      style.ItemSetPut(currency);
      source.GetPool()?.SetUserDefaultItem(cjk);
    } finally {
      currency.Dispose();
      font.Dispose();
      cjk.Dispose();
    }
    source.GetStyleSheetPool()?.SetDefaultCellStyle(style.GetItemSet());
    source.InsertTab(0, name);
    const inherited = new ScAddress(0, 0, 0),
      general = new ScAddress(1, 0, 0);
    source.SetValue(inherited, 0.5);
    source.SetValue(general, 0.5);
    source.SetNumberFormat(general, 0);
    const record = structuredClone(encodeCalcDocument(source));
    expect(record.styles).toContain('style:data-style-name="NDefault"');
    expect(record.styles).toContain(
      '<style:default-style style:family="table-cell"><style:text-properties style:font-size-asian="13pt"',
    );
    worker = decodeCalcDocument(record);
    reopened = await readOdsDocument(await writeOdsDocument(worker));
    for (const document of [source, worker, reopened]) {
      const formats = document.GetFormatTable();
      const pattern = document.GetPattern(inherited);
      assert(pattern);
      expect((pattern.GetItem(ATTR_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(320);
      expect((pattern.GetItem(ATTR_CJK_FONT_HEIGHT) as SvxFontHeightItem).GetHeight()).toBe(260);
      formats.GetOutputString(
        document.GetValue(inherited),
        pattern.GetNumberFormat(formats),
        result,
        [null],
      );
      expect(text(result)).toBe("50.00%");
      expect(document.GetPattern(general)?.GetNumberFormatKey()).toBe(0);
    }
  } finally {
    result.dispose();
    name.dispose();
    style.Dispose();
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});
it("retains cells, styles, sparse attributes and geometry through worker transfer", /** Checks native document data across the worker filter boundary. @returns Completion. */ async () => {
  const doc = fixture(),
    restored = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
  try {
    expect(await writeOdsXml(restored)).toEqual(await writeOdsXml(doc));
    expect(restored.GetValue(new ScAddress(1, 0, 0))).toBe(6);
    expect(restored.IsMerged(new ScAddress(4, 7, 0))).toBe(true);
    expect(
      restored.FetchTable(0)?.GetOutlineTable()?.GetRowArray().GetEntryByPos(1, 11),
    ).toMatchObject({
      start: 10,
      end: 13,
      hidden: true,
      visible: false,
    });
    restored.SetValue(new ScAddress(0, 0, 0), 5);
    expect(restored.GetValue(new ScAddress(1, 0, 0))).toBe(10);
    expect(text(restored.GetSharedString(new ScAddress(2, 4999, 0)).getString())).toBe("001 & 😀");
  } finally {
    doc.DisposeAttributes();
    restored.DisposeAttributes();
  }
});
it("imports external ODS and exports browser XML without a ZIP layer", /** Checks native document data across the worker filter boundary.  @returns Operation result. */ async () => {
  const doc = fixture();
  try {
    const input = await writeOdsDocument(doc);
    const graph = (await processOdsWorkerRequest({
      id: 1,
      operation: "import",
      input: input.buffer as ArrayBuffer,
      options: {},
    })) as CalcDocumentRecord;
    const content = (await processOdsWorkerRequest({
      id: 2,
      operation: "export-xml",
      document: graph,
    })) as XmlPackage;
    expect(content.format).toBe("xml");
    expect(typeof content.files["content.xml"]).toBe("string");
    expect(content.files["content.xml"]).toContain("<number:percentage-style");
    expect(content.files["content.xml"]).toContain(
      'table:number-columns-spanned="2" table:number-rows-spanned="2"',
    );
    const reopened = await readOdsDocument(content);
    try {
      expect(reopened.GetValue(new ScAddress(1, 0, 0))).toBe(6);
      expect(reopened.GetRowHeight(4999, 0, false)).toBe(900);
      const address = new ScAddress(0, 0, 0);
      const formats = reopened.GetFormatTable();
      const output = new OUString();
      try {
        formats.GetOutputString(
          reopened.GetValue(address),
          reopened.GetPattern(address)?.GetNumberFormat(formats) ?? 0,
          output,
          [null],
        );
        expect(text(output)).toBe("300.00%");
      } finally {
        output.dispose();
      }
    } finally {
      reopened.DisposeAttributes();
    }
  } finally {
    doc.DisposeAttributes();
  }
});
it("coalesces allocated empty columns without crossing styles or populated cells", /** Checks native document data across the worker filter boundary.  @returns Operation result. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sparse"));
  doc.FetchTable(0)?.CreateColumnIfNotExists(1023);
  for (let row = 0; row < 200; row++) doc.SetValue(new ScAddress(0, row, 0), row + 1);
  doc.SetValue(new ScAddress(512, 50, 0), 42);
  const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
  pattern.ItemSetPut(new SvxColorItem(new Color(0x123456), 109));
  doc.ApplyPatternAreaTab(1000, 0, 1002, 199, 0, pattern);
  pattern.Dispose();
  try {
    const content = await writeOdsXml(doc),
      xml = String(content.files["content.xml"]);
    expect(xml.length).toBeLessThan(100_000);
    expect(xml).toContain('table:number-columns-repeated="999"');
    const restored = await readOdsDocument(content);
    try {
      expect(restored.GetValue(new ScAddress(512, 50, 0))).toBe(42);
      expect(
        (restored.GetPattern(new ScAddress(1001, 100, 0))?.GetItem(109) as SvxColorItem)
          .GetValue()
          .toUInt32(),
      ).toBe(0x123456);
    } finally {
      restored.DisposeAttributes();
    }
  } finally {
    doc.DisposeAttributes();
  }
});
