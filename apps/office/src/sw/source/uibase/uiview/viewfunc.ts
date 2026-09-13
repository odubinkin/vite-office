/**
 * @fileoverview Provides pure Writer workbench paragraph, selection, and list-command history helpers without React state or browser dependencies.
 */

import {
  applyTransaction,
  getCurrentTransactionState,
  redoTransaction,
  replaceCurrentTransactionState,
  type TransactionHistory,
  undoTransaction,
} from "../../../../sfx2/source/doc/docundomanager";
import {
  markDocumentHistoryRestored,
  markDocumentHistorySavePosition,
  markDocumentSaved,
} from "../../../../sfx2/source/doc/docfac";
import {
  setWriterParagraphAlignment,
  setWriterParagraphStyle,
  type WriterDocument,
  type WriterParagraph,
  type WriterParagraphAlignment,
  type WriterParagraphStyle,
} from "../../core/doc/writer";
import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { createWriterDocument } from "../../core/doc/writer";
import type { WriterParagraphListKind } from "../../core/doc/list";
import { changeWriterParagraphListLevel, type WriterListLevelCommand } from "../shells/listsh";
import { setWriterParagraphListKind } from "../shells/txtnum";

/**
 * Creates the bounded initial Writer document used by the browser workbench session.
 *
 * @returns Immutable Writer document with one empty default-styled paragraph and new lifecycle state.
 */
export function createWriterWorkbenchDocument(): WriterDocument {
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
 * Reads the first paragraph length used as the bounded workbench history selection position.
 *
 * @param writerDocument - Immutable Writer document with the non-empty body invariant.
 * @returns UTF-16 length of the first paragraph text for deterministic history selection.
 */
export function getWorkbenchSelectionPosition(writerDocument: WriterDocument): number {
  return (writerDocument.paragraphs[0] as WriterParagraph).text.length;
}

/**
 * Acknowledges a completed primary-medium save without creating a Writer undo action.
 *
 * @param history - Current Writer history whose selected entry was persisted.
 * @param savedGeneration - Exact content generation acknowledged by storage.
 * @returns History with persistence metadata replaced on the selected entry.
 */
export function acknowledgeWriterSave(
  history: TransactionHistory<WriterDocument>,
  savedGeneration: number,
): TransactionHistory<WriterDocument> {
  return {
    ...history,
    entries: history.entries.map(
      /**
       * Moves the single Writer save mark while retaining every content snapshot.
       * @param entry - Existing Writer history entry.
       * @param index - Entry position compared with the current cursor.
       * @returns Cloned entry marked clean only at the newly saved position.
       */
      function moveWriterSaveMark(entry, index): WriterDocument {
        const next = entry.clone();
        next.document =
          index === history.index
            ? markDocumentSaved(next.document, savedGeneration)
            : markDocumentHistorySavePosition(next.document, false);
        return next;
      },
    ),
    selection: { ...history.selection },
  };
}

/**
 * Restores the preceding Writer state as a fresh mutation with LibreOffice-like save-mark semantics.
 *
 * @param history - Current Writer history.
 * @returns Prior state with repaired lifecycle metadata, or the same history at its bound.
 */
export function undoWriterTransaction(
  history: TransactionHistory<WriterDocument>,
): TransactionHistory<WriterDocument> {
  return navigateWriterHistory(history, "undo");
}

/**
 * Restores the following Writer state as a fresh mutation with LibreOffice-like save-mark semantics.
 *
 * @param history - Current Writer history.
 * @returns Following state with repaired lifecycle metadata, or the same history at its bound.
 */
export function redoWriterTransaction(
  history: TransactionHistory<WriterDocument>,
): TransactionHistory<WriterDocument> {
  return navigateWriterHistory(history, "redo");
}

/**
 * Performs one bounded history navigation and repairs session-owned lifecycle generations.
 *
 * @param history - Current Writer history.
 * @param direction - Undo or Redo navigation direction.
 * @returns Navigated and repaired history, or the same history when movement is unavailable.
 */
function navigateWriterHistory(
  history: TransactionHistory<WriterDocument>,
  direction: "redo" | "undo",
): TransactionHistory<WriterDocument> {
  const current = getCurrentTransactionState(history);
  const candidate =
    direction === "undo"
      ? undoTransaction(history, { position: 0 })
      : redoTransaction(history, { position: 0 });
  if (candidate === history) return history;
  const historical = getCurrentTransactionState(candidate);
  const restored = historical.clone();
  restored.document = markDocumentHistoryRestored(current.document, historical.document);
  const repaired = replaceCurrentTransactionState(candidate, restored);
  return {
    ...repaired,
    selection: { position: getWorkbenchSelectionPosition(restored) },
  };
}

/**
 * Derives the first available numeric paragraph identity for the bounded Writer workbench document.
 *
 * @param writerDocument - Immutable Writer document whose existing identities are inspected.
 * @returns Stable next paragraph identity that does not collide with the current body.
 */
export function getNextWriterParagraphId(writerDocument: WriterDocument): string {
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

/**
 * Resolves the focused Writer paragraph or safely falls back to the first body paragraph.
 *
 * @param writerDocument - Immutable current Writer body whose paragraph identities are inspected.
 * @param preferredParagraphId - Last focused identity, which can be stale after history or loading.
 * @returns Existing preferred paragraph or the guaranteed first paragraph in the non-empty body.
 */
export function getActiveWriterParagraph(
  writerDocument: WriterDocument,
  preferredParagraphId: string,
): WriterParagraph {
  return (
    writerDocument.paragraphs.find(
      /**
       * Finds the paragraph that retains the currently focused identity.
       *
       * @param paragraph - Immutable paragraph candidate inspected without mutation.
       * @returns True only when the candidate owns preferredParagraphId.
       */
      function hasPreferredIdentity(paragraph): boolean {
        return paragraph.id === preferredParagraphId;
      },
    ) ?? (writerDocument.paragraphs[0] as WriterParagraph)
  );
}

/**
 * Applies one paragraph-alignment command to the active paragraph through immutable workbench history.
 *
 * @param currentHistory - Immutable workbench history before the requested alignment.
 * @param activeParagraphId - Focused paragraph identity, with the standard first-paragraph fallback retained.
 * @param alignment - Supported horizontal alignment selected from the formatting toolbar.
 * @returns Original history for a no-op or a history with exactly one alignment-adjusted snapshot.
 */
export function applyWriterAlignmentTransaction(
  currentHistory: TransactionHistory<WriterDocument>,
  activeParagraphId: string,
  alignment: WriterParagraphAlignment,
): TransactionHistory<WriterDocument> {
  const currentDocument = getCurrentTransactionState(currentHistory);
  const currentParagraph = getActiveWriterParagraph(currentDocument, activeParagraphId);
  const nextDocument = setWriterParagraphAlignment(currentDocument, currentParagraph.id, alignment);
  return nextDocument === currentDocument
    ? currentHistory
    : applyTransaction(currentHistory, nextDocument, {
        position: getWorkbenchSelectionPosition(nextDocument),
      });
}

/**
 * Applies one paragraph-style command to the active paragraph through immutable workbench history.
 *
 * @param currentHistory - Immutable workbench history before the requested paragraph style.
 * @param activeParagraphId - Focused paragraph identity, with the standard first-paragraph fallback retained.
 * @param style - Supported paragraph style selected from the formatting toolbar.
 * @returns Original history for a no-op or a history with exactly one style-adjusted snapshot.
 */
export function applyWriterStyleTransaction(
  currentHistory: TransactionHistory<WriterDocument>,
  activeParagraphId: string,
  style: WriterParagraphStyle,
): TransactionHistory<WriterDocument> {
  const currentDocument = getCurrentTransactionState(currentHistory);
  const currentParagraph = getActiveWriterParagraph(currentDocument, activeParagraphId);
  const nextDocument = setWriterParagraphStyle(currentDocument, currentParagraph.id, style);
  return nextDocument === currentDocument
    ? currentHistory
    : applyTransaction(currentHistory, nextDocument, {
        position: getWorkbenchSelectionPosition(nextDocument),
      });
}

/**
 * Applies one default-list command to the active paragraph through the immutable Writer history boundary.
 *
 * @param currentHistory - Immutable workbench history before the requested list presentation.
 * @param activeParagraphId - Focused paragraph identity, with the standard first-paragraph fallback retained.
 * @param listKind - Next supported bullet, numbered, or no-list presentation.
 * @returns Original history for a no-op or a history with exactly one list-presentation snapshot.
 */
export function applyWriterListKindTransaction(
  currentHistory: TransactionHistory<WriterDocument>,
  activeParagraphId: string,
  listKind: WriterParagraphListKind,
): TransactionHistory<WriterDocument> {
  const currentDocument = getCurrentTransactionState(currentHistory);
  const currentParagraph = getActiveWriterParagraph(currentDocument, activeParagraphId);
  const nextDocument = setWriterParagraphListKind(currentDocument, currentParagraph.id, listKind);
  return nextDocument === currentDocument
    ? currentHistory
    : applyTransaction(currentHistory, nextDocument, {
        position: getWorkbenchSelectionPosition(nextDocument),
      });
}

/**
 * Applies one Writer Promote or Demote command to the active paragraph through immutable workbench history.
 *
 * @param currentHistory - Immutable workbench history before the command.
 * @param activeParagraphId - Focused paragraph identity, with the standard first-paragraph fallback retained.
 * @param command - Bounded Writer list-level command selected by the UI.
 * @returns Original history for a disabled-command no-op or a history with exactly one level-adjusted snapshot.
 */
export function applyWriterListLevelTransaction(
  currentHistory: TransactionHistory<WriterDocument>,
  activeParagraphId: string,
  command: WriterListLevelCommand,
): TransactionHistory<WriterDocument> {
  const currentDocument = getCurrentTransactionState(currentHistory);
  const currentParagraph = getActiveWriterParagraph(currentDocument, activeParagraphId);
  const nextDocument = changeWriterParagraphListLevel(
    currentDocument,
    currentParagraph.id,
    command,
  );
  return nextDocument === currentDocument
    ? currentHistory
    : applyTransaction(currentHistory, nextDocument, {
        position: getWorkbenchSelectionPosition(nextDocument),
      });
}
