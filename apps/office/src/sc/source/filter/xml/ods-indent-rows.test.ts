/** @fileoverview Independent ODF indentation and repeated hidden/filtered/manual row geometry across genuine ODS packages. */
import { expect, it } from "vitest";
import { ScXMLImport } from "./xmlimprt";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScPatternAttr } from "../../../inc/patattr";
import { ScIndentItem } from "../../../inc/attrib";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
/** Independently authored XML with native ODF namespaces. @param indent - Paragraph margin. @returns XML. */
function xml(indent: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles><style:style style:name="ce" style:family="table-cell"><style:paragraph-properties fo:margin-left="${indent}" fo:text-align="end"/></style:style><style:style style:name="ro" style:family="table-row"><style:table-row-properties style:row-height="1in" style:use-optimal-row-height="false"/></style:style></office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Rows"><table:table-row table:style-name="ro" table:number-rows-repeated="2" table:visibility="filter"><table:table-cell table:style-name="ce" office:value-type="float" office:value="17"/></table:table-row><table:table-row table:visibility="collapse" table:number-rows-repeated="2"/><table:table-row/></table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("imports independent native signed16 HMM indentation and repeated filtered rows then preserves package state across three reopens", /** Actual XML/ZIP/document owners. @returns Completion. */ async () => {
  let doc = new ScDocument();
  new ScXMLImport(doc).importContent(xml("0.5in"));
  try {
    for (let cycle = 0; cycle < 3; cycle++) {
      expect((doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(131)).toBeInstanceOf(
        ScIndentItem,
      );
      expect(
        (
          (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(131) as ScIndentItem
        ).GetValue(),
      ).toBe(720);
      expect(doc.GetRowHeight(0, 0)).toBe(0);
      expect(doc.GetRowHeight(1, 0, false)).toBe(1440);
      expect(doc.RowFiltered(1, 0)).toBe(true);
      expect(doc.RowHidden(2, 0)).toBe(true);
      expect(doc.RowFiltered(2, 0)).toBe(false);
      expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(17);
      const bytes = writeOdsDocument(doc),
        content = await new ZipFile(bytes).readTextEntry("content.xml");
      expect(content).toContain('fo:margin-left="1.27cm"');
      expect(content).toContain('table:visibility="filter"');
      expect(content).toContain('table:visibility="collapse"');
      expect(content).toContain('table:number-rows-repeated="2"');
      const next = await readOdsDocument(bytes);
      doc.DisposeAttributes();
      doc.GetSharedStringPool().dispose();
      doc = next;
    }
  } finally {
    doc.DisposeAttributes();
    doc.GetSharedStringPool().dispose();
  }
});
it("retains source signed16 saturation,negative-to-UInt16 conversion and explicit invalid-measure diagnostics", /** Independent import edge cases. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["-1mm", 65479],
    ["1000cm", 18577],
    ["bogus", 0],
  ] as const) {
    const doc = new ScDocument(),
      diagnostics: string[] = [];
    try {
      new ScXMLImport(doc, {
        onDiagnostic:
          /** Records importer diagnostics. @param value - Diagnostic. @returns Nothing. */ (
            value,
          ) => {
            diagnostics.push(value.name);
          },
      }).importContent(xml(input));
      expect(
        (
          (doc.GetPattern(new ScAddress()) as ScPatternAttr).GetItem(131) as ScIndentItem
        ).GetValue(),
      ).toBe(expected);
      if (input === "bogus") expect(diagnostics).toContain("invalid cell indentation");
    } finally {
      doc.DisposeAttributes();
      doc.GetSharedStringPool().dispose();
    }
  }
});
