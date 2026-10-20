/** @fileoverview Lazy production Calc module with one document/controller/frame ownership chain per mounted workspace. */
/* eslint-disable react-refresh/only-export-components -- The private workspace host belongs to the exported lazy module factory. */
import generated from "../../uiconfig/scalc/calc-ui.generated.json" with { type: "json" };
import { normalizeCommandShortcut } from "../../../framework/browser/accelerators/keymapping";
import { useEffect, useState } from "react";
import type { BrowserDocumentStore } from "../../../framework/browser/storage/document-store";
import { createCalcDocumentStore, createCalcAutosave } from "../workflows/calc-ods-io";
import type { OfficeModuleFactory } from "../../../framework/browser/app/modulemanager";
import { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import { CalcViewController } from "../controller/calc-view-controller";
import { createCalcInterface } from "../../sdi/scalc";
import { CalcSheetWorkflows } from "../workflows/calc-sheet-workflows";
import { CalcFileWorkflows } from "../workflows/calc-file-workflows";
import { CalcWorkbench } from "../presentation/calc-workbench";
/** Creates one actual production session and connects shared Sfx state invalidation. @param store - Injected primary store;defaults to browser IndexedDB when available. @returns Session. */
export function createCalcSession(
  store: BrowserDocumentStore | undefined = globalThis.indexedDB === undefined
    ? undefined
    : createCalcDocumentStore(),
) {
  const controller = new CalcViewController(),
    frame = new SfxViewFrame<CalcViewController>(new BrowserSfxDispatcher());
  const autosave = store === undefined ? undefined : createCalcAutosave(controller.shell, store),
    fileWorkflows = new CalcFileWorkflows(controller, store, autosave),
    sheetWorkflows = new CalcSheetWorkflows(controller);
  frame.SetActiveView(controller, [
    createSfxShell(
      controller,
      createCalcInterface(
        /** Supplies the same pinned configuration to dispatch and menu presentation. @param command - Slot URL. @returns Configured shortcuts or native hidden-slot fallback. */
        (command) =>
          (generated.commands as Readonly<Record<string, { shortcuts: readonly string[] }>>)[
            command
          ]?.shortcuts.map(normalizeCommandShortcut),
      ),
    ),
    fileWorkflows.GetShell(),
    sheetWorkflows.GetShell(),
  ]);
  const detach = controller.Subscribe(
    /** Invalidates shared command bindings when source/input state changes. @returns Nothing. */ () =>
      frame.GetDispatcher().Invalidate("calc-view"),
  );
  return {
    sheetWorkflows,
    fileWorkflows,
    store,
    autosave,
    controller,
    frame,
    /** Closes this session's shared frame and semantic model resources. @returns Nothing. */ Close(): void {
      sheetWorkflows.Close();
      autosave?.Close();
      detach();
      frame.CloseView();
      controller.Close();
    },
  };
}
/** Owns one session for this mount,as the Writer module host does. @returns Calc workspace. */
function CalcWorkspaceSession(): React.JSX.Element {
  const [session] = useState(createCalcSession);
  useEffect(
    /** Releases session-owned resources on unmount. @returns Cleanup. */ () => session.Close,
    [session],
  );
  return (
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />
  );
}
/** Registers a lazy Calc workspace without constructing a document until mounting. @returns Module factory. */
export function createCalcModuleFactory(): OfficeModuleFactory {
  return {
    suiteId: "calc",
    workspaceRetention: "dispose-on-unmount",
    /** Mounts the actual editor host. @returns Workspace. */ createWorkspace: () => (
      <CalcWorkspaceSession />
    ),
  };
}
