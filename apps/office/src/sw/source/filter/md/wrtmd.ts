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
import { SwPoolFormatId, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import type { SwFormat } from "../../core/attr/format";
import type { SwDoc } from "../../core/doc/doc";
import { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SwTableNode, type SwEndNode } from "../../core/docnode/node";
import { CollectTextFlyFrames } from "../../core/layout/flycnt";
import {
  SwFormatAutoFormat,
  SwFormatCharFormat,
  SwFormatINetFormat,
} from "../../core/txtnode/fmtatr2";
import { SwTextNode, type WriterParagraphAlignment } from "../../core/txtnode/ndtxt";

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
    const nodes = document.GetNodes(),
      end = nodes.GetEndOfContent().GetIndex(),
      first = nodes.getBodyContent()[0]?.GetIndex() ?? end,
      output: string[] = [];
    const flys = this.CollectFlys(document);
    const tables: SwMDTableInfo[] = [];
    const listPrefixSizes = new Map<number, number>();
    for (let index = first; index < end; ++index) {
      const node = nodes.at(index);
      if (node instanceof SwTextNode)
        OutMarkdown_SwTextNode(
          node,
          index === first,
          tables,
          listPrefixSizes,
          output,
          flys.get(node),
        );
      else if (node instanceof SwTableNode) {
        tables.push(OutMarkdown_SwTableNode(node));
        if (tables.length === 1) output.push("\n");
      } else if (node === tables.at(-1)?.pEndNode) tables.pop();
    }
    return OUStringToOString(output.join(""), RTL_TEXTENCODING_UTF8);
  }

  /** Collects native text fly positions for ApplyFlyFrameFormat. This model has text and table content only, so each position has the same single empty SwMDImageInfo. @param document - Actual Writer document. @returns Anchor offsets by native text node. */
  private CollectFlys(document: SwDoc): ReadonlyMap<SwTextNode, ReadonlySet<number>> {
    const result = new Map<SwTextNode, ReadonlySet<number>>();
    for (const [node, frames] of CollectTextFlyFrames(document)) {
      const positions = new Set<number>();
      for (const { format } of frames) positions.add(format.GetAnchor().GetAnchorContentOffset());
      result.set(node, positions);
    }
    return result;
  }
}

/** Emits original heading, list and quote prefixes before already rendered run content. @param node - Actual paragraph. @param listPrefixSizes - Original list prefix widths. @param text - Rendered Markdown runs. @returns Markdown block. */
function writeParagraph(
  node: SwTextNode,
  listPrefixSizes: Map<number, number>,
  text: string,
): string {
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
    const items = item.GetStyleHandle() as SfxItemSet | undefined;
    if (items) applyFormattingSet(status, items, codeFont);
  } else if (item instanceof SwFormatCharFormat) {
    const style = item.GetCharFormat();
    if (style) applyFormattingSet(status, style.GetAttrSet(), codeFont);
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

/** Emits native items, ranged hints and anchored flys in source delimiter order. @param node - Native text owner. @param codeBlock - Whether inside preformatted text. @param flys - Source anchor offsets. @returns Inline Markdown. */
function writeRuns(node: SwTextNode, codeBlock: boolean, flys?: ReadonlySet<number>): string {
  const source = node.GetText();
  if (source.length === 0) return "";
  const codeFont = node
    .GetDoc()
    .GetTextFormatColl("preformatted-text")
    .GetAttrSet()
    .Get(RES_CHRATR_FONT);
  const positions = new Set<number>([0, source.length, ...(flys ?? [])]);
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
    // Source OutFormattingChange emits anchored flys between closing and opening markup.
    if (flys?.has(position)) output += "![]()";
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

/** Source cell-boundary flags are consumed only by the exact text node at that index. */
interface SwMDCellInfo {
  bCellStart?: true;
  bCellEnd?: true;
  bRowStart?: true;
  bRowEnd?: true;
  aFirstRowBoxAdjustments?: readonly (WriterParagraphAlignment | undefined)[];
}

/** Original per-table stack entry. */
interface SwMDTableInfo {
  readonly aCellInfos: Map<number, SwMDCellInfo>;
  readonly pEndNode: SwEndNode;
}

/** Returns the source map's shared flags for one start/end node. @param infos - Original table metadata. @param index - Native node index. @returns Mutable source flags. */
function cellInfo(infos: Map<number, SwMDCellInfo>, index: number): SwMDCellInfo {
  let info = infos.get(index);
  if (!info) {
    info = {};
    infos.set(index, info);
  }
  return info;
}

/** Collects the original table-cell start/end nodes and the first row's adjustments. @param node - Connected table. @returns Original table metadata. */
function OutMarkdown_SwTableNode(node: SwTableNode): SwMDTableInfo {
  const table = node.GetTable(),
    nodes = node.GetNodes(),
    aCellInfos = new Map<number, SwMDCellInfo>();
  for (const [row, line] of table.GetTabLines().entries()) {
    const boxes = line.GetTabBoxes();
    const adjustments: (WriterParagraphAlignment | undefined)[] = [];
    for (const [column, box] of boxes.entries()) {
      if (!box.GetSttIdx()) continue;
      const start = box.GetStartNode(),
        first = start.GetIndex() + 1,
        head = cellInfo(aCellInfos, first),
        tail = cellInfo(aCellInfos, start.EndOfSectionIndex() - 1);
      head.bCellStart = true;
      if (row === 0) adjustments.push(nodes.at(first).GetTextNode()?.GetParagraphAlignment());
      if (column === 0) head.bRowStart = true;
      tail.bCellEnd = true;
      if (column + 1 === boxes.length) {
        tail.bRowEnd = true;
        if (row === 0) tail.aFirstRowBoxAdjustments = adjustments;
      }
    }
  }
  return { aCellInfos, pEndNode: node.EndOfSectionNode() };
}

/** Writes the actual text and only the source separators owned by this node. @param node - Native paragraph. @param first - Whether the stream starts at this node. @param tables - Original open table stack. @param listPrefixSizes - Actual list prefix widths. @param output - Original stream fragments. @param flys - Original fly positions. @returns Nothing. */
function OutMarkdown_SwTextNode(
  node: SwTextNode,
  first: boolean,
  tables: readonly SwMDTableInfo[],
  listPrefixSizes: Map<number, number>,
  output: string[],
  flys?: ReadonlySet<number>,
): void {
  const table = tables.at(-1),
    nested = tables.length > 1,
    info = table?.aCellInfos.get(node.GetIndex());
  if (info?.bCellStart && !nested) output.push(info.bRowStart ? "| " : " | ");
  if (node.Len() > 0) {
    if (!first && !table) output.push("\n");
    const preformatted =
      node.GetTextFormatColl().GetPoolFormatId() === SwPoolFormatId.COLL_HTML_PRE;
    let text = writeRuns(node, preformatted, flys);
    if (preformatted) {
      const nodes = node.GetNodes(),
        index = node.GetIndex(),
        previous = nodes.at(index - 1).GetTextNode(),
        next = nodes.at(index + 1).GetTextNode();
      if (previous?.GetTextFormatColl().GetPoolFormatId() !== SwPoolFormatId.COLL_HTML_PRE)
        text = "```\n" + text;
      if (next?.GetTextFormatColl().GetPoolFormatId() !== SwPoolFormatId.COLL_HTML_PRE)
        text += "\n```";
    }
    output.push(writeParagraph(node, listPrefixSizes, text));
  }
  if (info?.bRowEnd && !nested) {
    output.push(" |");
    if (info.aFirstRowBoxAdjustments) {
      output.push("\n");
      for (const alignment of info.aFirstRowBoxAdjustments)
        output.push(alignment === "center" ? "| :-: " : alignment === "right" ? "| -: " : "| - ");
      output.push("|");
    }
  }
  if (table && (!info?.bCellEnd || nested)) output.push(" ");
  else if (!table || info?.bRowEnd) output.push("\n");
}
