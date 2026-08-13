/**
 * @fileoverview Owns the bounded Writer document workbench state and browser-only editing controls.
 */

import { useState } from "react";
import {
  applyTransaction,
  createTransactionHistory,
  getCurrentTransactionState,
  redoTransaction,
  undoTransaction,
  type TransactionHistory,
} from "../../../../sfx2/source/doc/history";
import {
  replaceWriterParagraph,
  mergeWriterParagraphWithPrevious,
  setWriterParagraphAlignment,
  setWriterParagraphStyle,
  splitWriterParagraph,
  type WriterDocument,
  type WriterParagraph,
  type WriterParagraphAlignment,
  type WriterParagraphStyle,
} from "../../core/doc/writer";
import {
  loadWriterDocument,
  saveWriterDocument,
  type WriterSnapshotState,
} from "../../core/doc/writer-storage";
import { IndexedDbDocumentStorageAdapter } from "../../../../vcl/browser/indexeddb-storage";
import { WriterCommandToolbar } from "../utlui/WriterCommandToolbar";
import { WriterMenuBar } from "../utlui/WriterMenuBar";
import { WriterParagraphFormattingToolbar } from "../ribbar/WriterParagraphFormattingToolbar";
import { WriterParagraphProperties } from "../sidebar/WriterParagraphProperties";
import { WriterPlainTextEditor } from "../docvw/WriterPlainTextEditor";
import { WriterWorkspaceChrome } from "./WriterWorkspaceChrome";
import { useWriterHistoryShortcuts } from "../shells/use-writer-history-shortcuts";
import { useWriterBrowserCommands } from "../utlui/use-writer-browser-commands";
import {
  useWriterDocumentSelection,
  useWriterWorkspaceChrome,
} from "./use-writer-workspace-chrome";
import {
  getActiveWriterParagraph,
  createWriterWorkbenchDocument,
  getNextWriterParagraphId,
  getWorkbenchSelectionPosition,
  moveWriterParagraphInHistory,
} from "./writer-workbench-helpers";

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
  const [activeParagraphId, setActiveParagraphId] = useState("writer-paragraph-1");
  const [focusParagraphId, setFocusParagraphId] = useState<string>();
  const [focusParagraphOffset, setFocusParagraphOffset] = useState<number>();
  const {
    isHorizontalRulerVisible,
    isPropertiesSidebarVisible,
    isStatusBarVisible,
    setIsHorizontalRulerVisible,
    setIsPropertiesSidebarVisible,
    setIsStatusBarVisible,
  } = useWriterWorkspaceChrome();
  const { requestSelectAll, selectAllRequestId } = useWriterDocumentSelection();
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
  const activeParagraph = getActiveWriterParagraph(writerDocument, activeParagraphId);
  const activeParagraphIndex = writerDocument.paragraphs.indexOf(activeParagraph);
  const { handleWriterCopy, handleWriterDownload } = useWriterBrowserCommands({
    setStorageStatus,
    writerDocument,
  });
  const writerStorage =
    globalThis.indexedDB === undefined
      ? undefined
      : new IndexedDbDocumentStorageAdapter<WriterSnapshotState>("vite-office-writer-workbench");

  /**
   * Replaces the selected Writer paragraph text through the immutable domain transition.
   *
   * @param paragraphId - Stable identity of the Writer paragraph being edited.
   * @param text - Complete next plain-text value emitted by the Writer editable paragraph.
   * @returns Nothing; React schedules the next Writer document state.
   */
  function handleWriterTextChange(paragraphId: string, text: string): void {
    setActiveParagraphId(paragraphId);
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

  /**
   * Records the paragraph whose editable block is currently focused for subsequent formatting commands.
   *
   * @param paragraphId - Existing Writer paragraph identity emitted by the focused editable block.
   * @returns Nothing; React schedules focused-paragraph state.
   */
  function handleWriterParagraphFocus(paragraphId: string): void {
    setActiveParagraphId(paragraphId);
  }

  /**
   * Splits the editable Writer paragraph at an unmodified Enter caret and targets the trailing paragraph.
   *
   * @param paragraphId - Existing Writer paragraph identity that received the native Enter key.
   * @param offset - Collapsed UTF-16 caret offset within that paragraph's current plain text.
   * @returns Nothing; React schedules the immutable split history transition and post-render browser focus.
   */
  function handleWriterParagraphBreak(paragraphId: string, offset: number): void {
    const nextParagraphId = getNextWriterParagraphId(writerDocument);
    setActiveParagraphId(nextParagraphId);
    setFocusParagraphId(nextParagraphId);
    setFocusParagraphOffset(0);
    setWriterHistory(
      /**
       * Applies the paragraph break to the current immutable history snapshot.
       *
       * @param currentHistory - Current Writer workbench history state.
       * @returns History containing the split document with the caret position reset for the trailing paragraph.
       */
      function splitWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const nextDocument = splitWriterParagraph(
          getCurrentTransactionState(currentHistory),
          paragraphId,
          offset,
          nextParagraphId,
        );
        return applyTransaction(currentHistory, nextDocument, { position: 0 });
      },
    );
  }

  /**
   * Removes the preceding paragraph break and focuses the surviving paragraph at the original join boundary.
   *
   * @param paragraphId - Existing non-first Writer paragraph that received Backspace at offset zero.
   * @returns Nothing; React schedules the immutable join history transition and post-render browser focus.
   */
  function handleWriterParagraphMerge(paragraphId: string): void {
    const paragraphIndex = writerDocument.paragraphs.findIndex(
      /** Finds the requested current paragraph index. @param paragraph - Writer paragraph being inspected. @returns True only for paragraphId. */
      function hasParagraphId(paragraph): boolean {
        return paragraph.id === paragraphId;
      },
    );
    if (paragraphIndex <= 0) return;
    const precedingParagraph = writerDocument.paragraphs[paragraphIndex - 1] as WriterParagraph;
    const joinOffset = precedingParagraph.text.length;
    setActiveParagraphId(precedingParagraph.id);
    setFocusParagraphId(precedingParagraph.id);
    setFocusParagraphOffset(joinOffset);
    setWriterHistory(
      /** Applies the paragraph merge to the current immutable history snapshot. @param currentHistory - Current Writer history. @returns History containing the merged Writer body. */
      function mergeWorkbenchParagraph(currentHistory): TransactionHistory<WriterDocument> {
        const nextDocument = mergeWriterParagraphWithPrevious(
          getCurrentTransactionState(currentHistory),
          paragraphId,
        );
        return applyTransaction(currentHistory, nextDocument, { position: joinOffset });
      },
    );
  }

  /** Merges the following paragraph into this one after Delete at its end caret. @param paragraphId - Existing non-last Writer paragraph identity. @returns Nothing; React schedules a merge and restores focus at the join. */
  function handleWriterParagraphMergeNext(paragraphId: string): void {
    const paragraphIndex = writerDocument.paragraphs.findIndex(
      /** Finds the paragraph selected for forward merge. @param paragraph - Writer paragraph being inspected. @returns True only for paragraphId. */
      function hasParagraphId(paragraph): boolean {
        return paragraph.id === paragraphId;
      },
    );
    if (paragraphIndex < 0 || paragraphIndex === writerDocument.paragraphs.length - 1) return;
    const currentParagraph = writerDocument.paragraphs[paragraphIndex] as WriterParagraph;
    const nextParagraph = writerDocument.paragraphs[paragraphIndex + 1] as WriterParagraph;
    const joinOffset = currentParagraph.text.length;
    setActiveParagraphId(currentParagraph.id);
    setFocusParagraphId(currentParagraph.id);
    setFocusParagraphOffset(joinOffset);
    setWriterHistory(
      /** Applies the existing preceding-sibling merge with the following paragraph as its selected node. @param currentHistory - Current Writer history. @returns History containing the forward merged body. */
      function mergeNextWorkbenchParagraph(currentHistory): TransactionHistory<WriterDocument> {
        const nextDocument = mergeWriterParagraphWithPrevious(
          getCurrentTransactionState(currentHistory),
          nextParagraph.id,
        );
        return applyTransaction(currentHistory, nextDocument, { position: joinOffset });
      },
    );
  }

  /**
   * Changes the active Writer paragraph alignment through an immutable history transaction.
   *
   * @param alignment - Supported next horizontal alignment selected from the formatting toolbar.
   * @returns Nothing; React schedules the next Writer document history state.
   */
  function handleWriterParagraphAlignment(alignment: WriterParagraphAlignment): void {
    setWriterHistory(
      /**
       * Applies alignment to the still-existing active paragraph or the deterministic first-paragraph fallback.
       *
       * @param currentHistory - Current immutable Writer workbench history state.
       * @returns History with the requested alignment represented by a new snapshot when it changed.
       */
      function alignActiveWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const currentDocument = getCurrentTransactionState(currentHistory);
        const currentParagraph = getActiveWriterParagraph(currentDocument, activeParagraphId);
        const nextDocument = setWriterParagraphAlignment(
          currentDocument,
          currentParagraph.id,
          alignment,
        );
        return nextDocument === currentDocument
          ? currentHistory
          : applyTransaction(currentHistory, nextDocument, {
              position: getWorkbenchSelectionPosition(nextDocument),
            });
      },
    );
  }

  /**
   * Changes the active Writer paragraph style through an immutable history transaction.
   *
   * @param style - Supported next paragraph style selected from the formatting toolbar.
   * @returns Nothing; React schedules the next Writer document history state.
   */
  function handleWriterParagraphStyle(style: WriterParagraphStyle): void {
    setWriterHistory(
      /**
       * Applies a bounded style to the still-existing active paragraph or its deterministic fallback.
       *
       * @param currentHistory - Current immutable Writer workbench history state.
       * @returns History with a new style snapshot only when the requested style changed.
       */
      function styleActiveWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const currentDocument = getCurrentTransactionState(currentHistory);
        const currentParagraph = getActiveWriterParagraph(currentDocument, activeParagraphId);
        const nextDocument = setWriterParagraphStyle(currentDocument, currentParagraph.id, style);
        return nextDocument === currentDocument
          ? currentHistory
          : applyTransaction(currentHistory, nextDocument, {
              position: getWorkbenchSelectionPosition(nextDocument),
            });
      },
    );
  }

  /** Moves an existing Writer paragraph one adjacent position. @param paragraphId - Stable identity selected by the contextual movement control. @param direction - Requested adjacent movement direction. @returns Nothing; React schedules the immutable reordered history state. */
  function handleWriterMoveParagraph(paragraphId: string, direction: "up" | "down"): void {
    setActiveParagraphId(paragraphId);
    setWriterHistory(
      /** Swaps the requested paragraph in current immutable history. @param currentHistory - Current Writer workbench history state. @returns History containing the reordered body as its latest snapshot. */
      function moveWorkbenchParagraph(currentHistory): TransactionHistory<WriterDocument> {
        return moveWriterParagraphInHistory(currentHistory, paragraphId, direction);
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
        setActiveParagraphId((result.writerDocument.paragraphs[0] as WriterParagraph).id);
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

  useWriterHistoryShortcuts({
    history: writerHistory,
    isActive,
    onRedo: handleWriterRedo,
    onUndo: handleWriterUndo,
  });

  return (
    <div hidden={!isActive}>
      <WriterWorkspaceChrome
        documentTitle={writerDocument.document.title}
        menuBar={
          <WriterMenuBar
            alignment={activeParagraph.alignment}
            canMoveDown={activeParagraphIndex < writerDocument.paragraphs.length - 1}
            canMoveUp={activeParagraphIndex > 0}
            canRedo={writerHistory.index < writerHistory.entries.length - 1}
            canUndo={writerHistory.index > 0}
            isHorizontalRulerVisible={isHorizontalRulerVisible}
            isStoragePending={storagePending}
            isSidebarVisible={isPropertiesSidebarVisible}
            isStatusBarVisible={isStatusBarVisible}
            onAlignmentChange={handleWriterParagraphAlignment}
            onCopy={handleWriterCopy}
            onDownload={handleWriterDownload}
            onHorizontalRulerVisibilityChange={setIsHorizontalRulerVisible}
            onLoad={handleWriterLoad}
            onMoveParagraph={
              /**
               * Moves the currently focused paragraph through the matching Format menu entry.
               *
               * @param direction - Requested adjacent movement direction from the Format menu.
               * @returns Nothing; the workbench records a reordered history snapshot.
               */
              function moveActiveParagraphFromMenu(direction): void {
                handleWriterMoveParagraph(activeParagraph.id, direction);
              }
            }
            onRedo={handleWriterRedo}
            onSave={handleWriterSave}
            onSelectAll={requestSelectAll}
            onSidebarVisibilityChange={setIsPropertiesSidebarVisible}
            onStatusBarVisibilityChange={setIsStatusBarVisible}
            onStyleChange={handleWriterParagraphStyle}
            onUndo={handleWriterUndo}
            style={activeParagraph.style}
          />
        }
        formattingToolbar={
          <WriterParagraphFormattingToolbar
            alignment={activeParagraph.alignment}
            onAlignmentChange={handleWriterParagraphAlignment}
            onStyleChange={handleWriterParagraphStyle}
            style={activeParagraph.style}
          />
        }
        isHorizontalRulerVisible={isHorizontalRulerVisible}
        isPropertiesSidebarVisible={isPropertiesSidebarVisible}
        isStatusBarVisible={isStatusBarVisible}
        propertiesSidebar={
          <WriterParagraphProperties
            alignment={activeParagraph.alignment}
            paragraphNumber={activeParagraphIndex + 1}
            style={activeParagraph.style}
          />
        }
        status={storageStatus}
        toolbar={
          <WriterCommandToolbar
            canRedo={writerHistory.index < writerHistory.entries.length - 1}
            canUndo={writerHistory.index > 0}
            isStoragePending={storagePending}
            onCopy={handleWriterCopy}
            onLoad={handleWriterLoad}
            onRedo={handleWriterRedo}
            onSave={handleWriterSave}
            onUndo={handleWriterUndo}
          />
        }
      >
        <WriterPlainTextEditor
          activeParagraphId={activeParagraph.id}
          focusParagraphId={focusParagraphId}
          focusParagraphOffset={focusParagraphOffset}
          onParagraphBreak={handleWriterParagraphBreak}
          onParagraphMerge={handleWriterParagraphMerge}
          onParagraphMergeNext={handleWriterParagraphMergeNext}
          onParagraphFocus={handleWriterParagraphFocus}
          onSelectAll={requestSelectAll}
          onTextChange={handleWriterTextChange}
          paragraphs={writerDocument.paragraphs}
          selectAllRequestId={selectAllRequestId}
        />
      </WriterWorkspaceChrome>
    </div>
  );
}
