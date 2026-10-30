/** @fileoverview Actual HTML LANG to LanguageTag fallback, script-specific native hints and Markdown/Worker transport. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { MarkdownReader } from "../md/swmd";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { RtfExport } from "../ww8/rtfexport";
import * as H from "../../../inc/hintids";
const documents: SwDoc[] = [];
afterEach(
  /** Releases original document owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Supplies the real parser used by Markdown with a native cursor and UTF8 stream. @param source - HTML bytes. @returns Imported model. */
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
/** Queries language using actual script segmentation and one-character ranges. @param doc - Native document. @returns Language values in body order. */
function languages(doc: SwDoc): number[][] {
  return doc.paragraphs.map(
    /** Reads native language hints. @param node - Actual paragraph. @returns One value per UTF16 unit. */ (
      node,
    ) =>
      Array.from(
        { length: node.GetText().length },
        /** Uses nonzero query length to include a hint's start. @param _ - Unused element. @param index - UTF16 offset. @returns Actual language. */ (
          _,
          index,
        ) => node.GetLang(index, 1),
      ),
  );
}
for (const [tag, expected] of [
  ["de-DE", 0x407],
  ["DE-latn-de", 0x407],
  ["fr", 0x40c],
  ["i-klingon", 0x6ac],
  ["invalid_tag", 0x409],
] as const)
  it(`imports LANG ${tag} through native canonicalization/fallback`, /** Every represented script receives the selected language. @returns Nothing. */ () => {
    expect(languages(read(`<span lang="${tag}">A漢ع</span>`))).toEqual([
      [expected, expected, expected],
    ]);
  });
it("puts native language items into all three source Which slots", /** This covers CSS range admission before the script-specific deferred application. @returns Nothing. */ () => {
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
      new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8),
    ),
    items = new SfxItemSet(doc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
  try {
    expect(parser.ParseStyleOptions("", "", "", items, new SvxCSS1PropertyInfo(), "de-DE")).toBe(
      true,
    );
    for (const which of [
      H.RES_CHRATR_LANGUAGE,
      H.RES_CHRATR_CJK_LANGUAGE,
      H.RES_CHRATR_CTL_LANGUAGE,
    ]) {
      const item = items.GetItemIfSet(which, false);
      assert(item instanceof SvxLanguageItem);
      expect(item.GetLanguage()).toBe(0x407);
    }
    const empty = new SfxItemSet(doc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
    try {
      expect(parser.ParseStyleOptions("", "", "", empty, new SvxCSS1PropertyInfo(), "")).toBe(
        false,
      );
      expect(empty.Count()).toBe(0);
    } finally {
      empty.Dispose();
    }
  } finally {
    items.Dispose();
    parser.SourceDispose();
    cursor.Dispose();
  }
});
it("retains outer languages across nested contexts and first duplicate options", /** Source reverse option iteration and native context closure apply to each script run. @returns Nothing. */ () => {
  expect(
    languages(read('<span lang="de-DE" lang="fr-FR">A<span lang="fr-FR">B漢ع</span>C漢ع</span>')),
  ).toEqual([[0x407, 0x40c, 0x40c, 0x40c, 0x407, 0x407, 0x407]]);
});
it("connects existing semantic, legacy font, anchor and paragraph producers", /** LANG alone admits the original style option branch. @returns Nothing. */ () => {
  const doc = read(
    '<p lang="de-DE">A<strong lang="fr-FR">B</strong><font lang="ja-JP">C</font><a lang="ar-SA" href="#x">D</a></p><h2 lang="fr-FR">E</h2><blockquote lang="ja-JP">F</blockquote><pre lang="ar-SA">G</pre>',
  );
  expect(languages(doc)).toEqual([[0x407, 0x40c, 0x411, 0x401], [0x40c], [0x411], [0x401]]);
});
it("preserves actual Markdown embedded HTML language items through Worker and native RTF round-trip", /** No browser language parser or portable run metadata substitutes for native hints. @returns Nothing. */ () => {
  // Block HTML enters the actual HTML parser through MarkdownReader::InsertHtmlData.
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p lang="de-DE">A漢ع</p>', RTL_TEXTENCODING_UTF8),
  );
  documents.push(doc);
  expect(languages(doc)).toEqual([[0x407, 0x407, 0x407]]);
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  documents.push(restored);
  expect(languages(restored)).toEqual(languages(doc));
  const rtf = RtfExport.WriteDocument(doc);
  expect(new TextDecoder().decode(rtf)).toContain("\\lang1031");
  const imported = new RtfDocumentImpl().ResolveBytes(rtf);
  documents.push(imported);
  expect(languages(imported)).toEqual(languages(doc));
});

it("applies native so-language expressions before the LANG option override", /** IDENT/STRING admission and original option order are distinct from browser CSS. @returns Nothing. */ () => {
  expect(languages(read('<span style="so-language: fr-FR">A漢ع</span>'))).toEqual([
    [0x40c, 0x40c, 0x40c],
  ]);
  expect(
    languages(read('<span lang="de-DE" style="so-language: &quot;fr-FR&quot;">A漢ع</span>')),
  ).toEqual([[0x407, 0x407, 0x407]]);
  const doc = read('<span style="so-language: 42">A</span>');
  const node = doc.paragraphs[0];
  assert(node);
  expect(node.GetpSwpHints()).toBeUndefined();
});
