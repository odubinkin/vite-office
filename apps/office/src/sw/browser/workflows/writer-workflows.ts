/**
 * @fileoverview Owns browser-adapted Writer file, clipboard, local-storage, chrome, and
 * operation-presentation workflows outside the SwView model/view-shell boundary.
 */

import type { PrimarySavePort, StoredDocumentOpenPort } from "../../../sfx2/source/doc/docfile";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import type { AutoRecoveryEnvironment } from "../../../framework/source/services/autorecovery";
import type { RecoverySavePort } from "../../../svl/source/misc/recovery";
import type { DocumentExportPort, DocumentOpenPort } from "../../../svl/source/misc/storage";
import type { RichClipboardPayload } from "../../../vcl/browser/browser-clipboard";
import type { WriterSnapshotState } from "../../source/filter/basflt/writer-storage";
import { parseWriterClipboardPaste, type WriterClipboardPaste } from "../filter/html/swhtml";
import type { WriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh";
import { createBrowserWriterPaste } from "../editor/writer-clipboard-events";
import { createWriterInterface, getWriterCommandArguments } from "../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import {
  exportWriterTextToPort,
  loadWriterFromPrimaryPort,
  openWriterOdtFromPort,
  saveWriterOdtToPort,
  saveWriterToPrimaryPort,
} from "./writer-document-io";

/** Browser Cut request after native clipboard-event adaptation. */
export interface WriterCutCommandArguments {
  readonly clipboardHandled?: boolean;
}

/** Browser Paste request after native clipboard-event adaptation. */
export interface WriterPasteCommandArguments {
  readonly clipboardHandled?: boolean;
  readonly paste?: WriterClipboardPaste;
}

/** Browser capabilities injected by the Writer module composition root. */
export interface WriterSessionServices {
  readonly copyRichText: (selection: WriterClipboardSelection) => Promise<void>;
  readonly documentOpen: DocumentOpenPort;
  readonly documentExport: DocumentExportPort;
  readonly createDownloadFilename: (title: string, extension: string) => string;
  readonly readRichClipboard: () => Promise<RichClipboardPayload>;
  readonly primarySave?: PrimarySavePort<WriterSnapshotState>;
  readonly storedDocumentOpen?: StoredDocumentOpenPort<WriterSnapshotState>;
  readonly recoverySave?: RecoverySavePort<WriterSnapshotState>;
  readonly recoveryEnvironment?: AutoRecoveryEnvironment;
}

/** Explicit platform failure retained by Sfx command completion state. */
export class WriterPlatformError extends Error {
  /** Creates an explicit browser-platform failure. @param code - Stable failure category. @param message - User-presentable detail. @returns Nothing. */
  public constructor(
    readonly code: "clipboard-empty" | "selection-required" | "storage-unavailable",
    message: string,
  ) {
    super(message);
    this.name = "WriterPlatformError";
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
  ) {}

  /** Selects and atomically opens one ODT. @returns Completion after browser feedback state. */
  public async OpenOdt(): Promise<void> {
    await openWriterOdtFromPort(this.docShell, this.ports.documentOpen);
  }

  /** Downloads the active document through Writer's ODT filter. @returns Completion after export. */
  public async SaveOdt(): Promise<void> {
    const filename = this.ports.createDownloadFilename(
      this.docShell.GetDocumentState().title,
      ".odt",
    );
    await saveWriterOdtToPort(this.docShell, this.ports.documentExport, filename);
  }

  /** Starts a plain-text export through the injected download adapter. @returns Completion after the browser port settles. */
  public ExportText(): Promise<void> {
    const filename = `${this.docShell.GetDocumentState().title}.txt`;
    return exportWriterTextToPort(this.docShell, this.ports.documentExport, filename);
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
  ) {}

  /** Saves the active identity to its browser-local medium. @returns Completion after acknowledgement. */
  public async Save(): Promise<void> {
    if (this.ports.primarySave === undefined) {
      throw new WriterPlatformError("storage-unavailable", "Browser storage is unavailable.");
    }
    await saveWriterToPrimaryPort(this.docShell, this.ports.primarySave);
  }

  /** Loads the active identity from browser-local storage. @returns Completion after replacement. */
  public async Load(): Promise<void> {
    if (this.ports.storedDocumentOpen === undefined) {
      throw new WriterPlatformError("storage-unavailable", "Browser storage is unavailable.");
    }
    await loadWriterFromPrimaryPort(this.docShell, this.ports.storedDocumentOpen);
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
  ) {}

  /** Copies the current shell SwPaM through SwTransferable. @param _arguments - Ignored browser payload. @returns Completion after clipboard write. */
  public async Copy(_arguments?: unknown): Promise<void> {
    void _arguments;
    const selection = this.wrtShell.CreateTransferable().CreateSelection();
    if (selection === undefined)
      throw new WriterPlatformError("selection-required", "Select text to copy.");
    await this.ports.copyRichText(selection);
  }

  /** Copies then deletes a canonical Writer selection. @param arguments_ - Adapted Cut request. @returns Completion after transfer and deletion. */
  public async Cut(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterCutCommandArguments | undefined;
    if (!request?.clipboardHandled) {
      const selection = this.wrtShell.CreateTransferable().CreateSelection();
      if (selection === undefined)
        throw new WriterPlatformError("selection-required", "Select text to cut.");
      await this.ports.copyRichText(selection);
    }
    if (!this.wrtShell.DeleteSelection())
      throw new WriterPlatformError("selection-required", "Select text to cut.");
  }

  /** Inserts native or asynchronously read clipboard content. @param arguments_ - Adapted Paste request. @returns Completion after insertion. */
  public async Paste(arguments_?: unknown): Promise<void> {
    const request = arguments_ as WriterPasteCommandArguments | undefined;
    let paste: WriterClipboardPaste;
    if (request?.paste !== undefined) paste = request.paste;
    else if (request?.clipboardHandled === true) {
      throw new WriterPlatformError("clipboard-empty", "Clipboard has no text to paste.");
    } else {
      const clipboard = await this.ports.readRichClipboard();
      const parsed = parseWriterClipboardPaste(
        clipboard.html,
        clipboard.plainText,
        globalThis.document,
      );
      if (parsed === undefined)
        throw new WriterPlatformError("clipboard-empty", "Clipboard has no text to paste.");
      paste = parsed;
    }
    this.wrtShell.PasteAtCursor(
      createBrowserWriterPaste(this.wrtShell.GetActiveParagraph(), paste),
    );
  }
}

/** Browser-owned Sfx shell that terminates file, storage, and clipboard commands at adapters. */
export class WriterWorkflowCommandShell {
  private readonly shell: SfxShell;

  /** Creates browser workflow controllers and their command shell. @param docShell - Active Writer document shell. @param wrtShell - Active editing shell. @param ports - Browser capabilities. @returns Nothing. */
  public constructor(docShell: SwDocShell, wrtShell: SwWrtShell, ports: WriterSessionServices) {
    const clipboard = new WriterClipboardWorkflowController(wrtShell, ports);
    const file = new WriterFileWorkflowController(docShell, ports);
    const localStorage = new WriterLocalStorageController(docShell, ports);
    const lifecycleEnabled =
      /** Reads lifecycle command availability. @returns True outside a pending medium operation. */ (): boolean =>
        docShell.GetMedium().lastOperation.state !== "pending";
    this.shell = createSfxShell(
      { clipboard, docShell, file, localStorage },
      createWriterInterface([
        {
          capabilityId: "CAP-0113",
          /** Opens an ODT through the browser file workflow. @returns Completion after import. */
          execute: (): Promise<void> => file.OpenOdt(),
          id: WRITER_COMMAND_IDS.openOdt,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0113",
          /** Exports the active document through the browser download workflow. @returns Completion after export. */
          execute: (): Promise<void> => file.SaveOdt(),
          id: WRITER_COMMAND_IDS.saveOdt,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0114",
          /** Loads the active identity from browser-local storage. @returns Completion after replacement. */
          execute: (): Promise<void> => localStorage.Load(),
          id: WRITER_COMMAND_IDS.openLocal,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0114",
          /** Saves the active identity to browser-local storage. @returns Completion after acknowledgement. */
          execute: (): Promise<void> => localStorage.Save(),
          id: WRITER_COMMAND_IDS.saveLocal,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0101",
          /** Exports the active document as plain text. @returns Completion after download. */
          execute: (): Promise<void> => file.ExportText(),
          id: WRITER_COMMAND_IDS.exportText,
        },
        {
          capabilityId: "CAP-0106",
          /** Copies the canonical Writer selection through the browser clipboard adapter. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after clipboard write. */
          execute: (_context, arguments_): Promise<void> =>
            clipboard.Copy(getWriterCommandArguments<unknown>(arguments_)),
          id: WRITER_COMMAND_IDS.copy,
        },
        {
          capabilityId: "CAP-0110",
          /** Cuts the canonical Writer selection through the browser clipboard adapter. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after deletion. */
          execute: (_context, arguments_): Promise<void> =>
            clipboard.Cut(getWriterCommandArguments<unknown>(arguments_)),
          id: WRITER_COMMAND_IDS.cut,
        },
        {
          capabilityId: "CAP-0110",
          /** Pastes browser clipboard content through Writer operations. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after insertion. */
          execute: (_context, arguments_): Promise<void> =>
            clipboard.Paste(getWriterCommandArguments<unknown>(arguments_)),
          id: WRITER_COMMAND_IDS.paste,
        },
      ]),
    );
  }

  /** Returns the dispatcher-facing browser workflow shell. @returns Registered Sfx shell. */
  public GetShell(): SfxShell {
    return this.shell;
  }
}
