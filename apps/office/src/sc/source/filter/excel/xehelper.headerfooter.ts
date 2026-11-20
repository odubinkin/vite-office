/** @fileoverview Native EditTextObject portions encoded by the Excel header/footer converter. */
import type { EditTextObjectConstReference } from "../../../../editeng/inc/editobj";
import type { Section } from "../../../../editeng/inc/section";
import * as EE from "../../../../editeng/inc/eeitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxEscapementItem } from "../../../../editeng/source/items/textitem.escapement";
import type { SvxPostureItem } from "../../../../editeng/inc/postitem";
import type { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { SvxFieldItem } from "../../../../editeng/inc/flditem";
import { SvxEscapement } from "../../../../editeng/inc/svxenum";
import {
  FontStrikeout,
  FontWeight,
  FontItalic,
  FontLineStyle,
} from "../../../../tools/inc/fontenum";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import * as Field from "../../../../offapi/com/sun/star/text/textfield/Type";
import type { XclFontData } from "./xlstyle";
import { XclTools } from "./xltools";

const fieldTokens = new Map([
  [Field.PAGE, "&P"],
  [Field.PAGES, "&N"],
  [Field.TABLE, "&A"],
  [Field.TIME, "&T"],
  [Field.DOCINFO_TITLE, "&F"],
]);

/** Applies the original Excel font substitutions before comparing names. @param value - Actual family name. @returns Excel family. */
function excelFamily(value: string): string {
  const raw = unicode(value);
  const name = XclTools.GetXclFontName(raw);
  try {
    return text(name);
  } finally {
    name.dispose();
    raw.dispose();
  }
}

/** Effective portion font used to encode changes relative to the workbook's application font. */
interface PortionFont {
  name: string;
  size: number;
  underline: FontLineStyle;
  color: number;
  strike: boolean;
  escape: SvxEscapement;
  bold: boolean;
  italic: boolean;
}

/** Collects the original printable portion text and height. */
export class XclExpHFConverter {
  /** Borrows the workbook's original application font. @param base - Actual font record. @returns Converter. */
  constructor(private readonly base: XclFontData) {}

  /** Encodes three areas in left/center/right order and returns the maximum height. @param areas - Native page style area values. @returns Excel string and twip height. */
  GenerateString(areas: readonly (EditTextObjectConstReference | null)[]): {
    value: string;
    height: number;
  } {
    let value = "";
    let height = 0;
    for (const [index, area] of areas.entries()) {
      if (area === null) continue;
      const portion = this.AppendPortion(area);
      if (!portion.value) continue;
      value += "&" + ["L", "C", "R"][index] + portion.value;
      height = Math.max(height, portion.height);
    }
    return { value, height };
  }

  /** Applies the original font/field change encoding over real EditEngine sections. @param area - Native portion. @returns Text and accumulated height. */
  private AppendPortion(area: EditTextObjectConstReference): { value: string; height: number } {
    const defaultFont: PortionFont = {
      name: text(this.base.maName),
      size: Math.trunc((this.base.mnHeight + 10) / 20),
      underline: this.base.GetScUnderline(),
      color: this.base.maComplexColor.getFinalColor().toUInt32() & 0xffffff,
      strike: this.base.mbStrikeout,
      escape: this.base.GetScEscapement(),
      bold: this.base.GetScWeight() > FontWeight.WEIGHT_NORMAL,
      italic: this.base.mbItalic,
    };
    let previous = defaultFont;
    const sections: Section[] = [];
    area.GetAllSections(sections);
    let index = 0;
    let value = "";
    let height = 0;
    for (let paragraph = 0; paragraph < area.GetParagraphCount(); ++paragraph) {
      const native = area.GetText(paragraph);
      try {
        const source = text(native);
        let line = "";
        let lineHeight = 0;
        while (sections[index]?.mnParagraph === paragraph) {
          const section = sections[index++];
          if (!section || section.mnStart === section.mnEnd) continue;
          const items = new Map<number, Section["maAttributes"][number]>();
          for (const item of section.maAttributes) items.set(item.Which(), item);
          const fill = (items.get(EE.EE_CHAR_COLOR) as SvxColorItem | undefined)?.GetValue();
          const underline =
            (items.get(EE.EE_CHAR_UNDERLINE) as SvxUnderlineItem | undefined)?.GetLineStyle() ??
            defaultFont.underline;
          const escape = (
            items.get(EE.EE_CHAR_ESCAPEMENT) as SvxEscapementItem | undefined
          )?.GetEsc();
          const current: PortionFont = {
            name: excelFamily(
              (items.get(EE.EE_CHAR_FONTINFO) as SvxFontItem | undefined)?.GetFamilyName() ??
                defaultFont.name,
            ),
            size: Math.trunc(
              (((items.get(EE.EE_CHAR_FONTHEIGHT) as SvxFontHeightItem | undefined)?.GetHeight() ??
                defaultFont.size * 20) +
                10) /
                20,
            ),
            underline:
              underline === FontLineStyle.LINESTYLE_NONE ||
              underline === FontLineStyle.LINESTYLE_DOUBLE
                ? underline
                : FontLineStyle.LINESTYLE_SINGLE,
            color: fill ? fill.toUInt32() & 0xffffff : defaultFont.color,
            strike: items.has(EE.EE_CHAR_STRIKEOUT)
              ? (items.get(EE.EE_CHAR_STRIKEOUT) as SvxCrossedOutItem).GetValue() !==
                FontStrikeout.STRIKEOUT_NONE
              : defaultFont.strike,
            escape:
              escape === undefined
                ? defaultFont.escape
                : escape > 0
                  ? SvxEscapement.Superscript
                  : escape < 0
                    ? SvxEscapement.Subscript
                    : SvxEscapement.Off,
            bold: items.has(EE.EE_CHAR_WEIGHT)
              ? (items.get(EE.EE_CHAR_WEIGHT) as SvxWeightItem).GetValue() >
                FontWeight.WEIGHT_NORMAL
              : defaultFont.bold,
            italic: items.has(EE.EE_CHAR_ITALIC)
              ? (items.get(EE.EE_CHAR_ITALIC) as SvxPostureItem).GetValue() !==
                FontItalic.ITALIC_NONE
              : defaultFont.italic,
          };
          const resized = current.size !== previous.size;
          if (current.name !== previous.name) line += '&"' + current.name + '"';
          if (current.bold !== previous.bold) line += "&B";
          if (current.italic !== previous.italic) line += "&I";
          if (resized) line += "&" + current.size;
          if (current.underline !== previous.underline) {
            const lineStyle = current.underline || previous.underline;
            line += lineStyle === FontLineStyle.LINESTYLE_DOUBLE ? "&E" : "&U";
          }
          if (current.color !== previous.color)
            line += "&K" + current.color.toString(16).padStart(6, "0");
          if (current.strike !== previous.strike) line += "&S";
          if (current.escape !== previous.escape)
            line += (current.escape || previous.escape) === SvxEscapement.Superscript ? "&X" : "&Y";
          const field = items.get(EE.EE_FEATURE_FIELD);
          if (field instanceof SvxFieldItem && section.mnEnd === section.mnStart + 1) {
            const id = field.GetField()?.GetClassId();
            if (id !== undefined) line += fieldTokens.get(id) ?? "";
          } else {
            const literal = source.slice(section.mnStart, section.mnEnd).replaceAll("&", "&&");
            if (resized && /\d$/u.test(line) && /^\d/u.test(literal)) line += " ";
            line += literal;
          }
          lineHeight = Math.max(lineHeight, current.size * 20);
          previous = current;
        }
        value += (value && line ? "\n" : "") + line;
        height += lineHeight || previous.size * 20;
      } finally {
        native.dispose();
      }
    }
    return { value, height };
  }
}
