/**
 * @fileoverview Reimplements the bounded Writer document-shell load/save boundary from pinned
 * `sw/source/uibase/app/docsh.cxx` and `docshini.cxx`.
 */

import { SfxObjectShell, type SfxObjectShellState } from "../../../../sfx2/source/doc/objsh";
import {
  acquireSfxMedium,
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
import type { DefaultFontDevice } from "../../core/doc/default-font";
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
  private readonly defaultFontDevice: DefaultFontDevice | undefined;
  private readonly defaultLocale: string;

  /** Creates a shell around an existing Writer model and explicit object-shell state. @param document - Active model. @param documentState - Shell lifecycle state. @param medium - Current medium. @param odtFilter - ODT filter service. @returns Nothing. */
  public constructor(
    private document: SwDoc,
    documentState: SfxObjectShellState,
    medium: SfxMediumInput = { kind: "untitled", name: documentState.title },
    private readonly odtFilter: OdtFilterService = createInlineOdtFilterService(),
  ) {
    super(documentState, medium);
    this.defaultFontDevice = document.GetDefaultFontDevice();
    this.defaultLocale = document.GetLocale();
    this.BindUndoManager();
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

  /** Returns the session output device used when constructing document defaults. @returns Device or undefined. */
  public GetDefaultFontDevice(): DefaultFontDevice | undefined {
    return this.defaultFontDevice;
  }

  /** Returns the document-owned action manager. @returns Current undo manager. */
  public GetUndoManager() {
    return this.document.GetUndoManager();
  }

  /** Renames the active document and marks the metadata change as unsaved. @param title - New user-facing title. @returns Whether the title changed. */
  public RenameDocument(title: string): boolean {
    this.EnsureOpen();
    const nextTitle = title.trim();
    if (nextTitle.length === 0) return false;
    const wasModified = this.IsModified();
    const changed = this.SetTitle(nextTitle);
    if (!changed) return false;
    if (!wasModified)
      this.notifications.CallSwClientNotify({ kind: "document-modified", modified: true });
    this.notifications.CallSwClientNotify({ kind: "document-state-changed" });
    return true;
  }

  /** Adopts a committed browser Save As copy while keeping the live Writer model and undo queue. */
  /**
   * Handles the Writer browser operation.
   * @param id - Input value.
   * @param title - Input value.
   * @param generation - Input value.
   * @returns Operation result.
   */ public AdoptSavedBrowserCopy(id: string, title: string, generation: number): void {
    this.EnsureOpen();
    const medium = acquireSfxMedium({
      kind: "primary",
      name: title,
      storageKey: id,
    });
    this.AdoptPrimaryIdentity(id, title, medium);
    this.SaveCompleted(generation);
    if (generation === this.GetContentGeneration()) this.GetUndoManager().SetSavePosition();
    medium.SetOperation("save-as", "succeeded", generation);
    this.notifications.CallSwClientNotify({ kind: "document-state-changed" });
    this.notifications.CallSwClientNotify({ kind: "medium-operation-changed" });
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
        if (changed) this.document.GetUndoManager().ReconcileHistoryPosition();
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
        if (changed) this.document.GetUndoManager().ReconcileHistoryPosition();
        return changed;
      },
    );
  }

  /** Atomically replaces model, lifecycle, medium, and history for New/Open/Load. @param document - Replacement model. @param documentState - Replacement lifecycle. @param medium - Replacement medium. @returns Installed model. */
  public ReplaceDocument(
    document: SwDoc,
    documentState: SfxObjectShellState,
    medium: SfxMediumInputOrInstance,
  ): SwDoc {
    this.EnsureOpen();
    if (document === this.document)
      throw new Error("Replacement document must be a new Writer graph.");
    const replacementState = this.PrepareObjectStateReplacement(documentState, medium);
    this.odtRequestGeneration += 1;
    this.odtFilter.Cancel();
    const previous = this.document;
    this.modelClient.Dispose();
    previous.Dispose();
    this.document = document;
    this.CommitObjectStateReplacement(replacementState);
    this.BindUndoManager();
    if (documentState.isModified) this.document.GetUndoManager().ClearSavePosition();
    this.modelClient.RegisterToModify(document.GetDocumentStateManager());
    this.notifications.CallSwClientNotify({ kind: "document-replaced" });
    return document;
  }

  /** Replaces the shell contents with a new empty Writer graph. @param metadata - New lifecycle metadata. @returns New model. */
  public InitNew(metadata: SfxObjectShellState): SwDoc {
    return this.ReplaceDocument(
      new SwDoc({
        ...(this.defaultFontDevice === undefined
          ? {}
          : { defaultFontDevice: this.defaultFontDevice }),
        locale: this.defaultLocale,
      }),
      metadata,
      {
        kind: "untitled",
        name: metadata.title,
      },
    );
  }

  /** Loads an ODT candidate before atomically replacing the active graph. @param bytes - Complete ODT bytes. @param metadata - Fallback lifecycle metadata. @param medium - Open medium. @param options - Filter controls. @returns Loaded model. */
  public async Open(
    bytes: Uint8Array,
    metadata: SfxObjectShellState,
    medium?: SfxMediumInput,
    options?: OdtFilterOperationOptions,
  ): Promise<SwDoc> {
    this.EnsureOpen();
    this.odtFilter.Cancel();
    const requestGeneration = ++this.odtRequestGeneration;
    const transfer = await this.odtFilter.Import(
      bytes,
      {
        title: metadata.title,
        locale: this.defaultLocale,
      },
      options,
    );
    if (requestGeneration !== this.odtRequestGeneration)
      throw new OdtFilterError("stale", "ODT open result is stale.");
    const loaded = restoreOdtFilterDocument(transfer, this.defaultFontDevice);
    const loadedState: SfxObjectShellState = Object.freeze({
      ...metadata,
      isModified: false,
      lifecycle: "saved",
      recoveryGeneration: null,
      title: loaded.title,
    });
    const openMedium =
      medium ??
      ({
        filterId: "writer8",
        kind: "input",
        mediaType: SwDocShell.ODT_MEDIA_TYPE,
        name: metadata.title,
        source: { kind: "external", reference: bytes },
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
    metadata: SfxObjectShellState,
    medium?: SfxMediumInput,
  ): Promise<SwDoc> {
    return medium === undefined ? this.Open(bytes, metadata) : this.Open(bytes, metadata, medium);
  }

  /** Serializes a captured active model/state snapshot without changing medium state. @param options - Filter controls. @returns ODT bytes. */
  /**
   * Handles the Writer browser operation.
   * @param options - Input value.
   * @param title - Input value.
   * @returns Operation result.
   */ public SerializeOdt(
    options?: OdtFilterOperationOptions,
    title = this.GetTitle(),
  ): Promise<Uint8Array> {
    this.EnsureOpen();
    return this.odtFilter.Export(createOdtFilterDocument(this.document, title), options);
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
    const generation = this.GetContentGeneration();
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

  /** Closes the shell, model, filter, and broadcaster graph. @returns Nothing. */
  public Close(): void {
    if (this.GetDocumentState().lifecycle === "closed") return;
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

  /** Publishes direct object-shell modified transitions. @param modified - Next flag. @param contentChanged - Whether the browser race generation advances. @returns Whether state changed. */
  protected override SetModified(modified = true, contentChanged = false): boolean {
    const previousModified = this.IsModified();
    const changed = super.SetModified(modified, contentChanged);
    if (changed) this.PublishObjectShellState(previousModified);
    return changed;
  }

  /** Publishes successful primary-save transitions. @param generation - Confirmed generation. @returns Whether state changed. */
  protected override SaveCompleted(generation = this.GetContentGeneration()): boolean {
    const previousModified = this.IsModified();
    const changed = super.SaveCompleted(generation);
    if (changed) this.PublishObjectShellState(previousModified);
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

  /** Connects Writer history navigation to object-shell save state. @returns Nothing. */
  private BindUndoManager(): void {
    this.document.GetUndoManager().SetHistoryPositionChanged(
      /** Applies the Writer save mark to shell lifecycle. @param isSavePosition - Whether history matches the last primary save. @returns Nothing. */
      (isSavePosition) => {
        this.SetHistorySavePosition(isSavePosition);
      },
    );
  }

  /** Emits the bounded lifecycle hints for one direct object-shell transition. @param previousModified - Modified flag before the transition. @returns Nothing. */
  private PublishObjectShellState(previousModified: boolean): void {
    if (previousModified !== this.IsModified())
      this.notifications.CallSwClientNotify({
        kind: "document-modified",
        modified: this.IsModified(),
      });
    this.notifications.CallSwClientNotify({ kind: "document-state-changed" });
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
    const generation = this.GetContentGeneration();
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
    hint.kind === "numbering-changed" ||
    hint.kind === "line-number-info-changed"
  );
}

/** Returns deterministic error feedback without retaining platform Error objects. @param error - Unknown error. @returns Stable message. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
