/** @fileoverview Character-property conversion shard of the existing SwXMLImport bridge; original item member validation is retained, without a substitute UNO service. */
import { createWriterTextColorItem } from "../../core/attr/swatrset";
import { MID_ESC, MID_ESC_HEIGHT } from "../../../../editeng/inc/memberids";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT } from "../../../inc/hintids";
import { ConvertFontSlant, ConvertFontWeight } from "../../../../vcl/inc/unohelp";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { MID_TL_COLOR, MID_TL_HASCOLOR } from "../../../../editeng/inc/memberids";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { OdfCharacterProperties } from "../../../../xmloff/source/text/txtparae";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
} from "../../../inc/hintids";
import { FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import { getFontFamilyFromGeneric } from "../../../../xmloff/source/style/fonthdl";
/** Converts ODF character deltas into pooled items. @param properties - Property deltas. @param put - Item sink. @param inherited - Reads untouched native composite fields. @returns Nothing. */
export function putCharacterProperties(
  properties: Partial<OdfCharacterProperties>,
  put: (item: SfxPoolItem) => unknown,
  inherited: (which: number) => SfxPoolItem,
): void {
  if (properties.escapement !== undefined || properties.escapementHeight !== undefined) {
    const original = (inherited(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).Clone(),
      value = new Any();
    let accepted = false;
    try {
      if (properties.escapement !== undefined) {
        value.insert([properties.escapement], "sal_Int16");
        accepted = original.PutValue(value, MID_ESC) || accepted;
      }
      if (properties.escapementHeight !== undefined) {
        value.insert([properties.escapementHeight], "sal_Int8");
        accepted = original.PutValue(value, MID_ESC_HEIGHT) || accepted;
      }
      if (accepted) put(original);
    } finally {
      value.dispose();
    }
  }
  if (properties.strikeout !== undefined)
    put(new SvxCrossedOutItem(properties.strikeout as FontStrikeout, RES_CHRATR_CROSSEDOUT));
  if (properties.color !== undefined) put(createWriterTextColorItem(properties.color));
  for (const [suffix, which] of [
    ["", RES_CHRATR_FONT],
    ["Asian", RES_CHRATR_CJK_FONT],
    ["Complex", RES_CHRATR_CTL_FONT],
  ] as const) {
    const family = properties[`fontFamily${suffix}`];
    if (family !== undefined)
      put(
        new SvxFontItem(
          getFontFamilyFromGeneric(properties[`fontFamilyGeneric${suffix}`]),
          family,
          properties[`fontStyleName${suffix}`] ?? "",
          properties[`fontPitch${suffix}`] ?? FontPitch.PITCH_DONTKNOW,
          properties[`fontCharSet${suffix}`] ?? RTL_TEXTENCODING_DONTKNOW,
          which,
        ),
      );
  }
  for (const [key, which] of [
    ["fontSizeTwips", RES_CHRATR_FONTSIZE],
    ["fontSizeTwipsAsian", RES_CHRATR_CJK_FONTSIZE],
    ["fontSizeTwipsComplex", RES_CHRATR_CTL_FONTSIZE],
  ] as const)
    if (properties[key] !== undefined) put(new SvxFontHeightItem(properties[key], 100, which));
  if (properties.highlight !== undefined)
    put(new SfxStringItem(RES_CHRATR_HIGHLIGHT, properties.highlight));
  for (const [key, which] of [
    ["fontWeight", RES_CHRATR_WEIGHT],
    ["fontWeightAsian", RES_CHRATR_CJK_WEIGHT],
    ["fontWeightComplex", RES_CHRATR_CTL_WEIGHT],
  ] as const) {
    const value = properties[key];
    if (value !== undefined) put(new SvxWeightItem(ConvertFontWeight(value, "float"), which));
  }
  for (const [key, which] of [
    ["fontPosture", RES_CHRATR_POSTURE],
    ["fontPostureAsian", RES_CHRATR_CJK_POSTURE],
    ["fontPostureComplex", RES_CHRATR_CTL_POSTURE],
  ] as const) {
    const value = properties[key];
    if (value !== undefined) put(new SvxPostureItem(ConvertFontSlant(value, "FontSlant"), which));
  }
  if (
    properties.underlineStyle !== undefined ||
    properties.underlineColor !== undefined ||
    properties.underlineHasColor !== undefined
  ) {
    const line = new SvxUnderlineItem(inherited(RES_CHRATR_UNDERLINE) as SvxUnderlineItem);
    if (properties.underlineStyle !== undefined) line.SetLineStyle(properties.underlineStyle);
    const value = new Any();
    try {
      if (properties.underlineColor !== undefined) {
        value.insert([properties.underlineColor], "sal_Int32");
        line.PutValue(value, MID_TL_COLOR);
      }
      if (properties.underlineHasColor !== undefined) {
        value.insert([properties.underlineHasColor], "bool");
        line.PutValue(value, MID_TL_HASCOLOR);
      }
    } finally {
      value.dispose();
    }
    put(line);
  }
}
