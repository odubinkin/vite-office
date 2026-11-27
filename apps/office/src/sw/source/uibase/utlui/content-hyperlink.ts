/** @fileoverview Enumerates the native Navigator hyperlink entries with fly-anchor ordering. */
import { RES_TXTATR_INETFMT } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { GetTextNodeExpandedText } from "../../core/txtnode/ndtxt-hints";
import { SwTextINetFormat } from "../../core/txtnode/txtatr2";

/** A displayed hyperlink borrows the original text hint for address-based tracking. */
export interface SwURLFieldContent {
  readonly text: string;
  readonly attribute: SwTextINetFormat;
}

/** Applies native cleaning to the text shown for a hyperlink. @param node - Paragraph owning the link. @param attribute - Original hyperlink hint. @returns Navigator member name. */
export function GetURLFieldContentName(node: SwTextNode, attribute: SwTextINetFormat): string {
  return GetTextNodeExpandedText(node, attribute.GetStart(), attribute.GetEnd())
    .replaceAll("\n", "")
    .replace(/^ +| +$/gu, "");
}

/** Lists native hyperlink ranges in document order, projecting text frame entries to their anchors. @param document - Active Writer document. @returns Ordered visible-label internet attributes. */
export function GetURLFieldContents(document: SwDoc): readonly SwURLFieldContent[] {
  const nodes = document.GetNodes();
  const endOfExtras = nodes.GetEndOfExtras().GetIndex();
  const entries: { item: SwURLFieldContent; nodeIndex: number; offset: number }[] = [];
  for (const node of nodes.entries()) {
    const paragraph = node.GetTextNode();
    const hints = paragraph?.GetpSwpHints();
    if (!paragraph || !hints) continue;
    const anchor =
      node.GetIndex() <= endOfExtras ? node.GetFlyFormat()?.GetAnchor().GetContentAnchor() : null;
    const nodeIndex = anchor?.GetNode().GetIndex() ?? node.GetIndex();
    for (
      let index = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_INETFMT);
      index < hints.Count();
      index++
    ) {
      const attribute = hints.GetSortedByWhichAndStart(index);
      if (!(attribute instanceof SwTextINetFormat)) break;
      const start = attribute.GetStart();
      const text = GetURLFieldContentName(paragraph, attribute);
      if (text)
        entries.push({
          item: { text, attribute },
          nodeIndex,
          offset: anchor?.GetContentIndex() ?? start,
        });
    }
  }
  entries.sort(
    /** Preserves native raw node order when multiple links share an anchor. @param a - First link position. @param b - Second link position. @returns Document order. */
    (a, b) => a.nodeIndex - b.nodeIndex || a.offset - b.offset,
  );
  return entries.map(
    /** Projects each owned hyperlink after ordering. @param entry - Ordered range. @returns Navigator member. */
    (entry) => entry.item,
  );
}
