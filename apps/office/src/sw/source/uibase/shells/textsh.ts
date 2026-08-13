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
import type { WriterParagraph, WriterTextRun } from "../../core/doc/writer";
import { copyRichText, readRichClipboard } from "../../../../vcl/browser/browser-clipboard";
import { downloadPlainText } from "../../../../vcl/browser/browser-download";
import { createWriterClipboardSelection, parseWriterClipboardPaste } from "../dochdl/swdtflvr";
import type { WriterParagraphTextRange } from "../../core/doc/DocumentContentOperationsManager";
import { getWriterCollapsedParagraphCaret, getWriterSameParagraphSelection } from "../wrtsh/select";

/** Describes the document session and status outlet used by browser-owned Writer commands. */
export interface WriterBrowserCommandOptions {
  /** Active Writer paragraph used as the deterministic Paste fallback when browser caret selection is unavailable. */
  readonly activeParagraph: WriterParagraph;
  /** Applies removal of a successfully copied same-paragraph Writer selection. */
  readonly onCut: (range: WriterParagraphTextRange) => void;
  /** Applies safe clipboard text at the resolved Writer selection or collapsed caret. */
  readonly onPaste: (range: WriterParagraphTextRange, runs: readonly WriterTextRun[]) => void;
  /** Immutable current Writer document used to serialize a plain-text download. */
  readonly writerDocument: WriterDocument;
  /** React status setter used to surface deterministic browser command feedback. */
  readonly setStorageStatus: Dispatch<SetStateAction<string>>;
}

/** Describes commands that delegate an operation to a browser capability. */
export interface WriterBrowserCommands {
  /** Copies the native selection and deletes it only after a successful browser clipboard write. */
  readonly handleWriterCut: () => Promise<void>;
  /** Starts a plain-text browser download for the current Writer document. */
  readonly handleWriterDownload: () => void;
  /** Copies the native document selection through the browser clipboard. */
  readonly handleWriterCopy: () => Promise<void>;
  /** Reads browser clipboard text and inserts it at the current Writer selection or caret. */
  readonly handleWriterPaste: () => Promise<void>;
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
 * @param options.activeParagraph - Active paragraph used as a Paste fallback when browser selection is unavailable.
 * @param options.onCut - Callback deleting a successfully copied selection.
 * @param options.onPaste - Callback inserting safe parsed clipboard runs.
 * @param options.writerDocument - Immutable document whose ordered paragraphs form the download.
 * @param options.setStorageStatus - Status setter used to expose browser command feedback.
 * @returns Browser commands suitable for the Writer menus and standard toolbar.
 */
export function useWriterBrowserCommands({
  activeParagraph,
  onCut,
  onPaste,
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

  /**
   * Copies one same-paragraph native Writer selection, then removes it only if the browser accepted its clipboard payload.
   *
   * @returns A promise resolved after deterministic Cut feedback is recorded.
   */
  async function handleWriterCut(): Promise<void> {
    const range = getWriterSameParagraphSelection(globalThis.getSelection());
    const selection = createWriterClipboardSelection(globalThis.getSelection());
    if (range === undefined || selection === undefined) {
      setStorageStatus("Select text in one paragraph to cut.");
      return;
    }
    try {
      await copyRichText(selection);
      onCut(range);
      setStorageStatus("Cut selection.");
    } catch {
      setStorageStatus("Could not cut selection.");
    }
  }

  /**
   * Reads browser clipboard data and inserts only the bounded Writer text representation at a selection or caret.
   *
   * @returns A promise resolved after deterministic Paste feedback is recorded.
   */
  async function handleWriterPaste(): Promise<void> {
    const range = getWriterPasteRange(globalThis.getSelection(), activeParagraph);
    try {
      const clipboard = await readRichClipboard();
      const paste = parseWriterClipboardPaste(clipboard.html, clipboard.plainText);
      if (paste === undefined) {
        setStorageStatus("Clipboard has no text to paste.");
        return;
      }
      onPaste(range, paste.runs);
      setStorageStatus("Pasted clipboard text.");
    } catch {
      setStorageStatus("Could not read browser clipboard.");
    }
  }

  return { handleWriterCopy, handleWriterCut, handleWriterDownload, handleWriterPaste };
}

/**
 * Resolves the user-visible Writer Paste target from a same-paragraph selection, collapsed browser caret, or active paragraph end.
 *
 * @param selection - Current native browser selection or null when unavailable.
 * @param activeParagraph - Active immutable Writer paragraph used as the deterministic final fallback.
 * @returns Valid immutable same-paragraph insertion or replacement range.
 */
function getWriterPasteRange(
  selection: Selection | null,
  activeParagraph: WriterParagraph,
): WriterParagraphTextRange {
  const selectedRange = getWriterSameParagraphSelection(selection);
  if (selectedRange !== undefined) return selectedRange;
  const caret = getWriterCollapsedParagraphCaret(selection);
  if (caret !== undefined)
    return { end: caret.offset, paragraphId: caret.paragraphId, start: caret.offset };
  return {
    end: activeParagraph.text.length,
    paragraphId: activeParagraph.id,
    start: activeParagraph.text.length,
  };
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
