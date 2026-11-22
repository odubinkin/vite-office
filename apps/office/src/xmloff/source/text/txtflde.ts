/** @fileoverview Consumed native ODF annotation field export. */
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLAnnotation } from "./txtfldi";

/** Emits the annotation field and its separate text section. @param annotation - Native annotation data. @param escape - XML attribute and character escaping. @param exportParagraphs - Annotation text paragraph exporter. @returns ODF annotation element. */
export function exportAnnotation(
  annotation: XMLAnnotation,
  escape: (value: string) => string,
  exportParagraphs: (paragraphs: XMLAnnotation["paragraphs"]) => string,
): string {
  const attributes =
    (annotation.name ? ` office:name="${escape(annotation.name)}"` : "") +
    (annotation.parentName ? ` loext:parent-name="${escape(annotation.parentName)}"` : "") +
    ` loext:resolved="${annotation.resolved}"`;
  const author = annotation.author ? `<dc:creator>${escape(annotation.author)}</dc:creator>` : "";
  const initials = annotation.initials
    ? `<meta:creator-initials>${escape(annotation.initials)}</meta:creator-initials>`
    : "";
  let date = "";
  if (annotation.dateTime) {
    const buffer = new OUStringBuffer();
    Converter.convertDateTime(buffer, annotation.dateTime, null, true);
    const value = buffer.makeStringAndClear();
    try {
      date = `<dc:date>${text(value)}</dc:date>`;
    } finally {
      value.dispose();
      buffer.dispose();
    }
  }
  return `<office:annotation${attributes}>${author}${date}${initials}${exportParagraphs(annotation.paragraphs)}</office:annotation>`;
}
