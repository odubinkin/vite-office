/** @fileoverview Presents native columnwidth.ui controls over the original SwTableWidthDlg draft. */
import { useId, useState } from "react";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import type { SwTableWidthDlg } from "../../source/ui/table/colwd";
import { WriterDialogHeader } from "./WriterDialogHeader";

/** Renders the source column selector and width field, retaining mutations in native Apply. @param props - Draft, module unit and modal acceptance ports. @param props.draft - Source-owned column draft. @param props.unit - Current Writer unit. @param props.onCancel - Discards the draft. @param props.onSubmit - Applies the accepted draft. @returns Column width modal. */
export function WriterColumnWidthDialog({
  draft,
  unit,
  onCancel,
  onSubmit,
}: Readonly<{
  draft: SwTableWidthDlg;
  unit: FieldUnit;
  onCancel: () => void;
  onSubmit: () => void;
}>): React.JSX.Element {
  const columnId = useId(),
    widthId = useId();
  const [, refresh] = useState(0),
    [help, setHelp] = useState(false);
  /** Presents edited native draft values. @returns Nothing. */
  function changed(): void {
    refresh(
      /** Advances the projection revision. @param version - Prior render. @returns Next render. */ (
        version,
      ) => version + 1,
    );
  }
  return (
    <div
      role="dialog"
      aria-label="Column Width"
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Cancels through the owning modal port. @param event - Dialog key. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
          }
        }
      }
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-sm bg-white"
        onSubmit={
          /** Accepts the original native draft. @param event - Submit event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            onSubmit();
          }
        }
      >
        <WriterDialogHeader title="Column Width" onClose={onCancel} />
        <div className="writer-dialog-content">
          <fieldset className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded border p-3">
            <legend className="px-1 font-bold">Width</legend>
            <label htmlFor={columnId} className="text-sm">
              Column:
            </label>
            <input
              id={columnId}
              autoFocus
              type="number"
              aria-label="Column"
              min={1}
              max={draft.columnCount}
              step={1}
              value={draft.column}
              title="Enter the column number of the column you want to change the width of."
              className="min-w-0 rounded border border-slate-300 px-2 py-1"
              onChange={
                /** Invokes the source column-value handler. @param event - Numeric selector. @returns Nothing. */ (
                  event,
                ) => {
                  const value = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(value)) {
                    draft.LoseFocusHdl(value);
                    changed();
                  }
                }
              }
            />
            <label htmlFor={widthId} className="text-sm">
              Width:
            </label>
            <MetricSpinButton
              id={widthId}
              aria-label="Width"
              unit={unit}
              value={draft.width}
              minimum={draft.minimum}
              maximum={draft.maximum}
              title="Enter the width that you want for the selected column(s)."
              className="min-w-0 rounded border border-slate-300 px-2 py-1"
              onValueChange={
                /** Edits the bounded source width draft. @param value - Twips. @returns Nothing. */ (
                  value,
                ) => {
                  draft.SetWidth(value);
                  changed();
                }
              }
            />
          </fieldset>
          {help && (
            <p role="note" className="text-sm">
              Changes the width of the selected column. Select a column number, then enter its
              width.
            </p>
          )}
        </div>
        <div className="writer-dialog-actions">
          <button
            type="button"
            className="mr-auto rounded border px-3 py-1"
            onClick={
              /** Displays contextual column-width help. @returns Nothing. */ () => setHelp(true)
            }
          >
            Help
          </button>
          <button type="button" className="rounded border px-3 py-1" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="writer-dialog-primary">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
