/** @fileoverview Original Word outline and fill cases through Writer import, Worker and export. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { DocxExport } from "./docxexport";

const word = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const effects = "http://schemas.microsoft.com/office/word/2010/wordml";

/** Reads the entire upstream effect subtree with ordered children and unordered attributes. @param element - Word effect element. @returns Namespace-qualified XML structure. */
function signature(element: Element): unknown {
  return {
    name: [element.namespaceURI, element.localName],
    attributes: Object.fromEntries(
      Array.from(
        element.attributes,
        /** Keys the attribute by namespace and name. @param attribute - XML attribute. @returns Qualified attribute and value. */ (
          attribute,
        ) => [
          `${attribute.namespaceURI}:${attribute.localName}`,
          element.localName === "srgbClr" ? attribute.value.toUpperCase() : attribute.value,
        ],
      ),
    ),
    children: Array.from(element.childNodes)
      .filter(
        /** Selects effect elements alone. @param node - Child. @returns Whether it is an element. */ (
          node,
        ): node is Element => node.nodeType === 1,
      )
      .map(signature),
  };
}

/** Selects the first run in each body paragraph as in the original XPath assertions. @param bytes - DOCX package. @param name - Effect name. @returns Effects by paragraph. */
async function paragraphEffects(bytes: Uint8Array, name: string) {
  const archive = await DocumentArchive.open(bytes);
  const xml = await archive.readTextEntry("word/document.xml");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const body = doc.getElementsByTagNameNS(word, "body").item(0);
  assert(body);
  return Array.from(
    body.getElementsByTagNameNS(word, "p"),
    /** Reads the complete effect subtree from the first run. @param paragraph - Body paragraph. @returns Any effects attached to the first run. */
    (paragraph) =>
      Array.from(
        paragraph.getElementsByTagNameNS(word, "r")[0]?.getElementsByTagNameNS(effects, name) ?? [],
        signature,
      ),
  );
}

it.each([
  ["Outline", "textOutline", [1, 1, 1]],
  ["Fill", "textFill", [0, 1, 1, 1]],
] as const)(
  "preserves the original LibreOffice Word text %s test cases",
  /** Ports Test_TextEffects_TextOutline and Test_TextEffects_TextFill, comparing all supported descendants after reload. @param fixture - Upstream fixture suffix. @param name - Word element. @param counts - Expected effect count in each paragraph. @returns Completion. */
  async (fixture, name, counts) => {
    const bytes = new Uint8Array(
      readFileSync(
        `../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/TextEffects_Text${fixture}.docx`,
      ),
    );
    const expected = await paragraphEffects(bytes, name);
    expect(
      expected.map(
        /** Counts the effects per original paragraph. @param values - Paragraph effects. @returns Number of effects. */ (
          values,
        ) => values.length,
      ),
    ).toEqual(counts);
    const source = await importOOXML(bytes, {});
    try {
      const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
      try {
        const exported = await DocxExport.WriteDocument(worker);
        expect(await paragraphEffects(exported, name)).toEqual(expected);
        const reopened = await importOOXML(exported, {});
        try {
          expect(await paragraphEffects(await DocxExport.WriteDocument(reopened), name)).toEqual(
            expected,
          );
        } finally {
          reopened.Dispose();
        }
      } finally {
        worker.Dispose();
      }
    } finally {
      source.Dispose();
    }
  },
);
