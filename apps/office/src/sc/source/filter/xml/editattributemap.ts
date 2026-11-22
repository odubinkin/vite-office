/** @fileoverview Consumed Calc ScXMLEditAttributeMap rows for character properties beyond the cell pattern. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import {
  EE_CHAR_EMPHASISMARK,
  EE_CHAR_ESCAPEMENT,
  EE_CHAR_FONTWIDTH,
  EE_CHAR_KERNING,
  EE_CHAR_LANGUAGE,
  EE_CHAR_LANGUAGE_CJK,
  EE_CHAR_LANGUAGE_CTL,
  EE_CHAR_PAIRKERNING,
  EE_CHAR_WLM,
} from "../../../../editeng/inc/eeitem";
import { MID_EMPHASIS, MID_ESC, MID_ESC_HEIGHT } from "../../../../editeng/inc/memberids";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import type { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import type { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import type { SvxCharScaleWidthItem } from "../../../../editeng/inc/charscaleitem";
import type { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import type { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import type { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { XMLNamedBoolPropertyHdl } from "../../../../xmloff/source/style/NamedBoolPropertyHdl";
import {
  exportTextCharacterProperties,
  exportTextLanguageProperties,
  importTextCharacterProperties,
  textLanguagePropertyTokens,
} from "../../../../xmloff/source/text/txtprmap";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import type { OdfCharacterProperties } from "../../../../xmloff/source/text/txtparae.types";

const scalarEntries = [
  ["wordMode", EE_CHAR_WLM, 0, "bool"],
  ["kerning", EE_CHAR_KERNING, 0, "sal_Int16"],
  ["autoKerning", EE_CHAR_PAIRKERNING, 0, "bool"],
  ["scaleWidth", EE_CHAR_FONTWIDTH, 0, "sal_Int16"],
  ["escapement", EE_CHAR_ESCAPEMENT, MID_ESC, "sal_Int16"],
  ["escapementHeight", EE_CHAR_ESCAPEMENT, MID_ESC_HEIGHT, "sal_Int8"],
  ["emphasis", EE_CHAR_EMPHASISMARK, MID_EMPHASIS, "sal_Int16"],
] as const;
const localeEntries = [
  ["language", EE_CHAR_LANGUAGE],
  ["languageAsian", EE_CHAR_LANGUAGE_CJK],
  ["languageComplex", EE_CHAR_LANGUAGE_CTL],
] as const;
const wordModeHandler = new XMLNamedBoolPropertyHdl("skip-white-space", "continuous");
const converter = new SvXMLUnitConverter("mm100");

/** Native attribute tokens of the represented edit-run properties. */
export const editTextPropertyTokens: readonly XMLToken[] = [
  XMLToken.STYLE_TEXT_UNDERLINE_MODE,
  XMLToken.STYLE_TEXT_OVERLINE_MODE,
  XMLToken.STYLE_TEXT_LINE_THROUGH_MODE,
  XMLToken.FO_LETTER_SPACING,
  XMLToken.STYLE_LETTER_KERNING,
  XMLToken.STYLE_TEXT_SCALE,
  XMLToken.STYLE_TEXT_POSITION,
  XMLToken.STYLE_TEXT_EMPHASIZE,
  ...textLanguagePropertyTokens,
];

/** Imports the edit-run items using the native Which and member identifiers. @param attributes - Original rich-text attributes. @param items - Scoped edit item set. @returns Nothing. */
export function importEditTextProperties(attributes: FastAttributeList, items: SfxItemSet): void {
  const properties = importTextCharacterProperties(attributes);
  const value = new Any();
  try {
    for (const [key, which, member, type] of scalarEntries) {
      const scalar = properties[key];
      if (scalar === undefined) continue;
      const item = (
        items.GetItemIfSet(which, false) ?? items.GetPool().GetPoolDefaultItem(which)
      ).Clone();
      if (!item) throw new Error(`Missing concrete EditEngine item for WhichId ${which}.`);
      value.insert([scalar], type);
      item.PutValue(value, member);
      items.Put(item, true);
    }
    for (const [key, which] of localeEntries) {
      const language = properties[key];
      if (language !== undefined) items.Put(new SvxLanguageItem(language, which), true);
    }
  } finally {
    value.dispose();
  }
}

/** The native item classes admitted by the scalar edit attribute rows. */
type EditScalarItem =
  | SvxWordLineModeItem
  | SvxKerningItem
  | SvxAutoKernItem
  | SvxCharScaleWidthItem
  | SvxEscapementItem
  | SvxEmphasisMarkItem;
/** Writable property accumulator for projecting items to the shared XML handlers. */
type MutableCharacterProperties = {
  -readonly [K in keyof OdfCharacterProperties]: OdfCharacterProperties[K];
};

/** Serializes native edit-run items. Calc maps its word-mode item to line-through-mode. @param items - Actual edit item state. @returns ODF attribute fragment. */
export function exportEditTextProperties(items: SfxItemSet): string {
  const properties: MutableCharacterProperties = {};
  const value = new Any();
  let wordMode = "";
  try {
    for (const [key, which, member, type] of scalarEntries) {
      const item = items.GetItemIfSet(which, false) as EditScalarItem | undefined;
      if (!item?.QueryValue(value, member)) continue;
      if (key === "wordMode") {
        const output: [string] = [""];
        if (wordModeHandler.exportXML(output, value, converter))
          wordMode = ` style:text-line-through-mode="${output[0]}"`;
      } else if (type === "bool") {
        const scalar: [boolean] = [false];
        if (value.extract(scalar, type)) properties[key] = scalar[0];
      } else {
        const scalar: [number] = [0];
        if (value.extract(scalar, type)) properties[key] = scalar[0];
      }
    }
    for (const [key, which] of localeEntries) {
      const item = items.GetItemIfSet(which, false) as SvxLanguageItem | undefined;
      if (item) properties[key] = item.GetLanguage();
    }
    let result = wordMode + exportTextCharacterProperties(properties);
    for (const [name, scalar] of exportTextLanguageProperties(properties))
      result += ` ${name}="${escapeXml(scalar)}"`;
    return result;
  } finally {
    value.dispose();
  }
}
