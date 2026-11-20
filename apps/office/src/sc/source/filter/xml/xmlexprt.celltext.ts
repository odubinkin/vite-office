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
import { exportText } from "../../../../xmloff/source/text/txtparae";
import { exportCellTextPropertyElement } from "./xmlstyle";

/** One source span containing literal text and an optional automatic style name. */
export type CellTextSpan = readonly [value: string, style: string];
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
    const fields = edit.HasField();
    const engine = this.document.GetEditEngine();
    engine.SetText(edit);
    if (!fields) edit.GetAllSections(sections);
    const result: CellTextParagraph[] = [];
    let cursor = 0;
    for (let paragraph = 0; paragraph < edit.GetParagraphCount(); ++paragraph) {
      const source = engine.GetParagraphText(paragraph);
      try {
        const value = text(source);
        const spans: CellTextSpan[] = [];
        let start = 0;
        while (sections[cursor]?.mnParagraph === paragraph) {
          const section = sections[cursor++] as Section;
          if (section.mnStart > start) spans.push([value.slice(start, section.mnStart), ""]);
          if (section.mnEnd > section.mnStart)
            spans.push([value.slice(section.mnStart, section.mnEnd), this.add(edit, section)]);
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

/** Writes native edit-cell paragraphs with optional ODF text spans. @param paragraphs - Actual paragraph spans. @returns Cell content. */
export function writeCellParagraphs(paragraphs: readonly CellTextParagraph[]): string {
  let xml = "";
  for (const paragraph of paragraphs) {
    xml += "<text:p>";
    for (const [value, style] of paragraph) {
      const escaped = exportText(value);
      xml += style ? `<text:span text:style-name="${style}">${escaped}</text:span>` : escaped;
    }
    xml += "</text:p>";
  }
  return xml;
}
