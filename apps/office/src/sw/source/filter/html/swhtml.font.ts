/** @fileoverview Consumed native BASEFONT/FONT/BIG/SMALL paths from swhtml.cxx, borrowing the actual parser, font stacks and deferred item heads. */
import type { SwHTMLParser } from "./swhtml";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { Color } from "../../../../tools/inc/color";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { HTMLAttrContext } from "./htmlctxt";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
import * as H from "../../../inc/hintids";
import { SwPoolFormatId as P, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
/** Original BASEFONT size default, unsigned16 narrowing and bounded configured heights. @param parser - Actual owner. @returns Nothing. */
export function NewBasefontAttr(parser: SwHTMLParser): void {
  let size = 3;
  for (const option of [...parser.GetOptions()].reverse())
    if (option.GetToken() === O.SIZE) size = option.GetNumber() & 0xffff;
  size = Math.max(1, Math.min(7, size));
  const height = parser.m_pCSS1Parser.GetFontHeight(size - 1),
    tab = parser.m_xAttrTab;
  parser.NewStdAttr(T.BASEFONT_ON, [
    [tab.pFontHeight, new SvxFontHeightItem(height, 100, H.RES_CHRATR_FONTSIZE)],
    [tab.pFontHeightCJK, new SvxFontHeightItem(height, 100, H.RES_CHRATR_CJK_FONTSIZE)],
    [tab.pFontHeightCTL, new SvxFontHeightItem(height, 100, H.RES_CHRATR_CTL_FONTSIZE)],
  ]);
  parser.m_aBaseFontStack.push(size);
}
/** Original matching context close and table-boundary stack underflow guard. @param parser - Actual parser. @returns Nothing. */
export function EndBasefontAttr(parser: SwHTMLParser): void {
  parser.EndTag(T.BASEFONT_ON);
  if (parser.m_aBaseFontStack.length > parser.m_nBaseFontStMin) parser.m_aBaseFontStack.pop();
}
/** Native legacy font attributes, relative base-size arithmetic and heading BIG/SMALL behavior. Device-font metadata has no DocShell producer in this caller profile. @param parser - Actual parser. @param token - Native font opening token. @returns Nothing. */
export function NewFontAttr(parser: SwHTMLParser, token: T): void {
  const baseSize =
    parser.m_aBaseFontStack.length > parser.m_nBaseFontStMin
      ? (parser.m_aBaseFontStack.at(-1) as number) & 7
      : 3;
  let fontSize =
    parser.m_aFontStack.length > parser.m_nFontStMin
      ? (parser.m_aFontStack.at(-1) as number) & 7
      : baseSize;
  let face = "",
    style = "",
    id = "",
    className = "",
    language = "",
    direction = "",
    height = 0,
    size = 0,
    hasColor = false;
  const color = new Color();
  for (const option of [...parser.GetOptions()].reverse()) {
    switch (option.GetToken()) {
      case O.SIZE:
        if (token === T.FONT_ON && option.GetString()) {
          const first = option.GetString()[0];
          const signed =
            first === "+" || first === "-"
              ? Math.max(-2147483648, Math.min(2147483647, baseSize + option.GetSNumber()))
              : option.GetNumber() | 0;
          size = Math.max(1, Math.min(7, signed));
          height = parser.m_pCSS1Parser.GetFontHeight(size - 1);
        }
        break;
      case O.COLOR:
        if (token === T.FONT_ON) {
          option.GetColor(color);
          hasColor = true;
        }
        break;
      case O.FACE:
        if (token === T.FONT_ON) face = option.GetString();
        break;
      case O.STYLE:
        style = option.GetString();
        break;
      case O.ID:
        id = option.GetString();
        break;
      case O.CLASS:
        className = option.GetString();
        break;
      case O.LANG:
        language = option.GetString();
        break;
      case O.DIR:
        direction = option.GetString();
        break;
    }
  }
  const hasStyleOptions = !!(style || id || className || language || direction);
  if (token !== T.FONT_ON) {
    const current = parser.GetCurrFormatColl();
    let pool = current?.GetPoolFormatId() ?? P.ZERO;
    if (pool >= P.COLL_HEADLINE1 && pool <= P.COLL_HEADLINE1 + 5) {
      if (parser.m_nFontStHeadStart === parser.m_aFontStack.length)
        fontSize = 6 - (pool - P.COLL_HEADLINE1);
    } else pool = P.ZERO;
    size =
      token === T.BIGPRINT_ON ? (fontSize < 7 ? fontSize + 1 : 7) : fontSize > 1 ? fontSize - 1 : 1;
    if (pool !== P.ZERO && size >= 1 && size <= 6) {
      const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
        /** Resolves the original heading pool ID. @param item - Pool metadata. @returns Identity match. */ (
          item,
        ) => item.poolId === P.COLL_HEADLINE1 + 6 - size,
      );
      if (!entry) throw new Error("assert(heading pool identity)");
      height = (
        parser.m_xDoc
          .GetTextFormatColl(entry.id)
          .GetAttrSet()
          .Get(H.RES_CHRATR_FONTSIZE) as SvxFontHeightItem
      ).GetHeight();
    } else height = parser.m_pCSS1Parser.GetFontHeight(size - 1);
  }
  let fontName = "";
  if (face && !parser.m_pCSS1Parser.IsIgnoreFontFamily())
    for (const source of face.split(",")) {
      const name = source.replace(/^ +| +$/g, "");
      if (name) fontName += (fontName ? ";" : "") + name;
    }
  const context = new HTMLAttrContext(token),
    items: SfxPoolItem[] = [];
  if (height)
    for (const which of [
      H.RES_CHRATR_FONTSIZE,
      H.RES_CHRATR_CJK_FONTSIZE,
      H.RES_CHRATR_CTL_FONTSIZE,
    ])
      items.push(new SvxFontHeightItem(height, 100, which));
  if (hasColor) items.push(new SvxColorItem(color, H.RES_CHRATR_COLOR));
  if (fontName)
    for (const which of [H.RES_CHRATR_FONT, H.RES_CHRATR_CJK_FONT, H.RES_CHRATR_CTL_FONT])
      items.push(
        new SvxFontItem(
          FontFamily.FAMILY_DONTKNOW,
          fontName,
          "",
          FontPitch.PITCH_DONTKNOW,
          parser.m_pCSS1Parser.GetDfltEncoding(),
          which,
        ),
      );
  try {
    if (hasStyleOptions) {
      const set = new SfxItemSet(parser.m_xDoc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap());
      try {
        for (const item of items) set.Put(item);
        const info = new SvxCSS1PropertyInfo();
        if (style) parser.m_pCSS1Parser.ParseStyleOption(style, set, info);
        parser.InsertAttrs(set, info, context);
      } finally {
        set.Dispose();
      }
    } else {
      // Pinned NewFontAttr uses the Western head for all three script items in
      // this branch, unlike NewBasefontAttr and CSS InsertAttrs. Preserve it.
      for (const item of items)
        parser.InsertAttr(
          item instanceof SvxFontHeightItem
            ? parser.m_xAttrTab.pFontHeight
            : item instanceof SvxColorItem
              ? parser.m_xAttrTab.pFontColor
              : parser.m_xAttrTab.pFont,
          item,
          context,
        );
    }
  } finally {
    for (const item of items) item.Dispose();
  }
  parser.PushContext(context);
  parser.m_aFontStack.push(size);
}
/** Original close token search and independent font-stack pop, including an unmatched closer. @param parser - Actual parser. @param token - Font closing token. @returns Nothing. */
export function EndFontAttr(parser: SwHTMLParser, token: T): void {
  parser.EndTag(token);
  if (parser.m_aFontStack.length > parser.m_nFontStMin) parser.m_aFontStack.pop();
}
