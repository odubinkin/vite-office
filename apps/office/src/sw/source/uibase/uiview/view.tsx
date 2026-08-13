/**
 * @fileoverview Owns the bounded Writer document workbench state and browser-only editing controls.
 */

import { useEffect, useState } from "react";
import {
  applyTransaction,
  createTransactionHistory,
  getCurrentTransactionState,
  redoTransaction,
  undoTransaction,
  type TransactionHistory,
} from "../../../../sfx2/source/doc/docundomanager";
import {
  replaceWriterParagraph,
  insertWriterTextWithAttributes,
  mergeWriterParagraphWithPrevious,
  splitWriterParagraph,
  type WriterDocument,
  type WriterParagraph,
  type WriterParagraphAlignment,
  type WriterParagraphStyle,
  type WriterCharacterAttributes,
  type WriterCharacterFormat,
  type WriterTextRun,
} from "../../core/doc/writer";
import {
  replaceWriterParagraphTextRange,
  type WriterParagraphTextRange,
} from "../../core/doc/DocumentContentOperationsManager";
import {
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  getWriterTextAttributesAtOffset,
} from "../../core/txtnode/ndtxt";
import type { WriterParagraphListKind } from "../../core/doc/list";
import {
  loadWriterDocument,
  saveWriterDocument,
  type WriterSnapshotState,
} from "../../core/doc/writer-storage";
import { IndexedDbDocumentStorageAdapter } from "../../../../vcl/browser/indexeddb-storage";
import { WriterMenuBar } from "../../../uiconfig/swriter/menubar/menubar";
import { WriterCommandToolbar } from "../../../uiconfig/swriter/toolbar/standardbar";
import { WriterParagraphFormattingToolbar } from "../ribbar/inputwin";
import { WriterParagraphProperties } from "../sidebar/WriterInspectorTextPanel";
import { WriterPlainTextEditor } from "../docvw/edtwin";
import { WriterWorkspaceChrome } from "../app/mainwn";
import type { WriterListLevelCommand } from "../shells/listsh";
import { toggleWriterCharacterFormat } from "../shells/txtattr";
import { useWriterBrowserCommands, useWriterHistoryShortcuts } from "../shells/textsh";
import { readWriterClipboardPaste } from "../dochdl/swdtflvr";
import { getWriterSameParagraphSelection } from "../wrtsh/select";
import { useWriterDocumentSelection, useWriterWorkspaceChrome } from "./viewstat";
import {
  getActiveWriterParagraph,
  applyWriterAlignmentTransaction,
  applyWriterListKindTransaction,
  applyWriterListLevelTransaction,
  applyWriterStyleTransaction,
  createWriterWorkbenchDocument,
  getNextWriterParagraphId,
  getWorkbenchSelectionPosition,
} from "./viewfunc";

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
  const [pendingCharacterAttributes, setPendingCharacterAttributes] =
    useState<WriterCharacterAttributes>(DEFAULT_WRITER_CHARACTER_ATTRIBUTES);
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
  const { handleWriterCopy, handleWriterCut, handleWriterDownload, handleWriterPaste } =
    useWriterBrowserCommands({
      activeParagraph,
      onCut: handleWriterTextCut,
      onPaste: handleWriterPasteRuns,
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
        const currentDocument = getCurrentTransactionState(currentHistory);
        const paragraph = getActiveWriterParagraph(currentDocument, paragraphId);
        const insertion = getWriterInsertedText(paragraph.text, text);
        const nextDocument =
          insertion === undefined
            ? replaceWriterParagraph(currentDocument, paragraphId, text)
            : insertWriterTextWithAttributes(
                currentDocument,
                paragraphId,
                insertion.offset,
                insertion.text,
                pendingCharacterAttributes,
              );
        return applyTransaction(currentHistory, nextDocument, { position: text.length });
      },
    );
  }

  /**
   * Deletes a same-paragraph native Writer selection after its Cut payload reaches the browser clipboard.
   *
   * @param range - Existing Writer text range copied by the Cut command.
   * @returns Nothing; React schedules deletion and restores the caret at the former selection start.
   */
  function handleWriterTextCut(range: WriterParagraphTextRange): void {
    handleWriterPasteRuns(range, []);
  }

  /**
   * Parses native browser clipboard MIME data before applying its bounded Writer text runs.
   *
   * @param range - Same-paragraph target selection or collapsed caret resolved by the editable Writer body.
   * @param clipboardData - Browser clipboard data read synchronously from the native Paste event.
   * @returns Nothing; React records safe text insertion or deterministic empty-clipboard feedback.
   */
  function handleWriterTextPaste(
    range: WriterParagraphTextRange,
    clipboardData: DataTransfer,
  ): void {
    const paste = readWriterClipboardPaste(clipboardData);
    if (paste === undefined) {
      setStorageStatus("Clipboard has no text to paste.");
      return;
    }
    handleWriterPasteRuns(range, paste.runs);
    setStorageStatus("Pasted clipboard text.");
  }

  /**
   * Replaces one immutable Writer range with safe direct-format runs from either native or toolbar Paste.
   *
   * @param range - Same-paragraph target selection or collapsed caret.
   * @param runs - Normalized bounded Writer text runs that replace range.
   * @returns Nothing; React schedules one history transition and post-render caret restoration.
   */
  function handleWriterPasteRuns(
    range: WriterParagraphTextRange,
    runs: readonly WriterTextRun[],
  ): void {
    const insertionLength = runs.reduce(
      /** Counts visible UTF-16 code units inserted at the range start. @param total - Count so far. @param run - Inserted formatted run. @returns Updated visible text length. */
      function addRunLength(total, run): number {
        return total + run.text.length;
      },
      0,
    );
    setActiveParagraphId(range.paragraphId);
    setFocusParagraphId(range.paragraphId);
    setFocusParagraphOffset(range.start + insertionLength);
    setWriterHistory(
      /** Applies bounded Cut or Paste runs to the latest Writer snapshot. @param currentHistory - Current immutable Writer history. @returns Existing or replacement history with a deterministic caret position. */
      function replaceWriterClipboardRange(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const currentDocument = getCurrentTransactionState(currentHistory);
        const nextDocument = replaceWriterParagraphTextRange(currentDocument, range, runs);
        return nextDocument === currentDocument
          ? currentHistory
          : applyTransaction(currentHistory, nextDocument, {
              position: range.start + insertionLength,
            });
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
    const paragraph = getActiveWriterParagraph(writerDocument, paragraphId);
    setPendingCharacterAttributes(
      getWriterTextAttributesAtOffset(paragraph.runs, paragraph.text.length),
    );
  }

  /**
   * Toggles a direct Writer character attribute over a native same-paragraph selection, or changes pending attributes for a collapsed caret.
   *
   * @param format - Direct Writer format selected from the toolbar, Format Text menu, or browser shortcut.
   * @returns Nothing; React records one immutable history transition or pending-caret state.
   */
  function handleWriterCharacterFormat(format: WriterCharacterFormat): void {
    const selection = getWriterSameParagraphSelection(globalThis.getSelection());
    if (selection === undefined) {
      setPendingCharacterAttributes(
        /** Toggles only the requested pending direct attribute. @param attributes - Current pending caret attributes. @returns Updated immutable attribute record. */
        function togglePendingCharacterAttribute(attributes): WriterCharacterAttributes {
          return { ...attributes, [format]: !attributes[format] };
        },
      );
      return;
    }
    setActiveParagraphId(selection.paragraphId);
    setWriterHistory(
      /** Applies this shell command to the latest immutable Writer history state. @param currentHistory - Current Writer transaction history. @returns Existing or formatted next history. */
      function formatSelectedWriterText(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        const nextDocument = toggleWriterCharacterFormat(
          getCurrentTransactionState(currentHistory),
          selection,
          format,
        );
        /* v8 ignore next -- A non-empty DOM selection is validated before scheduling this updater, so the text-attribute shell always creates a new document snapshot. */
        return nextDocument === getCurrentTransactionState(currentHistory)
          ? currentHistory
          : applyTransaction(currentHistory, nextDocument, { position: selection.end });
      },
    );
    setPendingCharacterAttributes(
      /** Toggles only the requested attribute for immediately following collapsed typing. @param attributes - Current pending caret attributes. @returns Updated immutable attribute record. */
      function togglePendingAttribute(attributes): WriterCharacterAttributes {
        return { ...attributes, [format]: !attributes[format] };
      },
    );
  }

  useEffect(
    /** Installs Ctrl/Meta direct-character Writer shortcuts while the Writer suite is active. @returns Cleanup removing the browser listener. */
    function installWriterCharacterShortcuts(): () => void {
      /** Dispatches one supported direct-format shortcut. @param event - Browser key event inspected and optionally cancelled. @returns Nothing; the workbench applies the selected command. */
      function handleCharacterShortcut(event: KeyboardEvent): void {
        if (!isActive || event.altKey || (!event.ctrlKey && !event.metaKey)) return;
        const format = getWriterShortcutFormat(event.key);
        if (format === undefined) return;
        event.preventDefault();
        handleWriterCharacterFormat(format);
      }
      window.addEventListener("keydown", handleCharacterShortcut);
      /** Removes this workbench instance's direct-format shortcut listener. @returns Nothing. */
      function removeWriterCharacterShortcuts(): void {
        window.removeEventListener("keydown", handleCharacterShortcut);
      }
      return removeWriterCharacterShortcuts;
    },
    [isActive, pendingCharacterAttributes, writerHistory],
  );

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
        return applyWriterAlignmentTransaction(currentHistory, activeParagraphId, alignment);
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
        return applyWriterStyleTransaction(currentHistory, activeParagraphId, style);
      },
    );
  }

  /**
   * Executes the active paragraph's default-list command through the Writer numbering shell.
   *
   * @param listKind - Next supported bullet, numbered, or no-list state.
   * @returns Nothing; React schedules an immutable history transition only when the command changes state.
   */
  function handleWriterParagraphListKind(listKind: WriterParagraphListKind): void {
    setWriterHistory(
      /** Delegates list-kind history changes to the `viewfunc.hxx`-derived pure workbench helper. @param currentHistory - Current Writer history. @returns Existing or command-adjusted history. */
      function listActiveWorkbenchParagraph(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        return applyWriterListKindTransaction(currentHistory, activeParagraphId, listKind);
      },
    );
  }

  /**
   * Executes the active paragraph's Writer Promote or Demote command through the list shell.
   *
   * @param command - Bounded list-level action selected from a Writer-positioned menu or numbering toolbar.
   * @returns Nothing; React schedules immutable history only when the requested level changes.
   */
  function handleWriterParagraphListLevel(command: WriterListLevelCommand): void {
    setWriterHistory(
      /** Delegates list-level history changes to the `viewfunc.hxx`-derived pure workbench helper. @param currentHistory - Current Writer history. @returns Existing or command-adjusted history. */
      function changeActiveWorkbenchListLevel(
        currentHistory: TransactionHistory<WriterDocument>,
      ): TransactionHistory<WriterDocument> {
        return applyWriterListLevelTransaction(currentHistory, activeParagraphId, command);
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
            characterAttributes={pendingCharacterAttributes}
            canRedo={writerHistory.index < writerHistory.entries.length - 1}
            canUndo={writerHistory.index > 0}
            isHorizontalRulerVisible={isHorizontalRulerVisible}
            isStoragePending={storagePending}
            isSidebarVisible={isPropertiesSidebarVisible}
            isStatusBarVisible={isStatusBarVisible}
            onAlignmentChange={handleWriterParagraphAlignment}
            onCharacterFormatChange={handleWriterCharacterFormat}
            onCopy={handleWriterCopy}
            onCut={handleWriterCut}
            onDownload={handleWriterDownload}
            onHorizontalRulerVisibilityChange={setIsHorizontalRulerVisible}
            onLoad={handleWriterLoad}
            onPaste={handleWriterPaste}
            onListKindChange={handleWriterParagraphListKind}
            onListLevelChange={handleWriterParagraphListLevel}
            onRedo={handleWriterRedo}
            onSave={handleWriterSave}
            onSelectAll={requestSelectAll}
            onSidebarVisibilityChange={setIsPropertiesSidebarVisible}
            onStatusBarVisibilityChange={setIsStatusBarVisible}
            onStyleChange={handleWriterParagraphStyle}
            onUndo={handleWriterUndo}
            listKind={activeParagraph.list.kind}
            listLevel={activeParagraph.list.level}
            style={activeParagraph.style}
          />
        }
        formattingToolbar={
          <WriterParagraphFormattingToolbar
            alignment={activeParagraph.alignment}
            characterAttributes={pendingCharacterAttributes}
            onAlignmentChange={handleWriterParagraphAlignment}
            onCharacterFormatChange={handleWriterCharacterFormat}
            onListKindChange={handleWriterParagraphListKind}
            onListLevelChange={handleWriterParagraphListLevel}
            onStyleChange={handleWriterParagraphStyle}
            listKind={activeParagraph.list.kind}
            listLevel={activeParagraph.list.level}
            style={activeParagraph.style}
          />
        }
        isHorizontalRulerVisible={isHorizontalRulerVisible}
        isPropertiesSidebarVisible={isPropertiesSidebarVisible}
        isStatusBarVisible={isStatusBarVisible}
        propertiesSidebar={
          <WriterParagraphProperties
            alignment={activeParagraph.alignment}
            listKind={activeParagraph.list.kind}
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
            onCut={handleWriterCut}
            onLoad={handleWriterLoad}
            onPaste={handleWriterPaste}
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
          onTextCut={handleWriterTextCut}
          onTextPaste={handleWriterTextPaste}
          paragraphs={writerDocument.paragraphs}
          selectAllRequestId={selectAllRequestId}
        />
      </WriterWorkspaceChrome>
    </div>
  );
}

/**
 * Detects the sole inserted segment between a prior and next browser paragraph value.
 *
 * @param previousText - Canonical immutable paragraph text before native browser input.
 * @param nextText - Complete visible paragraph text after native browser input.
 * @returns Insertion offset and text when the change adds one contiguous segment, otherwise undefined for deletion or replacement.
 */
function getWriterInsertedText(
  previousText: string,
  nextText: string,
): Readonly<{ offset: number; text: string }> | undefined {
  if (nextText.length <= previousText.length) return undefined;
  let prefixLength = 0;
  while (
    prefixLength < previousText.length &&
    previousText.charAt(prefixLength) === nextText.charAt(prefixLength)
  )
    prefixLength += 1;
  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength &&
    previousText.charAt(previousText.length - suffixLength - 1) ===
      nextText.charAt(nextText.length - suffixLength - 1)
  )
    suffixLength += 1;
  const insertedText = nextText.slice(prefixLength, nextText.length - suffixLength);
  /* v8 ignore next -- A strictly longer next value always leaves at least one inserted code unit after maximal common prefix/suffix removal. */
  return insertedText.length === 0 ? undefined : { offset: prefixLength, text: insertedText };
}

/** Maps one browser shortcut key to its supported direct Writer character command. @param key - Browser key value normalized by the platform. @returns Direct character format, or undefined when no Writer formatting shortcut applies. */
function getWriterShortcutFormat(key: string): WriterCharacterFormat | undefined {
  const normalizedKey = key.toLowerCase();
  return normalizedKey === "b"
    ? "bold"
    : normalizedKey === "i"
      ? "italic"
      : normalizedKey === "u"
        ? "underline"
        : undefined;
}
