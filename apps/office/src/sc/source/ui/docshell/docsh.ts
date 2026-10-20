/** @fileoverview Bounded ScDocShell lifecycle,ODS filter and shared Sfx history ownership. Browser primary media use existing Sfx acknowledgement/generation contracts;native drawing/formatting services remain unported. */
import { ScDocFunc } from "./docfunc";
import {
  SfxObjectShell,
  createDocument,
  type SfxObjectShellState,
} from "../../../../sfx2/source/doc/objsh";
import {
  acquireSfxMedium,
  type SfxMedium,
  type SfxMediumInput,
  type SfxMediumOperation,
  type SfxMediumOperationState,
} from "../../../../sfx2/source/doc/docfile";
import { SfxUndoManager } from "../../../../svl/source/undo/undo";
import { SfxListener } from "../../../../svl/source/notify/lstner";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScDocument } from "../../../inc/document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  ScXMLImportWrapper,
  writeOdsDocument,
  ODS_MIMETYPE,
  type OdsImportOptions,
} from "../../filter/xml/xmlwrap";
/** Confirmed write belongs to the generation captured before persistence begins. */
export interface ScPrimarySaveEvidence {
  readonly generation: number;
}
/** Native Sfx listener with a browser external-store callback. */
class ShellSubscriber extends SfxListener {
  /** Retains the platform listener. @param listener - Invalidation. @returns Subscriber. */
  constructor(private readonly listener: () => void) {
    super();
  }
  /** Projects original shell hints without owning document state. @returns Nothing. */
  override Notify(): void {
    this.listener();
  }
}
/** Real document shell with canonical model,medium and shared native action history. */
export class ScDocShell extends SfxObjectShell {
  private readonly docFunc = new ScDocFunc(this);
  /** Borrows the native document-function dispatcher. @returns Real owner. */
  GetDocFunc(): ScDocFunc {
    return this.docFunc;
  }
  static readonly ODS_MEDIA_TYPE = ODS_MIMETYPE;
  private readonly undo = new SfxUndoManager<ScDocShell>();
  private openRequest = 0;
  /** Creates an untitled shell or adopts an existing model. @param document - Actual model. @returns Shell. */
  constructor(private document: ScDocument = new ScDocument()) {
    super(
      createDocument({ id: crypto.randomUUID(), suiteId: "calc", title: "Untitled Calc Document" }),
      { kind: "untitled", name: "Untitled Calc Document" },
    );
    if (!document.GetTableCount()) document.InsertTab(0, unicode("Sheet1"));
  }
  /** Borrows the actual document. @returns Model. */
  GetDocument(): ScDocument {
    return this.document;
  }
  /** Borrows shared action history. @returns History. */
  GetUndoManager(): SfxUndoManager<ScDocShell> {
    return this.undo;
  }
  /** Adapts actual Sfx notification registrations to a browser subscriber. @param listener - Invalidation. @returns Cleanup. */
  Subscribe(listener: () => void): () => void {
    const subscriber = new ShellSubscriber(listener);
    subscriber.StartListening(this);
    return /** Ends reciprocal source registration. @returns Nothing. */ () => subscriber.Dispose();
  }
  /** Publishes changed shell state through the native broadcaster. @returns Nothing. */
  private Changed(): void {
    this.Broadcast(new SfxHint(SfxHintId.DocChanged));
  }
  /** Marks a committed model edit and advances the persistence race generation. @returns Nothing. */
  SetDocumentModified(): void {
    this.SetModified(true, true);
    this.Changed();
  }
  /** Updates the shell title without replacing its model. @param title - Name. @returns Whether changed. */
  Rename(title: string): boolean {
    const changed = this.SetTitle(title.trim());
    if (changed) this.Changed();
    return changed;
  }
  /** Applies source history and reconciles modified state. @returns Changed. */
  Undo(): boolean {
    this.EnsureOpen();
    const changed = this.undo.Undo(this);
    if (changed) {
      this.SetModified(!this.undo.IsAtSavePosition(), true);
      this.Changed();
    }
    return changed;
  }
  /** Reapplies source history. @returns Changed. */
  Redo(): boolean {
    this.EnsureOpen();
    const changed = this.undo.Redo(this);
    if (changed) {
      this.SetModified(!this.undo.IsAtSavePosition(), true);
      this.Changed();
    }
    return changed;
  }
  /** Releases semantic subscriptions owned by one displaced model. @param document - Model. @returns Nothing. */
  private DisposeDocument(document: ScDocument): void {
    document.DisposeAttributes();
    for (let tab = 0; tab < document.GetTableCount(); tab++) {
      const iterator = new ScHorizontalCellIterator(
          document,
          tab,
          0,
          0,
          document.MaxCol(),
          document.MaxRow(),
        ),
        col: [number] = [0],
        row: [number] = [0];
      let cell;
      while ((cell = iterator.GetNext(col, row))) cell.getFormula()?.Dispose();
    }
  }
  /** Atomically installs model,state,medium and a fresh history. @param document - New graph. @param state - Lifecycle. @param medium - Source/destination. @returns Installed model. */
  ReplaceDocument(
    document: ScDocument,
    state: SfxObjectShellState,
    medium: SfxMediumInput | SfxMedium,
  ): ScDocument {
    this.EnsureOpen();
    if (document === this.document)
      throw new Error("Replacement document must be a new Calc graph.");
    const replacement = this.PrepareObjectStateReplacement(state, medium);
    if (!document.GetTableCount()) document.InsertTab(0, unicode("Sheet1"));
    this.openRequest++;
    const previous = this.document;
    this.document = document;
    this.CommitObjectStateReplacement(replacement);
    this.undo.Clear();
    if (state.isModified) this.undo.ClearSavePosition();
    else this.undo.SetSavePosition();
    this.DisposeDocument(previous);
    this.Changed();
    return document;
  }
  /** Reads a separate ODS candidate and installs it only if the request/model generation remains current. @param bytes - Package. @param metadata - Browser identity. @param medium - Open route. @param options - Filter controls. @returns Installed model. */
  async Open(
    bytes: Uint8Array,
    metadata: SfxObjectShellState,
    medium?: SfxMediumInput,
    options: OdsImportOptions = {},
  ): Promise<ScDocument> {
    this.EnsureOpen();
    const request = ++this.openRequest,
      generation = this.GetContentGeneration(),
      candidate = new ScDocument();
    try {
      await new ScXMLImportWrapper(candidate).Import(bytes, {
        ...options,
        isCancelled: /** Cancels stale source work. @returns Cancelled. */ () =>
          request !== this.openRequest ||
          generation !== this.GetContentGeneration() ||
          options.isCancelled?.() === true,
      });
      this.EnsureOpen();
      if (request !== this.openRequest || generation !== this.GetContentGeneration())
        throw new Error("ODS open result is stale.");
      const input = acquireSfxMedium(
        medium ?? {
          kind: "input",
          name: metadata.title,
          filterId: "calc8",
          mediaType: ODS_MIMETYPE,
          source: { kind: "external", reference: bytes },
        },
      );
      input.SetOperation("open", "succeeded", metadata.contentGeneration);
      return this.ReplaceDocument(
        candidate,
        { ...metadata, isModified: false, lifecycle: "saved" },
        input,
      );
    } catch (error) {
      this.DisposeDocument(candidate);
      throw error;
    }
  }
  /** Serializes committed actual cells through the existing ODS wrapper. @returns ODS package. */
  SerializeOds(): Uint8Array {
    this.EnsureOpen();
    return writeOdsDocument(this.document);
  }
  /** Saves to the current confirmed primary destination. @param persist - Confirmed adapter. @returns Completion. */
  Save(
    persist: (document: ScDocument, medium: SfxMedium) => Promise<ScPrimarySaveEvidence>,
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
  /** Saves a primary copy and adopts it only after confirmed persistence. @param medium - New primary. @param persist - Confirmed adapter. @returns Completion. */
  SaveAs(
    medium: SfxMediumInput,
    persist: (document: ScDocument, medium: SfxMedium) => Promise<ScPrimarySaveEvidence>,
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
  /** Preserves source model/history/medium identities across asynchronous browser writes. @param operation - Kind. @param candidate - Destination. @param persist - Confirmed adapter. @param replace - Adopt destination. @returns Completion. */
  private async PerformPrimarySave(
    operation: "save" | "save-as",
    candidate: SfxMedium,
    persist: (document: ScDocument, medium: SfxMedium) => Promise<ScPrimarySaveEvidence>,
    replace: boolean,
  ): Promise<void> {
    const document = this.document,
      previous = this.medium,
      generation = this.GetContentGeneration(),
      position = this.undo.CaptureSavePosition();
    candidate.SetOperation(operation, "pending", generation);
    this.Changed();
    try {
      const evidence = await persist(document, candidate);
      this.EnsureOpen();
      if (evidence.generation !== generation)
        throw new Error("Primary save evidence does not match the requested generation.");
      if (this.document !== document || this.medium !== previous)
        throw new Error("Primary save completed for a document that is no longer active.");
      if (replace)
        this.AdoptPrimaryIdentity(
          (candidate.destination as { key: string }).key,
          candidate.name,
          candidate,
        );
      this.SaveCompleted(generation);
      this.undo.SetSavePosition(position);
      candidate.SetOperation(operation, "succeeded", generation);
      this.Changed();
    } catch (error) {
      if (replace) candidate.Close();
      if (
        this.document === document &&
        this.GetDocumentState().lifecycle !== "closed" &&
        this.medium === previous
      )
        this.SetMediumOperation(
          operation,
          "failed",
          generation,
          error instanceof Error ? error.message : String(error),
        );
      throw error;
    }
  }
  /** Exports an external representation without adopting its medium or acknowledging primary save. @param medium - Export destination. @param persist - Suite platform adapter. @returns Completion. */
  async Export(
    medium: SfxMediumInput,
    persist: (document: ScDocument, medium: SfxMedium) => Promise<void> | void,
  ): Promise<void> {
    this.EnsureOpen();
    const generation = this.GetContentGeneration(),
      destination = acquireSfxMedium(medium);
    destination.SetOperation("export", "pending", generation);
    try {
      await persist(this.document, destination);
      destination.SetOperation("export", "succeeded", generation);
    } catch (error) {
      destination.SetOperation(
        "export",
        "failed",
        generation,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
  /** Retains browser operation feedback on the actual medium. @param operation - Kind. @param state - Outcome. @param generation - Captured content generation. @param message - Error detail. @returns Nothing. */
  SetMediumOperation(
    operation: SfxMediumOperation,
    state: SfxMediumOperationState,
    generation: number,
    message?: string,
  ): void {
    this.medium.SetOperation(operation, state, generation, message);
    this.Changed();
  }
  /** Ends pending imports,formula registrations and native broadcaster/history resources once. @returns Nothing. */
  Close(): void {
    if (!this.CloseObjectShell()) return;
    this.openRequest++;
    this.DisposeDocument(this.document);
    this.undo.Clear();
    this.Dispose();
  }
}
