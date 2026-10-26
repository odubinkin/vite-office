/** @fileoverview Calc browser file command shell terminates native Sfx slots at shared dialogs and actual ODS IO owners. */
import {
  BrowserFileDialogController,
  type BrowserFileDialogKind,
} from "../../../framework/browser/workflows/file-dialog-controller";
import type { BrowserAutosaveController } from "../../../framework/browser/workflows/document-autosave";
import type { BrowserDocumentStore } from "../../../framework/browser/storage/document-store";
import {
  createBrowserDocumentExportPort,
  createDownloadFilename,
} from "../../../vcl/browser/browser-download";
import type { DocumentExportPort } from "../../../svl/source/misc/storage";
import type { ImportedDocumentIdentity } from "../../../framework/browser/presentation/BrowserFileDialog";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../sfx2/source/control/shell";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { ScDocShell } from "../../source/ui/docshell/docsh";
import { normalizeCommandShortcut } from "../../../framework/browser/accelerators/keymapping";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import type { CalcViewController } from "../controller/calc-view-controller";
import { calcFileCommands } from "../../sdi/scalc";
import { autosaveCalc, openBrowserCalcDocument, saveCalcAsBrowserCopy } from "./calc-ods-io";
/** Browser file operations retain suite model/filter ownership and share all dialog presentation. */
export class CalcFileWorkflows {
  readonly dialogs = new BrowserFileDialogController();
  private readonly shell: SfxShell;
  /** Binds actual controller,primary store and platform download port. @param controller - Canonical session. @param store - Primary storage. @param autosave - Session scheduler. @param documentExport - Download port. @returns Workflows. */
  constructor(
    readonly controller: CalcViewController,
    readonly store: BrowserDocumentStore | undefined,
    private readonly autosave: BrowserAutosaveController | undefined,
    private readonly documentExport: DocumentExportPort = createBrowserDocumentExportPort(),
  ) {
    this.shell = createSfxShell(
      this,
      new SfxInterface<CalcFileWorkflows>(
        calcFileCommands.map(
          /** Binds original numeric file slots to this browser shell. @param item - Source resource. @returns Slot. */ (
            item,
          ) => ({
            commandUrl: item.id,
            slotId: item.slotId,
            label: item.label,
            shortcuts: getCalcCommandResource(item.id).shortcuts.map(normalizeCommandShortcut),
            getState:
              /** Pending media disable conflicting file commands. @param target - Workflows. @returns State. */ (
                target: CalcFileWorkflows,
              ) => ({
                enabled: target.controller.shell.GetMedium().lastOperation.state !== "pending",
              }),
            execute:
              /** Routes native command to its file dialog. @param target - Workflows. @returns Whether shown. */ (
                target: CalcFileWorkflows,
              ) => target.Show(item.kind),
          }),
        ),
      ),
    );
  }
  /** Borrows the dispatcher-facing source shell. @returns Shell. */
  GetShell(): SfxShell {
    return this.shell;
  }
  /** Commits current input before changing file focus. @param kind - Dialog intent. @returns Whether shown. */
  Show(kind: BrowserFileDialogKind): boolean {
    if (!this.controller.Commit()) return false;
    this.dialogs.Show(kind);
    return true;
  }
  /** Serializes committed input and pending primary writes before file replacement/copy. @returns Completion. */
  async Flush(): Promise<void> {
    if (!this.controller.Commit()) throw new Error(this.controller.error);
    await this.autosave?.Flush();
  }
  /** Requires the configured primary package store. @returns Store. */
  private Store(): BrowserDocumentStore {
    if (this.store === undefined) throw new Error("Browser storage is unavailable.");
    return this.store;
  }
  /** Opens a real browser primary graph. @param id - Record identity. @returns Completion. */
  async OpenStored(id: string): Promise<void> {
    if (!(await openBrowserCalcDocument(this.controller.shell, this.Store(), id)))
      throw new Error("The saved document no longer exists.");
  }
  /** Imports ODS or CSV with a collision-resolved identity and persists its primary copy. @param file - Source. @param bytes - Input. @param identity - Selected identity. @returns Completion. */
  async Import(file: File, bytes: Uint8Array, identity: ImportedDocumentIdentity): Promise<void> {
    const store = this.Store(),
      shell = this.controller.shell,
      csv = /\.csv$/i.test(file.name);
    await shell.Open(
      bytes,
      createDocument({ id: identity.id, suiteId: "calc", title: identity.title }),
      {
        kind: "input",
        name: file.name,
        filterId: csv ? ScDocShell.CSV_FILTER_NAME : "calc8",
        mediaType: csv ? ScDocShell.CSV_MEDIA_TYPE : ScDocShell.ODS_MEDIA_TYPE,
        source: { kind: "external", reference: file },
      },
    );
    await autosaveCalc(shell, store, true);
  }
  /** Creates an independent named primary copy. @param title - Name. @returns Identity. */
  SaveCopy(title: string): Promise<string> {
    return saveCalcAsBrowserCopy(this.controller.shell, this.Store(), title);
  }
  /** Downloads actual ODS without acknowledging or replacing the primary destination. @returns Completion. */
  async Download(): Promise<void> {
    const shell = this.controller.shell,
      name = createDownloadFilename(shell.GetTitle(), ".ods");
    await shell.Export(
      { kind: "export", name, filterId: "calc8", mediaType: ScDocShell.ODS_MEDIA_TYPE },
      /** Exports committed canonical cells through the worker and browser port. @returns Completion. */ async () =>
        this.documentExport.export({
          data: await shell.SerializeOdsAsync(),
          mediaType: ScDocShell.ODS_MEDIA_TYPE,
          name,
        }),
    );
  }
  /** Routes native CSV sheet selection through the document shell, then downloads each resulting stream without changing primary identity. @param filterOptions - Native CSV filter string, if supplied. @returns Completion. */
  async DownloadCsv(filterOptions?: string): Promise<void> {
    const shell = this.controller.shell,
      name = createDownloadFilename(shell.GetTitle(), ".csv");
    await shell.Export(
      {
        kind: "export",
        name,
        filterId: ScDocShell.CSV_FILTER_NAME,
        mediaType: ScDocShell.CSV_MEDIA_TYPE,
        ...(filterOptions === undefined ? {} : { filterOptions }),
      },
      /** Delivers each stream produced from the export medium's native filter options. @param _document - Exported model. @param medium - Actual export medium. @returns Completion. */ async (
        _document,
        medium,
      ) => {
        const streams = shell.ConvertToCsv(
          medium.filterOptions,
          this.controller.viewData.GetTabNumber(),
        );
        for (const stream of streams)
          this.documentExport.export({
            data: stream.bytes,
            mediaType: ScDocShell.CSV_MEDIA_TYPE,
            name:
              stream.sheetName === null
                ? name
                : createDownloadFilename(
                    `${name.slice(0, -4)}-${stream.sheetName}`,
                    name.slice(-4),
                  ),
          });
      },
    );
  }
}
