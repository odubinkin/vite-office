/** @fileoverview Owns Writer bookmarks and imported soft-page positions at the pinned docbm.cxx boundary. */

import { MarkBase, UnoMark } from "../crsr/bookmark";
import { AnnotationMark } from "../crsr/annotationmark";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import type { SwFormatField } from "../../../inc/fmtfld";
import { SwPaM } from "../crsr/pam";
import { getUniqueBookmarkName } from "./bookmark-name";
import { SwPosition } from "../crsr/pam";
import type { SwDoc } from "./doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwContentNode, type SwNode } from "../docnode/node";
import { SwNodes } from "../docnode/nodes";
import { SwNodeIndex } from "../crsr/pam";

/** Named bookmark with the native registered mark positions. */
export class SwBookmark extends MarkBase {
  private hidden = false;
  private hideCondition = "";
  /** Creates the document-owned bookmark. @param name - Unique document name. @param range - Native selection. @returns Nothing. */
  public constructor(
    private name: string,
    range: SwPaM,
  ) {
    super(range);
  }

  /** Returns the name. @returns Bookmark name. */
  public GetName(): string {
    return this.name;
  }

  /** Renames the bookmark after document-level validation. @param name - New name. @returns Nothing. */
  public SetName(name: string): void {
    this.name = name;
  }

  /** Reads the stored bookmark visibility flag. @returns Hidden flag. */
  public IsHidden(): boolean {
    return this.hidden;
  }

  /** Assigns the bookmark visibility flag. @param hidden - Requested flag. @returns Nothing. */
  public Hide(hidden: boolean): void {
    this.hidden = hidden;
  }

  /** Reads the stored hide condition. @returns Unevaluated condition. */
  public GetHideCondition(): string {
    return this.hideCondition;
  }

  /** Stores the condition until the native condition consumer evaluates it. @param condition - Expression. @returns Nothing. */
  public SetHideCondition(condition: string): void {
    this.hideCondition = condition;
  }
}

/** Native mark families registered in the document index. */
type DocumentMark = SwBookmark | UnoMark | AnnotationMark;

/** Document-owned subset of LibreOffice's MarkManager plus retained soft pagination hints. */
export class DocumentMarkAccess {
  private readonly unoMarks = new Set<UnoMark>();
  private readonly annotationMarks = new Map<SwFormatField, AnnotationMark>();
  private readonly m_vAllMarks: DocumentMark[] = [];
  /** Original start-order comparator for represented collapsed and UNO marks; cross-reference marks are not in this core family. @param mark - Actual borrowed mark. @returns Native start position. */
  private static MarkStart(mark: DocumentMark): SwPosition {
    return mark.GetMarkStart();
  }
  /** Original lower_bound insertion puts a new equal-start mark before existing ones. @param mark - Actual borrowed native mark. @returns Nothing. */
  private InsertMarkSorted(mark: DocumentMark): void {
    let first = 0,
      last = this.m_vAllMarks.length;
    const start = DocumentMarkAccess.MarkStart(mark);
    while (first < last) {
      const middle = (first + last) >>> 1,
        current = this.m_vAllMarks[middle];
      if (!current) throw new Error("assert(mark vector)");
      if (DocumentMarkAccess.MarkStart(current).compare(start) < 0) first = middle + 1;
      else last = middle;
    }
    this.m_vAllMarks.splice(first, 0, mark);
  }
  /** Removes a borrowed vector reference before its actual owner is destroyed. @param mark - Actual native mark. @returns Nothing. */
  private RemoveMark(mark: DocumentMark): void {
    const index = this.m_vAllMarks.indexOf(mark);
    if (index >= 0) this.m_vAllMarks.splice(index, 1);
  }
  /** Source all-mark view includes internal UNO marks while the UI bookmark catalog remains separate. Registered positions are reconciled in original start order on access. @returns Borrowed native vector. */
  public GetAllMarks(): readonly DocumentMark[] {
    this.m_vAllMarks.sort(
      /** Original start ordering for the current native families. @param first - Actual mark. @param second - Actual mark. @returns Source order. */ (
        first,
        second,
      ) => DocumentMarkAccess.MarkStart(first).compare(DocumentMarkAccess.MarkStart(second)),
    );
    return this.m_vAllMarks;
  }

  /** Creates a native internal UNO_BOOKMARK, outside user-visible bookmark enumeration. @param range - Original registered range. @returns Document-owned mark. */
  public MakeUnoMark(range: SwPaM): UnoMark {
    this.assertNode(range.Start().GetNode() as SwTextNode);
    this.assertNode(range.End().GetNode() as SwTextNode);
    const mark = new UnoMark(range);
    this.unoMarks.add(mark);
    this.InsertMarkSorted(mark);
    return mark;
  }
  /** Stores the registered range of an attached annotation. @param range - Range ending after the annotation marker. @param owner - Owning field or name from a legacy snapshot. @returns Document-owned mark. */
  public MakeAnnotationMark(range: SwPaM, owner: SwFormatField | string): AnnotationMark {
    this.assertNode(range.Start().GetNode() as SwTextNode);
    this.assertNode(range.End().GetNode() as SwTextNode);
    const end = range.End();
    const field =
      typeof owner === "string"
        ? end
            .GetNode()
            .GetTextNode()
            ?.GetpSwpHints()
            ?.GetTextAttrForCharAt(end.GetContentIndex() - 1, RES_TXTATR_ANNOTATION)
            ?.GetAttr()
        : owner;
    if (!field) throw new Error("Writer annotation mark has no trailing annotation field.");
    this.DeleteAnnotationMark(field);
    const mark = new AnnotationMark(range, field, typeof owner === "string" ? owner : undefined);
    this.annotationMarks.set(field, mark);
    this.InsertMarkSorted(mark);
    this.document.NotifyModelChange({ kind: "mark-changed" });
    return mark;
  }
  /** Looks up the marked span of a field. @param field - Owning annotation format. @returns Borrowed annotation mark. */
  public GetAnnotationMark(field: SwFormatField): AnnotationMark | undefined {
    return this.annotationMarks.get(field);
  }
  /** Lists attached annotation ranges in document order. @returns Borrowed ranges. */
  public GetAnnotationMarks(): readonly AnnotationMark[] {
    return this.GetAllMarks().filter(
      (mark): mark is AnnotationMark => mark instanceof AnnotationMark,
    );
  }

  /** Finds the first registered annotation with an authored name. @param name - Annotation name. @returns Borrowed range. */
  public FindAnnotationMark(name: string): AnnotationMark | undefined {
    return this.GetAnnotationMarks().find((mark) => mark.GetName() === name);
  }

  /** Releases the registered range when its owning field is erased. @param field - Field leaving the document. @returns Nothing. */
  public DeleteAnnotationMark(field: SwFormatField): void {
    const mark = this.annotationMarks.get(field);
    if (!mark) return;
    this.annotationMarks.delete(field);
    this.RemoveMark(mark);
    mark.Dispose();
  }

  /** Original repositionMark for current collapsed bookmarks and internal UNO ranges. Frame invalidation and other mark families have no represented owners here. Unlike editing, reposition does not publish modified/undo state. @param mark - Actual document-managed mark or native null. @param range - Original new positions. @returns Nothing. */
  public RepositionMark(mark: DocumentMark | null, range: SwPaM): void {
    if (!mark) return;
    if (mark.GetMarkPos().GetNode().GetNodes() !== this.document.GetNodes())
      throw new Error("assert(mark belongs to document)");
    const ordered = new SwPaM(range.Start(), range.HasMark() ? range.End() : undefined);
    try {
      mark.SetPositions(ordered);
    } finally {
      ordered.Dispose();
    }
    this.GetAllMarks();
  }
  /** Deletes one internal range mark without recording a document edit. @param mark - Owned mark. @returns Nothing. */
  public DeleteUnoMark(mark: UnoMark): void {
    if (this.unoMarks.delete(mark)) {
      this.RemoveMark(mark);
      mark.Dispose();
    }
  }
  /** Original deleteMarks for current collapsed bookmarks and internal UNO marks, without SaveBookmark capture. Other mark/redline/field families have no current owners. Boundary predicates, UNO start-touch exception, endpoint expulsion, cross-cell collapse and deferred reverse deletion retain source behavior. @param start - Original start node. @param end - Original end node. @param startContent - Optional native start content. @param endContent - Optional native end content. @param isReplace - Original replacement boundary policy. @returns Nothing. */
  public DeleteMarks(
    start: SwNode,
    end: SwNode,
    startContent?: number,
    endContent?: number,
    isReplace = false,
  ): void {
    const deleted: DocumentMark[] = [];
    for (const mark of this.GetAllMarks()) {
      const point = mark.GetMarkPos(),
        expanded = mark.IsExpanded(),
        other = expanded ? mark.GetOtherMarkPos() : point;
      let inside = lcl_GreaterThan(point, start, startContent) && lcl_Lower(point, end, endContent),
        otherInside =
          expanded &&
          lcl_GreaterThan(other, start, startContent) &&
          lcl_Lower(other, end, endContent);
      if (
        endContent !== undefined &&
        !(isReplace && mark instanceof SwBookmark) &&
        ((otherInside && point.GetNode() === end && point.GetContentIndex() === endContent) ||
          (inside && expanded && other.GetNode() === end && other.GetContentIndex() === endContent))
      )
        inside = otherInside = true;
      if (inside && (otherInside || !expanded)) {
        const remove =
          !(mark instanceof UnoMark) ||
          expanded ||
          startContent === undefined ||
          point.GetNode() !== start ||
          point.GetContentIndex() !== startContent;
        if (remove) deleted.push(mark);
      } else if (inside !== otherInside && expanded) {
        const position =
          endContent !== undefined
            ? new SwPosition(end, endContent)
            : lcl_FindExpelPosition(start, end, inside ? other : point);
        try {
          const changed = inside ? point : other;
          changed.Assign(position.GetNode(), position.GetContentIndex());
          if (
            mark.IsExpanded() &&
            point.GetNode().FindTableBoxStartNode() !== other.GetNode().FindTableBoxStartNode()
          ) {
            if (!otherInside) point.Assign(other.GetNode(), other.GetContentIndex());
            mark.ClearOtherMarkPos();
          }
        } finally {
          position.Dispose();
        }
      }
    }
    for (let i = deleted.length; i;) {
      const mark = deleted[--i];
      if (mark instanceof UnoMark) this.DeleteUnoMark(mark);
      else if (mark instanceof AnnotationMark)
        this.DeleteAnnotationMark(mark.GetAnnotationFormatField());
      else if (mark) this.DeleteMark(mark.GetName());
    }
    this.GetAllMarks();
  }
  /** Invalidates API/user mark positions when their canonical document is destroyed. @returns Nothing. */
  public Dispose(): void {
    for (const mark of this.unoMarks) mark.Dispose();
    this.unoMarks.clear();
    for (const mark of this.annotationMarks.values()) mark.Dispose();
    this.annotationMarks.clear();
    this.m_vAllMarks.length = 0;
    for (const mark of this.bookmarks.values()) mark.Dispose();
    this.bookmarks.clear();
    for (const position of this.softPageBreaks) position.Dispose();
    this.softPageBreaks.length = 0;
  }
  private readonly bookmarks = new Map<string, SwBookmark>();
  private readonly markBasenameUniqueOffsets = new Map<string, number>();
  private readonly softPageBreaks: SwPosition[] = [];

  /** Binds the manager to one Writer graph. @param document - Owning document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {}

  /** Creates a collapsed bookmark. @param node - Text node. @param offset - UTF-16 position. @param name - Writer bookmark name. @returns New bookmark. */
  public MakeMark(node: SwTextNode, offset: number, name: string): SwBookmark {
    this.assertNode(node);
    const point = new SwPosition(node, offset, "mark", "before");
    const range = new SwPaM(point);
    point.Dispose();
    try {
      return this.MakeBookmark(range, name);
    } finally {
      range.Dispose();
    }
  }

  /** Creates the native bookmark from an ordered paragraph selection. @param source - Actual Writer selection. @param name - Writer bookmark name. @returns New bookmark. */
  public MakeBookmark(source: SwPaM, name: string): SwBookmark {
    const start = source.Start(),
      end = source.End();
    this.assertNode(start.GetNode() as SwTextNode);
    this.assertNode(end.GetNode() as SwTextNode);
    this.assertName(name);
    const uniqueName = getUniqueBookmarkName(
      name,
      /** Queries the actual mark owner. @param candidate - Proposed name. @returns Whether unused. */ (
        candidate,
      ) => !this.bookmarks.has(candidate),
      this.markBasenameUniqueOffsets,
      "%1 Copy ",
    );
    const range = new SwPaM(start, start.compare(end) !== 0 ? end : undefined);
    let mark: SwBookmark;
    try {
      mark = new SwBookmark(uniqueName, range);
    } finally {
      range.Dispose();
    }
    this.bookmarks.set(uniqueName, mark);
    this.InsertMarkSorted(mark);
    this.document.NotifyModelChange({ kind: "mark-changed" });
    return mark;
  }

  /** Returns a bookmark by name. @param name - Exact name. @returns Bookmark or undefined. */
  public FindMark(name: string): SwBookmark | undefined {
    return this.bookmarks.get(name);
  }

  /** Returns all bookmarks in document order. @returns Stable ordered marks. */
  public GetBookmarks(): readonly SwBookmark[] {
    return [...this.bookmarks.values()].sort(
      /** Orders positions as Writer's mark index does. @param left - Earlier candidate. @param right - Later candidate. @returns Signed order. */
      (left, right) => left.GetMarkStart().compare(right.GetMarkStart()),
    );
  }

  /** Lists bookmark names in document order for the Writer dialog. @returns Ordered names. */
  public GetBookmarkNames(): readonly string[] {
    return this.GetBookmarks().map(
      /** Projects a mark name. @param mark - Bookmark. @returns Name. */ (mark) => mark.GetName(),
    );
  }

  /** Finds a collapsed mark at a Writer position. @param position - Caret or selection point. @returns Bookmark, when present. */
  public FindMarkAtPosition(position: SwPosition): SwBookmark | undefined {
    return this.GetBookmarks().find(
      /** Compares document and UTF-16 offsets. @param mark - Bookmark. @returns Whether it matches. */
      (mark) =>
        mark.GetMarkPos().GetNode() === position.GetNode() &&
        mark.GetMarkPos().GetContentIndex() === position.GetContentIndex(),
    );
  }

  /** Renames one existing mark without moving its registered position. @param oldName - Existing name. @param newName - Replacement. @returns Whether changed. */
  public RenameMark(oldName: string, newName: string): boolean {
    const mark = this.bookmarks.get(oldName);
    if (mark === undefined) return false;
    this.assertName(newName);
    if (oldName === newName) return false;
    if (this.bookmarks.has(newName)) throw new Error(`Writer bookmark already exists: ${newName}`);
    this.bookmarks.delete(oldName);
    mark.SetName(newName);
    this.bookmarks.set(newName, mark);
    this.document.NotifyModelChange({ kind: "mark-changed" });
    return true;
  }

  /** Removes one mark. @param name - Existing name. @returns Whether removed. */
  public DeleteMark(name: string): boolean {
    const mark = this.bookmarks.get(name);
    if (mark === undefined) return false;
    this.bookmarks.delete(name);
    this.RemoveMark(mark);
    mark.Dispose();
    this.document.NotifyModelChange({ kind: "mark-changed" });
    return true;
  }

  /** Retains an imported soft page boundary without inserting text or a hard page break. @param node - Text node. @param offset - UTF-16 position. @returns Registered position. */
  public AddSoftPageBreak(node: SwTextNode, offset: number): SwPosition {
    this.assertNode(node);
    const position = new SwPosition(node, offset, "anchor", "before");
    this.softPageBreaks.push(position);
    this.document.NotifyModelChange({ kind: "mark-changed" });
    return position;
  }

  /** Returns soft boundaries in document order. @returns Registered positions. */
  public GetSoftPageBreaks(): readonly SwPosition[] {
    return [...this.softPageBreaks].sort(
      /** Orders soft pagination hints. @param left - First. @param right - Second. @returns Signed order. */
      (left, right) =>
        left.GetNodeIndex() - right.GetNodeIndex() ||
        left.GetContentIndex() - right.GetContentIndex(),
    );
  }

  /** Rejects positions from a different Writer graph. @param node - Candidate node. @returns Nothing. */
  private assertNode(node: SwTextNode): void {
    if (node.GetDoc() !== this.document || node.GetNodes().indexOfOrUndefined(node) === undefined)
      throw new Error("Writer mark position belongs to another document.");
  }

  /** Validates the name as a bounded nonempty ODF string. @param name - Candidate. @returns Nothing. */
  private assertName(name: string): void {
    if (name.length === 0 || name.includes("\u0000"))
      throw new Error("Writer bookmark name is invalid.");
  }
}

/** Original inclusive lower range boundary, including node-only deletion. @param position - Actual mark position. @param node - Actual start node. @param content - Optional content boundary. @returns Native predicate. */
function lcl_GreaterThan(position: SwPosition, node: SwNode, content?: number): boolean {
  return content === undefined
    ? position.GetNodeIndex() >= node.GetIndex()
    : position.GetNodeIndex() > node.GetIndex() ||
        (position.GetNode() === node && position.GetContentIndex() >= content);
}
/** Original upper range boundary includes an explicitly selected text-paragraph end. @param position - Actual mark position. @param node - Actual end node. @param content - Optional content boundary. @returns Native predicate. */
function lcl_Lower(position: SwPosition, node: SwNode, content?: number): boolean {
  if (position.GetNodeIndex() < node.GetIndex()) return true;
  if (position.GetNode() !== node || content === undefined) return false;
  return (
    position.GetContentIndex() < content || (node instanceof SwTextNode && content === node.Len())
  );
}
/** Original endpoint expulsion prefers end content/start of following content, then preceding content end, then the surviving opposite endpoint. @param start - Native deletion start. @param end - Native deletion end. @param other - Actual surviving endpoint. @returns Owned native correction position. */
function lcl_FindExpelPosition(start: SwNode, end: SwNode, other: SwPosition): SwPosition {
  if (end instanceof SwContentNode) return new SwPosition(end);
  const after = new SwNodeIndex(end),
    before = new SwNodeIndex(start);
  try {
    const next = SwNodes.GoNext(after);
    if (next) return new SwPosition(next);
    const previous = SwNodes.GoPrevious(before);
    return previous ? new SwPosition(previous, previous.Len()) : other.clone();
  } finally {
    after.Dispose();
    before.Dispose();
  }
}
/** Original DelBookmarks node-only consumer used by DeleteSection; saved-bookmark/redline capture belongs to other unrepresented consumer profiles. Same-node node-only ranges are ignored, as upstream. @param start - Actual deletion start. @param end - Actual exclusive end node. @returns Nothing. */
export function DelBookmarks(start: SwNode, end: SwNode): void {
  if (start.GetIndex() >= end.GetIndex()) return;
  start.GetNodes().GetDoc().GetIDocumentMarkAccess().DeleteMarks(start, end);
}
