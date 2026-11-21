/** @fileoverview Consumed Writer text-frame orientation, wrap and character emphasis handlers from native txtprhdl.cxx. */
import { FontEmphasis } from "../../../offapi/com/sun/star/text/FontEmphasis";
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../offapi/com/sun/star/text/RelOrientation";
import { WrapInfluenceOnPosition as I } from "../../../offapi/com/sun/star/text/WrapInfluenceOnPosition";
import { WrapTextMode as W } from "../../../offapi/com/sun/star/text/WrapTextMode";
import { XMLConstantsPropertyHandler } from "../style/XMLConstantsPropertyHandler";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";

const pXML_HoriPos_Enum = [
  ["from-left", H.NONE],
  ["from-inside", H.NONE],
  ["left", H.LEFT],
  ["inside", H.LEFT],
  ["center", H.CENTER],
  ["right", H.RIGHT],
  ["outside", H.RIGHT],
] as const;
const pXML_HoriPosMirrored_Enum = [
  ["from-inside", H.NONE],
  ["inside", H.LEFT],
  ["center", H.CENTER],
  ["outside", H.RIGHT],
] as const;
const pXML_HoriRel_Enum = [
  ["paragraph", R.FRAME],
  ["paragraph-content", R.PRINT_AREA],
  ["page", R.PAGE_FRAME],
  ["page-content", R.PAGE_PRINT_AREA],
  ["paragraph-start-margin", R.FRAME_LEFT],
  ["paragraph-end-margin", R.FRAME_RIGHT],
  ["page-start-margin", R.PAGE_LEFT],
  ["page-end-margin", R.PAGE_RIGHT],
  ["char", R.CHAR],
  ["frame", R.FRAME],
  ["frame-content", R.PRINT_AREA],
  ["frame-start-margin", R.FRAME_LEFT],
  ["frame-end-margin", R.FRAME_RIGHT],
] as const;
const pXML_VertPosAtChar_Enum = [
  ["from-top", V.NONE],
  ["top", V.TOP],
  ["top", V.CHAR_TOP],
  ["top", V.LINE_TOP],
  ["middle", V.CENTER],
  ["middle", V.CHAR_CENTER],
  ["middle", V.LINE_CENTER],
  ["bottom", V.BOTTOM],
  ["below", V.CHAR_BOTTOM],
  ["bottom", V.LINE_BOTTOM],
] as const;
const pXML_VertRel_Enum = [
  ["paragraph", R.FRAME],
  ["paragraph-content", R.PRINT_AREA],
  ["char", R.CHAR],
  ["page", R.PAGE_FRAME],
  ["page-content", R.PAGE_PRINT_AREA],
  ["page-content-top", R.PAGE_PRINT_AREA_TOP],
  ["page-content-bottom", R.PAGE_PRINT_AREA_BOTTOM],
  ["frame", R.FRAME],
  ["frame-content", R.PRINT_AREA],
  ["line", R.TEXT_LINE],
] as const;
const pXML_Wrap_Enum = [
  ["none", W.NONE],
  ["run-through", W.THROUGH],
  ["parallel", W.PARALLEL],
  ["dynamic", W.DYNAMIC],
  ["left", W.LEFT],
  ["right", W.RIGHT],
] as const;
const pXML_WrapInfluenceOnPosition_Enum = [
  ["once-successive", I.ONCE_SUCCESSIVE],
  ["once-concurrent", I.ONCE_CONCURRENT],
  ["iterative", I.ITERATIVE],
] as const;
// com.sun.star.text.ParagraphVertAlign values used by the native text enum handler.
const pXML_ParaVerticalAlign_Enum = [
  ["top", 2],
  ["middle", 3],
  ["bottom", 4],
  ["baseline", 1],
  ["auto", 0],
] as const;

const converter = new SvXMLUnitConverter("twip");
const handlers = {
  paragraphVerticalAlign: new XMLConstantsPropertyHandler(pXML_ParaVerticalAlign_Enum, null),
  horizontal: new XMLConstantsPropertyHandler(pXML_HoriPos_Enum, null),
  horizontalMirrored: new XMLConstantsPropertyHandler(pXML_HoriPosMirrored_Enum, null),
  horizontalRelation: new XMLConstantsPropertyHandler(pXML_HoriRel_Enum, null),
  vertical: new XMLConstantsPropertyHandler(pXML_VertPosAtChar_Enum, null),
  verticalRelation: new XMLConstantsPropertyHandler(pXML_VertRel_Enum, null),
  wrap: new XMLConstantsPropertyHandler(pXML_Wrap_Enum, null),
  wrapInfluence: new XMLConstantsPropertyHandler(pXML_WrapInfluenceOnPosition_Enum, null),
};

/** Reads the original text enum token via the shared constant property handler. @param property - Native property map. @param token - Optional authored XML. @returns Mapped value or absence. */
export function importTextConstant(
  property: keyof typeof handlers,
  token: string | null,
): number | undefined {
  if (token === null) return undefined;
  const value = new Any();
  try {
    const output: [number] = [0];
    return handlers[property].importXML(token, value, converter) &&
      value.extract(output, "sal_Int16")
      ? output[0]
      : undefined;
  } finally {
    value.dispose();
  }
}

/** Writes the first original XML token for the native enum value. @param property - Native property map. @param value - Native numeric property. @returns Canonical token or absence. */
export function exportTextConstant(
  property: keyof typeof handlers,
  value: number | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const any = new Any([value], "sal_Int32");
  try {
    const result: [string] = [""];
    return handlers[property].exportXML(result, any, converter) && result[0]
      ? result[0]
      : undefined;
  } finally {
    any.dispose();
  }
}

const textEmphasisTypes: ReadonlyMap<string, number> = new Map([
  ["none", FontEmphasis.NONE],
  ["dot", FontEmphasis.DOT_ABOVE],
  ["circle", FontEmphasis.CIRCLE_ABOVE],
  ["disc", FontEmphasis.DISK_ABOVE],
  ["accent", FontEmphasis.ACCENT_ABOVE],
]);

/** Reads the two unordered tokens accepted by XMLTextEmphasizePropHdl_Impl. @param value - ODF attribute. @returns UNO short on success. */
export function importTextEmphasis(value: string): number | undefined {
  let type: number | undefined;
  let position: string | undefined;
  for (const token of value.split(" ")) {
    if (position === undefined && (token === "above" || token === "below")) {
      position = token;
      continue;
    }
    if (type !== undefined) return undefined;
    type = textEmphasisTypes.get(token);
    if (type === undefined) return undefined;
  }
  if (type === undefined || type === FontEmphasis.NONE) return FontEmphasis.NONE;
  return position === "below" ? type + 10 : type;
}

/** Emits the original type and position, including the converter's default token. @param value - UNO short. @returns ODF lexical value. */
export function exportTextEmphasis(value: number): string {
  const below = value > 10;
  const type = below ? value - 10 : value;
  for (const [token, wire] of textEmphasisTypes)
    if (wire === type)
      return type === FontEmphasis.NONE ? token : `${token} ${below ? "below" : "above"}`;
  return below ? "dot below" : "dot above";
}
