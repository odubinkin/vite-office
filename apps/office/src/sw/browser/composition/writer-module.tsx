/**
 * @fileoverview Composes a lazy browser Writer module and owns one disposable document session per
 * mounted workspace without exposing Writer implementation to framework core.
 */

/* eslint-disable react-refresh/only-export-components -- the private lifecycle host belongs to the exported Writer module factory. */

import { useEffect, useState } from "react";

import { OfficeFrame } from "../../../framework/source/dispatch/dispatchprovider";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import {
  AutoRecovery,
  type AutoRecoveryCandidate,
  type AutoRecoveryEnvironment,
  type AutoRecoveryRestoreResult,
} from "../../../framework/source/services/autorecovery";
import type { OfficeModuleFactory } from "../../../framework/browser/app/modulemanager";
import { copyRichText, readRichClipboard } from "../../../vcl/browser/browser-clipboard";
import {
  createBrowserDocumentExportPort,
  createDownloadFilename,
} from "../../../vcl/browser/browser-download";
import { createBrowserDocumentOpenPort } from "../../../vcl/browser/browser-file";
import {
  IndexedDbDocumentStorageAdapter,
  IndexedDbRecoveryStorageAdapter,
} from "../../../vcl/browser/indexeddb-storage";
import type { WriterSnapshotState } from "../persistence/writer-storage";
import {
  createInlineOdtFilterService,
  type OdtFilterService,
} from "../../source/filter/xml/odt-filter-service";
import { createBrowserOdtFilterService } from "../../source/filter/xml/odt-worker-client";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterRecoveryPrompt } from "../presentation/WriterRecoveryPrompt";
import { createWriterViewControllerFactory } from "../workflows/writer-workflows";
import { SwView, type WriterSessionServices } from "../../source/uibase/uiview/view";
import { createWriterWorkbenchDocument } from "../../source/uibase/uiview/viewfunc";
import { SwDocShell } from "../../source/uibase/app/docsh";

/** Persistent ownership chain created once per Writer module factory. */
export interface WriterDocumentSession {
  /** Application-owned recovery service, when durable recovery is available. */
  readonly autoRecovery: AutoRecovery<WriterSnapshotState> | undefined;
  /** Starts recovery timers/listeners only after the recovery presentation gate resolves. */
  readonly BeginRecoveryScheduling: () => void;
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
  const primaryStorage =
    globalThis.indexedDB === undefined
      ? undefined
      : new IndexedDbDocumentStorageAdapter<WriterSnapshotState>("vite-office-writer-workbench");
  return {
    copyRichText,
    createDownloadFilename,
    documentExport: createBrowserDocumentExportPort(),
    documentOpen: createBrowserDocumentOpenPort(),
    readRichClipboard,
    ...(primaryStorage === undefined
      ? {}
      : {
          primarySave: primaryStorage,
          recoveryEnvironment: createBrowserAutoRecoveryEnvironment(),
          recoverySave: new IndexedDbRecoveryStorageAdapter<WriterSnapshotState>(
            "vite-office-writer-recovery",
          ),
          storedDocumentOpen: primaryStorage,
        }),
  };
}

/** Creates one complete persistent Writer ownership chain. @param services - Browser adapters injected by the composition root. @param odtFilter - Asynchronous ODT filter service. @returns Active document session. */
export function createWriterDocumentSession(
  services: WriterSessionServices = createWriterBrowserSessionServices(),
  odtFilter: OdtFilterService = createInlineOdtFilterService(),
): WriterDocumentSession {
  const documentState = createDocument({
    id: "writer-workbench",
    suiteId: "writer",
    title: "Untitled Writer Document",
  });
  const docShell = new SwDocShell(
    createWriterWorkbenchDocument(),
    documentState,
    { kind: "untitled", name: "Untitled Writer Document" },
    odtFilter,
  );
  const view = new SwView(docShell, createWriterViewControllerFactory(services));
  const frame = new OfficeFrame<SwView>();
  const autoRecovery =
    services.recoverySave === undefined
      ? undefined
      : new AutoRecovery(services.recoverySave, {
          ...(services.recoveryEnvironment === undefined
            ? {}
            : { environment: services.recoveryEnvironment }),
          ownerId: createRecoveryOwnerId(),
        });
  const unregisterRecovery = autoRecovery?.RegisterDocument(docShell);
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    view.GetCommandShell(),
    view.GetWrtShell().GetCommandShell(),
    view.GetWrtShell().GetListShell().GetCommandShell(),
  ]);
  let closed = false;
  return {
    autoRecovery,
    BeginRecoveryScheduling:
      /** Starts scheduling idempotently after the recovery decision. @returns Nothing. */
      function beginRecoveryScheduling(): void {
        if (!closed) autoRecovery?.Start();
      },
    /** Closes the persistent Writer session. @returns Nothing. */
    Close: function closeWriterSession(): void {
      if (closed) return;
      closed = true;
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

/** Optional testable construction boundary for the lazy Writer module. */
export interface WriterModuleFactoryOptions {
  /** Creates one session only when a Writer workspace mounts. */
  readonly createSession?: () => WriterDocumentSession;
}

/** Owns exactly one Writer session for the lifetime of one mounted workspace. @param props - Lazy session constructor. @returns Recovery-gated Writer workspace. */
function WriterWorkspaceSession({
  createSession,
}: Required<WriterModuleFactoryOptions>): React.JSX.Element {
  const [session] = useState(createSession);
  useEffect(
    /** Disposes all session-owned resources when the workspace closes. @returns Cleanup. */ () =>
      session.Close,
    [session],
  );
  return (
    <WriterRecoveryPrompt recovery={session}>
      <WriterWorkbench isActive view={session.view} />
    </WriterRecoveryPrompt>
  );
}

/** Creates a module factory that remains resource-free until Writer mounts. @param options - Optional injected session factory. @returns Lazy Writer workspace factory. */
export function createWriterModuleFactory(
  options: WriterModuleFactoryOptions = {},
): OfficeModuleFactory {
  const createSession =
    options.createSession ??
    /** Creates production adapters at workspace-open time. @returns Active Writer session. */
    function createProductionWriterSession(): WriterDocumentSession {
      return createWriterDocumentSession(
        createWriterBrowserSessionServices(),
        typeof Worker === "undefined"
          ? createInlineOdtFilterService()
          : createBrowserOdtFilterService(),
      );
    };
  return {
    createWorkspace:
      /** Creates a lifecycle host without constructing its session before React mounts it. @returns Writer host element. */
      function createWriterWorkspace(): React.JSX.Element {
        return <WriterWorkspaceSession createSession={createSession} />;
      },
    suiteId: "writer",
    workspaceRetention: "dispose-on-unmount",
  };
}
