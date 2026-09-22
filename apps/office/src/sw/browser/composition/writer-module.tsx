/**
 * @fileoverview Composes a lazy browser Writer module and owns one disposable document session per
 * mounted workspace without exposing Writer implementation to framework core.
 */

/* eslint-disable react-refresh/only-export-components -- the private lifecycle host belongs to the exported Writer module factory. */

import { useEffect, useState } from "react";

import { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import type { OfficeModuleFactory } from "../../../framework/browser/app/modulemanager";
import { copyRichText, readRichClipboard } from "../../../vcl/browser/browser-clipboard";
import {
  createBrowserDocumentExportPort,
  createDownloadFilename,
} from "../../../vcl/browser/browser-download";
import { createBrowserDocumentOpenPort } from "../../../vcl/browser/browser-file";
import { createBrowserDefaultFontDevice } from "../../../vcl/browser/default-font-device";
import { IndexedDbDocumentStorageAdapter } from "../../../vcl/browser/indexeddb-storage";
import type { WriterSnapshotState } from "../storage/writer-storage";
import {
  createInlineOdtFilterService,
  type OdtFilterService,
} from "../../source/filter/xml/odt-filter-service";
import { createBrowserOdtFilterService } from "../filter/xml/odt-worker-client";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterViewStore } from "../presentation/writer-view-projection";
import {
  WriterWorkflowCommandShell,
  type WriterSessionServices,
} from "../workflows/writer-workflows";
import { SwView } from "../../source/uibase/uiview/view";
import { createWriterWorkbenchDocument } from "../../source/uibase/uiview/viewfunc";
import { SwDocShell } from "../../source/uibase/app/docsh";

/** Persistent ownership chain created once per Writer module factory. */
export interface WriterDocumentSession {
  /** Explicitly releases the active frame, view, and document-shell subscriptions. */
  readonly Close: () => void;
  /** Persistent active frame owning the shell dispatcher. */
  readonly frame: SfxViewFrame<SwView>;
  /** Persistent document shell owning the active SwDoc and history. */
  readonly docShell: SwDocShell;
  /** Persistent Writer view exposed to React as an external store. */
  readonly view: SwView;
  /** Browser-owned projection and external-store cache. */
  readonly viewStore: WriterViewStore;
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
    createWriterWorkbenchDocument({
      defaultFontDevice: createBrowserDefaultFontDevice(globalThis.document),
      locale: globalThis.navigator?.language ?? "en-US",
    }),
    documentState,
    { kind: "untitled", name: "Untitled Writer Document" },
    odtFilter,
  );
  const view = new SwView(docShell);
  const workflowCommandShell = new WriterWorkflowCommandShell(
    docShell,
    view.GetWrtShell(),
    services,
  );
  const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    view.GetCommandShell(),
    workflowCommandShell.GetShell(),
    view.GetWrtShell().GetCommandShell(),
    view.GetWrtShell().GetListShell().GetCommandShell(),
  ]);
  const viewStore = new WriterViewStore(view);
  let closed = false;
  return {
    /** Closes the persistent Writer session. @returns Nothing. */
    Close: function closeWriterSession(): void {
      if (closed) return;
      closed = true;
      viewStore.Close();
      view.Close();
    },
    docShell,
    frame,
    view,
    viewStore,
  };
}

/** Optional testable construction boundary for the lazy Writer module. */
export interface WriterModuleFactoryOptions {
  /** Creates one session only when a Writer workspace mounts. */
  readonly createSession?: () => WriterDocumentSession;
}

/** Owns exactly one Writer session for the lifetime of one mounted workspace. @param props - Lazy session constructor. @returns Writer workspace. */
function WriterWorkspaceSession({
  createSession,
}: Required<WriterModuleFactoryOptions>): React.JSX.Element {
  const [session] = useState(createSession);
  useEffect(
    /** Disposes all session-owned resources when the workspace closes. @returns Cleanup. */ () =>
      session.Close,
    [session],
  );
  return <WriterWorkbench isActive view={session.view} viewStore={session.viewStore} />;
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
