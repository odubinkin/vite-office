/** @fileoverview Browser projection of the original Writer page border and directional frame shadows. */
import type { CSSProperties } from "react";
import { SvxShadowLocation } from "../../../editeng/inc/svxenum";
import { COL_AUTO, type Color } from "../../../tools/inc/color";
import type { SvxShadowItem } from "../../../editeng/source/items/frmitems.shadow";
import { RES_SHADOW } from "../../inc/hintids";
import type { SwDoc } from "../../source/core/doc/doc";
import { getPageFrameMargins, getPageFrameShadowSpace } from "../../source/core/layout/atrfrm";
import { ResolvePageFrameFormat } from "../../source/core/layout/hffrm";
import type { SwPageFrame } from "../../source/core/layout/newfrm";
import { exportBorderShorthand } from "../../source/filter/xml/xmlexpit";

/** Converts an original grid color for the browser paint device. @param color - Native grid color. @returns CSS hexadecimal color. */
export function writerTextGridColor(color: Readonly<Color>): string {
  return color.equals(COL_AUTO)
    ? "#000000"
    : `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Formats the physical shadow without changing native positioning or size. @param shadow - Shadow item. @returns CSS shadow or no shadow. */
export function writerFrameShadow(shadow: SvxShadowItem): string | undefined {
  const location = shadow.GetLocation();
  if (location === SvxShadowLocation.NONE) return undefined;
  const size = shadow.GetWidth() / 20;
  const x =
    location === SvxShadowLocation.TopLeft || location === SvxShadowLocation.BottomLeft
      ? -size
      : size;
  const y =
    location === SvxShadowLocation.TopLeft || location === SvxShadowLocation.TopRight
      ? -size
      : size;
  const color = shadow.GetColor();
  return `${x}pt ${y}pt rgba(${color.GetRed()}, ${color.GetGreen()}, ${color.GetBlue()}, ${color.GetAlpha() / 255})`;
}

/** Projects the outline of the actual physical page's frame, inside its paper margin. @param document - Document with native page descriptors. @param page - Physical page being painted. @param previous - Previous physical page. @returns CSS for the border and its shadow. */
export function writerPageBorderStyle(
  document: SwDoc,
  page: SwPageFrame,
  previous?: SwPageFrame,
): CSSProperties | undefined {
  const style = document.FindPageDesc(page.descriptor.name);
  if (!style) return undefined;
  const frame = ResolvePageFrameFormat(style, page, previous);
  const box = frame.GetBox();
  const boxShadow = writerFrameShadow(frame.GetAttrSet().Get(RES_SHADOW) as SvxShadowItem);
  const top = exportBorderShorthand(box.GetTop());
  const bottom = exportBorderShorthand(box.GetBottom());
  const left = exportBorderShorthand(box.GetLeft());
  const right = exportBorderShorthand(box.GetRight());
  if (
    top === "none" &&
    bottom === "none" &&
    left === "none" &&
    right === "none" &&
    boxShadow === undefined
  )
    return undefined;
  const margins = getPageFrameMargins(frame);
  const shadow = getPageFrameShadowSpace(frame);
  return {
    top: (margins.top + shadow.top) / 15,
    bottom: (margins.bottom + shadow.bottom) / 15,
    left: (margins.left + shadow.left) / 15,
    right: (margins.right + shadow.right) / 15,
    borderTop: top,
    borderBottom: bottom,
    borderLeft: left,
    borderRight: right,
    boxShadow,
  };
}
