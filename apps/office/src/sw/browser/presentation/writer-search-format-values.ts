/** @fileoverview Shared browser presentation of native search formatting choices and summaries. */
import {
  SvxForbiddenRuleItem,
  SvxHangingPunctuationItem,
  SvxHyphenZoneItem,
  SvxScriptSpaceItem,
} from "../../../editeng/source/items/paraitem";
import { SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../editeng/inc/lrspitem";
import {
  SvxFormatSplitItem,
  ParaVertAlign,
  SvxOrphansItem,
  SvxParaVertAlignItem,
  SvxWidowsItem,
} from "../../../editeng/source/items/paraitem.controls";
import {
  SvxInterLineSpaceRule,
  SvxLineSpaceRule,
  SvxAdjust,
  SvxCaseMap,
} from "../../../editeng/inc/svxenum";
import { SvxCaseMapItem } from "../../../editeng/source/items/textitem.modes";
import { SvxCrossedOutItem } from "../../../editeng/source/items/textitem.effects";
import { SvxEmphasisMarkItem } from "../../../editeng/inc/emphasismarkitem";
import { SvxEscapementItem } from "../../../editeng/source/items/textitem.escapement";
import { SvxTwoLinesItem } from "../../../editeng/inc/twolinesitem";
import { SvxCharRotateItem } from "../../../editeng/source/items/textitem.layout";
import {
  SvxAutoKernItem,
  SvxCharScaleWidthItem,
  SvxKerningItem,
} from "../../../editeng/source/items/textitem.spacing";
import { SvxColorItem } from "../../../editeng/source/items/textitem.color";
import { SvxBrushItem } from "../../../editeng/source/items/frmitems.brush";
import { Color, COL_AUTO, COL_TRANSPARENT } from "../../../tools/inc/color";
import { FontRelief } from "../../../vcl/inc/fntstyle";
import { SvxLanguageItem } from "../../../editeng/inc/langitem";
import { describeLanguage } from "../../../svx/source/dialog/langbox";
import { ASIAN, COMPLEX, LATIN } from "../../../offapi/com/sun/star/i18n/ScriptType";
import { getBrowserFont } from "../../../svtools/browser/font-list";
import { SvxFontItem } from "../../../editeng/source/items/textitem.font";
import {
  SvxFontHeightItem,
  SvxOverlineItem,
  SvxContourItem,
  SvxShadowedItem,
  SvxCharReliefItem,
  SvxWordLineModeItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { GetAttributeName } from "../../../svx/source/dialog/strarray";
import type { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import {
  FontEmphasisMark,
  FontItalic,
  FontLineStyle,
  FontStrikeout,
  FontWeight,
} from "../../../tools/inc/fontenum";
import {
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_CASEMAP,
  RES_CHRATR_EMPHASIS_MARK,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_ROTATE,
  RES_CHRATR_CONTOUR,
  RES_CHRATR_RELIEF,
  RES_CHRATR_SCALEW,
  RES_CHRATR_SHADOWED,
  RES_CHRATR_WORDLINEMODE,
  RES_CHRATR_COLOR,
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_CTL_LANGUAGE,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_KERNING,
  RES_CHRATR_OVERLINE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_TWO_LINES,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_HYPHENZONE,
  RES_PARATR_FORBIDDEN_RULES,
  RES_PARATR_HANGINGPUNCTUATION,
  RES_PARATR_SCRIPTSPACE,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_PARATR_VERTALIGN,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_UL_SPACE,
} from "../../inc/hintids";

export const emphasisMarks = [
  [FontEmphasisMark.NONE, "(Without)"],
  [FontEmphasisMark.Dot, "Dot"],
  [FontEmphasisMark.Circle, "Circle"],
  [FontEmphasisMark.Disc, "Disc"],
  [FontEmphasisMark.Accent, "Accent"],
] as const;

export const fontWeights = [
  [FontWeight.WEIGHT_NORMAL, "Regular"],
  [FontWeight.WEIGHT_LIGHT, "Light"],
  [FontWeight.WEIGHT_SEMIBOLD, "Semibold"],
  [FontWeight.WEIGHT_BOLD, "Bold"],
] as const;
export const postures = [
  [FontItalic.ITALIC_NONE, "Regular"],
  [FontItalic.ITALIC_OBLIQUE, "Oblique"],
  [FontItalic.ITALIC_NORMAL, "Italic"],
] as const;
/** Line styles listed by the native Font Effects tab, in UI order. */
export const underlines = [
  [FontLineStyle.LINESTYLE_NONE, "(Without)"],
  [FontLineStyle.LINESTYLE_SINGLE, "Single"],
  [FontLineStyle.LINESTYLE_DOUBLE, "Double"],
  [FontLineStyle.LINESTYLE_BOLD, "Bold"],
  [FontLineStyle.LINESTYLE_DOTTED, "Dotted"],
  [FontLineStyle.LINESTYLE_BOLDDOTTED, "Dotted (Bold)"],
  [FontLineStyle.LINESTYLE_DASH, "Dash"],
  [FontLineStyle.LINESTYLE_BOLDDASH, "Dash (Bold)"],
  [FontLineStyle.LINESTYLE_LONGDASH, "Long Dash"],
  [FontLineStyle.LINESTYLE_BOLDLONGDASH, "Long Dash (Bold)"],
  [FontLineStyle.LINESTYLE_DASHDOT, "Dot Dash"],
  [FontLineStyle.LINESTYLE_BOLDDASHDOT, "Dot Dash (Bold)"],
  [FontLineStyle.LINESTYLE_DASHDOTDOT, "Dot Dot Dash"],
  [FontLineStyle.LINESTYLE_BOLDDASHDOTDOT, "Dot Dot Dash (Bold)"],
  [FontLineStyle.LINESTYLE_WAVE, "Wave"],
  [FontLineStyle.LINESTYLE_BOLDWAVE, "Wave (Bold)"],
  [FontLineStyle.LINESTYLE_DOUBLEWAVE, "Double Wave"],
] as const;

/** Advances the native tri-state Font Effects checkbox. @param current - Current state, or undefined when mixed. @param mixed - Whether the input supports the mixed state. @returns Next state. */
export function nextFontEffectCheck(
  current: boolean | undefined,
  mixed: boolean,
): boolean | undefined {
  return current === true && mixed ? undefined : current === false;
}

/** Strikeout styles listed separately by the native Font Effects tab. */
export const strikeouts = [
  [FontStrikeout.STRIKEOUT_NONE, "(Without)"],
  [FontStrikeout.STRIKEOUT_SINGLE, "Single"],
  [FontStrikeout.STRIKEOUT_DOUBLE, "Double"],
  [FontStrikeout.STRIKEOUT_BOLD, "Bold"],
  [FontStrikeout.STRIKEOUT_SLASH, "With /"],
  [FontStrikeout.STRIKEOUT_X, "With X"],
] as const;

/** Native case effects. */
export const caseEffects = [
  [SvxCaseMap.NotMapped, "(Without)"],
  [SvxCaseMap.Uppercase, "UPPERCASE"],
  [SvxCaseMap.Lowercase, "lowercase"],
  [SvxCaseMap.Capitalize, "Capitalize Every Word"],
  [SvxCaseMap.SmallCaps, "Small capitals"],
] as const;

/** Native character relief options. */
export const reliefs = [
  [FontRelief.NONE, "(Without)"],
  [FontRelief.Embossed, "Embossed"],
  [FontRelief.Engraved, "Engraved"],
] as const;

/** Paragraph alignment choices from the native alignment page. */
export const paragraphAdjustments = [
  [SvxAdjust.Left, "Left"],
  [SvxAdjust.ParaStart, "Start"],
  [SvxAdjust.Right, "Right"],
  [SvxAdjust.ParaEnd, "End"],
  [SvxAdjust.Center, "Centered"],
  [SvxAdjust.Block, "Justified"],
] as const;

/** Native text-to-text vertical alignment choices. */
export const paragraphVerticalAlignments = [
  [ParaVertAlign.Automatic, "Automatic"],
  [ParaVertAlign.Baseline, "Base line"],
  [ParaVertAlign.Top, "Top"],
  [ParaVertAlign.Center, "Center"],
  [ParaVertAlign.Bottom, "Bottom"],
] as const;

/** Original line-spacing combobox entries. */
export enum ParagraphLineSpaceMode {
  Single,
  Space115,
  Space150,
  Double,
  Proportional,
  Minimum,
  Leading,
  Fixed,
}

/** Maps the original line-spacing item to its active dialog mode and value. @param item - Original pooled format. @returns Selected mode and numeric member. */
export function readParagraphLineSpacing(
  item: SvxLineSpacingItem | undefined,
): { mode: ParagraphLineSpaceMode; value: number } | undefined {
  if (item === undefined) return undefined;
  switch (item.GetLineSpaceRule()) {
    case SvxLineSpaceRule.Fix:
      return { mode: ParagraphLineSpaceMode.Fixed, value: item.GetLineHeight() };
    case SvxLineSpaceRule.Min:
      return { mode: ParagraphLineSpaceMode.Minimum, value: item.GetLineHeight() };
  }
  if (item.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Fix)
    return { mode: ParagraphLineSpaceMode.Leading, value: item.GetInterLineSpace() };
  const value =
    item.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Off ? 100 : item.GetPropLineSpace();
  const preset = [100, 115, 150, 200].indexOf(value);
  return { mode: preset === -1 ? ParagraphLineSpaceMode.Proportional : preset, value };
}

/** Applies the source dialog's line-spacing mutations to a copy of the pooled item. @param base - Existing native item or pool default. @param mode - Selected menu row. @param value - Twips or percent depending on the mode. @returns Changed native item. */
export function setParagraphLineSpacing(
  base: SvxLineSpacingItem,
  mode: ParagraphLineSpaceMode,
  value: number,
): SvxLineSpacingItem {
  const result = base.Clone();
  switch (mode) {
    case ParagraphLineSpaceMode.Single:
      result.SetLineSpaceRule(SvxLineSpaceRule.Auto);
      result.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
      break;
    case ParagraphLineSpaceMode.Space115:
    case ParagraphLineSpaceMode.Space150:
    case ParagraphLineSpaceMode.Double:
    case ParagraphLineSpaceMode.Proportional:
      result.SetLineSpaceRule(SvxLineSpaceRule.Auto);
      result.SetPropLineSpace(
        mode === ParagraphLineSpaceMode.Proportional
          ? value
          : ([100, 115, 150, 200][mode] as number),
      );
      break;
    case ParagraphLineSpaceMode.Leading:
      result.SetLineSpaceRule(SvxLineSpaceRule.Auto);
      result.SetInterLineSpace(value);
      break;
    case ParagraphLineSpaceMode.Minimum:
    case ParagraphLineSpaceMode.Fixed:
      result.SetLineHeight(value);
      if (mode === ParagraphLineSpaceMode.Fixed) result.SetLineSpaceRule(SvxLineSpaceRule.Fix);
      result.SetInterLineSpaceRule(SvxInterLineSpaceRule.Off);
      break;
  }
  return result;
}

/** Reads the value used by the dialog's scalar input controls. @param item - Current criterion. @returns HTML input value. */
export function readSearchFormatValue(item: SfxPoolItem | undefined): string {
  if (item instanceof SvxAdjustItem) return String(item.GetAdjust());
  if (item instanceof SvxEmphasisMarkItem) return String(item.GetEmphasisMark());
  if (item instanceof SvxFirstLineIndentItem)
    return String(item.GetTextFirstLineOffset().ResolveFixedPart() / 20);
  if (item instanceof SvxTextLeftMarginItem)
    return String(item.GetTextLeft().ResolveFixedPart() / 20);
  if (item instanceof SvxRightMarginItem) return String(item.GetRight().ResolveFixedPart() / 20);
  if (item instanceof SvxParaVertAlignItem) return String(item.GetValue());
  if (
    item instanceof SvxForbiddenRuleItem ||
    item instanceof SvxHangingPunctuationItem ||
    item instanceof SvxScriptSpaceItem ||
    item instanceof SvxFormatSplitItem ||
    item instanceof SvxOrphansItem ||
    item instanceof SvxWidowsItem
  )
    return String(item.GetValue());
  if (item instanceof SvxFontItem) return item.GetFamilyName();
  if (item instanceof SvxLanguageItem) return String(item.GetLanguage());
  if (item instanceof SvxFontHeightItem) return String(item.GetHeight() / 20);
  if (item instanceof SvxKerningItem) return String(item.GetValue() / 20);
  if (item instanceof SvxUnderlineItem || item instanceof SvxOverlineItem)
    return String(item.GetLineStyle());
  const color =
    item instanceof SvxColorItem
      ? item.GetValue()
      : item instanceof SvxBrushItem
        ? item.GetColor()
        : undefined;
  if (color !== undefined)
    return color.IsFullyTransparent()
      ? "automatic"
      : `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
  if (
    item instanceof SvxWeightItem ||
    item instanceof SvxPostureItem ||
    item instanceof SvxCrossedOutItem ||
    item instanceof SvxCaseMapItem ||
    item instanceof SvxCharReliefItem ||
    item instanceof SvxCharScaleWidthItem ||
    item instanceof SvxWordLineModeItem ||
    item instanceof SvxContourItem ||
    item instanceof SvxShadowedItem ||
    item instanceof SvxAutoKernItem
  )
    return String(item.GetValue());
  return "";
}

/** Creates the concrete native item supplied by a changed scalar control. @param which - WhichId. @param value - HTML field value. @param old - Prior value for compound item fields. @returns Native output item. */
export function makeSearchFormatItem(
  which: number,
  value: string,
  old: SfxPoolItem | undefined,
): SfxPoolItem {
  switch (which) {
    case RES_PARATR_ADJUST: {
      const item =
        old instanceof SvxAdjustItem ? old.Clone() : new SvxAdjustItem(SvxAdjust.Left, which);
      item.SetAdjust(Number(value));
      return item;
    }
    case RES_PARATR_VERTALIGN:
      return new SvxParaVertAlignItem(Number(value), which);
    case RES_MARGIN_FIRSTLINE: {
      const item = new SvxFirstLineIndentItem(
        SvxIndentValue.twips(Math.round(Number(value) * 20)),
        which,
      );
      if (old instanceof SvxFirstLineIndentItem) item.SetAutoFirst(old.IsAutoFirst());
      return item;
    }
    case RES_MARGIN_TEXTLEFT:
      return new SvxTextLeftMarginItem(SvxIndentValue.twips(Math.round(Number(value) * 20)), which);
    case RES_MARGIN_RIGHT:
      return new SvxRightMarginItem(SvxIndentValue.twips(Math.round(Number(value) * 20)), which);
    case RES_PARATR_FORBIDDEN_RULES:
      return new SvxForbiddenRuleItem(value === "true", which);
    case RES_PARATR_HANGINGPUNCTUATION:
      return new SvxHangingPunctuationItem(value === "true", which);
    case RES_PARATR_SCRIPTSPACE:
      return new SvxScriptSpaceItem(value === "true", which);
    case RES_PARATR_SPLIT:
      return new SvxFormatSplitItem(value === "true", which);
    case RES_PARATR_ORPHANS:
      return new SvxOrphansItem(Number(value), which);
    case RES_PARATR_WIDOWS:
      return new SvxWidowsItem(Number(value), which);
    case RES_CHRATR_FONT:
    case RES_CHRATR_CJK_FONT:
    case RES_CHRATR_CTL_FONT: {
      const font = getBrowserFont(value);
      return new SvxFontItem(
        font.GetFamilyType(),
        font.GetFamilyName(),
        font.GetStyleName(),
        font.GetPitch(),
        font.GetCharSet(),
        which,
      );
    }
    case RES_CHRATR_LANGUAGE:
    case RES_CHRATR_CJK_LANGUAGE:
    case RES_CHRATR_CTL_LANGUAGE:
      return new SvxLanguageItem(Number(value), which);
    case RES_CHRATR_FONTSIZE:
    case RES_CHRATR_CJK_FONTSIZE:
    case RES_CHRATR_CTL_FONTSIZE:
      return new SvxFontHeightItem(Math.round(Number(value) * 20), 100, which);
    case RES_CHRATR_WEIGHT:
    case RES_CHRATR_CJK_WEIGHT:
    case RES_CHRATR_CTL_WEIGHT:
      return new SvxWeightItem(Number(value), which);
    case RES_CHRATR_POSTURE:
    case RES_CHRATR_CJK_POSTURE:
    case RES_CHRATR_CTL_POSTURE:
      return new SvxPostureItem(Number(value), which);
    case RES_CHRATR_COLOR:
      return new SvxColorItem(
        value === "automatic" ? COL_AUTO : new Color(Number.parseInt(value.slice(1), 16)),
        which,
      );
    case RES_CHRATR_BACKGROUND:
      return new SvxBrushItem(
        value === "automatic" ? COL_TRANSPARENT : new Color(Number.parseInt(value.slice(1), 16)),
        which,
      );
    case RES_CHRATR_UNDERLINE: {
      const item =
        old instanceof SvxUnderlineItem
          ? new SvxUnderlineItem(old)
          : new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, which);
      item.SetLineStyle(Number(value));
      return item;
    }
    case RES_CHRATR_OVERLINE: {
      const item =
        old instanceof SvxOverlineItem
          ? new SvxOverlineItem(old)
          : new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, which);
      item.SetLineStyle(Number(value));
      return item;
    }
    case RES_CHRATR_CROSSEDOUT:
      return new SvxCrossedOutItem(Number(value), which);
    case RES_CHRATR_CASEMAP:
      return new SvxCaseMapItem(Number(value), which);
    case RES_CHRATR_EMPHASIS_MARK:
      return new SvxEmphasisMarkItem(Number(value), which);
    case RES_CHRATR_RELIEF:
      return new SvxCharReliefItem(Number(value), which);
    case RES_CHRATR_CONTOUR:
      return new SvxContourItem(value === "true", which);
    case RES_CHRATR_SHADOWED:
      return new SvxShadowedItem(value === "true", which);
    case RES_CHRATR_WORDLINEMODE:
      return new SvxWordLineModeItem(value === "true", which);
    case RES_CHRATR_AUTOKERN:
      return new SvxAutoKernItem(value === "true", which);
    case RES_CHRATR_KERNING:
      return new SvxKerningItem(Math.round(Number(value) * 20), which);
    case RES_CHRATR_SCALEW:
      return new SvxCharScaleWidthItem(Number(value), which);
    default:
      throw new Error(`Unsupported Writer search format item ${which}`);
  }
}

/** Describes the complete native hyphenation value shown beside Find or Replace. @param item - Hyphenation criterion. @param text - Localization callback. @returns Item presentation. */
function describeHyphenation(
  item: SvxHyphenZoneItem,
  text: (key: string, fallback: string) => string,
): string {
  const value = item.QueryValue();
  const parts = [
    value.hyphen
      ? text("attribute-value.hyphenation.true", "Hyphenation")
      : text("attribute-value.hyphenation.false", "No hyphenation"),
  ];
  for (const [key, caption, count] of [
    ["lead", "%1 characters at end of line", value.minLead],
    ["trail", "%1 characters at beginning of line", value.minTrail],
    ["compound-lead", "%1 compound characters at end of line", value.compoundMinLead],
    ["compound-trail", "%1 compound characters at beginning of line", value.compoundMinTrail],
    ["max", "%1 hyphens", value.maxHyphens],
    ["min-word", "%1 characters in words", value.minWordLength],
  ] as const)
    parts.push(text("attribute-value.hyphenation." + key, caption).replaceAll("%1", String(count)));
  const zones = [
    ["zone", "Hyphenation zone", value.zone],
    ["paragraph-zone", "Paragraph end zone", value.paragraphEndZone],
    ["column-zone", "Column end zone", value.columnEndZone],
    ["page-zone", "Page end zone", value.pageEndZone],
    ["spread-zone", "Spread end zone", value.spreadEndZone],
  ] as const;
  if (
    zones.some(
      /** Checks whether to show the complete zone group. @param zone - Native zone. @returns Whether the zone is set. */
      ([, , amount]) => amount > 0,
    )
  )
    for (const [key, caption, amount] of zones)
      parts.push(text("attribute-value.hyphenation." + key, caption) + " " + amount / 20 + " pt");
  if (value.noCaps)
    parts.push(text("attribute-value.hyphenation.no-caps", "No hyphenation in CAPS"));
  if (value.noLastWord)
    parts.push(text("attribute-value.hyphenation.no-last-word", "No hyphenation of last word"));
  if (!value.keep) {
    parts.push(text("attribute-value.hyphenation.keep-auto", "Hyphenation across page"));
    return parts.join(", ");
  }
  const keepDescriptions = [
    "Hyphenation across page",
    "Avoid hyphenation across page when the next page is not visible to the reader at the same time",
    "Avoid hyphenation across page",
    "Avoid hyphenation across column and page",
    "Avoid hyphenation across last full paragraph line, column and page",
  ];
  const keep = keepDescriptions[value.keepType];
  if (keep) parts.push(text("attribute-value.hyphenation.keep." + value.keepType, keep));
  parts.push(
    value.keepLine
      ? text("attribute-value.hyphenation.keep-word", "by shifting the last hyphenated word")
      : text("attribute-value.hyphenation.move-line", "by shifting the last hyphenated line"),
  );
  return parts.join(", ");
}

/** Displays the native presentation of a concrete criterion. @param item - Search criterion. @param slot - Native slot. @param text - Localization callback. @returns Text for the summary. */
function describeSearchFormat(
  item: SfxPoolItem,
  slot: number,
  text: (key: string, fallback: string) => string,
): string | undefined {
  if (item instanceof SvxEmphasisMarkItem) {
    const mark = item.GetEmphasisMark();
    const style = mark & FontEmphasisMark.Style;
    const caption = ["none", "Dots", "Circle", "Filled circle", "Accent"][style];
    if (caption === undefined) return undefined;
    const description = text(`attribute-value.emphasis.${style}`, caption);
    if (mark & FontEmphasisMark.PosAbove)
      return `${description} ${text("attribute-value.emphasis.above", "Above")}`;
    if (mark & FontEmphasisMark.PosBelow)
      return `${description} ${text("attribute-value.emphasis.below", "Below")}`;
    return description;
  }
  if (item instanceof SvxTwoLinesItem) {
    if (!item.GetValue()) return text("attribute-value.two-lines.off", "Double-lined off");
    const start = item.GetStartBracket();
    const end = item.GetEndBracket();
    const caption = text("attribute-value.two-lines.on", "Double-lined");
    return `${start ? String.fromCharCode(start) : ""}${caption}${end ? String.fromCharCode(end) : ""}`;
  }
  if (item instanceof SvxAdjustItem)
    return describeChoice(paragraphAdjustments, item.GetAdjust(), "alignment", "Alignment", text);
  if (item instanceof SvxULSpaceItem)
    return `${text("attribute.paragraph-spacing", "Paragraph spacing")} ${item.GetUpper() / 20} / ${item.GetLower() / 20} pt`;
  if (item instanceof SvxParaVertAlignItem)
    return describeChoice(
      paragraphVerticalAlignments,
      item.GetValue(),
      "vertical-alignment",
      "Text-to-text",
      text,
    );
  if (item instanceof SvxLineSpacingItem) {
    const spacing = readParagraphLineSpacing(item);
    if (spacing === undefined) return undefined;
    const value =
      spacing.mode <= ParagraphLineSpaceMode.Proportional
        ? `${spacing.value}%`
        : `${spacing.value / 20} pt`;
    return `${text("attribute.line-spacing", "Line spacing")} ${value}`;
  }
  if (
    item instanceof SvxFirstLineIndentItem ||
    item instanceof SvxTextLeftMarginItem ||
    item instanceof SvxRightMarginItem
  ) {
    const key =
      item instanceof SvxFirstLineIndentItem
        ? "first-line"
        : item instanceof SvxTextLeftMarginItem
          ? "left-indent"
          : "right-indent";
    const name =
      item instanceof SvxFirstLineIndentItem
        ? "First line"
        : item instanceof SvxTextLeftMarginItem
          ? "Before text"
          : "After text";
    return `${text(`attribute.${key}`, name)} ${readSearchFormatValue(item)} pt`;
  }
  if (item instanceof SvxForbiddenRuleItem)
    return text(
      `attribute-value.forbidden-characters.${item.GetValue()}`,
      item.GetValue()
        ? "Apply list of forbidden characters to beginning and end of lines"
        : "Don't apply list of forbidden characters to beginning and end of lines",
    );
  if (item instanceof SvxHangingPunctuationItem)
    return text(
      `attribute-value.hanging-punctuation.${item.GetValue()}`,
      item.GetValue() ? "Hanging punctuation at line end" : "No hanging punctuation at line end",
    );
  if (item instanceof SvxScriptSpaceItem)
    return text(
      `attribute-value.script-space.${item.GetValue()}`,
      item.GetValue() ? "Automatic character spacing" : "No automatic character spacing",
    );
  if (item instanceof SvxFormatSplitItem)
    return item.GetValue()
      ? text("attribute-value.split.true", "Allow to split paragraph")
      : text("attribute-value.split.false", "Keep lines together");
  if (item instanceof SvxHyphenZoneItem) return describeHyphenation(item, text);
  if (item instanceof SvxOrphansItem || item instanceof SvxWidowsItem) {
    const name =
      item instanceof SvxOrphansItem
        ? text("attribute.orphans", "Orphans")
        : text("attribute.widows", "Widows");
    return `${name} ${item.GetValue()}`;
  }
  if (item instanceof SvxLanguageItem)
    return text(
      `format.language-value.${item.GetLanguage()}`,
      describeLanguage(item.GetLanguage()),
    );
  if (item instanceof SvxFontItem) return item.GetFamilyName();
  if (item instanceof SvxFontHeightItem) return `${item.GetHeight() / 20} pt`;
  if (item instanceof SvxWeightItem) {
    const weight = item.GetWeight();
    const name = fontWeights
      .find(
        /** Selects the stored weight. @param entry - Font weight. @returns Whether it matches. */ ([
          value,
        ]) => value === weight,
      )?.[1]
      .toLowerCase();
    return name && text(`attribute-value.weight.${weight}`, name);
  }
  if (item instanceof SvxPostureItem) {
    const posture = item.GetPosture();
    const name = postures
      .find(
        /** Selects the stored posture. @param entry - Font posture. @returns Whether it matches. */ ([
          value,
        ]) => value === posture,
      )?.[1]
      .toLowerCase();
    return name && text(`attribute-value.posture.${posture}`, name);
  }
  if (item instanceof SvxUnderlineItem || item instanceof SvxOverlineItem) {
    const style = item.GetLineStyle();
    const name = underlines.find(
      /** Selects the stored underlining. @param entry - Line choice. @returns Whether it matches. */ ([
        value,
      ]) => value === style,
    )?.[1];
    if (name === undefined) return undefined;
    const line = item instanceof SvxUnderlineItem ? "underline" : "overline";
    const fallback = style === FontLineStyle.LINESTYLE_NONE ? `No ${line}` : `${name} ${line}`;
    const description = text(`attribute-value.${line}.${style}`, fallback);
    const color = item.GetColor();
    return color.IsTransparent()
      ? description
      : `${description}, #${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0").toUpperCase()}`;
  }
  if (item instanceof SvxCharRotateItem)
    return text("attribute.rotation", "Rotation") + ` ${item.GetValue() / 10}°`;
  if (item instanceof SvxEscapementItem) {
    const offset = item.GetEsc();
    return offset > 0
      ? text("attribute-value.superscript", "Superscript")
      : offset < 0
        ? text("attribute-value.subscript", "Subscript")
        : text("attribute-value.normal-position", "Normal position");
  }
  if (item instanceof SvxCrossedOutItem)
    return describeChoice(strikeouts, item.GetStrikeout(), "strikeout", "Strikethrough", text);
  if (item instanceof SvxCaseMapItem)
    return describeChoice(caseEffects, item.GetCaseMap(), "case", "Effects", text);
  if (item instanceof SvxCharReliefItem)
    return describeChoice(reliefs, item.GetValue(), "relief", "Relief", text);
  if (item instanceof SvxColorItem || item instanceof SvxBrushItem) {
    const value = readSearchFormatValue(item);
    return value === "automatic"
      ? item instanceof SvxColorItem
        ? text("attribute-value.automatic-color", "Automatic font color")
        : text("attribute-value.no-fill", "No fill")
      : value.toUpperCase();
  }
  if (item instanceof SvxCharScaleWidthItem)
    return text("attribute.scale", "Scaling") + ` ${item.GetValue()}%`;
  if (item instanceof SvxKerningItem)
    return text("attribute.spacing", "Character spacing") + ` ${item.GetValue() / 20} pt`;
  if (
    item instanceof SvxContourItem ||
    item instanceof SvxShadowedItem ||
    item instanceof SvxWordLineModeItem ||
    item instanceof SvxAutoKernItem
  ) {
    const label = GetAttributeName(slot);
    if (label === undefined) return undefined;
    return text(
      `attribute-value.slot.${slot}.${item.GetValue()}`,
      `${label} ${item.GetValue() ? "on" : "off"}`,
    );
  }
  return undefined;
}

/** Formats a native choice with its attribute name. @param choices - Visible options. @param value - Native value. @param key - Label id. @param fallback - Attribute label. @param text - Localization callback. @returns Summary. */
function describeChoice(
  choices: readonly (readonly [number, string])[],
  value: number,
  key: string,
  fallback: string,
  text: (key: string, fallback: string) => string,
): string | undefined {
  const choice = choices.find(
    /** Locates the selected native value. @param option - One choice. @returns Whether it matches. */ ([
      id,
    ]) => id === value,
  );
  return (
    choice &&
    `${text(`attribute.${key}`, fallback)} ${text(`attribute-value.${key}.${value}`, choice[1])}`
  );
}

/** Renders the active search formatting beneath the associated entry. @param list - Active search list. @param text - Localization callback. @returns Localized formatting names. */
export function describeSearchAttributes(
  list: SearchAttrItemList | undefined,
  text: (key: string, fallback: string) => string,
): string {
  return (
    list
      ?.GetEntries()
      .flatMap(
        /** Looks up one native slot's localized label. @param entry - Active criterion. @returns Recognized labels. */ (
          entry,
        ) => {
          const label = GetAttributeName(entry.slot);
          const value =
            entry.item === undefined
              ? label && text(`attribute.slot.${entry.slot}`, label)
              : describeSearchFormat(entry.item, entry.slot, text);
          return value ? [value] : [];
        },
      )
      .join(", ") ?? ""
  );
}

/** Native document Which identities for the three character-dialog script groups. */
export const fontGroups = [
  {
    script: LATIN,
    family: RES_CHRATR_FONT,
    size: RES_CHRATR_FONTSIZE,
    weight: RES_CHRATR_WEIGHT,
    posture: RES_CHRATR_POSTURE,
    language: RES_CHRATR_LANGUAGE,
  },
  {
    script: ASIAN,
    family: RES_CHRATR_CJK_FONT,
    size: RES_CHRATR_CJK_FONTSIZE,
    weight: RES_CHRATR_CJK_WEIGHT,
    posture: RES_CHRATR_CJK_POSTURE,
    language: RES_CHRATR_CJK_LANGUAGE,
  },
  {
    script: COMPLEX,
    family: RES_CHRATR_CTL_FONT,
    size: RES_CHRATR_CTL_FONTSIZE,
    weight: RES_CHRATR_CTL_WEIGHT,
    posture: RES_CHRATR_CTL_POSTURE,
    language: RES_CHRATR_CTL_LANGUAGE,
  },
] as const;

/** Character Which identities belonging to the native Font tab. */
export const fontPageItems = fontGroups.flatMap(
  /** Projects one script group's items. @param group - Native Which bindings. @returns Which IDs. */
  ({ family, size, weight, posture, language }) => [family, size, weight, posture, language],
);

/** Native Asian Typography checkboxes in their resource order. */
export const asianTypographyOptions = [
  [
    RES_PARATR_FORBIDDEN_RULES,
    "forbidden-characters",
    "Apply list of forbidden characters to the beginning and end of lines",
  ],
  [RES_PARATR_HANGINGPUNCTUATION, "hanging-punctuation", "Allow hanging punctuation"],
  [RES_PARATR_SCRIPTSPACE, "script-space", "Apply spacing between Asian and non-Asian text"],
] as const;

/** Search formatting pages in the pinned dialog order with native Reset ranges. */
export const formatPages = {
  font: ["Font", fontPageItems],
  effects: [
    "Font Effects",
    [
      RES_CHRATR_COLOR,
      RES_CHRATR_UNDERLINE,
      RES_CHRATR_OVERLINE,
      RES_CHRATR_CROSSEDOUT,
      RES_CHRATR_CASEMAP,
      RES_CHRATR_RELIEF,
      RES_CHRATR_EMPHASIS_MARK,
      RES_CHRATR_CONTOUR,
      RES_CHRATR_SHADOWED,
      RES_CHRATR_WORDLINEMODE,
    ],
  ],
  position: [
    "Position",
    [
      RES_CHRATR_ESCAPEMENT,
      RES_CHRATR_ROTATE,
      RES_CHRATR_SCALEW,
      RES_CHRATR_KERNING,
      RES_CHRATR_AUTOKERN,
    ],
  ],
  asianlayout: ["Asian Layout", [RES_CHRATR_TWO_LINES]],
  indents: [
    "Indents & Spacing",
    [
      RES_MARGIN_TEXTLEFT,
      RES_MARGIN_RIGHT,
      RES_MARGIN_FIRSTLINE,
      RES_UL_SPACE,
      RES_PARATR_LINESPACING,
    ],
  ],
  alignment: ["Alignment", [RES_PARATR_ADJUST, RES_PARATR_VERTALIGN]],
  textflow: [
    "Text Flow",
    [RES_PARATR_HYPHENZONE, RES_PARATR_SPLIT, RES_PARATR_ORPHANS, RES_PARATR_WIDOWS],
  ],
  asiantypo: [
    "Asian Typography",
    asianTypographyOptions.map(
      /** Identifies the native criteria reset with the Asian Typography page. @param option - Checkbox binding. @returns WhichId. */
      ([which]) => which,
    ),
  ],
  highlighting: ["Highlighting", [RES_CHRATR_BACKGROUND]],
} as const;
