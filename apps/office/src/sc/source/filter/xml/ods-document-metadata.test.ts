/** @fileoverview Verifies shared native metadata ownership through the Calc Worker and ODS. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import { processOdsWorkerRequest } from "../../../browser/filter/xml/ods-worker-runtime";
import type { CalcDocumentRecord } from "../../../browser/filter/xml/calc-document-codec";
import { ScDocument } from "../../../inc/document";
import { readOdsDocument, writeOdsXml } from "./xmlwrap";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("round-trips the native custom metadata DOM through the ODS Worker", /** Ports the original CUSTOM.odt metadata assertions for the shared Calc metadata service. @returns Completion. */ async () => {
  const fixture =
    "../../vendor/libreoffice-reference/sfx2/qa/complex/sfx2/testdocuments/CUSTOM.odt";
  const original = await DocumentArchive.open(new Uint8Array(readFileSync(fixture)));
  const originalMeta = await original.readTextEntry("meta.xml");
  const workbook = new ScDocument();
  const name = unicode("Sheet1");
  try {
    workbook.InsertTab(0, name);
    const template = await writeOdsXml(workbook);
    const input = await packXmlPackage({ ...template.files, "meta.xml": originalMeta });
    const record = await processOdsWorkerRequest({
      id: 1,
      operation: "import",
      input: input.buffer as ArrayBuffer,
      options: {},
    });
    const result = await processOdsWorkerRequest({
      id: 2,
      operation: "export",
      document: structuredClone(record as CalcDocumentRecord),
    });
    expect(result).toBeInstanceOf(ArrayBuffer);
    const bytes = new Uint8Array(result as ArrayBuffer);
    const archive = await DocumentArchive.open(bytes);
    expect(await archive.readTextEntry("META-INF/manifest.xml")).toContain(
      'manifest:full-path="meta.xml"',
    );
    const meta = await archive.readTextEntry("meta.xml");
    const dom = new DOMParser().parseFromString(meta, "application/xml");
    expect(dom.documentElement.getAttributeNS(ODF_NAMESPACES.office, "version")).toBe("1.3");
    expect(dom.getElementsByTagNameNS("http://foo.net", "baz")[0]?.textContent).toBe("bar");
    expect(dom.getElementsByTagName("bork")[0]?.textContent).toBe("bork");
    const reopened = await readOdsDocument(bytes);
    try {
      expect(reopened.documentProperties.HasDocumentProperties()).toBe(true);
      expect(reopened.GetTableCount()).toBe(1);
    } finally {
      reopened.Dispose();
    }
  } finally {
    name.dispose();
    workbook.Dispose();
  }
});
