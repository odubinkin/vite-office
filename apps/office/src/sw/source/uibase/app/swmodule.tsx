/**
 * @fileoverview Registers one persistent Writer document session at the suite composition
 * boundary without exposing Writer implementation to framework core.
 */

import { OfficeFrame } from "../../../../framework/source/dispatch/dispatchprovider";
import {
  AutoRecovery,
  type AutoRecoveryCandidate,
  type AutoRecoveryEnvironment,
  type AutoRecoveryRestoreResult,
} from "../../../../framework/source/services/autorecovery";
import type { OfficeModuleFactory } from "../../../../framework/source/services/modulemanager";
import { copyRichText, readRichClipboard } from "../../../../vcl/browser/browser-clipboard";
import {
  createDownloadFilename,
  downloadBytes,
  downloadPlainText,
} from "../../../../vcl/browser/browser-download";
import { readBrowserFile, selectBrowserFile } from "../../../../vcl/browser/browser-file";
import {
  IndexedDbDocumentStorageAdapter,
  IndexedDbRecoveryStorageAdapter,
} from "../../../../vcl/browser/indexeddb-storage";
import type { WriterSnapshotState } from "../../core/doc/writer-storage";
import { WriterWorkbench } from "../uiview/view";
import { SwView, type WriterSessionServices } from "../uiview/view-session";
import { createWriterWorkbenchDocument } from "../uiview/viewfunc";
import { SwDocShell } from "./docsh";

/** Persistent ownership chain created once per Writer module factory. */
export interface WriterDocumentSession {
  /** Application-owned recovery service, when durable recovery is available. */
  readonly autoRecovery: AutoRecovery<WriterSnapshotState> | undefined;
  /** Explicitly releases the active frame, view, and document-shell subscriptions. */
  readonly Close: () => void;
  /** Deletes recovery history after the caller rejects a recovery candidate. */
  readonly DiscardRecovery: () => Promise<void>;
  /** Returns recovery metadata suitable for a recovery-choice UI. */
  readonly GetRecoveryCandidate: () => Promise<AutoRecoveryCandidate | undefined>;
  /** Restores the newest intact recovery generation selected by the caller. */
  readonly RestoreRecovery: () => Promise<AutoRecoveryRestoreResult | undefined>;
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
          recoveryEnvironment: createBrowserAutoRecoveryEnvironment(),
          recoveryStorage: new IndexedDbRecoveryStorageAdapter<WriterSnapshotState>(
            "vite-office-writer-recovery",
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
  const autoRecovery =
    services.recoveryStorage === undefined
      ? undefined
      : new AutoRecovery(services.recoveryStorage, {
          ...(services.recoveryEnvironment === undefined
            ? {}
            : { environment: services.recoveryEnvironment }),
          ownerId: createRecoveryOwnerId(),
        });
  const unregisterRecovery = autoRecovery?.RegisterDocument(docShell);
  autoRecovery?.Start();
  view.AttachFrame(frame);
  frame.SetActiveView(view, [view.GetCommandShell(), view.GetWrtShell().GetCommandShell()]);
  return {
    autoRecovery,
    /** Closes the persistent Writer session. @returns Nothing. */
    Close: function closeWriterSession(): void {
      autoRecovery?.Stop();
      unregisterRecovery?.();
      view.Close();
    },
    DiscardRecovery:
      /** Deletes recovery history selected for dismissal by the caller. @returns Completion after cleanup. */
      async function discardRecovery(): Promise<void> {
        await autoRecovery?.DiscardDocument(docShell.GetRecoveryIdentity());
      },
    GetRecoveryCandidate:
      /** Reads recovery metadata without mutating the active document. @returns Candidate or undefined when recovery is unavailable. */
      async function getRecoveryCandidate(): Promise<AutoRecoveryCandidate | undefined> {
        return autoRecovery?.GetCandidate(docShell.GetRecoveryIdentity());
      },
    RestoreRecovery:
      /** Restores a caller-selected recovery candidate and reconciles the persistent Writer shell. @returns Explicit recovery result or undefined when unavailable. */
      async function restoreRecovery(): Promise<AutoRecoveryRestoreResult | undefined> {
        const result = await autoRecovery?.RestoreDocument(docShell.GetRecoveryIdentity());
        if (result?.status === "restored") view.GetWrtShell().DocumentReplaced();
        return result;
      },
    docShell,
    frame,
    view,
  };
}

/** Creates the browser timer and lifecycle adapter injected into framework AutoRecovery. @returns Browser recovery environment. */
function createBrowserAutoRecoveryEnvironment(): AutoRecoveryEnvironment {
  const browserWindow = globalThis.window;
  const browserDocument = globalThis.document;
  return {
    clearInterval:
      /** Clears one browser timer handle. @param handle - Timer identifier. @returns Nothing. */
      (handle) => browserWindow.clearInterval(handle as number),
    isHidden: /** Reports document visibility. @returns Whether the page is hidden. */ () =>
      browserDocument.visibilityState === "hidden",
    onPageHide:
      /** Registers a pagehide listener. @param listener - Recovery trigger. @returns Cleanup. */
      (listener) => {
        browserWindow.addEventListener("pagehide", listener);
        return /** Removes the pagehide listener. @returns Nothing. */ () =>
          browserWindow.removeEventListener("pagehide", listener);
      },
    onVisibilityChange:
      /** Registers a visibilitychange listener. @param listener - Recovery trigger. @returns Cleanup. */
      (listener) => {
        browserDocument.addEventListener("visibilitychange", listener);
        return /** Removes the visibilitychange listener. @returns Nothing. */ () =>
          browserDocument.removeEventListener("visibilitychange", listener);
      },
    setInterval:
      /** Starts a browser interval. @param listener - Recovery trigger. @param intervalMs - Interval. @returns Timer identifier. */
      (listener, intervalMs) => browserWindow.setInterval(listener, intervalMs),
  };
}

/** Creates a collision-resistant browser-context identity for recovery leases. @returns Context identity. */
function createRecoveryOwnerId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `writer-tab-${Date.now()}-${Math.random()}`;
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
