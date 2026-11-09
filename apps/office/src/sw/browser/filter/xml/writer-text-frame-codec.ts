/** @fileoverview Worker transport for native HTML-imported Writer text fly frames and their section ownership. */
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { RES_ANCHOR, RES_CNTNT } from "../../../inc/hintids";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { aFrameFormatSetRange } from "../../../source/core/bastyp/init";
import { SwPosition } from "../../../source/core/crsr/pam";
import type { SwDoc } from "../../../source/core/doc/doc";
import { MakeFlySection } from "../../../source/core/doc/doclay";
import { SwStartNode, SwTableNode } from "../../../source/core/docnode/node";
import { SwFlyFrameFormat } from "../../../source/core/layout/atrfrm";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import {
  decodeTextNode,
  decodeWriterTableSteps,
  encodeTextNode,
  encodeWriterTableSteps,
  sectionTextNodes,
  type WriterTextNodeRecord,
  type WriterTableRecord,
} from "./writer-document-content-codec";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";

/** Native text anchors produced by the represented HTML table filter. */
type TextFlyAnchor = RndStdIds.FLY_AT_PARA | RndStdIds.FLY_AT_CHAR;
/** An actual direct child of the fly section. */
type WriterTextFrameBlock =
  { readonly text: WriterTextNodeRecord } | { readonly table: WriterTableRecord };

/** Native text-frame value record with its actual anchor and ordered section blocks. */
export interface WriterTextFrameRecord {
  readonly name: string;
  readonly anchor: Readonly<{ type: TextFlyAnchor; node: number; offset: number }>;
  readonly items: readonly SfxPoolItemSnapshot[];
  readonly blocks: readonly WriterTextFrameBlock[];
}

/** Encodes the Writer text fly sections, adding each section's text owners for later anchors and bookmarks. @param document - Actual document. @param textOwners - Body and preceding fly text nodes. @returns Cloneable native text-frame records. */
export function* encodeTextFrames(
  document: SwDoc,
  textOwners: SwTextNode[],
): Generator<void, WriterTextFrameRecord[]> {
  const frames: WriterTextFrameRecord[] = [];
  for (const format of document.GetSpzFrameFormats()) {
    if (!(format instanceof SwFlyFrameFormat)) continue;
    const start = format.GetContent().GetContentIdx()?.GetNode();
    if (
      !(start instanceof SwStartNode) ||
      start.GetStartNodeType() !== SwStartNodeType.SwFlyStartNode
    )
      continue;
    const anchor = format.GetAnchor();
    const type = anchor.GetAnchorId();
    const text = anchor.GetAnchorNode()?.GetTextNode();
    const node = text ? textOwners.indexOf(text) : -1;
    if (node < 0 || (type !== RndStdIds.FLY_AT_PARA && type !== RndStdIds.FLY_AT_CHAR))
      throw new Error("Writer text-frame anchor cannot be transported.");
    const content = document.nodes.GetSectionContent(start);
    const blocks: WriterTextFrameBlock[] = [];
    for (const block of content) {
      blocks.push(
        block instanceof SwTableNode
          ? { table: yield* encodeWriterTableSteps(document, block.GetTable()) }
          : { text: encodeTextNode(document, block) },
      );
      yield;
    }
    const items: SfxPoolItemSnapshot[] = [];
    for (const item of format.GetAttrSet().entries())
      if (item.Which() !== RES_ANCHOR && item.Which() !== RES_CNTNT)
        items.push(encodeSfxPoolItem(item));
    frames.push({
      name: format.GetName(),
      anchor: { type, node, offset: anchor.GetAnchorContentOffset() },
      items,
      blocks,
    });
    for (const owner of sectionTextNodes(content)) textOwners.push(owner);
  }
  return frames;
}

/** Restores native text frames and ordered contents through the same actual section creation used by HTML import. @param document - Actual destination. @param frames - Optional frame records. @param textOwners - Body and already-connected fly text owners. @returns Completion. */
export function* decodeTextFrames(
  document: SwDoc,
  frames: readonly WriterTextFrameRecord[] | undefined,
  textOwners: SwTextNode[],
): Generator<void, void> {
  if (frames === undefined) return;
  if (!Array.isArray(frames)) throw new Error("Stored Writer text frames are invalid.");
  for (const record of frames as readonly WriterTextFrameRecord[]) {
    if (
      !record ||
      typeof record.name !== "string" ||
      !record.anchor ||
      !Array.isArray(record.items) ||
      !Array.isArray(record.blocks) ||
      record.blocks.length === 0
    )
      throw new Error("Stored Writer text frame is invalid.");
    const { type, node, offset } = record.anchor;
    const owner = textOwners[node];
    if (
      (type !== RndStdIds.FLY_AT_PARA && type !== RndStdIds.FLY_AT_CHAR) ||
      !Number.isInteger(node) ||
      owner === undefined ||
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset > owner.Len() ||
      (type === RndStdIds.FLY_AT_PARA && offset !== 0)
    )
      throw new Error("Stored Writer text-frame anchor is invalid.");
    const position = new SwPosition(owner, offset);
    const anchor = new SwFormatAnchor(type);
    const set = new SfxItemSet(document.GetAttrPool(), aFrameFormatSetRange);
    let start: SwStartNode;
    try {
      anchor.SetAnchor(position);
      set.Put(anchor);
      for (const snapshot of record.items) {
        if (
          !snapshot ||
          !Number.isInteger(snapshot.which) ||
          !aFrameFormatSetRange.some(
            /** Allows only original attributes admitted by the real fly frame. @param range - Native Which interval. @returns Whether the attribute belongs. */
            ([first, last]) => snapshot.which >= first && snapshot.which <= last,
          ) ||
          snapshot.which === RES_ANCHOR ||
          snapshot.which === RES_CNTNT
        )
          throw new Error("Stored Writer text-frame item is invalid.");
        const item = decodeSfxPoolItem(document.GetAttrPool(), snapshot);
        try {
          set.Put(item);
        } finally {
          item.Dispose();
        }
      }
      const format = MakeFlySection(document, type, position, set);
      format.SetFormatName(record.name);
      const content = format.GetContent().GetContentIdx()?.GetNode();
      if (!(content instanceof SwStartNode)) throw new Error("assert(Writer text-frame section)");
      start = content;
    } finally {
      set.Dispose();
      anchor.Dispose();
      position.Dispose();
    }

    const end = start.EndOfSectionNode();
    let first = document.nodes.at(start.GetIndex() + 1).GetTextNode();
    for (const block of record.blocks as readonly WriterTextFrameBlock[]) {
      if (!block || typeof block !== "object")
        throw new Error("Stored Writer text-frame content is invalid.");
      if ("text" in block) {
        decodeTextNode(
          document,
          first ?? document.nodes.MakeTextNode(end, document.GetDfltTextFormatColl()),
          block.text,
        );
        first = null;
      } else if ("table" in block)
        yield* decodeWriterTableSteps(document, block.table, first ?? end);
      else throw new Error("Stored Writer text-frame content is invalid.");
      yield;
    }
    if (first !== null) document.nodes.RemoveNode(first.GetIndex(), 1, true);
    for (const text of sectionTextNodes(document.nodes.GetSectionContent(start)))
      textOwners.push(text);
  }
}
