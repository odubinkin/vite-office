/** @fileoverview ODF paragraph alignment handlers and the mapped justification attributes. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { ParagraphAdjust as A } from "../../../offapi/com/sun/star/style/ParagraphAdjust";
import { Converter } from "../../../sax/source/tools/converter";
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { XMLPercent16PropHdl } from "./xmlbahdl";

const adjustments = {
  left: A.LEFT,
  right: A.RIGHT,
  start: A.START,
  end: A.END,
  center: A.CENTER,
  justify: A.BLOCK,
};

/** Supported ODF paragraph alignment tokens. */
export type OdfParagraphAlignment = keyof typeof adjustments;

/** Reads the original horizontal alignment tokens. @param value - ODF text-align attribute. @returns Supported alignment. */
export function importParagraphAlignment(value: string | null): OdfParagraphAlignment | undefined {
  if (value === null) return undefined;
  if (value === "justified") return "justify";
  if (Object.hasOwn(adjustments, value)) return value as OdfParagraphAlignment;
  throw new Error(`Unsupported ODF paragraph alignment: ${value}`);
}

/** Resolves an alignment token to the native UNO short. @param alignment - ODF lexical value. @returns ParagraphAdjust value. */
export function getParagraphAlignmentValue(alignment: OdfParagraphAlignment): A {
  return adjustments[alignment];
}

/** Maps a native paragraph adjustment to its canonical ODF value. @param adjust - UNO short. @returns ODF token. */
export function exportParagraphAlignment(adjust: number): OdfParagraphAlignment {
  const match = Object.entries(adjustments).find(
    /** Compares native alignment values. @param entry - Token and UNO value. @returns Whether matched. */
    ([, value]) => value === adjust,
  );
  return (match?.[0] as OdfParagraphAlignment | undefined) ?? "start";
}

/** Justification properties registered by the ODF paragraph property map. */
export const paragraphJustificationProperties = [
  ["ParaLastLineAdjust", T.FO_TEXT_ALIGN_LAST, "fo:text-align-last", "align"],
  ["ParaExpandSingleWord", T.STYLE_JUSTIFY_SINGLE_WORD, "style:justify-single-word", "bool"],
  ["ParaWordSpacing", T.LOEXT_WORD_SPACING, "loext:word-spacing", "percent"],
  ["ParaWordSpacingMinimum", T.LOEXT_WORD_SPACING_MINIMUM, "loext:word-spacing-minimum", "percent"],
  ["ParaWordSpacingMaximum", T.LOEXT_WORD_SPACING_MAXIMUM, "loext:word-spacing-maximum", "percent"],
  [
    "ParaLetterSpacingMinimum",
    T.LOEXT_LETTER_SPACING_MINIMUM,
    "loext:letter-spacing-minimum",
    "percent",
  ],
  [
    "ParaLetterSpacingMaximum",
    T.LOEXT_LETTER_SPACING_MAXIMUM,
    "loext:letter-spacing-maximum",
    "percent",
  ],
  ["ParaScaleWidthMinimum", T.LOEXT_TEXT_SCALE_MINIMUM, "loext:text-scale-minimum", "percent"],
  ["ParaScaleWidthMaximum", T.LOEXT_TEXT_SCALE_MAXIMUM, "loext:text-scale-maximum", "percent"],
  ["ParaComposer", T.LOEXT_PARAGRAPH_COMPOSER, "loext:paragraph-composer", "bool"],
] as const;

/** Scalar UNO values for the direct justification property map. */
export type OdfParagraphJustification = Readonly<{
  [Row in (typeof paragraphJustificationProperties)[number] as Row[0]]?: Row[3] extends "bool"
    ? boolean
    : number;
}>;

/** Reads the present justification attributes and retains their native UNO widths. @param attributes - Paragraph property attributes. @returns Justification properties when present. */
export function importParagraphJustification(
  attributes: FastAttributeList,
): OdfParagraphJustification | undefined {
  const properties = [];
  for (const [key, token, , kind] of paragraphJustificationProperties) {
    const input = attributes.get(token);
    if (input === null) continue;
    if (kind === "align") {
      if (input === "start") properties.push([key, A.LEFT]);
      else if (input === "center") properties.push([key, A.CENTER]);
      else if (input === "justify" || input === "justified") properties.push([key, A.BLOCK]);
    } else if (kind === "bool") {
      const output: [boolean] = [false];
      if (Converter.convertBool(output, input)) properties.push([key, output[0]]);
    } else {
      const value = new Any();
      try {
        const output: [number] = [0];
        if (new XMLPercent16PropHdl().importXML(input, value) && value.extract(output, "sal_Int16"))
          properties.push([key, output[0]]);
      } finally {
        value.dispose();
      }
    }
  }
  return properties.length === 0 ? undefined : Object.fromEntries(properties);
}

/** Writes the direct justification attributes in their original lexical forms. @param properties - UNO values from a direct adjustment item. @returns ODF attributes. */
export function exportParagraphJustification(properties?: OdfParagraphJustification): string[] {
  const attributes: string[] = [];
  for (const [key, , attribute, kind] of paragraphJustificationProperties) {
    const value = properties?.[key];
    if (value === undefined || (kind === "align" && value === A.LEFT)) continue;
    const output =
      kind === "align"
        ? exportParagraphAlignment(Number(value))
        : kind === "percent"
          ? `${value}%`
          : String(value);
    attributes.push(`${attribute}="${output}"`);
  }
  return attributes;
}
