/** @fileoverview Owns collapsed Writer bookmarks and imported soft-page positions at the pinned `sw/source/core/doc/docbm.cxx` boundary. */

import { UnoMark } from "../crsr/bookmark";
import { SwPaM } from "../crsr/pam";
import { getUniqueBookmarkName } from "./bookmark-name";
import { SwPosition } from "../crsr/pam";
import type { SwDoc } from "./doc";
import type { SwTextNode } from "../txtnode/ndtxt";

/** One live, named Writer position. Its registered content index follows text edits. */
export class SwBookmark {
  /** Creates a collapsed bookmark. @param name - Unique document name. @param position - Registered Writer position. @returns Nothing. */
  public constructor(
    private name: string,
    private readonly position: SwPosition,
  ) {}

  /** Returns the name. @returns Bookmark name. */
  public GetName(): string {
    return this.name;
  }

  /** Returns its live model position. @returns Registered position. */
  public GetMarkPos(): SwPosition {
    return this.position;
  }

  /** Renames the bookmark after document-level validation. @param name - New name. @returns Nothing. */
  public SetName(name: string): void {
    this.name = name;
  }

  /** Releases its registered position. @returns Nothing. */
  public Dispose(): void {
    this.position.Dispose();
  }
}

/** Document-owned subset of LibreOffice's MarkManager plus retained soft pagination hints. */
export class DocumentMarkAccess {
  private readonly unoMarks = new Set<UnoMark>();
  private readonly m_vAllMarks: (SwBookmark | UnoMark)[] = [];
  /** Original start-order comparator for represented collapsed and UNO marks; cross-reference marks are not in this core family. @param mark - Actual borrowed mark. @returns Native start position. */
  private static MarkStart(mark: SwBookmark | UnoMark): SwPosition {
    const point = mark.GetMarkPos();
    return mark instanceof UnoMark && mark.GetOtherMarkPos().compare(point) < 0
      ? mark.GetOtherMarkPos()
      : point;
  }
  /** Original lower_bound insertion puts a new equal-start mark before existing ones. @param mark - Actual borrowed native mark. @returns Nothing. */
  private InsertMarkSorted(mark: SwBookmark | UnoMark): void {
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
  private RemoveMark(mark: SwBookmark | UnoMark): void {
    const index = this.m_vAllMarks.indexOf(mark);
    if (index >= 0) this.m_vAllMarks.splice(index, 1);
  }
  /** Source all-mark view includes internal UNO marks while the UI bookmark catalog remains separate. Registered positions are reconciled in original start order on access. @returns Borrowed native vector. */
  public GetAllMarks(): readonly (SwBookmark | UnoMark)[] {
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
  /** Original repositionMark for current collapsed bookmarks and internal UNO ranges. Frame invalidation and other mark families have no represented owners here. Unlike editing, reposition does not publish modified/undo state. @param mark - Actual document-managed mark or native null. @param range - Original new positions. @returns Nothing. */
  public RepositionMark(mark: SwBookmark | UnoMark | null, range: SwPaM): void {
    if (!mark) return;
    if (mark.GetMarkPos().GetNode().GetNodes() !== this.document.GetNodes())
      throw new Error("assert(mark belongs to document)");
    if (mark instanceof UnoMark) {
      const ordered = new SwPaM(range.Start(), range.HasMark() ? range.End() : undefined);
      try {
        mark.SetPositions(ordered);
      } finally {
        ordered.Dispose();
      }
    } else {
      if (range.HasMark()) throw new Error("Expanded user bookmarks are not represented");
      mark.GetMarkPos().Assign(range.GetPoint().GetNode(), range.GetPoint().GetContentIndex());
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
  /** Invalidates API/user mark positions when their canonical document is destroyed. @returns Nothing. */
  public Dispose(): void {
    for (const mark of this.unoMarks) mark.Dispose();
    this.unoMarks.clear();
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

  /** Creates a unique collapsed bookmark. @param node - Text node. @param offset - UTF-16 position. @param name - ODF/user name. @returns New bookmark. */
  public MakeMark(node: SwTextNode, offset: number, name: string): SwBookmark {
    this.assertNode(node);
    this.assertName(name);
    const uniqueName = getUniqueBookmarkName(
      name,
      /** Queries the actual mark owner. @param candidate - Proposed name. @returns Whether unused. */ (
        candidate,
      ) => !this.bookmarks.has(candidate),
      this.markBasenameUniqueOffsets,
      "%1 Copy ",
    );
    const mark = new SwBookmark(uniqueName, new SwPosition(node, offset, "mark", "before"));
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
      (left, right) =>
        left.GetMarkPos().GetNodeIndex() - right.GetMarkPos().GetNodeIndex() ||
        left.GetMarkPos().GetContentIndex() - right.GetMarkPos().GetContentIndex(),
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
