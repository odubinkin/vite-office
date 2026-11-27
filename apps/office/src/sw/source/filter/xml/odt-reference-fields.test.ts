/** @fileoverview Pinned native Writer bookmark and reference-mark fields through ODT and Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { CH_TXTATR_BREAKWORD } from "../../../inc/hintids";
import { RefFieldFormat } from "../../../inc/reffld";
import { ReferencesSubtype } from "../../../inc/reffldsubtype";
import type { SwDoc } from "../../core/doc/doc";
import { GetTextNodeExpandedText } from "../../core/txtnode/ndtxt-hints";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const fixtures = "../../vendor/libreoffice-reference/sw/qa";
const metadata = { title: "Named references" };

/** Returns the single native reference field in the pinned test input. @param document - Writer model. @returns Original field hint. */
function getReference(document: SwDoc) {
  const fields = document
    .GetNodes()
    .entries()
    .flatMap(
      /** Reads the real fields of the text node. @param node - Document node. @returns Native reference hints. */
      (node) => node.GetTextNode()?.GetpSwpHints()?.GetReferenceFields() ?? [],
    );
  expect(fields).toHaveLength(1);
  const [field] = fields;
  assert(field);
  return field;
}

it("keeps the native field result from testTdf157287 and updates its named mark text", /** Checks native mark resolution, Worker transport and XML round trip. @returns Completion. */ async () => {
  const bytes = readFileSync(`${fixtures}/core/txtnode/data/tdf157287.odt`);
  const { document } = await readOdtDocument(new Uint8Array(bytes), metadata);
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const original = getReference(document).GetAttr().GetField();
    expect(original.GetData()).toMatchObject({
      name: "Summa",
      source: ReferencesSubtype.SetRefAttr,
      format: RefFieldFormat.Content,
    });
    expect(original.Expand()).toBe("30");
    const mark = document.GetRefMark("Summa")?.GetTextRefMark();
    const source = mark?.GetTextNode();
    assert(mark && source);
    source.InsertText("2", mark.GetStart() + 1);
    document.getIDocumentFieldsAccess().UpdateRefFields();
    expect(original.Expand()).toBe("320");
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    expect(getReference(worker).GetAttr().GetField().Expand()).toBe("320");
    const saved = await writeOdtDocument(worker, metadata);
    const content = await (await DocumentArchive.open(saved)).readTextEntry("content.xml");
    expect(content).toContain(
      '<text:reference-ref text:reference-format="text" text:ref-name="Summa">320</text:reference-ref>',
    );
    expect(content).not.toContain(CH_TXTATR_BREAKWORD);
    reopened = (await readOdtDocument(saved, metadata)).document;
    expect(getReference(reopened).GetAttr().GetField().Expand()).toBe("320");
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});

it("expands the original bookmark reference text from testTdf159101", /** Checks the text that the pinned layout ultimately presents as two portions. @returns Completion. */ async () => {
  const bytes = readFileSync(`${fixtures}/extras/layout/data/tdf159101.odt`);
  const { document } = await readOdtDocument(new Uint8Array(bytes), metadata);
  try {
    const field = getReference(document);
    expect(field.GetAttr().GetField().GetData().source).toBe(ReferencesSubtype.Bookmark);
    document.getIDocumentFieldsAccess().UpdateRefFields();
    const paragraph = field.GetTextNode();
    assert(paragraph);
    expect(GetTextNodeExpandedText(paragraph, field.GetStart(), field.GetStart() + 1)).toBe(
      "One two",
    );
  } finally {
    document.Dispose();
  }
});
