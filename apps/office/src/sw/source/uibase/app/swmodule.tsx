/**
 * @fileoverview Registers one persistent Writer document session at the suite composition
 * boundary without exposing Writer implementation to framework core.
 */

import { OfficeFrame } from "../../../../framework/source/dispatch/dispatchprovider";
import type { OfficeModuleFactory } from "../../../../framework/source/services/modulemanager";
import { copyRichText, readRichClipboard } from "../../../../vcl/browser/browser-clipboard";
import {
  createDownloadFilename,
  downloadBytes,
  downloadPlainText,
} from "../../../../vcl/browser/browser-download";
import { readBrowserFile, selectBrowserFile } from "../../../../vcl/browser/browser-file";
import { IndexedDbDocumentStorageAdapter } from "../../../../vcl/browser/indexeddb-storage";
import type { WriterSnapshotState } from "../../core/doc/writer-storage";
import { WriterWorkbench } from "../uiview/view";
import { SwView, type WriterSessionServices } from "../uiview/view-session";
import { createWriterWorkbenchDocument } from "../uiview/viewfunc";
import { SwDocShell } from "./docsh";

/** Persistent ownership chain created once per Writer module factory. */
export interface WriterDocumentSession {
  /** Explicitly releases the active frame, view, and document-shell subscriptions. */
  readonly Close: () => void;
  /** Persistent active frame owning the shell dispatcher. */
  readonly frame: OfficeFrame<SwView>;
  /** Persistent document shell owning the active SwDoc and history. */
  readonly docShell: SwDocShell;
  /** Persistent Writer view exposed to React as an external store. */
  readonly view: SwView;
}

/** Creates the production browser adapters without leaking them into document or Writer shell code. @returns Injected session services. */
export function createWriterBrowserSessionServices(): WriterSessionServices {
  return {
    copyRichText,
    createDownloadFilename,
    downloadBytes,
    downloadPlainText,
    readFile: readBrowserFile,
    readRichClipboard,
    selectFile: selectBrowserFile,
    ...(globalThis.indexedDB === undefined
      ? {}
      : {
          storage: new IndexedDbDocumentStorageAdapter<WriterSnapshotState>(
            "vite-office-writer-workbench",
          ),
        }),
  };
}

/** Creates one complete persistent Writer ownership chain. @param services - Browser adapters injected by the composition root. @returns Active document session. */
export function createWriterDocumentSession(
  services: WriterSessionServices = createWriterBrowserSessionServices(),
): WriterDocumentSession {
  const docShell = new SwDocShell(createWriterWorkbenchDocument());
  const view = new SwView(docShell, services);
  const frame = new OfficeFrame<SwView>();
  view.AttachFrame(frame);
  frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
  return {
    /** Closes the persistent Writer session. @returns Nothing. */
    Close: function closeWriterSession(): void {
      view.Close();
    },
    docShell,
    frame,
    view,
  };
}

/** Creates the Writer module factory consumed by the application composition root. @returns Writer-owned persistent workspace factory. */
export function createWriterModuleFactory(): OfficeModuleFactory {
  const session = createWriterDocumentSession();
  return {
    closeWorkspace: session.Close,
    createWorkspace:
      /** Creates a React presentation over the existing Writer session. @returns Writer workbench element. */
      function createWriterWorkspace(): React.JSX.Element {
        return <WriterWorkbench isActive view={session.view} />;
      },
    suiteId: "writer",
  };
}
