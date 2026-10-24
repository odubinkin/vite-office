/** @fileoverview Browser projection of the supported Writer Line Numbering settings. */
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { SwLineNumberingDlg } from "../../source/ui/misc/linenum";
import { useEffect, useRef, useState } from "react";
import { LineNumberPosition, type SwLineNumberInfoValue } from "../../inc/lineinfo";

/** Edits the document-owned line numbering options exposed by the pinned dialog. @param props - Initial value and callbacks. @returns Dialog. */
export function WriterLineNumberingDialog({
  value,
  unit = FieldUnit.CM,
  onCancel,
  onSubmit,
}: Readonly<{
  unit?: FieldUnit;
  value: SwLineNumberInfoValue;
  onCancel: () => void;
  onSubmit: (value: SwLineNumberInfoValue) => void;
}>): React.JSX.Element {
  const [page] = useState(
    /** Creates native represented control draft. @returns Dialog draft. */ () =>
      new SwLineNumberingDlg(value),
  );
  const [draft, setDraft] = useState(page.QueryValue()),
    show = useRef<HTMLInputElement>(null);
  useEffect(
    /** Focuses this request's primary original checkbox. @returns Nothing. */ () => {
      show.current?.focus();
    },
    [],
  );
  /** Updates source controls and publishes their current values. @param next - Changed fields. @returns Nothing. */
  function update(next: Partial<SwLineNumberInfoValue>): void {
    page.SetValue(next);
    setDraft(page.QueryValue());
  }
  return (
    <div
      aria-label="Line Numbering"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      data-writer-modal="true"
      onKeyDown={
        /** Cancels only this modal request. @param event - Native key. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
      role="dialog"
    >
      <form
        className="w-full max-w-lg bg-white"
        data-writer-modal-panel="true"
        onSubmit={
          /** Accepts settings. @param event - Submit event. @returns Nothing. */ (event) => {
            event.preventDefault();
            onSubmit(page.OKHdl());
          }
        }
      >
        <WriterDialogHeader title="Line Numbering" onClose={onCancel} />
        <div className="writer-dialog-content">
          <label className="flex gap-2 text-sm">
            <input
              ref={show}
              checked={draft.paintLineNumbers}
              onChange={
                /** Updates a setting. @param event - Input event. @returns Nothing. */ (event) =>
                  update({ paintLineNumbers: event.target.checked })
              }
              type="checkbox"
            />
            Show numbering
          </label>
          <fieldset disabled={!page.LineOnOffHdl()} className="grid gap-4">
            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend>View</legend>
              <label className="grid gap-1 text-sm">
                Position
                <select
                  className="rounded border p-1"
                  value={draft.position}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ position: Number(event.target.value) as LineNumberPosition })
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
                Spacing
                <MetricSpinButton
                  minimum={0}
                  unit={unit}
                  aria-label={`Spacing (${unit === FieldUnit.INCH ? "in" : "cm"})`}
                  className="rounded border p-1"
                  value={draft.posFromLeft}
                  onValueChange={
                    /** Updates physical spacing through the native parser. @param twips - Accepted value. @returns Nothing. */ (
                      twips,
                    ) => update({ posFromLeft: twips })
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                Interval
                <input
                  className="rounded border p-1"
                  min="1"
                  max="1000"
                  type="number"
                  value={draft.countBy}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ countBy: Number(event.target.value) })
                  }
                />
              </label>
            </fieldset>
            <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <legend>Separator</legend>
              <label className="grid gap-1 text-sm">
                Separator text
                <input
                  className="rounded border p-1"
                  value={draft.divider}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ divider: event.target.value })
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                Every
                <input
                  disabled={!page.ModifyHdl()}
                  className="rounded border p-1"
                  min="0"
                  max="1000"
                  type="number"
                  value={draft.dividerCountBy}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ dividerCountBy: Number(event.target.value) })
                  }
                />
              </label>
            </fieldset>
            <fieldset className="grid gap-2">
              <legend>Count</legend>
              <label className="flex gap-2 text-sm">
                <input
                  checked={draft.countBlankLines}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ countBlankLines: event.target.checked })
                  }
                  type="checkbox"
                />
                Blank lines
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  checked={draft.countInFlys}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ countInFlys: event.target.checked })
                  }
                  type="checkbox"
                />
                Lines in text frames
              </label>
              <label className="flex gap-2 text-sm">
                <input
                  checked={draft.restartEachPage}
                  onChange={
                    /** Updates a setting. @param event - Input event. @returns Nothing. */ (
                      event,
                    ) => update({ restartEachPage: event.target.checked })
                  }
                  type="checkbox"
                />
                Restart every new page
              </label>
            </fieldset>
          </fieldset>
        </div>
        <div className="writer-dialog-actions">
          <button className="rounded border px-3 py-1" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="writer-dialog-primary" type="submit">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
