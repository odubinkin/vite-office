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
import { createDocument } from "../../../../sfx2/source/doc/docfac";
import type { DocumentStorageAdapter } from "../../../../sfx2/source/doc/docfile";
import type { RichClipboardPayload } from "../../../../vcl/browser/browser-clipboard";
import type { WriterParagraphTextRange } from "../../core/doc/DocumentContentOperationsManager";
import type { WriterSnapshotState } from "../../core/doc/writer-storage";
import { loadWriterDocument, saveWriterDocument } from "../../core/doc/writer-storage";
import type {
  WriterCharacterAttributes,
  WriterDocument,
  WriterParagraph,
  WriterTextRun,
} from "../../core/doc/writer";
import { parseWriterClipboardPaste, type WriterClipboardSelection } from "../dochdl/swdtflvr";
import { SwDocShell } from "../app/docsh";
import { createWriterViewCommandRegistry } from "../shells/writercommands";
import { SwWrtShell } from "../wrtsh/wrtsh";

/** Browser capabilities injected by the Writer module composition root. */
export interface WriterSessionServices {
  /** Writes a sanitized rich/plain pair to the browser clipboard. */
  readonly copyRichText: (selection: WriterClipboardSelection) => Promise<void>;
  /** Starts a browser download for exact bytes and media type. */
  readonly downloadBytes: (bytes: Uint8Array, mediaType: string, filename: string) => void;
  /** Creates the browser-safe filename used by download adapters. */
  readonly createDownloadFilename: (title: string, extension: string) => string;
  /** Starts a UTF-8 plain-text download. */
  readonly downloadPlainText: (text: string, filename: string) => void;
  /** Reads a selected browser File into bytes. */
  readonly readFile: (file: Blob) => Promise<Uint8Array>;
  /** Reads rich clipboard MIME values after a user gesture. */
  readonly readRichClipboard: () => Promise<RichClipboardPayload>;
  /** Opens a single-file browser picker. */
  readonly selectFile: (accept: string) => Promise<File | undefined>;
  /** Optional local primary-medium adapter. */
  readonly storage?: DocumentStorageAdapter<WriterSnapshotState>;
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
  /** Already parsed native clipboard runs, omitted for asynchronous toolbar Paste. */
  readonly runs?: readonly WriterTextRun[];
}

/** Immutable React read model projected without cloning the canonical SwDoc. */
export interface WriterViewSnapshot {
  /** Active paragraph targeted by Writer commands. */
  readonly activeParagraph: WriterParagraph;
  /** Zero-based active paragraph position. */
  readonly activeParagraphIndex: number;
  /** Canonical shell-owned document reference. */
  readonly document: WriterDocument;
  /** Post-transaction browser caret target. */
  readonly focusParagraphId: string | undefined;
  /** Post-transaction browser caret offset. */
  readonly focusParagraphOffset: number | undefined;
  /** Monotonic browser focus request identity. */
  readonly focusRequestId: number | undefined;
  /** Horizontal-ruler visibility in this view. */
  readonly isHorizontalRulerVisible: boolean;
  /** Properties-sidebar visibility in this view. */
  readonly isPropertiesSidebarVisible: boolean;
  /** Whether one browser medium operation is pending. */
  readonly isStoragePending: boolean;
  /** Status-bar visibility in this view. */
  readonly isStatusBarVisible: boolean;
  /** Pending direct character attributes at the shell cursor. */
  readonly pendingCharacterAttributes: WriterCharacterAttributes;
  /** Monotonic Select All request identity for the DOM adapter. */
  readonly selectAllRequestId: number | undefined;
  /** Current lifecycle or browser-operation feedback. */
  readonly storageStatus: string;
  /** Monotonic dispatcher invalidation version. */
  readonly viewVersion: number;
}

/** Persistent Writer view joining SwDocShell, SwWrtShell, frame dispatch, and React snapshots. */
export class SwView {
  private cachedSnapshot: WriterViewSnapshot | undefined;
  private dispatcherSubscription: (() => void) | undefined;
  private readonly docShellSubscription: () => void;
  private frame: OfficeFrame<SwView> | undefined;
  private isHorizontalRulerVisible = true;
  private isPropertiesSidebarVisible = true;
  private isStatusBarVisible = true;
  private isStoragePending = false;
  private readonly listeners = new Set<() => void>();
  private selectAllRequestId: number | undefined;
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
    this.docShellSubscription = docShell.Subscribe(
      /** Invalidates document-derived state after a document-shell notification. @returns Nothing. */ () =>
        this.Invalidate("document", "history"),
    );
    this.wrtShellSubscription = this.wrtShell.Subscribe(
      /** Invalidates selection-derived state after an editing-shell notification. @returns Nothing. */ () =>
        this.Invalidate("selection"),
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
      const focus = this.wrtShell.GetFocusTarget();
      this.cachedSnapshot = Object.freeze({
        activeParagraph,
        activeParagraphIndex: document.paragraphs.indexOf(activeParagraph),
        document,
        focusParagraphId: focus?.paragraphId,
        focusParagraphOffset: focus?.offset,
        focusRequestId: focus?.requestId,
        isHorizontalRulerVisible: this.isHorizontalRulerVisible,
        isPropertiesSidebarVisible: this.isPropertiesSidebarVisible,
        isStatusBarVisible: this.isStatusBarVisible,
        isStoragePending: this.isStoragePending,
        pendingCharacterAttributes: Object.freeze(this.wrtShell.GetPendingCharacterAttributes()),
        selectAllRequestId: this.selectAllRequestId,
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
    this.wrtShell.DocumentReplaced();
    this.SetStorageStatus("Created a new Writer document.");
  }

  /** Selects and atomically opens one ODT through the persistent document shell. @returns Completion after browser feedback. */
  public async OpenOdt(): Promise<void> {
    this.SetStoragePending(true);
    try {
      const file = await this.services.selectFile(`${SwDocShell.ODT_MEDIA_TYPE},.odt`);
      if (file === undefined) {
        this.SetStorageStatus("ODT open cancelled.");
        return;
      }
      const fallbackTitle = file.name.replace(/\.odt$/i, "") || "Imported Writer Document";
      await this.docShell.Load(
        await this.services.readFile(file),
        createDocument({
          id: `writer-odt:${file.name}`,
          suiteId: "writer",
          title: fallbackTitle,
        }),
        { kind: "file", mediaType: SwDocShell.ODT_MEDIA_TYPE, name: file.name },
      );
      this.wrtShell.DocumentReplaced();
      this.SetStorageStatus(`Opened ${file.name}.`);
    } catch (error) {
      this.SetStorageStatus(`Could not open ODT: ${getErrorMessage(error)}`);
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Downloads the active document through Writer's ODT filter. @returns Nothing. */
  public SaveOdt(): void {
    this.SetStoragePending(true);
    try {
      const document = this.docShell.GetDoc();
      const filename = this.services.createDownloadFilename(document.document.title, ".odt");
      this.services.downloadBytes(this.docShell.SaveAs(), SwDocShell.ODT_MEDIA_TYPE, filename);
      this.SetStorageStatus(`ODT download started: ${filename}`);
    } catch (error) {
      this.SetStorageStatus(`Could not save ODT: ${getErrorMessage(error)}`);
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Saves the active identity to its browser-local medium. @returns Completion after acknowledgement. */
  public async SaveLocal(): Promise<void> {
    if (this.services.storage === undefined) {
      this.SetStorageStatus("Browser storage is unavailable.");
      return;
    }
    this.SetStoragePending(true);
    try {
      const saved = await saveWriterDocument(this.services.storage, this.docShell.GetDoc());
      this.wrtShell.AcknowledgeSave(saved.snapshot.version);
      this.SetStorageStatus("Saved locally in this browser.");
    } catch {
      this.SetStorageStatus("Could not save locally.");
    } finally {
      this.SetStoragePending(false);
    }
  }

  /** Loads the current document identity from browser-local storage. @returns Completion after optional replacement. */
  public async LoadLocal(): Promise<void> {
    if (this.services.storage === undefined) {
      this.SetStorageStatus("Browser storage is unavailable.");
      return;
    }
    this.SetStoragePending(true);
    try {
      const result = await loadWriterDocument(
        this.services.storage,
        this.docShell.GetDoc().document.id,
      );
      if (result.status === "missing") this.SetStorageStatus("No local saved copy exists.");
      else {
        this.docShell.ReplaceDocument(result.writerDocument, {
          kind: "browser-local",
          name: result.writerDocument.document.id,
        });
        this.wrtShell.DocumentReplaced();
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
      this.services.downloadPlainText(
        document.paragraphs
          .map(
            /** Projects one paragraph's visible text. @param paragraph - Writer paragraph. @returns Plain text. */
            (paragraph) => paragraph.text,
          )
          .join("\n"),
        `${document.document.title}.txt`,
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

  /** Inserts native or asynchronously read clipboard text through one Paste command. @param arguments_ - DOM-adapted range and optional native runs. @returns Completion after feedback. */
  public async Paste(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterPasteCommandArguments | undefined;
    const active = this.wrtShell.GetActiveParagraph();
    const range = request?.range ?? {
      end: active.text.length,
      paragraphId: active.id,
      start: active.text.length,
    };
    try {
      let pasteRuns: readonly WriterTextRun[];
      if (request?.runs !== undefined) pasteRuns = request.runs;
      else if (request?.clipboardHandled === true) {
        this.SetStorageStatus("Clipboard has no text to paste.");
        return;
      } else {
        const clipboard = await this.services.readRichClipboard();
        const paste = parseWriterClipboardPaste(clipboard.html, clipboard.plainText);
        if (paste === undefined) {
          this.SetStorageStatus("Clipboard has no text to paste.");
          return;
        }
        pasteRuns = paste.runs;
      }
      this.wrtShell.ReplaceRange(range, pasteRuns);
      this.SetStorageStatus("Pasted clipboard text.");
    } catch {
      this.SetStorageStatus("Could not read browser clipboard.");
    }
  }

  /** Requests a fresh DOM Select All projection. @returns Nothing. */
  public RequestSelectAll(): void {
    this.selectAllRequestId =
      this.selectAllRequestId === undefined ? 0 : this.selectAllRequestId + 1;
    this.Invalidate("selection");
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
    this.docShellSubscription();
    this.wrtShellSubscription();
    this.dispatcherSubscription?.();
    this.frame?.CloseView();
    this.frame = undefined;
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
