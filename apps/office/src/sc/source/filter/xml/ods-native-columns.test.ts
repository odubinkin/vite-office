/** @fileoverview Independent ODF column styles/repeats and native width/hidden geometry across genuine ODS bytes. */
import { expect, it } from "vitest";
import { ScXMLImport } from "./xmlimprt";
import { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsDocument } from "./xmlwrap";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScXMLExport } from "./xmlexprt";
import { ScAddress } from "../../../inc/address";
/** Independent ODF envelope avoids exporter-derived import expectations. @param styles - Raw styles. @param columns - Raw table columns. @returns Document XML. */
function xml(styles: string, columns: string): string {
  return `<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><office:automatic-styles>${styles}</office:automatic-styles><office:body><office:spreadsheet><table:table table:name="Columns">${columns}<table:table-row><table:table-cell office:value-type="float" office:value="17"/></table:table-row></table:table></office:spreadsheet></office:body></office:document-content>`;
}
it("imports native HMM property conversion,repeated widths and non-visible states then reopens actual ODS twice", /** Concrete package and native storage. @returns Completion. */ async () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    xml(
      '<style:style style:name="wide" style:family="table-column"><style:table-column-properties style:column-width="1in" style:use-optimal-column-width="false"/></style:style>',
      '<table:table-columns><table:table-column table:style-name="wide" table:number-columns-repeated="2" table:visibility="collapse"/><table:table-column table:style-name="wide"/></table:table-columns><table:table-header-columns><table:table-column/></table:table-header-columns>',
    ),
  );
  expect(doc.GetColWidth(0, 0)).toBe(0);
  expect(doc.GetColWidth(0, 0, false)).toBe(1440);
  expect(doc.GetColWidth(1, 0, false)).toBe(1440);
  expect(doc.GetColWidth(2, 0)).toBe(1440);
  expect(doc.GetColWidth(3, 0)).toBe(1280);
  let current = doc;
  for (let count = 0; count < 2; count++) {
    const bytes = writeOdsDocument(current),
      content = await new ZipFile(bytes).readTextEntry("content.xml");
    expect(content).toContain('style:family="table-column"');
    expect(content).toContain('table:visibility="collapse"');
    expect(content).toContain('table:number-columns-repeated="2"');
    const next = await readOdsDocument(bytes);
    expect(next.GetColWidth(0, 0, false)).toBe(1440);
    expect(next.ColHidden(1, 0)).toBe(true);
    expect(next.GetColWidth(2, 0)).toBe(1440);
    expect(next.GetValue(new ScAddress())).toBe(17);
    current.DisposeAttributes();
    current = next;
  }
  current.DisposeAttributes();
});
it("retains native repeat clamps and final-column overflow while diagnosing unported property families", /** Independent malformed/default/native visibility alternatives. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    diagnostics: string[] = [];
  new ScXMLImport(doc, {
    onDiagnostic:
      /** Collects explicit unsupported metadata. @param value - Diagnostic. @returns Nothing. */ (
        value,
      ) => {
        diagnostics.push(value.name);
      },
  }).importContent(
    xml(
      '<style:style style:name="empty" style:family="table-column" style:parent-style-name="Base"><style:table-column-properties/></style:style><style:style style:name="zero" style:family="table-column"><style:table-column-properties style:column-width="0cm"/></style:style><style:style style:name="bad" style:family="table-column"><style:table-column-properties style:column-width="bogus" style:use-optimal-column-width="true"/><style:text-properties/></style:style>',
      '<table:table-column table:style-name="empty" table:number-columns-repeated="0" table:default-cell-style-name=""/><table:table-column table:style-name="zero" table:default-cell-style-name="Default"/><table:table-column table:style-name="bad" table:visibility="filter" table:default-cell-style-name="Named"/><table:table-column table:style-name="missing"/><table:table-column table:style-name=""/><table:table-column-group><table:table-column table:number-columns-repeated="999999"/></table:table-column-group><table:table-column table:visibility="unknown"/>',
    ),
  );
  expect(doc.GetColWidth(0, 0)).toBe(1280);
  expect(doc.GetColWidth(1, 0)).toBe(1280);
  expect(doc.ColHidden(2, 0)).toBe(true);
  expect(doc.ColHidden(doc.MaxCol(), 0)).toBe(true);
  expect(diagnostics).toEqual(
    expect.arrayContaining([
      "invalid column width",
      "optimal column width",
      "column style properties",
      "column default-cell-style inheritance",
      "column style",
      "column outline group",
      "column parent style inheritance",
    ]),
  );
  doc.DisposeAttributes();
});
it("preserves native scalar UInt16 width narrowing independently of visibility", /** Source HMM property uses UInt16 target storage. @returns Nothing. */ () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    xml(
      '<style:style style:name="overflow" style:family="table-column"><style:table-column-properties style:column-width="200cm"/></style:style>',
      '<table:table-column table:style-name="overflow"/>',
    ),
  );
  expect(doc.GetColWidth(0, 0)).toBe(47850);
  doc.DisposeAttributes();
});

it("observes cancellation within genuine row traversal after compressed column output", /** Actual cancellation phase. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    name = unicode("Cancel");
  doc.InsertTab(0, name);
  name.dispose();
  doc.SetValue(new ScAddress(), 17);
  for (const stop of [1, 2, 3]) {
    let calls = 0;
    expect(
      /** Runs actual cancellable traversal. @returns XML. */ () =>
        new ScXMLExport(doc, {
          isCancelled:
            /** Cancels a concrete traversal phase. @returns Native cancellation. */ () =>
              ++calls === stop,
        }).exportContent(),
    ).toThrow("cancelled");
  }
  doc.DisposeAttributes();
});

it("retains original signed HMM parsing before UInt16 narrowing rather than adding a positive-width clamp", /** Original XMLMeasurePropHdl has signed32 defaults. @returns Nothing. */ () => {
  const doc = new ScDocument();
  new ScXMLImport(doc).importContent(
    xml(
      '<style:style style:name="negative" style:family="table-column"><style:table-column-properties style:column-width="-1cm"/></style:style>',
      '<table:table-column table:style-name="negative"/>',
    ),
  );
  expect(doc.GetColWidth(0, 0)).toBe(64969);
  doc.DisposeAttributes();
});
