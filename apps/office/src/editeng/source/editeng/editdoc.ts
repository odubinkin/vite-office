/** @fileoverview Original EditEngineItemPool construction over the real shared item package. Native reference-count/destructor cleanup remains outside the current GC value boundary. */
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getItemInfoPackageEditEngine } from "./eerdll";
import { LineEnd } from "../../../tools/inc/lineend";
import type { OUString } from "../../../sal/inc/rtl/ustring";

/** Original concrete EditEngine pool,not a document or rendering service. */
export class EditEngineItemPool extends SfxItemPool {
  /** Original pool name and complete default-package registration. @returns Pool. */
  constructor() {
    const name = unicode("EditEngineItemPool");
    super(name);
    name.dispose();
    this.registerItemInfoPackage(getItemInfoPackageEditEngine());
  }
}

/** Original EditDoc::GetSepStr static responsibility,with C++ qualification erased by the ESM namespace. @param end - Native line-end selection. @returns Owned native string. */
export function GetSepStr(end: LineEnd): OUString {
  if (end === LineEnd.LINEEND_CR) return unicode("\r");
  if (end === LineEnd.LINEEND_LF) return unicode("\n");
  return unicode("\r\n");
}

import * as EE from "../../inc/eeitem";
import * as Attr from "../../inc/editattr";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** Original complete item-ID dispatch. Invalid IDs reach the original diagnostic/null path; no generic fallback attribute is invented. @param pool - Actual pool. @param item - Actual source item. @param start - Source start. @param end - Source end. @returns Actual concrete owner or original null result. */
export function MakeCharAttrib(
  pool: SfxItemPool,
  item: SfxPoolItem,
  start: number,
  end: number,
): Attr.EditCharAttrib | null {
  switch (item.Which()) {
    case EE.EE_CHAR_LANGUAGE:
    case EE.EE_CHAR_LANGUAGE_CJK:
    case EE.EE_CHAR_LANGUAGE_CTL:
      return new Attr.EditCharAttribLanguage(pool, item, start, end);
    case EE.EE_CHAR_COLOR:
      return new Attr.EditCharAttribColor(pool, item, start, end);
    case EE.EE_CHAR_FONTINFO:
    case EE.EE_CHAR_FONTINFO_CJK:
    case EE.EE_CHAR_FONTINFO_CTL:
      return new Attr.EditCharAttribFont(pool, item, start, end);
    case EE.EE_CHAR_FONTHEIGHT:
    case EE.EE_CHAR_FONTHEIGHT_CJK:
    case EE.EE_CHAR_FONTHEIGHT_CTL:
      return new Attr.EditCharAttribFontHeight(pool, item, start, end);
    case EE.EE_CHAR_FONTWIDTH:
      return new Attr.EditCharAttribFontWidth(pool, item, start, end);
    case EE.EE_CHAR_WEIGHT:
    case EE.EE_CHAR_WEIGHT_CJK:
    case EE.EE_CHAR_WEIGHT_CTL:
      return new Attr.EditCharAttribWeight(pool, item, start, end);
    case EE.EE_CHAR_UNDERLINE:
      return new Attr.EditCharAttribUnderline(pool, item, start, end);
    case EE.EE_CHAR_OVERLINE:
      return new Attr.EditCharAttribOverline(pool, item, start, end);
    case EE.EE_CHAR_EMPHASISMARK:
      return new Attr.EditCharAttribEmphasisMark(pool, item, start, end);
    case EE.EE_CHAR_RELIEF:
      return new Attr.EditCharAttribRelief(pool, item, start, end);
    case EE.EE_CHAR_STRIKEOUT:
      return new Attr.EditCharAttribStrikeout(pool, item, start, end);
    case EE.EE_CHAR_ITALIC:
    case EE.EE_CHAR_ITALIC_CJK:
    case EE.EE_CHAR_ITALIC_CTL:
      return new Attr.EditCharAttribItalic(pool, item, start, end);
    case EE.EE_CHAR_OUTLINE:
      return new Attr.EditCharAttribOutline(pool, item, start, end);
    case EE.EE_CHAR_SHADOW:
      return new Attr.EditCharAttribShadow(pool, item, start, end);
    case EE.EE_CHAR_ESCAPEMENT:
      return new Attr.EditCharAttribEscapement(pool, item, start, end);
    case EE.EE_CHAR_PAIRKERNING:
      return new Attr.EditCharAttribPairKerning(pool, item, start, end);
    case EE.EE_CHAR_KERNING:
      return new Attr.EditCharAttribKerning(pool, item, start, end);
    case EE.EE_CHAR_WLM:
      return new Attr.EditCharAttribWordLineMode(pool, item, start, end);
    case EE.EE_CHAR_XMLATTRIBS:
      return new Attr.EditCharAttrib(pool, item, start, end);
    case EE.EE_CHAR_CASEMAP:
      return new Attr.EditCharAttribCaseMap(pool, item, start, end);
    case EE.EE_CHAR_GRABBAG:
      return new Attr.EditCharAttribGrabBag(pool, item, start, end);
    case EE.EE_FEATURE_TAB:
      return new Attr.EditCharAttribTab(pool, item, start);
    case EE.EE_FEATURE_LINEBR:
      return new Attr.EditCharAttribLineBreak(pool, item, start);
    case EE.EE_FEATURE_FIELD:
      return new Attr.EditCharAttribField(pool, item, start);
    case EE.EE_CHAR_BKGCOLOR:
      return new Attr.EditCharAttribBackgroundColor(pool, item, start, end);
    case EE.EE_CHAR_RUBY:
      return new Attr.EditCharAttribRuby(pool, item, start, end);
    case EE.EE_CHAR_SCRIPT_HINT:
      return new Attr.EditCharAttribScriptHint(pool, item, start, end);
    case EE.EE_CHAR_OPTICALSIZING:
      return new Attr.EditCharAttribOpticalSizing(pool, item, start, end);
    case EE.EE_CHAR_FONTVARIATIONS:
      return new Attr.EditCharAttribFontVariations(pool, item, start, end);
    default:
      return null;
  }
}
