/** @fileoverview Native Writer DrawingML position alignment and relative-reference mappings. */
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation as R } from "../../../../offapi/com/sun/star/text/RelOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFormatHoriOrient, SwFormatVertOrient } from "../../../inc/fmtornt";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";

/** Lexical inputs for one original position resource after its attributes and text events. */
export interface DrawingPosition {
  relativeFrom: string;
  offset: number;
  align: string;
}

const horizontalRelations: ReadonlyMap<string, R> = new Map([
  ["margin", R.PAGE_PRINT_AREA],
  ["page", R.PAGE_FRAME],
  ["insideMargin", R.PAGE_FRAME],
  ["column", R.FRAME],
  ["character", R.CHAR],
  ["leftMargin", R.PAGE_LEFT],
  ["rightMargin", R.PAGE_RIGHT],
]);
const verticalRelations: ReadonlyMap<string, R> = new Map([
  ["margin", R.PAGE_PRINT_AREA],
  ["page", R.PAGE_FRAME],
  ["topMargin", R.PAGE_PRINT_AREA_TOP],
  ["bottomMargin", R.PAGE_PRINT_AREA_BOTTOM],
  ["paragraph", R.FRAME],
  ["line", R.TEXT_LINE],
]);
const horizontalAlignments: ReadonlyMap<string, H> = new Map([
  ["left", H.LEFT],
  ["right", H.RIGHT],
  ["center", H.CENTER],
  ["inside", H.INSIDE],
  ["outside", H.OUTSIDE],
]);
const verticalAlignments: ReadonlyMap<string, V> = new Map([
  ["top", V.TOP],
  ["bottom", V.BOTTOM],
  ["center", V.CENTER],
]);

/** Converts an EMU source length through Writer's hundredths-of-a-millimetre property boundary. @param value - Source EMUs. @returns Writer twips. */
export function emuToWriterTwip(value: number): number {
  return Number(
    convert(convert(BigInt(value), Length.emu, Length.mm100), Length.mm100, Length.twip),
  );
}

/** Resolves a native horizontal position. @param source - DrawingML position resource. @returns Frame item. */
export function horizontalPosition(source: DrawingPosition): SwFormatHoriOrient {
  return new SwFormatHoriOrient(
    emuToWriterTwip(source.offset),
    horizontalAlignments.get(source.align) ?? H.NONE,
    horizontalRelations.get(source.relativeFrom) ?? R.FRAME,
    source.relativeFrom === "insideMargin",
  );
}

/** Resolves a native vertical position, including the source's inverted line-relative top/bottom alignments. @param source - DrawingML position resource. @returns Frame item. */
export function verticalPosition(source: DrawingPosition): SwFormatVertOrient {
  const relation = verticalRelations.get(source.relativeFrom) ?? R.FRAME;
  let alignment = verticalAlignments.get(source.align) ?? V.NONE;
  if (relation === R.TEXT_LINE) {
    if (alignment === V.TOP) alignment = V.BOTTOM;
    else if (alignment === V.BOTTOM) alignment = V.TOP;
  } else if (relation === R.PAGE_PRINT_AREA_BOTTOM) {
    if (source.align === "inside") alignment = V.TOP;
    else if (source.align === "outside") alignment = V.BOTTOM;
  }
  return new SwFormatVertOrient(emuToWriterTwip(source.offset), alignment, relation);
}
