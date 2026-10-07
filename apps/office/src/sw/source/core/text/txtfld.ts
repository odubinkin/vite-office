/** @fileoverview Resolves represented NewNumberPortion font values from original paragraph and numbering owners. */
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import type { SfxStringItem } from "../../../../svl/source/items/stritem";
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

/** Immutable represented Latin font values for a numbering paint device, not a replacement SwFont owner. */
export interface SwNumberPortionFont {
  readonly familyName: string;
  readonly genericFamily?: string;
  readonly heightTwips: number;
  readonly weight: FontWeight;
  readonly posture: FontItalic;
  readonly underline: FontLineStyle;
  readonly color: string;
}

/** Resolves the represented font-construction branch of SwTextFormatter::NewNumberPortion; character style, paragraph-mark and redline overlays remain unrepresented. @param node - Original paragraph-property owner. @returns Immutable font values for a text number/bullet portion. */
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
  const font = node.GetAttr(RES_CHRATR_FONT) as SvxFontItem;
  const bulletFont = bullet ? format.GetBulletFont() : undefined;
  const generic = bulletFont === undefined ? font.GetGenericFamily() : undefined;
  return Object.freeze({
    familyName:
      bulletFont === undefined ? font.GetResolvedFamilyName() : bulletFont.GetFamilyName(),
    ...(generic === undefined ? {} : { genericFamily: generic }),
    heightTwips: (node.GetAttr(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight(),
    weight:
      bullet && reset
        ? FontWeight.NORMAL
        : (node.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight(),
    posture:
      bullet && reset
        ? FontItalic.NONE
        : (node.GetAttr(RES_CHRATR_POSTURE) as SvxPostureItem).GetPosture(),
    underline: reset
      ? FontLineStyle.NONE
      : (node.GetAttr(RES_CHRATR_UNDERLINE) as SvxUnderlineItem).GetLineStyle(),
    color: (node.GetAttr(RES_CHRATR_COLOR) as SfxStringItem).GetValue(),
  });
}
