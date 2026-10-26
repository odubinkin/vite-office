/** @fileoverview Calc ODS/CSV resource/IO adapter for the shared browser file dialog. */
import { readBrowserFile } from "../../../vcl/browser/browser-file";
import { BrowserFileDialog } from "../../../framework/browser/presentation/BrowserFileDialog";
import type { BrowserFileDialogKind } from "../../../framework/browser/workflows/file-dialog-controller";
import type { CalcFileWorkflows } from "../workflows/calc-file-workflows";
/** Presents real Calc file operations through common browser UI. @param props - File owners and current dialog. @returns Shared dialog. */
export function CalcFileDialog({
  workflows,
  kind,
  onClose,
}: Readonly<{
  workflows: CalcFileWorkflows;
  kind: BrowserFileDialogKind;
  onClose: () => void;
}>): React.JSX.Element {
  return (
    <BrowserFileDialog
      readFile={readBrowserFile}
      autosave={workflows}
      documentTitle={workflows.controller.shell.GetTitle()}
      idPrefix="calc"
      kind={kind}
      onClose={onClose}
      store={workflows.store}
      format={{
        accept: ".ods,.csv,application/vnd.oasis.opendocument.spreadsheet,text/csv",
        importDescription: "ODS and CSV files are supported",
        invalidFileMessage: "Choose an ODS or CSV file.",
        documentLabel: "Calc document",
        accepts:
          /** Recognizes supported Calc input. @param file - Computer file. @returns Supported. */ (
            file,
          ) => /\.(ods|csv)$/i.test(file.name),
        importedTitle:
          /** Removes the source extension for the browser title. @param filename - Source name. @returns Title. */ (
            filename,
          ) => filename.replace(/\.(ods|csv)$/i, "") || "Imported document",
      }}
      openImportedFile={
        /** Opens actual package bytes under the selected browser identity. @param file - Source. @param bytes - ODS. @param identity - Resolved identity. @returns Completion. */ (
          file,
          bytes,
          identity,
        ) => workflows.Import(file, bytes, identity)
      }
      openStoredDocument={
        /** Opens actual primary ODS. @param id - Browser record. @returns Completion. */ (id) =>
          workflows.OpenStored(id)
      }
      saveCopy={
        /** Saves actual primary ODS copy. @param title - Browser name. @returns Completion. */ (
          title,
        ) => workflows.SaveCopy(title)
      }
      downloads={[
        {
          label: "ODS",
          description: "OpenDocument Spreadsheet",
          appearance: "indigo",
          download: /** Exports actual ODS bytes. @returns Completion. */ () =>
            workflows.Download(),
        },
        {
          label: "CSV",
          description: "Comma-separated values",
          appearance: "emerald",
          download: /** Exports the active sheet as CSV. @returns Completion. */ () =>
            workflows.DownloadCsv(),
        },
      ]}
    />
  );
}
