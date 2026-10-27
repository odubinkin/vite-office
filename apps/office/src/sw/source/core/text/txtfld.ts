/** @fileoverview Resolves represented NewNumberPortion font values from original paragraph and numbering owners. */
import { writerTextColorValue } from "../attr/swatrset";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import { RES_CHRATR_ESCAPEMENT } from "../../../inc/hintids";

import { FontStrikeout, FontItalic, FontWeight } from "../../../../tools/inc/fontenum";
import {
  FontLineStyle,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { RES_CHRATR_CROSSEDOUT } from "../../../inc/hintids";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_COLOR,
} from "../../../inc/hintids";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwNumRule } from "../doc/number";
import { getFontFamilyGeneric } from "../../../../xmloff/source/style/fonthdl";
/** Immutable represented Latin font values for a numbering paint device, not a replacement SwFont owner. */
export interface SwNumberPortionFont {
  readonly familyName: string;
  readonly genericFamily?: string;
  readonly heightTwips: number;
  readonly weight: FontWeight;
  readonly posture: FontItalic;
  readonly underline: FontLineStyle;
  readonly strikeout?: FontStrikeout;
  readonly escapement?: Readonly<{ offset: number; height: number }>;
  readonly color: string;
}

/** Resolves the represented font-construction branch of SwTextFormatter::NewNumberPortion; paragraph-mark and redline overlays remain unrepresented. @param node - Original paragraph-property owner. @returns Immutable font values for a text number/bullet portion. */
export function resolveSwNumberPortionFont(
  node: SwTextNode,
): Readonly<SwNumberPortionFont> | undefined {
  // The represented IsNumbered query already includes IsCountedInList.
  if (!node.IsNumbered()) return undefined;
  const level = Math.max(0, Math.min(9, node.GetActualListLevel()));
  const format = (node.GetNumRule() as SwNumRule).Get(level);
  if (format.GetNumberingType() === SvxNumType.SVX_NUM_BITMAP) return undefined;
  const bullet = format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL;
  const reset = !node
    .GetDoc()
    .GetDocumentSettingManager()
    .get("DO_NOT_RESET_PARA_ATTRS_FOR_NUM_FONT");
  const style = format.GetCharFormat()?.GetAttrSet();
  const font = (style?.GetItemIfSet(RES_CHRATR_FONT) ??
    node.GetAttr(RES_CHRATR_FONT)) as SvxFontItem;
  /** Native SetDiffFnt overlays explicit character-style items after paragraph resets. @param which - Native WhichId. @param resetItem - Optional reset value. @returns Effective item. */
  const effective =
    /** Evaluates the txtfld callback. @param which - which value. @param resetItem - resetItem value. @returns Callback result. */ (
      which: number,
      resetItem?: ReturnType<SwTextNode["GetAttr"]>,
    ) => style?.GetItemIfSet(which) ?? resetItem ?? node.GetAttr(which);
  const bulletFont = bullet ? format.GetBulletFont() : undefined;
  const generic = bulletFont === undefined ? getFontFamilyGeneric(font.GetFamily()) : undefined;
  return Object.freeze({
    familyName: bulletFont === undefined ? font.GetFamilyName() : bulletFont.GetFamilyName(),
    ...(generic === undefined ? {} : { genericFamily: generic }),
    heightTwips: (effective(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight(),
    weight: (
      effective(
        RES_CHRATR_WEIGHT,
        bullet && reset
          ? new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT)
          : undefined,
      ) as SvxWeightItem
    ).GetWeight(),
    posture: (
      effective(
        RES_CHRATR_POSTURE,
        bullet && reset
          ? new SvxPostureItem(FontItalic.ITALIC_NONE, RES_CHRATR_POSTURE)
          : undefined,
      ) as SvxPostureItem
    ).GetPosture(),
    underline: (
      effective(
        RES_CHRATR_UNDERLINE,
        reset
          ? new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, RES_CHRATR_UNDERLINE)
          : undefined,
      ) as SvxUnderlineItem
    ).GetLineStyle(),
    ...((effective(RES_CHRATR_CROSSEDOUT) as SvxCrossedOutItem).GetBoolValue()
      ? { strikeout: (effective(RES_CHRATR_CROSSEDOUT) as SvxCrossedOutItem).GetStrikeout() }
      : {}),
    ...((effective(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).GetEsc() !== 0
      ? {
          escapement: Object.freeze({
            offset: (effective(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).GetEsc(),
            height: (effective(RES_CHRATR_ESCAPEMENT) as SvxEscapementItem).GetProportionalHeight(),
          }),
        }
      : {}),
    color: writerTextColorValue(effective(RES_CHRATR_COLOR) as SvxColorItem),
  });
}
