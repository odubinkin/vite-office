/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned
 * `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import {
  SfxObjectShell,
  markDocumentDirty,
  markDocumentHistorySavePosition,
  markDocumentRecoverySaved,
  markDocumentSaved,
  type OfficeDocument,
} from "../../../../sfx2/source/doc/objsh";
import {
  createSfxMediumDescriptor,
  synchronizeSfxMedium,
  updateSfxMediumOperation,
  type DocumentSnapshot,
  type SfxMediumDescriptor,
  type SfxMediumInput,
  type SfxMediumOperation,
} from "../../../../sfx2/source/doc/docfile";
import {
  SfxUndoManager,
  type SfxUndoAction,
  type SfxUndoSavePosition,
} from "../../../../svl/source/undo/undo";
import { ODT_MIMETYPE } from "../../../../package/source/manifest/ManifestExport";
import { SwClient, SwModify, subscribeToSwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
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

/** Writer document shell that owns lifecycle/medium state around a model-only SwDoc. */
export class SwDocShell extends SfxObjectShell {
  /** MIME type used by Writer's OpenDocument Text filter. */
  public static readonly ODT_MEDIA_TYPE = ODT_MIMETYPE;

  private odtRequestGeneration = 0;
  private readonly modelClient: SwClient;
  private readonly notifications = new SwModify();
  private undoManager: SfxUndoManager<SwUndoRedoContext>;

  /** Creates a shell around an existing Writer model and explicit object-shell state. @param document - Active model. @param documentState - Shell lifecycle state. @param medium - Current medium. @param odtFilter - ODT filter service. @returns Nothing. */
  public constructor(
    private document: SwDoc,
    documentState: OfficeDocument,
    medium: SfxMediumInput = { kind: "untitled", name: documentState.title },
    private readonly odtFilter: OdtFilterService = createInlineOdtFilterService(),
  ) {
    super(documentState, medium);
    this.undoManager = new SfxUndoManager<SwUndoRedoContext>();
    if (documentState.isModified) this.undoManager.ClearSavePosition();
    this.modelClient = new SwClient(
      /** Relays one model notification into shell policy. @param _source - Model source. @param hint - Typed hint. @returns Nothing. */ (
        _source,
        hint,
      ) => this.ReceiveModelHint(hint),
    );
    this.modelClient.RegisterToModify(document);
  }

  /** Returns the shell-owned Writer model. @returns Active model. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the document-owned action manager. @returns Current undo manager. */
  public GetUndoManager(): SfxUndoManager<SwUndoRedoContext> {
    return this.undoManager;
  }

  /** Subscribes one typed shell consumer through the Writer notification graph. @param listener - Typed receiver. @returns Cleanup callback. */
  public Subscribe(listener: (hint: SwModelHint) => void): () => void {
    return subscribeToSwModify(
      this.notifications,
      /** Forwards one shell hint. @param _source - Shell notification source. @param hint - Typed hint. @returns Nothing. */ (
        _source,
        hint,
      ) => listener(hint),
    );
  }

  /** Executes and records one semantic Writer action as one notification transaction. @param action - Reversible operation. @param context - Writer undo context. @param tryMerge - Whether adjacent history may merge. @returns True after execution. */
  public ApplyUndoAction(
    action: SfxUndoAction<SwUndoRedoContext>,
    context: SwUndoRedoContext,
    tryMerge = false,
  ): boolean {
    this.EnsureOpen();
    this.notifications.RunNotificationTransaction(
      /** Executes one shell transaction. @returns Nothing. */ () => {
        this.document.RunModelTransaction(
          /** Executes the action against the model. @returns Nothing. */ () =>
            action.RedoWithContext(context),
        );
        this.undoManager.AddUndoAction(action, tryMerge);
      },
    );
    return true;
  }

  /** Reverts the current top Writer action and updates lifecycle against the save mark. @param context - Writer undo context. @returns Whether an action ran. */
  public Undo(context: SwUndoRedoContext): boolean {
    this.EnsureOpen();
    return this.notifications.RunNotificationTransaction(
      /** Executes one shell undo transaction. @returns Whether an action ran. */ () => {
        const changed = this.document.RunModelTransaction(
          /** Executes the current undo action. @returns Whether an action ran. */ () =>
            this.undoManager.Undo(context),
        );
        if (changed) this.MarkHistoryMutation();
        return changed;
      },
    );
  }

  /** Reapplies the next Writer action and updates lifecycle against the save mark. @param context - Writer undo context. @returns Whether an action ran. */
  public Redo(context: SwUndoRedoContext): boolean {
    this.EnsureOpen();
    return this.notifications.RunNotificationTransaction(
      /** Executes one shell redo transaction. @returns Whether an action ran. */ () => {
        const changed = this.document.RunModelTransaction(
          /** Executes the current redo action. @returns Whether an action ran. */ () =>
            this.undoManager.Redo(context),
        );
        if (changed) this.MarkHistoryMutation();
        return changed;
      },
    );
  }

  /** Acknowledges a committed recovery snapshot without affecting primary save state. @param generation - Persisted recovery generation. @returns Whether lifecycle changed. */
  public AcknowledgeRecoverySave(generation: number): boolean {
    this.EnsureOpen();
    const changed = this.SetDocumentState(
      markDocumentRecoverySaved(this.documentState, generation),
    );
    this.medium = updateSfxMediumOperation(
      this.medium,
      this.documentState,
      "recovery-save",
      "succeeded",
      generation,
    );
    this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
    return changed;
  }

  /** Atomically replaces model, lifecycle, medium, and history for New/Open/Load. @param document - Replacement model. @param documentState - Replacement lifecycle. @param medium - Replacement medium. @returns Installed model. */
  public ReplaceDocument(
    document: SwDoc,
    documentState: OfficeDocument,
    medium: SfxMediumInput,
  ): SwDoc {
    this.EnsureOpen();
    this.odtRequestGeneration += 1;
    this.odtFilter.Cancel();
    const previous = this.document;
    this.modelClient.Dispose();
    previous.Dispose();
    this.document = document;
    this.ReplaceObjectState(documentState, medium);
    this.undoManager = new SfxUndoManager<SwUndoRedoContext>();
    if (documentState.isModified) this.undoManager.ClearSavePosition();
    this.modelClient.RegisterToModify(document);
    this.notifications.CallSwClientNotify({ kind: "document-replaced" });
    return document;
  }

  /** Replaces the shell contents with a new empty Writer graph. @param metadata - New lifecycle metadata. @param initialTextNodeId - Initial paragraph identity. @returns New model. */
  public InitNew(metadata: OfficeDocument, initialTextNodeId: string): SwDoc {
    return this.ReplaceDocument(new SwDoc(initialTextNodeId), metadata, {
      kind: "untitled",
      name: metadata.title,
    });
  }

  /** Loads an ODT candidate before atomically replacing the active graph. @param bytes - Complete ODT bytes. @param metadata - Fallback lifecycle metadata. @param medium - Open medium. @param options - Filter controls. @returns Loaded model. */
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
    this.EnsureOpen();
    this.odtFilter.Cancel();
    const requestGeneration = ++this.odtRequestGeneration;
    const snapshot = await this.odtFilter.Import(bytes, metadata, options);
    if (requestGeneration !== this.odtRequestGeneration)
      throw new OdtFilterError("stale", "ODT open result is stale.");
    const loaded = restoreWriterSnapshot(snapshot, "primary");
    return this.ReplaceDocument(
      loaded.document,
      loaded.documentState,
      updateSfxMediumOperation(
        createSfxMediumDescriptor(medium, loaded.documentState),
        loaded.documentState,
        "open",
        "succeeded",
        loaded.documentState.contentGeneration,
      ),
    );
  }

  /** Alias for the atomic ODT open boundary. @param bytes - Complete ODT bytes. @param metadata - Fallback metadata. @param medium - Optional open medium. @returns Loaded model. */
  public Load(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    medium?: SfxMediumInput,
  ): Promise<SwDoc> {
    return medium === undefined ? this.Open(bytes, metadata) : this.Open(bytes, metadata, medium);
  }

  /** Serializes a captured active model/state snapshot without changing medium state. @param options - Filter controls. @returns ODT bytes. */
  public SerializeOdt(options?: OdtFilterOperationOptions): Promise<Uint8Array> {
    this.EnsureOpen();
    return this.odtFilter.Export(createWriterSnapshot(this.document, this.documentState), options);
  }

  /** Saves to the current confirmed writable primary medium. @param persist - Confirmed write adapter. @returns Completion after acknowledgement. */
  public Save(
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<SwPrimarySaveEvidence>,
  ): Promise<void> {
    this.EnsureOpen();
    if (
      this.medium.readOnly ||
      !this.medium.capabilities.canWrite ||
      !this.medium.capabilities.canConfirmWrite
    )
      return Promise.reject(new Error("The current medium requires Save As."));
    return this.PerformPrimarySave("save", this.medium, persist, false);
  }

  /** Saves to and adopts a new confirmed writable primary medium. @param medium - Candidate medium. @param persist - Confirmed write adapter. @returns Completion after acknowledgement. */
  public SaveAs(
    medium: SfxMediumInput,
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<SwPrimarySaveEvidence>,
  ): Promise<void> {
    this.EnsureOpen();
    const candidate = createSfxMediumDescriptor(medium, this.documentState);
    if (
      candidate.readOnly ||
      !candidate.capabilities.canWrite ||
      !candidate.capabilities.canConfirmWrite
    )
      return Promise.reject(new Error("Save As requires a confirmed writable medium."));
    return this.PerformPrimarySave("save-as", candidate, persist, true);
  }

  /** Stores an external representation without replacing the primary medium. @param medium - Export target. @param persist - Export adapter. @returns Completion after export. */
  public async Export(
    medium: SfxMediumInput,
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<void> | void,
  ): Promise<void> {
    this.EnsureOpen();
    const generation = this.documentState.contentGeneration;
    const destination = createSfxMediumDescriptor(medium, this.documentState);
    this.SetOperation("export", "pending", generation);
    try {
      await persist(this.document, destination);
      this.SetOperation("export", "succeeded", generation);
    } catch (error) {
      this.SetOperation("export", "failed", generation, getErrorMessage(error));
      throw error;
    }
  }

  /** Starts a browser download, whose completion cannot confirm primary persistence. @param medium - Download target. @param start - Browser adapter. @returns Nothing. */
  public Download(
    medium: SfxMediumInput,
    start: (document: SwDoc, medium: SfxMediumDescriptor) => void,
  ): void {
    this.EnsureOpen();
    const generation = this.documentState.contentGeneration;
    const destination = createSfxMediumDescriptor(medium, this.documentState);
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
    return this.documentState.id;
  }

  /** Returns the lifecycle fields used by generation-aware recovery decisions. @returns Current recovery state. */
  public GetRecoveryState(): Readonly<{
    contentGeneration: number;
    isModified: boolean;
    recoveryGeneration: number | null;
  }> {
    const { contentGeneration, isModified, recoveryGeneration } = this.documentState;
    return { contentGeneration, isModified, recoveryGeneration };
  }

  /** Creates a complete Writer recovery payload without mutating the document. @returns Current snapshot. */
  public CreateRecoverySnapshot(): DocumentSnapshot<WriterSnapshotState> {
    this.EnsureOpen();
    return createWriterSnapshot(this.document, this.documentState);
  }

  /** Records recovery operation start without changing lifecycle generations. @param generation - Attempted generation. @returns Nothing. */
  public RecoverySaveStarted(generation: number): void {
    this.EnsureOpen();
    this.SetOperation("recovery-save", "pending", generation);
  }

  /** Records recovery failure without acknowledging the attempted generation. @param generation - Attempted generation. @param error - Storage error. @returns Nothing. */
  public RecoverySaveFailed(generation: number, error: unknown): void {
    this.EnsureOpen();
    this.SetOperation("recovery-save", "failed", generation, getErrorMessage(error));
  }

  /** Validates and atomically installs one recovered Writer snapshot. @param snapshot - Recovery payload. @returns Nothing. */
  public RestoreRecoverySnapshot(snapshot: DocumentSnapshot<WriterSnapshotState>): void {
    const recovered = restoreWriterSnapshot(snapshot, "recovery");
    this.ReplaceDocument(recovered.document, recovered.documentState, {
      indexedDbKey: snapshot.id,
      kind: "recovery",
      lastOperation: {
        generation: snapshot.version,
        operation: "open",
        state: "succeeded",
      },
      name: recovered.documentState.title,
    });
  }

  /** Closes the shell, model, filter, and broadcaster graph. @returns Nothing. */
  public Close(): void {
    if (this.documentState.lifecycle === "closed") return;
    this.odtRequestGeneration += 1;
    this.odtFilter.Close();
    this.notifications.RunNotificationTransaction(
      /** Publishes the terminal lifecycle transaction. @returns Nothing. */ () => {
        this.CloseObjectShell();
        this.notifications.CallSwClientNotify({ kind: "document-disposed" });
      },
    );
    this.modelClient.Dispose();
    this.document.Dispose();
    this.notifications.DisposeModify();
  }

  /** Synchronizes medium generations whenever object-shell state changes. @param document - Next lifecycle state. @returns Whether state changed. */
  protected override SetDocumentState(document: OfficeDocument): boolean {
    const previousModified = this.documentState.isModified;
    const changed = super.SetDocumentState(document);
    if (changed) {
      this.medium = synchronizeSfxMedium(this.medium, this.documentState);
      if (previousModified !== document.isModified)
        this.notifications.CallSwClientNotify({
          kind: "document-modified",
          modified: document.isModified,
        });
      this.notifications.CallSwClientNotify({ kind: "document-state-changed" });
    }
    return changed;
  }

  /** Reconciles one model transaction with shell lifecycle and republishes its typed hints. @param hint - Model hint. @returns Nothing. */
  private ReceiveModelHint(hint: SwModelHint): void {
    this.notifications.RunNotificationTransaction(
      /** Reconciles and republishes one source transaction. @returns Nothing. */ () => {
        if (isContentMutationHint(hint))
          this.SetDocumentState(markDocumentDirty(this.documentState));
        if (hint.kind === "model-transaction")
          for (const nested of hint.hints) this.notifications.CallSwClientNotify(nested);
        else this.notifications.CallSwClientNotify(hint);
      },
    );
  }

  /** Restores modified state from the undo save mark after history navigation. @returns Nothing. */
  private MarkHistoryMutation(): void {
    this.SetDocumentState(
      markDocumentHistorySavePosition(this.documentState, this.undoManager.IsAtSavePosition()),
    );
  }

  /** Performs primary Save/Save As and adopts the candidate only after commit. @param operation - Save operation. @param candidate - Candidate medium. @param persist - Confirmed adapter. @param replaceMedium - Whether to adopt candidate. @returns Completion after acknowledgement. */
  private async PerformPrimarySave(
    operation: "save" | "save-as",
    candidate: SfxMediumDescriptor,
    persist: (document: SwDoc, medium: SfxMediumDescriptor) => Promise<SwPrimarySaveEvidence>,
    replaceMedium: boolean,
  ): Promise<void> {
    const document = this.document;
    const generation = this.documentState.contentGeneration;
    const savePosition: SfxUndoSavePosition = this.undoManager.CaptureSavePosition();
    this.SetOperation(operation, "pending", generation);
    try {
      const evidence = await persist(document, candidate);
      if (evidence.generation !== generation)
        throw new Error("Primary save evidence does not match the requested generation.");
      if (this.document !== document)
        throw new Error("Primary save completed for a document that is no longer active.");
      this.SetDocumentState(markDocumentSaved(this.documentState, generation));
      this.undoManager.SetSavePosition(savePosition);
      if (replaceMedium) this.medium = candidate;
      this.medium = updateSfxMediumOperation(
        this.medium,
        this.documentState,
        operation,
        "succeeded",
        generation,
      );
      this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
    } catch (error) {
      this.SetOperation(operation, "failed", generation, getErrorMessage(error));
      throw error;
    }
  }

  /** Updates medium operation feedback and publishes typed invalidation. @param operation - Operation kind. @param state - Operation state. @param generation - Captured generation. @param message - Optional failure. @returns Nothing. */
  private SetOperation(
    operation: SfxMediumOperation,
    state: SfxMediumDescriptor["lastOperation"]["state"],
    generation?: number,
    message?: string,
  ): void {
    this.medium = updateSfxMediumOperation(
      this.medium,
      this.documentState,
      operation,
      state,
      generation,
      message,
    );
    this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
  }
}

/** Confirms the exact content generation committed by a primary-medium adapter. */
export interface SwPrimarySaveEvidence {
  readonly generation: number;
}

/** Checks whether a model hint represents serializable Writer content. @param hint - Typed model hint. @returns Whether content changed. */
function isContentMutationHint(hint: SwModelHint): boolean {
  if (hint.kind === "model-transaction") return hint.hints.some(isContentMutationHint);
  return (
    hint.kind === "attribute-set-changed" ||
    hint.kind === "format-inheritance-changed" ||
    hint.kind === "node-content-changed" ||
    hint.kind === "node-inserted" ||
    hint.kind === "node-removed" ||
    hint.kind === "numbering-changed"
  );
}

/** Returns deterministic error feedback without retaining platform Error objects. @param error - Unknown error. @returns Stable message. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
