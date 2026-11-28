/** @fileoverview Exercises native ODT chapter fields, outline styles and chapter references. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { SwDoc } from "../../core/doc/doc";
import { SwRootFrame } from "../../core/layout/newfrm";
import { SwFrame } from "../../core/layout/wsfrm";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument, writeOdtXml } from "./wrtxml";

const metadata = { title: "Chapter fields" };
const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}"`;

/** Opens the requested stream as XML. @param archive - Generated ODT package. @param stream - XML entry. @returns Parsed XML. */
async function readXml(archive: DocumentArchive, stream: string): Promise<Document> {
  return new DOMParser().parseFromString(await archive.readTextEntry(stream), "application/xml");
}

it("retains the native header chapter fields of tdf167774.odt" /** Replays the chapter fields in the original testTdf167774 package. @returns Completion. */, async () => {
  const name = "../../vendor/libreoffice-reference/sw/qa/extras/odfimport/data/tdf167774.odt";
  const source = await readOdtDocument(new Uint8Array(readFileSync(name)), metadata);
  try {
    const archive = await DocumentArchive.open(await writeOdtDocument(source.document, metadata));
    const xml = await readXml(archive, "styles.xml");
    const fields = Array.from(xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "chapter"));
    expect(fields).toHaveLength(2);
    for (const field of fields) {
      expect(field.getAttributeNS(ODF_NAMESPACES.text, "display")).toBe("name");
      expect(field.getAttributeNS(ODF_NAMESPACES.text, "outline-level")).toBe("1");
    }
  } finally {
    source.document.Dispose();
  }
});

it("roundtrips a numbered heading and its chapter fields and reference through layout, Worker and ODT" /** Applies the original outline rule and verifies its consumers through the real ODT streams. @returns Completion. */, async () => {
  const empty = new SwDoc();
  const base = writeOdtXml(empty, metadata).files;
  empty.Dispose();
  const styles = `<office:document-styles ${ns}><office:styles><style:style style:name="Heading_20_1" style:family="paragraph" style:default-outline-level="1"/><text:outline-style style:name="Outline"><text:outline-level-style text:level="1" style:num-format="1" style:num-prefix="§" style:num-suffix="." text:start-value="7"/></text:outline-style></office:styles></office:document-styles>`;
  const content = `<office:document-content ${ns}><office:body><office:text><text:h text:style-name="Heading_20_1" text:outline-level="1">Heading<text:tab/>One</text:h><text:p><text:bookmark text:name="Target"/>Body</text:p><text:p><text:chapter/>|<text:chapter text:display="plain-number-and-name"/>|<text:chapter text:display="number"/>|<text:bookmark-ref text:ref-name="Target" text:reference-format="chapter">old</text:bookmark-ref></text:p></office:text></office:body></office:document-content>`;
  const input = await packXmlPackage({ ...base, "styles.xml": styles, "content.xml": content });
  const source = await readOdtDocument(input, metadata);
  const document = source.document;
  const root = new SwRootFrame(
    /** Borrows the actual document of these formatted frames. @returns Writer document. */
    () => document,
  );
  try {
    expect(document.paragraphs[0]?.GetNumString()).toBe("§7.");
    root.Format(
      document.paragraphs.map(
        /** Measures one line per native paragraph. @param node - Actual paragraph. @param index - Source order. @returns Frame input. */
        (node, index) => ({
          id: String(index),
          lines: [{ start: 0, end: node.Len(), height: 200 }],
        }),
      ),
      document.GetPageDesc().GetValue(),
      undefined,
      new SwLineNumberInfo().QueryValue(),
    );
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const bytes = await writeOdtDocument(restored.document, metadata);
      const archive = await DocumentArchive.open(bytes);
      const body = await readXml(archive, "content.xml");
      const fields = Array.from(body.getElementsByTagNameNS(ODF_NAMESPACES.text, "chapter"));
      expect(
        fields.map(
          /** Reads the formatted and serialized current chapter. @param field - ODF chapter. @returns Presentation. */
          (field) => field.textContent,
        ),
      ).toEqual(["§7. Heading One", "7 Heading One", "§7."]);
      const reference = body.getElementsByTagNameNS(ODF_NAMESPACES.text, "bookmark-ref")[0];
      expect(reference?.getAttributeNS(ODF_NAMESPACES.text, "reference-format")).toBe("chapter");
      expect(reference?.textContent).toBe("7");
      expect(body.getElementsByTagNameNS(ODF_NAMESPACES.text, "list")).toHaveLength(0);
      const reloaded = await readOdtDocument(bytes, metadata);
      try {
        expect(reloaded.document.paragraphs[0]?.GetNumString()).toBe("§7.");
        expect(reloaded.document.GetOutlineNumRule().Get(0).GetStart()).toBe(7);
      } finally {
        reloaded.document.Dispose();
      }
    } finally {
      restored.document.Dispose();
    }
  } finally {
    SwFrame.DestroyFrame(root);
    document.Dispose();
  }
});
