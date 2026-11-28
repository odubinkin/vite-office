/** @fileoverview Verifies Writer sequence masters and native ODT caption fields. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Caption sequences" };

it("retains the pinned tdf99689 figures numbering through the Worker and ODT" /** Replays the caption field portion of testTdf99689TableOfFigures. @returns Completion. */, async () => {
  const fixture =
    "../../vendor/libreoffice-reference/sw/qa/extras/uiwriter/data/tdf99689_figures.odt";
  const source = await readOdtDocument(new Uint8Array(readFileSync(fixture)), metadata);
  try {
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const archive = await DocumentArchive.open(
        await writeOdtDocument(restored.document, metadata),
      );
      const xml = new DOMParser().parseFromString(
        await archive.readTextEntry("content.xml"),
        "application/xml",
      );
      const sequences = Array.from(xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "sequence"));
      expect(sequences).toHaveLength(3);
      expect(
        sequences.map(
          /** Reads the caption field display. @param field - Exported sequence. @returns Presentation. */
          (field) => field.textContent,
        ),
      ).toEqual(["1", "2", "3"]);
      for (const field of sequences) {
        expect(field.getAttributeNS(ODF_NAMESPACES.text, "name")).toBe("Illustration");
        expect(field.getAttributeNS(ODF_NAMESPACES.text, "formula")).toBe("ooow:Illustration+1");
      }
    } finally {
      restored.document.Dispose();
    }
  } finally {
    source.document.Dispose();
  }
});

it("backpatches the pinned forward sequence references before Worker and ODT export" /** Replays the sequence-target portion of testReferenceLanguage. @returns Completion. */, async () => {
  const fixture =
    "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/referencelanguage.odt";
  const source = await readOdtDocument(new Uint8Array(readFileSync(fixture)), metadata);
  try {
    const restored = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    try {
      const archive = await DocumentArchive.open(
        await writeOdtDocument(restored.document, metadata),
      );
      const xml = new DOMParser().parseFromString(
        await archive.readTextEntry("content.xml"),
        "application/xml",
      );
      const sequences = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "sequence");
      const references = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "sequence-ref");
      expect(sequences).toHaveLength(2);
      expect(references).toHaveLength(2);
      const target = sequences[1]?.getAttributeNS(ODF_NAMESPACES.text, "ref-name");
      expect(target).toBe("refIllustration1");
      expect(references[0]?.getAttributeNS(ODF_NAMESPACES.text, "ref-name")).toBe(target);
      expect(references[0]?.getAttributeNS(ODF_NAMESPACES.text, "reference-format")).toBe("value");
      expect(references[0]?.getAttributeNS(ODF_NAMESPACES.loext, "reference-language")).toBe("Hu");
      expect(references[0]?.textContent).toBe("A 2");
      expect(references[1]?.getAttributeNS(ODF_NAMESPACES.text, "ref-name")).toBe(target);
    } finally {
      restored.document.Dispose();
    }
  } finally {
    source.document.Dispose();
  }
});

it("recalculates authored sequence expressions and forward caption references" /** Verifies the native ordered sequence pass and caption expansion after fields update. @returns Nothing. */, () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:ooow="${ODF_NAMESPACES.ooow}"`;
  const styles = `<office:document-styles ${ns}/>`;
  const content = `<office:document-content ${ns}><office:body><office:text><text:sequence-decls><text:sequence-decl text:name="Example" text:display-outline-level="0"/></text:sequence-decls><text:p><text:sequence-ref text:ref-name="later" text:reference-format="value">old</text:sequence-ref></text:p><text:p>Example <text:sequence text:name="Example" text:formula="ooow:Example+1">old</text:sequence>: first</text:p><text:p>Example <text:sequence text:name="Example" text:ref-name="later" text:formula="ooow:Example+2*2">old</text:sequence>: next</text:p></office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(styles, content, metadata);
  try {
    document.getIDocumentFieldsAccess().UpdateRefFields();
    expect(
      document.paragraphs[0]
        ?.GetpSwpHints()
        ?.GetReferenceFields()[0]
        ?.GetAttr()
        .GetField()
        .Expand(),
    ).toBe("5");
    expect(
      document.paragraphs[1]?.GetpSwpHints()?.GetSequenceFields()[0]?.GetAttr().GetField().Expand(),
    ).toBe("1");
    expect(
      document.paragraphs[2]?.GetpSwpHints()?.GetSequenceFields()[0]?.GetAttr().GetField().Expand(),
    ).toBe("5");
  } finally {
    document.Dispose();
  }
});
