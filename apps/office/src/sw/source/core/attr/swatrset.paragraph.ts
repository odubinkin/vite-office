/** @fileoverview Browser snapshot factories for actual native split and line-count paragraph items. Separates transport reconstruction from the size-bounded SwAttrPool registration owner. */
import { COL_AUTO, COL_TRANSPARENT, Color, ColorTransparency } from "../../../../tools/inc/color";
import {
  SvxFormatSplitItem,
  SvxOrphansItem,
  SvxWidowsItem,
} from "../../../../editeng/source/items/paraitem.controls";
import { SfxBoolItem } from "../../../../svl/inc/eitem";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { RES_PARATR_SPLIT, RES_PARATR_ORPHANS, RES_PARATR_WIDOWS } from "../../../inc/hintids";
/** Restores the registered split/orphan/widow/keep/line-number scalar domain using its real item constructors. @param which - One registered control identity. @param value - Persisted scalar. @returns Actual native item. */
export function restoreParagraphControlItem(which: number, value: unknown): SfxPoolItem {
  if (which === RES_PARATR_ORPHANS) return new SvxOrphansItem(Number(value), which);
  if (which === RES_PARATR_WIDOWS) return new SvxWidowsItem(Number(value), which);
  if (which === RES_PARATR_SPLIT) return new SvxFormatSplitItem(Boolean(value), which);
  return new SfxBoolItem(which, Boolean(value));
}

/** Decodes the existing Writer request and worker color forms to one native value. @param value - Primitive boundary value. @param automatic - Applicable automatic marker. @returns Full native color. */
export function writerColorFromPrimitive(value: unknown, automatic: "auto" | "transparent"): Color {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff)
    return new Color(ColorTransparency, value, "ColorTransparencyTag");
  if (value === automatic) return new Color(automatic === "auto" ? COL_AUTO : COL_TRANSPARENT);
  if (typeof value === "string" && /^#[0-9a-f]{6}$/iu.test(value))
    return new Color(Number.parseInt(value.slice(1), 16));
  if (typeof value === "string") {
    const rgba = /^rgba\((\d{1,3}), (\d{1,3}), (\d{1,3}), (\d*\.?\d+)\)$/u.exec(value);
    if (rgba !== null) {
      const red = Number(rgba[1]),
        green = Number(rgba[2]),
        blue = Number(rgba[3]);
      const alpha = Number(rgba[4]);
      if (
        [red, green, blue].every(
          /** Computes the channel result. @param channel - Channel. @returns The computed result. */ (
            channel,
          ) => Number.isInteger(channel) && channel <= 255,
        ) &&
        alpha >= 0 &&
        alpha <= 1
      ) {
        const color = new Color(red, green, blue);
        color.SetAlpha(Math.round(alpha * 255));
        return color;
      }
    }
  }
  throw new Error(`Writer ${automatic === "auto" ? "text" : "highlight"} color value is invalid.`);
}
