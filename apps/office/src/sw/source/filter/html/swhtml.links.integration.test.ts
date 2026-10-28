/** @fileoverview Native HTML HREF, item insertion, A-tag style ownership and actual Markdown/Worker/RTF link integration. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { RES_CHRATR_COLOR, RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
import { MarkdownReader } from "../md/swmd";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RtfExport } from "../ww8/rtfexport";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
const documents: SwDoc[] = [];
afterEach(
  /** Releases actual model owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Actual HTML reader insertion over the native cursor, stream and deferred owners. @param source - Input HTML. @param base - Original base URL. @param path - Original medium path. @param configure - Optional native CSS-map setup. @returns Actual document. */
function read(
  source: string,
  base = "",
  path = "",
  configure?: (parser: SwHTMLParser) => void,
): SwDoc {
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
    new SvStream(OUStringToOString(source, UTF8), UTF8),
    path,
    base,
  );
  try {
    configure?.(parser);
    expect(parser.CallParser()).toBe(SvParserState.Accepted);
    return doc;
  } finally {
    parser.SourceDispose();
    cursor.Dispose();
  }
}
/** Reads actual native internet attributes, including empty destinations. @param doc - Model. @returns Owned hints. */
function links(doc: SwDoc): SwTextINetFormat[] {
  return doc.paragraphs.flatMap(
    /** Borrows hints from the actual node. @param node - Node. @returns Internet hints. */ (
      node,
    ) =>
      (node.GetpSwpHints()?.entries() ?? []).filter(
        /** Selects the native hint family. @param hint - Actual hint. @returns Type admission. */ (
          hint,
        ): hint is SwTextINetFormat => hint instanceof SwTextINetFormat,
      ),
  );
}
it("inserts HREF with original target, name, pool identities and context bounds", /** No portable hyperlink re-construction may intervene in the native insertion path. @returns Nothing. */ () => {
  const doc = read(
    '<p>A<a href="../target%20file" target="_blank" name=" Raw%20Name ">BC</a>D</p>',
    "https://Host.test/dir/source.md",
  );
  const hints = links(doc);
  expect(hints).toHaveLength(1);
  const hint = hints[0];
  assert(hint);
  expect([
    hint.start,
    hint.end,
    hint.format.GetValue(),
    hint.format.GetName(),
    hint.format.GetTargetFrame(),
  ]).toEqual([1, 3, "https://Host.test/target%20file", " Raw%20Name ", "_blank"]);
  expect(hint.format.GetINetFormatId()).toBe(P.CHR_INET_NORMAL);
  expect(hint.format.GetVisitedFormatId()).toBe(P.CHR_INET_VISIT);
  expect(hint.format.GetTextINetFormat()).toBe(hint);
  expect(hint.GetpTextNode()).toBe(doc.paragraphs[0]);
  expect(doc.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
});
it("uses SmartRel2Abs for HTML and preserves HREF presence after native parse failure", /** An empty resolved value remains a native item and never becomes a point bookmark. @returns Nothing. */ () => {
  const doc = read(
    '<a href="relative">A</a><a href="http://user@host" name="bad" target="_self">B</a><a href="" name="empty">C</a>',
  );
  expect(
    links(doc).map(
      /** Reads original values. @param hint - Native hint. @returns URL/name tuple. */ (hint) => [
        hint.format.GetValue(),
        hint.format.GetName(),
      ],
    ),
  ).toEqual([
    ["http://relative/", ""],
    ["", "bad"],
    ["", "empty"],
  ]);
  expect(doc.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
  const copy = decodeWriterDocument(encodeWriterDocument(doc));
  documents.push(copy);
  expect(
    links(copy).map(
      /** Reads retained native values. @param hint - Restored hint. @returns Value and pool identity. */ (
        hint,
      ) => [hint.format.GetValue(), hint.format.GetName(), hint.format.GetINetFormatId()],
    ),
  ).toEqual([
    ["http://relative/", "", P.CHR_INET_NORMAL],
    ["", "bad", P.CHR_INET_NORMAL],
    ["", "empty", P.CHR_INET_NORMAL],
  ]);
});
it("uses original medium parent for empty HREF and raw leading fragments for nonempty HREF", /** The native empty URL and fragment paths have different inputs. @returns Nothing. */ () => {
  const doc = read(
    '<a href="">A</a><a href="#raw%41">B</a>',
    "https://base.test/other/source.md",
    "https://medium.test/dir/document.md?q#old",
  );
  expect(
    links(doc).map(
      /** Reads actual URLs. @param hint - Hint. @returns Native URL. */ (hint) =>
        hint.format.GetValue(),
    ),
  ).toEqual(["https://medium.test/dir/", "#raw%41"]);
});
it("closes a previous anchor before a nested anchor and keeps adjacent links distinct", /** Source PopContext/EndContext happens before the next opening tag. @returns Nothing. */ () => {
  const doc = read(
    '<a href="https://a.test">A<a href="https://b.test">B</a>C</a><a href="https://b.test">D</a>',
  );
  expect(
    links(doc).map(
      /** Projects actual native range/value. @param hint - Hint. @returns Range tuple. */ (
        hint,
      ) => [hint.start, hint.end, hint.format.GetValue()],
    ),
  ).toEqual([
    [0, 1, "https://a.test/"],
    [1, 2, "https://b.test/"],
    [3, 4, "https://b.test/"],
  ]);
});
it("retains the source first-option precedence and implicit-target name filtering", /** Reverse option iteration and raw stored names are distinct from decoded reserved suffix checks. @returns Nothing. */ () => {
  const doc = read(
    '<a href="https://first.test" href="https://second.test" target="One" target="Two" name="skip%7Ctable" id="point">A</a>',
  );
  const hint = links(doc)[0];
  assert(hint);
  expect(hint.format.GetValue()).toBe("https://first.test/");
  expect(hint.format.GetTargetFrame()).toBe("One");
  expect(hint.format.GetName()).toBe("");
  expect(doc.GetIDocumentMarkAccess().GetBookmarkNames()).toEqual(["point"]);
});
it("retains complete native items through document insertion with nondefault flags", /** Verifies the real InsertPoolItem caller without the old SetHyperlink boundary. @returns Nothing. */ () => {
  const doc = new SwDoc();
  documents.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  node.SetText("ABCD");
  const start = new SwPosition(node, 1),
    end = new SwPosition(node, 3),
    range = new SwPaM(end, start);
  start.Dispose();
  end.Dispose();
  const item = new SwFormatINetFormat("", "_blank");
  item.SetName("Empty native");
  item.SetINetFormatAndId("Custom normal", P.CHR_HTML_CODE);
  item.SetVisitedFormatAndId("Custom visited", P.CHR_HTML_STRONG);
  try {
    doc.InsertPoolItem(range, item, SetAttrMode.DONTEXPAND);
    const hint = links(doc)[0];
    assert(hint);
    expect(hint.format).not.toBe(item);
    expect(hint.format.equals(item)).toBe(true);
    expect(hint.DontExpand()).toBe(true);
    expect(hint.format.GetINetFormatId()).toBe(P.CHR_HTML_CODE);
    expect(hint.format.GetVisitedFormatId()).toBe(P.CHR_HTML_STRONG);
  } finally {
    item.Dispose();
    range.Dispose();
  }
});
it("applies native A/link/visited map precedence once, mutating percentage heights out of the source map", /** Maps are actual CSS owners and styles are actual document pool formats. @returns Nothing. */ () => {
  const doc = read(
    '<a href="https://host">A</a>',
    "",
    "",
    /** Seeds the original CSS maps before actual HREF consumes SetATagStyles. @param parser - Actual parser. @returns Nothing. */ (
      parser,
    ) => {
      for (const [tag, style] of [
        ["a", "color: #112233; font-size: 150%"],
        ["a:link", "color: #445566"],
        ["a:visited", "color: #778899"],
      ]) {
        assert(tag && style);
        const items = new SfxItemSet(
            parser.m_xDoc.GetAttrPool(),
            parser.m_pCSS1Parser.GetWhichMap(),
          ),
          info = new SvxCSS1PropertyInfo();
        try {
          parser.m_pCSS1Parser.ParseStyleOption(style, items, info);
          parser.m_pCSS1Parser.InsertTag(tag, items, info);
        } finally {
          items.Dispose();
        }
      }
      parser.m_pCSS1Parser.SetATagStyles();
      expect(parser.m_pCSS1Parser.IsBodyLinkSet()).toBe(true);
      expect(parser.m_pCSS1Parser.IsBodyVLinkSet()).toBe(true);
      expect(
        parser.m_pCSS1Parser.GetTag("a")?.GetItemSet().GetItemIfSet(RES_CHRATR_FONTSIZE, false),
      ).toBeUndefined();
      const item = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
      try {
        parser.m_pCSS1Parser.ParseStyleOption("color: red", item, new SvxCSS1PropertyInfo());
        parser.m_pCSS1Parser.InsertTag("a:link", item, new SvxCSS1PropertyInfo());
      } finally {
        item.Dispose();
      }
    },
  );
  const normal = doc.GetCharFormatFromPool(P.CHR_INET_NORMAL),
    visit = doc.GetCharFormatFromPool(P.CHR_INET_VISIT);
  assert(normal && visit);
  expect((normal.GetAttrSet().Get(RES_CHRATR_COLOR) as SvxColorItem).GetValue().GetRed()).toBe(
    0x44,
  );
  expect((visit.GetAttrSet().Get(RES_CHRATR_COLOR) as SvxColorItem).GetValue().GetRed()).toBe(0x77);
});
it("keeps actual Markdown raw-HTML links and pool identities through Worker transport", /** Exercises native Markdown HTML insertion without a browser DOM path. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString(
      '<p><a href="https://Host.test:00080/a/../b" target="Frame" name="Named">Link</a></p>',
      UTF8,
    ),
  );
  documents.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  documents.push(restored);
  const hint = links(restored)[0];
  assert(hint);
  expect([
    hint.format.GetValue(),
    hint.format.GetName(),
    hint.format.GetTargetFrame(),
    hint.format.GetINetFormatId(),
    hint.format.GetVisitedFormatId(),
  ]).toEqual([
    "https://Host.test:00080/a/../b",
    "Named",
    "Frame",
    P.CHR_INET_NORMAL,
    P.CHR_INET_VISIT,
  ]);
  expect(projectWriterTextRuns(restored.paragraphs[0])[0]?.hyperlink?.url).toBe(
    "https://Host.test:00080/a/../b",
  );
});
it("exports an actual imported HTML link through the native RTF writer and reader", /** The existing RTF hyperlink field path consumes the same native document. @returns Nothing. */ () => {
  const doc = read('<a href="https://example.test/path">Link</a>');
  const copy = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(doc));
  documents.push(copy);
  expect(
    projectWriterTextRuns(copy.paragraphs[0]).find(
      /** Selects the actual projected link range. @param run - Run. @returns Link admission. */ (
        run,
      ) => run.hyperlink,
    )?.hyperlink?.url,
  ).toBe("https://example.test/path");
});
