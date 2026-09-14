/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import {
  markDocumentDirty,
  markDocumentHistorySavePosition,
  markDocumentSaved,
  type OfficeDocument,
} from "../../../../sfx2/source/doc/docfac";
import type { SfxMediumDescriptor } from "../../../../sfx2/source/doc/docfile";
import { SfxUndoManager, type SfxUndoAction } from "../../../../sfx2/source/doc/docundomanager";
import { ODT_MIMETYPE } from "../../../../package/source/manifest/ManifestExport";
import { SwDoc } from "../../core/doc/doc";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";

/** Writer document shell that owns the active SwDoc across new, load, and save operations. */
export class SwDocShell {
  /** MIME type used by Writer's OpenDocument Text filter. */
  public static readonly ODT_MEDIA_TYPE = ODT_MIMETYPE;

  private readonly listeners = new Set<() => void>();
  private medium: SfxMediumDescriptor;
  private undoManager: SfxUndoManager<SwUndoRedoContext>;

  /** Creates a shell around an existing Writer document. @param document - Active canonical document. @param medium - Persistent browser-adapted medium descriptor. @returns Nothing. */
  public constructor(
    private document: SwDoc,
    medium: SfxMediumDescriptor = { kind: "untitled", name: document.document.title },
  ) {
    this.undoManager = new SfxUndoManager<SwUndoRedoContext>();
    if (document.document.isModified) this.undoManager.ClearSavePosition();
    this.medium = { ...medium };
  }

  /** Returns the shell-owned Writer document. @returns Active SwDoc. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the document-owned action manager. @returns Current Sfx undo manager. */
  public GetUndoManager(): SfxUndoManager<SwUndoRedoContext> {
    return this.undoManager;
  }

  /** Returns the active browser-adapted medium descriptor. @returns Immutable copied descriptor. */
  public GetMedium(): SfxMediumDescriptor {
    return { ...this.medium };
  }

  /** Subscribes to document replacement, history navigation, and lifecycle invalidation. @param listener - Session listener. @returns Cleanup removing the listener. */
  public Subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return /** Removes one document-shell listener. @returns Whether the listener was present. */ () =>
      this.listeners.delete(listener);
  }

  /** Executes and records one semantic Writer action. @param action - Reversible domain operation. @param context - Active Writer shell context. @param tryMerge - Whether the top action may absorb it. @returns True after successful execution. */
  public ApplyUndoAction(
    action: SfxUndoAction<SwUndoRedoContext>,
    context: SwUndoRedoContext,
    tryMerge = false,
  ): boolean {
    action.RedoWithContext(context);
    this.document.SetModified();
    this.undoManager.AddUndoAction(action, tryMerge);
    this.Notify();
    return true;
  }

  /** Reverts the current top Writer action and updates lifecycle state against the save mark. @param context - Active Writer shell context. @returns Whether an action ran. */
  public Undo(context: SwUndoRedoContext): boolean {
    if (!this.undoManager.Undo(context)) return false;
    this.MarkHistoryMutation();
    this.Notify();
    return true;
  }

  /** Reapplies the next Writer action and updates lifecycle state against the save mark. @param context - Active Writer shell context. @returns Whether an action ran. */
  public Redo(context: SwUndoRedoContext): boolean {
    if (!this.undoManager.Redo(context)) return false;
    this.MarkHistoryMutation();
    this.Notify();
    return true;
  }

  /** Moves the primary-medium save mark without adding an undo action. @param savedGeneration - Persisted content generation. @returns Whether lifecycle or save-position state changed. */
  public AcknowledgeSave(savedGeneration: number): boolean {
    const previous = this.document.document;
    this.document.document = markDocumentSaved(previous, savedGeneration);
    const markChanged = this.undoManager.SetSavePosition();
    if (this.document.document === previous && !markChanged) return false;
    this.Notify();
    return true;
  }

  /** Atomically replaces the document and resets its undo manager for New, Open, or Load. @param document - Replacement canonical graph. @param medium - Replacement medium descriptor. @returns Installed document. */
  public ReplaceDocument(document: SwDoc, medium: SfxMediumDescriptor): SwDoc {
    this.document = document;
    this.medium = { ...medium };
    this.undoManager = new SfxUndoManager<SwUndoRedoContext>();
    if (document.document.isModified) this.undoManager.ClearSavePosition();
    this.Notify();
    return document;
  }

  /** Replaces the shell document with a new empty Writer graph. @param metadata - New document identity. @param initialTextNodeId - Initial body node identity. @returns New SwDoc. */
  public InitNew(metadata: OfficeDocument, initialTextNodeId: string): SwDoc {
    return this.ReplaceDocument(new SwDoc(metadata, initialTextNodeId), {
      kind: "untitled",
      name: metadata.title,
    });
  }

  /** Loads an ODT into a candidate graph before atomically replacing the active document. @param bytes - Complete ODT bytes. @param metadata - Fallback identity and title. @param medium - Replacement medium descriptor. @returns Loaded saved-state SwDoc. */
  public async Load(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    medium: SfxMediumDescriptor = {
      kind: "file",
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
      name: metadata.title,
    },
  ): Promise<SwDoc> {
    const loaded = await readOdtDocument(bytes, metadata);
    loaded.document = markDocumentSaved(loaded.document);
    return this.ReplaceDocument(loaded, medium);
  }

  /** Serializes the active document through Writer's ODT package filter. @returns Complete ODT bytes. */
  public SaveAs(): Uint8Array {
    return writeOdtDocument(this.document);
  }

  /** Closes document-shell subscriptions at explicit session termination. @returns Nothing. */
  public Close(): void {
    this.listeners.clear();
  }

  /** Publishes one shell-owned state invalidation. @returns Nothing. */
  private Notify(): void {
    for (const listener of this.listeners) listener();
  }

  /** Advances generation after Undo or Redo and restores modified state from the current save position. @returns Nothing. */
  private MarkHistoryMutation(): void {
    this.document.document = markDocumentHistorySavePosition(
      markDocumentDirty(this.document.document),
      this.undoManager.IsAtSavePosition(),
    );
  }
}
