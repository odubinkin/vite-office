/** @fileoverview Browser counterpart of pinned Writer insertbreak.ui for the supported hard page break. */

import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";

/** Presents the page-break choice while keeping imported soft hints separate. @param props - Completion callbacks. @returns Accessible modal. */
export function WriterInsertBreakDialog({
  onCancel,
  onSubmit,
}: Readonly<{ onCancel: () => void; onSubmit: () => void }>): React.JSX.Element {
  const localization = useBrowserLocalization();
  return (
    <div
      aria-label={localization.GetText("writer.insert-break.title", "Insert Break")}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Cancels with Escape. @param event - Keyboard event. @returns Nothing. */
        (event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
      role="dialog"
    >
      <form
        className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl"
        onSubmit={
          /** Accepts the supported page break. @param event - Submit event. @returns Nothing. */
          (event) => {
            event.preventDefault();
            onSubmit();
          }
        }
      >
        <h2 className="text-lg font-bold text-slate-950">
          {localization.GetText("writer.insert-break.title", "Insert Break")}
        </h2>
        <fieldset className="mt-4 rounded-md border border-slate-300 p-3">
          <legend className="px-1 text-sm font-semibold">
            {localization.GetText("writer.insert-break.type", "Type")}
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input checked readOnly type="radio" />
            {localization.GetText("writer.insert-break.page", "Page break")}
          </label>
        </fieldset>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            onClick={onCancel}
            type="button"
          >
            {localization.GetText("writer.common.cancel", "Cancel")}
          </button>
          <button
            className="rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-white"
            type="submit"
          >
            {localization.GetText("writer.insert-break.insert", "Insert")}
          </button>
        </div>
      </form>
    </div>
  );
}
