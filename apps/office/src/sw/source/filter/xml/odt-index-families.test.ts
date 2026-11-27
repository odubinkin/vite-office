/** @fileoverview Original alphabetical and user-defined Writer indexes across ODT and Worker I/O. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { LANGUAGE_ENGLISH_US } from "../../../../i18nlangtag/inc/lang";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { SwSectionNode } from "../../core/docnode/ndsect";
import { SectionType } from "../../core/docnode/section";
import { SwTOXBaseSection } from "../../core/inc/doctxm";
import { FormTokenType, SwTOIOptions, SwTOXElement, TOXTypes } from "../../core/tox/tox";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Writer index families" };

/** Reads a pinned index document and preserves all owned models for the assertions. @param path - Source QA fixture. @param check - Checks each native document. @returns Exported content. */
async function checkRoundTrip(path: string, check: (document: SwDoc) => void): Promise<string> {
  const file = readFileSync("../../vendor/libreoffice-reference/sw/qa/" + path);
  const source = (await readOdtDocument(new Uint8Array(file), metadata)).document;
  const documents = [source];
  try {
    check(source);
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    documents.push(worker);
    check(worker);
    const output = await writeOdtDocument(worker, metadata);
    const reopened = (await readOdtDocument(output, metadata)).document;
    documents.push(reopened);
    check(reopened);
    return (await DocumentArchive.open(output)).readTextEntry("content.xml");
  } finally {
    for (const document of documents) document.Dispose();
  }
}

/** Reads the original connected index sections in node order. @param document - Actual Writer document. @param type - Index family. @returns Connected nodes. */
function indexes(document: SwDoc, type: TOXTypes): SwSectionNode[] {
  return Array.from(document.GetNodes().entries()).filter(
    /** Inspects the native section and its registered type. @param node - Original node. @returns Whether it is a connected index of the requested family. */
    (node): node is SwSectionNode => {
      if (!(node instanceof SwSectionNode)) return false;
      const section = node.GetSection();
      return section instanceof SwTOXBaseSection && section.tox.type.type === type;
    },
  );
}

it("preserves the configured alphabetical index and the separator template", /** Uses the native tdf144672 alphabetical index source. @returns Completion. */ async () => {
  const xml = await checkRoundTrip("uitest/data/tdf144672.odt", (document) => {
    const [node] = indexes(document, TOXTypes.Index);
    assert(node);
    const section = node.GetSection();
    assert(section instanceof SwTOXBaseSection);
    const tox = section.tox;
    expect(tox.type).toBe(document.GetTOXType(TOXTypes.Index));
    expect(tox.name).toBe("Alphabetical Index1");
    expect(tox.title).toBe("Alphabetical Index");
    expect(tox.language).toBe(LANGUAGE_ENGLISH_US);
    expect(tox.mainEntryCharStyle).toBe("Main Index Entry");
    expect(tox.sortAlgorithm).toBe("alphanumeric");
    expect(tox.indexOptions).toBe(
      SwTOIOptions.SameEntry | SwTOIOptions.CaseSensitive | SwTOIOptions.FF,
    );
    expect(tox.form.GetFormMax()).toBe(5);
    expect(tox.form.GetTemplate(1)).toBe("Index Separator");
    expect(tox.form.GetPattern(1).map((token) => token.eTokenType)).toEqual([
      FormTokenType.EntryText,
    ]);
    const [title] = document.GetNodes().GetSectionBlocks(node);
    expect(title instanceof SwSectionNode && title.GetSection().GetSectionData().type).toBe(
      SectionType.ToxHeader,
    );
  });
  expect(xml).toContain('text:alphabetical-index-entry-template text:outline-level="separator"');
  expect(xml).toContain('text:sort-algorithm="alphanumeric" fo:language="en" fo:country="US"');
});

it("keeps the user-defined index's type, source switches and cached frame and table entries", /** Checks the original cached index from tdf153636 before any regeneration. @returns Completion. */ async () => {
  const xml = await checkRoundTrip("extras/uiwriter/data/tdf153636.odt", (document) => {
    const [node] = indexes(document, TOXTypes.User);
    assert(node);
    const section = node.GetSection();
    assert(section instanceof SwTOXBaseSection);
    const tox = section.tox;
    expect(tox.type).toBe(document.GetTOXType(TOXTypes.User));
    expect(tox.name).toBe("User-Defined1");
    expect(tox.title).toBe("User-Defined Index");
    expect(tox.createType).toBe(
      SwTOXElement.Graphic | SwTOXElement.Mark | SwTOXElement.Table | SwTOXElement.Frame,
    );
    expect(tox.levelFromChapter).toBe(true);
    expect(tox.form.GetFormMax()).toBe(11);
    expect(tox.form.GetTemplate(1)).toBe("User Index 1");
    const [, ...entries] = document.GetNodes().GetSectionBlocks(node);
    expect(entries.map((entry) => entry.GetTextNode()?.GetText())).toEqual([
      "Frame1\t1",
      "SecondTable\t1",
      "Image1\t1",
      "FirstTable\t1",
    ]);
  });
  expect(xml).toContain('text:copy-outline-levels="true" text:index-name="User-Defined"');
});
