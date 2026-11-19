/** @fileoverview Projects native Writer character attributes into the ODF text-property map. */
import { writerTextColorValue, writerHighlightColorValue } from "../../core/attr/swatrset";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { RES_CHRATR_CROSSEDOUT } from "../../../inc/hintids";
import {
  RES_CHRATR_WORDLINEMODE,
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_KERNING,
} from "../../../inc/hintids";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
} from "../../../inc/hintids";
import { SvxWordLineModeItem } from "../../../../editeng/inc/wrlmitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import {
  SvxFontItem,
  SvxFontHeightItem,
  SvxWeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
} from "../../../../editeng/source/items/textitem";
import { ConvertFontWeight, ConvertFontSlant } from "../../../../vcl/inc/unohelp";
import { getFontFamilyGeneric } from "../../../../xmloff/source/style/fonthdl";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { OdfCharacterProperties } from "../../../../xmloff/source/text/txtparae.types";
import { getOdfThemeColor } from "../../../../xmloff/source/text/XMLComplexColorContext";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_COLOR,
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

/** Projects independent native character items to ODF properties. @param set - Optional Writer item set. @param inherited - Whether parent sets participate. @returns Properties when at least one direct item exists. */
export function getCharacterProperties(
  set: SfxItemSet | undefined,
  inherited: boolean,
): Partial<OdfCharacterProperties> | undefined {
  if (set === undefined) return undefined;
  const weightIds = [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT];
  const postureIds = [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE];
  const directWeight = weightIds.some(
    /** Detects a direct script weight. @param which - Weight WhichId. @returns Whether set. */
    (which) => set.GetItemIfSet(which, false) !== undefined,
  );
  const directPosture = postureIds.some(
    /** Detects a direct script posture. @param which - Posture WhichId. @returns Whether set. */
    (which) => set.GetItemIfSet(which, false) !== undefined,
  );
  const escapement = set.GetItemIfSet(RES_CHRATR_ESCAPEMENT, inherited);
  const crossedOut = set.GetItemIfSet(RES_CHRATR_CROSSEDOUT, inherited);
  const wordMode = set.GetItemIfSet(RES_CHRATR_WORDLINEMODE, inherited),
    autoKerning = set.GetItemIfSet(RES_CHRATR_AUTOKERN, inherited);
  const kerning = set.GetItemIfSet(RES_CHRATR_KERNING, inherited);
  const directUnderline = set.GetItemIfSet(RES_CHRATR_UNDERLINE, false) !== undefined;
  const color = set.GetItemIfSet(RES_CHRATR_COLOR, inherited);
  const highlight = set.GetItemIfSet(RES_CHRATR_HIGHLIGHT, inherited);
  const language = set.GetItemIfSet(RES_CHRATR_LANGUAGE, inherited);
  const languageAsian = set.GetItemIfSet(RES_CHRATR_CJK_LANGUAGE, inherited);
  const languageComplex = set.GetItemIfSet(RES_CHRATR_CTL_LANGUAGE, inherited);
  const fontSizeIds = [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE];
  const directFontSize = fontSizeIds.some(
    /** Detects a direct script font size. @param which - Font-size WhichId. @returns Whether set. */ (
      which,
    ) => set.GetItemIfSet(which, false) !== undefined,
  );
  const font = set.GetItemIfSet(RES_CHRATR_FONT, inherited);
  const asianFont = set.GetItemIfSet(RES_CHRATR_CJK_FONT, inherited);
  const complexFont = set.GetItemIfSet(RES_CHRATR_CTL_FONT, inherited);
  if (
    !inherited &&
    !directWeight &&
    !directPosture &&
    !directUnderline &&
    crossedOut === undefined &&
    escapement === undefined &&
    !directFontSize &&
    color === undefined &&
    highlight === undefined &&
    language === undefined &&
    languageAsian === undefined &&
    languageComplex === undefined &&
    font === undefined &&
    asianFont === undefined &&
    complexFont === undefined &&
    wordMode === undefined &&
    autoKerning === undefined &&
    kerning === undefined
  )
    return undefined;
  const weight = set.Get(RES_CHRATR_WEIGHT, inherited);
  const asianWeight = set.Get(RES_CHRATR_CJK_WEIGHT, inherited);
  const complexWeight = set.Get(RES_CHRATR_CTL_WEIGHT, inherited);
  const posture = set.Get(RES_CHRATR_POSTURE, inherited);
  const asianPosture = set.Get(RES_CHRATR_CJK_POSTURE, inherited);
  const complexPosture = set.Get(RES_CHRATR_CTL_POSTURE, inherited);
  const underline = set.Get(RES_CHRATR_UNDERLINE, inherited);
  const fontSize = set.Get(RES_CHRATR_FONTSIZE, inherited);
  const asianFontSize = set.Get(RES_CHRATR_CJK_FONTSIZE, inherited);
  const complexFontSize = set.Get(RES_CHRATR_CTL_FONTSIZE, inherited);
  if (
    !(weight instanceof SvxWeightItem) ||
    !(asianWeight instanceof SvxWeightItem) ||
    !(complexWeight instanceof SvxWeightItem) ||
    !(posture instanceof SvxPostureItem) ||
    !(asianPosture instanceof SvxPostureItem) ||
    !(complexPosture instanceof SvxPostureItem) ||
    !(underline instanceof SvxUnderlineItem) ||
    (color !== undefined && !(color instanceof SvxColorItem)) ||
    (highlight !== undefined && !(highlight instanceof SvxBrushItem)) ||
    !(fontSize instanceof SvxFontHeightItem) ||
    !(asianFontSize instanceof SvxFontHeightItem) ||
    !(complexFontSize instanceof SvxFontHeightItem)
  )
    throw new Error("ODT character item is invalid.");
  const fontFamilyGeneric =
      font instanceof SvxFontItem ? getFontFamilyGeneric(font.GetFamily()) : undefined,
    asianGeneric =
      asianFont instanceof SvxFontItem ? getFontFamilyGeneric(asianFont.GetFamily()) : undefined,
    complexGeneric =
      complexFont instanceof SvxFontItem
        ? getFontFamilyGeneric(complexFont.GetFamily())
        : undefined;
  const themeColor =
    color instanceof SvxColorItem ? getOdfThemeColor(color.getComplexColor()) : undefined;
  return {
    ...(color instanceof SvxColorItem
      ? color.GetValue().GetAlpha() === 255 || writerTextColorValue(color) === "auto"
        ? { color: writerTextColorValue(color) }
        : {
            color: `#${(color.GetValue().toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`,
            textTransparency: Math.round(((255 - color.GetValue().GetAlpha()) * 100) / 255),
          }
      : {}),
    ...(themeColor ? { themeColor } : {}),
    ...(font instanceof SvxFontItem
      ? {
          fontFamily: font.GetFamilyName(),
          fontStyleName: font.GetStyleName(),
          fontPitch: font.GetPitch(),
          fontCharSet: font.GetCharSet(),
          ...(fontFamilyGeneric === undefined ? {} : { fontFamilyGeneric }),
        }
      : {}),
    ...(asianFont instanceof SvxFontItem
      ? {
          fontFamilyAsian: asianFont.GetFamilyName(),
          fontStyleNameAsian: asianFont.GetStyleName(),
          fontPitchAsian: asianFont.GetPitch(),
          fontCharSetAsian: asianFont.GetCharSet(),
          ...(asianGeneric === undefined ? {} : { fontFamilyGenericAsian: asianGeneric }),
        }
      : {}),
    ...(complexFont instanceof SvxFontItem
      ? {
          fontFamilyComplex: complexFont.GetFamilyName(),
          fontStyleNameComplex: complexFont.GetStyleName(),
          fontPitchComplex: complexFont.GetPitch(),
          fontCharSetComplex: complexFont.GetCharSet(),
          ...(complexGeneric === undefined ? {} : { fontFamilyGenericComplex: complexGeneric }),
        }
      : {}),
    ...(set.GetItemIfSet(RES_CHRATR_FONTSIZE, inherited) !== undefined
      ? { fontSizeTwips: fontSize.GetHeight() }
      : {}),
    ...(set.GetItemIfSet(RES_CHRATR_CJK_FONTSIZE, inherited) !== undefined
      ? { fontSizeTwipsAsian: asianFontSize.GetHeight() }
      : {}),
    ...(set.GetItemIfSet(RES_CHRATR_CTL_FONTSIZE, inherited) !== undefined
      ? { fontSizeTwipsComplex: complexFontSize.GetHeight() }
      : {}),
    ...(language instanceof SvxLanguageItem ? { language: language.GetLanguage() } : {}),
    ...(languageAsian instanceof SvxLanguageItem
      ? { languageAsian: languageAsian.GetLanguage() }
      : {}),
    ...(languageComplex instanceof SvxLanguageItem
      ? { languageComplex: languageComplex.GetLanguage() }
      : {}),
    ...(highlight instanceof SvxBrushItem
      ? { highlight: writerHighlightColorValue(highlight) }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_WEIGHT, false) !== undefined
      ? { fontWeight: ConvertFontWeight(weight.GetValue(), "FontWeight") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CJK_WEIGHT, false) !== undefined
      ? { fontWeightAsian: ConvertFontWeight(asianWeight.GetValue(), "FontWeight") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CTL_WEIGHT, false) !== undefined
      ? { fontWeightComplex: ConvertFontWeight(complexWeight.GetValue(), "FontWeight") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_POSTURE, false) !== undefined
      ? { fontPosture: ConvertFontSlant(posture.GetValue(), "FontItalic") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CJK_POSTURE, false) !== undefined
      ? { fontPostureAsian: ConvertFontSlant(asianPosture.GetValue(), "FontItalic") }
      : {}),
    ...(inherited || set.GetItemIfSet(RES_CHRATR_CTL_POSTURE, false) !== undefined
      ? { fontPostureComplex: ConvertFontSlant(complexPosture.GetValue(), "FontItalic") }
      : {}),
    ...(escapement instanceof SvxEscapementItem
      ? { escapement: escapement.GetEsc(), escapementHeight: escapement.GetProportionalHeight() }
      : {}),
    ...(crossedOut instanceof SvxCrossedOutItem ? { strikeout: crossedOut.GetStrikeout() } : {}),
    ...(wordMode instanceof SvxWordLineModeItem ? { wordMode: wordMode.GetValue() } : {}),
    ...(autoKerning instanceof SvxAutoKernItem ? { autoKerning: autoKerning.GetValue() } : {}),
    ...(kerning instanceof SvxKerningItem
      ? { kerning: Number(BigInt.asIntN(16, convertTwipToMm100(BigInt(kerning.GetValue())))) }
      : {}),
    ...(inherited || directUnderline
      ? {
          underlineStyle: underline.GetLineStyle(),
          underlineColor: underline.GetColor().toUInt32() & 0xffffff,
          underlineHasColor: underline.GetColor().GetAlpha() === 255,
        }
      : {}),
  };
}
