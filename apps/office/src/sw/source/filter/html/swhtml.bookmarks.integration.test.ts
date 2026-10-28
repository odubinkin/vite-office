/** @fileoverview Actual native HTML ID/named-target producers, deferred bookmark queue ordering and Markdown/Worker transport. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { RtfExport } from "../ww8/rtfexport";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { MarkdownReader } from "../md/swmd";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const documents: SwDoc[] = [];
afterEach(
  /** Releases actual owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Imports into the actual blank paragraph used by Markdown HTML insertion. @param source - HTML. @returns Original document. */
function read(source: string): SwDoc {
  const doc = new SwDoc();
  documents.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    cursor = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(
    doc,
    cursor,
    new SvStream(OUStringToOString(source, RTL_TEXTENCODING_UTF8), RTL_TEXTENCODING_UTF8),
  );
  try {
    expect(parser.CallParser()).toBe(SvParserState.Accepted);
    return doc;
  } finally {
    parser.SourceDispose();
    cursor.Dispose();
  }
}
/** Reads the real bookmark owner and retained paragraph identity. @param doc - Actual model. @returns Ordered names/body indices/content offsets. */
function marks(doc: SwDoc) {
  return doc
    .GetIDocumentMarkAccess()
    .GetBookmarks()
    .map(
      /** Projects native positions for assertions. @param mark - Actual mark. @returns Position identity. */ (
        mark,
      ) => [
        mark.GetName(),
        doc.paragraphs.indexOf(mark.GetMarkPos().GetNode() as (typeof doc.paragraphs)[number]),
        mark.GetMarkPos().GetContentIndex(),
      ],
    );
}
it("turns ID-only HTML options into native point bookmarks", /** No style string or DOM element tree is required. @returns Nothing. */ () => {
  expect(marks(read('<p id="paragraph">A<span id="inside">B</span>C</p>'))).toEqual([
    ["paragraph", 0, 0],
    ["inside", 0, 1],
  ]);
});
it("retains IDs across native semantic, legacy-font and block producers", /** All connected original ParseStyleOptions callers feed the same InsertAttrs bookmark path. @returns Nothing. */ () => {
  const doc = read(
    '<p id="p"><b id="b">A</b><strong id="strong">B</strong><font id="font" size="5">C</font><basefont id="base">D</basefont></p><h2 id="h">E</h2><blockquote id="q">F</blockquote><pre id="pre">G</pre>',
  );
  const index = new Map(
    doc
      .GetIDocumentMarkAccess()
      .GetBookmarks()
      .map(
        /** Reads actual name/offset pairs. @param mark - Actual owner. @returns Name and offset. */ (
          mark,
        ) => [mark.GetName(), mark.GetMarkPos().GetContentIndex()],
      ),
  );
  expect([...index.keys()].sort()).toEqual(["b", "base", "font", "h", "p", "pre", "q", "strong"]);
  expect(index.get("strong")).toBe(1);
  expect(index.get("font")).toBe(2);
  expect(index.get("base")).toBe(3);
});
it("deduplicates the same native bookmark name at the same point", /** SetAttr_ checks the existing original-name mark before requesting a new name. @returns Nothing. */ () => {
  expect(marks(read('<span id="same"></span><b id="same">A</b>'))).toEqual([["same", 0, 0]]);
});
it("preserves reverse pending-queue name allocation within one paragraph", /** The later queued same-name target is created first by native SetAttr_. @returns Nothing. */ () => {
  expect(marks(read('<span id="same">A</span><span id="same">B</span>'))).toEqual([
    ["same Copy 1", 0, 0],
    ["same", 0, 1],
  ]);
});
it("allocates duplicate names in input order when a paragraph boundary flushes the queue", /** Native pending admission precedes the next paragraph's target. @returns Nothing. */ () => {
  expect(marks(read('<p id="same">A</p><p id="same">B</p>'))).toEqual([
    ["same", 0, 0],
    ["same Copy 1", 1, 0],
  ]);
});
it("keeps source bookmark whitespace and encoded spelling", /** Decoding is only for implicit-name filtering, not stored-name rewriting. @returns Nothing. */ () => {
  expect(marks(read('<a name=" Keep%20Raw ">A</a>'))).toEqual([[" Keep%20Raw ", 0, 0]]);
});
it("rejects implicit Writer target suffixes after native Unambiguous decoding", /** Source strips ASCII spaces and folds ASCII case only for the suffix comparison. @returns Nothing. */ () => {
  const doc = read(
    '<a name="skip%7C%20Ta%20BlE">A</a><a name="keep|custom">B</a><span id="keep|table">C</span>',
  );
  expect(marks(doc)).toEqual([
    ["keep|custom", 0, 1],
    ["keep|table", 0, 2],
  ]);
});
it("does not make an anchor NAME bookmark when HREF is present", /** Native HREF names belong to SwFormatINetFormat, whose URL producer remains pending. @returns Nothing. */ () => {
  expect(marks(read('<a name="link-name" href="#target" id="element-id">A</a>'))).toEqual([
    ["element-id", 0, 0],
  ]);
});
it("retains an ID-only empty tail paragraph containing a native bookmark", /** Existing native EOF cleanup must keep marked node ownership. @returns Nothing. */ () => {
  const doc = read('<p>A</p><p id="tail"></p>');
  expect(
    doc.paragraphs.map(
      /** Reads actual nodes. @param node - Node. @returns Text. */ (node) => node.GetText(),
    ),
  ).toEqual(["A", ""]);
  expect(marks(doc)).toEqual([["tail", 1, 0]]);
});
it("preserves actual Markdown HTML bookmarks through the existing Worker codec", /** Uses the production Markdown raw-HTML callback and real mark serialization. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p id="body">A<a name="point">B</a></p>', RTL_TEXTENCODING_UTF8),
  );
  documents.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  documents.push(restored);
  expect(marks(restored)).toEqual([
    ["body", 0, 0],
    ["point", 0, 1],
  ]);
});
it("clamps queued bookmark positions after native trailing-BR removal", /** SetAttr_ retains raw source positions until the actual content owner is available. @returns Nothing. */ () => {
  expect(marks(read('<p>A<br><a name="tail"></a></p>'))).toEqual([["tail", 0, 1]]);
});

it("exports imported HTML point marks through the existing native RTF path", /** Actual document marks must be consumed by the real RTF writer and reader. @returns Nothing. */ () => {
  const doc = read('<p id="body">A<a name="point">B</a></p>');
  const restored = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(doc));
  documents.push(restored);
  expect(marks(restored)).toEqual([
    ["body", 0, 0],
    ["point", 0, 1],
  ]);
});
