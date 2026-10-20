/** @fileoverview Writer ODT/TXT domain adapter over the shared browser file dialog. */
import { readBrowserFile } from "../../../vcl/browser/browser-file";
import { BrowserFileDialog } from "../../../framework/browser/presentation/BrowserFileDialog";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type { WriterOdtStore } from "../storage/writer-odt-store";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import type { WriterAutosaveController } from "../workflows/writer-autosave";
import type { WriterFileDialogKind } from "../workflows/writer-file-dialog-controller";
import {
  autosaveWriter,
  getImportedWriterTitle,
  openBrowserWriterDocument,
  openWriterText,
  saveWriterAsBrowserCopy,
} from "../workflows/writer-odt-io";
import { exportWriterTextToPort, saveWriterOdtToPort } from "../workflows/writer-document-io";
/** Writer-specific semantic owners for the common dialog. */
export interface WriterFileDialogProps {
  readonly autosave?: WriterAutosaveController;
  readonly docShell: SwDocShell;
  readonly kind: WriterFileDialogKind;
  readonly onClose: () => void;
  readonly services: WriterSessionServices;
}
/** Preserves Writer file behavior while sharing all dialog presentation. @param props - Writer owners. @returns Dialog. */
export function WriterFileDialog({
  autosave,
  docShell,
  kind,
  onClose,
  services,
}: WriterFileDialogProps): React.JSX.Element {
  /** Borrows the current primary store for suite operations. @returns Store. */
  function requiredStore(): WriterOdtStore {
    if (services.odtStore === undefined) throw new Error("Browser storage is unavailable.");
    return services.odtStore;
  }
  return (
    <BrowserFileDialog
      readFile={readBrowserFile}
      autosave={autosave}
      documentTitle={docShell.GetTitle()}
      idPrefix="writer"
      kind={kind}
      onClose={onClose}
      store={services.odtStore}
      modalAttributes={{ "data-writer-modal": "true" }}
      format={{
        accept: ".odt,.txt,application/vnd.oasis.opendocument.text,text/plain",
        importDescription: "ODT and TXT files are supported",
        invalidFileMessage: "Choose an ODT or TXT file.",
        documentLabel: "ODT document",
        accepts:
          /** Matches Writer's supported import extensions. @param file - Source. @returns Supported. */ (
            file,
          ) => /\.(odt|txt)$/i.test(file.name),
        importedTitle: getImportedWriterTitle,
      }}
      openImportedFile={
        /** Imports actual Writer content and persists its selected browser identity. @param file - Source. @param bytes - Package/text. @param identity - Resolved name. @returns Completion. */ async (
          file,
          bytes,
          identity,
        ) => {
          if (/\.txt$/i.test(file.name)) openWriterText(docShell, bytes, file.name, identity);
          else
            await docShell.Open(
              bytes,
              createDocument({ id: identity.id, suiteId: "writer", title: identity.title }),
              {
                kind: "input",
                name: file.name,
                filterId: "writer8",
                mediaType: SwDocShell.ODT_MEDIA_TYPE,
                source: { kind: "external", reference: file },
              },
            );
          await autosaveWriter(docShell, requiredStore(), true);
        }
      }
      openStoredDocument={
        /** Opens a real primary Writer document. @param id - Browser record. @returns Completion. */ async (
          id,
        ) => {
          await openBrowserWriterDocument(docShell, requiredStore(), id);
        }
      }
      saveCopy={
        /** Saves a Writer primary copy. @param title - Requested title. @returns Completion. */ async (
          title,
        ) => {
          return saveWriterAsBrowserCopy(docShell, requiredStore(), title);
        }
      }
      downloads={[
        {
          label: "ODT",
          description: "OpenDocument Text",
          appearance: "indigo",
          download: /** Downloads canonical ODT. @returns Completion. */ () =>
            saveWriterOdtToPort(
              docShell,
              services.documentExport,
              services.createDownloadFilename(docShell.GetTitle(), ".odt"),
            ),
        },
        {
          label: "TXT",
          description: "Plain text",
          appearance: "emerald",
          download: /** Downloads Writer plain text. @returns Completion. */ () =>
            exportWriterTextToPort(
              docShell,
              services.documentExport,
              services.createDownloadFilename(docShell.GetTitle(), ".txt"),
            ),
        },
      ]}
    />
  );
}
