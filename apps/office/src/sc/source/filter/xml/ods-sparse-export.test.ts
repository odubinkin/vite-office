/** @fileoverview Independent ODF fixtures verify native repeated empty-cell export and style-run invalidation. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScXMLImport } from "./xmlimprt";
import { writeOdsDocument, readOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ScXMLExport } from "./xmlexprt";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";

/** Imports independently authored style ranges and row geometry. @returns Canonical document. */
function styled(): ScDocument {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"><office:automatic-styles><style:style style:name="a" style:family="table-cell"><style:text-properties fo:font-size="14pt"/></style:style><style:style style:name="b" style:family="table-cell"><style:text-properties fo:font-size="18pt"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Styles"><table:table-row><table:table-cell table:style-name="a" table:number-columns-repeated="2"/><table:table-cell table:style-name="b"/><table:table-cell office:value-type="float" office:value="42"/><table:table-cell table:style-name="b" table:number-columns-repeated="3"/><table:table-cell table:number-columns-repeated="2"/><table:table-cell office:value-type="float" office:value="99"/></table:table-row><table:table-row table:number-rows-repeated="4"><table:table-cell table:style-name="b" table:number-columns-repeated="10"/></table:table-row><table:table-row><table:table-cell table:style-name="a" table:number-columns-repeated="10"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`,
  );
  return doc;
}
it("merges equal empty styles without crossing content or changed format-row boundaries", /** Checks native effective formats after package reload. @returns Completion. */ async () => {
  const doc = styled(),
    bytes = writeOdsDocument(doc),
    content = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(content).toContain('table:number-columns-repeated="2"');
  expect(content).toContain('table:number-columns-repeated="3"');
  expect(content).toContain('table:number-columns-repeated="10"');
  expect(content).toContain('table:number-rows-repeated="4"');
  const copy = await readOdsDocument(bytes);
  expect(copy.GetValue(new ScAddress(3, 0, 0))).toBe(42);
  expect(copy.GetValue(new ScAddress(9, 0, 0))).toBe(99);
  for (let row = 0; row < 6; row++)
    for (let col = 0; col < 10; col++) {
      const pos = new ScAddress(col, row, 0);
      expect((copy.GetPattern(pos)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(
        (doc.GetPattern(pos)?.GetItem(101) as SvxFontHeightItem).GetHeight(),
      );
    }
});
it("recomputes format ranges when the same exporter is reused after a model edit", /** Export-local range state must not outlive its source traversal. @returns Nothing. */ () => {
  const doc = styled(),
    exporter = new ScXMLExport(doc);
  expect(exporter.exportContent()).toContain('office:value="42"');
  doc.SetValue(new ScAddress(3, 0, 0), 7);
  const next = exporter.exportContent();
  expect(next).toContain('office:value="7"');
  expect(next).not.toContain('office:value="42"');
});
