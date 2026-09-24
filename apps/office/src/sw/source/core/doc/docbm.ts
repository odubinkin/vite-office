/** @fileoverview Owns collapsed Writer bookmarks and imported soft-page positions at the pinned `sw/source/core/doc/docbm.cxx` boundary. */

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
  public GetPosition(): SwPosition {
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
  private readonly bookmarks = new Map<string, SwBookmark>();
  private readonly softPageBreaks: SwPosition[] = [];

  /** Binds the manager to one Writer graph. @param document - Owning document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {}

  /** Creates a unique collapsed bookmark. @param node - Text node. @param offset - UTF-16 position. @param name - ODF/user name. @returns New bookmark. */
  public MakeMark(node: SwTextNode, offset: number, name: string): SwBookmark {
    this.assertNode(node);
    this.assertName(name);
    if (this.bookmarks.has(name)) throw new Error(`Writer bookmark already exists: ${name}`);
    const mark = new SwBookmark(name, new SwPosition(node, offset, "mark", "before"));
    this.bookmarks.set(name, mark);
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
        left.GetPosition().GetNodeIndex() - right.GetPosition().GetNodeIndex() ||
        left.GetPosition().GetContentIndex() - right.GetPosition().GetContentIndex(),
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
        mark.GetPosition().GetNode() === position.GetNode() &&
        mark.GetPosition().GetContentIndex() === position.GetContentIndex(),
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
    if (name.trim().length === 0 || name.includes("\u0000"))
      throw new Error("Writer bookmark name is invalid.");
  }
}
