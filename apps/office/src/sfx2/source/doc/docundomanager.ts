/**
 * @fileoverview Defines pure serializable browser transaction history and cursor selection transitions at the LibreOffice `sfx2/source/doc/docundomanager.cxx` ownership boundary.
 */

/** Describes one immutable cursor selection using a zero-based position. */
export interface CursorSelection {
  /** Zero-based logical selection position owned by a future document model. */
  readonly position: number;
}

/** Describes immutable serializable history for one caller-selected state type. */
export interface TransactionHistory<State> {
  /** State snapshots in chronological order, always containing the current snapshot. */
  readonly entries: readonly State[];
  /** Zero-based index of the current snapshot in entries. */
  readonly index: number;
  /** Current logical selection stored independently of future rendering. */
  readonly selection: CursorSelection;
}

/**
 * Creates history with one initial state and a validated initial selection.
 *
 * @param initialState - Caller-owned initial snapshot retained by reference without mutation.
 * @param selection - Initial cursor selection with a non-negative integer position.
 * @returns Immutable history at its first snapshot.
 * @throws {Error} When selection.position is not a non-negative integer.
 */
export function createTransactionHistory<State>(
  initialState: State,
  selection: CursorSelection,
): TransactionHistory<State> {
  assertSelection(selection);
  return { entries: [initialState], index: 0, selection: { ...selection } };
}

/**
 * Applies a new snapshot, truncating any redo branch and updating validated selection.
 *
 * @param history - Immutable prior history that remains unmodified.
 * @param nextState - Caller-owned state snapshot becoming current.
 * @param selection - Selection associated with nextState.
 * @returns New history with nextState after the prior current entry.
 * @throws {Error} When selection.position is invalid or history is malformed.
 */
export function applyTransaction<State>(
  history: TransactionHistory<State>,
  nextState: State,
  selection: CursorSelection,
): TransactionHistory<State> {
  assertHistory(history);
  assertSelection(selection);
  return {
    entries: [...history.entries.slice(0, history.index + 1), nextState],
    index: history.index + 1,
    selection: { ...selection },
  };
}

/**
 * Moves one snapshot backward when possible while updating the validated selection.
 *
 * @param history - Immutable prior history that remains unmodified.
 * @param selection - Selection associated with the resulting current snapshot.
 * @returns Original history at the first entry, otherwise a new history one step earlier.
 * @throws {Error} When selection.position is invalid or history is malformed.
 */
export function undoTransaction<State>(
  history: TransactionHistory<State>,
  selection: CursorSelection,
): TransactionHistory<State> {
  assertHistory(history);
  assertSelection(selection);
  return history.index === 0
    ? history
    : { ...history, index: history.index - 1, selection: { ...selection } };
}

/**
 * Moves one snapshot forward when possible while updating the validated selection.
 *
 * @param history - Immutable prior history that remains unmodified.
 * @param selection - Selection associated with the resulting current snapshot.
 * @returns Original history at the final entry, otherwise a new history one step later.
 * @throws {Error} When selection.position is invalid or history is malformed.
 */
export function redoTransaction<State>(
  history: TransactionHistory<State>,
  selection: CursorSelection,
): TransactionHistory<State> {
  assertHistory(history);
  assertSelection(selection);
  return history.index === history.entries.length - 1
    ? history
    : { ...history, index: history.index + 1, selection: { ...selection } };
}

/**
 * Reads the current immutable state snapshot from validated history.
 *
 * @param history - Immutable history to inspect without mutation.
 * @returns Current snapshot at history.index.
 * @throws {Error} When history is malformed.
 */
export function getCurrentTransactionState<State>(history: TransactionHistory<State>): State {
  assertHistory(history);
  return history.entries[history.index] as State;
}

/**
 * Validates cursor selection values before they enter history transitions.
 *
 * @param selection - Candidate selection inspected without mutation.
 * @returns Nothing; invalid selection throws.
 * @throws {Error} When position is negative or non-integral.
 */
function assertSelection(selection: CursorSelection): void {
  if (!Number.isInteger(selection.position) || selection.position < 0)
    throw new Error("Selection position must be a non-negative integer.");
}

/**
 * Validates history entry and cursor bounds before an operation reads it.
 *
 * @param history - Candidate history inspected without mutation.
 * @returns Nothing; malformed history throws.
 * @throws {Error} When entries are empty or index is outside their range.
 */
function assertHistory<State>(history: TransactionHistory<State>): void {
  if (
    !Number.isInteger(history.index) ||
    history.index < 0 ||
    history.index >= history.entries.length
  )
    throw new Error("Transaction history index is outside its entries.");
}
