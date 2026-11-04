/** @fileoverview Native GetAttrTabEntry and InsertParaAttrs from htmlcss1.cxx using registered current-model Which IDs and original deferred heads. */
import { SwPoolFormatId, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import type { HTMLAttrContext } from "./htmlctxt";
import type { SwHTMLParser } from "./swhtml";
import { NewAttr, type HTMLAttrHead, type HTMLAttrTable } from "./swhtml.attr";
import * as H from "../../../inc/hintids";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
/** Original Which-to-head table; native identifiers without current core owners are not assigned substitute IDs. */
const mapping: readonly (readonly [string, keyof HTMLAttrTable])[] = [
  ["RES_CHRATR_BLINK", "pBlink"],
  ["RES_CHRATR_CASEMAP", "pCaseMap"],
  ["RES_CHRATR_COLOR", "pFontColor"],
  ["RES_CHRATR_CROSSEDOUT", "pStrike"],
  ["RES_CHRATR_ESCAPEMENT", "pEscapement"],
  ["RES_CHRATR_FONT", "pFont"],
  ["RES_CHRATR_CJK_FONT", "pFontCJK"],
  ["RES_CHRATR_CTL_FONT", "pFontCTL"],
  ["RES_CHRATR_FONTSIZE", "pFontHeight"],
  ["RES_CHRATR_CJK_FONTSIZE", "pFontHeightCJK"],
  ["RES_CHRATR_CTL_FONTSIZE", "pFontHeightCTL"],
  ["RES_CHRATR_KERNING", "pKerning"],
  ["RES_CHRATR_POSTURE", "pItalic"],
  ["RES_CHRATR_CJK_POSTURE", "pItalicCJK"],
  ["RES_CHRATR_CTL_POSTURE", "pItalicCTL"],
  ["RES_CHRATR_UNDERLINE", "pUnderline"],
  ["RES_CHRATR_WEIGHT", "pBold"],
  ["RES_CHRATR_CJK_WEIGHT", "pBoldCJK"],
  ["RES_CHRATR_CTL_WEIGHT", "pBoldCTL"],
  ["RES_CHRATR_BACKGROUND", "pCharBrush"],
  ["RES_CHRATR_OPTICAL_SIZING", "pOpticalSizing"],
  ["RES_CHRATR_FONT_VARIATIONS", "pFontVariations"],
  ["RES_CHRATR_BOX", "pCharBox"],
  ["RES_PARATR_LINESPACING", "pLineSpacing"],
  ["RES_PARATR_ADJUST", "pAdjust"],
  ["RES_MARGIN_FIRSTLINE", "pFirstLineIndent"],
  ["RES_MARGIN_TEXTLEFT", "pTextLeftMargin"],
  ["RES_MARGIN_RIGHT", "pRightMargin"],
  ["RES_UL_SPACE", "pULSpace"],
  ["RES_BOX", "pBox"],
  ["RES_BACKGROUND", "pBrush"],
  ["RES_BREAK", "pBreak"],
  ["RES_PAGEDESC", "pPageDesc"],
  ["RES_PARATR_SPLIT", "pSplit"],
  ["RES_PARATR_WIDOWS", "pWidows"],
  ["RES_PARATR_ORPHANS", "pOrphans"],
  ["RES_KEEP", "pKeep"],
  ["RES_CHRATR_LANGUAGE", "pLanguage"],
  ["RES_CHRATR_CJK_LANGUAGE", "pLanguageCJK"],
  ["RES_CHRATR_CTL_LANGUAGE", "pLanguageCTL"],
  ["RES_FRAMEDIR", "pDirection"],
];
/** Original source head lookup, with null for identifiers outside the represented pool. @param parser - Actual owner. @param which - Registered Which ID. @returns Stable original head or null. */
export function GetAttrTabEntry(parser: SwHTMLParser, which: number): HTMLAttrHead | null {
  for (const [name, key] of mapping)
    if ((H as Readonly<Record<string, unknown>>)[name] === which) return parser.m_xAttrTab[key];
  return null;
}
/** Original direct paragraph attributes become pending native HTMLAttr ranges, preserving source character-versus-paragraph policy. @param parser - Actual owner. @param items - Actual hard attribution set. @returns Nothing. */
export function InsertParaAttrs(parser: SwHTMLParser, items: SfxItemSet): void {
  for (const item of items.entries()) {
    const head = GetAttrTabEntry(parser, item.Which());
    if (head && NewAttr(parser, parser.m_xAttrTab, head, item) && head[0]) {
      if (item.Which() < H.RES_PARATR_BEGIN) head[0].SetLikePara();
      parser.m_aParaAttrs.push(head[0]);
      if (!parser.EndAttr(head[0], false)) parser.m_aParaAttrs.pop();
    }
  }
}

/** Original nearest reverse margin-context lookup, including unchanged outputs when the top context is absent. @param parser - Actual importer. @param left - Native uint16 output. @param right - Native uint16 output. @param indent - Native short output. @param ignoreTop - Original false default. @returns Nothing. */
export function GetMarginsFromContext(
  parser: SwHTMLParser,
  left: [number],
  right: [number],
  indent: [number],
  ignoreTop = false,
): void {
  let pos = parser.m_aContexts.length;
  if (ignoreTop) {
    if (!pos) return;
    pos--;
  }
  while (pos > parser.m_nContextStAttrMin) {
    const context = parser.m_aContexts[--pos] as HTMLAttrContext;
    if (context.IsLRSpaceChanged()) {
      context.GetMargins(left, right, indent);
      return;
    }
  }
}
/** Original table/image margin consumer adds the actual native numbering format with source narrowing and no overflow clamp. @param parser - Actual importer. @param left - Native uint16 output. @param right - Native uint16 output. @param indent - Native short output. @returns Nothing. */
export function GetMarginsFromContextWithNumberBullet(
  parser: SwHTMLParser,
  left: [number],
  right: [number],
  indent: [number],
): void {
  GetMarginsFromContext(parser, left, right, indent);
  const info = parser.GetNumInfo();
  if (info.GetDepth()) {
    const level = Math.min(info.GetDepth(), 10) - 1,
      rule = info.GetNumRule();
    if (!rule) throw new Error("assert(HTML numbering depth has a rule)");
    const format = rule.Get(level);
    left[0] = (left[0] + format.GetAbsLSpace()) & 0xffff;
    indent[0] = (format.GetFirstLineOffset() << 16) >> 16;
  }
}

/** Original nearest spacing context/default-style lookup, retained unchanged across the parser responsibility split. @param parser - Actual importer. @param upper - Native output. @param lower - Native output. @returns Nothing. */
export function GetULSpaceFromContext(
  parser: SwHTMLParser,
  upper: [number],
  lower: [number],
): void {
  let pool = SwPoolFormatId.ZERO as number;
  for (let index = parser.m_aContexts.length; index > parser.m_nContextStAttrMin;) {
    const context = parser.m_aContexts[--index];
    if (context?.IsULSpaceChanged()) {
      context.GetULSpace(upper, lower);
      return;
    }
    if (!pool && context?.GetDefaultTextFormatColl()) pool = context.GetDefaultTextFormatColl();
  }
  const entry = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Resolves the original default pool. @param item - Metadata. @returns Match. */ (item) =>
      item.poolId === (pool || SwPoolFormatId.COLL_TEXT),
  );
  if (!entry) throw new Error("assert(default HTML paragraph style)");
  const spacing = parser.m_xDoc.GetTextFormatColl(entry.id).GetULSpace();
  upper[0] = spacing.GetUpper();
  lower[0] = spacing.GetLower();
}
