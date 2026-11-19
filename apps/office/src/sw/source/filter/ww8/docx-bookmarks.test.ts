/** @fileoverview Pinned ordinary Writer range-bookmark regressions across DOCX and ODT. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../../package/source/zippackage/document-archive";
import { SwPaM } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import { SwXTextRange } from "../../core/unocore/unoobj2";
import { SwXText } from "../../core/unocore/unotext";
import { text } from "../../core/unocore/unocrsrhelper";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { importOOXML } from "../../writerfilter/filter/WriterFilter";
import { readOdtDocument } from "../xml/swxml";
import { writeOdtDocument } from "../xml/wrtxml";
import { DocxExport } from "./docxexport";

/** Reads original Calc-independent Writer regression packages. @param name - Fixture filename. @returns Package bytes. */
function sourceFixture(name: string): Uint8Array {
  return new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/" + name),
  );
}

/** Reads the original anchor selection through the canonical UNO range. @param document - Imported document. @param name - Bookmark name. @returns Selected text. */
function bookmarkText(document: SwDoc, name: string): string {
  const mark = document.GetIDocumentMarkAccess().FindMark(name);
  assert(mark);
  const range = new SwPaM(mark.GetMarkStart(), mark.IsExpanded() ? mark.GetMarkEnd() : undefined);
  try {
    const anchor = new SwXTextRange(range, new SwXText(document));
    try {
      const value = anchor.getString();
      try {
        return text(value);
      } finally {
        value.dispose();
      }
    } finally {
      anchor.dispose();
    }
  } finally {
    range.Dispose();
  }
}

it("retains overlapping bookmarks and a point bookmark from fdo85542", /** Replays all three original anchor text assertions and the DOCX round trip. @returns Completion. */ async () => {
  const original = await importOOXML(sourceFixture("fdo85542.docx"), {});
  let reopened: SwDoc | undefined, primary: SwDoc | undefined;
  try {
    expect(original.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(3);
    expect(bookmarkText(original, "B1")).toBe("ABB");
    expect(bookmarkText(original, "B2")).toBe("BBC");
    expect(bookmarkText(original, "B3")).toBe("");
    const point = original.GetIDocumentMarkAccess().FindMark("B3");
    assert(point);
    const at = point.GetMarkStart().GetContentIndex();
    expect(
      point
        .GetMarkStart()
        .GetNode()
        .GetTextNode()
        ?.GetText()
        .slice(at - 1, at + 1),
    ).toBe("AB");
    const meta = { title: "Overlapping bookmarks" };
    const odt = await writeOdtDocument(original, meta);
    primary = (await readOdtDocument(odt, meta)).document;
    expect(bookmarkText(primary, "B1")).toBe("ABB");
    expect(bookmarkText(primary, "B2")).toBe("BBC");
    const bytes = await DocxExport.WriteDocument(primary);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
    expect(xml.match(/<w:bookmarkStart\b/gu)).toHaveLength(3);
    expect(xml.match(/<w:bookmarkEnd\b/gu)).toHaveLength(3);
    reopened = await importOOXML(bytes, {});
    expect(bookmarkText(reopened, "B1")).toBe("ABB");
    expect(bookmarkText(reopened, "B2")).toBe("BBC");
    expect(bookmarkText(reopened, "B3")).toBe("");
  } finally {
    reopened?.Dispose();
    primary?.Dispose();
    original.Dispose();
  }
});

it.each([
  ["tdf65955.odt", { a: "", b: "r" }],
  ["tdf65955_2.odt", { test: "foo bar" }],
] as const)(
  "retains the original ODT boundary positions from %s",
  /** Replays the original collapsed/ranged anchor-text assertions after DOCX reload. @param fixture - Original ODT. @param expected - Original anchor strings. @returns Completion. */ async (
    fixture,
    expected,
  ) => {
    const source = (await readOdtDocument(sourceFixture(fixture), { title: "Bookmarks" })).document;
    let reopened: SwDoc | undefined;
    try {
      reopened = await importOOXML(await DocxExport.WriteDocument(source), {});
      expect(reopened.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(
        Object.keys(expected).length,
      );
      for (const [name, value] of Object.entries(expected))
        expect(bookmarkText(reopened, name)).toBe(value);
    } finally {
      reopened?.Dispose();
      source.Dispose();
    }
  },
);

it("keeps the original bookmark on the last empty paragraph in tdf123642", /** Replays the source bookmark-at-document-end assertions. @returns Completion. */ async () => {
  const source = await importOOXML(sourceFixture("tdf123642.docx"), {});
  let reopened: SwDoc | undefined;
  try {
    expect(source.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(1);
    const bytes = await DocxExport.WriteDocument(source);
    const xml = await (await DocumentArchive.open(bytes)).readTextEntry("word/document.xml");
    const paragraphs = xml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/gu);
    expect(paragraphs?.[1]).toContain('w:name="Bookmark1"');
    reopened = await importOOXML(bytes, {});
    expect(reopened.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(1);
    expect(bookmarkText(reopened, "Bookmark1")).toBe("");
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("closes a bookmark between paragraphs at the preceding paragraph end", /** Covers Word body-level marker placement and two native paragraph endpoints. @returns Completion. */ async () => {
  const original = await DocumentArchive.open(sourceFixture("fdo85542.docx"));
  const archive = new DocumentArchiveWriter();
  for (const part of ["[Content_Types].xml", "_rels/.rels"])
    archive.putNextEntry(part, await original.readEntry(part));
  archive.putNextEntry(
    "word/document.xml",
    new TextEncoder().encode(
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>A</w:t></w:r><w:bookmarkStart w:id="1" w:name="Across"/><w:r><w:t>B</w:t></w:r></w:p><w:p><w:r><w:t>CD</w:t></w:r></w:p><w:bookmarkEnd w:id="1"/><w:p><w:r><w:t>E</w:t></w:r></w:p></w:body></w:document>',
    ),
  );
  const document = await importOOXML(await archive.finish(), {});
  let reopened: SwDoc | undefined, worker: SwDoc | undefined;
  try {
    const mark = document.GetIDocumentMarkAccess().FindMark("Across");
    assert(mark);
    expect(mark.GetMarkEnd().GetNode().GetIndex()).toBe(document.paragraphs[1]?.GetIndex());
    expect(bookmarkText(document, "Across")).toBe("B\nCD");
    const metadata = { title: "Across two paragraphs" };
    const odt = await writeOdtDocument(document, metadata);
    const xml = await (await DocumentArchive.open(odt)).readTextEntry("content.xml");
    expect(xml).toContain('<text:bookmark-start text:name="Across"/>');
    expect(xml).toContain('<text:bookmark-end text:name="Across"/>');
    reopened = (await readOdtDocument(odt, metadata)).document;
    expect(bookmarkText(reopened, "Across")).toBe("B\nCD");
    const record = encodeWriterDocument(reopened);
    worker = decodeWriterDocument(record);
    expect(bookmarkText(worker, "Across")).toBe("B\nCD");
    const first = record.bookmarks?.[0];
    assert(first?.end);
    const boundary = first.end;
    expect(
      /** Rejects a stale second endpoint before publishing the graph. @returns Candidate document. */ () =>
        decodeWriterDocument({
          ...record,
          bookmarks: [{ ...first, end: { ...boundary, offset: 9999 } }],
        }),
    ).toThrow("bookmark position is invalid");
  } finally {
    worker?.Dispose();
    reopened?.Dispose();
    document.Dispose();
  }
});
