/** @fileoverview Writer Markdown output following sw/source/filter/md/wrtmd.cxx. */
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import {
  SvxFontItem,
  SvxPostureItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { FontItalic, FontStrikeout, FontWeight } from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_FONT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
} from "../../../inc/hintids";
import { WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import type { SwFormat } from "../../core/attr/format";
import type { SwDoc } from "../../core/doc/doc";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SwTableNode } from "../../core/docnode/node";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";

const headingLevels = new Map(
  WRITER_PARAGRAPH_STYLE_POOL.flatMap(
    /** Computes the style result. @param style - Style. @returns The computed result. */ (
      style,
    ) => {
      const match = /^heading-([1-6])$/u.exec(style.id);
      return match === null ? [] : [[style.poolId, Number(match[1])] as const];
    },
  ),
);
const quotationPoolId = WRITER_PARAGRAPH_STYLE_POOL.find(
  /** Computes the style result. @param style - Style. @returns The computed result. */ (style) =>
    style.id === "quotations",
)?.poolId;

/** Serializes the current Writer body through the native Markdown writer boundary. */
export class SwMDWriter {
  /** Writes a complete Markdown stream. @param document - Canonical source. @returns UTF-8 bytes. */
  public WriteDocument(document: SwDoc): Uint8Array {
    const blocks = document.GetNodes().getBodyContent(),
      output: string[] = [];
    const listPrefixSizes = new Map<number, number>();
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];
      if (block === undefined) continue;
      if (block instanceof SwTableNode) {
        output.push("\n", writeTable(block), "\n");
        continue;
      }
      if (block.GetParagraphStyle() === "preformatted-text") {
        if (block.GetText().length > 0) {
          if (index > 0) output.push("\n");
          const previous = blocks[index - 1];
          if (
            !(previous instanceof SwTextNode) ||
            previous.GetParagraphStyle() !== "preformatted-text"
          )
            output.push("```\n");
          output.push(writeRuns(block, true));
          const next = blocks[index + 1];
          if (!(next instanceof SwTextNode) || next.GetParagraphStyle() !== "preformatted-text")
            output.push("\n```");
        }
        output.push("\n");
        continue;
      }
      if (block.GetText().length > 0) {
        if (index > 0) output.push("\n");
        output.push(writeParagraph(block, listPrefixSizes));
      }
      output.push("\n");
    }
    return OUStringToOString(output.join(""), RTL_TEXTENCODING_UTF8);
  }
}

/** Emits upstream-style heading, list, quote and fenced-code paragraph markers. @param node - Body paragraph. @returns Markdown block.  @param listPrefixSizes - List Prefix Sizes. */
function writeParagraph(node: SwTextNode, listPrefixSizes: Map<number, number>): string {
  const format = node.GetTextFormatColl();
  let headingLevel = 0;
  for (
    let ancestor: SwFormat | undefined = format;
    ancestor !== undefined;
    ancestor = ancestor.DerivedFrom()
  ) {
    if (headingLevel === 0 && ancestor instanceof SwTextFormatColl)
      headingLevel = headingLevels.get(ancestor.poolId) ?? 0;
  }
  const text = writeRuns(node);
  const quote = format.poolId === quotationPoolId ? "> " : "";
  if (headingLevel > 0) return `${quote}${"#".repeat(headingLevel)} ${text}`;
  if (node.GetNumRule() !== undefined) {
    const level = node.GetActualListLevel();
    let marker = node.GetNumString();
    if (marker.length === 0 && node.HasBullet()) marker = "-";
    const prefix = `${" ".repeat(listPrefixSizes.get(level - 1) ?? 0)}${marker} `;
    if (prefix.length > 1) {
      listPrefixSizes.set(level, prefix.length);
      return quote + prefix + text;
    }
  }
  return quote + text;
}

/** Source formatting counters, including negative values from explicit none items. */
interface MarkdownFormattingStatus {
  code: number;
  strikeout: number;
  italic: number;
  bold: number;
  links: Map<string, number>;
}

/** Creates one independent source formatting status. @returns Empty counters. */
function emptyFormattingStatus(): MarkdownFormattingStatus {
  return { code: 0, strikeout: 0, italic: 0, bold: 0, links: new Map() };
}

/** Counts source-recognized direct items, recursively visiting auto-format handles. @param status - Target counters. @param item - Direct pool item. @param codeFont - HTML preformatted style font. @returns Nothing. */
function applyFormattingItem(
  status: MarkdownFormattingStatus,
  item: SfxPoolItem,
  codeFont: SfxPoolItem,
): void {
  if (item instanceof SwFormatAutoFormat) {
    for (const nested of item.GetStyleHandle().entries())
      applyFormattingItem(status, nested, codeFont);
  } else if (item instanceof SwFormatINetFormat) {
    const url = item.GetValue();
    if (url.length > 0) status.links.set(url, (status.links.get(url) ?? 0) + 1);
  } else if (item instanceof SvxCrossedOutItem && item.Which() === RES_CHRATR_CROSSEDOUT)
    status.strikeout += item.GetStrikeout() === FontStrikeout.STRIKEOUT_NONE ? -1 : 1;
  else if (item instanceof SvxPostureItem && item.Which() === RES_CHRATR_POSTURE)
    status.italic += item.GetPosture() === FontItalic.ITALIC_NONE ? -1 : 1;
  else if (item instanceof SvxWeightItem && item.Which() === RES_CHRATR_WEIGHT)
    status.bold += item.GetWeight() === FontWeight.WEIGHT_DONTKNOW ? -1 : 1;
  else if (item instanceof SvxFontItem && item.Which() === RES_CHRATR_FONT && item.equals(codeFont))
    status.code++;
}

/** Adds only directly stored pool items, excluding inherited paragraph-style properties. @param status - Target counters. @param items - Direct item set. @param codeFont - HTML preformatted style font. @returns Nothing. */
function applyFormattingSet(
  status: MarkdownFormattingStatus,
  items: SfxItemSet,
  codeFont: SfxPoolItem,
): void {
  for (const item of items.entries()) applyFormattingItem(status, item, codeFont);
}

/** Recreates the pinned positive/negative formatting status at a native text offset. @param node - Text owner. @param offset - UTF-16 position. @param codeFont - HTML preformatted style font. @returns Source counters. */
function formattingAt(
  node: SwTextNode,
  offset: number,
  codeFont: SfxPoolItem,
): MarkdownFormattingStatus {
  const status = emptyFormattingStatus();
  applyFormattingSet(status, node.GetSwAttrSet(), codeFont);
  const hints = node.GetpSwpHints();
  if (hints !== undefined)
    for (let index = 0; index < hints.Count(); index++) {
      const hint = hints.Get(index);
      if (hint.GetStart() <= offset && offset < hint.GetAnyEnd())
        applyFormattingItem(status, hint.GetAttr(), codeFont);
    }
  return status;
}

/** Tests the pinned transition from an active status to zero or below. @param before - Previous count. @param after - New count. @returns Whether to write closing markup. */
function shouldClose(before: number, after: number): boolean {
  return before !== after && before >= 0 && after <= 0;
}

/** Tests the pinned transition from zero or below to an active status. @param before - Previous count. @param after - New count. @returns Whether to write opening markup. */
function shouldOpen(before: number, after: number): boolean {
  return before !== after && before <= 0 && after > 0;
}

/** Emits direct native items and ranged hints using the source delimiter order. @param node - Native text owner. @returns Inline Markdown.  @param codeBlock - Code Block. */
function writeRuns(node: SwTextNode, codeBlock = false): string {
  const source = node.GetText();
  if (source.length === 0) return "";
  const codeFont = node
    .GetDoc()
    .GetTextFormatColl("preformatted-text")
    .GetAttrSet()
    .Get(RES_CHRATR_FONT);
  const positions = new Set<number>([0, source.length]);
  const hints = node.GetpSwpHints();
  if (hints !== undefined)
    for (let index = 0; index < hints.Count(); index++) {
      const hint = hints.Get(index);
      positions.add(hint.GetStart());
      positions.add(hint.GetAnyEnd());
    }
  const sorted = [...positions]
    .filter(
      /** Computes the position result. @param position - Position. @returns The computed result. */ (
        position,
      ) => position >= 0 && position <= source.length,
    )
    .sort(
      /** Computes the a result. @param a - A. @param b - B. @returns The computed result. */ (
        a,
        b,
      ) => a - b,
    );
  let previous = emptyFormattingStatus();
  let output = "";
  for (let index = 0; index < sorted.length; index++) {
    const position = sorted[index] as number;
    const next =
      position === source.length ? emptyFormattingStatus() : formattingAt(node, position, codeFont);
    if (!codeBlock && shouldClose(previous.code, next.code)) output += "`";
    if (shouldClose(previous.strikeout, next.strikeout)) output += "~~";
    if (shouldClose(previous.italic, next.italic)) output += "*";
    if (shouldClose(previous.bold, next.bold)) output += "**";
    const urls = [...new Set([...previous.links.keys(), ...next.links.keys()])].sort();
    for (const url of urls)
      if (shouldClose(previous.links.get(url) ?? 0, next.links.get(url) ?? 0))
        output += `](${url})`;
    if (shouldOpen(previous.strikeout, next.strikeout)) output += "~~";
    if (shouldOpen(previous.italic, next.italic)) output += "*";
    if (shouldOpen(previous.bold, next.bold)) output += "**";
    for (const url of urls)
      if (shouldOpen(previous.links.get(url) ?? 0, next.links.get(url) ?? 0)) output += "[";
    if (!codeBlock && shouldOpen(previous.code, next.code)) output += "`";
    const end = sorted[index + 1];
    if (end !== undefined && end > position) {
      const chunk = source.slice(position, end);
      output += codeBlock || next.code !== 0 ? chunk : escapeMarkdown(chunk);
    }
    previous = next;
  }
  return output;
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
    const cells = row.GetTabBoxes().map(
      /** Computes the box result. @param box - Box. @returns The computed result. */ (box) =>
        box
          .GetParagraphs()
          .map(
            /** Checks  . @param node - Node. @returns The computed result. */ (node) =>
              writeRuns(node),
          )
          .join(" "),
    );
    output.push(`| ${cells.join(" | ")} |`);
    if (rowIndex === 0) {
      const delimiters = row.GetTabBoxes().map(
        /** Computes the box result. @param box - Box. @returns The computed result. */ (box) => {
          const alignment = box.GetParagraphs()[0]?.GetParagraphAlignment();
          return alignment === "center" ? ":-:" : alignment === "right" ? "-:" : "-";
        },
      );
      output.push(`| ${delimiters.join(" | ")} |`);
    }
  }
  return output.join("\n");
}
