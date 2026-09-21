/** @fileoverview Owns the supported Writer view-shell execute/state handlers. */

import {
  createCommandShell,
  type CommandRegistry,
  type SfxShell,
} from "../../../../sfx2/source/control/dispatch";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterCommandRegistry, type WriterViewCommandTarget } from "./writercommands";

/** Dedicated view command shell owning Writer view and chrome registration. */
export class SwViewCommandShell {
  private readonly shell: SfxShell;
  /** Creates the view-shell slot owner. @param target - Active Writer view. @returns Nothing. */
  public constructor(target: WriterViewCommandTarget) {
    this.shell = createCommandShell(target, createWriterViewCommandRegistry(target));
  }
  /** Returns the dispatcher-facing shell. @returns Registered Sfx shell. */
  public GetShell(): SfxShell {
    return this.shell;
  }
}

/** Creates SwView-owned document, selection, and view-option commands. @param target - Persistent Writer view. @returns Validated immutable descriptors. */
export function createWriterViewCommandRegistry(
  target: WriterViewCommandTarget,
): CommandRegistry<WriterViewCommandTarget> {
  const lifecycleEnabled =
    /** Reads lifecycle command availability. @returns True outside a pending medium operation. */ (): boolean =>
      !target.IsStoragePending();
  return createWriterCommandRegistry([
    {
      capabilityId: "CAP-0114",
      /** Creates a new document in the persistent shell. @returns Nothing. */
      execute: (): void => target.NewDocument(),
      id: WRITER_COMMAND_IDS.newDocument,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0103",
      /** Requests browser Select All projection. @returns Nothing. */
      execute: (): void => target.RequestSelectAll(),
      id: WRITER_COMMAND_IDS.selectAll,
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles status-bar visibility. @returns Nothing. */
      execute: (): void => target.ToggleStatusBar(),
      id: WRITER_COMMAND_IDS.toggleStatusBar,
      /** Reads status-bar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsStatusBarVisible(),
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles horizontal-ruler visibility. @returns Nothing. */
      execute: (): void => target.ToggleHorizontalRuler(),
      id: WRITER_COMMAND_IDS.toggleHorizontalRuler,
      /** Reads horizontal-ruler visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsHorizontalRulerVisible(),
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles sidebar visibility. @returns Nothing. */
      execute: (): void => target.ToggleSidebar(),
      id: WRITER_COMMAND_IDS.toggleSidebar,
      /** Reads sidebar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsSidebarVisible(),
    },
  ]);
}
