/**
 * @fileoverview Adapts browser key events to an active SfxDispatcher without owning commands.
 */

import { useEffect } from "react";

import { getBrowserShortcut } from "../../source/accelerators/keymapping";
import type { SfxDispatcher } from "../../source/dispatch/dispatchprovider";

/** Options used by the browser accelerator adapter. */
export interface BrowserShortcutOptions {
  /** Active frame dispatcher that resolves every shortcut command. */
  readonly dispatcher: SfxDispatcher;
  /** Whether the Writer frame may currently consume browser accelerators. */
  readonly isActive: boolean;
  /** Supplies DOM-adapted arguments for the resolved command identity. */
  readonly resolveArguments: (commandId: string) => unknown;
  /** Optional presentation interceptor for commands such as dialogs. */
  readonly executeCommand: (commandId: string, arguments_: unknown) => { readonly status: string };
}

/**
 * Installs one key listener that resolves all registered Writer shortcuts through the active
 * shell stack.
 *
 * @param options - Active dispatcher, visibility, and DOM argument adapter.
 * @param options.dispatcher - Active frame dispatcher.
 * @param options.executeCommand - Presentation-aware command executor.
 * @param options.isActive - Whether Writer may consume shortcuts.
 * @param options.resolveArguments - DOM argument adapter for the resolved command.
 * @returns Nothing; React owns listener installation and cleanup only.
 */
export function useCommandShortcuts({
  dispatcher,
  executeCommand,
  isActive,
  resolveArguments,
}: BrowserShortcutOptions): void {
  useEffect(
    /** Installs the active frame accelerator adapter. @returns Cleanup removing the listener. */
    function installCommandShortcuts(): () => void {
      /** Resolves and executes one registered shortcut command. @param event - Browser keyboard event. @returns Nothing. */
      function handleKeyDown(event: KeyboardEvent): void {
        if (!isActive) return;
        const shortcut = getBrowserShortcut(event);
        if (shortcut === undefined) return;
        const command = dispatcher.FindCommandByShortcut(shortcut);
        if (command === undefined) return;
        const arguments_ = resolveArguments(command.command.id);
        const result = executeCommand(command.command.id, arguments_);
        if (result.status === "executed") event.preventDefault();
      }
      window.addEventListener("keydown", handleKeyDown);
      return /** Removes the frame accelerator listener. @returns Nothing. */ function removeCommandShortcuts(): void {
        window.removeEventListener("keydown", handleKeyDown);
      };
    },
    [dispatcher, executeCommand, isActive, resolveArguments],
  );
}
