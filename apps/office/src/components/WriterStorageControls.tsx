/**
 * @fileoverview Renders accessible explicit browser-local Writer Save and Load controls without owning persistence implementation or document state.
 */

/** Defines callbacks and live feedback rendered by the Writer storage controls. */
export interface WriterStorageControlsProps {
  /** Whether an asynchronous storage operation is in progress. */
  readonly isPending: boolean;
  /** Requests loading the current Writer document identity from browser-local storage. */
  readonly onLoad: () => void;
  /** Requests a browser download of the current Writer plain-text body. */
  readonly onDownload: () => void;
  /** Requests saving the current Writer document to browser-local storage. */
  readonly onSave: () => void;
  /** Deterministic user-visible result of the most recent storage operation. */
  readonly status: string;
}

/**
 * Renders labelled Save and Load controls with an accessible asynchronous status.
 *
 * @param props - Immutable storage control state and callbacks.
 * @param props.isPending - Whether actions are temporarily disabled.
 * @param props.onLoad - Callback starting document loading.
 * @param props.onDownload - Callback starting plain-text download.
 * @param props.onSave - Callback starting document saving.
 * @param props.status - Current operation result for assistive technology and visual users.
 * @returns A compact browser-local storage control region.
 */
export function WriterStorageControls({
  isPending,
  onDownload,
  onLoad,
  onSave,
  status,
}: WriterStorageControlsProps): React.JSX.Element {
  return (
    <section aria-label="Writer browser storage" className="mt-5 flex flex-wrap items-center gap-3">
      <button
        className="rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={onSave}
        type="button"
      >
        Save locally
      </button>
      <button
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isPending}
        onClick={onLoad}
        type="button"
      >
        Load locally
      </button>
      <button
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-indigo-400"
        onClick={onDownload}
        type="button"
      >
        Download text
      </button>
      <p aria-live="polite" className="text-sm text-slate-600" role="status">
        {status}
      </p>
    </section>
  );
}
