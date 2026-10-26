/**
 * @fileoverview Composes a lazy browser Writer module and owns one disposable document session per
 * mounted workspace without exposing Writer implementation to framework core.
 */

/* eslint-disable react-refresh/only-export-components -- the private lifecycle host belongs to the exported Writer module factory. */

import { useEffect, useState } from "react";

import type { OfficeModuleFactory } from "../../../framework/browser/app/modulemanager";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { copyRichText, readRichClipboard } from "../../../vcl/browser/browser-clipboard";
import {
  createBrowserDocumentExportPort,
  createDownloadFilename,
} from "../../../vcl/browser/browser-download";
import { createBrowserDocumentOpenPort } from "../../../vcl/browser/browser-file";
import {
  createBrowserDefaultFontDevice,
  createDefaultFontLocale,
} from "../../../vcl/browser/default-font-device";
import {
  createInlineOdtFilterService,
  type OdtFilterService,
} from "../../source/filter/xml/odt-filter-service";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { SwModule } from "../../source/uibase/app/swmodule";
import { SwView } from "../../source/uibase/uiview/view";
import { createWriterWorkbenchDocument } from "../../source/uibase/uiview/viewfunc";
import { createBrowserOdtFilterService } from "../filter/xml/odt-worker-client";
import { WriterWorkbench } from "../presentation/writer-view";
import { WriterViewStore } from "../presentation/writer-view-projection";
import { WriterLayoutPreferenceStore } from "../storage/writer-layout-preferences-store";
import { IndexedDbWriterOdtStore } from "../storage/writer-odt-store";
import { WriterAutosaveController } from "../workflows/writer-autosave";
import { WriterFileDialogController } from "../workflows/writer-file-dialog-controller";
import {
  WriterWorkflowCommandShell,
  type WriterSessionServices,
} from "../workflows/writer-workflows";

import {
  getWriterDefaultFontLanguage,
  getWriterDefaultFontType,
} from "../../source/core/doc/default-font";

/** Prepares original text/heading/fixed role families before constructing browser documents. @param document - Host. @param language - Canonical host locale. @returns Preparation completion. */
export async function prepareWriterBrowserFonts(
  document: Document,
  language: string,
): Promise<void> {
  const device = createBrowserDefaultFontDevice(document);
  await Promise.all(
    (["western", "cjk", "ctl"] as const).flatMap(
      /** Builds the native role requests for one script slot. @param script - Slot. @returns Pending preparations. */ (
        script,
      ) =>
        (["text", "heading", "fixed"] as const).map(
          /** Prepares one native role. @param type - Writer role. @returns Completion. */ async (
            type,
          ) => {
            const locale = createDefaultFontLocale(getWriterDefaultFontLanguage(language, script));
            try {
              await device.prepareDefaultFont(getWriterDefaultFontType(type, script), locale);
            } finally {
              locale.dispose();
            }
          },
        ),
    ),
  );
}

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
  readonly autosave?: WriterAutosaveController;
  readonly fileDialogs: WriterFileDialogController;
  readonly services: WriterSessionServices;
}

/** Creates the production browser adapters without leaking them into document or Writer shell code. @returns Injected session services. */
export function createWriterBrowserSessionServices(): WriterSessionServices {
  return {
    ...(globalThis.localStorage === undefined
      ? {}
      : { layoutPreferences: new WriterLayoutPreferenceStore(globalThis.localStorage) }),
    copyRichText,
    createDownloadFilename,
    documentExport: createBrowserDocumentExportPort(),
    documentOpen: createBrowserDocumentOpenPort(),
    readRichClipboard,
    ...(globalThis.indexedDB === undefined ? {} : { odtStore: new IndexedDbWriterOdtStore() }),
  };
}

/** Creates one complete persistent Writer ownership chain. @param services - Browser adapters injected by the composition root. @param odtFilter - Asynchronous ODT filter service. @param module - Actual shared Writer preference and view owner. @returns Active document session. */
export function createWriterDocumentSession(
  services: WriterSessionServices = createWriterBrowserSessionServices(),
  odtFilter: OdtFilterService = createInlineOdtFilterService(),
  module: SwModule = SwModule.get(),
): WriterDocumentSession {
  const fontDevice = createBrowserDefaultFontDevice(globalThis.document);
  const documentState = createDocument({
    id: "writer-workbench",
    suiteId: "writer",
    title: "Untitled Writer Document",
  });
  const docShell = new SwDocShell(
    createWriterWorkbenchDocument({
      defaultFontDevice: {
        /** Maps original Writer roles to the shared native browser font boundary. @param type - Role. @param language - Canonical tag. @param script - Slot. @returns Loaded registered family or absence. */
        getDefaultFont(type, language, script) {
          const locale = createDefaultFontLocale(language);
          try {
            return fontDevice.getDefaultFont(getWriterDefaultFontType(type, script), locale);
          } finally {
            locale.dispose();
          }
        },
        /** Binds AttrSetToLineHeight to the browser's physical font metrics.  @param family - Family. @param heightTwips - Height Twips. @returns The computed result. */
        measureTextHeight(family, heightTwips) {
          const context = globalThis.document.createElement("canvas").getContext("2d");
          if (context === null) throw new Error("Writer output device is unavailable.");
          context.font = `${heightTwips / 15}px ${JSON.stringify(family)}`;
          const metrics = context.measureText("Mg");
          const height =
            metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent ||
            metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
          if (!Number.isFinite(height) || height <= 0)
            throw new Error("Writer output device could not measure the font height.");
          return Math.round(height * 15);
        },
      },
      locale: globalThis.navigator?.language ?? "en-US",
    }),
    documentState,
    { kind: "untitled", name: "Untitled Writer Document" },
    odtFilter,
  );
  const view = new SwView(docShell, module);
  const fileDialogs = new WriterFileDialogController();
  const sessionServices = { ...services, fileDialogs };
  const workflowCommandShell = new WriterWorkflowCommandShell(
    docShell,
    view.GetWrtShell(),
    sessionServices,
  );
  const frame = new SfxViewFrame<SwView>(new BrowserSfxDispatcher());
  view.AttachFrame(frame);
  frame.SetActiveView(view, [
    docShell.GetCommandShell(),
    view.GetCommandShell(),
    workflowCommandShell.GetShell(),
    view.GetWrtShell().GetCommandShell(),
  ]);
  view.SelectShell();
  const viewStore = new WriterViewStore(view);
  const autosave =
    services.odtStore === undefined
      ? undefined
      : new WriterAutosaveController(docShell, services.odtStore);
  let closed = false;
  return {
    /** Closes the persistent Writer session. @returns Nothing. */
    Close: function closeWriterSession(): void {
      if (closed) return;
      closed = true;
      autosave?.Close();
      viewStore.Close();
      view.Close();
    },
    docShell,
    frame,
    view,
    viewStore,
    ...(autosave === undefined ? {} : { autosave }),
    fileDialogs,
    services: sessionServices,
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
  return (
    <WriterWorkbench
      isActive
      view={session.view}
      viewStore={session.viewStore}
      fileDialogs={session.fileDialogs}
      services={session.services}
      {...(session.autosave === undefined ? {} : { autosave: session.autosave })}
    />
  );
}

/** Creates a module factory that remains resource-free until Writer mounts. @param options - Optional injected session factory. @returns Lazy Writer workspace factory. */
export function createWriterModuleFactory(
  options: WriterModuleFactoryOptions = {},
): OfficeModuleFactory {
  let metricsPrepared = false;
  const createSession =
    options.createSession ??
    /** Creates production adapters at workspace-open time. @returns Active Writer session. */
    function createProductionWriterSession(): WriterDocumentSession {
      const services = createWriterBrowserSessionServices();
      if (!metricsPrepared) {
        services.layoutPreferences?.Load(SwModule.get().GetUsrPref(false));
        metricsPrepared = true;
      }
      return createWriterDocumentSession(
        services,
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
