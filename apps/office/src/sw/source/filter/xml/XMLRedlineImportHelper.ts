/** @fileoverview Native Writer XML redline admission over actual document positions and nodes. */
import { RedlineType } from "../../../../svx/inc/ctredlin";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import type { XMLTextRange } from "../../../../xmloff/inc/txtimp";
import type {
  XMLRedlineImportTarget,
  XMLRedlineInfo,
} from "../../../../xmloff/source/text/XMLChangedRegionImportContext";
import { RedlineFlags } from "../../../inc/IDocumentRedlineAccess";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { CheckNodesRange, SwNodeIndex, SwPosition } from "../../core/crsr/pam";
import type { SwDoc } from "../../core/doc/doc";
import {
  SwRangeRedline,
  SwRedlineData,
  InsertRedlineAuthor,
  type SwRedlineExtraData_FormatColl,
} from "../../core/doc/docredln";
import { SwTableNode, type SwStartNode } from "../../core/docnode/node";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwXTextRange } from "../../core/unocore/unoobj2";
import { SwXRedlineText } from "../../core/unocore/unoredline";

const redlineTypes = {
  insertion: RedlineType.Insert,
  deletion: RedlineType.Delete,
  "format-change": RedlineType.Format,
} as const;

/** The original per-ID import state, before both endpoints are known. */
interface RedlineInfo {
  readonly changes: XMLRedlineInfo[];
  start?: SwPosition | SwNodeIndex;
  end?: SwPosition | SwNodeIndex;
  content?: SwStartNode;
  outside?: boolean;
}

/** Attaches original XML changes to the actual Writer document redline table. */
export class XMLRedlineImportHelper implements XMLRedlineImportTarget {
  private readonly m_aRedlineMap = new Map<string, RedlineInfo>();

  /** Binds the original import document. @param document - Actual Writer owner. @param resolveStyle - Loaded ODF character-style owners. */
  constructor(
    private readonly document: SwDoc,
    private readonly resolveStyle: (name: string) => SwRedlineExtraData_FormatColl | undefined,
  ) {}

  /** Applies the original record-changes flag without changing display mode. @param enabled - Source setting. */
  SetRecordChanges(enabled: boolean): void {
    const owner = this.document.GetIDocumentRedlineAccess();
    const flags = owner.GetRedlineFlags();
    owner.SetRedlineFlags(enabled ? flags | RedlineFlags.On : flags & ~RedlineFlags.On);
  }

  /** Adds a change definition and retains its source-layer order. @param change - Parsed metadata. */
  RedlineAdd(change: XMLRedlineInfo): void {
    const existing = this.m_aRedlineMap.get(change.id);
    if (existing) existing.changes.push(change);
    else this.m_aRedlineMap.set(change.id, { changes: [change] });
  }

  /** Creates the original live text section in the document's redline range. @param id - Source change ID. @returns Cursor inside the saved section. */
  RedlineCreateText(id: string): SwXTextCursor | undefined {
    const entry = this.m_aRedlineMap.get(id);
    if (!entry || entry.content) return undefined;
    const nodes = this.document.GetNodes();
    entry.content = nodes.MakeTextSection(
      nodes.GetEndOfRedlines(),
      SwStartNodeType.SwNormalStartNode,
      this.document.GetTextFormatColl("default"),
    );
    return new SwXRedlineText(this.document, entry.content).createTextCursor();
  }

  /** Removes the unused trailing importer paragraph before reusing the body cursor. @param id - Source change ID. */
  RedlineFinishText(id: string): void {
    const content = this.m_aRedlineMap.get(id)?.content;
    if (!content) return;
    const nodes = content.GetNodes();
    const last = nodes.at(content.EndOfSectionIndex() - 1);
    if (last instanceof SwTextNode && last.Len() === 0 && last.GetIndex() > content.GetIndex() + 1)
      nodes.removeTextNode(last);
  }

  /** Captures a real document position using the original change identifier. @param id - Declared change ID. @param start - Use the leading endpoint. @param range - Actual UNO range. @param outside - Whether a structural boundary needs deferred completion. @param collapsed - Whether both endpoints are the same source marker. */
  RedlineSetCursor(
    id: string,
    start: boolean,
    range: XMLTextRange,
    outside: boolean,
    collapsed = false,
  ): void {
    const entry = this.m_aRedlineMap.get(id);
    if (!entry || !(range instanceof SwXTextRange)) return;
    const point = range.GetPaM().GetPoint();
    const key = start ? "start" : "end";
    entry[key]?.Dispose();
    const node = point.GetNode();
    if (outside) {
      const previous = node.GetNodes().at(node.GetIndex() - 1);
      const section = previous.IsEndNode() ? previous.StartOfSectionNode() : undefined;
      // The scoped body cursor stays on the paragraph after a connected table or section.
      entry[key] =
        !start && !collapsed && (section instanceof SwTableNode || section?.GetSectionNode())
          ? new SwPosition(previous)
          : new SwNodeIndex(previous);
    } else entry[key] = new SwPosition(node, point.GetContentIndex(), "redline", "before");
    entry.outside ||= outside;
    if (entry.start && entry.end && !entry.outside) this.InsertIntoDocument(id, entry);
  }

  /** Completes an open structural redline after its target node exists. @param id - Source change identity. */
  RedlineAdjustStartNodeCursor(id: string): void {
    const entry = this.m_aRedlineMap.get(id);
    if (!entry) return;
    entry.outside = false;
    if (entry.start && entry.end) this.InsertIntoDocument(id, entry);
  }

  /** Completes recorded structural boundaries and drops incomplete definitions. */
  Finish(): void {
    for (const [id, entry] of this.m_aRedlineMap) {
      if (entry.start && entry.end) this.InsertIntoDocument(id, entry);
      else this.RemovePending(id, entry, true);
    }
    this.document.GetIDocumentRedlineAccess().ShowChanges();
  }

  /** Releases incomplete import anchors after parsing fails. */
  Dispose(): void {
    for (const [id, entry] of this.m_aRedlineMap) this.RemovePending(id, entry, false);
  }

  /** Resolves a native change metadata chain with the original legal combinations. @param entry - Definitions in source order. @param index - Current layer. @returns Owned model metadata. */
  private ConvertRedline(entry: RedlineInfo, index = 0): SwRedlineData {
    const change = entry.changes[index];
    if (!change) throw new Error("Missing Writer redline change metadata.");
    const next = entry.changes[index + 1];
    const combined =
      (next?.type === "deletion" && change.type === "format-change") ||
      (next?.type === "insertion" && change.type !== "insertion");
    const moved = /^\s*[+-]?\d+/u.exec(change.movedId)?.[0];
    const data = new SwRedlineData(
      redlineTypes[change.type],
      InsertRedlineAuthor(change.author),
      new DateTime(change.date),
      Number(moved ?? "0") >>> 0,
      change.comment,
      combined ? this.ConvertRedline(entry, index + 1) : undefined,
    );
    try {
      const extra =
        index === 0 && change.styleName ? this.resolveStyle(change.styleName) : undefined;
      if (extra)
        try {
          data.SetExtraData(extra);
        } finally {
          extra.Dispose();
        }
      return data;
    } catch (error) {
      data.Dispose();
      throw error;
    }
  }

  /** Promotes the ranged or saved change into the native document table. @param id - Source identity. @param entry - Completed import state. */
  private InsertIntoDocument(id: string, entry: RedlineInfo): void {
    const change = entry.changes[0];
    if (!entry.start || !entry.end || !change) return;
    const start = this.CopyPosition(entry.start);
    const end = this.CopyPosition(entry.end);
    try {
      const collapsed = start.compare(end) === 0;
      const content = entry.content;
      if ((collapsed && !content) || !CheckNodesRange(start.GetNode(), end.GetNode(), true)) {
        this.RemovePending(id, entry, true);
        return;
      }
      const redline = new SwRangeRedline(
        this.ConvertRedline(entry),
        end,
        collapsed ? undefined : start,
        !change.mergeLastParagraph,
      );
      if (content) redline.SetContentIdx(content);
      this.document.GetIDocumentRedlineAccess().GetRedlineTable().Insert(redline);
      this.RemovePending(id, entry, false);
    } finally {
      end.Dispose();
      start.Dispose();
    }
  }

  /** Resolves the previous-node index only after structural materialization. @param anchor - Borrowed range or node index. @returns Registered position. */
  private CopyPosition(anchor: SwPosition | SwNodeIndex): SwPosition {
    return anchor instanceof SwPosition
      ? anchor.clone()
      : new SwPosition(anchor.GetNodes().at(anchor.GetIndex() + 1), 0, "redline", "before");
  }

  /** Releases borrowed importer positions and an abandoned deletion section. @param id - Source identity. @param entry - Import state. @param removeContent - Whether the section has no surviving owner. */
  private RemovePending(id: string, entry: RedlineInfo, removeContent: boolean): void {
    entry.start?.Dispose();
    entry.end?.Dispose();
    this.m_aRedlineMap.delete(id);
    if (removeContent && entry.content)
      this.document.GetDocumentContentOperationsManager().DeleteSection(entry.content);
  }
}
