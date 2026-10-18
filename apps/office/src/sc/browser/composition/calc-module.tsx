/** @fileoverview Lazy production Calc module with one document/controller/frame ownership chain per mounted workspace. */
/* eslint-disable react-refresh/only-export-components -- The private workspace host belongs to the exported lazy module factory. */
import { useEffect, useState } from "react";
import type { OfficeModuleFactory } from "../../../framework/browser/app/modulemanager";
import { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import { CalcViewController } from "../controller/calc-view-controller";
import { createCalcInterface } from "../../sdi/scalc";
import { CalcWorkbench } from "../presentation/calc-workbench";
/** Creates one actual production session and connects shared Sfx state invalidation. @returns Session. */
export function createCalcSession() {
  const controller = new CalcViewController(),
    frame = new SfxViewFrame<CalcViewController>(new BrowserSfxDispatcher());
  frame.SetActiveView(controller, [createSfxShell(controller, createCalcInterface())]);
  const detach = controller.Subscribe(
    /** Invalidates shared command bindings when source/input state changes. @returns Nothing. */ () =>
      frame.GetDispatcher().Invalidate("calc-view"),
  );
  return {
    controller,
    frame,
    /** Closes this session's shared frame and semantic model resources. @returns Nothing. */ Close(): void {
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
  return <CalcWorkbench controller={session.controller} frame={session.frame} />;
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
