/** @fileoverview Verifies native ODT placeholder and drop-down text fields. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument, writeOdtXml } from "./wrtxml";

const metadata = { title: "Choice fields" };

/** Parses one output stream. @param archive - Actual ODT package. @param name - XML stream name. @returns Parsed document. */
async function readXml(archive: DocumentArchive, name: string): Promise<Document> {
  return new DOMParser().parseFromString(await archive.readTextEntry(name), "application/xml");
}

it("preserves the pinned tdf106663 placeholders in anchored text and headers" /** Replays the field portion of testTdf106663HeaderTextFrameGoToNextPlacemarker. @returns Completion. */, async () => {
  const fixture = "../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/testTdf106663.odt";
  const source = await readOdtDocument(new Uint8Array(readFileSync(fixture)), metadata);
  try {
    const output = await DocumentArchive.open(await writeOdtDocument(source.document, metadata));
    const body = await readXml(output, "content.xml");
    const styles = await readXml(output, "styles.xml");
    const texts = [
      ...Array.from(body.getElementsByTagNameNS(ODF_NAMESPACES.text, "placeholder")),
      ...Array.from(styles.getElementsByTagNameNS(ODF_NAMESPACES.text, "placeholder")),
    ].map(
      /** Reads the original placeholder presentation. @param field - ODF field. @returns Presentation. */
      (field) => field.textContent,
    );
    expect(texts).toEqual(["<Date>", "<Marker>", "<#Aktenzahl;>"]);
  } finally {
    source.document.Dispose();
  }
});

it("keeps native placeholder and drop-down choices through the Worker and ODT" /** Checks authored choices, selection, hint, and dynamic presentation. @returns Completion. */, async () => {
  const document = new SwDoc();
  const base = writeOdtXml(document, metadata).files;
  document.Dispose();
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}"`;
  const content = `<office:document-content ${ns}><office:body><office:text><text:p><text:placeholder text:placeholder-type="image" text:description="Select image">&lt;Image&gt;</text:placeholder><text:drop-down text:name="Choices" text:help="Help" text:hint="Hint"><text:label text:value="One"/><text:label text:value="Two" text:current-selected="true"/><text:label text:value="Two"/>old</text:drop-down><text:drop-down text:name="Default"><text:label text:value="First"/></text:drop-down></text:p></office:text></office:body></office:document-content>`;
  const source = await readOdtDocument(
    await packXmlPackage({ ...base, "content.xml": content }),
    metadata,
  );
  try {
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const saved = await DocumentArchive.open(await writeOdtDocument(restored.document, metadata));
      const output = await readXml(saved, "content.xml");
      const placeholder = output.getElementsByTagNameNS(ODF_NAMESPACES.text, "placeholder")[0];
      expect(placeholder?.textContent).toBe("<Image>");
      expect(placeholder?.getAttributeNS(ODF_NAMESPACES.text, "description")).toBe("Select image");
      expect(placeholder?.getAttributeNS(ODF_NAMESPACES.text, "placeholder-type")).toBe("image");
      const choices = output.getElementsByTagNameNS(ODF_NAMESPACES.text, "drop-down");
      expect(choices[0]?.textContent).toBe("Two");
      expect(choices[0]?.getAttributeNS(ODF_NAMESPACES.text, "help")).toBe("Help");
      expect(choices[0]?.getAttributeNS(ODF_NAMESPACES.text, "hint")).toBe("Hint");
      expect(choices[1]?.textContent).toBe("First");
      const labels = choices[0]?.getElementsByTagNameNS(ODF_NAMESPACES.text, "label");
      expect(labels).toHaveLength(3);
      expect(labels?.[1]?.getAttributeNS(ODF_NAMESPACES.text, "current-selected")).toBe("true");
      expect(labels?.[2]?.getAttributeNS(ODF_NAMESPACES.text, "current-selected")).toBeNull();
    } finally {
      restored.document.Dispose();
    }
  } finally {
    source.document.Dispose();
  }
});
