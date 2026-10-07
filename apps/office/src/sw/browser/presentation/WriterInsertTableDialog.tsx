/** @fileoverview React presentation of the native SwInsTableDlg input owner. */
import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";

import { useState } from "react";
import { SwInsTableDlg } from "../../source/ui/table/instable";
import { SwInsertTableFlags } from "../../inc/itabenum";
import type { WriterTableDialogValue } from "./WriterTableDialog";

/** Renders native insertion inputs and preserves the currently represented style boundary. @param props - Dialog inputs. @returns Insert dialog. */
export function WriterInsertTableDialog({
  suggestedName = "Table1",
  occupiedNames = [],
  availableWidth,
  onCancel,
  onSubmit,
}: Readonly<{
  suggestedName?: string;
  occupiedNames?: readonly string[];
  availableWidth: number;
  onCancel: () => void;
  onSubmit: (value: WriterTableDialogValue) => void;
}>): React.JSX.Element {
  const [draft] = useState(
    /** Creates one native dialog draft. @returns Input owner. */ () =>
      new SwInsTableDlg(suggestedName, occupiedNames),
  );
  const [, refresh] = useState(0);
  const [border, setBorder] = useState("0.5pt solid #666666");
  /** Invalidates the presentation after a native control handler. @returns Nothing. */
  function changed(): void {
    refresh(
      /** Advances the presentation version. @param value - Prior version. @returns Next version. */ (
        value,
      ) => value + 1,
    );
  }
  return (
    <div
      aria-label="Insert Table"
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <form
        data-writer-modal-panel="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg space-y-4 overflow-auto rounded-xl bg-white p-5 shadow-2xl"
        onSubmit={
          /** Accepts native values without editing the document. @param event - Submit event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            const value = draft.GetValues();
            if (!draft.IsInsertSensitive() || value.rows === 0 || value.columns === 0) return;
            onSubmit({
              name: value.name,
              rows: value.rows,
              columns: value.columns,
              width: availableWidth,
              columnWidths: Array.from(
                { length: value.columns },
                /** Uses the represented insert geometry. @returns Column width. */ () =>
                  availableWidth / value.columns,
              ),
              minRowHeight: 0,
              padding: 100,
              border,
              verticalAlign: VertOrientation.NONE,
              headerRows:
                value.options.mnInsMode & SwInsertTableFlags.Headline
                  ? Math.max(1, value.options.mnRowsToRepeat)
                  : 0,
              repeatHeaderRows: value.options.mnRowsToRepeat > 0,
              dontSplit: !(value.options.mnInsMode & SwInsertTableFlags.SplitLayout),
            });
          }
        }
      >
        <h2 className="text-lg font-bold">Insert Table</h2>
        <fieldset className="grid grid-cols-2 gap-3 rounded border p-3">
          <legend className="text-sm font-bold">General</legend>
          <label className="col-span-2 grid gap-1 text-sm font-medium">
            Name
            <input
              aria-label="Name"
              className="rounded border px-2 py-1"
              value={draft.name}
              onChange={
                /** Filters the native name field. @param event - Name event. @returns Nothing. */ (
                  event,
                ) => {
                  draft.TextFilterHdl(event.target.value);
                  changed();
                }
              }
            />
          </label>
          {(
            [
              ["columns", "Columns"],
              ["rows", "Rows"],
            ] as const
          ).map(
            /** Renders native dimension fields. @param field - Field key and label. @returns Input. */ ([
              field,
              label,
            ]) => (
              <label className="grid gap-1 text-sm font-medium" key={field}>
                {label}
                <input
                  aria-label={label}
                  className="rounded border px-2 py-1"
                  max="2000000"
                  min="1"
                  type="number"
                  value={draft[field]}
                  onChange={
                    /** Updates native dimensions before blur. @param event - Entry event. @returns Nothing. */ (
                      event,
                    ) => {
                      draft.ModifyRowCol(field, event.target.value);
                      changed();
                    }
                  }
                />
              </label>
            ),
          )}
        </fieldset>
        {draft.warning ? (
          <p role="status" className="text-sm text-amber-800">
            Warning : Large tables may adversely affect performance and compatibility
          </p>
        ) : null}
        <fieldset className="grid gap-2 rounded border p-3 text-sm">
          <legend className="px-1 font-bold">Options</legend>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.header}
              onChange={
                /** Toggles the native header flag. @param event - Toggle event. @returns Nothing. */ (
                  event,
                ) => {
                  draft.CheckBoxHdl(event.target.checked);
                  changed();
                }
              }
            />
            Header
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.repeatHeader}
              disabled={!draft.IsRepeatHeaderSensitive()}
              onChange={
                /** Toggles repetition without losing the stored count. @param event - Toggle event. @returns Nothing. */ (
                  event,
                ) => {
                  draft.RepeatHeaderCheckBoxHdl(event.target.checked);
                  changed();
                }
              }
            />
            Repeat header rows on new pages
          </label>
          <label className="flex items-center gap-2">
            Header rows
            <input
              aria-label="Header rows"
              className="w-16 rounded border px-2 py-1"
              type="number"
              min="1"
              max={draft.repeatMaximum}
              value={draft.repeatRows}
              disabled={!draft.IsRepeatGroupSensitive()}
              onChange={
                /** Retains a manually entered repeated count. @param event - Count event. @returns Nothing. */ (
                  event,
                ) => {
                  draft.ModifyRepeatHeaderNF_Hdl(Number(event.target.value));
                  changed();
                }
              }
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={draft.dontSplit}
              onChange={
                /** Toggles the native split option. @param event - Toggle event. @returns Nothing. */ (
                  event,
                ) => {
                  draft.SetDontSplit(event.target.checked);
                  changed();
                }
              }
            />
            Don’t split table over pages
          </label>
        </fieldset>
        <fieldset className="grid gap-2 rounded border p-3 text-sm">
          <legend className="px-1 font-bold">Styles</legend>
          <label className="grid gap-1">
            Table style
            <select
              aria-label="Table style"
              className="rounded border px-2 py-1"
              value={border}
              onChange={
                /** Selects an existing represented border style. @param event - Style event. @returns Nothing. */ (
                  event,
                ) => setBorder(event.target.value)
              }
            >
              <option value="0.5pt solid #666666">Default Style</option>
              <option value="none">No Borders</option>
              <option value="1pt solid #000000">Simple Grid</option>
            </select>
          </label>
        </fieldset>
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-1" onClick={onCancel} type="button">
            Cancel
          </button>
          <button
            className="rounded bg-indigo-700 px-3 py-1 text-white"
            disabled={!draft.IsInsertSensitive()}
            type="submit"
          >
            Insert
          </button>
        </div>
      </form>
    </div>
  );
}
