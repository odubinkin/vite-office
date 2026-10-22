/** @fileoverview Regressions for full Calc worker filtering and supported native graph transport. */
import { expect, it } from "vitest";
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
/** Builds sparse native state that must survive graph transport. @returns Source. */
function fixture(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  doc.InsertTab(1, unicode("Empty"));
  doc.SetValue(new ScAddress(0, 0, 0), 3);
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
  return doc;
}
it("retains cells, styles, sparse attributes and geometry through worker transfer", /** Checks native document data across the worker filter boundary.  @returns Operation result. */ () => {
  const doc = fixture(),
    restored = decodeCalcDocument(structuredClone(encodeCalcDocument(doc)));
  try {
    expect(writeOdsXml(restored)).toEqual(writeOdsXml(doc));
    expect(restored.GetValue(new ScAddress(1, 0, 0))).toBe(6);
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
    const input = writeOdsDocument(doc);
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
    const reopened = await readOdsDocument(content);
    try {
      expect(reopened.GetValue(new ScAddress(1, 0, 0))).toBe(6);
      expect(reopened.GetRowHeight(4999, 0, false)).toBe(900);
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
    const content = writeOdsXml(doc),
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
