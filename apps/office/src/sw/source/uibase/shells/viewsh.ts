/** @fileoverview Owns the supported Writer view-shell execute/state handlers. */

import {
  createCommandShell,
  type CommandRegistry,
  type SfxShell,
} from "../../../../sfx2/source/control/dispatch";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import {
  createWriterCommandRegistry,
  getWriterCommandArguments,
  type WriterViewCommandTarget,
} from "./writercommands";

/** Dedicated view command shell owning lifecycle and chrome registration. */
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

/** Creates SwView-owned lifecycle, browser-adapter, and chrome commands. @param target - Persistent Writer view. @returns Validated immutable descriptors. */
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
      capabilityId: "CAP-0113",
      /** Opens an ODT through the view medium adapter. @returns Completion after selection and import. */
      execute: (): Promise<void> => target.OpenOdt(),
      id: WRITER_COMMAND_IDS.openOdt,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0113",
      /** Starts an ODT Save As operation. @returns Completion after worker export. */
      execute: (): Promise<void> => target.SaveOdt(),
      id: WRITER_COMMAND_IDS.saveOdt,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0114",
      /** Opens the browser-local primary medium. @returns Completion after lookup. */
      execute: (): Promise<void> => target.LoadLocal(),
      id: WRITER_COMMAND_IDS.openLocal,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0114",
      /** Saves to the browser-local primary medium. @returns Completion after acknowledgement. */
      execute: (): Promise<void> => target.SaveLocal(),
      id: WRITER_COMMAND_IDS.saveLocal,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0101",
      /** Starts plain-text export. @returns Nothing. */
      execute: (): Promise<void> => target.ExportText(),
      id: WRITER_COMMAND_IDS.exportText,
    },
    {
      capabilityId: "CAP-0106",
      /** Copies DOM-adapted selection data. @param _context - Bound view context. @param arguments_ - Selection arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> =>
        target.Copy(getWriterCommandArguments<unknown>(arguments_)),
      id: WRITER_COMMAND_IDS.copy,
    },
    {
      capabilityId: "CAP-0110",
      /** Cuts DOM-adapted selection data. @param _context - Bound view context. @param arguments_ - Cut arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> =>
        target.Cut(getWriterCommandArguments<unknown>(arguments_)),
      id: WRITER_COMMAND_IDS.cut,
    },
    {
      capabilityId: "CAP-0110",
      /** Pastes DOM-adapted clipboard data. @param _context - Bound view context. @param arguments_ - Paste arguments. @returns Clipboard completion. */
      execute: (_context, arguments_): Promise<void> =>
        target.Paste(getWriterCommandArguments<unknown>(arguments_)),
      id: WRITER_COMMAND_IDS.paste,
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
