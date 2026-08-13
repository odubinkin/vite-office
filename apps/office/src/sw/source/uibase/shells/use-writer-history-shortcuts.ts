/** @fileoverview Registers Writer undo and redo browser shortcuts independently from workbench rendering. */

import { useEffect } from "react";

import { getBrowserShortcut } from "../../../../framework/source/accelerators/browser-shortcuts";
import {
  createCommandRegistry,
  dispatchCommand,
  findCommandByShortcut,
} from "../../../../framework/source/dispatch/commands";
import type { TransactionHistory } from "../../../../sfx2/source/doc/history";
import type { WriterDocument } from "../../core/doc/writer";

/** Describes the stable state and callbacks used to register Writer history shortcuts. */
export interface UseWriterHistoryShortcutsOptions {
  /** Whether Writer is the active suite and commands may execute. */
  readonly isActive: boolean;
  /** Current immutable Writer history that determines command availability. */
  readonly history: TransactionHistory<WriterDocument>;
  /** Schedules restoration of the preceding Writer history entry. */
  readonly onUndo: () => void;
  /** Schedules restoration of the following Writer history entry. */
  readonly onRedo: () => void;
}

/**
 * Installs Ctrl/Meta Undo and Redo dispatch for the active Writer workbench.
 *
 * @param options - Immutable availability state and callbacks owned by the Writer workbench.
 * @param options.isActive - Whether the Writer suite may receive history shortcuts.
 * @param options.history - Current history cursor used to enable or disable commands.
 * @param options.onUndo - Callback that schedules immutable undo.
 * @param options.onRedo - Callback that schedules immutable redo.
 * @returns Nothing; the hook owns a browser listener for the component lifetime.
 */
export function useWriterHistoryShortcuts({
  history,
  isActive,
  onRedo,
  onUndo,
}: UseWriterHistoryShortcutsOptions): void {
  useEffect(
    /** Installs and cleans up the current Writer shortcut registry. @returns Cleanup that removes the browser key listener. */
    function installWriterShortcuts(): () => void {
      const registry = createCommandRegistry([
        {
          execute: onUndo,
          id: "writer.undo",
          /** Checks whether Ctrl Undo has a prior Writer snapshot. @returns True when undo is available. */
          isEnabled: function canUndo(): boolean {
            return isActive && history.index > 0;
          },
          label: "Undo",
          shortcut: "Ctrl+Z",
        },
        {
          execute: onRedo,
          id: "writer.redo",
          /** Checks whether Ctrl Redo has a following Writer snapshot. @returns True when redo is available. */
          isEnabled: function canRedo(): boolean {
            return isActive && history.index < history.entries.length - 1;
          },
          label: "Redo",
          shortcut: "Ctrl+Shift+Z",
        },
        {
          execute: onUndo,
          id: "writer.metaUndo",
          /** Checks whether Meta Undo has a prior Writer snapshot. @returns True when undo is available. */
          isEnabled: function canUndo(): boolean {
            return isActive && history.index > 0;
          },
          label: "Undo",
          shortcut: "Meta+Z",
        },
        {
          execute: onRedo,
          id: "writer.metaRedo",
          /** Checks whether Meta Redo has a following Writer snapshot. @returns True when redo is available. */
          isEnabled: function canRedo(): boolean {
            return isActive && history.index < history.entries.length - 1;
          },
          label: "Redo",
          shortcut: "Meta+Shift+Z",
        },
      ]);
      /** Dispatches one recognized shortcut. @param event - Browser keyboard event inspected and optionally cancelled. @returns Nothing; command execution schedules workbench state. */
      function handleKeyDown(event: KeyboardEvent): void {
        const shortcut = getBrowserShortcut(event);
        if (shortcut === undefined) return;
        const command = findCommandByShortcut(registry, shortcut);
        if (command === undefined) return;
        if (dispatchCommand(registry, command.id, undefined).status === "executed")
          event.preventDefault();
      }
      window.addEventListener("keydown", handleKeyDown);
      /** Removes this hook instance's browser listener. @returns Nothing. */
      function removeWriterShortcuts(): void {
        window.removeEventListener("keydown", handleKeyDown);
      }
      return removeWriterShortcuts;
    },
    [history, isActive, onRedo, onUndo],
  );
}
