/**
 * @fileoverview Renders the implemented Writer commands in a compact standard-toolbar presentation.
 */

import { ClipboardPaste, Copy, FolderOpen, Redo2, Save, Scissors, Undo2 } from "lucide-react";

/** Defines the implemented command state and callbacks placed in the Writer standard toolbar. */
export interface WriterCommandToolbarProps {
  /** Whether a following history snapshot exists for the Redo command. */
  readonly canRedo: boolean;
  /** Whether a preceding history snapshot exists for the Undo command. */
  readonly canUndo: boolean;
  /** Whether browser-local storage actions are currently pending. */
  readonly isStoragePending: boolean;
  /** Requests cutting the current native Writer selection after copying it to the browser clipboard. */
  readonly onCut: () => void;
  /** Requests copying the current native Writer selection to the browser clipboard. */
  readonly onCopy: () => void;
  /** Requests loading the Writer document from browser-local storage. */
  readonly onLoad: () => void;
  /** Requests restoration of the following Writer history snapshot. */
  readonly onRedo: () => void;
  /** Requests saving the Writer document to browser-local storage. */
  readonly onSave: () => void;
  /** Requests pasting browser clipboard text at the current Writer selection or caret. */
  readonly onPaste: () => void;
  /** Requests restoration of the preceding Writer history snapshot. */
  readonly onUndo: () => void;
}

/**
 * Renders available Writer commands in the standard toolbar without owning document state.
 *
 * @param props - Immutable command state and actions supplied by the Writer workbench.
 * @param props.canRedo - Whether Redo is available.
 * @param props.canUndo - Whether Undo is available.
 * @param props.isStoragePending - Whether Save and Load should be disabled temporarily.
 * @param props.onCut - Callback copying then deleting the current Writer selection.
 * @param props.onCopy - Callback starting browser-local Writer selection copy.
 * @param props.onLoad - Callback starting browser-local load.
 * @param props.onRedo - Callback restoring the following history entry.
 * @param props.onSave - Callback starting browser-local save.
 * @param props.onPaste - Callback reading the browser clipboard at the current Writer selection or caret.
 * @param props.onUndo - Callback restoring the preceding history entry.
 * @returns Compact icon command buttons with stable accessible names.
 */
export function WriterCommandToolbar({
  canRedo,
  canUndo,
  isStoragePending,
  onCut,
  onCopy,
  onLoad,
  onRedo,
  onSave,
  onPaste,
  onUndo,
}: WriterCommandToolbarProps): React.JSX.Element {
  return (
    <>
      <button
        aria-label="Save locally"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isStoragePending}
        onClick={onSave}
        title="Save locally"
        type="button"
      >
        <Save aria-hidden="true" size={18} />
      </button>
      <button
        aria-label="Load locally"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isStoragePending}
        onClick={onLoad}
        title="Load locally"
        type="button"
      >
        <FolderOpen aria-hidden="true" size={18} />
      </button>
      <span aria-hidden="true" className="mx-1 h-6 border-l border-slate-200" />
      <button
        aria-label="Cut"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800"
        onClick={onCut}
        title="Cut"
        type="button"
      >
        <Scissors aria-hidden="true" size={18} />
      </button>
      <button
        aria-label="Copy"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800"
        onClick={onCopy}
        title="Copy"
        type="button"
      >
        <Copy aria-hidden="true" size={18} />
      </button>
      <button
        aria-label="Paste"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800"
        onClick={onPaste}
        title="Paste"
        type="button"
      >
        <ClipboardPaste aria-hidden="true" size={18} />
      </button>
      <span aria-hidden="true" className="mx-1 h-6 border-l border-slate-200" />
      <button
        aria-label="Undo"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canUndo}
        onClick={onUndo}
        title="Undo"
        type="button"
      >
        <Undo2 aria-hidden="true" size={18} />
      </button>
      <button
        aria-label="Redo"
        className="grid size-9 place-items-center rounded-lg text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canRedo}
        onClick={onRedo}
        title="Redo"
        type="button"
      >
        <Redo2 aria-hidden="true" size={18} />
      </button>
    </>
  );
}
