/**
 * @fileoverview Owns browser-adapted Writer file, clipboard, local-storage, chrome, and
 * operation-presentation workflows outside the SwView model/view-shell boundary.
 */

import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import type { DocumentExportPort, DocumentOpenPort } from "../../../svl/source/misc/storage";
import type { RichClipboardPayload } from "../../../vcl/browser/browser-clipboard";
import type { WriterOdtStore } from "../storage/writer-odt-store";
import type { WriterFileDialogController } from "./writer-file-dialog-controller";
import { parseWriterClipboardPaste } from "../filter/html/swhtml";
import { createWriterTransferDocument } from "../editor/writer-clipboard-events";
import type { WriterClipboardSelection } from "../../source/uibase/dochdl/swdtflvr";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh";
import { createWriterInterface } from "../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";

/** Browser capabilities injected by the Writer module composition root. */
export interface WriterSessionServices {
  readonly copyRichText: (selection: WriterClipboardSelection) => Promise<void>;
  readonly documentOpen: DocumentOpenPort;
  readonly documentExport: DocumentExportPort;
  readonly createDownloadFilename: (title: string, extension: string) => string;
  readonly readRichClipboard: () => Promise<RichClipboardPayload>;
  readonly odtStore?: WriterOdtStore;
  readonly fileDialogs?: WriterFileDialogController;
}

/** Explicit platform failure retained by Sfx command completion state. */
export class WriterPlatformError extends Error {
  /** Creates an explicit browser-platform failure. @param code - Stable failure category. @param message - User-presentable detail. @returns Nothing. */
  public constructor(
    readonly code: "clipboard-empty" | "storage-unavailable",
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
  await wrtShell.CreateTransferable().Copy(copyRichText);
}

/** Writes through the browser port while Writer owns delete-after-copy. @param wrtShell - Editing shell. @param copyRichText - Browser write port. @returns Completion after deletion. */
export async function cutWriterSelection(
  wrtShell: SwWrtShell,
  copyRichText: WriterSessionServices["copyRichText"],
): Promise<void> {
  await wrtShell.CreateTransferable().Cut(copyRichText);
}

/** Reads browser clipboard data and hands its parsed record to Writer transfer ownership. @param wrtShell - Editing shell. @param readRichClipboard - Browser read port. @returns Completion after insertion. */
export async function pasteWriterClipboard(
  wrtShell: SwWrtShell,
  readRichClipboard: WriterSessionServices["readRichClipboard"],
): Promise<void> {
  const clipboard = await readRichClipboard();
  const paste = parseWriterClipboardPaste(clipboard.html, clipboard.plainText, globalThis.document);
  if (paste === undefined)
    throw new WriterPlatformError("clipboard-empty", "Clipboard has no text to paste.");
  wrtShell.CreateTransferable().Paste(createWriterTransferDocument(paste));
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
          execute: (): void => ports.fileDialogs?.Show("open"),
          id: WRITER_COMMAND_IDS.openOdt,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0113",
          /** Exports the active document through the browser download workflow. @returns Completion after export. */
          execute: (): void => ports.fileDialogs?.Show("save-as"),
          id: WRITER_COMMAND_IDS.saveOdt,
          isEnabled: lifecycleEnabled,
        },
        {
          capabilityId: "CAP-0101",
          /** Exports the active document as plain text. @returns Completion after download. */
          execute: (): void => ports.fileDialogs?.Show("export"),
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
          execute: (): Promise<void> => cutWriterSelection(wrtShell, ports.copyRichText),
          id: WRITER_COMMAND_IDS.cut,
        },
        {
          capabilityId: "CAP-0110",
          /** Pastes browser clipboard content through Writer operations. @param _context - Bound workflow context. @param arguments_ - Sfx request items. @returns Completion after insertion. */
          execute: (): Promise<void> => pasteWriterClipboard(wrtShell, ports.readRichClipboard),
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
