/**
 * @fileoverview Provides browser-owned Writer text-shell commands that do not mutate the document model, at the LibreOffice `sw/source/uibase/shells/textsh.cxx` ownership boundary.
 */

import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { getBrowserShortcut } from "../../../../framework/source/accelerators/keymapping";
import {
  createCommandRegistry,
  dispatchCommand,
  findCommandByShortcut,
} from "../../../../framework/source/dispatch/dispatchprovider";
import type { TransactionHistory } from "../../../../sfx2/source/doc/docundomanager";
import type { WriterDocument } from "../../core/doc/writer";
import { copyRichText } from "../../../../vcl/browser/browser-clipboard";
import { downloadPlainText } from "../../../../vcl/browser/browser-download";
import { createWriterClipboardSelection } from "../dochdl/swdtflvr";

/** Describes the document session and status outlet used by browser-owned Writer commands. */
export interface WriterBrowserCommandOptions {
  /** Immutable current Writer document used to serialize a plain-text download. */
  readonly writerDocument: WriterDocument;
  /** React status setter used to surface deterministic browser command feedback. */
  readonly setStorageStatus: Dispatch<SetStateAction<string>>;
}

/** Describes commands that delegate an operation to a browser capability. */
export interface WriterBrowserCommands {
  /** Starts a plain-text browser download for the current Writer document. */
  readonly handleWriterDownload: () => void;
  /** Copies the native document selection through the browser clipboard. */
  readonly handleWriterCopy: () => Promise<void>;
}

/** Describes the stable state and callbacks used to register Writer history shortcuts. */
export interface WriterHistoryShortcutsOptions {
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
 * Creates Writer commands that delegate downloads and copying to browser APIs.
 *
 * @param options - Current document and status feedback outlet owned by the Writer workbench.
 * @param options.writerDocument - Immutable document whose ordered paragraphs form the download.
 * @param options.setStorageStatus - Status setter used to expose browser command feedback.
 * @returns Browser commands suitable for the Writer menus and standard toolbar.
 */
export function useWriterBrowserCommands({
  writerDocument,
  setStorageStatus,
}: WriterBrowserCommandOptions): WriterBrowserCommands {
  /**
   * Downloads the ordered Writer paragraph body as a UTF-8 plain-text file.
   *
   * @returns Nothing; browser download ownership begins after dispatch.
   */
  function handleWriterDownload(): void {
    try {
      downloadPlainText(
        writerDocument.paragraphs
          .map(
            /**
             * Extracts one paragraph body in document order for plain-text serialization.
             *
             * @param paragraph - Immutable paragraph whose text is serialized unchanged.
             * @returns The paragraph plain-text body.
             */
            function extractParagraphText(paragraph): string {
              return paragraph.text;
            },
          )
          .join("\n"),
        `${writerDocument.document.title}.txt`,
      );
      setStorageStatus("Plain-text download started.");
    } catch {
      setStorageStatus("Could not start plain-text download.");
    }
  }

  /**
   * Copies the current native Writer selection without changing the document model.
   *
   * @returns A promise resolved after copy feedback is recorded.
   */
  async function handleWriterCopy(): Promise<void> {
    const selection = createWriterClipboardSelection(globalThis.getSelection());
    if (selection === undefined) {
      setStorageStatus("Select text to copy.");
      return;
    }
    try {
      await copyRichText(selection);
      setStorageStatus("Copied selection.");
    } catch {
      setStorageStatus("Could not copy selection.");
    }
  }

  return { handleWriterCopy, handleWriterDownload };
}

/**
 * Installs Ctrl/Meta Undo and Redo dispatch for the active Writer text shell.
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
}: WriterHistoryShortcutsOptions): void {
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
