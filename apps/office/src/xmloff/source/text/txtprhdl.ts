/** @fileoverview Consumed Writer text-frame orientation and wrap maps from native txtprhdl.cxx. */
import { HoriOrientation as H } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../offapi/com/sun/star/text/VertOrientation";
import { RelOrientation as R } from "../../../offapi/com/sun/star/text/RelOrientation";
import { WrapInfluenceOnPosition as I } from "../../../offapi/com/sun/star/text/WrapInfluenceOnPosition";
import { WrapTextMode as W } from "../../../offapi/com/sun/star/text/WrapTextMode";
import { XMLConstantsPropertyHandler } from "../style/XMLConstantsPropertyHandler";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { FontEmphasis } from "../../../offapi/com/sun/star/text/FontEmphasis";
import { Converter } from "../../../sax/source/tools/converter";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";

const pXML_Emphasize_Enum = [
  ["none", FontEmphasis.NONE],
  ["dot", FontEmphasis.DOT_ABOVE],
  ["circle", FontEmphasis.CIRCLE_ABOVE],
  ["disc", FontEmphasis.DISK_ABOVE],
  ["accent", FontEmphasis.ACCENT_ABOVE],
] as const;

/** Native emphasis handler for one optional mark and one optional position in either order. */
export class XMLTextEmphasizePropHdl {
  /** Imports the original signed UNO emphasis value. @param input - Source attribute. @param value - UNO property. @returns Whether matched. */
  importXML(input: string, value: Any): boolean {
    let position: "above" | "below" | undefined;
    let style: number | undefined;
    for (const token of input.split(" ")) {
      if (position === undefined && (token === "above" || token === "below")) {
        position = token;
        continue;
      }
      const entry = pXML_Emphasize_Enum.find(
        /** Reads the original mark identity. @param entry - Mapping. @returns Token match. */ ([
          name,
        ]) => name === token,
      );
      if (style !== undefined || !entry) return false;
      style = entry[1];
    }
    const mark = style ?? FontEmphasis.NONE;
    value.insert([mark && position === "below" ? mark + 10 : mark], "sal_Int16");
    return true;
  }

  /** Writes the native token and its position. @param output - XML output. @param value - UNO property. @returns Native success. */
  exportXML(output: [string], value: Any): boolean {
    const scalar: [number] = [0];
    if (!value.extract(scalar, "sal_uInt16")) return true;
    const below = scalar[0] > 10;
    const style = below ? scalar[0] - 10 : scalar[0];
    const entry = pXML_Emphasize_Enum.find(
      /** Resolves the original mark. @param entry - Mapping. @returns Value match. */ ([, mark]) =>
        mark === style,
    );
    output[0] = (entry?.[0] ?? "dot") + (style ? (below ? " below" : " above") : "");
    return true;
  }
}

/** Native character rotation-angle conversion between degrees and tenths of a degree. */
export class XMLTextRotationAnglePropHdl {
  /** Imports the native normalized quarter-turn. @param input - Degrees. @param value - UNO property. @returns Whether parsed. */
  importXML(input: string, value: Any): boolean {
    const scalar: [number] = [0];
    if (!Converter.convertNumber(scalar, input)) return false;
    const angle = ((scalar[0] % 360) + 360) % 360;
    value.insert([angle < 45 || angle > 315 ? 0 : angle < 180 ? 900 : 2700], "sal_Int16");
    return true;
  }

  /** Writes degrees using the native integer division. @param output - XML output. @param value - UNO property. @returns Whether written. */
  exportXML(output: [string], value: Any): boolean {
    const scalar: [number] = [0];
    if (!value.extract(scalar, "sal_Int16")) return false;
    output[0] = String(Math.trunc(scalar[0] / 10));
    return true;
  }
}

/** Native two-line bracket handler, using one UTF-16 character unit. */
export class XMLTextCombineCharPropHdl {
  /** Imports the first UTF-16 unit or the empty string. @param input - Source string. @param value - UNO property. @returns True. */
  importXML(input: string, value: Any): boolean {
    const string = unicode(input.slice(0, 1));
    try {
      value.insert(string.getDataAddress(), "OUString");
    } finally {
      string.dispose();
    }
    return true;
  }

  /** Writes a bracket only when the extracted string has one UTF-16 unit. @param output - XML output. @param value - UNO property. @returns Whether to emit the attribute. */
  exportXML(output: [string], value: Any): boolean {
    const string = new OUString();
    try {
      if (value.extract(string, "OUString")) output[0] = text(string);
      return output[0].length === 1;
    } finally {
      string.dispose();
    }
  }
}

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
