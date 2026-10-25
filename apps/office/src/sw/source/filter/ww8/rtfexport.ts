/** @fileoverview Writer RTF document serialization following sw/source/filter/ww8/rtfexport.cxx. */
import type { SwDoc } from "../../core/doc/doc";
import { getWriterNumFormatKind } from "../../core/doc/number";
import { SwTableNode } from "../../core/docnode/node";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
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
    { id: number; levels: readonly ("bullet" | "numbered")[] }
  >();

  /** Exports a complete Writer document. @param document - Native model. @returns RTF bytes. */
  public ExportDocument(document: SwDoc): Uint8Array {
    this.fonts.clear();
    this.colors.clear();
    this.lists.clear();
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
      const rule = paragraph.GetNumRule();
      if (rule !== undefined && !this.lists.has(rule.GetName())) {
        const levels = Array.from(
          { length: 10 },
          /** Selects the native numbering kind at one level. @param _item - Array slot. @param level - List level. @returns Kind. */ (
            _item,
            level,
          ) => getWriterNumFormatKind(rule.Get(level)),
        );
        this.lists.set(rule.GetName(), { id: this.lists.size + 1, levels });
      }
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
    if (this.lists.size > 0) {
      output += "{\\*\\listtable";
      for (const list of this.lists.values()) {
        output += `{\\list\\listtemplateid${list.id}\\listsimple0`;
        for (const kind of list.levels)
          output +=
            kind === "bullet"
              ? "{\\listlevel\\levelnfc23\\levelstartat1\\levelfollow0{\\leveltext \\'01\\u8226?;}{\\levelnumbers;}}"
              : "{\\listlevel\\levelnfc0\\levelstartat1\\levelfollow0{\\leveltext \\'02\\'00.;}{\\levelnumbers\\'01;}}";
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
          boxes.forEach(
            /** Emits one cell boundary. @param _box - Cell. @param index - Column. @returns Nothing. */ (
              _box,
              index,
            ) => {
              output += `\\cellx${(index + 1) * 1440}`;
            },
          );
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
    const rule = paragraph.GetNumRule();
    if (rule !== undefined) {
      const list = this.lists.get(rule.GetName());
      if (list !== undefined) output += `\\ls${list.id}\\ilvl${paragraph.GetAttrListLevel()}`;
    }
    output += " ";
    for (const run of projectWriterTextRuns(paragraph)) {
      const controls = this.attributeOutput.WriteCharacter(run.attributes);
      const text = "{" + controls + (controls.length === 0 ? "" : " ") + escapeRtf(run.text) + "}";
      output +=
        run.hyperlink === undefined
          ? text
          : `{\\field{\\*\\fldinst HYPERLINK "${escapeRtf(run.hyperlink.url).replaceAll('"', "\\u34?")}"}{\\fldrslt ${text}}}`;
    }
    return output;
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
