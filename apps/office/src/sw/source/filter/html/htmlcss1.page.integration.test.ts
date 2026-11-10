/** @fileoverview Native CSS page-break switch order, document page-pool ownership and Markdown/Worker integration. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwHTMLParser } from "./swhtml";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SvStream } from "../../../../tools/source/stream/stream";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { RES_BREAK, RES_PAGEDESC, RES_KEEP } from "../../../inc/hintids";
import { UseOnPage } from "../../core/layout/pagedesc";
import { MarkdownReader } from "../md/swmd";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
const readers: (readonly [SwHTMLParser, SwPaM])[] = [];
it("preserves original early return after an empty first inline declaration", /** Native ParseStyleOption returns before the later valid declaration when the first ParseDeclaration has no expression. @returns Nothing. */ () => {
  const parser = reader(),
    css = parser.m_pCSS1Parser;
  const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), css.GetWhichMap()),
    info = new SvxCSS1PropertyInfo();
  try {
    css.ParseStyleOption("page-break-before:;page-break-after:always", items, info);
    expect(css.SetFormatBreak(items, info)).toBe(false);
    expect(items.GetItemIfSet(RES_BREAK, false)).toBeUndefined();
  } finally {
    items.Dispose();
  }
});
afterEach(
  /** Releases parser borrows before actual documents. @returns Nothing. */ () => {
    for (const [parser, cursor] of readers.splice(0)) {
      parser.SourceDispose();
      cursor.Dispose();
    }
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Binds actual CSS owner to the native document/cursor, without a fake parser or private-field writes. @param document - Optional existing owner. @returns Real HTML reader. */
function reader(document?: SwDoc): SwHTMLParser {
  const doc = document ?? new SwDoc();
  if (!document) docs.push(doc);
  const node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    cursor = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, cursor, new SvStream(new Uint8Array(), UTF8));
  readers.push([parser, cursor]);
  return parser;
}
it.each([
  ["", "always", 5, undefined, undefined, true],
  ["always", "", 4, undefined, undefined, true],
  ["always", "auto", 4, "", false, true],
  ["always", "avoid", 4, undefined, true, true],
  ["left", "", undefined, "Left Page", undefined, false],
  ["left", "auto", 0, "Left Page", false, true],
  ["left", "always", 5, "Left Page", undefined, true],
  ["right", "auto", 0, "Right Page", false, true],
  ["avoid", "", undefined, undefined, undefined, false],
  ["avoid", "avoid", undefined, undefined, true, false],
  ["auto", "always", 5, "", undefined, true],
  ["auto", "auto", 0, "", false, true],
  ["", "left", 5, undefined, undefined, true],
  ["", "right", 5, undefined, undefined, true],
  ["auto", "avoid", 0, "", true, true],
] as const)(
  "preserves source before=%s after=%s transition",
  /** Explicit source cases distinguish pending enum, page reference, keep and bSetBreak. @param before - CSS before. @param after - CSS after. @param mode - Expected break. @param page - Expected page name. @param keep - Expected keep. @param result - Source return value. @returns Nothing. */
  (before, after, mode, page, keep, result) => {
    const parser = reader(),
      css = parser.m_pCSS1Parser;
    const items = new SfxItemSet(parser.m_xDoc.GetAttrPool(), css.GetWhichMap()),
      info = new SvxCSS1PropertyInfo();
    try {
      css.ParseStyleOption(
        `${before ? `page-break-before:${before};` : ""}${after ? `page-break-after:${after}` : ""}`,
        items,
        info,
      );
      expect(css.SetFormatBreak(items, info)).toBe(result);
      expect((items.GetItemIfSet(RES_BREAK, false) as SfxInt16Item | undefined)?.GetValue()).toBe(
        mode,
      );
      expect(
        (
          items.GetItemIfSet(RES_PAGEDESC, false) as SwFormatPageDesc | undefined
        )?.GetPageDescName(),
      ).toBe(page);
      expect((items.GetItemIfSet(RES_KEEP, false) as SfxBoolItem | undefined)?.GetValue()).toBe(
        keep,
      );
    } finally {
      items.Dispose();
    }
  },
);
it("borrows styles by pool ID after rename and creates the original asymmetric left/right page pair", /** Requested left is copied from HTML and becomes All; the companion remains Right. @returns Nothing. */ () => {
  const parser = reader(),
    css = parser.m_pCSS1Parser,
    doc = parser.m_xDoc;
  expect(css.GetLeftPageDesc()).toBeNull();
  const master = css.GetMasterPageDesc();
  expect(master.GetPoolFormatId()).toBe(P.PAGE_HTML);
  expect(master.GetValue()).toMatchObject({
    leftMargin: 1134,
    rightMargin: 567,
    topMargin: 567,
    bottomMargin: 567,
  });
  const left = css.GetLeftPageDesc(true),
    right = css.GetRightPageDesc();
  assert(left && right);
  expect([left.GetUseOn(), right.GetUseOn()]).toEqual([UseOnPage.All, UseOnPage.Right]);
  expect(left.GetFollow()).toBe(right);
  expect(right.GetFollow()).toBe(left);
  left.SetName("Renamed left");
  expect(css.GetLeftPageDesc()).toBe(left);
  expect(doc.GetPageDescCnt()).toBe(4);
});
it("retains native first-page master selection and later left-follow rewiring", /** First initially follows HTML; left creation rewires it through a native changed copy. @returns Nothing. */ () => {
  const css = reader().m_pCSS1Parser,
    first = css.GetFirstPageDesc(true);
  assert(first);
  expect(first.GetFollow()).toBe(css.GetMasterPageDesc());
  const left = css.GetLeftPageDesc(true);
  assert(left);
  expect(first.GetFollow()).toBe(left);
  expect(first.GetPoolFormatId()).toBe(P.PAGE_FIRST);
});
it("chooses an existing right page as the first-page copy source", /** Original first-page creation prefers right over HTML regardless of its renamed UI identity. @returns Nothing. */ () => {
  const parser = reader(),
    css = parser.m_pCSS1Parser,
    right = css.GetRightPageDesc(true);
  assert(right);
  const value = right.GetValue();
  parser.m_xDoc.ChgPageDesc({ ...value, width: 15000 }, right.GetName());
  const first = css.GetFirstPageDesc(true);
  assert(first);
  expect(first.GetMaster().GetFrameSize().GetWidth()).toBe(15000);
  expect(first.GetFollow()).toBe(css.GetLeftPageDesc());
});
it("keeps page ownership and break/keep attributes through Markdown and Worker transfer", /** Real import and UI transport retain pool identities and follow links, then native lookup finds the same owners. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p style="page-break-before:left;page-break-after:avoid">body</p>', UTF8),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  for (const current of [doc, restored]) {
    const node = current.paragraphs[0];
    assert(node);
    const pageItem = node.GetAttr(RES_PAGEDESC);
    assert(pageItem instanceof SwFormatPageDesc);
    const page = current.FindPageDesc(pageItem.GetPageDescName());
    assert(page);
    expect(page.GetPoolFormatId()).toBe(P.PAGE_LEFT);
    expect(page.GetFollow().GetPoolFormatId()).toBe(P.PAGE_RIGHT);
    expect(page.GetFollow().GetFollow()).toBe(page);
    expect((node.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    expect(reader(current).m_pCSS1Parser.GetLeftPageDesc()).toBe(page);
  }
});
it("does not turn a character-level page break into a paragraph page selection", /** Source InsertAttrs only invokes SetFormatBreak for paragraph-level contexts. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p><span style="page-break-before:left">body</span></p>', UTF8),
  );
  docs.push(doc);
  expect(doc.GetPageDescCnt()).toBe(1);
  const paragraph = doc.paragraphs[0];
  assert(paragraph);
  expect(paragraph.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false)).toBeUndefined();
});
