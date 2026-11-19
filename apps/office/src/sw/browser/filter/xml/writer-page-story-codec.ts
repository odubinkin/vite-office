/** @fileoverview Worker transfer for native page header and footer frames and their shared section identities. */
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import { RES_ANCHOR, RES_CNTNT, RES_FOOTER, RES_HEADER } from "../../../inc/hintids";
import { SwStartNodeType } from "../../../inc/ndtyp";
import type { SwStartNode } from "../../../source/core/docnode/node";
import type { SwDoc } from "../../../source/core/doc/doc";
import type { SwFrameFormat } from "../../../source/core/layout/atrfrm";
import type { SwPageDesc } from "../../../source/core/layout/pagedesc";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import {
  decodeSectionBlocks,
  encodeSectionBlocks,
  type WriterSectionBlock,
} from "./writer-document-content-codec";
import { decodeSfxItemSet, encodeSfxPoolItem } from "./item-codec";

/** One direct header/footer item and its optional actual frame. */
type PageStoryItem = boolean | Readonly<{ frame: number; active: boolean }>;
/** Stable original frame binding within one page descriptor. */
type PageStoryBinding = { readonly header?: PageStoryItem; readonly footer?: PageStoryItem };
/** One unique bound frame and its native section. */
type PageStory = {
  readonly kind: "header" | "footer";
  readonly name: string;
  readonly items: readonly SfxPoolItemSnapshot[];
  readonly blocks: readonly WriterSectionBlock[];
};
/** Four ordered bindings per descriptor with shared native frames encoded once. */
export interface WriterPageStories {
  readonly bindings: readonly (readonly PageStoryBinding[])[];
  readonly stories: readonly PageStory[];
}

/** Original fixed frame order used for page-style snapshots. @param page - Page descriptor. @returns Native frame variants. */
function variants(page: SwPageDesc): readonly SwFrameFormat[] {
  return [page.GetMaster(), page.GetLeft(), page.GetFirstMaster(), page.GetFirstLeft()];
}

/** Rejects section and owner pointers in the ordinary item snapshot channel. @param which - Native WhichId. @returns Whether scalar snapshot transfer is allowed. */
function scalarFrameItem(which: number): boolean {
  return (
    which !== RES_ANCHOR && which !== RES_CNTNT && which !== RES_HEADER && which !== RES_FOOTER
  );
}

/** Reads the actual connected header or footer section. @param frame - Native owner. @param request - Expected story kind. @returns Original section start. */
function section(frame: SwFrameFormat, request: "header" | "footer"): SwStartNode {
  const start = frame.GetContent(false).GetContentIdx()?.GetNode();
  if (
    !start?.IsStartNode() ||
    start.GetStartNodeType() !==
      (request === "header" ? SwStartNodeType.SwHeaderStartNode : SwStartNodeType.SwFooterStartNode)
  )
    throw new Error("Writer page story section is invalid.");
  return start;
}

/** Encodes unique native formats in page and variant order, then extends bookmark indexing. @param doc - Actual document. @param textOwners - Existing ordered text nodes. @returns Optional page story graph. */
export function* encodePageStories(
  doc: SwDoc,
  textOwners: SwTextNode[],
): Generator<void, WriterPageStories | undefined> {
  const bindings: PageStoryBinding[][] = [];
  const stories: PageStory[] = [];
  const indices = new Map<SwFrameFormat, number>();
  let hasStories = false;
  /** Encodes one item's flag or index into the shared story list. @param item - Borrowed native item. @returns Optional reference. */
  function* bind(item: unknown): Generator<void, PageStoryItem | undefined> {
    if (!(item instanceof SwFormatHeader || item instanceof SwFormatFooter)) return undefined;
    hasStories = true;
    const kind = item instanceof SwFormatHeader ? "header" : "footer";
    const frame = item instanceof SwFormatHeader ? item.GetHeaderFormat() : item.GetFooterFormat();
    if (!frame) return item.IsActive();
    const existing = indices.get(frame);
    if (existing !== undefined) {
      if (stories[existing]?.kind !== kind)
        throw new Error("Writer page story kind is inconsistent.");
      return { frame: existing, active: item.IsActive() };
    }
    const start = section(frame, kind);
    const items: SfxPoolItemSnapshot[] = [];
    for (const value of frame.GetAttrSet().entries())
      if (scalarFrameItem(value.Which())) items.push(encodeSfxPoolItem(value));
    const blocks = yield* encodeSectionBlocks(doc, start, textOwners);
    const index = stories.length;
    stories.push({ kind, name: frame.GetName(), items, blocks });
    indices.set(frame, index);
    return { frame: index, active: item.IsActive() };
  }
  for (let index = 0; index < doc.GetPageDescCnt(); index++) {
    const row: PageStoryBinding[] = [];
    for (const frame of variants(doc.GetPageDesc(index))) {
      const set = frame.GetAttrSet();
      const header = yield* bind(set.GetItemIfSet(RES_HEADER, false));
      const footer = yield* bind(set.GetItemIfSet(RES_FOOTER, false));
      row.push({
        ...(header === undefined ? {} : { header }),
        ...(footer === undefined ? {} : { footer }),
      });
    }
    bindings.push(row);
  }
  return hasStories ? { bindings, stories } : undefined;
}

/** Restores native sections after style, number and body restoration, then attaches page-format items. @param doc - Actual destination. @param record - Optional graph transfer. @param textOwners - Existing ordered bookmark owners. @returns Completion. */
export function* decodePageStories(
  doc: SwDoc,
  record: WriterPageStories | undefined,
  textOwners: SwTextNode[],
): Generator<void, void> {
  if (record === undefined) return;
  if (
    !record ||
    !Array.isArray(record.stories) ||
    !Array.isArray(record.bindings) ||
    record.bindings.length !== doc.GetPageDescCnt()
  )
    throw new Error("Stored Writer page story graph is invalid.");
  const items: (SwFormatHeader | SwFormatFooter)[] = [];
  const linked = new Set<number>();
  try {
    for (const story of record.stories as readonly PageStory[]) {
      if (
        !story ||
        (story.kind !== "header" && story.kind !== "footer") ||
        typeof story.name !== "string" ||
        !Array.isArray(story.items) ||
        !Array.isArray(story.blocks)
      )
        throw new Error("Stored Writer page story is invalid.");
      const header = story.kind === "header";
      const frame = doc
        .getIDocumentLayoutAccess()
        .MakeLayoutFormat(header ? RndStdIds.HEADER : RndStdIds.FOOTER);
      items.push(header ? new SwFormatHeader(frame) : new SwFormatFooter(frame));
      frame.SetFormatName(story.name);
      const set = frame.GetAttrSet();
      const seen = new Set<number>();
      for (const item of story.items) {
        if (
          !item ||
          !Number.isInteger(item.which) ||
          !scalarFrameItem(item.which) ||
          seen.has(item.which) ||
          !set.GetRanges().some(
            /** Checks that the native frame admits this item. @param range - Which span. @returns Whether accepted. */
            ([first, last]) => item.which >= first && item.which <= last,
          )
        )
          throw new Error("Stored Writer page story item is invalid.");
        seen.add(item.which);
      }
      decodeSfxItemSet(set, story.items);
      yield* decodeSectionBlocks(doc, section(frame, story.kind), story.blocks, textOwners);
    }
    /** Resolves a direct item without duplicating a shared content frame. @param frame - Owning page variant. @param kind - Header or footer identity. @param reference - Stored binding. @returns Nothing. */
    function link(
      frame: SwFrameFormat,
      kind: "header" | "footer",
      reference: PageStoryItem | undefined,
    ): void {
      if (reference === undefined) return;
      if (typeof reference === "boolean") {
        frame
          .GetAttrSet()
          .Put(
            kind === "header" ? new SwFormatHeader(reference) : new SwFormatFooter(reference),
            true,
          );
        return;
      }
      if (
        !reference ||
        typeof reference !== "object" ||
        !Number.isInteger(reference.frame) ||
        typeof reference.active !== "boolean"
      )
        throw new Error("Stored Writer page story reference is invalid.");
      const item = items[reference.frame];
      if (!item || item.Which() !== (kind === "header" ? RES_HEADER : RES_FOOTER))
        throw new Error("Stored Writer page story reference is invalid.");
      if (reference.active) frame.GetAttrSet().Put(item);
      else {
        const inactive =
          item instanceof SwFormatHeader ? new SwFormatHeader(false) : new SwFormatFooter(false);
        const format =
          item instanceof SwFormatHeader ? item.GetHeaderFormat() : item.GetFooterFormat();
        if (!format) throw new Error("Stored Writer page story frame is missing.");
        inactive.RegisterToFormat(format);
        frame.GetAttrSet().Put(inactive, true);
      }
      linked.add(reference.frame);
    }
    for (let page = 0; page < record.bindings.length; page++) {
      const row = record.bindings[page];
      if (!Array.isArray(row) || row.length !== 4)
        throw new Error("Stored Writer page story bindings are invalid.");
      const frames = variants(doc.GetPageDesc(page));
      for (const [index, frame] of frames.entries()) {
        const binding = row[index] as PageStoryBinding;
        if (!binding || typeof binding !== "object" || Array.isArray(binding))
          throw new Error("Stored Writer page story binding is invalid.");
        link(frame, "header", binding.header);
        link(frame, "footer", binding.footer);
      }
    }
    if (linked.size !== items.length) throw new Error("Stored Writer page story has no owner.");
  } finally {
    for (const item of items) item.Dispose();
  }
}
