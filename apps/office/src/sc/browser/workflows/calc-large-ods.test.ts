/** @fileoverview Independent5000-row sparse ODF survives actual import,primary browser storage and ODS reopen without expanded empty cells. */
import { assert, expect, it } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { IndexedDbDocumentStore } from "../../../framework/browser/storage/document-store";
import { createCalcSession } from "../composition/calc-module";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../package/source/zipapi/ZipOutputStream";
import { ScAddress } from "../../inc/address";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ODS_MIMETYPE } from "../../source/filter/xml/xmlwrap";
/** Builds an independent ODF package rather than using the exporter under test. @returns Source package. */
function largeSource(): Uint8Array {
  let rows = "";
  for (let row = 0; row < 5000; row++)
    rows += `<table:table-row table:style-name="ro"><table:table-cell office:value-type="float" office:value="${row}"/><table:table-cell table:number-columns-repeated="1022"/><table:table-cell office:value-type="string"><text:p>Last ${row}</text:p></table:table-cell></table:table-row>`;
  const content = `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:automatic-styles><style:style style:name="co" style:family="table-column"><style:table-column-properties style:column-width="1in"/></style:style><style:style style:name="ro" style:family="table-row"><style:table-row-properties style:row-height="0.2in" style:use-optimal-row-height="false"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Large"><table:table-column table:style-name="co" table:number-columns-repeated="1024"/>${rows}</table:table></office:spreadsheet></office:body></office:document-content>`;
  const zip = new ZipOutputStream(),
    encoder = new TextEncoder();
  zip.putNextEntry("mimetype", encoder.encode(ODS_MIMETYPE));
  zip.putNextEntry(
    "META-INF/manifest.xml",
    encoder.encode(
      `<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3"><manifest:file-entry manifest:full-path="/" manifest:media-type="${ODS_MIMETYPE}"/><manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>`,
    ),
  );
  zip.putNextEntry("content.xml", encoder.encode(content));
  return zip.finish();
}
it("automatically stores an imported5000-row sparse table and opens every scalar from a fresh session", /** Uses real workflows,filter,model and primary storage with default ceilings. @returns Completion. */ async () => {
  const bytes = largeSource(),
    db = new IndexedDbDocumentStore(crypto.randomUUID(), new IDBFactory()),
    session = createCalcSession(db);
  await session.fileWorkflows.Import(new File([bytes as BlobPart], "Large.ods"), bytes, {
    id: "large",
    title: "Large",
  });
  expect(session.controller.shell.GetMedium().kind).toBe("primary");
  expect(session.controller.shell.IsModified()).toBe(false);
  const record = await db.load("large");
  assert(record);
  expect(record.bytes.length).toBeLessThan(3 * 1024 * 1024);
  const xml = await new ZipFile(record.bytes).readTextEntry("content.xml");
  expect(xml.match(/table:number-columns-repeated="1022"/g)).toHaveLength(5000);
  expect(xml.match(/<table:table-cell\b/g)).toHaveLength(15000);
  session.Close();
  const reopened = createCalcSession(db);
  await reopened.fileWorkflows.OpenStored("large");
  const document = reopened.controller.shell.GetDocument();
  for (let row = 0; row < 5000; row++) {
    expect(document.GetValue(new ScAddress(0, row, 0))).toBe(row);
    expect(text(document.GetSharedString(new ScAddress(1023, row, 0)).getString())).toBe(
      `Last ${row}`,
    );
    expect(document.GetCellType(new ScAddress(100, row, 0))).toBe(0);
  }
  expect(document.GetColWidth(1023, 0)).toBe(1440);
  expect(document.GetRowHeight(4999, 0, false)).toBe(288);
  expect(document.GetRowHeight(5000, 0, false)).toBe(256);
  reopened.Close();
});
