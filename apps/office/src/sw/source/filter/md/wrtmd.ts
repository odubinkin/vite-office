/** @fileoverview Writer Markdown output following sw/source/filter/md/wrtmd.cxx. */
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import type { WriterTextRun } from "../basflt/writer-transfer";

/** Serializes the current Writer body through the native Markdown writer boundary. */
export class SwMDWriter {
  /** Writes a complete Markdown stream. @param document - Canonical source. @returns UTF-8 bytes. */
  public WriteDocument(document: SwDoc): Uint8Array {
    const blocks = document.GetNodes().getBodyContent(),
      output: string[] = [];
    const listPrefixSizes = new Map<number, number>();
    let previousList = false;
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];
      if (block === undefined) continue;
      if (block instanceof SwTableNode) {
        if (output.length > 0) output.push("");
        output.push(writeTable(block));
        previousList = false;
        continue;
      }
      if (block.GetParagraphStyle() === "preformatted-text") {
        const code = [block.GetText()];
        while (true) {
          const next = blocks[index + 1];
          if (!(next instanceof SwTextNode) || next.GetParagraphStyle() !== "preformatted-text")
            break;
          index++;
          code.push(next.GetText());
        }
        if (output.length > 0) output.push("");
        output.push(`\`\`\`\n${code.join("\n")}\n\`\`\``);
        previousList = false;
        continue;
      }
      const text = writeParagraph(block, listPrefixSizes);
      const list = block.GetNumRule() !== undefined;
      if (output.length > 0 && !(list && previousList)) output.push("");
      output.push(text);
      previousList = list;
    }
    return new TextEncoder().encode(output.join("\n") + "\n");
  }
}

/** Emits upstream-style heading, list, quote and fenced-code paragraph markers. @param node - Body paragraph. @returns Markdown block. */
function writeParagraph(node: SwTextNode, listPrefixSizes: Map<number, number>): string {
  const style = node.GetParagraphStyle(),
    heading = /^heading-([1-6])$/u.exec(style);
  const text = writeRuns(projectWriterTextRuns(node), heading !== null);
  if (heading !== null) return `${"#".repeat(Number(heading[1]))} ${text}`;
  if (style === "quotations") return `> ${text}`;
  if (node.GetNumRule() !== undefined) {
    const level = node.GetActualListLevel();
    let marker = node.GetNumString();
    if (marker.length === 0 && node.HasBullet()) marker = "-";
    const prefix = `${" ".repeat(listPrefixSizes.get(level - 1) ?? 0)}${marker} `;
    if (prefix.length > 1) {
      listPrefixSizes.set(level, prefix.length);
      return prefix + text;
    }
  }
  return text;
}

/** Emits direct character spans with source-supported Markdown delimiters. @param runs - Native projected text portions. @returns Inline Markdown. */
function writeRuns(runs: readonly WriterTextRun[], inheritedBold = false): string {
  return runs
    .map((run) => {
      const code = run.attributes.fontFamily === "Liberation Mono";
      let text = code ? run.text : escapeMarkdown(run.text);
      if (code) text = `\`${text}\``;
      if (
        run.attributes.strikeout !== undefined &&
        run.attributes.strikeout !== FontStrikeout.STRIKEOUT_NONE
      )
        text = `~~${text}~~`;
      if (run.attributes.italic) text = `*${text}*`;
      if (run.attributes.bold && !inheritedBold) text = `**${text}**`;
      if (run.hyperlink !== undefined) text = `[${text}](${run.hyperlink.url})`;
      return text;
    })
    .join("");
}

/** Applies the escape set in upstream OutEscapedChars. @param value - Visible source. @returns Escaped Markdown. */
function escapeMarkdown(value: string): string {
  return value.replace(/[\\`*_{}[\]<>#]/gu, "\\$&").replaceAll("\n", "  \n");
}

/** Emits a GitHub-flavored table from native rows and paragraph adjustments. @param table - Body table. @returns Markdown table. */
function writeTable(table: SwTableNode): string {
  const rows = table.GetTable().GetTabLines();
  if (rows.length === 0) return "";
  const output: string[] = [];
  for (const [rowIndex, row] of rows.entries()) {
    const cells = row.GetTabBoxes().map((box) =>
      box
        .GetParagraphs()
        .map((node) => writeRuns(projectWriterTextRuns(node)))
        .join(" "),
    );
    output.push(`| ${cells.join(" | ")} |`);
    if (rowIndex === 0) {
      const delimiters = row.GetTabBoxes().map((box) => {
        const alignment = box.GetParagraphs()[0]?.GetParagraphAlignment();
        return alignment === "center" ? ":-:" : alignment === "right" ? "-:" : "-";
      });
      output.push(`| ${delimiters.join(" | ")} |`);
    }
  }
  return output.join("\n");
}
