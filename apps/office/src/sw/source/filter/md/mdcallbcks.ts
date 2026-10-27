/** @fileoverview Writer md4c callbacks from pinned sw/source/filter/md/mdcallbcks.cxx. */
import * as M from "../../../../external/md4c/src/md4c.h";
import {
  SvxPostureItem,
  SvxWeightItem,
  SvxUnderlineItem,
  FontLineStyle,
} from "../../../../editeng/source/items/textitem";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { FontItalic, FontWeight, FontStrikeout } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { OStringToOUString } from "../../../../sal/rtl/ustring-convert";
import { getSystemLocale } from "../../../../unotools/source/misc/syslocale";
import { decomposeCanonicalLanguageTag } from "../../../../i18nlangtag/source/languagetag/languagetag";
import {
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_FONT,
} from "../../../inc/hintids";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SwMarkdownParser } from "./swmd";

/** Source SAL UTF-8 conversion, without whole-document validation or newline rewriting. @param bytes - Exact source callback bytes. @returns Text. */
export function decodeMarkdownText(bytes: Uint8Array): string {
  return OStringToOUString(bytes, RTL_TEXTENCODING_UTF8);
}
/** Resolves native source-medium relative destinations. @param base - Medium URL. @param target - Raw attribute. @returns Absolute or original URL. */
export function resolveMarkdownLink(base: string, target: string): string {
  if (target === "" || target.startsWith("#")) return target;
  try {
    return new URL(target, base || undefined).href;
  } catch {
    return target;
  }
}
/** Native block entry dispatch. @param type - md4c kind. @param detail - md4c detail. @param parser - Original userdata. @returns Zero. */
export function enter_block_callback(
  type: M.MD_BLOCKTYPE,
  detail: M.MD_BLOCK_DETAIL | undefined,
  parser: SwMarkdownParser,
): number {
  switch (type) {
    case M.MD_BLOCKTYPE.MD_BLOCK_QUOTE:
      parser.AddBlockQuote();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_UL:
    case M.MD_BLOCKTYPE.MD_BLOCK_OL:
      parser.StartNumberedBulletList(type);
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_LI:
      parser.StartNumberedBulletListItem(detail as M.MD_BLOCK_LI_DETAIL);
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_HR:
      parser.AddHR();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_H:
      parser.StartHeading((detail as M.MD_BLOCK_H_DETAIL).level);
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_CODE:
      parser.BeginCodeBlock();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_HTML:
      parser.BeginHtmlBlock();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_P:
      parser.StartPara();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_TABLE: {
      const table = detail as M.MD_BLOCK_TABLE_DETAIL;
      parser.StartTable(table.body_row_count + table.head_row_count, table.col_count);
      break;
    }
    case M.MD_BLOCKTYPE.MD_BLOCK_TR:
      parser.StartRow();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_TH:
    case M.MD_BLOCKTYPE.MD_BLOCK_TD:
      parser.StartCell((detail as M.MD_BLOCK_TD_DETAIL).align);
      break;
  }
  return 0;
}
/** Native block exit dispatch. @param type - md4c kind. @param detail - Unused source detail. @param parser - Original userdata. @returns Zero. */
export function leave_block_callback(
  type: M.MD_BLOCKTYPE,
  detail: M.MD_BLOCK_DETAIL | undefined,
  parser: SwMarkdownParser,
): number {
  void detail;
  switch (type) {
    case M.MD_BLOCKTYPE.MD_BLOCK_QUOTE:
      parser.EndBlockQuote();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_UL:
    case M.MD_BLOCKTYPE.MD_BLOCK_OL:
      parser.EndNumberedBulletList();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_LI:
      parser.EndNumberedBulletListItem();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_HR:
      parser.EndHR();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_H:
      parser.EndHeading();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_CODE:
      parser.EndCodeBlock();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_HTML:
      parser.EndHtmlBlock();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_P:
      parser.EndPara();
      break;
    case M.MD_BLOCKTYPE.MD_BLOCK_TABLE:
      parser.EndTable();
      break;
  }
  return 0;
}
/** Native span entry creates one owned pool item, including null entries for itemless spans. @param type - Span kind. @param detail - Raw attributes. @param parser - Original userdata. @returns Zero. */
export function enter_span_callback(
  type: M.MD_SPANTYPE,
  detail: M.MD_SPAN_DETAIL | undefined,
  parser: SwMarkdownParser,
): number {
  let item: SfxPoolItem | undefined;
  switch (type) {
    case M.MD_SPANTYPE.MD_SPAN_EM:
      item = new SvxPostureItem(FontItalic.ITALIC_NORMAL, RES_CHRATR_POSTURE);
      break;
    case M.MD_SPANTYPE.MD_SPAN_STRONG:
      item = new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT);
      break;
    case M.MD_SPANTYPE.MD_SPAN_A: {
      const href = (detail as M.MD_SPAN_A_DETAIL).href;
      item = new SwFormatINetFormat(
        resolveMarkdownLink(
          parser.m_sBaseURL,
          decodeMarkdownText(href.text.subarray(0, href.size)),
        ),
        "",
      );
      break;
    }
    case M.MD_SPANTYPE.MD_SPAN_IMG: {
      const image = detail as M.MD_SPAN_IMG_DETAIL,
        top = parser.m_aAttrStack.at(-1);
      parser.m_aImg.url = decodeMarkdownText(image.src.text.subarray(0, image.src.size));
      parser.m_aImg.title = decodeMarkdownText(image.title.text.subarray(0, image.title.size));
      if (top instanceof SwFormatINetFormat) parser.m_aImg.link = top.GetValue();
      parser.m_bInsideImage = true;
      break;
    }
    case M.MD_SPANTYPE.MD_SPAN_CODE:
      item = new SvxFontItem(
        parser.m_xDoc
          .GetTextFormatColl("preformatted-text")
          .GetAttrSet()
          .Get(RES_CHRATR_FONT) as SvxFontItem,
      );
      break;
    case M.MD_SPANTYPE.MD_SPAN_DEL:
      item = new SvxCrossedOutItem(FontStrikeout.STRIKEOUT_SINGLE, RES_CHRATR_CROSSEDOUT);
      break;
    case M.MD_SPANTYPE.MD_SPAN_WIKILINK: {
      const target = (detail as M.MD_SPAN_WIKILINK_DETAIL).target;
      const locale = getSystemLocale();
      const language = String.fromCharCode(
        ...locale.Language.getStr().subarray(0, locale.Language.getLength()),
      );
      const applicationLanguage =
        language === "qlt"
          ? decomposeCanonicalLanguageTag(
              String.fromCharCode(
                ...locale.Variant.getStr().subarray(0, locale.Variant.getLength()),
              ),
            ).language
          : language;
      item = new SwFormatINetFormat(
        "https://" +
          applicationLanguage +
          ".wikipedia.org/wiki/" +
          decodeMarkdownText(target.text.subarray(0, target.size)),
        "",
      );
      break;
    }
    case M.MD_SPANTYPE.MD_SPAN_U:
      item = new SvxUnderlineItem(FontLineStyle.LINESTYLE_SINGLE, RES_CHRATR_CROSSEDOUT);
      break;
  }
  parser.m_aAttrStack.push(item);
  return 0;
}
/** Native span exit always pops once and completes image state. @param type - Span kind. @param detail - Unused source detail. @param parser - Original userdata. @returns Zero. */
export function leave_span_callback(
  type: M.MD_SPANTYPE,
  detail: M.MD_SPAN_DETAIL | undefined,
  parser: SwMarkdownParser,
): number {
  void detail;
  if (parser.m_aAttrStack.length !== 0) parser.m_aAttrStack.pop();
  if (type === M.MD_SPANTYPE.MD_SPAN_IMG) {
    parser.InsertCurImage();
    parser.m_bInsideImage = false;
  }
  return 0;
}
/** Native text callback distinguishes raw HTML, normal/code, breaks and intentionally ignored entity/NULL/math callbacks. @param type - Text kind. @param text - Original bytes. @param size - Callback byte length. @param parser - Original userdata. @returns Zero. */
export function text_callback(
  type: M.MD_TEXTTYPE,
  text: Uint8Array,
  size: number,
  parser: SwMarkdownParser,
): number {
  switch (type) {
    case M.MD_TEXTTYPE.MD_TEXT_HTML:
      parser.m_htmlData += decodeMarkdownText(text.subarray(0, size));
      break;
    case M.MD_TEXTTYPE.MD_TEXT_NORMAL:
    case M.MD_TEXTTYPE.MD_TEXT_CODE: {
      const value = decodeMarkdownText(text.subarray(0, size));
      if (parser.m_bInsideImage) parser.m_aImg.desc = value;
      else parser.InsertText(value);
      break;
    }
    case M.MD_TEXTTYPE.MD_TEXT_BR:
      parser.m_xDoc.GetDocumentContentOperationsManager().InsertString(parser.m_pPam, "\n");
      break;
    case M.MD_TEXTTYPE.MD_TEXT_SOFTBR:
      parser.m_xDoc.GetDocumentContentOperationsManager().InsertString(parser.m_pPam, "\u00a0");
      break;
  }
  return 0;
}
