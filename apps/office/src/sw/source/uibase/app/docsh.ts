/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned
 * `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import { SfxObjectShell, type OfficeDocument } from "../../../../sfx2/source/doc/objsh";
import {
  acquireSfxMedium,
  type DocumentSnapshot,
  type SfxMedium,
  type SfxMediumInput,
  type SfxMediumInputOrInstance,
  type SfxMediumOperation,
} from "../../../../sfx2/source/doc/docfile";
import { type SfxUndoAction, type SfxUndoSavePosition } from "../../../../svl/source/undo/undo";
import { ODT_MIMETYPE } from "../../../../package/source/manifest/ManifestExport";
import { SwClient, SwModify, subscribeToSwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SwDoc } from "../../core/doc/doc";
import {
  createWriterSnapshot,
  restoreWriterSnapshot,
  type WriterSnapshotState,
} from "../../filter/basflt/writer-storage";
import type { SwUndoRedoContext } from "../../core/undo/undobj";
import {
  createOdtFilterDocument,
  createInlineOdtFilterService,
  OdtFilterError,
  restoreOdtFilterDocument,
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

  /** Creates a shell around an existing Writer model and explicit object-shell state. @param document - Active model. @param documentState - Shell lifecycle state. @param medium - Current medium. @param odtFilter - ODT filter service. @returns Nothing. */
  public constructor(
    private document: SwDoc,
    documentState: OfficeDocument,
    medium: SfxMediumInput = { kind: "untitled", name: documentState.title },
    private readonly odtFilter: OdtFilterService = createInlineOdtFilterService(),
  ) {
    super(documentState, medium);
    if (documentState.isModified) this.document.GetUndoManager().ClearSavePosition();
    this.modelClient = new SwClient(
      /** Relays one model notification into shell policy. @param _source - Model source. @param hint - Typed hint. @returns Nothing. */ (
        _source,
        hint,
      ) => this.ReceiveModelHint(hint),
    );
    this.modelClient.RegisterToModify(document.GetDocumentStateManager());
  }

  /** Returns the shell-owned Writer model. @returns Active model. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the document-owned action manager. @returns Current undo manager. */
  public GetUndoManager() {
    return this.document.GetUndoManager();
  }

  /** Renames the active document and marks the metadata change as unsaved. @param title - New user-facing title. @returns Whether the title changed. */
  public RenameDocument(title: string): boolean {
    this.EnsureOpen();
    const nextTitle = title.trim();
    if (nextTitle.length === 0 || nextTitle === this.documentState.title) return false;
    return this.SetDocumentState({
      ...this.documentState,
      isModified: true,
      lifecycle: "dirty",
      title: nextTitle,
    });
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
        this.document.GetUndoManager().AddUndoAction(action, tryMerge);
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
            this.document.GetUndoManager().Undo(context),
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
            this.document.GetUndoManager().Redo(context),
        );
        if (changed) this.MarkHistoryMutation();
        return changed;
      },
    );
  }

  /** Acknowledges a committed recovery snapshot without affecting primary save state. @param generation - Persisted recovery generation. @returns Whether lifecycle changed. */
  public AcknowledgeRecoverySave(generation: number): boolean {
    return this.RecoverySaveCompleted(generation);
  }

  /** Atomically replaces model, lifecycle, medium, and history for New/Open/Load. @param document - Replacement model. @param documentState - Replacement lifecycle. @param medium - Replacement medium. @returns Installed model. */
  public ReplaceDocument(
    document: SwDoc,
    documentState: OfficeDocument,
    medium: SfxMediumInputOrInstance,
  ): SwDoc {
    this.EnsureOpen();
    this.odtRequestGeneration += 1;
    this.odtFilter.Cancel();
    const previous = this.document;
    this.modelClient.Dispose();
    previous.Dispose();
    this.document = document;
    this.ReplaceObjectState(documentState, medium);
    if (documentState.isModified) this.document.GetUndoManager().ClearSavePosition();
    this.modelClient.RegisterToModify(document.GetDocumentStateManager());
    this.notifications.CallSwClientNotify({ kind: "document-replaced" });
    return document;
  }

  /** Replaces the shell contents with a new empty Writer graph. @param metadata - New lifecycle metadata. @returns New model. */
  public InitNew(metadata: OfficeDocument): SwDoc {
    return this.ReplaceDocument(new SwDoc(), metadata, {
      kind: "untitled",
      name: metadata.title,
    });
  }

  /** Loads an ODT candidate before atomically replacing the active graph. @param bytes - Complete ODT bytes. @param metadata - Fallback lifecycle metadata. @param medium - Open medium. @param options - Filter controls. @returns Loaded model. */
  public async Open(
    bytes: Uint8Array,
    metadata: OfficeDocument,
    medium?: SfxMediumInput,
    options?: OdtFilterOperationOptions,
  ): Promise<SwDoc> {
    this.EnsureOpen();
    this.odtFilter.Cancel();
    const requestGeneration = ++this.odtRequestGeneration;
    const transfer = await this.odtFilter.Import(bytes, { title: metadata.title }, options);
    if (requestGeneration !== this.odtRequestGeneration)
      throw new OdtFilterError("stale", "ODT open result is stale.");
    const loaded = restoreOdtFilterDocument(transfer);
    const loadedState: OfficeDocument = Object.freeze({
      ...metadata,
      isModified: false,
      lifecycle: "saved",
      recoveryGeneration: null,
      savedGeneration: metadata.contentGeneration,
      title: loaded.title,
    });
    const openMedium =
      medium ??
      ({
        filterId: "writer8",
        kind: "odt-source",
        mediaType: SwDocShell.ODT_MEDIA_TYPE,
        name: metadata.title,
        source: { kind: "blob", reference: bytes },
      } satisfies SfxMediumInput);
    return this.ReplaceDocument(
      loaded.document,
      loadedState,
      setMediumOperation(
        acquireSfxMedium(openMedium),
        "open",
        "succeeded",
        loadedState.contentGeneration,
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
    return this.odtFilter.Export(
      createOdtFilterDocument(this.document, this.documentState.title),
      options,
    );
  }

  /** Saves to the current confirmed writable primary medium. @param persist - Confirmed write adapter. @returns Completion after acknowledgement. */
  public Save(
    persist: (document: SwDoc, medium: SfxMedium) => Promise<SwPrimarySaveEvidence>,
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
    persist: (document: SwDoc, medium: SfxMedium) => Promise<SwPrimarySaveEvidence>,
  ): Promise<void> {
    this.EnsureOpen();
    const candidate = acquireSfxMedium(medium);
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
    persist: (document: SwDoc, medium: SfxMedium) => Promise<void> | void,
  ): Promise<void> {
    this.EnsureOpen();
    const generation = this.documentState.contentGeneration;
    const destination = acquireSfxMedium(medium);
    destination.SetOperation("export", "pending", generation);
    try {
      await persist(this.document, destination);
      destination.SetOperation("export", "succeeded", generation);
    } catch (error) {
      destination.SetOperation("export", "failed", generation, getErrorMessage(error));
      throw error;
    }
  }

  /** Starts a browser download, whose completion cannot confirm primary persistence. @param medium - Download target. @param start - Browser adapter. @returns Nothing. */
  public Download(
    medium: SfxMediumInput,
    start: (document: SwDoc, medium: SfxMedium) => void,
  ): void {
    this.EnsureOpen();
    const generation = this.documentState.contentGeneration;
    const destination = acquireSfxMedium(medium);
    destination.SetOperation("download", "pending", generation);
    try {
      start(this.document, destination);
      destination.SetOperation("download", "unconfirmed", generation);
    } catch (error) {
      destination.SetOperation("download", "failed", generation, getErrorMessage(error));
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
    assertRecoveryGeneration(this.documentState, generation);
  }

  /** Records recovery failure without acknowledging the attempted generation. @param generation - Attempted generation. @param error - Storage error. @returns Nothing. */
  public RecoverySaveFailed(generation: number, error: unknown): void {
    this.EnsureOpen();
    assertRecoveryGeneration(this.documentState, generation);
    void error;
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

  /** Publishes lifecycle changes without copying them into the independent medium. @param document - Next lifecycle state. @returns Whether state changed. */
  protected override SetDocumentState(document: OfficeDocument): boolean {
    const previousModified = this.documentState.isModified;
    const changed = super.SetDocumentState(document);
    if (changed) {
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
        if (isContentMutationHint(hint)) this.SetModified(true, true);
        if (hint.kind === "model-transaction")
          for (const nested of hint.hints) this.notifications.CallSwClientNotify(nested);
        else this.notifications.CallSwClientNotify(hint);
      },
    );
  }

  /** Restores modified state from the undo save mark after history navigation. @returns Nothing. */
  private MarkHistoryMutation(): void {
    this.SetHistorySavePosition(this.document.GetUndoManager().IsAtSavePosition());
  }

  /** Performs primary Save/Save As and adopts the candidate only after commit. @param operation - Save operation. @param candidate - Candidate medium. @param persist - Confirmed adapter. @param replaceMedium - Whether to adopt candidate. @returns Completion after acknowledgement. */
  private async PerformPrimarySave(
    operation: "save" | "save-as",
    candidate: SfxMedium,
    persist: (document: SwDoc, medium: SfxMedium) => Promise<SwPrimarySaveEvidence>,
    replaceMedium: boolean,
  ): Promise<void> {
    const document = this.document;
    const previousMedium = this.medium;
    const generation = this.documentState.contentGeneration;
    const savePosition: SfxUndoSavePosition = this.document.GetUndoManager().CaptureSavePosition();
    const operationMedium = replaceMedium ? candidate : previousMedium;
    operationMedium.SetOperation(operation, "pending", generation);
    this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
    try {
      const evidence = await persist(document, candidate);
      if (evidence.generation !== generation)
        throw new Error("Primary save evidence does not match the requested generation.");
      if (this.document !== document)
        throw new Error("Primary save completed for a document that is no longer active.");
      this.SaveCompleted(generation);
      this.document.GetUndoManager().SetSavePosition(savePosition);
      if (replaceMedium) {
        previousMedium.Close();
        this.medium = candidate;
      }
      this.medium.SetOperation(operation, "succeeded", generation);
      this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
    } catch (error) {
      if (this.document === document) {
        if (replaceMedium) candidate.Close();
        this.medium = previousMedium;
        previousMedium.SetOperation(operation, "failed", generation, getErrorMessage(error));
        this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
      }
      throw error;
    }
  }

  /** Updates medium operation feedback and publishes typed invalidation. @param operation - Operation kind. @param state - Operation state. @param generation - Captured generation. @param message - Optional failure. @returns Nothing. */
  public SetMediumOperation(
    operation: SfxMediumOperation,
    state: SfxMedium["lastOperation"]["state"],
    generation?: number,
    message?: string,
  ): void {
    this.medium.SetOperation(operation, state, generation, message);
    this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
  }
}

/** Records an initial operation while retaining the supplied medium identity. @param medium - Medium identity. @param operation - Operation kind. @param state - Initial state. @param generation - Optional generation. @returns Same medium. */
function setMediumOperation(
  medium: SfxMedium,
  operation: SfxMediumOperation,
  state: SfxMedium["lastOperation"]["state"],
  generation?: number,
): SfxMedium {
  medium.SetOperation(operation, state, generation);
  return medium;
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

/** Rejects impossible recovery callbacks without copying recovery state into SfxMedium. @param document - Shell lifecycle state. @param generation - Attempted recovery generation. @returns Nothing for an existing content generation. */
function assertRecoveryGeneration(document: OfficeDocument, generation: number): void {
  if (!Number.isInteger(generation) || generation < 0 || generation > document.contentGeneration)
    throw new Error("Recovery generation must identify existing document content.");
}

/** Returns deterministic error feedback without retaining platform Error objects. @param error - Unknown error. @returns Stable message. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
