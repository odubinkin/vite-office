/**
 * @fileoverview Adapts browser key events to the active Writer SfxDispatcher without claiming
 * LibreOffice `textsh.cxx` command-shell ownership.
 */

import { useEffect } from "react";

import { getBrowserShortcut } from "../../../framework/source/accelerators/keymapping";
import type { SfxDispatcher } from "../../../framework/source/dispatch/dispatchprovider";

/** Options used by the browser accelerator adapter. */
export interface WriterShortcutOptions {
  /** Active frame dispatcher that resolves every shortcut command. */
  readonly dispatcher: SfxDispatcher;
  /** Whether the Writer frame may currently consume browser accelerators. */
  readonly isActive: boolean;
  /** Supplies DOM-adapted arguments for the resolved command identity. */
  readonly resolveArguments: (commandId: string) => unknown;
}

/**
 * Installs one key listener that resolves all registered Writer shortcuts through the active
 * shell stack.
 *
 * @param options - Active dispatcher, visibility, and DOM argument adapter.
 * @param options.dispatcher - Active frame dispatcher.
 * @param options.isActive - Whether Writer may consume shortcuts.
 * @param options.resolveArguments - DOM argument adapter for the resolved command.
 * @returns Nothing; React owns listener installation and cleanup only.
 */
export function useWriterCommandShortcuts({
  dispatcher,
  isActive,
  resolveArguments,
}: WriterShortcutOptions): void {
  useEffect(
    /** Installs the active frame accelerator adapter. @returns Cleanup removing the listener. */
    function installWriterShortcuts(): () => void {
      /** Resolves and executes one registered shortcut command. @param event - Browser keyboard event. @returns Nothing. */
      function handleKeyDown(event: KeyboardEvent): void {
        if (!isActive) return;
        const shortcut = getBrowserShortcut(event);
        if (shortcut === undefined) return;
        const command = dispatcher.FindCommandByShortcut(shortcut);
        if (command === undefined) return;
        if (command.execute(resolveArguments(command.command.id)).status === "executed")
          event.preventDefault();
      }
      window.addEventListener("keydown", handleKeyDown);
      return /** Removes the frame accelerator listener. @returns Nothing. */ function removeWriterShortcuts(): void {
        window.removeEventListener("keydown", handleKeyDown);
      };
    },
    [dispatcher, isActive, resolveArguments],
  );
}
