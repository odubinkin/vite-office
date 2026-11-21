/** @fileoverview Shared browser presentation of native search formatting choices and summaries. */
import { SvxCaseMap } from "../../../editeng/inc/svxenum";
import { SvxCaseMapItem } from "../../../editeng/source/items/textitem.modes";
import { SvxCrossedOutItem } from "../../../editeng/source/items/textitem.effects";
import { SvxEscapementItem } from "../../../editeng/source/items/textitem.escapement";
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
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import { FontItalic, FontLineStyle, FontStrikeout, FontWeight } from "../../../tools/inc/fontenum";
import {
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_CASEMAP,
  RES_CHRATR_CONTOUR,
  RES_CHRATR_RELIEF,
  RES_CHRATR_ROTATE,
  RES_CHRATR_SCALEW,
  RES_CHRATR_SHADOWED,
  RES_CHRATR_WORDLINEMODE,
  RES_CHRATR_COLOR,
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_KERNING,
  RES_CHRATR_OVERLINE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
} from "../../inc/hintids";

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

/** Reads the value used by the dialog's scalar input controls. @param item - Current criterion. @returns HTML input value. */
export function readSearchFormatValue(item: SfxPoolItem | undefined): string {
  if (item instanceof SvxFontItem) return item.GetFamilyName();
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
    case RES_CHRATR_FONT: {
      const item = new SvxFontItem(which);
      item.SetFamilyName(value);
      return item;
    }
    case RES_CHRATR_FONTSIZE:
      return new SvxFontHeightItem(Math.round(Number(value) * 20), 100, which);
    case RES_CHRATR_WEIGHT:
      return new SvxWeightItem(Number(value), which);
    case RES_CHRATR_POSTURE:
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

/** Displays the native presentation of a concrete criterion. @param item - Search criterion. @param text - Localization callback. @returns Text for the summary. */
function describeSearchFormat(
  item: SfxPoolItem,
  text: (key: string, fallback: string) => string,
): string | undefined {
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
    const label = searchAttributes.find(
      /** Finds the displayed name of this boolean item. @param choice - Attribute choice. @returns Whether the family matches. */ ([
        which,
      ]) => which === item.Which(),
    );
    if (label === undefined) return undefined;
    return text(
      `attribute-value.${label[1]}.${item.GetValue()}`,
      `${label[2]} ${item.GetValue() ? "on" : "off"}`,
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

export const searchAttributes: ReadonlyArray<readonly [which: number, key: string, label: string]> =
  [
    [RES_CHRATR_CASEMAP, "case", "Effects"],
    [RES_CHRATR_CONTOUR, "outline", "Outline"],
    [RES_CHRATR_RELIEF, "relief", "Relief"],
    [RES_CHRATR_ROTATE, "rotation", "Rotation"],
    [RES_CHRATR_SCALEW, "scale", "Scaling"],
    [RES_CHRATR_SHADOWED, "shadow", "Shadow"],
    [RES_CHRATR_WORDLINEMODE, "word-line", "Individual words"],
    [RES_CHRATR_AUTOKERN, "pair-kerning", "Pair kerning"],
    [RES_CHRATR_BACKGROUND, "background", "Character background"],
    [RES_CHRATR_COLOR, "color", "Font color"],
    [RES_CHRATR_ESCAPEMENT, "position", "Position"],
    [RES_CHRATR_FONT, "font", "Font"],
    [RES_CHRATR_FONTSIZE, "size", "Font size"],
    [RES_CHRATR_KERNING, "spacing", "Character spacing"],
    [RES_CHRATR_OVERLINE, "overline", "Overlining"],
    [RES_CHRATR_POSTURE, "posture", "Font posture"],
    [RES_CHRATR_CROSSEDOUT, "strikeout", "Strikethrough"],
    [RES_CHRATR_UNDERLINE, "underline", "Underlining"],
    [RES_CHRATR_WEIGHT, "weight", "Font weight"],
  ];

/** Renders the active search formatting beneath the associated entry. @param pool - Writer attribute pool. @param list - Active search list. @param text - Localization callback. @returns Localized formatting names. */
export function describeSearchAttributes(
  pool: SfxItemPool,
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
          const which = pool.GetWhichIDFromSlotID(entry.slot);
          const label = searchAttributes.find(
            /** Matches by the pool's native identity. @param attribute - Supported attribute. @returns Whether it is selected. */ ([
              id,
            ]) => id === which,
          );
          if (label === undefined) return [];
          const value =
            entry.item === undefined
              ? text(`attribute.${label[1]}`, label[2])
              : describeSearchFormat(entry.item, text);
          return value ? [value] : [];
        },
      )
      .join(", ") ?? ""
  );
}
