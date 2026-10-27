/** @fileoverview Consumed native paragraph fill value projection for Writer XML export. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import { XFillColorItem } from "../../../../svx/inc/xflclit";
import { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import {
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
} from "../../../../svx/inc/xdef";
import type { OdfFillProperties } from "../../../../xmloff/source/draw/fill-properties";
/** Native registered fill fields; the Writer paragraph map has no slide-background property. */
export const XML_FILL_WHICH_IDS = [
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
  XATTR_FILLUSESLIDEBACKGROUND,
] as const;
/** Reads only actual direct items, preserving parent inheritance in ODF styles. @param set - Actual source item set. @returns Direct native fill fields. */
export function getFillProperties(set: SfxItemSet | undefined): OdfFillProperties {
  if (set === undefined) return {};
  const style = set.GetItemIfSet(XATTR_FILLSTYLE, false),
    color = set.GetItemIfSet(XATTR_FILLCOLOR, false),
    transparency = set.GetItemIfSet(XATTR_FILLTRANSPARENCE, false);
  if (
    (style !== undefined && !(style instanceof XFillStyleItem)) ||
    (color !== undefined && !(color instanceof XFillColorItem)) ||
    (transparency !== undefined && !(transparency instanceof XFillTransparenceItem))
  )
    throw new Error("ODT paragraph fill item is invalid.");
  return {
    ...(style instanceof XFillStyleItem ? { fillStyle: style.GetValue() } : {}),
    ...(color instanceof XFillColorItem
      ? { fillColor: color.GetColorValue().GetRGBColor().toUInt32() }
      : {}),
    ...(transparency instanceof XFillTransparenceItem
      ? { fillTransparency: transparency.GetValue() }
      : {}),
  };
}
