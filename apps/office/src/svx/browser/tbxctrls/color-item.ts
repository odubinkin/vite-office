/** @fileoverview Native color-item creation at the shared palette browser boundary. */
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { Color, COL_AUTO, COL_TRANSPARENT } from "../../../tools/inc/color";
/** Converts offered browser RGB/default input to an actual source toolbox item. @param value - Palette choice. @param slotId - Native slot. @returns Complete color item. */
export function createBrowserColorItem(value: string, slotId: number): SvxColorItem {
  if (value === "auto" || value === "transparent")
    return new SvxColorItem(value === "auto" ? COL_AUTO : COL_TRANSPARENT, slotId);
  if (!/^#[0-9a-f]{6}$/i.test(value))
    throw new TypeError("Color palette requires RGB24 or a native default sentinel");
  return new SvxColorItem(new Color(Number.parseInt(value.slice(1), 16)), slotId);
}
