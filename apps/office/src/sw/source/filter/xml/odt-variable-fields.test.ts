/** @fileoverview Replays Writer ODT user-field declarations in header text, tables and frames. */
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

const metadata = { title: "Named Writer fields" };

it.each([
  ["user-field-decl.odt", "Field.InTable", "valueTable"],
  ["user-field-decl-fly.odt", "Field.InFrame", "valueFrame"],
])(
  "retains both native header declarations and occurrences from %s",
  /** Replays pinned testUserFieldDecl and testUserFieldDeclFly through Worker and ODT. @param file - Pinned ODT. @param name - Nested field master. @param value - Expected text. @returns Completion. */ async (
    file,
    name,
    value,
  ) => {
    const source = await readOdtDocument(
      new Uint8Array(
        readFileSync(`../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/${file}`),
      ),
      metadata,
    );
    try {
      const restored = await restoreOdtWorkerDocumentAsync(
        structuredClone(createOdtWorkerDocument(source)),
        undefined,
        () => false,
      );
      try {
        const saved = await writeOdtDocument(restored.document, metadata);
        const archive = await DocumentArchive.open(saved);
        const xml = new DOMParser().parseFromString(
          await archive.readTextEntry("styles.xml"),
          "application/xml",
        );
        const header = xml.getElementsByTagNameNS(ODF_NAMESPACES.style, "header")[0];
        const declarations = header?.getElementsByTagNameNS(ODF_NAMESPACES.text, "user-field-decl");
        expect(declarations).toHaveLength(2);
        const fields = Array.from(
          header?.getElementsByTagNameNS(ODF_NAMESPACES.text, "user-field-get") ?? [],
        );
        expect(fields).toHaveLength(2);
        const occurrence = fields.find(
          /** Finds the nested dependency. @param field - User field occurrence. @returns Whether it names the nested master. */
          (field) => field.getAttributeNS(ODF_NAMESPACES.text, "name") === name,
        );
        expect(occurrence?.textContent).toBe(value);
      } finally {
        restored.document.Dispose();
      }
    } finally {
      source.document.Dispose();
    }
  },
);

it("updates named string and numeric fields in document order", /** Verifies variable set/get and numeric user values in the expression pass. @returns Completion. */ async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:ooow="${ODF_NAMESPACES.ooow}"`;
  const styles = `<office:document-styles ${ns}/>`;
  const content = `<office:document-content ${ns}><office:body><office:text>
    <text:user-field-decls><text:user-field-decl text:name="base" office:value-type="float" office:value="9"/></text:user-field-decls>
    <text:variable-decls><text:variable-decl text:name="amount" office:value-type="float"/><text:variable-decl text:name="word" office:value-type="string"/></text:variable-decls>
    <text:p><text:variable-set text:name="amount" office:value-type="float" text:formula="ooow:base*2">old</text:variable-set></text:p>
    <text:p><text:variable-set text:name="word" office:value-type="string">green</text:variable-set></text:p>
    <text:p><text:variable-get text:name="amount">old</text:variable-get></text:p>
    <text:p><text:variable-get text:name="word">old</text:variable-get></text:p>
    <text:p><text:expression text:formula="ooow:amount+base">old</text:expression></text:p>
  </office:text></office:body></office:document-content>`;
  const { document } = importWriterXml(styles, content, metadata);
  try {
    document.getIDocumentFieldsAccess().UpdateExpFields();
    const archive = await DocumentArchive.open(await writeOdtDocument(document, metadata));
    const xml = new DOMParser().parseFromString(
      await archive.readTextEntry("content.xml"),
      "application/xml",
    );
    const getters = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "variable-get");
    expect(getters[0]?.textContent).toBe("18");
    expect(getters[1]?.textContent).toBe("green");
    expect(xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "expression")[0]?.textContent).toBe(
      "27",
    );
  } finally {
    document.Dispose();
  }
});
