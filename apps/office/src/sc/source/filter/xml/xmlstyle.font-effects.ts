/** @fileoverview Original Calc chained contour/shadow/relief text property handlers;actual native items and shared Any/handlers own values. */
import { MID_EMPHASIS } from "../../../../editeng/inc/memberids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { XMLNamedBoolPropertyHdl } from "../../../../xmloff/source/style/NamedBoolPropertyHdl";
import { XMLBoolPropHdl } from "../../../../xmloff/source/style/xmlbahdl";
import { XMLShadowedPropHdl } from "../../../../xmloff/source/style/shdwdhdl";
import { XMLConstantsPropertyHandler } from "../../../../xmloff/source/style/XMLConstantsPropertyHandler";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { SvxContourItem } from "../../../../editeng/inc/contouritem";
import { SvxShadowedItem, SvxCharReliefItem } from "../../../../editeng/source/items/textitem";
import type { ScPatternAttr } from "../../../inc/patattr";
import { SvxWordLineModeItem } from "../../../../editeng/source/items/textitem";
import { SvxEmphasisMarkItem } from "../../../../editeng/source/items/textitem.effects";
import { SvxLanguageItem } from "../../../../editeng/source/items/textitem.language";
import { XMLTextEmphasizePropHdl } from "../../../../xmloff/source/text/txtprhdl";
import {
  exportTextLanguageProperties,
  importTextLanguageProperties,
  textLanguagePropertyTokens,
} from "../../../../xmloff/source/text/txtprmap";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import * as attr from "../../../inc/scitems";
const converter = new SvXMLUnitConverter("twip");
/** Source txtprmap/txtprhdl chained handlers and original item identities. */
const properties = [
  [XMLToken.STYLE_TEXT_OUTLINE, "style:text-outline", 107, new XMLBoolPropHdl()],
  [XMLToken.FO_TEXT_SHADOW, "fo:text-shadow", 108, new XMLShadowedPropHdl()],
  [
    XMLToken.STYLE_FONT_RELIEF,
    "style:font-relief",
    124,
    new XMLConstantsPropertyHandler(
      [
        ["none", 0],
        ["engraved", 2],
        ["embossed", 1],
      ],
      null,
    ),
  ],
  [
    XMLToken.STYLE_TEXT_EMPHASIZE,
    "style:text-emphasize",
    attr.ATTR_FONT_EMPHASISMARK,
    new XMLTextEmphasizePropHdl(),
  ],
  [
    XMLToken.STYLE_TEXT_UNDERLINE_MODE,
    "style:text-underline-mode",
    attr.ATTR_FONT_WORDLINE,
    new XMLNamedBoolPropertyHdl("skip-white-space", "continuous"),
  ],
] as const;
/** Original script language mappings for the cell text property mapper. */
const languages = [
  ["language", attr.ATTR_FONT_LANGUAGE],
  ["languageAsian", attr.ATTR_CJK_FONT_LANGUAGE],
  ["languageComplex", attr.ATTR_CTL_FONT_LANGUAGE],
] as const;

/** Recognized source effects and character locale properties. */
export const cellFontEffectTokens = [
  ...textLanguagePropertyTokens,
  ...properties.map(
    /** Reads the source effect type. @param entry - Effect mapping. @returns Token. */
    ([token]) => token,
  ),
  XMLToken.STYLE_TEXT_OVERLINE_MODE,
  XMLToken.STYLE_TEXT_LINE_THROUGH_MODE,
];
/** Exports original explicit item states including authored false/none. @param pattern - Actual native pattern. @returns XML attributes. */
export function exportFontEffectProperties(pattern: ScPatternAttr): string {
  let result = "";
  const value = new Any(),
    output: [string] = [""];
  try {
    const locale: Partial<Record<(typeof languages)[number][0], number>> = {};
    for (const [property, which] of languages)
      if (pattern.GetItemSet().GetItemState(which, false) === SfxItemState.SET)
        locale[property] = (pattern.GetItem(which) as SvxLanguageItem).GetLanguage();
    for (const [name, body] of exportTextLanguageProperties(locale))
      result += ` ${name}="${escapeXml(body)}"`;
    for (const [, name, which, handler] of properties) {
      if (pattern.GetItemSet().GetItemState(which, false) !== SfxItemState.SET) continue;
      const item = pattern.GetItem(which);
      if (item instanceof SvxEmphasisMarkItem) item.QueryValue(value, MID_EMPHASIS);
      else
        (
          item as SvxContourItem | SvxShadowedItem | SvxCharReliefItem | SvxWordLineModeItem
        ).QueryValue(value);
      if (handler.exportXML(output, value, converter)) {
        result += ` ${name}="${output[0]}"`;
        if (which === attr.ATTR_FONT_WORDLINE)
          result += ` style:text-overline-mode="${output[0]}" style:text-line-through-mode="${output[0]}"`;
      }
    }
    return result;
  } finally {
    value.dispose();
  }
}
/** Imports original handlers without browser-normalizing lexical values. @param pattern - Actual pattern. @param attributes - Actual SAX properties. @param unsupported - Diagnostic sink. @returns Nothing. */
export function importFontEffectProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  const value = new Any();
  try {
    const locale = importTextLanguageProperties(attributes);
    for (const [property, which] of languages) {
      const language = locale[property];
      if (language !== undefined) pattern.ItemSetPut(new SvxLanguageItem(language, which));
    }
    for (const [token, , which, handler] of properties) {
      let source = attributes.get(token);
      if (which === attr.ATTR_FONT_WORDLINE) {
        for (const [property, text] of attributes) {
          if (
            property === token ||
            property === XMLToken.STYLE_TEXT_OVERLINE_MODE ||
            property === XMLToken.STYLE_TEXT_LINE_THROUGH_MODE
          )
            source = text;
        }
      }
      if (source === null) continue;
      if (handler.importXML(source, value, converter)) {
        const item = pattern.GetItem(which).Clone() as
          | SvxContourItem
          | SvxShadowedItem
          | SvxCharReliefItem
          | SvxWordLineModeItem
          | SvxEmphasisMarkItem;
        item.PutValue(value, which === attr.ATTR_FONT_EMPHASISMARK ? MID_EMPHASIS : 0);
        pattern.ItemSetPut(item);
        item.Dispose();
      } else
        unsupported(
          which === attr.ATTR_FONT_CONTOUR
            ? "invalid cell outline property"
            : which === attr.ATTR_FONT_EMPHASISMARK
              ? "invalid cell emphasis property"
              : which === attr.ATTR_FONT_WORDLINE
                ? "invalid cell line mode"
                : "invalid cell relief property",
        );
    }
  } finally {
    value.dispose();
  }
}
