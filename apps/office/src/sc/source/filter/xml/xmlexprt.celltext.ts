/** @fileoverview Calc ODF text spans over native EditTextObject sections and the shared text style mapping. */
import type { EditTextObject, EditTextObjectConstReference } from "../../../../editeng/inc/editobj";
import type { Section } from "../../../../editeng/inc/section";
import {
  EE_CHAR_ESCAPEMENT,
  EE_CHAR_FONTHEIGHT,
  EE_CHAR_FONTHEIGHT_CJK,
  EE_CHAR_FONTHEIGHT_CTL,
  EE_FEATURE_FIELD,
  EE_FEATURE_LINEBR,
  EE_FEATURE_TAB,
} from "../../../../editeng/inc/eeitem";
import type { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { ScDocument } from "../../../inc/document";
import { ScPatternAttr } from "../../../inc/patattr";
import type { XMLFontAutoStylePool } from "../../../../xmloff/source/style/XMLFontAutoStylePool";
import { exportTextCharacterProperties } from "../../../../xmloff/source/text/txtprmap";
import { escapeXml, exportText } from "../../../../xmloff/source/text/txtparae";
import {
  SvxDateField,
  SvxFileField,
  SvxTableField,
  SvxURLField,
  type SvxDateFormat,
  type SvxDateType,
  type SvxFieldDataConstReference,
  type SvxFieldItem,
  type SvxURLFormat,
} from "../../../../editeng/inc/flditem";
import { Date } from "../../../../tools/source/datetime/tdate";
import { GetCellFieldValue } from "../../core/tool/editutil";
import { exportCellTextPropertyElement } from "./xmlstyle";

/** Data required to reconstruct the represented native field in another document owner. */
export type CellTextField =
  | {
      readonly kind: "url";
      readonly url: string;
      readonly target: string;
      readonly representation: string;
      readonly format: SvxURLFormat;
      readonly name?: string;
    }
  | { readonly kind: "sheet"; readonly tab: number }
  | {
      readonly kind: "date";
      readonly date?: number;
      readonly type?: SvxDateType;
      readonly format?: SvxDateFormat;
    }
  | { readonly kind: "title" };

/** One styled text fragment or a native field with its formatted presentation. */
export type CellTextSpan = readonly [value: string, style: string, field?: CellTextField];
/** One native paragraph in the browser transfer and XML paths. */
export type CellTextParagraph = readonly CellTextSpan[];

/** Deduplicates the character properties found in actual edit-cell sections. */
export class CellTextStylePool {
  private readonly styles = new Map<string, string>();

  /** Uses the document formatting pool and the package's shared font declarations. @param document - Actual Calc document. @param fonts - ODF font declaration pool. @param prefix - Automatic style name prefix. @returns Style owner. */
  constructor(
    private readonly document: ScDocument,
    private readonly fonts: XMLFontAutoStylePool,
    private readonly prefix = "T",
  ) {}

  /** Registers a section's equivalent ODF character style. @param edit - Native text value. @param section - Source range. @param twips - Header/footer font height unit. @returns Optional style name. */
  add(edit: EditTextObjectConstReference, section: Section, twips = false): string {
    if (!section.maAttributes.length) return "";
    if (
      section.maAttributes.some(
        /** Writes structural characters outside text spans, as in flushParagraph. @param item - Native edit item. @returns Whether this is a structural feature. */
        (item) => item.Which() === EE_FEATURE_TAB || item.Which() === EE_FEATURE_LINEBR,
      )
    )
      return "";
    const items = new SfxItemSet(edit.GetPool());
    const pattern = new ScPatternAttr(this.document.getCellAttributeHelper());
    let properties: string;
    try {
      for (const item of section.maAttributes) {
        const which = item.Which();
        if (which === EE_FEATURE_FIELD) continue;
        if (
          twips &&
          (which === EE_CHAR_FONTHEIGHT ||
            which === EE_CHAR_FONTHEIGHT_CJK ||
            which === EE_CHAR_FONTHEIGHT_CTL)
        ) {
          const size = item as SvxFontHeightItem;
          items.Put(
            new SvxFontHeightItem(Number(convertTwipToMm100(BigInt(size.GetHeight()))), 100, which),
            true,
          );
        } else items.Put(item);
      }
      pattern.GetFromEditItemSet(items);
      const position = items.GetItemIfSet(EE_CHAR_ESCAPEMENT) as SvxEscapementItem | undefined;
      properties = exportCellTextPropertyElement(
        pattern,
        this.fonts,
        position
          ? exportTextCharacterProperties({
              escapement: position.GetEsc(),
              escapementHeight: position.GetProportionalHeight(),
            })
          : "",
      );
    } finally {
      pattern.Dispose();
      items.Dispose();
    }
    if (!properties) return "";
    const existing = this.styles.get(properties);
    if (existing) return existing;
    const name = this.prefix + (this.styles.size + 1);
    this.styles.set(properties, name);
    return name;
  }

  /** Collects native spans in paragraph order. @param edit - Actual edited cell. @returns Structured paragraph data. */
  collect(edit: EditTextObject): CellTextParagraph[] {
    const sections: Section[] = [];
    edit.GetAllSections(sections);
    const result: CellTextParagraph[] = [];
    let cursor = 0;
    for (let paragraph = 0; paragraph < edit.GetParagraphCount(); ++paragraph) {
      const source = edit.GetText(paragraph);
      try {
        const value = text(source);
        const spans: CellTextSpan[] = [];
        let start = 0;
        while (sections[cursor]?.mnParagraph === paragraph) {
          const section = sections[cursor++] as Section;
          if (section.mnStart > start) spans.push([value.slice(start, section.mnStart), ""]);
          if (section.mnEnd > section.mnStart) {
            const feature = section.maAttributes.find(
              /** Finds the native feature item for a marker. @param item - Section attribute. @returns Whether it is a feature. */
              (item) =>
                item.Which() === EE_FEATURE_FIELD ||
                item.Which() === EE_FEATURE_TAB ||
                item.Which() === EE_FEATURE_LINEBR,
            );
            const style = this.add(edit, section);
            const field =
              feature?.Which() === EE_FEATURE_FIELD ? (feature as SvxFieldItem).GetField() : null;
            if (field) {
              const presentation = GetCellFieldValue(field, this.document, [null]);
              try {
                const record = collectField(field);
                spans.push(
                  record ? [text(presentation), style, record] : [text(presentation), style],
                );
              } finally {
                presentation.dispose();
              }
            } else {
              const content =
                feature?.Which() === EE_FEATURE_TAB
                  ? "\t"
                  : feature?.Which() === EE_FEATURE_LINEBR
                    ? "\n"
                    : value.slice(section.mnStart, section.mnEnd);
              if (content !== "\u0001") spans.push([content, style]);
            }
          }
          start = section.mnEnd;
        }
        if (start < value.length) spans.push([value.slice(start), ""]);
        result.push(spans);
      } finally {
        source.dispose();
      }
    }
    return result;
  }

  /** Emits the automatic text styles used by exported cell spans. @returns Automatic styles XML. */
  exportStyles(): string {
    let xml = "";
    for (const [properties, name] of this.styles)
      xml += `<style:style style:name="${name}" style:family="text">${properties}</style:style>`;
    return xml;
  }
}

/** Serializes only field classes recognized by Calc's ODF text writer. @param field - Borrowed native field. @returns Field transfer data. */
function collectField(field: SvxFieldDataConstReference): CellTextField | undefined {
  if (field instanceof SvxURLField)
    return {
      kind: "url",
      url: text(field.GetURL()),
      target: text(field.GetTargetFrame()),
      representation: text(field.GetRepresentation()),
      format: field.GetFormat(),
      name: text(field.GetName()),
    };
  if (field instanceof SvxTableField) return { kind: "sheet", tab: field.GetTab() };
  if (field instanceof SvxDateField)
    return {
      kind: "date",
      date: field.GetFixDate(),
      type: field.GetType(),
      format: field.GetFormat(),
    };
  if (field instanceof SvxFileField) return { kind: "title" };
  return undefined;
}

/** Emits the original ODF field element with its displayed text. @param value - Native field presentation. @param field - Actual field data. @returns Field XML. */
function writeField(value: string, field: CellTextField): string {
  const display = escapeXml(value);
  switch (field.kind) {
    case "url": {
      const target = field.target ? ` office:target-frame-name="${escapeXml(field.target)}"` : "";
      return `<text:a xlink:href="${escapeXml(field.url)}" xlink:type="simple"${target}>${display}</text:a>`;
    }
    case "sheet":
      return `<text:sheet-name>${display}</text:sheet-name>`;
    case "title":
      return `<text:title>${display}</text:title>`;
    case "date": {
      const date = new Date(Date.SYSTEM);
      const iso = `${date.GetYear()}-${String(date.GetMonth()).padStart(2, "0")}-${String(date.GetDay()).padStart(2, "0")}`;
      return `<text:date style:data-style-name="N2" text:date-value="${iso}">${display}</text:date>`;
    }
  }
}

/** Writes native edit-cell paragraphs with optional ODF text spans. @param paragraphs - Actual paragraph spans. @returns Cell content. */
export function writeCellParagraphs(paragraphs: readonly CellTextParagraph[]): string {
  let xml = "";
  for (const paragraph of paragraphs) {
    xml += "<text:p>";
    for (const [value, style, field] of paragraph) {
      const escaped = field ? writeField(value, field) : exportText(value);
      xml += style ? `<text:span text:style-name="${style}">${escaped}</text:span>` : escaped;
    }
    xml += "</text:p>";
  }
  return xml;
}
