/** @fileoverview Projects native Writer character attributes into the ODF text-property map. */
import { RES_CHRATR_BOX, RES_TXTATR_AUTOFMT, RES_TXTATR_INETFMT } from "../../../inc/hintids";
import { GetTextAttrMode } from "../../../inc/swtypes";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { exportBoxProperties } from "./xmlexpit";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwTextCharFormat } from "../../core/txtnode/txtatr2";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { getCharacterOdfStyleName } from "./xmlexp-style-names";
import { writerTextColorValue, writerHighlightColorValue } from "../../core/attr/swatrset";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";
import { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import { MID_EMPHASIS } from "../../../../editeng/inc/memberids";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import {
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_EMPHASIS_MARK,
  RES_CHRATR_OVERLINE,
} from "../../../inc/hintids";
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
  SvxOverlineItem,
} from "../../../../editeng/source/items/textitem";
import { ConvertFontWeight, ConvertFontSlant } from "../../../../vcl/inc/unohelp";
import { getFontFamilyGeneric } from "../../../../xmloff/source/style/fonthdl";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { OdfCharacterProperties } from "../../../../xmloff/source/text/txtparae.types";
import type { XMLTextParagraphSource } from "../../../../xmloff/source/text/txtparae";
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
  RES_CHRATR_BACKGROUND,
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
  const box = set.GetItemIfSet(RES_CHRATR_BOX, inherited);
  const escapement = set.GetItemIfSet(RES_CHRATR_ESCAPEMENT, inherited);
  const crossedOut = set.GetItemIfSet(RES_CHRATR_CROSSEDOUT, inherited);
  const emphasisItem = set.GetItemIfSet(RES_CHRATR_EMPHASIS_MARK, inherited);
  const wordMode = set.GetItemIfSet(RES_CHRATR_WORDLINEMODE, inherited),
    autoKerning = set.GetItemIfSet(RES_CHRATR_AUTOKERN, inherited);
  const kerning = set.GetItemIfSet(RES_CHRATR_KERNING, inherited);
  const overline = set.GetItemIfSet(RES_CHRATR_OVERLINE, inherited);
  const directUnderline = set.GetItemIfSet(RES_CHRATR_UNDERLINE, false) !== undefined;
  const color = set.GetItemIfSet(RES_CHRATR_COLOR, inherited);
  const highlight = set.GetItemIfSet(RES_CHRATR_HIGHLIGHT, inherited);
  const background = set.GetItemIfSet(RES_CHRATR_BACKGROUND, inherited);
  const visibleBackground =
    highlight instanceof SvxBrushItem && writerHighlightColorValue(highlight) !== "transparent"
      ? highlight
      : background;
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
    overline === undefined &&
    box === undefined &&
    crossedOut === undefined &&
    emphasisItem === undefined &&
    escapement === undefined &&
    !directFontSize &&
    color === undefined &&
    visibleBackground === undefined &&
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
    (background !== undefined && !(background instanceof SvxBrushItem)) ||
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
  const emphasis: [number] = [0];
  if (emphasisItem instanceof SvxEmphasisMarkItem) {
    const value = new Any();
    try {
      emphasisItem.QueryValue(value, MID_EMPHASIS);
      value.extract(emphasis, "sal_Int16");
    } finally {
      value.dispose();
    }
  }
  return {
    ...(emphasisItem instanceof SvxEmphasisMarkItem ? { emphasis: emphasis[0] } : {}),
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
    ...(visibleBackground instanceof SvxBrushItem
      ? { highlight: writerHighlightColorValue(visibleBackground) }
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
    ...(box instanceof SvxBoxItem ? { characterBox: exportBoxProperties(box) } : {}),
    ...(escapement instanceof SvxEscapementItem
      ? { escapement: escapement.GetEsc(), escapementHeight: escapement.GetProportionalHeight() }
      : {}),
    ...(crossedOut instanceof SvxCrossedOutItem ? { strikeout: crossedOut.GetStrikeout() } : {}),
    ...(wordMode instanceof SvxWordLineModeItem ? { wordMode: wordMode.GetValue() } : {}),
    ...(autoKerning instanceof SvxAutoKernItem ? { autoKerning: autoKerning.GetValue() } : {}),
    ...(kerning instanceof SvxKerningItem
      ? { kerning: Number(BigInt.asIntN(16, convertTwipToMm100(BigInt(kerning.GetValue())))) }
      : {}),
    ...(overline instanceof SvxOverlineItem
      ? {
          overlineStyle: overline.GetLineStyle(),
          overlineColor: overline.GetColor().toUInt32() & 0xffffff,
          overlineHasColor: overline.GetColor().GetAlpha() === 255,
        }
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

/** Enumerates actual native hint boundaries without merging through browser booleans. @param node - Canonical text owner. @returns Source item-based XML runs. */
export function projectXmlTextRuns(node: SwTextNode): XMLTextParagraphSource["runs"] {
  const boundaries = new Set([0, node.Len()]);
  const hints = node.GetpSwpHints()?.entries() ?? [];
  for (const hint of hints) {
    boundaries.add(hint.GetStart());
    boundaries.add(hint.end);
  }
  const ordered = [...boundaries].sort(
    /** Orders UTF16 source positions. @param a - First. @param b - Second. @returns Ordering. */ (
      a,
      b,
    ) => a - b,
  );
  return ordered.slice(0, -1).map(
    /** Reads the native items and independent hyperlink for one source segment. @param start - Segment start. @param index - Boundary index. @returns XML run. */ (
      start,
      index,
    ) => {
      const end = ordered[index + 1] as number;
      const styles = hints
        .filter(
          /** Finds fully covering native character portions. @param hint - Native text hint. @returns Matching style span. */
          (hint): hint is SwTextCharFormat =>
            hint instanceof SwTextCharFormat && hint.GetStart() <= start && end <= hint.GetEnd(),
        )
        .sort(
          /** Uses the native CharStyleNames property order. @param a - First style. @param b - Second style. @returns Native order. */
          (a, b) => a.GetSortNumber() - b.GetSortNumber(),
        )
        .flatMap(
          /** Resolves the actual character format identity. @param hint - Style span. @returns Encoded style name if defined. */
          (hint) => {
            const format = hint.GetAttr().GetCharFormat();
            return format ? [getCharacterOdfStyleName(format)] : [];
          },
        );
      const auto = node.GetTextAttrAt(start, RES_TXTATR_AUTOFMT, GetTextAttrMode.Default)?.format;
      const direct = auto instanceof SwFormatAutoFormat ? auto.GetStyleHandle() : undefined;
      let properties: OdfCharacterProperties;
      if (styles.length) properties = getCharacterProperties(direct, false) ?? {};
      else if (direct === undefined)
        properties = getCharacterProperties(node.GetSwAttrSet(), true) ?? {};
      else {
        const items = new SfxItemSet(node.GetSwAttrSet());
        try {
          items.PutSet(direct);
          properties = getCharacterProperties(items, true) ?? {};
        } finally {
          items.Dispose();
        }
      }
      const link = node.GetTextAttrAt(start, RES_TXTATR_INETFMT, GetTextAttrMode.Default);
      return {
        text: node.GetText().slice(start, end),
        properties,
        ...(styles.length ? { characterStyles: styles } : {}),
        ...(link?.format instanceof SwFormatINetFormat
          ? { hyperlink: link.format.GetHyperlink() }
          : {}),
      };
    },
  );
}
