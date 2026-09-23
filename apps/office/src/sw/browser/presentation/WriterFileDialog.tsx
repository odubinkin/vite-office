/** @fileoverview Browser file dialogs for opening, copying, and exporting Writer documents. */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { FileText, HardDrive, MonitorUp, Upload, X } from "lucide-react";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { readBrowserFile } from "../../../vcl/browser/browser-file";
import { SwDocShell } from "../../source/uibase/app/docsh";
import type { WriterOdtStore, BrowserWriterDocument } from "../storage/writer-odt-store";
import type { WriterSessionServices } from "../workflows/writer-workflows";
import type { WriterAutosaveController } from "../workflows/writer-autosave";
import type { WriterFileDialogKind } from "../workflows/writer-file-dialog-controller";
import {
  autosaveWriter,
  openBrowserWriterDocument,
  openWriterText,
  saveWriterAsBrowserCopy,
} from "../workflows/writer-odt-io";
import { exportWriterTextToPort, saveWriterOdtToPort } from "../workflows/writer-document-io";

/** Describes the Writer browser value. */ export interface WriterFileDialogProps {
  readonly autosave?: WriterAutosaveController;
  readonly docShell: SwDocShell;
  readonly kind: WriterFileDialogKind;
  readonly onClose: () => void;
  readonly services: WriterSessionServices;
}

/** Renders file actions without binding browser I/O to Writer's model layer. */
/**
 * Handles the Writer browser operation.
 * @param argument1 - Dialog inputs.
 * @param argument1.autosave - Autosave controller.
 * @param argument1.docShell - Active Writer shell.
 * @param argument1.kind - File action.
 * @param argument1.onClose - Close callback.
 * @param argument1.services - Browser services.
 * @returns Dialog element.
 */ export function WriterFileDialog({
  autosave,
  docShell,
  kind,
  onClose,
  services,
}: WriterFileDialogProps): React.JSX.Element {
  const [tab, setTab] = useState<"browser" | "computer">("browser");
  const [documents, setDocuments] = useState<readonly BrowserWriterDocument[]>([]);
  const [title, setTitle] = useState(`${docShell.GetTitle()} copy`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(kind === "open" && services.odtStore !== undefined);
  const [dragging, setDragging] = useState(false);
  const browserTabRef = useRef<HTMLButtonElement>(null);
  const computerTabRef = useRef<HTMLButtonElement>(null);

  useEffect(
    /**
     * Handles the Writer browser operation.
     * @returns Operation result.
     */ () => {
      if (kind !== "open") return;
      if (services.odtStore === undefined) return;
      void services.odtStore
        .list()
        .then(setDocuments)
        .catch(
          /**
           * Handles the Writer browser operation.
           * @param reason - Input value.
           * @returns Operation result.
           */ (reason: unknown) => setError(message(reason)),
        )
        .finally(/** Marks the browser list ready. @returns Nothing. */ () => setLoading(false));
    },
    [kind, services.odtStore],
  );

  /**
   * Handles the Writer browser operation.
   * @param action - Input value.
   * @returns Operation result.
   */ async function run(action: () => Promise<void>): Promise<void> {
    setBusy(true);
    setError(undefined);
    try {
      await action();
      onClose();
    } catch (reason) {
      setError(message(reason));
    } finally {
      setBusy(false);
    }
  }

  /**
   * Handles the Writer browser operation.
   * @param file - Input value.
   * @returns Operation result.
   */ async function importFile(file: File): Promise<void> {
    if (!/\.(odt|txt)$/i.test(file.name)) throw new Error("Choose an ODT or TXT file.");
    if (services.odtStore === undefined) throw new Error("Browser storage is unavailable.");
    await autosave?.Flush();
    const bytes = await readBrowserFile(file);
    if (/\.txt$/i.test(file.name)) {
      openWriterText(docShell, bytes, file.name);
      await autosaveWriter(docShell, services.odtStore, true);
      return;
    }
    await docShell.Open(
      bytes,
      createDocument({
        id: globalThis.crypto.randomUUID(),
        suiteId: "writer",
        title: file.name.replace(/\.odt$/i, ""),
      }),
      {
        kind: "input",
        name: file.name,
        filterId: "writer8",
        mediaType: SwDocShell.ODT_MEDIA_TYPE,
        source: { kind: "external", reference: file },
      },
    );
    await autosaveWriter(docShell, services.odtStore, true);
  }

  /** Selects a source tab with standard keyboard tab navigation. @param event - Tab keyboard event. @returns Nothing. */
  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    let next: "browser" | "computer";
    if (event.key === "ArrowRight" || event.key === "End") next = "computer";
    else if (event.key === "ArrowLeft" || event.key === "Home") next = "browser";
    else return;
    event.preventDefault();
    setTab(next);
    if (next === "browser") browserTabRef.current?.focus();
    else computerTabRef.current?.focus();
  }

  const store: WriterOdtStore | undefined = services.odtStore;
  return (
    <div
      aria-label={kind === "open" ? "Open" : kind === "export" ? "Export" : "Save As"}
      aria-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Closes the dialog on Escape. @param event - Dialog keyboard event. @returns Nothing. */
        (event) => {
          if (event.key === "Escape") onClose();
        }
      }
      role="dialog"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              {kind === "open"
                ? "Open document"
                : kind === "export"
                  ? "Export document"
                  : "Save As"}
            </h2>
            {kind === "open" ? (
              <p className="mt-1 text-sm text-slate-500">
                Choose a saved document or import a file.
              </p>
            ) : kind === "export" ? (
              <p className="mt-1 text-sm text-slate-500">Choose a format to download.</p>
            ) : null}
          </div>
          <button
            aria-label="Close"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-indigo-600"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        {kind === "open" ? (
          <div className="px-6 pb-6">
            <div
              aria-label="Document source"
              className="mt-5 grid grid-cols-2 border-b border-slate-200"
              role="tablist"
            >
              <button
                aria-controls="writer-open-browser-panel"
                aria-selected={tab === "browser"}
                autoFocus
                className={`flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${tab === "browser" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                id="writer-open-browser-tab"
                onClick={
                  /** Selects browser documents. @returns Nothing. */ () => setTab("browser")
                }
                onKeyDown={onTabKeyDown}
                ref={browserTabRef}
                role="tab"
                tabIndex={tab === "browser" ? 0 : -1}
                type="button"
              >
                <HardDrive aria-hidden="true" className="h-4 w-4" />
                In browser
              </button>
              <button
                aria-controls="writer-open-computer-panel"
                aria-selected={tab === "computer"}
                className={`flex items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600 ${tab === "computer" ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                id="writer-open-computer-tab"
                onClick={/** Selects computer files. @returns Nothing. */ () => setTab("computer")}
                onKeyDown={onTabKeyDown}
                ref={computerTabRef}
                role="tab"
                tabIndex={tab === "computer" ? 0 : -1}
                type="button"
              >
                <MonitorUp aria-hidden="true" className="h-4 w-4" />
                On computer
              </button>
            </div>
            {tab === "browser" ? (
              <div
                aria-labelledby="writer-open-browser-tab"
                className="pt-5"
                id="writer-open-browser-panel"
                role="tabpanel"
                tabIndex={0}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">Saved in this browser</h3>
                  {!loading ? (
                    <span className="text-xs text-slate-500">{documents.length} documents</span>
                  ) : null}
                </div>
                {loading ? (
                  <p
                    className="rounded-xl border border-slate-200 px-4 py-8 text-center text-sm text-slate-500"
                    role="status"
                  >
                    Loading documents…
                  </p>
                ) : documents.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-10 text-center">
                    <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="mt-3 font-medium text-slate-800">No saved documents yet</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Documents appear here after you start editing.
                    </p>
                  </div>
                ) : (
                  <div className="grid max-h-72 gap-2 overflow-auto pr-1">
                    {documents.map(
                      /** Renders one stored document. @param document - Browser document. @returns Open button. */
                      (document) => (
                        <button
                          aria-label={document.title}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-indigo-300 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
                          disabled={busy}
                          key={document.id}
                          onClick={
                            /** Opens the selected document. @returns Nothing. */
                            () =>
                              void run(
                                /** Flushes current edits, then opens the selected copy. @returns Completion. */
                                async () => {
                                  await autosave?.Flush();
                                  if (store === undefined)
                                    throw new Error("Browser storage is unavailable.");
                                  await openBrowserWriterDocument(docShell, store, document.id);
                                },
                              )
                          }
                          type="button"
                        >
                          <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
                            <FileText aria-hidden="true" className="h-5 w-5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-slate-900">
                              {document.title}
                            </span>
                            <span className="block text-xs text-slate-500">ODT document</span>
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div
                aria-labelledby="writer-open-computer-tab"
                className={`mt-5 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50"}`}
                id="writer-open-computer-panel"
                onDragEnter={
                  /** Highlights the active drop zone. @param event - Drag event. @returns Nothing. */
                  (event) => {
                    event.preventDefault();
                    setDragging(true);
                  }
                }
                onDragLeave={
                  /** Clears drop highlighting. @param event - Drag event. @returns Nothing. */
                  (event) => {
                    event.preventDefault();
                    setDragging(false);
                  }
                }
                onDragOver={
                  /** Allows a file drop. @param event - Drag event. @returns Nothing. */
                  (event) => event.preventDefault()
                }
                onDrop={
                  /** Imports the dropped file. @param event - Drop event. @returns Nothing. */
                  (event) => {
                    event.preventDefault();
                    setDragging(false);
                    const file = event.dataTransfer.files[0];
                    if (file !== undefined)
                      void run(
                        /** Imports the dropped file. @returns Completion. */ () =>
                          importFile(file),
                      );
                  }
                }
                role="tabpanel"
                tabIndex={0}
              >
                <Upload aria-hidden="true" className="mx-auto h-9 w-9 text-indigo-600" />
                <p className="mt-3 font-semibold text-slate-900">Drop a file here</p>
                <p className="mt-1 text-sm text-slate-500">ODT and TXT files are supported</p>
                <label className="mt-5 inline-block cursor-pointer rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-600">
                  Browse
                  <input
                    accept=".odt,.txt,application/vnd.oasis.opendocument.text,text/plain"
                    className="sr-only"
                    onChange={
                      /** Imports the selected file. @param event - File selection event. @returns Nothing. */
                      (event) => {
                        const file = event.target.files?.[0];
                        if (file !== undefined)
                          void run(
                            /** Imports the selected file. @returns Completion. */ () =>
                              importFile(file),
                          );
                      }
                    }
                    type="file"
                  />
                </label>
              </div>
            )}
          </div>
        ) : kind === "save-as" ? (
          <form
            className="mt-4 grid gap-3"
            onSubmit={
              /**
               * Handles the Writer browser operation.
               * @param event - Input value.
               * @returns Operation result.
               */ (event) => {
                event.preventDefault();
                void run(
                  /**
                   * Handles the Writer browser operation.
                   * @returns Operation result.
                   */ async () => {
                    if (store === undefined) throw new Error("Browser storage is unavailable.");
                    await autosave?.Flush();
                    await saveWriterAsBrowserCopy(docShell, store, title);
                  },
                );
              }
            }
          >
            <label className="grid gap-1">
              New copy name
              <input
                autoFocus
                className="rounded border p-2"
                onChange={
                  /**
                   * Handles the Writer browser operation.
                   * @param event - Input value.
                   * @returns Operation result.
                   */ (event) => setTitle(event.target.value)
                }
                required
                value={title}
              />
            </label>
            <button
              className="rounded bg-indigo-600 px-3 py-2 text-white"
              disabled={busy}
              type="submit"
            >
              Save copy
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-6">
            <button
              aria-label="Download ODT"
              className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
              disabled={busy}
              onClick={
                /**
                 * Handles the Writer browser operation.
                 * @returns Operation result.
                 */ () =>
                  void run(
                    /**
                     * Handles the Writer browser operation.
                     * @returns Operation result.
                     */ () =>
                      saveWriterOdtToPort(
                        docShell,
                        services.documentExport,
                        services.createDownloadFilename(docShell.GetTitle(), ".odt"),
                      ),
                  )
              }
              type="button"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 transition-colors group-hover:bg-indigo-200">
                <FileText aria-hidden="true" className="h-11 w-11" strokeWidth={1.5} />
              </span>
              <span className="mt-4 text-lg font-bold text-slate-950">ODT</span>
              <span className="mt-1 text-xs text-slate-500">OpenDocument Text</span>
            </button>
            <button
              aria-label="Download TXT"
              className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-center transition-colors hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-emerald-600"
              disabled={busy}
              onClick={
                /**
                 * Handles the Writer browser operation.
                 * @returns Operation result.
                 */ () =>
                  void run(
                    /**
                     * Handles the Writer browser operation.
                     * @returns Operation result.
                     */ () =>
                      exportWriterTextToPort(
                        docShell,
                        services.documentExport,
                        services.createDownloadFilename(docShell.GetTitle(), ".txt"),
                      ),
                  )
              }
              type="button"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-colors group-hover:bg-emerald-200">
                <FileText aria-hidden="true" className="h-11 w-11" strokeWidth={1.5} />
              </span>
              <span className="mt-4 text-lg font-bold text-slate-950">TXT</span>
              <span className="mt-1 text-xs text-slate-500">Plain text</span>
            </button>
          </div>
        )}
        {error === undefined && !(kind === "open" && store === undefined) ? null : (
          <p className="mx-6 mb-6 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error ?? "Browser storage is unavailable."}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Handles the Writer browser operation.
 * @param error - Input value.
 * @returns Operation result.
 */ function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
