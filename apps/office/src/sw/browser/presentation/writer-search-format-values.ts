/** @fileoverview Shared browser presentation of native search formatting choices and summaries. */
import { SvxFontItem } from "../../../editeng/source/items/textitem.font";
import {
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import { FontItalic, FontLineStyle, FontWeight } from "../../../tools/inc/fontenum";
import {
  RES_CHRATR_BACKGROUND,
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
export const underlines = [
  [FontLineStyle.LINESTYLE_NONE, "None"],
  [FontLineStyle.LINESTYLE_SINGLE, "Single"],
  [FontLineStyle.LINESTYLE_DOUBLE, "Double"],
  [FontLineStyle.LINESTYLE_DOTTED, "Dotted"],
  [FontLineStyle.LINESTYLE_DASH, "Dash"],
  [FontLineStyle.LINESTYLE_WAVE, "Wave"],
] as const;

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
  if (item instanceof SvxUnderlineItem) {
    const style = item.GetLineStyle();
    const name = underlines.find(
      /** Selects the stored underlining. @param entry - Line choice. @returns Whether it matches. */ ([
        value,
      ]) => value === style,
    )?.[1];
    if (name === undefined) return undefined;
    const fallback = style === FontLineStyle.LINESTYLE_NONE ? "No underline" : `${name} underline`;
    return text(`attribute-value.underline.${style}`, fallback);
  }
  return undefined;
}

export const searchAttributes: ReadonlyArray<readonly [which: number, key: string, label: string]> =
  [
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
