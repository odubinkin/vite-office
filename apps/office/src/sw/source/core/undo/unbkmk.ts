/** @fileoverview Implements native ordinary bookmark history from unbkmk.cxx. */
import type { SwBookmark } from "../doc/docbm";
import type { SwDoc } from "../doc/doc";
import { SwHistoryBookmark } from "./rolbck";
import { SwUndo, type SwUndoRedoContext } from "./undobj";

/** Saves original bookmark identity, registered endpoints and metadata for history. */
abstract class SwUndoBookmark extends SwUndo {
  private readonly bookmark: SwHistoryBookmark;

  /** Captures the existing bookmark before removal or after insertion. @param comment - Original operation label. @param bookmark - Attached bookmark. @returns History action. */
  protected constructor(comment: string, bookmark: SwBookmark) {
    super(comment);
    this.bookmark = new SwHistoryBookmark(bookmark, true, bookmark.IsExpanded());
  }

  /** Restores the bookmark using the ordinary mark history payload. @param document - Undo document. @returns Nothing. */
  protected SetInDoc(document: SwDoc): void {
    this.bookmark.SetInDoc(document, false);
    document.NotifyModelChange({ kind: "document-modified", modified: true });
  }

  /** Removes the matching live bookmark without affecting other marks at the position. @param document - Undo document. @returns Nothing. */
  protected ResetInDoc(document: SwDoc): void {
    const access = document.GetIDocumentMarkAccess();
    const match = access.GetBookmarks().find(
      /** Compares the original mark identity to the live mark. @param mark - Attached bookmark. @returns Whether it matches. */
      (mark) => this.bookmark.IsEqualBookmark(mark),
    );
    if (match && access.DeleteMark(match.GetName()))
      document.NotifyModelChange({ kind: "document-modified", modified: true });
  }
}

/** Reverses or replays insertion of an ordinary bookmark. */
export class SwUndoInsBookmark extends SwUndoBookmark {
  /** Captures the inserted mark for undo. @param bookmark - Inserted mark. @returns History action. */
  constructor(bookmark: SwBookmark) {
    super("Insert Bookmark", bookmark);
  }
  /** Removes the inserted bookmark. @param context - Writer history context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.ResetInDoc(context.GetDoc());
  }
  /** Recreates the inserted bookmark. @param context - Writer history context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.SetInDoc(context.GetDoc());
  }
}

/** Reverses or replays deletion of an ordinary bookmark. */
export class SwUndoDeleteBookmark extends SwUndoBookmark {
  /** Captures the existing mark for deletion and undo. @param bookmark - Current mark. @returns History action. */
  constructor(bookmark: SwBookmark) {
    super("Delete Bookmark", bookmark);
  }
  /** Recreates the removed bookmark. @param context - Writer history context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.SetInDoc(context.GetDoc());
  }
  /** Removes the original bookmark. @param context - Writer history context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.ResetInDoc(context.GetDoc());
  }
}

/** Renames the same bookmark in place for both history directions. */
export class SwUndoRenameBookmark extends SwUndo {
  /** Stores the two original names. @param oldName - Existing name. @param newName - Replacement name. @returns History action. */
  constructor(
    private readonly oldName: string,
    private readonly newName: string,
  ) {
    super("Rename Bookmark");
  }
  /** Restores the initial name. @param context - Writer history context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.Rename(context.GetDoc(), this.newName, this.oldName);
  }
  /** Restores the new name. @param context - Writer history context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.Rename(context.GetDoc(), this.oldName, this.newName);
  }
  /** Applies the native mark access rename. @param document - Undo document. @param from - Current name. @param to - Replacement name. @returns Nothing. */
  private Rename(document: SwDoc, from: string, to: string): void {
    if (document.GetIDocumentMarkAccess().RenameMark(from, to))
      document.NotifyModelChange({ kind: "document-modified", modified: true });
  }
}
