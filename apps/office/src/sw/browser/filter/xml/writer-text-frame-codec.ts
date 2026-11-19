/** @fileoverview Worker transport for native Writer fly frames and their text or graphic sections. */
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { RES_ANCHOR, RES_CNTNT } from "../../../inc/hintids";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { aFrameFormatSetRange } from "../../../source/core/bastyp/init";
import { SwPosition } from "../../../source/core/crsr/pam";
import { SwPaM } from "../../../source/core/crsr/pam";
import type { SwDoc } from "../../../source/core/doc/doc";
import { MakeFlySection } from "../../../source/core/doc/doclay";
import { SwStartNode } from "../../../source/core/docnode/node";
import { aNoTextNodeSetRange } from "../../../source/core/docnode/ndnotxt";
import type { SwGrfNode } from "../../../source/core/graphic/ndgrf";
import { SwFlyFrameFormat } from "../../../source/core/layout/atrfrm";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import {
  decodeSectionBlocks,
  encodeSectionBlocks,
  type WriterSectionBlock,
} from "./writer-document-content-codec";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "./item-codec";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import { Size } from "../../../../tools/inc/gen";

/** Native text anchors produced by the represented HTML table filter. */
type TextFlyAnchor = RndStdIds.FLY_AT_PARA | RndStdIds.FLY_AT_CHAR;
/** Native shared fly format with its actual attachment. */
interface WriterFlyFrameFormatRecord {
  readonly name: string;
  readonly anchor: Readonly<{ type: TextFlyAnchor; node: number; offset: number }>;
  readonly items: readonly SfxPoolItemSnapshot[];
}

/** Encoded embedded graphic and its original direct items. */
interface WriterGraphicNodeRecord {
  readonly bytes: Uint8Array;
  readonly mediaType: string;
  readonly width: number;
  readonly height: number;
  readonly items: readonly SfxPoolItemSnapshot[];
}

/** Native frame format and exactly one of its represented content sections. */
export type WriterTextFrameRecord = WriterFlyFrameFormatRecord &
  (
    | Readonly<{
        readonly blocks: readonly WriterSectionBlock[];
      }>
    | Readonly<{
        readonly graphic: WriterGraphicNodeRecord;
      }>
  );

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
    const items: SfxPoolItemSnapshot[] = [];
    for (const item of format.GetAttrSet().entries())
      if (item.Which() !== RES_ANCHOR && item.Which() !== RES_CNTNT)
        items.push(encodeSfxPoolItem(item));
    const formatRecord = {
      name: format.GetName(),
      anchor: { type, node, offset: anchor.GetAnchorContentOffset() },
      items,
    };
    const graphic = document
      .GetNodes()
      .at(start.GetIndex() + 1)
      .GetGrfNode();
    if (graphic) {
      frames.push({ ...formatRecord, graphic: encodeGraphicNode(graphic) });
      yield;
    } else {
      const blocks = yield* encodeSectionBlocks(document, start, textOwners);
      frames.push({ ...formatRecord, blocks });
    }
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
      typeof record !== "object" ||
      record === null ||
      typeof record.name !== "string" ||
      !record.anchor ||
      !Array.isArray(record.items) ||
      ("graphic" in record
        ? "blocks" in record
        : !Array.isArray(record.blocks) || record.blocks.length === 0)
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
      decodeFlyItems(set, record.items);
      const format =
        "graphic" in record
          ? insertGraphic(document, position, set, record.graphic)
          : MakeFlySection(document, type, position, set);
      format.SetFormatName(record.name);
      const content = format.GetContent().GetContentIdx()?.GetNode();
      if (!(content instanceof SwStartNode)) throw new Error("assert(Writer text-frame section)");
      start = content;
    } finally {
      set.Dispose();
      anchor.Dispose();
      position.Dispose();
    }

    if ("graphic" in record) yield;
    else yield* decodeSectionBlocks(document, start, record.blocks, textOwners);
  }
}

/** Captures the original graphic independently of its Writer fly format. @param node - Actual graphic content. @returns Transfer record. */
function encodeGraphicNode(node: SwGrfNode): WriterGraphicNodeRecord {
  const graphic = node.GetGraphic();
  const size = node.GetTwipSize();
  return {
    bytes: graphic.GetNativeData(),
    mediaType: graphic.mediaType,
    width: size.Width(),
    height: size.Height(),
    items: (node.GetpSwAttrSet()?.entries() ?? []).map(encodeSfxPoolItem),
  };
}

/** Checks item identity and restores original typed attributes inside their native owner. @param set - Actual target item set. @param items - Worker item records. @returns Nothing. */
function decodeFlyItems(set: SfxItemSet, items: readonly SfxPoolItemSnapshot[]): void {
  for (const snapshot of items) {
    if (
      !snapshot ||
      !Number.isInteger(snapshot.which) ||
      !set.GetRanges().some(
        /** Checks native WhichId membership. @param range - Native interval. @returns Whether admitted. */
        ([first, last]) => snapshot.which >= first && snapshot.which <= last,
      ) ||
      snapshot.which === RES_ANCHOR ||
      snapshot.which === RES_CNTNT
    )
      throw new Error("Stored Writer text-frame item is invalid.");
    const item = decodeSfxPoolItem(set.GetPool(), snapshot);
    try {
      set.Put(item);
    } finally {
      item.Dispose();
    }
  }
}

/** Recreates embedded data and attaches it through the real content operation. @param document - Destination Writer. @param position - Actual native anchor. @param frameItems - Frame attributes. @param record - Transferred graphic record. @returns Registered image fly format. */
function insertGraphic(
  document: SwDoc,
  position: SwPosition,
  frameItems: SfxItemSet,
  record: WriterGraphicNodeRecord,
): SwFlyFrameFormat {
  if (
    !record ||
    !ArrayBuffer.isView(record.bytes) ||
    Object.prototype.toString.call(record.bytes) !== "[object Uint8Array]" ||
    record.bytes.length === 0 ||
    typeof record.mediaType !== "string" ||
    !/^image\/[\w.+-]+$/u.test(record.mediaType) ||
    !Number.isSafeInteger(record.width) ||
    !Number.isSafeInteger(record.height) ||
    record.width < 0 ||
    record.height < 0 ||
    !Array.isArray(record.items)
  )
    throw new Error("Stored Writer graphic frame is invalid.");
  const embedded = new Graphic(
    record.bytes,
    record.mediaType,
    new Size(record.width, record.height),
  );
  const attributes = new SfxItemSet(document.GetAttrPool(), aNoTextNodeSetRange);
  const selection = new SwPaM(position);
  try {
    decodeFlyItems(attributes, record.items);
    return document
      .GetDocumentContentOperationsManager()
      .InsertGraphic(selection, embedded, frameItems, attributes.Count() ? attributes : undefined);
  } finally {
    selection.Dispose();
    attributes.Dispose();
  }
}
