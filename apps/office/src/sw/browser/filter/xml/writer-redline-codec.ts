/** @fileoverview Transfers live Writer redlines across the browser Worker boundary. */
import { DateTime as UnoDateTime } from "../../../../offapi/com/sun/star/util/DateTime";
import { RedlineType } from "../../../../svx/inc/ctredlin";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { RedlineFlags } from "../../../inc/IDocumentRedlineAccess";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import type { SfxPoolItemSnapshot } from "../../../../svl/source/items/poolitem";
import { findCharacterStyle } from "../../../source/core/doc/docfmt";
import { SwFormatCharFormat } from "../../../source/core/txtnode/fmtatr2";
import { decodeSfxItemSet, encodeSfxItemSet } from "./item-codec";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwPosition } from "../../../source/core/crsr/pam";
import type { SwDoc } from "../../../source/core/doc/doc";
import {
  SwRangeRedline,
  SwRedlineData,
  SwRedlineExtraData_FormatColl,
  REDLINE_FORMAT_RANGES,
  GetRedlineAuthor,
  InsertRedlineAuthor,
} from "../../../source/core/doc/docredln";
import { SwTableNode, type SwStartNode } from "../../../source/core/docnode/node";
import type { SwTextNode } from "../../../source/core/txtnode/ndtxt";
import {
  decodeSectionBlocks,
  encodeSectionBlocks,
  type WriterSectionBlock,
} from "./writer-document-content-codec";

/** Native position expressed in graph text-owner order. */
type Endpoint = Readonly<{
  nodeIndex: number;
  offset: number;
  boundary?: "start" | "end";
  sectionDepth?: number;
}>;
/** Scalar components of the native local timestamp. */
type Timestamp = readonly [
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  nanoseconds: number,
];

/** One change entry in the original metadata chain. */
interface Change {
  readonly type: RedlineType;
  readonly author: string;
  readonly timestamp: Timestamp;
  readonly comment: string;
  readonly movedId: number;
  readonly previousFormat?: readonly SfxPoolItemSnapshot[];
  readonly styleName?: string;
}

/** Tracked range and optional detached content. */
interface Range {
  readonly point: Endpoint;
  readonly mark?: Endpoint;
  readonly deleteLastPara: boolean;
  readonly changes: readonly Change[];
  readonly content?: readonly WriterSectionBlock[];
}

/** Exported graph record for the original table and flags. */
export interface WriterRedlineRecord {
  readonly flags: RedlineFlags;
  readonly ranges: readonly Range[];
}

/** Adds saved deletion text owners before exporting cross-owner anchors. @param document - Actual document. @param owners - Graph owner ordering. @returns Encoded sections in redline order. */
export function* encodeRedlineSections(
  document: SwDoc,
  owners: SwTextNode[],
): Generator<void, Map<SwRangeRedline, WriterSectionBlock[]>> {
  const sections = new Map<SwRangeRedline, WriterSectionBlock[]>();
  for (const range of document.GetIDocumentRedlineAccess().GetRedlineTable().entries()) {
    const start = range.GetContentStart();
    if (start) sections.set(range, yield* encodeSectionBlocks(document, start, owners));
  }
  return sections;
}

/** Exposes live endpoints against all encoded text owners. @param document - Actual document. @param owners - Complete owner ordering. @param sections - Encoded deletion bodies. @returns Transfer record if used. */
export function encodeRedlines(
  document: SwDoc,
  owners: readonly SwTextNode[],
  sections: ReadonlyMap<SwRangeRedline, WriterSectionBlock[]>,
): WriterRedlineRecord | undefined {
  const access = document.GetIDocumentRedlineAccess();
  const flags = access.GetRedlineFlags();
  const ranges: Range[] = [];
  /** Maps a registered endpoint to the public graph's node ordering. @param position - Native position. @returns Primitive endpoint. */
  function endpoint(position: SwPosition): Endpoint {
    const node = position.GetNode();
    const text = node.GetTextNode();
    if (text) {
      const nodeIndex = owners.indexOf(text);
      if (nodeIndex < 0) throw new Error("Writer redline is missing its graph text owner.");
      return { nodeIndex, offset: position.GetContentIndex() };
    }
    const section = node.IsEndNode() ? node.StartOfSectionNode() : node;
    if (!section.IsStartNode() || !(section instanceof SwTableNode || section.GetSectionNode()))
      throw new Error("Writer redline is missing its graph structural owner.");
    const from = section.GetIndex();
    const to = section.EndOfSectionIndex();
    const nodeIndex = owners.findIndex(
      /** Uses a real descendant text owner as the graph anchor. @param candidate - Graph text owner. @returns Whether it belongs to this block. */
      (candidate) => candidate.GetIndex() > from && candidate.GetIndex() < to,
    );
    const owner = owners[nodeIndex];
    if (!owner) throw new Error("Writer redline structural block has no graph text owner.");
    let sectionDepth = 0;
    for (
      let current = owner.StartOfSectionNode();
      current !== section;
      current = current.StartOfSectionNode()
    )
      sectionDepth++;
    return { nodeIndex, offset: 0, boundary: node.IsEndNode() ? "end" : "start", sectionDepth };
  }
  for (const range of access.GetRedlineTable().entries()) {
    const changes: Change[] = [];
    for (
      let data: SwRedlineData | undefined = range.GetRedlineData();
      data;
      data = data.GetNext()
    ) {
      const stamp = data.GetTimeStamp();
      const items = data.GetExtraData()?.GetItemSet();
      changes.push({
        type: data.GetType(),
        author: GetRedlineAuthor(data.GetAuthor()),
        timestamp: [
          stamp.GetYear(),
          stamp.GetMonth(),
          stamp.GetDay(),
          stamp.GetHour(),
          stamp.GetMin(),
          stamp.GetSec(),
          stamp.GetNanoSec(),
        ],
        comment: data.GetComment(),
        movedId: data.GetMovedID(),
        ...(items ? { previousFormat: encodeSfxItemSet(items) } : {}),
      });
    }
    const content = sections.get(range);
    ranges.push({
      point: endpoint(range.GetPoint()),
      ...(range.HasMark() ? { mark: endpoint(range.GetMark()) } : {}),
      deleteLastPara: range.IsDeleteLastPara(),
      changes,
      ...(content === undefined ? {} : { content }),
    });
  }
  return ranges.length || flags !== RedlineFlags.ShowMask ? { flags, ranges } : undefined;
}

/** Restores saved text nodes before decoding anchors that refer to them. @param document - Destination. @param owners - Graph owner ordering. @param record - Redline record, absent in older graphs. @returns Section roots in graph order. */
export function* decodeRedlineSections(
  document: SwDoc,
  owners: SwTextNode[],
  record?: WriterRedlineRecord,
): Generator<void, Map<Range, SwStartNode>> {
  const sections = new Map<Range, SwStartNode>();
  if (record === undefined) return sections;
  if (!record || !Array.isArray(record.ranges) || !Number.isInteger(record.flags))
    throw new Error("Stored Writer redline table is invalid.");
  const nodes = document.GetNodes();
  for (const range of record.ranges) {
    if (
      !range ||
      !Array.isArray(range.changes) ||
      !range.changes.length ||
      typeof range.deleteLastPara !== "boolean"
    )
      throw new Error("Stored Writer redline range is invalid.");
    if (range.content === undefined) continue;
    const section = nodes.MakeTextSection(
      nodes.GetEndOfRedlines(),
      SwStartNodeType.SwNormalStartNode,
      document.GetTextFormatColl("default"),
    );
    yield* decodeSectionBlocks(document, section, range.content, owners);
    sections.set(range, section);
  }
  return sections;
}

/** Rebinds range owners and their layered metadata to the restored document. @param document - Destination. @param owners - Complete text ordering. @param sections - Restored deletion owners. @param record - Redline record. @returns Nothing. */
export function restoreRedlines(
  document: SwDoc,
  owners: readonly SwTextNode[],
  sections: ReadonlyMap<Range, SwStartNode>,
  record?: WriterRedlineRecord,
): void {
  if (record === undefined) return;
  const access = document.GetIDocumentRedlineAccess();
  /** Checks and rebinds an encoded range endpoint. @param endpoint - Encoded position. @returns Registered position. */
  function bind(endpoint: Endpoint): SwPosition {
    const node = endpoint && owners[endpoint.nodeIndex];
    if (
      !node ||
      !Number.isInteger(endpoint.offset) ||
      endpoint.offset < 0 ||
      endpoint.offset > node.Len()
    )
      throw new Error("Stored Writer redline position is invalid.");
    if (endpoint.boundary !== undefined) {
      const depth = endpoint.sectionDepth;
      if (
        (endpoint.boundary !== "start" && endpoint.boundary !== "end") ||
        depth === undefined ||
        !Number.isInteger(depth) ||
        depth < 0 ||
        endpoint.offset !== 0
      )
        throw new Error("Stored Writer redline boundary is invalid.");
      let section = node.StartOfSectionNode();
      for (let level = 0; level < depth; level++) {
        const parent = section.StartOfSectionNode();
        if (parent === section)
          throw new Error("Stored Writer redline boundary exceeds its text owner.");
        section = parent;
      }
      if (!(section instanceof SwTableNode || section.GetSectionNode()))
        throw new Error("Stored Writer redline boundary has no structural owner.");
      return new SwPosition(endpoint.boundary === "start" ? section : section.EndOfSectionNode());
    }
    return new SwPosition(node, endpoint.offset, "redline", "before");
  }
  for (const range of record.ranges) {
    let data: SwRedlineData | undefined;
    let point: SwPosition | undefined;
    let mark: SwPosition | undefined;
    try {
      for (const change of [...range.changes].reverse()) {
        if (
          !change ||
          typeof change.author !== "string" ||
          typeof change.comment !== "string" ||
          (change.styleName !== undefined && typeof change.styleName !== "string") ||
          (change.previousFormat !== undefined && !Array.isArray(change.previousFormat)) ||
          !Number.isInteger(change.movedId) ||
          ![RedlineType.Insert, RedlineType.Delete, RedlineType.Format].includes(change.type) ||
          !Array.isArray(change.timestamp) ||
          change.timestamp.length !== 7 ||
          !change.timestamp.every(Number.isInteger)
        )
          throw new Error("Stored Writer change metadata is invalid.");
        const [year, month, day, hour, minute, second, nano] = change.timestamp;
        data = new SwRedlineData(
          change.type,
          InsertRedlineAuthor(change.author),
          new DateTime(new UnoDateTime(nano, second, minute, hour, day, month, year, false)),
          change.movedId,
          change.comment,
          data,
        );
        if (change.previousFormat !== undefined || change.styleName)
          restorePreviousFormat(document, data, change);
      }
      if (!data) throw new Error("Stored Writer change metadata is missing.");
      point = bind(range.point);
      mark = range.mark === undefined ? undefined : bind(range.mark);
      const restored = new SwRangeRedline(data, point, mark, range.deleteLastPara);
      const section = sections.get(range);
      if (section) restored.SetContentIdx(section);
      access.GetRedlineTable().Insert(restored);
      data = undefined;
    } finally {
      mark?.Dispose();
      point?.Dispose();
      data?.Dispose();
    }
  }
  access.SetRedlineFlags(record.flags);
}

/** Restores pool items and the named-character style reference from the graph. @param document - Destination. @param data - Native change. @param change - Encoded formatting. @returns Nothing. */
function restorePreviousFormat(document: SwDoc, data: SwRedlineData, change: Change): void {
  const items = new SfxItemSet(document.GetAttrPool(), REDLINE_FORMAT_RANGES);
  try {
    if (change.previousFormat !== undefined) decodeSfxItemSet(items, change.previousFormat);
    else if (change.styleName) {
      const style = findCharacterStyle(document, change.styleName);
      if (style) items.Put(new SwFormatCharFormat(style));
    }
    if (!items.Count()) return;
    const handle = document
      .GetIStyleAccess()
      .getAutomaticStyle(items, SwAutoStyleFamily.AUTO_STYLE_CHAR);
    try {
      const extra = new SwRedlineExtraData_FormatColl(handle);
      try {
        data.SetExtraData(extra);
      } finally {
        extra.Dispose();
      }
    } finally {
      releaseStyleHandle(handle);
    }
  } finally {
    items.Dispose();
  }
}
