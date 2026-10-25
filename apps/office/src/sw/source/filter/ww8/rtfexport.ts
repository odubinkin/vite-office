/** @fileoverview Writer RTF document serialization following sw/source/filter/ww8/rtfexport.cxx. */
import type { SwDoc } from "../../core/doc/doc";
import { getWriterNumFormatKind } from "../../core/doc/number";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import { SwTableNode } from "../../core/docnode/node";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { projectWriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { WriterTextRun } from "../basflt/writer-transfer";
import { RtfAttributeOutput } from "./rtfattributeoutput";

/** Writes current-model Writer text, direct character attributes and tables as RTF. */
export class RtfExport {
  private readonly attributeOutput = new RtfAttributeOutput(
    (family) => this.IndexFont(family),
    (color) => this.IndexColor(color),
  );
  private readonly fonts = new Map<string, number>();
  private readonly colors = new Map<string, number>();
  private readonly lists = new Map<
    string,
    {
      id: number;
      levels: readonly Readonly<{
        kind: "bullet" | "numbered";
        start: number;
        bullet: number;
        numberingType: SvxNumType;
      }>[];
    }
  >();
  private readonly styles = new Map<string, { index: number; style: SwTextFormatColl }>();

  /** Exports a complete Writer document. @param document - Native model. @returns RTF bytes. */
  public ExportDocument(document: SwDoc): Uint8Array {
    this.fonts.clear();
    this.colors.clear();
    this.lists.clear();
    this.styles.clear();
    const blocks = document.GetNodes().getBodyContent();
    for (const node of document.GetNodes().entries()) {
      if (!node.IsTextNode()) continue;
      for (const run of projectWriterTextRuns(node as SwTextNode)) {
        if (run.attributes.fontFamily !== undefined) this.IndexFont(run.attributes.fontFamily);
        if (run.attributes.color !== undefined && run.attributes.color !== "auto")
          this.IndexColor(run.attributes.color);
        if (run.attributes.highlight !== undefined && run.attributes.highlight !== "transparent")
          this.IndexColor(run.attributes.highlight);
      }
      const paragraph = node as SwTextNode;
      const style = paragraph.GetTextFormatColl();
      if (!this.styles.has(style.id)) this.styles.set(style.id, { index: this.styles.size, style });
      const rule = paragraph.GetNumRule();
      if (rule !== undefined && !this.lists.has(rule.GetName())) {
        const levels = Array.from(
          { length: 10 },
          /** Selects the native numbering kind at one level. @param _item - Array slot. @param level - List level. @returns Kind. */ (
            _item,
            level,
          ) => {
            const format = rule.Get(level);
            return {
              kind: getWriterNumFormatKind(format),
              start: format.GetStart(),
              bullet: format.GetBulletChar(),
              numberingType: format.GetNumberingType(),
            };
          },
        );
        this.lists.set(rule.GetName(), { id: this.lists.size + 1, levels });
      }
    }
    for (const { style } of this.styles.values()) {
      const attributes = projectWriterCharacterAttributes(style.GetAttrSet());
      if (attributes.fontFamily !== undefined) this.IndexFont(attributes.fontFamily);
      if (attributes.color !== undefined && attributes.color !== "auto")
        this.IndexColor(attributes.color);
      if (attributes.highlight !== undefined && attributes.highlight !== "transparent")
        this.IndexColor(attributes.highlight);
    }
    let output = "{\\rtf1\\ansi\\ansicpg1252\\deff0";
    if (this.fonts.size > 0) {
      output += "{\\fonttbl";
      for (const [family, index] of this.fonts) output += `{\\f${index} ${escapeRtf(family)};}`;
      output += "}";
    }
    if (this.colors.size > 0) {
      output += "{\\colortbl;";
      for (const color of this.colors.keys()) {
        const red = Number.parseInt(color.slice(1, 3), 16),
          green = Number.parseInt(color.slice(3, 5), 16),
          blue = Number.parseInt(color.slice(5, 7), 16);
        output += `\\red${red}\\green${green}\\blue${blue};`;
      }
      output += "}";
    }
    if (this.styles.size > 0) {
      output += "{\\stylesheet";
      for (const { index, style } of this.styles.values()) {
        const paragraph = this.attributeOutput.WriteStyleParagraphProperties(style),
          character = this.attributeOutput.WriteCharacter(
            projectWriterCharacterAttributes(style.GetAttrSet()),
          );
        output += `{\\s${index}${paragraph}${character} ${escapeRtf(style.GetName())};}`;
      }
      output += "}";
    }
    if (this.lists.size > 0) {
      output += "{\\*\\listtable";
      for (const list of this.lists.values()) {
        output += `{\\list\\listtemplateid${list.id}\\listsimple0`;
        for (const level of list.levels)
          output +=
            level.kind === "bullet"
              ? `{\\listlevel\\levelnfc23\\levelstartat${level.start}\\levelfollow0{\\leveltext \\'01${escapeRtf(String.fromCodePoint(level.bullet || 0x2022))};}{\\levelnumbers;}}`
              : `{\\listlevel\\levelnfc${toRtfNfc(level.numberingType)}\\levelstartat${level.start}\\levelfollow0{\\leveltext \\'02\\'00.;}{\\levelnumbers\\'01;}}`;
        output += `{\\listname ;}\\listid${list.id}}`;
      }
      output += "}{\\*\\listoverridetable";
      for (const list of this.lists.values())
        output += `{\\listoverride\\listid${list.id}\\listoverridecount0\\ls${list.id}}`;
      output += "}";
    }
    output += "\n";
    for (const block of blocks) {
      if (block instanceof SwTableNode) {
        for (const row of block.GetTable().GetTabLines()) {
          const boxes = row.GetTabBoxes();
          output += "\\trowd";
          const nativeWidths = boxes.map((box) => box.GetFrameSize().GetWidth());
          const hasNativeWidths = nativeWidths.every((width) => width > 0);
          const baseWidth = nativeWidths.reduce((total, width) => total + width, 0);
          const tableWidth = block.GetTable().GetFrameFormat().GetFrameSize().GetWidth();
          const widthRatio = hasNativeWidths && tableWidth > 0 ? tableWidth / baseWidth : 1;
          let right = 0;
          for (const width of nativeWidths) {
            right += hasNativeWidths ? width : 1440;
            output += `\\cellx${Math.round(right * widthRatio)}`;
          }
          for (const box of boxes) {
            for (const [paragraphIndex, paragraph] of box.GetParagraphs().entries()) {
              if (paragraphIndex > 0) output += "\\par ";
              output += `\\pard\\intbl ${this.WriteParagraph(paragraph)}`;
            }
            output += "\\cell ";
          }
          output += "\\row\n";
        }
      } else output += `\\pard${this.WriteParagraph(block)}\\par\n`;
    }
    output += "}";
    return new TextEncoder().encode(output);
  }

  /** Serializes one paragraph's represented properties and text runs. @param paragraph - Native paragraph. @returns RTF body. */
  private WriteParagraph(paragraph: SwTextNode): string {
    let output = this.attributeOutput.WriteParagraphProperties(paragraph);
    const style = this.styles.get(paragraph.GetParagraphStyle());
    if (style !== undefined) output += `\\s${style.index}`;
    const rule = paragraph.GetNumRule();
    if (rule !== undefined) {
      const list = this.lists.get(rule.GetName());
      if (list !== undefined) output += `\\ls${list.id}\\ilvl${paragraph.GetAttrListLevel()}`;
    }
    output += " ";
    const marks = paragraph
      .GetDoc()
      .GetIDocumentMarkAccess()
      .GetBookmarks()
      .filter((mark) => mark.GetMarkPos().GetNode() === paragraph);
    let offset = 0;
    let markIndex = 0;
    for (const run of projectWriterTextRuns(paragraph)) {
      let localOffset = 0;
      const end = offset + run.text.length;
      while (markIndex < marks.length) {
        const mark = marks[markIndex];
        if (mark === undefined) break;
        const position = mark.GetMarkPos().GetContentIndex();
        if (position >= end) break;
        output += this.WriteRun({ ...run, text: run.text.slice(localOffset, position - offset) });
        output += this.WriteBookmark(mark.GetName());
        localOffset = position - offset;
        markIndex++;
      }
      output += this.WriteRun({ ...run, text: run.text.slice(localOffset) });
      offset = end;
    }
    for (; markIndex < marks.length; markIndex++)
      output += this.WriteBookmark(marks[markIndex]?.GetName() ?? "");
    return output;
  }

  /** Emits one Writer point mark at its source text offset. */
  private WriteBookmark(name: string): string {
    return `{\\*\\bkmkstart ${escapeRtf(name)}}{\\*\\bkmkend ${escapeRtf(name)}}`;
  }

  /** Emits one native text run without crossing a bookmark position. */
  private WriteRun(run: WriterTextRun): string {
    if (run.text.length === 0) return "";
    const controls = this.attributeOutput.WriteCharacter(run.attributes);
    const text = "{" + controls + (controls.length === 0 ? "" : " ") + escapeRtf(run.text) + "}";
    return run.hyperlink === undefined
      ? text
      : `{\\field{\\*\\fldinst HYPERLINK "${escapeRtf(run.hyperlink.url).replaceAll('"', "\\u34?")}"}{\\fldrslt ${text}}}`;
  }

  /** Assigns a stable RTF font index. @param family - Family name. @returns Index. */
  private IndexFont(family: string): number {
    const existing = this.fonts.get(family);
    if (existing !== undefined) return existing;
    const index = this.fonts.size;
    this.fonts.set(family, index);
    return index;
  }

  /** Assigns a stable one-based RTF color index. @param color - CSS RGB color. @returns Index. */
  private IndexColor(color: string): number {
    const existing = this.colors.get(color);
    if (existing !== undefined) return existing;
    const index = this.colors.size + 1;
    this.colors.set(color, index);
    return index;
  }
}

/** Escapes text according to RTF's ASCII plus signed UTF-16 Unicode form. @param value - Source text. @returns RTF text. */
function escapeRtf(value: string): string {
  let result = "";
  for (let index = 0; index < value.length; index++) {
    const code = value.charCodeAt(index);
    if (code === 0x5c || code === 0x7b || code === 0x7d) result += "\\" + value[index];
    else if (code === 0x0a) result += "\\line ";
    else if (code === 0x09) result += "\\tab ";
    else if (code >= 0x20 && code <= 0x7e) result += value[index];
    else result += `\\u${code > 0x7fff ? code - 0x10000 : code}?`;
  }
  return result;
}

/** Maps native numbering types to RTF levelnfc, retaining the source Arabic fallback. */
function toRtfNfc(type: SvxNumType): number {
  switch (type) {
    case SvxNumType.SVX_NUM_ROMAN_UPPER:
      return 1;
    case SvxNumType.SVX_NUM_ROMAN_LOWER:
      return 2;
    case SvxNumType.SVX_NUM_CHARS_UPPER_LETTER:
    case SvxNumType.SVX_NUM_CHARS_UPPER_LETTER_N:
      return 3;
    case SvxNumType.SVX_NUM_CHARS_LOWER_LETTER:
    case SvxNumType.SVX_NUM_CHARS_LOWER_LETTER_N:
      return 4;
    case SvxNumType.SVX_NUM_FULL_WIDTH_ARABIC:
      return 14;
    case SvxNumType.SVX_NUM_CIRCLE_NUMBER:
      return 18;
    case SvxNumType.SVX_NUM_NUMBER_LOWER_ZH:
      return 35;
    case SvxNumType.SVX_NUM_NUMBER_UPPER_ZH:
      return 38;
    case SvxNumType.SVX_NUM_NUMBER_UPPER_ZH_TW:
      return 34;
    case SvxNumType.SVX_NUM_TIAN_GAN_ZH:
      return 30;
    case SvxNumType.SVX_NUM_DI_ZI_ZH:
      return 31;
    case SvxNumType.SVX_NUM_NUMBER_TRADITIONAL_JA:
      return 16;
    case SvxNumType.SVX_NUM_AIU_FULLWIDTH_JA:
      return 20;
    case SvxNumType.SVX_NUM_AIU_HALFWIDTH_JA:
      return 12;
    case SvxNumType.SVX_NUM_IROHA_FULLWIDTH_JA:
      return 21;
    case SvxNumType.SVX_NUM_IROHA_HALFWIDTH_JA:
      return 13;
    case SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO:
    case SvxNumType.SVX_NUM_HANGUL_CIRCLED_SYLLABLE_KO:
      return 24;
    case SvxNumType.SVX_NUM_HANGUL_JAMO_KO:
    case SvxNumType.SVX_NUM_HANGUL_CIRCLED_JAMO_KO:
      return 25;
    case SvxNumType.SVX_NUM_NUMBER_HANGUL_KO:
      return 42;
    case NumberingType.NUMBER_DIGITAL_KO as SvxNumType:
      return 41;
    case NumberingType.NUMBER_DIGITAL2_KO as SvxNumType:
      return 44;
    case NumberingType.NUMBER_LEGAL_KO as SvxNumType:
      return 43;
    case SvxNumType.SVX_NUM_CHAR_SPECIAL:
    case SvxNumType.SVX_NUM_BITMAP:
      return 23;
    case SvxNumType.SVX_NUM_NUMBER_NONE:
      return 255;
    case SvxNumType.SVX_NUM_ARABIC_ZERO:
      return 22;
    default:
      return 0;
  }
}
