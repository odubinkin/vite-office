/** @fileoverview Dispatches source Calc shortcuts shared by the workspace and its input surfaces. */
import type { KeyboardEvent } from "react";
import { getBrowserShortcut } from "../../../framework/browser/accelerators/keymapping";
import type { BrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import type { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import type { CalcViewController } from "../controller/calc-view-controller";

/** Routes a shared accelerator after native grid, edit and modal owners have had first refusal. @param event - Workspace key. @param frame - Native dispatch frame. @param source - Browser command projection. @param modal - Whether a dialog owns keys. @returns Nothing. */
export function HandleWorkspaceShortcut(
  event: KeyboardEvent,
  frame: SfxViewFrame<CalcViewController>,
  source: BrowserCommandSource,
  modal: boolean,
): void {
  if (event.defaultPrevented || event.nativeEvent.isComposing || modal) return;
  const dispatcher = frame.GetDispatcher();
  const shortcut = getBrowserShortcut(event);
  if (shortcut === "F2") {
    event.preventDefault();
    dispatcher.Execute(".uno:SetInputMode");
    return;
  }
  // The grid owns platform-specific row and column Space selection.
  if (
    !(event.ctrlKey || event.metaKey || event.key === "F9") ||
    event.code === "Space" ||
    event.key === " "
  )
    return;
  const command = shortcut === undefined ? undefined : dispatcher.FindCommandByShortcut(shortcut);
  if (!command) return;
  if (
    command.command.id === ".uno:SelectAll" &&
    (event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')
  )
    return;
  event.preventDefault();
  source.Execute(command.command.id);
}
