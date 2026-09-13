/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import { markDocumentSaved, type OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import type { SfxMediumDescriptor } from "../../../../sfx2/source/doc/docfile";
import {
  applyGroupedTransaction,
  applyTransaction,
  createTransactionHistory,
  getCurrentTransactionState,
  type CursorSelection,
  type TransactionHistory,
} from "../../../../sfx2/source/doc/docundomanager";
import { ODT_MIMETYPE } from "../../../../package/source/manifest/ManifestExport";
import { SwDoc } from "../../core/doc/doc";
import type { WriterParagraph } from "../../core/doc/writer";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";

/** Writer document shell that owns the active SwDoc across new, load, and save operations. */
export class SwDocShell {
  /** MIME type used by Writer's OpenDocument Text filter. */
  public static readonly ODT_MEDIA_TYPE = ODT_MIMETYPE;

  private history: TransactionHistory<SwDoc>;
  private readonly listeners = new Set<() => void>();
  private medium: SfxMediumDescriptor;

  /** Creates a shell around an existing Writer document. @param document - Active canonical document. @param medium - Persistent browser-adapted medium descriptor. @returns Nothing. */
  public constructor(
    private document: SwDoc,
    medium: SfxMediumDescriptor = { kind: "untitled", name: document.document.title },
  ) {
    const paragraph = document.paragraphs[0] as WriterParagraph;
    this.history = createTransactionHistory(document, {
      position: paragraph.text.length,
    });
    this.medium = { ...medium };
  }

  /** Returns the shell-owned Writer document. @returns Active SwDoc. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the shell-coordinated transaction manager used until Stage 3 replaces snapshots with actions. @returns Current immutable history. */
  public GetUndoManager(): TransactionHistory<SwDoc> {
    return this.history;
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

  /** Applies one domain document transition through the shell-owned undo manager. @param nextDocument - Changed immutable SwDoc. @param selection - Logical cursor position stored with the action. @param grouping - Optional upstream-compatible open-action grouping. @returns True when a new current document was installed. */
  public ApplyDocument(
    nextDocument: SwDoc,
    selection: CursorSelection,
    grouping?: Readonly<{ extendCurrent: boolean; id: string }>,
  ): boolean {
    if (nextDocument === this.document) return false;
    this.history =
      grouping === undefined
        ? applyTransaction(this.history, nextDocument, selection)
        : applyGroupedTransaction(
            this.history,
            nextDocument,
            selection,
            grouping.id,
            grouping.extendCurrent,
          );
    this.document = nextDocument;
    this.Notify();
    return true;
  }

  /** Replaces the coordinated undo-manager state after Undo, Redo, or save acknowledgement. @param history - Complete validated next history. @returns True when the current history changed. */
  public SetUndoManager(history: TransactionHistory<SwDoc>): boolean {
    if (history === this.history) return false;
    const document = getCurrentTransactionState(history);
    this.history = history;
    this.document = document;
    this.Notify();
    return true;
  }

  /** Atomically replaces the document and resets its undo manager for New, Open, or Load. @param document - Replacement canonical graph. @param medium - Replacement medium descriptor. @returns Installed document. */
  public ReplaceDocument(document: SwDoc, medium: SfxMediumDescriptor): SwDoc {
    const paragraph = document.paragraphs[0] as WriterParagraph;
    this.document = document;
    this.medium = { ...medium };
    this.history = createTransactionHistory(document, {
      position: paragraph.text.length,
    });
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
}
