/** @fileoverview Emits native ODF annotation and named reference text fields. */

import type { XMLTextParagraphSource } from "./txtparae";
import { ReferenceFieldPart } from "../../../offapi/com/sun/star/text/ReferenceFieldPart";
import { ReferenceFieldSource } from "../../../offapi/com/sun/star/text/ReferenceFieldSource";
import { XMLToken } from "../core/xmltoken";
import { PageNumberType } from "../../../offapi/com/sun/star/text/PageNumberType";
import * as NumberingType from "../../../offapi/com/sun/star/style/NumberingType";
import { SvXMLUnitConverter } from "../core/xmluconv";

/** Original page number and continuation field portion. */
export interface XMLPageNumberExportMarker {
  readonly kind: "page-number-field";
  readonly offset: number;
  readonly selection: PageNumberType;
  readonly numberingType: number;
  readonly adjustment: number;
  readonly userText: string;
  readonly presentation: string;
}

/** Writes the original page selector and adjustment, removing the base next/previous displacement. @param field - Writer page field portion. @param escapeXml - XML escaping. @returns ODF field. */
export function exportPageNumberField(
  field: XMLPageNumberExportMarker,
  escapeXml: (value: string) => string,
): string {
  const selector =
    field.selection === PageNumberType.PREV
      ? "previous"
      : field.selection === PageNumberType.NEXT
        ? "next"
        : "current";
  const select = ` text:select-page="${selector}"`;
  const presentation = escapeXml(field.presentation);
  if (field.numberingType === NumberingType.CHAR_SPECIAL) {
    const content =
      field.userText === field.presentation
        ? ""
        : ` text:string-value="${escapeXml(field.userText)}"`;
    return `<text:page-continuation${content}${select}>${presentation}</text:page-continuation>`;
  }
  const adjustment = field.adjustment - (field.selection - PageNumberType.CURRENT);
  const adjust = adjustment === 0 ? "" : ` text:page-adjust="${adjustment}"`;
  return `<text:page-number${exportFieldNumbering(field.numberingType, escapeXml)}${select}${adjust}>${presentation}</text:page-number>`;
}

/** Writes the original optional field numbering format and alphabetic repetition attribute. @param type - Native numbering style. @param escapeXml - XML escaping. @returns Attributes. */
function exportFieldNumbering(type: number, escapeXml: (value: string) => string): string {
  if (type === NumberingType.PAGE_DESCRIPTOR) return "";
  const format = escapeXml(new SvXMLUnitConverter("mm100").convertNumFormat(type));
  const sync = SvXMLUnitConverter.convertNumLetterSync(type);
  return ` style:num-format="${format}"${sync ? ` style:num-letter-sync="${sync}"` : ""}`;
}

/** Native count field element names and UNO services. */
export const countFields = [
  [XMLToken.TEXT_PAGE_COUNT, "text:page-count", "PageCount"],
  [XMLToken.LOEXT_PAGE_COUNT_RANGE, "loext:page-count-range", "PageCountRange"],
  [XMLToken.TEXT_PARAGRAPH_COUNT, "text:paragraph-count", "ParagraphCount"],
  [XMLToken.TEXT_WORD_COUNT, "text:word-count", "WordCount"],
  [XMLToken.TEXT_CHARACTER_COUNT, "text:character-count", "CharacterCount"],
  [XMLToken.TEXT_TABLE_COUNT, "text:table-count", "TableCount"],
  [XMLToken.TEXT_IMAGE_COUNT, "text:image-count", "GraphicObjectCount"],
  [XMLToken.TEXT_OBJECT_COUNT, "text:object-count", "EmbeddedObjectCount"],
] as const;

/** Mapping shared by the original count import and export. */
export type XMLCountField = (typeof countFields)[number];

/** One count field at a native text attribute. */
export interface XMLCountExportMarker {
  readonly kind: "count-field";
  readonly offset: number;
  readonly element: XMLCountField[1];
  readonly numberingType: number;
  readonly presentation: string;
}

/** Writes the original count field and optional explicit numbering type. @param field - Count field portion. @param escapeXml - XML escaping. @returns ODF element. */
export function exportCountField(
  field: XMLCountExportMarker,
  escapeXml: (value: string) => string,
): string {
  return `<${field.element}${exportFieldNumbering(field.numberingType, escapeXml)}>${escapeXml(field.presentation)}</${field.element}>`;
}

import type { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { approxFloor } from "../../../sal/inc/rtl/math";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../sax/source/tools/converter";
import { convertDaysToDuration } from "../../../sax/source/tools/converter.duration";

/** One-character native date or time field portion. */
export interface XMLDateTimeExportMarker {
  readonly kind: "date-time-field";
  readonly offset: number;
  readonly date: boolean;
  readonly fixed: boolean;
  readonly value: DateTime;
  readonly adjust: number;
  readonly styleName?: string;
  readonly presentation: string;
}

/** Writes the date/time value and original adjustment granularity. @param field - Native field portion. @param escapeXml - XML escaping. @returns ODF text field. */
export function exportDateTimeField(
  field: XMLDateTimeExportMarker,
  escapeXml: (value: string) => string,
): string {
  const element = field.date ? "date" : "time";
  const buffer = new OUStringBuffer();
  let value: string;
  try {
    if (field.date) Converter.convertDateTime(buffer, field.value, null);
    else Converter.convertTimeOrDateTime(buffer, field.value);
    const converted = buffer.makeStringAndClear();
    try {
      value = text(converted);
    } finally {
      converted.dispose();
    }
  } finally {
    buffer.dispose();
  }
  const duration = field.adjust / (24 * 60);
  const days = field.date ? approxFloor(duration) : duration;
  const adjust = days ? ` text:${element}-adjust="${convertDaysToDuration(days)}"` : "";
  const fixed = field.fixed ? ' text:fixed="true"' : "";
  const style = field.styleName ? ` style:data-style-name="${escapeXml(field.styleName)}"` : "";
  return `<text:${element}${style} text:${element}-value="${escapeXml(value)}"${fixed}${adjust}>${escapeXml(field.presentation)}</text:${element}>`;
}

/** Native ODF tag, UNO service, fixed content property and date discriminator for DocInfo fields. */
export const docInfoFields = [
  [XMLToken.TEXT_TITLE, "title", "DocInfo.Title", "Content"],
  [XMLToken.TEXT_SUBJECT, "subject", "DocInfo.Subject", "Content"],
  [XMLToken.TEXT_DESCRIPTION, "description", "DocInfo.Description", "Content"],
  [XMLToken.TEXT_KEYWORDS, "keywords", "DocInfo.KeyWords", "Content"],
  [XMLToken.TEXT_INITIAL_CREATOR, "initial-creator", "DocInfo.CreateAuthor", "Author"],
  [XMLToken.TEXT_CREATOR, "creator", "DocInfo.ChangeAuthor", "Author"],
  [XMLToken.TEXT_PRINTED_BY, "printed-by", "DocInfo.PrintAuthor", "Author"],
  [XMLToken.TEXT_EDITING_CYCLES, "editing-cycles", "DocInfo.Revision", undefined],
  [XMLToken.TEXT_CREATION_DATE, "creation-date", "DocInfo.CreateDateTime", undefined, true],
  [XMLToken.TEXT_CREATION_TIME, "creation-time", "DocInfo.CreateDateTime", undefined, false],
  [XMLToken.TEXT_MODIFICATION_DATE, "modification-date", "DocInfo.ChangeDateTime", undefined, true],
  [
    XMLToken.TEXT_MODIFICATION_TIME,
    "modification-time",
    "DocInfo.ChangeDateTime",
    undefined,
    false,
  ],
  [XMLToken.TEXT_PRINT_DATE, "print-date", "DocInfo.PrintDateTime", undefined, true],
  [XMLToken.TEXT_PRINT_TIME, "print-time", "DocInfo.PrintDateTime", undefined, false],
  [XMLToken.TEXT_EDITING_DURATION, "editing-duration", "DocInfo.EditTime", undefined],
  [XMLToken.TEXT_USER_DEFINED, "user-defined", "DocInfo.Custom", undefined],
] as const;

/** One native simple DocInfo service mapping. */
export type XMLDocInfoField = (typeof docInfoFields)[number];

/** A one-character Writer document information field portion. */
export interface XMLDocInfoExportMarker {
  readonly kind: "doc-info-field";
  readonly offset: number;
  readonly element: XMLDocInfoField[1];
  readonly fixed: boolean;
  readonly presentation: string;
  readonly styleName?: string;
  readonly name?: string;
}

/** Exports the native XMLTextFieldExport element and nondefault fixed flag. @param marker - Model portion. @param escapeXml - XML escaping. @returns Xml text field. */
export function exportDocInfoField(
  marker: XMLDocInfoExportMarker,
  escapeXml: (value: string) => string,
): string {
  const fixed = marker.fixed ? ' text:fixed="true"' : "";
  const style = marker.styleName ? ` style:data-style-name="${escapeXml(marker.styleName)}"` : "";
  const name = marker.name === undefined ? "" : ` text:name="${escapeXml(marker.name)}"`;
  return `<text:${marker.element}${style}${name}${fixed}>${escapeXml(marker.presentation)}</text:${marker.element}>`;
}

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
