/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import {
  markDocumentDirty,
  markDocumentHistorySavePosition,
  markDocumentRecoverySaved,
  markDocumentSaved,
  type OfficeDocument,
} from "../../../../sfx2/source/doc/docfac";
import {
  createSfxMediumDescriptor,
  synchronizeSfxMedium,
  updateSfxMediumOperation,
  type DocumentSnapshot,
  type SfxMediumDescriptor,
  type SfxMediumInput,
  type SfxMediumOperation,
} from "../../../../sfx2/source/doc/docfile";
import { SfxUndoManager, type SfxUndoAction } from "../../../../sfx2/source/doc/docundomanager";
import { ODT_MIMETYPE } from "../../../../package/source/manifest/ManifestExport";
import { SwDoc } from "../../core/doc/doc";
import {
  createWriterSnapshot,
  restoreWriterSnapshot,
  type WriterSnapshotState,
} from "../../core/doc/writer-storage";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import {
  createInlineOdtFilterService,
  OdtFilterError,
  type OdtFilterOperationOptions,
  type OdtFilterService,
} from "../../filter/xml/odt-filter-service";

/** Writer document shell that owns the active SwDoc across new, load, and save operations. */
export class SwDocShell {
  /** MIME type used by Writer's OpenDocument Text filter. */
  public static readonly ODT_MEDIA_TYPE = ODT_MIMETYPE;

  private readonly listeners = new Set<() => void>();
  private medium: SfxMediumDescriptor;
  private odtRequestGeneration = 0;
  private undoManager: SfxUndoManager<SwUndoRedoContext>;

  /** Creates a shell around an existing Writer document. @param document - Active canonical document. @param medium - Persistent browser-adapted medium descriptor. @param odtFilter - Asynchronous ODT filter boundary. @returns Nothing. */
  public constructor(
    private document: SwDoc,
    medium: SfxMediumInput = { kind: "untitled", name: document.document.title },
    private readonly odtFilter: OdtFilterService = createInlineOdtFilterService(),
  ) {
    this.undoManager = new SfxUndoManager<SwUndoRedoContext>();
    if (document.document.isModified) this.undoManager.ClearSavePosition();
    this.medium = createSfxMediumDescriptor(medium, document.document);
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
    return createSfxMediumDescriptor(this.medium, this.document.document);
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
    this.medium = synchronizeSfxMedium(this.medium, this.document.document);
    this.Notify();
    return true;
  }

  /** Acknowledges a committed recovery snapshot without affecting primary save state. @param generation - Persisted recovery generation. @returns Whether lifecycle state changed. */
  public AcknowledgeRecoverySave(generation: number): boolean {
    const previous = this.document.document;
    this.document.document = markDocumentRecoverySaved(previous, generation);
    this.medium = updateSfxMediumOperation(
      this.medium,
      this.document.document,
      "recovery-save",
      "succeeded",
      generation,
    );
    if (this.document.document === previous) return false;
    this.Notify();
    return true;
  }

  /** Atomically replaces the document and resets its undo manager for New, Open, or Load. @param document - Replacement canonical graph. @param medium - Replacement medium descriptor. @returns Installed document. */
  public ReplaceDocument(document: SwDoc, medium: SfxMediumInput): SwDoc {
    this.odtRequestGeneration += 1;
    this.odtFilter.Cancel();
    this.document = document;
    this.medium = createSfxMediumDescriptor(medium, document.document);
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

  /** Loads an ODT into a candidate graph before atomically replacing the active document. @param bytes - Complete ODT bytes. @param metadata - Fallback identity and title. @param medium - Replacement medium descriptor. @param options - Filter cancellation/progress controls. @returns Loaded saved-state SwDoc. */
  public async Open(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    medium: SfxMediumInput = {
      kind: "file",
      filterId: "writer8",
      mediaType: SwDocShell.ODT_MEDIA_TYPE,
      name: metadata.title,
    },
    options?: OdtFilterOperationOptions,
  ): Promise<SwDoc> {
    this.odtFilter.Cancel();
    const requestGeneration = ++this.odtRequestGeneration;
    const snapshot = await this.odtFilter.Import(bytes, metadata, options);
    if (requestGeneration !== this.odtRequestGeneration)
      throw new OdtFilterError("stale", "ODT open result is stale.");
    const loaded = restoreWriterSnapshot(snapshot, "primary");
    return this.ReplaceDocument(
      loaded,
      updateSfxMediumOperation(
        createSfxMediumDescriptor(medium, loaded.document),
        loaded.document,
        "open",
        "succeeded",
        loaded.document.contentGeneration,
      ),
    );
  }

  /** Compatibility alias for the atomic ODT open boundary. @param bytes - Complete ODT bytes. @param metadata - Fallback identity and title. @param medium - Open medium. @returns Loaded Writer graph. */
  public Load(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    medium?: SfxMediumInput,
  ): Promise<SwDoc> {
    return medium === undefined ? this.Open(bytes, metadata) : this.Open(bytes, metadata, medium);
  }

  /** Serializes a captured active-document snapshot through Writer's asynchronous ODT filter without changing medium state. @param options - Cancellation/progress controls. @returns Complete ODT bytes. */
  public SerializeOdt(options?: OdtFilterOperationOptions): Promise<Uint8Array> {
    return this.odtFilter.Export(createWriterSnapshot(this.document), options);
  }

  /** Saves to the current confirmed writable primary medium. @param persist - Adapter operation that must resolve only after a committed write. @returns Completion after save acknowledgement. */
  public Save(
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<void>,
  ): Promise<void> {
    if (
      this.medium.readOnly ||
      !this.medium.capabilities.canWrite ||
      !this.medium.capabilities.canConfirmWrite
    )
      return Promise.reject(new Error("The current medium requires Save As."));
    return this.PerformPrimarySave("save", this.medium, persist, false);
  }

  /** Saves to and adopts a new confirmed writable primary medium. @param medium - Candidate replacement medium. @param persist - Adapter operation that resolves after commit. @returns Completion after atomic medium replacement and save acknowledgement. */
  public SaveAs(
    medium: SfxMediumInput,
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<void>,
  ): Promise<void> {
    const candidate = createSfxMediumDescriptor(medium, this.document.document);
    if (
      candidate.readOnly ||
      !candidate.capabilities.canWrite ||
      !candidate.capabilities.canConfirmWrite
    )
      return Promise.reject(new Error("Save As requires a confirmed writable medium."));
    return this.PerformPrimarySave("save-as", candidate, persist, true);
  }

  /** Stores an external representation without replacing or acknowledging the primary medium. @param medium - Export destination. @param persist - Export adapter operation. @returns Completion after export status is recorded. */
  public async Export(
    medium: SfxMediumInput,
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<void> | void,
  ): Promise<void> {
    const generation = this.document.document.contentGeneration;
    const destination = createSfxMediumDescriptor(medium, this.document.document);
    this.SetOperation("export", "pending", generation);
    try {
      await persist(this.document, destination);
      this.SetOperation("export", "succeeded", generation);
    } catch (error) {
      this.SetOperation("export", "failed", generation, getErrorMessage(error));
      throw error;
    }
  }

  /** Starts a browser download whose completion cannot confirm primary-medium persistence. @param medium - Download target. @param start - Synchronous browser adapter call. @returns Nothing after unconfirmed status is recorded. */
  public Download(
    medium: SfxMediumInput,
    start: (document: SwDoc, medium: SfxMediumDescriptor) => void,
  ): void {
    const generation = this.document.document.contentGeneration;
    const destination = createSfxMediumDescriptor(medium, this.document.document);
    this.SetOperation("download", "pending", generation);
    try {
      start(this.document, destination);
      this.SetOperation("download", "unconfirmed", generation);
    } catch (error) {
      this.SetOperation("download", "failed", generation, getErrorMessage(error));
      throw error;
    }
  }

  /** Returns the stable identity used by application AutoRecovery. @returns Document identity. */
  public GetRecoveryIdentity(): string {
    return this.document.document.id;
  }

  /** Returns the lifecycle fields used by generation-aware recovery decisions. @returns Current recovery state. */
  public GetRecoveryState(): Readonly<{
    contentGeneration: number;
    isModified: boolean;
    recoveryGeneration: number | null;
  }> {
    const { contentGeneration, isModified, recoveryGeneration } = this.document.document;
    return { contentGeneration, isModified, recoveryGeneration };
  }

  /** Creates a complete Writer recovery payload without mutating the document. @returns Current generation snapshot. */
  public CreateRecoverySnapshot(): DocumentSnapshot<WriterSnapshotState> {
    return createWriterSnapshot(this.document);
  }

  /** Records recovery operation start without changing lifecycle generations. @param generation - Attempted generation. @returns Nothing. */
  public RecoverySaveStarted(generation: number): void {
    this.SetOperation("recovery-save", "pending", generation);
  }

  /** Records recovery failure without acknowledging the attempted generation. @param generation - Attempted generation. @param error - Storage failure. @returns Nothing. */
  public RecoverySaveFailed(generation: number, error: unknown): void {
    this.SetOperation("recovery-save", "failed", generation, getErrorMessage(error));
  }

  /** Validates and atomically installs one recovered Writer snapshot. @param snapshot - Candidate recovery payload. @returns Nothing after replacement. */
  public RestoreRecoverySnapshot(snapshot: DocumentSnapshot<WriterSnapshotState>): void {
    const recovered = restoreWriterSnapshot(snapshot, "recovery");
    this.ReplaceDocument(recovered, {
      indexedDbKey: snapshot.id,
      kind: "recovery",
      lastOperation: {
        generation: snapshot.version,
        operation: "open",
        state: "succeeded",
      },
      name: recovered.document.title,
    });
  }

  /** Closes document-shell subscriptions at explicit session termination. @returns Nothing. */
  public Close(): void {
    this.odtRequestGeneration += 1;
    this.odtFilter.Close();
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
    this.medium = synchronizeSfxMedium(this.medium, this.document.document);
  }

  /** Performs primary Save or Save As while adopting the candidate only after commit. @param operation - Save operation. @param candidate - Current or replacement medium. @param persist - Confirmed write callback. @param replaceMedium - Whether success adopts candidate. @returns Completion after acknowledgement. */
  private async PerformPrimarySave(
    operation: "save" | "save-as",
    candidate: SfxMediumDescriptor,
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<void>,
    replaceMedium: boolean,
  ): Promise<void> {
    const generation = this.document.document.contentGeneration;
    this.SetOperation(operation, "pending", generation);
    try {
      await persist(this.document, candidate);
      this.document.document = markDocumentSaved(this.document.document, generation);
      this.undoManager.SetSavePosition();
      if (replaceMedium) this.medium = candidate;
      this.medium = updateSfxMediumOperation(
        this.medium,
        this.document.document,
        operation,
        "succeeded",
        generation,
      );
      this.Notify();
    } catch (error) {
      this.SetOperation(operation, "failed", generation, getErrorMessage(error));
      throw error;
    }
  }

  /** Updates medium operation feedback and publishes shell invalidation. @param operation - Operation identity. @param state - New state. @param generation - Captured generation. @param message - Optional failure message. @returns Nothing. */
  private SetOperation(
    operation: SfxMediumOperation,
    state: SfxMediumDescriptor["lastOperation"]["state"],
    generation?: number,
    message?: string,
  ): void {
    this.medium = updateSfxMediumOperation(
      this.medium,
      this.document.document,
      operation,
      state,
      generation,
      message,
    );
    this.Notify();
  }
}

/** Returns deterministic error feedback without retaining platform Error objects. @param error - Unknown thrown value. @returns Human-readable text. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
