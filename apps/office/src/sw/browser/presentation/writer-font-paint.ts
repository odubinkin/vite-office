/** @fileoverview Shared browser paint for native Writer font decorations and special text effects. */
import type { CSSProperties } from "react";
import { FontLineStyle } from "../../../editeng/source/items/textitem";
import { FontEmphasisMark } from "../../../tools/inc/fontenum";
import { FontRelief } from "../../../vcl/inc/fntstyle";
import { COL_BLACK, COL_WHITE } from "../../../tools/inc/color";
import { writerColorFromPrimitive } from "../../source/core/attr/swatrset";
import type { WriterFontPaint } from "../../source/core/txtnode/txatbase";
import type { WriterTextLineProjection } from "./writer-view-projection";

/** Maps native visible line variants to CSS decoration families. @param style - Native decoration style. @returns Browser decoration style. */
function browserTextLineStyle(
  style: FontLineStyle,
): "solid" | "double" | "dotted" | "dashed" | "wavy" {
  switch (style) {
    case FontLineStyle.LINESTYLE_DOUBLE:
      return "double";
    case FontLineStyle.LINESTYLE_DOTTED:
    case FontLineStyle.LINESTYLE_BOLDDOTTED:
      return "dotted";
    case FontLineStyle.LINESTYLE_DASH:
    case FontLineStyle.LINESTYLE_LONGDASH:
    case FontLineStyle.LINESTYLE_DASHDOT:
    case FontLineStyle.LINESTYLE_DASHDOTDOT:
    case FontLineStyle.LINESTYLE_BOLDDASH:
    case FontLineStyle.LINESTYLE_BOLDLONGDASH:
    case FontLineStyle.LINESTYLE_BOLDDASHDOT:
    case FontLineStyle.LINESTYLE_BOLDDASHDOTDOT:
      return "dashed";
    case FontLineStyle.LINESTYLE_SMALLWAVE:
    case FontLineStyle.LINESTYLE_WAVE:
    case FontLineStyle.LINESTYLE_DOUBLEWAVE:
    case FontLineStyle.LINESTYLE_BOLDWAVE:
      return "wavy";
    default:
      return "solid";
  }
}

const emphasisStyles: Readonly<Partial<Record<number, string>>> = {
  [FontEmphasisMark.Dot]: "filled dot",
  [FontEmphasisMark.Circle]: "open circle",
  [FontEmphasisMark.Disc]: "filled circle",
  [FontEmphasisMark.Accent]: "filled sesame",
};

/** Projects native emphasis flags to CSS shared by body and annotation text. @param mark - Effective font emphasis. @returns CSS emphasis properties when painted. */
export function browserTextEmphasis(mark: FontEmphasisMark | undefined) {
  if (mark === undefined) return undefined;
  const textEmphasisStyle = emphasisStyles[mark & FontEmphasisMark.Style];
  if (textEmphasisStyle === undefined) return undefined;
  return {
    textEmphasisStyle,
    textEmphasisPosition: mark & FontEmphasisMark.PosBelow ? "under right" : "over right",
  };
}

/** Returns the CSS for one independently decorated line. @param line - Decoration position. @param value - Native line projection. @returns Browser paint values. */
export function browserTextDecoration(
  line: "underline" | "overline",
  value: WriterTextLineProjection,
) {
  return {
    textDecorationLine: line,
    textDecorationStyle: browserTextLineStyle(value.style),
    textDecorationColor: value.color ?? "currentColor",
    ...(value.style >= FontLineStyle.LINESTYLE_BOLD &&
    value.style <= FontLineStyle.LINESTYLE_BOLDWAVE
      ? { textDecorationThickness: "0.13em" }
      : {}),
  };
}

/** Paints the native VCL effect order using the browser's text stroke and shadow primitives. @param effects - Native font paint flags. @param foreground - Effective foreground, if specified. @returns Optional browser paint. */
export function browserFontPaint(
  effects: WriterFontPaint,
  foreground: string | undefined,
): CSSProperties | undefined {
  if (!effects.relief && !effects.outline && !effects.shadow) return undefined;
  const color =
    foreground === undefined || foreground === "auto"
      ? COL_BLACK
      : writerColorFromPrimitive(foreground, "auto");
  if (effects.relief) {
    const offset = effects.relief === FontRelief.Engraved ? -1 : 1;
    const emboss = color.equals(COL_WHITE) || color.equals(COL_BLACK) ? "#000" : "#c0c0c0";
    return {
      ...(color.equals(COL_BLACK) ? { WebkitTextFillColor: "#fff" } : {}),
      textShadow: `${offset}px ${offset}px ${emboss}`,
    };
  }
  const offset = effects.outline ? 2 : 1;
  const shadow = color.GetLuminance() < 8 ? "#c0c0c0" : "#000";
  return {
    ...(effects.outline
      ? { WebkitTextStroke: "1px currentColor", WebkitTextFillColor: "#fff" }
      : {}),
    ...(effects.shadow ? { textShadow: `${offset}px ${offset}px ${shadow}` } : {}),
  };
}
