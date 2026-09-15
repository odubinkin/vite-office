/**
 * @fileoverview Owns browser-adapted Writer file, clipboard, local-storage, chrome, and
 * operation-presentation workflows outside the SwView model/view-shell boundary.
 */

import { createDocument } from "../../../sfx2/source/doc/objsh";
import type { PrimarySavePort, StoredDocumentOpenPort } from "../../../sfx2/source/doc/docfile";
import type { DocumentExportPort, DocumentOpenPort } from "../../../svl/source/misc/storage";
import type { RichClipboardPayload } from "../../../vcl/browser/browser-clipboard";
import type { WriterSnapshotState } from "../persistence/writer-storage";
import { loadWriterDocument, saveWriterDocument } from "../persistence/writer-storage";
import type { SwDoc as WriterDocument } from "../../source/core/doc/doc";
import {
  parseWriterClipboardPaste,
  type WriterClipboardPaste,
  type WriterClipboardSelection,
} from "../../source/uibase/dochdl/swdtflvr";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type {
  WriterCutCommandArguments,
  WriterOperationStatus,
  WriterPasteCommandArguments,
  WriterSessionServices,
  WriterViewControllerFactory,
} from "../../source/uibase/uiview/view-session";
import type { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh";

/** Mutable operation state whose typed value is formatted only by browser presentation. */
export class WriterOperationStateController {
  private pending = false;
  private status: WriterOperationStatus = { kind: "idle" };

  /** Creates a state owner with a view-invalidation callback. @param invalidate - Publishes lifecycle changes. @returns Nothing. */
  public constructor(private readonly invalidate: () => void) {}

  /** Reports whether a browser operation currently gates lifecycle commands. @returns Pending state. */
  public IsPending(): boolean {
    return this.pending;
  }

  /** Returns the current typed operation result. @returns Presentation-neutral status. */
  public GetStatus(): WriterOperationStatus {
    return this.status;
  }

  /** Updates pending state and invalidates only on change. @param pending - Next pending state. @returns Nothing. */
  public SetPending(pending: boolean): void {
    if (this.pending === pending) return;
    this.pending = pending;
    this.invalidate();
  }

  /** Publishes one typed operation outcome. @param status - Next status. @returns Nothing. */
  public SetStatus(status: WriterOperationStatus): void {
    this.status = status;
    this.invalidate();
  }
}

/** Transient Writer chrome preferences kept outside the SwView implementation. */
export class WriterChromePreferencesController {
  private horizontalRulerVisible = true;
  private propertiesSidebarVisible = true;
  private statusBarVisible = true;

  /** Creates chrome state with an injected view invalidator. @param invalidate - Publishes preference changes. @returns Nothing. */
  public constructor(private readonly invalidate: () => void) {}

  /** Returns horizontal-ruler visibility. @returns Visibility. */
  public IsHorizontalRulerVisible(): boolean {
    return this.horizontalRulerVisible;
  }

  /** Returns properties-sidebar visibility. @returns Visibility. */
  public IsSidebarVisible(): boolean {
    return this.propertiesSidebarVisible;
  }

  /** Returns status-bar visibility. @returns Visibility. */
  public IsStatusBarVisible(): boolean {
    return this.statusBarVisible;
  }

  /** Toggles horizontal-ruler visibility. @returns Nothing. */
  public ToggleHorizontalRuler(): void {
    this.horizontalRulerVisible = !this.horizontalRulerVisible;
    this.invalidate();
  }

  /** Toggles properties-sidebar visibility. @returns Nothing. */
  public ToggleSidebar(): void {
    this.propertiesSidebarVisible = !this.propertiesSidebarVisible;
    this.invalidate();
  }

  /** Toggles status-bar visibility. @returns Nothing. */
  public ToggleStatusBar(): void {
    this.statusBarVisible = !this.statusBarVisible;
    this.invalidate();
  }
}

/** Narrow browser ports used by file-picker and download workflows. */
export interface WriterFileWorkflowPorts {
  readonly createDownloadFilename: (title: string, extension: string) => string;
  readonly documentExport: DocumentExportPort;
  readonly documentOpen: DocumentOpenPort;
}

/** Browser file/open/export workflow separated from SwView. */
export class WriterFileWorkflowController {
  /** Creates file workflows over a document shell and injected platform ports. @param docShell - Active Writer document shell. @param ports - Browser file ports. @param operations - Typed operation state. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    private readonly ports: WriterFileWorkflowPorts,
    private readonly operations: WriterOperationStateController,
  ) {}

  /** Selects and atomically opens one ODT. @returns Completion after browser feedback state. */
  public async OpenOdt(): Promise<void> {
    this.operations.SetPending(true);
    try {
      const opened = await this.ports.documentOpen.open(`${SwDocShell.ODT_MEDIA_TYPE},.odt`);
      if (opened === undefined) {
        this.operations.SetStatus({ kind: "odt-open-cancelled" });
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
      this.operations.SetStatus({ kind: "odt-opened", name: opened.name });
    } catch (error) {
      this.operations.SetStatus({ detail: getErrorMessage(error), kind: "odt-open-failed" });
    } finally {
      this.operations.SetPending(false);
    }
  }

  /** Downloads the active document through Writer's ODT filter. @returns Completion after export. */
  public async SaveOdt(): Promise<void> {
    this.operations.SetPending(true);
    try {
      const filename = this.ports.createDownloadFilename(
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
        /** Starts the injected ODT download. @returns Adapter result. */ () =>
          this.ports.documentExport.export({
            data: bytes,
            mediaType: SwDocShell.ODT_MEDIA_TYPE,
            name: filename,
          }),
      );
      this.operations.SetStatus({ kind: "odt-download-started", name: filename });
    } catch (error) {
      this.operations.SetStatus({ detail: getErrorMessage(error), kind: "odt-download-failed" });
    } finally {
      this.operations.SetPending(false);
    }
  }

  /** Starts a plain-text export through the injected download adapter. @returns Nothing. */
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
        /** Starts the injected text download. @returns Adapter result. */ () =>
          this.ports.documentExport.export({
            data: document.paragraphs
              .map(
                /** Projects visible paragraph text. @param paragraph - Writer paragraph. @returns Text content. */
                (paragraph) => paragraph.text,
              )
              .join("\n"),
            mediaType: "text/plain;charset=utf-8",
            name: filename,
          }),
      );
      this.operations.SetStatus({ kind: "text-download-started" });
    } catch {
      this.operations.SetStatus({ kind: "text-download-failed" });
    }
  }
}

/** Narrow durable ports used by browser-local Writer persistence. */
export interface WriterLocalStoragePorts {
  readonly primarySave?: PrimarySavePort<WriterSnapshotState>;
  readonly storedDocumentOpen?: StoredDocumentOpenPort<WriterSnapshotState>;
}

/** Browser-local save/load workflow separated from SwView. */
export class WriterLocalStorageController {
  /** Creates local persistence workflows over optional injected ports. @param docShell - Active Writer document shell. @param ports - Browser-local storage ports. @param operations - Typed operation state. @returns Nothing. */
  public constructor(
    private readonly docShell: SwDocShell,
    private readonly ports: WriterLocalStoragePorts,
    private readonly operations: WriterOperationStateController,
  ) {}

  /** Saves the active identity to its browser-local medium. @returns Completion after acknowledgement. */
  public async Save(): Promise<void> {
    if (this.ports.primarySave === undefined) {
      this.operations.SetStatus({ kind: "local-storage-unavailable" });
      return;
    }
    this.operations.SetPending(true);
    try {
      const primarySave = this.ports.primarySave;
      const medium = this.docShell.GetMedium();
      const persist =
        /** Persists one complete Writer snapshot. @param document - Active Writer model. @returns Save generation evidence. */
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
      this.operations.SetStatus({ kind: "local-saved" });
    } catch {
      this.operations.SetStatus({ kind: "local-save-failed" });
    } finally {
      this.operations.SetPending(false);
    }
  }

  /** Loads the active identity from browser-local storage. @returns Completion after replacement. */
  public async Load(): Promise<void> {
    if (this.ports.storedDocumentOpen === undefined) {
      this.operations.SetStatus({ kind: "local-storage-unavailable" });
      return;
    }
    this.operations.SetPending(true);
    try {
      const result = await loadWriterDocument(
        this.ports.storedDocumentOpen,
        this.docShell.GetDocumentState().id,
      );
      if (result.status === "missing") this.operations.SetStatus({ kind: "local-missing" });
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
        this.operations.SetStatus({ kind: "local-loaded" });
      }
    } catch {
      this.operations.SetStatus({ kind: "local-load-failed" });
    } finally {
      this.operations.SetPending(false);
    }
  }
}

/** Narrow clipboard ports used after browser selection adaptation. */
export interface WriterClipboardWorkflowPorts {
  readonly copyRichText: (selection: WriterClipboardSelection) => Promise<void>;
  readonly readRichClipboard: () => Promise<RichClipboardPayload>;
}

/** Browser clipboard workflow separated from SwView and DOM selection conversion. */
export class WriterClipboardWorkflowController {
  /** Creates clipboard commands over an editing shell and injected browser ports. @param wrtShell - Active editing shell. @param ports - Browser clipboard ports. @param operations - Typed operation state. @returns Nothing. */
  public constructor(
    private readonly wrtShell: SwWrtShell,
    private readonly ports: WriterClipboardWorkflowPorts,
    private readonly operations: WriterOperationStateController,
  ) {}

  /** Copies one already-adapted selection. @param arguments_ - Optional sanitized selection. @returns Completion after clipboard write. */
  public async Copy(arguments_?: unknown): Promise<void> {
    const selection = (arguments_ as { readonly selection?: WriterClipboardSelection } | undefined)
      ?.selection;
    if (selection === undefined) {
      this.operations.SetStatus({ kind: "copy-selection-required" });
      return;
    }
    try {
      await this.ports.copyRichText(selection);
      this.operations.SetStatus({ kind: "copied" });
    } catch {
      this.operations.SetStatus({ kind: "copy-failed" });
    }
  }

  /** Copies then deletes a canonical Writer selection. @param arguments_ - Adapted Cut request. @returns Completion after transfer and deletion. */
  public async Cut(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterCutCommandArguments | undefined;
    if (
      request?.cursorSelection === undefined ||
      (!request.clipboardHandled && request.selection === undefined)
    ) {
      this.operations.SetStatus({ kind: "cut-selection-required" });
      return;
    }
    try {
      if (!request.clipboardHandled)
        await this.ports.copyRichText(request.selection as WriterClipboardSelection);
      this.wrtShell.DeleteSelection(request.cursorSelection);
      this.operations.SetStatus({ kind: "cut" });
    } catch {
      this.operations.SetStatus({ kind: "cut-failed" });
    }
  }

  /** Inserts native or asynchronously read clipboard content. @param arguments_ - Adapted Paste request. @returns Completion after insertion. */
  public async Paste(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterPasteCommandArguments | undefined;
    const active = this.wrtShell.GetActiveParagraph();
    const target = request?.cursorSelection ?? {
      end: active.text.length,
      paragraphId: active.id,
      start: active.text.length,
    };
    try {
      let paste: WriterClipboardPaste;
      if (request?.paste !== undefined) paste = request.paste;
      else if (request?.clipboardHandled === true) {
        this.operations.SetStatus({ kind: "paste-empty" });
        return;
      } else {
        const clipboard = await this.ports.readRichClipboard();
        const parsed = parseWriterClipboardPaste(clipboard.html, clipboard.plainText);
        if (parsed === undefined) {
          this.operations.SetStatus({ kind: "paste-empty" });
          return;
        }
        paste = parsed;
      }
      this.wrtShell.Paste(target, paste);
      this.operations.SetStatus({ kind: "pasted" });
    } catch {
      this.operations.SetStatus({ kind: "paste-read-failed" });
    }
  }
}

/** Binds narrow browser workflow controllers to one newly constructed Writer view shell. @param ports - Injected browser capabilities. @returns Neutral controller factory. */
export function createWriterViewControllerFactory(
  ports: WriterSessionServices,
): WriterViewControllerFactory {
  return {
    Create:
      /** Creates controllers for one document/view-shell pair. @param docShell - Active document shell. @param wrtShell - Active editing shell. @param invalidateLifecycle - Lifecycle invalidator. @param invalidateView - Chrome invalidator. @returns Bound controllers. */
      (docShell, wrtShell, invalidateLifecycle, invalidateView) => {
        const operationState = new WriterOperationStateController(invalidateLifecycle);
        return {
          chromePreferences: new WriterChromePreferencesController(invalidateView),
          clipboardWorkflow: new WriterClipboardWorkflowController(wrtShell, ports, operationState),
          fileWorkflow: new WriterFileWorkflowController(docShell, ports, operationState),
          localStorageWorkflow: new WriterLocalStorageController(docShell, ports, operationState),
          operationState,
        };
      },
  };
}

/** Formats typed operation state at the browser presentation boundary. @param status - Typed workflow outcome. @returns User-facing status text. */
export function presentWriterOperationStatus(status: WriterOperationStatus): string {
  switch (status.kind) {
    case "idle":
      return "Not saved in this browser.";
    case "new-document":
      return "Created a new Writer document.";
    case "odt-open-cancelled":
      return "ODT open cancelled.";
    case "odt-opened":
      return `Opened ${status.name}.`;
    case "odt-open-failed":
      return `Could not open ODT: ${status.detail}`;
    case "odt-download-started":
      return `ODT download started: ${status.name}`;
    case "odt-download-failed":
      return `Could not save ODT: ${status.detail}`;
    case "local-storage-unavailable":
      return "Browser storage is unavailable.";
    case "local-saved":
      return "Saved locally in this browser.";
    case "local-save-failed":
      return "Could not save locally.";
    case "local-missing":
      return "No local saved copy exists.";
    case "local-loaded":
      return "Loaded local saved copy.";
    case "local-load-failed":
      return "Could not load local copy.";
    case "text-download-started":
      return "Plain-text download started.";
    case "text-download-failed":
      return "Could not start plain-text download.";
    case "copy-selection-required":
      return "Select text to copy.";
    case "copied":
      return "Copied selection.";
    case "copy-failed":
      return "Could not copy selection.";
    case "cut-selection-required":
      return "Select text in one paragraph to cut.";
    case "cut":
      return "Cut selection.";
    case "cut-failed":
      return "Could not cut selection.";
    case "paste-empty":
      return "Clipboard has no text to paste.";
    case "pasted":
      return "Pasted clipboard text.";
    case "paste-read-failed":
      return "Could not read browser clipboard.";
  }
}

/** Normalizes unknown platform failures into displayable detail at the workflow boundary. @param error - Unknown failure value. @returns Displayable detail. */
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
