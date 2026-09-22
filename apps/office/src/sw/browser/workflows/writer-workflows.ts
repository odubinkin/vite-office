/**
 * @fileoverview Owns browser-adapted Writer file, clipboard, local-storage, chrome, and
 * operation-presentation workflows outside the SwView model/view-shell boundary.
 */

import type { PrimarySavePort, StoredDocumentOpenPort } from "../../../sfx2/source/doc/docfile";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import type { DocumentExportPort, DocumentOpenPort } from "../../../svl/source/misc/storage";
import type { RichClipboardPayload } from "../../../vcl/browser/browser-clipboard";
import type { WriterSnapshotState } from "../storage/writer-storage";
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

/** Copies the current SwPaM through the injected browser clipboard port. @param wrtShell - Editing shell. @param copyRichText - Browser write port. @returns Completion after transfer. */
export async function copyWriterSelection(
  wrtShell: SwWrtShell,
  copyRichText: WriterSessionServices["copyRichText"],
): Promise<void> {
  const selection = wrtShell.CreateTransferable().CreateSelection();
  if (selection === undefined)
    throw new WriterPlatformError("selection-required", "Select text to copy.");
  await copyRichText(selection);
}

/** Copies when needed and then deletes the canonical selection. @param wrtShell - Editing shell. @param copyRichText - Browser write port. @param request - Adapted native Cut request. @returns Completion after deletion. */
export async function cutWriterSelection(
  wrtShell: SwWrtShell,
  copyRichText: WriterSessionServices["copyRichText"],
  request?: WriterCutCommandArguments,
): Promise<void> {
  if (!request?.clipboardHandled) await copyWriterSelection(wrtShell, copyRichText);
  if (!wrtShell.DeleteSelection())
    throw new WriterPlatformError("selection-required", "Select text to cut.");
}

/** Inserts an adapted or asynchronously read browser clipboard payload. @param wrtShell - Editing shell. @param readRichClipboard - Browser read port. @param request - Adapted Paste request. @returns Completion after insertion. */
export async function pasteWriterClipboard(
  wrtShell: SwWrtShell,
  readRichClipboard: WriterSessionServices["readRichClipboard"],
  request?: WriterPasteCommandArguments,
): Promise<void> {
  let paste: WriterClipboardPaste;
  if (request?.paste !== undefined) paste = request.paste;
  else if (request?.clipboardHandled === true)
    throw new WriterPlatformError("clipboard-empty", "Clipboard has no text to paste.");
  else {
    const clipboard = await readRichClipboard();
    const parsed = parseWriterClipboardPaste(
      clipboard.html,
      clipboard.plainText,
      globalThis.document,
    );
    if (parsed === undefined)
      throw new WriterPlatformError("clipboard-empty", "Clipboard has no text to paste.");
    paste = parsed;
  }
  wrtShell.PasteAtCursor(createBrowserWriterPaste(wrtShell.GetActiveParagraph(), paste));
}

/** Browser-owned Sfx shell that terminates file, storage, and clipboard commands at adapters. */
export class WriterWorkflowCommandShell {
  private readonly shell: SfxShell;

  /** Creates one thin browser Sfx shell over document, medium, transferable, and platform ports. @param docShell - Active Writer document shell. @param wrtShell - Active editing shell. @param ports - Browser capabilities. @returns Nothing. */
  public constructor(docShell: SwDocShell, wrtShell: SwWrtShell, ports: WriterSessionServices) {
    const lifecycleEnabled =
      /** Reads lifecycle command availability. @returns True outside a pending medium operation. */ (): boolean =>
        docShell.GetMedium().lastOperation.state !== "pending";
    this.shell = createSfxShell(
      { docShell, ports, wrtShell },
      createWriterInterface([
        {
          capabilityId: "CAP-0113",
          /** Opens an ODT through the browser file workflow. @returns Completion after import. */
          execute: async (): Promise<void> => {
            await openWriterOdtFromPort(docShell, ports.documentOpen);
          },
          id: WRITER_COMMAND_IDS.openOdt,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0113",
          /** Exports the active document through the browser download workflow. @returns Completion after export. */
          execute: (): Promise<void> =>
            saveWriterOdtToPort(
              docShell,
              ports.documentExport,
              ports.createDownloadFilename(docShell.GetTitle(), ".odt"),
            ),
          id: WRITER_COMMAND_IDS.saveOdt,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0114",
          /** Loads the active identity from browser-local storage. @returns Completion after replacement. */
          execute: async (): Promise<"loaded" | "missing"> => {
            if (ports.storedDocumentOpen === undefined)
              throw new WriterPlatformError(
                "storage-unavailable",
                "Browser storage is unavailable.",
              );
            return await loadWriterFromPrimaryPort(docShell, ports.storedDocumentOpen);
          },
          id: WRITER_COMMAND_IDS.openLocal,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0114",
          /** Saves the active identity to browser-local storage. @returns Completion after acknowledgement. */
          execute: async (): Promise<void> => {
            if (ports.primarySave === undefined)
              throw new WriterPlatformError(
                "storage-unavailable",
                "Browser storage is unavailable.",
              );
            await saveWriterToPrimaryPort(docShell, ports.primarySave);
          },
          id: WRITER_COMMAND_IDS.saveLocal,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0101",
          /** Exports the active document as plain text. @returns Completion after download. */
          execute: (): Promise<void> =>
            exportWriterTextToPort(docShell, ports.documentExport, `${docShell.GetTitle()}.txt`),
          id: WRITER_COMMAND_IDS.exportText,
        },
        {
          capabilityId: "CAP-0106",
          /** Copies the canonical Writer selection through the browser clipboard adapter. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after clipboard write. */
          execute: (): Promise<void> => copyWriterSelection(wrtShell, ports.copyRichText),
          id: WRITER_COMMAND_IDS.copy,
        },
        {
          capabilityId: "CAP-0110",
          /** Cuts the canonical Writer selection through the browser clipboard adapter. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after deletion. */
          execute: (_context, arguments_): Promise<void> =>
            cutWriterSelection(
              wrtShell,
              ports.copyRichText,
              getWriterCommandArguments<WriterCutCommandArguments>(arguments_),
            ),
          id: WRITER_COMMAND_IDS.cut,
        },
        {
          capabilityId: "CAP-0110",
          /** Pastes browser clipboard content through Writer operations. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after insertion. */
          execute: (_context, arguments_): Promise<void> =>
            pasteWriterClipboard(
              wrtShell,
              ports.readRichClipboard,
              getWriterCommandArguments<WriterPasteCommandArguments>(arguments_),
            ),
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
