/** @fileoverview Ports original Writer metadata assertions through the actual ODT package and Worker graph. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";
import { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument, writeOdtXml } from "./wrtxml";

const fixtures = "../../vendor/libreoffice-reference/sfx2/qa/complex/sfx2/testdocuments";

it.each(["TEST.odt", "CUSTOM.odt"])(
  "uses the native document properties from %s in a normal Writer package",
  /** Ports metadata fixtures using their original meta.xml stream. @param fixture - LibreOffice ODT fixture. @returns Completion. */ async (
    fixture,
  ) => {
    const original = await DocumentArchive.open(
      new Uint8Array(readFileSync(`${fixtures}/${fixture}`)),
    );
    const content = await original.readTextEntry("meta.xml");
    const initial = new SwDoc();
    const packageXml = writeOdtXml(initial, { title: "Fallback" });
    initial.Dispose();
    const bytes = await packXmlPackage({ ...packageXml.files, "meta.xml": content });
    const originalImport = await readOdtDocument(bytes, { title: "Fallback" });
    const worker = restoreOdtWriterTransfer(
      structuredClone(createOdtWriterTransfer(originalImport.document)),
    );
    try {
      const output = await writeOdtDocument(worker, { title: "Renamed document" });
      const archive = await DocumentArchive.open(output);
      const meta = await archive.readTextEntry("meta.xml");
      const dom = new DOMParser().parseFromString(meta, "application/xml");
      expect(dom.documentElement.getAttributeNS(ODF_NAMESPACES.office, "version")).toBe("1.3");
      expect(dom.getElementsByTagNameNS(ODF_NAMESPACES.dc, "title")[0]?.textContent).toBe(
        "Renamed document",
      );
      if (fixture === "TEST.odt") {
        expect(originalImport.title).toBe("Urgent Memo");
        const properties = worker.documentProperties.GetDocumentProperties();
        const author = properties.getAuthor();
        try {
          expect(text(author)).toBe("Karl-Heinz Mustermann");
        } finally {
          author.dispose();
        }
        expect(dom.getElementsByTagNameNS(ODF_NAMESPACES.dc, "subject")[0]?.textContent).toBe(
          "Wichtige Mitteilung",
        );
        expect(meta).toContain("Hinweis");
        expect(meta).toContain("Warnung");
      } else {
        expect(originalImport.title).toBe("Fallback");
        expect(dom.getElementsByTagNameNS("http://foo.net", "baz")[0]?.textContent).toBe("bar");
        const custom = dom.getElementsByTagNameNS("http://foo.net", "bar")[0];
        expect(
          custom
            ?.getElementsByTagNameNS("http://baz.net", "foo")[0]
            ?.getAttributeNS("http://baz.net", "bar"),
        ).toBe("foo");
        expect(dom.getElementsByTagName("bork")[0]?.textContent).toBe("bork");
      }
      const reopened = await readOdtDocument(output, { title: "Other fallback" });
      try {
        expect(reopened.title).toBe("Renamed document");
      } finally {
        reopened.document.Dispose();
      }
    } finally {
      worker.Dispose();
      originalImport.document.Dispose();
    }
  },
);
