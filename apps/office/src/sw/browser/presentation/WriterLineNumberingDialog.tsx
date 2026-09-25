/** @fileoverview Browser projection of the supported Writer Line Numbering settings. */
import { useState } from "react";
import { LineNumberPosition, type SwLineNumberInfoValue } from "../../inc/lineinfo";

/** Edits the document-owned line numbering options exposed by the pinned dialog. @param props - Initial value and callbacks. @returns Dialog. */
export function WriterLineNumberingDialog({
  value,
  onCancel,
  onSubmit,
}: Readonly<{
  value: SwLineNumberInfoValue;
  onCancel: () => void;
  onSubmit: (value: SwLineNumberInfoValue) => void;
}>): React.JSX.Element {
  const [draft, setDraft] = useState(value);
  /** Updates one document setting. @param next - Draft changes. @returns Nothing. */
  function update(next: Partial<SwLineNumberInfoValue>): void {
    setDraft(
      /** Retains other settings. @param previous - Current draft. @returns Updated draft. */ (
        previous,
      ) => ({ ...previous, ...next }),
    );
  }
  return (
    <div
      aria-label="Line Numbering"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      data-writer-modal="true"
      role="dialog"
    >
      <form
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg space-y-4 overflow-auto rounded-xl bg-white p-5 shadow-2xl"
        data-writer-modal-panel="true"
        onSubmit={
          /** Accepts settings. @param event - Submit event. @returns Nothing. */ (event) => {
            event.preventDefault();
            onSubmit(draft);
          }
        }
      >
        <h2 className="text-lg font-semibold">Line Numbering</h2>
        <label className="flex gap-2 text-sm">
          <input
            checked={draft.paintLineNumbers}
            onChange={
              /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                update({ paintLineNumbers: event.target.checked })
            }
            type="checkbox"
          />
          Show numbering
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            Position
            <select
              className="rounded border p-1"
              value={draft.position}
              onChange={
                /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                  update({ position: Number(event.target.value) as LineNumberPosition })
              }
            >
              {["Left", "Right", "Inside", "Outside"].map(
                /** Renders one position. @param label - Option label. @param index - Position index. @returns Option. */ (
                  label,
                  index,
                ) => (
                  <option key={label} value={index}>
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Spacing (cm)
            <input
              className="rounded border p-1"
              min="0"
              step="0.01"
              type="number"
              value={Math.round(((draft.posFromLeft * 2.54) / 1440) * 100) / 100}
              onChange={
                /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                  update({ posFromLeft: Math.round((Number(event.target.value) * 1440) / 2.54) })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Interval
            <input
              className="rounded border p-1"
              min="1"
              type="number"
              value={draft.countBy}
              onChange={
                /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                  update({ countBy: Math.max(1, Number(event.target.value)) })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Separator text
            <input
              className="rounded border p-1"
              value={draft.divider}
              onChange={
                /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                  update({ divider: event.target.value })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Every
            <input
              className="rounded border p-1"
              min="1"
              type="number"
              value={draft.dividerCountBy}
              onChange={
                /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                  update({ dividerCountBy: Math.max(1, Number(event.target.value)) })
              }
            />
          </label>
        </div>
        <label className="flex gap-2 text-sm">
          <input
            checked={draft.countBlankLines}
            onChange={
              /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                update({ countBlankLines: event.target.checked })
            }
            type="checkbox"
          />
          Blank lines
        </label>
        <label className="flex gap-2 text-sm">
          <input
            checked={draft.countInFlys}
            onChange={
              /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                update({ countInFlys: event.target.checked })
            }
            type="checkbox"
          />
          Lines in text frames
        </label>
        <label className="flex gap-2 text-sm">
          <input
            checked={draft.restartEachPage}
            onChange={
              /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                update({ restartEachPage: event.target.checked })
            }
            type="checkbox"
          />
          Restart every new page
        </label>
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-1" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="rounded bg-indigo-700 px-3 py-1 text-white" type="submit">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
