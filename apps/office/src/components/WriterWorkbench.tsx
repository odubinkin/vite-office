/**
 * @fileoverview Owns the bounded Writer document workbench state and browser-only editing controls.
 */

import { useEffect, useState } from "react";

import { getBrowserShortcut } from "../domain/browser-shortcuts";
import { createCommandRegistry, dispatchCommand, findCommandByShortcut } from "../domain/commands";
import { createDocument } from "../domain/document";
import {
  applyTransaction,
  createTransactionHistory,
  getCurrentTransactionState,
  redoTransaction,
  undoTransaction,
  type TransactionHistory,
} from "../domain/history";
import {
  appendWriterParagraph,
  createWriterDocument,
  removeWriterParagraph,
  replaceWriterParagraph,
  type WriterDocument,
  type WriterParagraph,
} from "../domain/writer";
import {
  loadWriterDocument,
  saveWriterDocument,
  type WriterSnapshotState,
} from "../domain/writer-storage";
import { downloadPlainText } from "../platform/browser-download";
import { IndexedDbDocumentStorageAdapter } from "../platform/indexeddb-storage";
import { WriterCommandToolbar } from "./WriterCommandToolbar";
import { WriterPlainTextEditor } from "./WriterPlainTextEditor";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";

/**
 * Creates the bounded initial Writer document edited by the workbench textarea.
 *
 * @returns An immutable Writer document with a single empty paragraph and new lifecycle state.
 */
function createWriterWorkbenchDocument(): WriterDocument {
  return createWriterDocument(
    createDocument({
      id: "writer-workbench",
      suiteId: "writer",
      title: "Untitled Writer Document",
    }),
    "writer-paragraph-1",
  );
}

/**
 * Reads the initial paragraph length from the Writer workbench invariant.
 *
 * @param writerDocument - Immutable Writer document inspected without mutation.
 * @returns UTF-16 text length used as a deterministic history selection.
 */
function getWorkbenchSelectionPosition(writerDocument: WriterDocument): number {
  return (writerDocument.paragraphs[0] as WriterParagraph).text.length;
}

/**
 * Derives the first available numeric paragraph identity for the bounded workbench document.
 *
 * @param writerDocument - Immutable Writer document whose existing identities are inspected.
 * @returns Stable next paragraph identity that does not collide with the current body.
 */
function getNextWriterParagraphId(writerDocument: WriterDocument): string {
  let ordinal = writerDocument.paragraphs.length + 1;
  let candidate = `writer-paragraph-${ordinal}`;
  while (
    writerDocument.paragraphs.some(
      /**
       * Detects whether an existing paragraph owns the candidate identity.
       *
       * @param paragraph - Immutable paragraph candidate to inspect.
       * @returns True only when the candidate identity is already occupied.
       */
      function hasCandidateId(paragraph): boolean {
        return paragraph.id === candidate;
      },
    )
  ) {
    ordinal += 1;
    candidate = `writer-paragraph-${ordinal}`;
  }
  return candidate;
}

/** Describes the suite-selection visibility controlled by the application shell. */
export interface WriterWorkbenchProps {
  /** Whether Writer is the current suite and its workbench should be interactable. */
  readonly isActive: boolean;
}

/**
 * Renders the browser-only Writer workbench and owns its bounded document session.
 *
 * @param props - Suite-selection visibility owned by the application shell.
 * @param props.isActive - Whether the workbench is visible and may execute Writer shortcuts.
 * @returns The editor, history controls, and browser-local storage actions for Writer.
 */
export function WriterWorkbench({ isActive }: WriterWorkbenchProps): React.JSX.Element {
  const [storagePending, setStoragePending] = useState(false);
  const [storageStatus, setStorageStatus] = useState("Not saved in this browser.");
  const [writerHistory, setWriterHistory] = useState<TransactionHistory<WriterDocument>>(
    /**
     * Creates the Writer history once for the browser workbench session.
     *
     * @returns Initial history containing the new Writer document.
     */
    function createWriterHistory(): TransactionHistory<WriterDocument> {
      const initialDocument = createWriterWorkbenchDocument();
      return createTransactionHistory(initialDocument, {
        position: getWorkbenchSelectionPosition(initialDocument),
      });
    },
  );
  const writerDocument = getCurrentTransactionState(writerHistory);
  const writerStorage =
    globalThis.indexedDB === undefined
      ? undefined
      : new IndexedDbDocumentStorageAdapter<WriterSnapshotState>("vite-office-writer-workbench");

  /**
   * Replaces the selected Writer paragraph text through the immutable domain transition.
   *
   * @param paragraphId - Stable identity of the Writer paragraph being edited.
   * @param text - Complete next plain-text value emitted by the Writer textarea.
   * @returns Nothing; React schedules the next Writer document state.
   */
  function handleWriterTextChange(paragraphId: string, text: string): void {
    setWriterHistory(
      /**
       * Applies the complete-text replacement to the selected workbench paragraph.
       *
       * @param currentHistory - Current immutable Writer workbench history state.
       * @returns History with the paragraph replacement applied as a new snapshot.
       */
      function replaceWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const nextDocument = replaceWriterParagraph(
          getCurrentTransactionState(currentHistory),
          paragraphId,
          text,
        );
        return applyTransaction(currentHistory, nextDocument, { position: text.length });
      },
    );
  }

  /** Appends an empty Writer paragraph through an immutable history transaction. @returns Nothing; React schedules the appended document state. */
  function handleWriterAppendParagraph(): void {
    setWriterHistory(
      /**
       * Appends one uniquely identified paragraph to the current history document.
       *
       * @param currentHistory - Immutable Writer history before paragraph append.
       * @returns History containing the appended empty paragraph as its latest snapshot.
       */
      function appendWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const currentDocument = getCurrentTransactionState(currentHistory);
        const nextDocument = appendWriterParagraph(
          currentDocument,
          getNextWriterParagraphId(currentDocument),
        );
        return applyTransaction(currentHistory, nextDocument, {
          position: getWorkbenchSelectionPosition(nextDocument),
        });
      },
    );
  }

  /**
   * Removes one eligible Writer paragraph through an immutable history transaction.
   *
   * @param paragraphId - Stable identity of the paragraph to remove.
   * @returns Nothing; React schedules the reduced document state.
   */
  function handleWriterRemoveParagraph(paragraphId: string): void {
    setWriterHistory(
      /**
       * Removes the selected paragraph from the current immutable history document.
       *
       * @param currentHistory - Immutable Writer history before paragraph removal.
       * @returns History containing the reduced paragraph body as its latest snapshot.
       */
      function removeWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const nextDocument = removeWriterParagraph(
          getCurrentTransactionState(currentHistory),
          paragraphId,
        );
        return applyTransaction(currentHistory, nextDocument, {
          position: getWorkbenchSelectionPosition(nextDocument),
        });
      },
    );
  }

  /** Restores the preceding Writer snapshot. @returns Nothing; React schedules an undo. */
  function handleWriterUndo(): void {
    setWriterHistory(
      /**
       * Moves history backward and derives its deterministic selection from the restored text.
       *
       * @param currentHistory - Immutable history before undo.
       * @returns History positioned at the preceding snapshot when one exists.
       */
      function undoWriterHistory(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const candidate = undoTransaction(currentHistory, { position: 0 });
        return undoTransaction(currentHistory, {
          position: getWorkbenchSelectionPosition(getCurrentTransactionState(candidate)),
        });
      },
    );
  }

  /** Restores the following Writer snapshot. @returns Nothing; React schedules a redo. */
  function handleWriterRedo(): void {
    setWriterHistory(
      /**
       * Moves history forward and derives its deterministic selection from the restored text.
       *
       * @param currentHistory - Immutable history before redo.
       * @returns History positioned at the following snapshot when one exists.
       */
      function redoWriterHistory(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const candidate = redoTransaction(currentHistory, { position: 0 });
        return redoTransaction(currentHistory, {
          position: getWorkbenchSelectionPosition(getCurrentTransactionState(candidate)),
        });
      },
    );
  }

  /** Saves the current Writer snapshot to native browser storage. @returns A promise resolved after feedback is updated. */
  async function handleWriterSave(): Promise<void> {
    if (writerStorage === undefined) {
      setStorageStatus("Browser storage is unavailable.");
      return;
    }
    setStoragePending(true);
    try {
      await saveWriterDocument(writerStorage, writerDocument);
      setStorageStatus("Saved locally in this browser.");
    } catch {
      setStorageStatus("Could not save locally.");
    } finally {
      setStoragePending(false);
    }
  }

  /** Loads the current Writer identity from native browser storage. @returns A promise resolved after feedback is updated. */
  async function handleWriterLoad(): Promise<void> {
    if (writerStorage === undefined) {
      setStorageStatus("Browser storage is unavailable.");
      return;
    }
    setStoragePending(true);
    try {
      const result = await loadWriterDocument(writerStorage, writerDocument.document.id);
      if (result.status === "missing") setStorageStatus("No local saved copy exists.");
      else {
        setWriterHistory(
          createTransactionHistory(result.writerDocument, {
            position: getWorkbenchSelectionPosition(result.writerDocument),
          }),
        );
        setStorageStatus("Loaded local saved copy.");
      }
    } catch {
      setStorageStatus("Could not load local copy.");
    } finally {
      setStoragePending(false);
    }
  }

  /** Downloads the ordered Writer paragraph body as a UTF-8 plain-text file. @returns Nothing; browser download ownership begins after dispatch. */
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

  useEffect(
    /**
     * Installs Writer-only keyboard command dispatch and releases it when history changes.
     *
     * @returns Cleanup that removes the registered browser listener.
     */
    function installWriterShortcuts(): () => void {
      const registry = createCommandRegistry([
        {
          execute: handleWriterUndo,
          id: "writer.undo",
          isEnabled:
            /** Determines whether Ctrl Undo can run for the current Writer history. @returns True when a prior snapshot exists in Writer. */
            function canUndo(): boolean {
              return isActive && writerHistory.index > 0;
            },
          label: "Undo",
          shortcut: "Ctrl+Z",
        },
        {
          execute: handleWriterRedo,
          id: "writer.redo",
          isEnabled:
            /** Determines whether Ctrl Redo can run for the current Writer history. @returns True when a following snapshot exists in Writer. */
            function canRedo(): boolean {
              return isActive && writerHistory.index < writerHistory.entries.length - 1;
            },
          label: "Redo",
          shortcut: "Ctrl+Shift+Z",
        },
        {
          execute: handleWriterUndo,
          id: "writer.metaUndo",
          isEnabled:
            /** Determines whether Meta Undo can run for the current Writer history. @returns True when a prior snapshot exists in Writer. */
            function canUndo(): boolean {
              return isActive && writerHistory.index > 0;
            },
          label: "Undo",
          shortcut: "Meta+Z",
        },
        {
          execute: handleWriterRedo,
          id: "writer.metaRedo",
          isEnabled:
            /** Determines whether Meta Redo can run for the current Writer history. @returns True when a following snapshot exists in Writer. */
            function canRedo(): boolean {
              return isActive && writerHistory.index < writerHistory.entries.length - 1;
            },
          label: "Redo",
          shortcut: "Meta+Shift+Z",
        },
      ]);
      /**
       * Dispatches one recognized browser shortcut and prevents its native default when executed.
       *
       * @param event - Browser keyboard event inspected and optionally cancelled.
       * @returns Nothing; command execution schedules React state updates.
       */
      function handleKeyDown(event: KeyboardEvent): void {
        const shortcut = getBrowserShortcut(event);
        if (shortcut === undefined) return;
        const command = findCommandByShortcut(registry, shortcut);
        if (command === undefined) return;
        const result = dispatchCommand(registry, command.id, undefined);
        if (result.status === "executed") event.preventDefault();
      }
      window.addEventListener("keydown", handleKeyDown);
      /** Removes the listener owned by this effect invocation. @returns Nothing. */
      function removeWriterShortcuts(): void {
        window.removeEventListener("keydown", handleKeyDown);
      }
      return removeWriterShortcuts;
    },
    [isActive, writerHistory],
  );

  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={writerDocument.document.title}
        status={storageStatus}
        toolbar={
          <WriterCommandToolbar
            canRedo={writerHistory.index < writerHistory.entries.length - 1}
            canUndo={writerHistory.index > 0}
            isStoragePending={storagePending}
            onAppendParagraph={handleWriterAppendParagraph}
            onDownload={handleWriterDownload}
            onLoad={handleWriterLoad}
            onRedo={handleWriterRedo}
            onSave={handleWriterSave}
            onUndo={handleWriterUndo}
          />
        }
      >
        <WriterPlainTextEditor
          document={writerDocument.document}
          onRemoveParagraph={handleWriterRemoveParagraph}
          onTextChange={handleWriterTextChange}
          paragraphs={writerDocument.paragraphs}
        />
      </WriterWorkspaceChrome>
    </div>
  );
}
