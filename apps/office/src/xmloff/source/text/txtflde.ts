/** @fileoverview Emits native ODF annotation and named reference text fields. */

import type { XMLTextParagraphSource } from "./txtparae";
import { ReferenceFieldPart } from "../../../offapi/com/sun/star/text/ReferenceFieldPart";
import { ReferenceFieldSource } from "../../../offapi/com/sun/star/text/ReferenceFieldSource";

/** Original ODF mapping of reference field parts. */
export const referenceFieldFormats = [
  [ReferenceFieldPart.PAGE, "page"],
  [ReferenceFieldPart.CHAPTER, "chapter"],
  [ReferenceFieldPart.TEXT, "text"],
  [ReferenceFieldPart.UP_DOWN, "direction"],
  [ReferenceFieldPart.CATEGORY_AND_NUMBER, "category-and-value"],
  [ReferenceFieldPart.ONLY_CAPTION, "caption"],
  [ReferenceFieldPart.ONLY_SEQUENCE_NUMBER, "value"],
  [ReferenceFieldPart.NUMBER, "number"],
  [ReferenceFieldPart.NUMBER_NO_CONTEXT, "number-no-superior"],
  [ReferenceFieldPart.NUMBER_FULL_CONTEXT, "number-all-superior"],
] as const;

/** Reference descriptor and cached presentation passed through the ODF filter boundary. */
export interface XMLReferenceField {
  readonly name: string;
  readonly source:
    typeof ReferenceFieldSource.REFERENCE_MARK | typeof ReferenceFieldSource.BOOKMARK;
  readonly part: number;
  readonly language: string;
  readonly presentation: string;
  readonly flags: number;
}

/** A one-character Writer reference field portion. */
export interface XMLReferenceFieldExportMarker extends XMLReferenceField {
  readonly kind: "reference-field";
  readonly offset: number;
}

/** Writes the original named reference field element. @param field - Native field portion. @param escapeXml - XML escaping. @returns Field XML. */
export function exportReferenceField(
  field: XMLReferenceField,
  escapeXml: (value: string) => string,
): string {
  const name = field.source === ReferenceFieldSource.BOOKMARK ? "bookmark-ref" : "reference-ref";
  const token = referenceFieldFormats.find(
    /** Maps the original field part. @param format - Native part and ODF token. @returns Match. */
    ([part]) => part === field.part,
  )?.[1];
  const format = token ? ` text:reference-format="${token}"` : "";
  const language = field.language ? ` loext:reference-language="${escapeXml(field.language)}"` : "";
  return `<text:${name}${format} text:ref-name="${escapeXml(field.name)}"${language}>${escapeXml(field.presentation)}</text:${name}>`;
}

/** Neutral annotation portion before the current paragraph is serialized. */
export type XMLAnnotationExportMarker =
  | Readonly<{
      kind: "annotation";
      offset: number;
      consumesMarker: boolean;
      name: string;
      author: string;
      initials: string;
      date: string;
      parentName: string;
      resolved: boolean;
      text: string;
      paragraphs?: readonly XMLTextParagraphSource[];
    }>
  | Readonly<{ kind: "annotation-end"; name: string; offset: number }>;

/** Writes the represented Writer annotation payload. @param marker - Annotation portion. @param escapeXml - XML escaping. @param exportText - ODF whitespace encoding. @param exportParagraph - Shared paragraph serializer. @returns ODF annotation field XML. */
export function exportAnnotation(
  marker: XMLAnnotationExportMarker,
  escapeXml: (text: string) => string,
  exportText: (text: string) => string,
  exportParagraph: (paragraph: XMLTextParagraphSource) => string,
): string {
  if (marker.kind === "annotation-end")
    return `<office:annotation-end office:name="${escapeXml(marker.name)}"/>`;
  const name = marker.name ? ` office:name="${escapeXml(marker.name)}"` : "";
  const parent = marker.parentName ? ` loext:parent-name="${escapeXml(marker.parentName)}"` : "";
  const author = marker.author ? `<dc:creator>${escapeXml(marker.author)}</dc:creator>` : "";
  const date = `<dc:date>${escapeXml(marker.date)}</dc:date>`;
  const initials = marker.initials
    ? `<meta:creator-initials>${escapeXml(marker.initials)}</meta:creator-initials>`
    : "";
  const paragraphs =
    marker.paragraphs?.map(exportParagraph).join("") ??
    marker.text
      .split("\n")
      .map(
        /** Emits each note paragraph, including empty paragraphs. @param line - Plain comment text. @returns XML paragraph. */ (
          line,
        ) => `<text:p>${exportText(line)}</text:p>`,
      )
      .join("");
  return `<office:annotation${name}${parent} loext:resolved="${marker.resolved}">${author}${date}${initials}${paragraphs}</office:annotation>`;
}
