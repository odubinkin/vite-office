/** @fileoverview Original Writer point and ranged reference marks through ODT and Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { CH_TXTATR_INWORD } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Ports the two original reference mark portions and their surrounding whitespace. @param document - Original Writer model. */
function checkReferenceMarks(document: SwDoc): void {
  const point = document.GetRefMark("bar")?.GetTextRefMark();
  const range = document.GetRefMark("foo")?.GetTextRefMark();
  assert(point && range);
  expect(point.GetTextNode()?.GetText()).toBe(`X ${CH_TXTATR_INWORD} X`);
  expect([point.GetStart(), point.GetEnd()]).toEqual([2, undefined]);
  expect(range.GetTextNode()?.GetText()).toBe("X   X");
  expect([range.GetStart(), range.GetEnd()]).toEqual([2, 3]);
}

it("preserves point and range reference portions and spaces from testWhitespace", /** Exercises the original ODT and Worker graph with actual Writer hints. @returns Completion. */ async () => {
  const fixture = "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/whitespace.odt";
  const metadata = { title: "Reference marks" };
  const { document } = await readOdtDocument(new Uint8Array(readFileSync(fixture)), metadata);
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    checkReferenceMarks(document);
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    checkReferenceMarks(worker);
    const output = await writeOdtDocument(worker, metadata);
    const archive = await DocumentArchive.open(output);
    const content = await archive.readTextEntry("content.xml");
    expect(content).not.toContain(CH_TXTATR_INWORD);
    expect(content).toContain('<text:reference-mark text:name="bar"/>');
    expect(content).toContain('<text:reference-mark-start text:name="foo"/>');
    expect(content).toContain('<text:reference-mark-end text:name="foo"/>');
    reopened = (await readOdtDocument(output, metadata)).document;
    checkReferenceMarks(reopened);
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    document.Dispose();
  }
});
