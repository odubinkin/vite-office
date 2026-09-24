/** @fileoverview Tests structural diagnostics against pinned upstream ODT and synthetic XML. */

import fs from "node:fs";
import { describe, expect, it } from "vitest";
import { ZipFile } from "../../apps/office/src/package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../apps/office/src/package/source/zipapi/ZipOutputStream";
import {
  ODT_XML_STREAM_BYTE_LIMIT,
  readOdtDocument,
} from "../../apps/office/src/sw/source/filter/xml/swxml";
import {
  parseOdfXmlStream,
  SvXMLImportContext,
  type OdfXmlDiagnostic,
} from "../../apps/office/src/xmloff/source/core/xmlimp";
import { diagnoseOdtImport } from "./odt-import-diagnostics";

const fixture = new Uint8Array(
  fs.readFileSync("apps/office/src/sw/qa/extras/odfimport/data/feature_text.odt"),
);

/** Repackages the pinned fixture with one synthetic stream replacement. @param name - Entry to replace. @param replacement - New entry bytes. @returns Package bytes. */
async function replaceFixtureEntry(name: string, replacement: Uint8Array): Promise<Uint8Array> {
  const archive = new ZipFile(fixture);
  const output = new ZipOutputStream();
  for (const entry of archive.getEntryNames())
    output.putNextEntry(entry, entry === name ? replacement : await archive.readEntry(entry));
  return output.finish();
}

describe("privacy-safe ODT import diagnostics", /** Groups package diagnostic assertions. @returns Nothing. */ () => {
  it("counts the pinned odffeatures.cxx feature_text.odt without document text", /** Checks source-backed counts and redaction. @returns Completion after import. */ async () => {
    // Pinned source: sw/qa/extras/odfimport/data/feature_text.odt at 9bc445578031fecf56086729d8e4940c77e14d65.
    const report = await diagnoseOdtImport(fixture);
    expect(report.imported).toBe(true);
    expect(report.xml["text:p"]).toBe(1);
    expect(report.canonical.paragraphs).toBe(1);
    expect(report.diagnostics).not.toContainEqual(
      expect.objectContaining({
        kind: "unsupported-attribute",
        stream: "content.xml",
        name: "style:font-family-generic",
        loss: "styling",
      }),
    );
    expect(report.diagnostics).toContainEqual(
      expect.objectContaining({
        kind: "unknown-attribute",
        stream: "styles.xml",
        name: "style:font-size-asian",
      }),
    );
    expect(JSON.stringify(report)).not.toContain("Hello World!");
  });

  it("records varied paragraph metrics from pinned tdf114287.odt", /** Checks sorted numeric metrics. @returns Completion after import. */ async () => {
    // Pinned source: sw/qa/extras/odfexport/data/tdf114287.odt in odfexport4.cxx.
    const bytes = new Uint8Array(
      fs.readFileSync("apps/office/src/sw/qa/extras/odfexport/data/tdf114287.odt"),
    );
    const report = await diagnoseOdtImport(bytes);
    expect(report.imported).toBe(true);
    expect(report.canonical.paragraphMetrics.printWidths.length).toBeGreaterThan(1);
  });

  it("reports exact XML paths without attribute values", /** Checks structural path redaction. @returns Nothing. */ () => {
    const diagnostics: OdfXmlDiagnostic[] = [];
    /** Minimal root that leaves unknown children to the base context. */
    class TestRootContext extends SvXMLImportContext {}
    const xml =
      '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:foreign="urn:foreign" foreign:secret="PRIVATE"><foreign:child foreign:value="HIDDEN"/></office:document-content>';
    parseOdfXmlStream(
      xml,
      {
        /** Creates the synthetic root context. @returns Context. */
        createFastContext(): SvXMLImportContext {
          return new TestRootContext();
        },
        /** Rejects unknown roots. @returns Null. */
        createUnknownContext(): null {
          return null;
        },
      },
      {
        onDiagnostic:
          /** Collects one event. @param diagnostic - Event. @returns New count. */
          (diagnostic) => diagnostics.push(diagnostic),
      },
    );
    expect(diagnostics).toContainEqual({
      kind: "unknown-attribute",
      path: "/office:document-content",
      name: "foreign:secret",
    });
    expect(diagnostics).toContainEqual({
      kind: "unknown-element",
      path: "office:document-content/foreign:child",
      name: "foreign:child",
    });
    expect(JSON.stringify(diagnostics)).not.toMatch(/PRIVATE|HIDDEN/u);
  });

  it("recognizes synthetic bookmark and soft break markers in canonical Writer positions", /** Checks marker triage and model ownership. @returns Completion after import. */ async () => {
    const content = await new ZipFile(fixture).readTextEntry("content.xml");
    const changed = content.replace(
      "</text:p>",
      '<text:bookmark text:name="test-mark"/><text:soft-page-break/></text:p>',
    );
    expect(changed).not.toBe(content);
    const bytes = await replaceFixtureEntry("content.xml", new TextEncoder().encode(changed));
    const report = await diagnoseOdtImport(bytes);
    expect(report.xml["text:bookmark"]).toBe(1);
    expect(report.xml["text:soft-page-break"]).toBe(1);
    expect(
      report.diagnostics.some(
        /** Looks for false marker loss reports. @param diagnostic - Import diagnostic. @returns Whether marker was rejected. */ (
          diagnostic,
        ) => diagnostic.name === "text:bookmark" || diagnostic.name === "text:soft-page-break",
      ),
    ).toBe(false);
    const imported = await readOdtDocument(bytes, { title: "Synthetic markers" });
    const marks = imported.document.GetIDocumentMarkAccess();
    expect(marks.FindMark("test-mark")?.GetPosition().GetContentIndex()).toBe(12);
    expect(marks.GetSoftPageBreaks()[0]?.GetContentIndex()).toBe(12);
    const unknownAttribute = content.replace(
      "</text:p>",
      '<text:bookmark text:name="test-mark" xmlns:foreign="urn:foreign" foreign:extra="ignored"/></text:p>',
    );
    const attributeReport = await diagnoseOdtImport(
      await replaceFixtureEntry("content.xml", new TextEncoder().encode(unknownAttribute)),
    );
    expect(attributeReport.diagnostics).toContainEqual(
      expect.objectContaining({
        kind: "unknown-attribute",
        name: "foreign:extra",
        loss: "structure",
      }),
    );
  });

  it("classifies a synthetic table cell as potential content loss", /** Checks table triage. @returns Completion after import. */ async () => {
    const content = await new ZipFile(fixture).readTextEntry("content.xml");
    const changed = content.replace(
      "</office:text>",
      '<table:table xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"><table:table-row><table:table-cell><text:p>Cell</text:p></table:table-cell></table:table-row></table:table></office:text>',
    );
    expect(changed).not.toBe(content);
    const report = await diagnoseOdtImport(
      await replaceFixtureEntry("content.xml", new TextEncoder().encode(changed)),
    );
    expect(report.xml["table:table-cell"]).toBe(1);
    expect(report.diagnostics).toContainEqual(
      expect.objectContaining({ loss: "content", path: expect.stringContaining("/table:table") }),
    );
    expect(JSON.stringify(report)).not.toContain("Cell");
  });

  it("records import failures without exposing package or XML error values", /** Checks sanitized failure reports. @returns Completion after import. */ async () => {
    const manifestFailure = await replaceFixtureEntry(
      "META-INF/manifest.xml",
      new TextEncoder().encode("invalid manifest"),
    );
    const report = await diagnoseOdtImport(manifestFailure);
    expect(report.imported).toBe(false);
    expect(report.diagnostics).toContainEqual(
      expect.objectContaining({ kind: "import-error", stream: "package" }),
    );
    expect(JSON.stringify(report)).not.toContain("invalid manifest");

    const content = await new ZipFile(fixture).readTextEntry("content.xml");
    const changed = content.replace("</office:text>", "<office:spreadsheet/></office:text>");
    expect(changed).not.toBe(content);
    const xmlFailure = await replaceFixtureEntry("content.xml", new TextEncoder().encode(changed));
    const xmlReport = await diagnoseOdtImport(xmlFailure);
    expect(xmlReport.imported).toBe(false);
    expect(xmlReport.diagnostics).toContainEqual(
      expect.objectContaining({ kind: "import-error", stream: "content.xml" }),
    );
  });

  it("keeps the Reader's XML stream byte ceiling before inventory parsing", /** Checks resource ceiling. @returns Completion after rejection. */ async () => {
    const oversized = await replaceFixtureEntry(
      "content.xml",
      new Uint8Array(ODT_XML_STREAM_BYTE_LIMIT + 1),
    );
    await expect(diagnoseOdtImport(oversized)).rejects.toThrow("ODT XML stream exceeds size limit");
  }, 20_000);
});
