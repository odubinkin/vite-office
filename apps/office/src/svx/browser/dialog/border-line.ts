/** @fileoverview Shared browser paint projection of actual EditEngine border lines and resolved SVX frame-link styles, reused by Writer and Calc. */
import type { SvxBorderLine } from "../../../editeng/source/items/borderline";
import { Style } from "../../source/dialog/framelink";

/** Projects one native line to the browser paint device. @param line - Owned native line. @param fixedGuide - Paint a guide inside an isolated fixed-row wrapper. @returns CSS paint value. */
export function browserBorderLine(
  line: SvxBorderLine | Style | undefined,
  fixedGuide: boolean,
): string {
  if (line === undefined || (line instanceof Style ? line.GetWidth() === 0 : line.isEmpty()))
    return fixedGuide ? "1px dashed #cbd5e1" : "none";
  const style = line instanceof Style ? line.Type() : line.GetBorderLineStyle();
  const cssStyle =
    style === 1
      ? "dotted"
      : [2, 14, 16, 17].includes(style)
        ? "dashed"
        : (style >= 3 && style <= 9) || style === 15
          ? "double"
          : style === 10
            ? "ridge"
            : style === 11
              ? "groove"
              : style === 12
                ? "outset"
                : style === 13
                  ? "inset"
                  : "solid";
  const width = line instanceof Style ? line.GetWidth() : line.GetScaledWidth();
  const color = line instanceof Style ? line.GetColorPrim() : line.GetColor();
  return `${width / 20}pt ${cssStyle} #${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}
