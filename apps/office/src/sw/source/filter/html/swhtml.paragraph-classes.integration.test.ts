/** @fileoverview Existing-document GetTextFormatColl class selection, direct-font encoding and Markdown/Worker transport on actual native owners. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { SwCSS1Parser } from "./htmlcss1";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import {
  RTL_TEXTENCODING_UTF8 as UTF8,
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_SYMBOL,
} from "../../../../sal/inc/rtl/textenc";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import * as H from "../../../inc/hintids";
import { MarkdownReader } from "../md/swmd";
import { SwMDWriter } from "../md/wrtmd";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases document-owned styles and nodes. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Reads genuine HTML bytes with the same existing-document profile used by Markdown. @param source - Original markup. @param prepare - Optional real document/style setup. @param check - Optional public CSS operation before parsing. @returns Actual document. */
function html(
  source: string,
  prepare?: (doc: SwDoc) => void,
  check?: (css: SwCSS1Parser) => void,
): SwDoc {
  const doc = new SwDoc();
  docs.push(doc);
  prepare?.(doc);
  const node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(OUStringToOString(source, UTF8), UTF8));
  try {
    check?.(parser.m_pCSS1Parser);
    parser.CallParser();
    return doc;
  } finally {
    parser.SourceDispose();
    pam.Dispose();
  }
}
it.each([
  ["sdfootnote", "footnote", P.COLL_FOOTNOTE],
  ["SDENDNOTE", "endnote", P.COLL_ENDNOTE],
  ["SdFootNote-western", "footnote", P.COLL_FOOTNOTE],
  ["sdendnote-CjK", "endnote", P.COLL_ENDNOTE],
  ["sdfootnote-ctl", "footnote", P.COLL_FOOTNOTE],
] as const)(
  "selects native note paragraph class %s",
  /** Note classes select original paragraph pools, without constructing note anchors or note content. @param name - Class. @param id - Actual style identity. @param pool - Original pool ID. @returns Nothing. */ (
    name,
    id,
    pool,
  ) => {
    const doc = html(`<p class="${name}">note</p><p>body</p>`);
    const style = doc.paragraphs[0]?.GetTextFormatColl();
    expect(style?.id).toBe(id);
    expect(style?.GetPoolFormatId()).toBe(pool);
    expect(doc.paragraphs[1]?.GetTextFormatColl().id).toBe("text-body");
  },
);
it.each(["sdfootnote other", " sdfootnote", "sdendnote ", "sdfootnote-other"])(
  "does not normalize original class text %s into a note style",
  /** Source treats the complete class as one name; it does not tokenize HTML classes or trim whitespace. @param name - Original class. @returns Nothing. */ (
    name,
  ) => {
    const doc = html(`<p class="${name}">ordinary</p>`);
    expect(doc.paragraphs[0]?.GetTextFormatColl().id).toBe("text-body");
  },
);
it("uses the actual existing named paragraph descendant and strips only native script suffixes", /** No CSS map or parallel style table is fabricated. @returns Nothing. */ () => {
  const doc = html(
    '<p class="sample-western">first</p><p class="sample-cjk">second</p><p class="Sample">third</p>',
    /** Registers a real document collection with inherited properties. @param owner - Document. @returns Nothing. */ (
      owner,
    ) => {
      const parent = owner.GetTextFormatColl("text-body");
      owner.MakeTextFormatColl(parent.GetName() + ".sample", parent);
    },
  );
  const expected = doc.FindTextFormatCollByName(
    doc.GetTextFormatColl("text-body").GetName() + ".sample",
  );
  assert(expected);
  expect(doc.paragraphs[0]?.GetTextFormatColl()).toBe(expected);
  expect(doc.paragraphs[1]?.GetTextFormatColl()).toBe(expected);
  expect(doc.paragraphs[2]?.GetTextFormatColl()).toBe(doc.GetTextFormatColl("text-body"));
});
it("selects existing heading class descendants through the shared native context cascade", /** NewHeading stores the class on the actual context, and SetTextCollAttrs resolves that same class. @returns Nothing. */ () => {
  const doc = html(
    '<h2 class="sample-ctl">heading</h2>',
    /** Creates an actual named heading descendant. @param owner - Document. @returns Nothing. */ (
      owner,
    ) => {
      const parent = owner.GetTextFormatColl("heading-2");
      owner.MakeTextFormatColl(parent.GetName() + ".sample", parent);
    },
  );
  const style = doc.FindTextFormatCollByName(
    doc.GetTextFormatColl("heading-2").GetName() + ".sample",
  );
  assert(style);
  expect(doc.paragraphs[0]?.GetTextFormatColl().id).toBe(style.id);
  expect(doc.paragraphs[0]?.GetTextFormatColl() === style).toBe(true);
});
it("keeps the source distinction between a classless P and an explicit unknown-class P in a quotation", /** Only a nonempty class creates a TextBody context, even when no matching descendant exists. @returns Nothing. */ () => {
  const doc = html('<blockquote><p>quote</p><p class="unknown">body</p></blockquote>');
  expect(
    doc.paragraphs.map(
      /** Reads actual styles. @param node - Paragraph. @returns Style. */ (node) => [
        node.GetText(),
        node.GetTextFormatColl().id,
      ],
    ),
  ).toEqual([
    ["quote", "quotations"],
    ["body", "text-body"],
  ]);
});
it("does not apply note-class remapping to a heading", /** The source note remapping is restricted to COLL_TEXT. @returns Nothing. */ () => {
  const doc = html('<h2 class="sdfootnote">heading</h2>');
  expect(doc.paragraphs[0]?.GetTextFormatColl().id).toBe("heading-2");
});
it("does not populate class maps from stylesheets in the existing-document caller", /** Tests the original early-return contract directly through the real grammar, without replacing its providers. @returns Nothing. */ () => {
  html(
    '<p class="sample">body</p>',
    undefined,
    /** Parses real stylesheet tokens into the original callback lifecycle. @param css - Actual CSS owner. @returns Nothing. */ (
      css,
    ) => {
      expect(
        css.ParseStyleSheet(
          ".sample { color: red; font-weight: bold } p.sample { font-style: italic }",
        ),
      ).toBe(true);
      expect(css.GetClass("sample")).toBeNull();
      expect(css.GetTag("p.sample")).toBeNull();
    },
  );
});
it("corrects only selected direct non-symbol font encodings and retains all other font fields", /** Native lcl_swcss1_setEncoding never materializes inherited fonts or rewrites symbol fonts. @returns Nothing. */ () => {
  const doc = html(
    '<p class="sample">body</p>',
    /** Creates actual font items on native document styles. @param owner - Document. @returns Nothing. */ (
      owner,
    ) => {
      const parent = owner.GetTextFormatColl("text-body"),
        style = owner.MakeTextFormatColl(parent.GetName() + ".sample", parent);
      for (const [which, encoding] of [
        [H.RES_CHRATR_FONT, RTL_TEXTENCODING_MS_1252],
        [H.RES_CHRATR_CJK_FONT, RTL_TEXTENCODING_SYMBOL],
      ] as const) {
        const font = new SvxFontItem(
          FontFamily.FAMILY_ROMAN,
          "Example",
          "Italic",
          FontPitch.PITCH_FIXED,
          encoding,
          which,
        );
        try {
          style.SetFormatAttr(font);
        } finally {
          font.Dispose();
        }
      }
    },
  );
  const style = doc.paragraphs[0]?.GetTextFormatColl();
  assert(style);
  const font = style.GetAttrSet().GetItemIfSet(H.RES_CHRATR_FONT, false);
  assert(font instanceof SvxFontItem);
  expect([
    font.GetFamily(),
    font.GetFamilyName(),
    font.GetStyleName(),
    font.GetPitch(),
    font.GetCharSet(),
  ]).toEqual([FontFamily.FAMILY_ROMAN, "Example", "Italic", FontPitch.PITCH_FIXED, UTF8]);
  const symbol = style.GetAttrSet().GetItemIfSet(H.RES_CHRATR_CJK_FONT, false);
  assert(symbol instanceof SvxFontItem);
  expect(symbol.GetCharSet()).toBe(RTL_TEXTENCODING_SYMBOL);
  expect(style.GetAttrSet().GetItemIfSet(H.RES_CHRATR_CTL_FONT, false)).toBeUndefined();
});
it("leaves direct fonts unchanged when the original default encoding is unknown", /** Original helper exits before reading or materializing font items. @returns Nothing. */ () => {
  html(
    "",
    undefined,
    /** Uses public parser encoding operations on actual style items. @param css - Parser. @returns Nothing. */ (
      css,
    ) => {
      const style = css.GetTextCollFromPool(P.COLL_HTML_PRE),
        before = style.GetAttrSet().GetItemIfSet(H.RES_CHRATR_FONT, false);
      assert(before instanceof SvxFontItem);
      css.SetDfltEncoding(RTL_TEXTENCODING_DONTKNOW);
      expect(css.GetTextFormatColl(P.COLL_HTML_PRE, "")).toBe(style);
      expect(style.GetAttrSet().GetItemIfSet(H.RES_CHRATR_FONT, false)).toBe(before);
    },
  );
});
it("transports note paragraph styles and their native sizes through actual Markdown, Worker and Markdown export", /** The semantic path creates ordinary paragraphs using the note pool; Markdown export has no special note producer here. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p class="sdfootnote">note</p>\n\nbody', UTF8),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  expect(restored.paragraphs[0]?.GetTextFormatColl().id).toBe("footnote");
  const height = restored.paragraphs[0]?.GetAttr(H.RES_CHRATR_FONTSIZE);
  assert(height instanceof SvxFontHeightItem);
  expect(height.GetHeight()).toBe(200);
  expect(new TextDecoder().decode(new SwMDWriter().WriteDocument(restored))).toContain("note");
  expect(
    restored.paragraphs.map(
      /** Reads actual imported text. @param node - Paragraph. @returns Text. */ (node) =>
        node.GetText(),
    ),
  ).toEqual(["note", "body", ""]);
});
