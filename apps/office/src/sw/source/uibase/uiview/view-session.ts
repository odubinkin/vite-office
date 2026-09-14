/**
 * @fileoverview Implements the persistent SwView session, external-store snapshot, and
 * browser-adapted lifecycle commands from pinned Writer view and document-shell boundaries.
 */

import {
  createCommandShell,
  type CommandDispatchResult,
  type CommandState,
  type OfficeFrame,
  type SfxDispatcher,
  type SfxShell,
} from "../../../../framework/source/dispatch/dispatchprovider";
import type { AutoRecoveryEnvironment } from "../../../../framework/source/services/autorecovery";
import { createDocument, type OfficeDocument } from "../../../../sfx2/source/doc/objsh";
import type { PrimarySavePort, StoredDocumentOpenPort } from "../../../../sfx2/source/doc/docfile";
import type { RecoverySavePort } from "../../../../svl/source/misc/recovery";
import type { DocumentExportPort, DocumentOpenPort } from "../../../../svl/source/misc/storage";
import type { RichClipboardPayload } from "../../../../vcl/browser/browser-clipboard";
import type { WriterSnapshotState } from "../../core/doc/writer-storage";
import { loadWriterDocument, saveWriterDocument } from "../../core/doc/writer-storage";
import type { WriterDocument, WriterParagraph } from "../../core/doc/writer";
import type { SwModelHint } from "../../../inc/hints";
import {
  parseWriterClipboardPaste,
  type WriterClipboardPaste,
  type WriterClipboardSelection,
} from "../dochdl/swdtflvr";
import { SwDocShell } from "../app/docsh";
import { createWriterViewCommandRegistry } from "../shells/writercommands";
import {
  SwWrtShell,
  type WriterCursorSelection,
  type WriterParagraphTextRange,
} from "../wrtsh/wrtsh";

/** Browser capabilities injected by the Writer module composition root. */
export interface WriterSessionServices {
  /** Writes a sanitized rich/plain pair to the browser clipboard. */
  readonly copyRichText: (selection: WriterClipboardSelection) => Promise<void>;
  /** Opens one external document through an injected platform adapter. */
  readonly documentOpen: DocumentOpenPort;
  /** Exports one representation through an injected platform adapter. */
  readonly documentExport: DocumentExportPort;
  /** Creates the browser-safe filename used by download adapters. */
  readonly createDownloadFilename: (title: string, extension: string) => string;
  /** Reads rich clipboard MIME values after a user gesture. */
  readonly readRichClipboard: () => Promise<RichClipboardPayload>;
  /** Optional primary-save port, independently replaceable from stored-document open. */
  readonly primarySave?: PrimarySavePort<WriterSnapshotState>;
  /** Optional stored-document open port, independently replaceable from primary save. */
  readonly storedDocumentOpen?: StoredDocumentOpenPort<WriterSnapshotState>;
  /** Optional recovery-only durable history adapter. */
  readonly recoverySave?: RecoverySavePort<WriterSnapshotState>;
  /** Optional injected browser lifecycle boundary for application AutoRecovery. */
  readonly recoveryEnvironment?: AutoRecoveryEnvironment;
}

/** DOM-adapted Cut arguments accepted by the unified command. */
export interface WriterCutCommandArguments {
  /** True when a native Cut event already populated event.clipboardData. */
  readonly clipboardHandled?: boolean;
  /** Same-paragraph model range deleted only after clipboard preparation. */
  readonly range?: WriterParagraphTextRange;
  /** Sanitized selection used by toolbar or menu Cut. */
  readonly selection?: WriterClipboardSelection;
}

/** DOM-adapted Paste arguments accepted by native and explicit Paste surfaces. */
export interface WriterPasteCommandArguments {
  /** True when a native Paste event supplied the complete clipboard payload, including empty. */
  readonly clipboardHandled?: boolean;
  /** Same-paragraph replacement range, defaulting to the active paragraph end. */
  readonly range?: WriterParagraphTextRange;
  /** Already parsed native clipboard document, omitted for asynchronous toolbar Paste. */
  readonly paste?: WriterClipboardPaste;
}

/** Immutable React read model projected without cloning the canonical SwDoc. */
export interface WriterViewSnapshot {
  /** Active paragraph targeted by Writer commands. */
  readonly activeParagraph: WriterParagraph;
  /** Zero-based active paragraph position. */
  readonly activeParagraphIndex: number;
  /** Canonical shell-owned document reference. */
  readonly document: WriterDocument;
  /** Object-shell-owned identity and lifecycle state. */
  readonly documentState: OfficeDocument;
  /** Direction-preserving persistent SwPaM projection for the DOM selection adapter. */
  readonly cursorSelection: WriterCursorSelection;
  /** Horizontal-ruler visibility in this view. */
  readonly isHorizontalRulerVisible: boolean;
  /** Properties-sidebar visibility in this view. */
  readonly isPropertiesSidebarVisible: boolean;
  /** Whether one browser medium operation is pending. */
  readonly isStoragePending: boolean;
  /** Status-bar visibility in this view. */
  readonly isStatusBarVisible: boolean;
  /** Current lifecycle or browser-operation feedback. */
  readonly storageStatus: string;
  /** Monotonic dispatcher invalidation version. */
  readonly viewVersion: number;
}

/** Persistent Writer view joining SwDocShell, SwWrtShell, frame dispatch, and React snapshots. */
export class SwView {
  private cachedSnapshot: WriterViewSnapshot | undefined;
  private dispatcherSubscription: (() => void) | undefined;
  private frame: OfficeFrame<SwView> | undefined;
  private isHorizontalRulerVisible = true;
  private isPropertiesSidebarVisible = true;
  private isStatusBarVisible = true;
  private isStoragePending = false;
  private readonly listeners = new Set<() => void>();
  private storageStatus = "Not saved in this browser.";
  private readonly viewCommandShell: SfxShell;
  private readonly wrtShell: SwWrtShell;
  private readonly wrtShellSubscription: () => void;

  /** Creates one persistent view over a persistent document shell. @param docShell - Owning Writer document shell. @param services - Injected browser platform services. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    private readonly services: WriterSessionServices,
  ) {
    this.wrtShell = new SwWrtShell(docShell);
    this.viewCommandShell = createCommandShell(this, createWriterViewCommandRegistry(this));
    this.wrtShellSubscription = this.wrtShell.Subscribe(
      /** Converts typed Writer hints into dispatcher dependency invalidation. @param hint - Typed Writer hint. @returns Nothing. */ (
        hint,
      ) => this.Invalidate(...getWriterHintDependencies(hint)),
    );
  }

  /** Attaches this view to its active frame once during session construction. @param frame - Persistent active office frame. @returns Nothing. */
  public AttachFrame(frame: OfficeFrame<SwView>): void {
    if (this.frame !== undefined) throw new Error("SwView is already attached to an OfficeFrame.");
    this.frame = frame;
    this.dispatcherSubscription = frame
      .GetDispatcher()
      .Subscribe(
        /** Publishes one external-store update after dispatcher invalidation. @returns Nothing. */ () =>
          this.PublishSnapshotInvalidation(),
      );
  }

  /** Returns the active document shell. @returns Persistent SwDocShell. */
  public GetDocShell(): SwDocShell {
    return this.docShell;
  }

  /** Returns the persistent Writer editing shell. @returns SwWrtShell. */
  public GetWrtShell(): SwWrtShell {
    return this.wrtShell;
  }

  /** Returns the SwView command shell for bottom-to-top frame registration. @returns View command shell. */
  public GetCommandShell(): SfxShell {
    return this.viewCommandShell;
  }

  /** Returns the active office frame for browser shortcut adaptation. @returns Attached frame. */
  public GetViewFrame(): OfficeFrame<SwView> {
    if (this.frame === undefined) throw new Error("SwView is not attached to an OfficeFrame.");
    return this.frame;
  }

  /** Returns an immutable external-store snapshot, retaining identity until invalidation. @returns Current view read model. */
  public readonly GetSnapshot =
    /** Projects or reuses the current immutable view snapshot. @returns Current view read model. */
    (): WriterViewSnapshot => {
      if (this.cachedSnapshot !== undefined) return this.cachedSnapshot;
      const document = this.docShell.GetDoc();
      const activeParagraph = this.wrtShell.GetActiveParagraph();
      this.cachedSnapshot = Object.freeze({
        activeParagraph,
        activeParagraphIndex: document.paragraphs.indexOf(activeParagraph),
        cursorSelection: Object.freeze(this.wrtShell.GetCursorSelection()),
        document,
        documentState: this.docShell.GetDocumentState(),
        isHorizontalRulerVisible: this.isHorizontalRulerVisible,
        isPropertiesSidebarVisible: this.isPropertiesSidebarVisible,
        isStatusBarVisible: this.isStatusBarVisible,
        isStoragePending: this.isStoragePending,
        storageStatus: this.storageStatus,
        viewVersion: this.GetDispatcher().GetVersion(),
      });
      return this.cachedSnapshot;
    };

  /** Subscribes React or another view consumer to versioned invalidation. @param listener - Store listener. @returns Cleanup removing it. */
  public readonly Subscribe =
    /** Registers one external-store listener. @param listener - Store callback. @returns Cleanup removing it. */
    (listener: () => void): (() => void) => {
      this.listeners.add(listener);
      return /** Removes one external-store listener. @returns Whether the listener was present. */ () =>
        this.listeners.delete(listener);
    };

  /** Dispatches a stable Writer command through the active frame shell stack. @param commandId - Stable command identity. @param arguments_ - Typed UI-adapter arguments. @returns Explicit dispatch result. */
  public Execute(commandId: string, arguments_?: unknown): CommandDispatchResult<unknown> {
    return this.GetDispatcher().Execute(commandId, arguments_);
  }

  /** Queries enabled/checked/value state from the same resolving shell used for execution. @param commandId - Stable command identity. @returns Current command state. */
  public QueryState(commandId: string): CommandState {
    return this.GetDispatcher().QueryState(commandId);
  }

  /** Creates a new document through the existing document shell. @returns Nothing. */
  public NewDocument(): void {
    this.docShell.InitNew(
      createDocument({
        id: "writer-workbench",
        suiteId: "writer",
        title: "Untitled Writer Document",
      }),
      "writer-paragraph-1",
    );
    this.SetStorageStatus("Created a new Writer document.");
  }

  /** Selects and atomically opens one ODT through the persistent document shell. @returns Completion after browser feedback. */
  public async OpenOdt(): Promise<void> {
    this.SetStoragePending(true);
    try {
      const opened = await this.services.documentOpen.open(`${SwDocShell.ODT_MEDIA_TYPE},.odt`);
      if (opened === undefined) {
        this.SetStorageStatus("ODT open cancelled.");
        return;
      }
      const fallbackTitle = opened.name.replace(/\.odt$/i, "") || "Imported Writer Document";
      await this.docShell.Load(
        opened.bytes,
        createDocument({
          id: `writer-odt:${opened.name}`,
          suiteId: "writer",
          title: fallbackTitle,
        }),
        {
          filterId: "writer8",
          kind: "odt-source",
          mediaType: SwDocShell.ODT_MEDIA_TYPE,
          name: opened.name,
          source: { kind: "file", reference: opened.reference },
        },
      );
      this.SetStorageStatus(`Opened ${opened.name}.`);
    } catch (error) {
      this.SetStorageStatus(`Could not open ODT: ${getErrorMessage(error)}`);
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Downloads the active document through Writer's ODT filter. @returns Completion after worker export and download start. */
  public async SaveOdt(): Promise<void> {
    this.SetStoragePending(true);
    try {
      const filename = this.services.createDownloadFilename(
        this.docShell.GetDocumentState().title,
        ".odt",
      );
      const bytes = await this.docShell.SerializeOdt();
      this.docShell.Download(
        {
          downloadTarget: filename,
          filterId: "writer8",
          kind: "download",
          mediaType: SwDocShell.ODT_MEDIA_TYPE,
          name: filename,
        },
        /** Starts the browser download without acknowledging a primary save. @returns Nothing. */
        () =>
          this.services.documentExport.export({
            data: bytes,
            mediaType: SwDocShell.ODT_MEDIA_TYPE,
            name: filename,
          }),
      );
      this.SetStorageStatus(`ODT download started: ${filename}`);
    } catch (error) {
      this.SetStorageStatus(`Could not save ODT: ${getErrorMessage(error)}`);
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Saves the active identity to its browser-local medium. @returns Completion after acknowledgement. */
  public async SaveLocal(): Promise<void> {
    if (this.services.primarySave === undefined) {
      this.SetStorageStatus("Browser storage is unavailable.");
      return;
    }
    this.SetStoragePending(true);
    try {
      const primarySave = this.services.primarySave;
      const medium = this.docShell.GetMedium();
      const persist =
        /** Commits one complete Writer snapshot to browser-local primary storage. @param document - Shell-owned Writer graph. @returns Completion after IndexedDB commit. */
        async (document: WriterDocument) => {
          const saved = await saveWriterDocument(
            primarySave,
            document,
            this.docShell.GetDocumentState(),
          );
          return { generation: saved.snapshot.version };
        };
      if (
        medium.kind === "browser-local" &&
        medium.destination.kind === "indexeddb" &&
        medium.destination.key === this.docShell.GetDocumentState().id
      )
        await this.docShell.Save(persist);
      else
        await this.docShell.SaveAs(
          {
            indexedDbKey: this.docShell.GetDocumentState().id,
            kind: "browser-local",
            name: this.docShell.GetDocumentState().title,
            source: medium.source,
          },
          persist,
        );
      this.SetStorageStatus("Saved locally in this browser.");
    } catch {
      this.SetStorageStatus("Could not save locally.");
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Loads the current document identity from browser-local storage. @returns Completion after optional replacement. */
  public async LoadLocal(): Promise<void> {
    if (this.services.storedDocumentOpen === undefined) {
      this.SetStorageStatus("Browser storage is unavailable.");
      return;
    }
    this.SetStoragePending(true);
    try {
      const result = await loadWriterDocument(
        this.services.storedDocumentOpen,
        this.docShell.GetDocumentState().id,
      );
      if (result.status === "missing") this.SetStorageStatus("No local saved copy exists.");
      else {
        this.docShell.ReplaceDocument(result.document, result.documentState, {
          filterId: "writer-browser-snapshot",
          indexedDbKey: result.documentState.id,
          kind: "browser-local",
          lastOperation: {
            generation: result.documentState.contentGeneration,
            operation: "open",
            state: "succeeded",
          },
          name: result.documentState.title,
        });
        this.SetStorageStatus("Loaded local saved copy.");
      }
    } catch {
      this.SetStorageStatus("Could not load local copy.");
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Starts the existing plain-text export through the injected browser adapter. @returns Nothing. */
  public ExportText(): void {
    try {
      const document = this.docShell.GetDoc();
      const filename = `${this.docShell.GetDocumentState().title}.txt`;
      this.docShell.Download(
        {
          downloadTarget: filename,
          filterId: "Text",
          kind: "download",
          mediaType: "text/plain;charset=utf-8",
          name: filename,
        },
        /** Starts a plain-text browser export without changing primary-medium state. @returns Nothing. */
        () =>
          this.services.documentExport.export({
            data: document.paragraphs
              .map(
                /** Projects one paragraph's visible text. @param paragraph - Writer paragraph. @returns Plain text. */
                (paragraph) => paragraph.text,
              )
              .join("\n"),
            mediaType: "text/plain;charset=utf-8",
            name: filename,
          }),
      );
      this.SetStorageStatus("Plain-text download started.");
    } catch {
      this.SetStorageStatus("Could not start plain-text download.");
    }
  }

  /** Copies one DOM-adapted Writer selection. @param arguments_ - Optional sanitized selection. @returns Completion after feedback. */
  public async Copy(arguments_?: unknown): Promise<void> {
    const selection = (arguments_ as { readonly selection?: WriterClipboardSelection } | undefined)
      ?.selection;
    if (selection === undefined) {
      this.SetStorageStatus("Select text to copy.");
      return;
    }
    try {
      await this.services.copyRichText(selection);
      this.SetStorageStatus("Copied selection.");
    } catch {
      this.SetStorageStatus("Could not copy selection.");
    }
  }

  /** Copies then deletes a same-paragraph Writer selection through one Cut command. @param arguments_ - DOM-adapted Cut request. @returns Completion after feedback. */
  public async Cut(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterCutCommandArguments | undefined;
    if (
      request?.range === undefined ||
      (!request.clipboardHandled && request.selection === undefined)
    ) {
      this.SetStorageStatus("Select text in one paragraph to cut.");
      return;
    }
    try {
      if (!request.clipboardHandled)
        await this.services.copyRichText(request.selection as WriterClipboardSelection);
      this.wrtShell.ReplaceRange(request.range, []);
      this.SetStorageStatus("Cut selection.");
    } catch {
      this.SetStorageStatus("Could not cut selection.");
    }
  }

  /** Inserts native or asynchronously read clipboard content through one Paste command. @param arguments_ - DOM-adapted range and optional native transfer document. @returns Completion after feedback. */
  public async Paste(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterPasteCommandArguments | undefined;
    const active = this.wrtShell.GetActiveParagraph();
    const range = request?.range ?? {
      end: active.text.length,
      paragraphId: active.id,
      start: active.text.length,
    };
    try {
      let paste: WriterClipboardPaste;
      if (request?.paste !== undefined) paste = request.paste;
      else if (request?.clipboardHandled === true) {
        this.SetStorageStatus("Clipboard has no text to paste.");
        return;
      } else {
        const clipboard = await this.services.readRichClipboard();
        const parsedPaste = parseWriterClipboardPaste(clipboard.html, clipboard.plainText);
        if (parsedPaste === undefined) {
          this.SetStorageStatus("Clipboard has no text to paste.");
          return;
        }
        paste = parsedPaste;
      }
      this.wrtShell.Paste(range, paste);
      this.SetStorageStatus("Pasted clipboard text.");
    } catch {
      this.SetStorageStatus("Could not read browser clipboard.");
    }
  }

  /** Selects the complete Writer body through the persistent SwPaM. @returns Nothing. */
  public RequestSelectAll(): void {
    this.wrtShell.SelectAll();
  }

  /** Returns horizontal-ruler command state. @returns Visibility. */
  public IsHorizontalRulerVisible(): boolean {
    return this.isHorizontalRulerVisible;
  }

  /** Returns sidebar command state. @returns Visibility. */
  public IsSidebarVisible(): boolean {
    return this.isPropertiesSidebarVisible;
  }

  /** Returns status-bar command state. @returns Visibility. */
  public IsStatusBarVisible(): boolean {
    return this.isStatusBarVisible;
  }

  /** Returns whether a medium operation gates lifecycle commands. @returns Pending state. */
  public IsStoragePending(): boolean {
    return this.isStoragePending;
  }

  /** Toggles horizontal-ruler visibility. @returns Nothing. */
  public ToggleHorizontalRuler(): void {
    this.isHorizontalRulerVisible = !this.isHorizontalRulerVisible;
    this.Invalidate("view");
  }

  /** Toggles sidebar visibility. @returns Nothing. */
  public ToggleSidebar(): void {
    this.isPropertiesSidebarVisible = !this.isPropertiesSidebarVisible;
    this.Invalidate("view");
  }

  /** Toggles status-bar visibility. @returns Nothing. */
  public ToggleStatusBar(): void {
    this.isStatusBarVisible = !this.isStatusBarVisible;
    this.Invalidate("view");
  }

  /** Releases view, dispatcher, and document-shell subscriptions at explicit session close. @returns Nothing. */
  public Close(): void {
    this.wrtShellSubscription();
    this.dispatcherSubscription?.();
    this.frame?.CloseView();
    this.frame = undefined;
    this.wrtShell.Close();
    this.docShell.Close();
    this.listeners.clear();
  }

  /** Returns the attached active frame dispatcher or throws for invalid construction order. @returns SfxDispatcher. */
  private GetDispatcher(): SfxDispatcher {
    if (this.frame === undefined) throw new Error("SwView is not attached to an OfficeFrame.");
    return this.frame.GetDispatcher();
  }

  /** Invalidates command state through the frame dispatcher. @param dependencies - Changed state labels. @returns Nothing. */
  private Invalidate(...dependencies: readonly string[]): void {
    if (this.frame === undefined) {
      this.cachedSnapshot = undefined;
      return;
    }
    this.GetDispatcher().Invalidate(...dependencies);
  }

  /** Clears the cached snapshot and publishes external-store invalidation. @returns Nothing. */
  private PublishSnapshotInvalidation(): void {
    this.cachedSnapshot = undefined;
    for (const listener of this.listeners) listener();
  }

  /** Changes storage pending state and invalidates lifecycle commands. @param pending - Next pending state. @returns Nothing. */
  private SetStoragePending(pending: boolean): void {
    this.isStoragePending = pending;
    this.Invalidate("lifecycle");
  }

  /** Changes status feedback and invalidates the view read model. @param status - Reader-facing status. @returns Nothing. */
  private SetStorageStatus(status: string): void {
    this.storageStatus = status;
    this.Invalidate("lifecycle");
  }
}

/** Normalizes unknown operation failures for deterministic status feedback. @param error - Caught value. @returns Stable message. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Maps typed Writer notifications to the command-state dependency vocabulary. @param hint - Typed Writer hint. @returns Changed dependency labels. */
function getWriterHintDependencies(hint: SwModelHint): readonly string[] {
  const hints = hint.kind === "model-transaction" ? hint.hints : [hint];
  const dependencies = new Set<string>();
  for (const nested of hints) {
    if (nested.kind === "cursor-selection-changed") dependencies.add("selection");
    else if (
      nested.kind === "document-modified" ||
      nested.kind === "document-state-changed" ||
      nested.kind === "medium-operation-changed" ||
      nested.kind === "document-disposed"
    )
      dependencies.add("lifecycle");
    else if (nested.kind === "document-replaced") {
      dependencies.add("document");
      dependencies.add("history");
      dependencies.add("selection");
    } else {
      dependencies.add("document");
      dependencies.add("history");
    }
  }
  return [...dependencies];
}
