/** @fileoverview Stored Calc XML validation, style-key reuse and rejected graph transfer records. */
import { expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScProtectionAttr, ScLineBreakCell, ScIndentItem } from "../../../inc/attrib";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { writeOdsXml, readOdsDocument, ScXMLImportWrapper } from "./xmlwrap";
import {
  encodeCalcDocument,
  decodeCalcDocument,
  type CalcDocumentRecord,
} from "../../../browser/filter/xml/calc-document-codec";
import { ScRefCellValue } from "../../../inc/cellvalue";
/** Creates a sheet whose equal exported font sizes have distinct native patterns. @returns Document. */
function styled(): ScDocument {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Styles"));
  for (const [col, protect] of [
    [0, true],
    [1, false],
  ] as const) {
    const p = new ScPatternAttr(doc.getCellAttributeHelper());
    p.ItemSetPut(new SvxFontHeightItem(280, 100, 101));
    p.ItemSetPut(new ScProtectionAttr(protect));
    p.ItemSetPut(new ScLineBreakCell(true));
    p.ItemSetPut(new ScIndentItem(360));
    doc.ApplyPatternAreaTab(col, 0, col, 0, 0, p);
    p.Dispose();
  }
  return doc;
}
it("shares effective style names across distinct patterns and round-trips them through worker records", /** Checks merged exporter caching and worker style deduplication. @returns Completion. */ async () => {
  const doc = styled(),
    record = encodeCalcDocument(doc),
    copy = decodeCalcDocument(record),
    xml = writeOdsXml(copy);
  expect(String(xml.files["content.xml"]).match(/style:family="table-cell"/g)).toHaveLength(1);
  const loaded = await readOdsDocument(xml);
  expect((loaded.GetPattern(new ScAddress())?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(
    280,
  );
  for (const d of [doc, copy, loaded]) d.DisposeAttributes();
});
it("rejects malformed browser streams and enforces the complete ZIP size ceiling", /** Keeps invalid persistence data outside canonical documents. @returns Completion. */ async () => {
  const doc = styled(),
    xml = writeOdsXml(doc);
  await expect(
    readOdsDocument({ ...xml, files: { ...xml.files, mimetype: new Uint8Array() } }),
  ).rejects.toThrow("Missing ODS XML");
  const size = Object.values(xml.files).reduce(
    /** Checks the browser XML and worker regression boundary. @param n - Controlled regression input. @param s - Controlled regression input. @returns Regression result or completion. */ (
      n,
      s,
    ) => n + new TextEncoder().encode(String(s)).length,
    0,
  );
  expect(
    /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
      new ScXMLImportWrapper(doc).Export({ maxOutputBytes: size }),
  ).toThrow("size limit");
  new ScXMLImportWrapper(doc).ExportXml();
  doc.DisposeAttributes();
});
it("rejects incompatible, duplicate-sheet and missing-style transfer data and disposes failed candidates", /** Tests actual codec validation rather than fabricated successful state. @returns Nothing. */ () => {
  const doc = styled(),
    record = encodeCalcDocument(doc);
  for (const invalid of [
    { ...record, version: 2 },
    { ...record, sheets: null },
  ])
    expect(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        decodeCalcDocument(invalid as unknown as CalcDocumentRecord),
    ).toThrow("invalid");
  expect(
    /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
      decodeCalcDocument({ ...record, sheets: [...record.sheets, ...record.sheets] }),
  ).toThrow("sheet is invalid");
  const missing = structuredClone(record);
  const firstSheet = missing.sheets[0];
  if (firstSheet === undefined) throw new Error("Calc sheet fixture is missing.");
  firstSheet.patterns[0] = [-1, 0, 0, "missing"];
  expect(
    /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
      decodeCalcDocument(missing),
  ).toThrow("style is missing");
  doc.SetTextCell(new ScAddress(), unicode("text"));
  const spy = vi.spyOn(ScRefCellValue.prototype, "getSharedString").mockReturnValue(null as never);
  try {
    expect(
      /** Checks the browser XML and worker regression boundary.  @returns Regression result or completion. */ () =>
        encodeCalcDocument(doc),
    ).toThrow("unsupported");
  } finally {
    spy.mockRestore();
    doc.DisposeAttributes();
  }
});
