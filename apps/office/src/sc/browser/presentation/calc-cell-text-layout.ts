/** @fileoverview Browser writing modes and transforms for native Calc cell text output. */
import type { CSSProperties } from "react";
import { SvxCellOrientation } from "../../../editeng/inc/svxenum";
import { SvxRotateMode } from "../../../svx/inc/rotmodit";
import type { ScCellTextLayout } from "../../source/ui/view/output2";

const rotationOrigins = {
  [SvxRotateMode.SVX_ROTATE_MODE_STANDARD]: "50% 50%",
  [SvxRotateMode.SVX_ROTATE_MODE_TOP]: "50% 0%",
  [SvxRotateMode.SVX_ROTATE_MODE_CENTER]: "50% 50%",
  [SvxRotateMode.SVX_ROTATE_MODE_BOTTOM]: "50% 100%",
} as const;

/** Projects the effective native output mode onto the text box, independently of the sheet cell decorations. @param layout - Source cell text layout decisions. @param horizontal - Effective grid text alignment. @returns CSS text layout. */
export function calcCellTextLayoutStyle(
  layout: ScCellTextLayout,
  horizontal: CSSProperties["textAlign"],
): CSSProperties {
  const style: CSSProperties = {
    whiteSpace: layout.lineBreak ? "pre-wrap" : "pre",
    overflowWrap: layout.lineBreak ? "anywhere" : undefined,
    hyphens: layout.hyphenate ? "auto" : undefined,
  };
  if (layout.orientation !== SvxCellOrientation.Standard) {
    const stacked = layout.orientation === SvxCellOrientation.Stacked;
    const alignSelf = horizontal === "center" ? "center" : horizontal === "right" ? "end" : "start";
    return {
      ...style,
      width: "max-content",
      maxWidth: "100%",
      maxHeight: "100%",
      alignSelf,
      writingMode: stacked && !layout.asianVertical ? "vertical-lr" : "vertical-rl",
      textOrientation: stacked ? (layout.asianVertical ? "mixed" : "upright") : "sideways",
      transform: layout.orientation === SvxCellOrientation.BottomUp ? "rotate(180deg)" : undefined,
    };
  }
  if (layout.rotation !== 0) {
    style.transform = `rotate(${-layout.rotation / 100}deg)`;
    style.transformOrigin = rotationOrigins[layout.reference];
  }
  return style;
}
