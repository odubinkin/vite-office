/** @fileoverview Browser Table and Table Properties tabs modeled on pinned Writer table dialogs. */

import { useState } from "react";
import type { SwTable } from "../../source/core/table/swtable";

/** Editable table geometry expressed in Writer twips. */
export interface WriterTableDialogValue {
  readonly name: string;
  readonly rows: number;
  readonly columns: number;
  readonly width: number;
  readonly columnWidths: readonly number[];
  readonly minRowHeight: number;
  readonly padding: number;
  readonly border: string;
  readonly verticalAlign: "top" | "middle" | "bottom";
}

/** Collects supported Insert Table and Table Properties fields. */
/** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ export function WriterTableDialog({
  table,
  suggestedName = "Table1",
  availableWidth,
  onCancel,
  onSubmit,
}: Readonly<{
  table?: SwTable;
  suggestedName?: string;
  availableWidth: number;
  onCancel: () => void;
  onSubmit: (value: WriterTableDialogValue) => void;
}>): React.JSX.Element {
  const rows = table?.GetTabLines();
  const [name, setName] = useState(table?.GetName() ?? suggestedName);
  const [rowCount, setRowCount] = useState(rows?.length ?? 2);
  const [columnCount, setColumnCount] = useState(table?.GetColumnWidths().length ?? 2);
  const [width, setWidth] = useState(table?.GetFormat().width ?? availableWidth);
  const [columnWidths, setColumnWidths] = useState<readonly number[]>(
    table?.GetColumnWidths() ?? [availableWidth / 2, availableWidth / 2],
  );
  const [minRowHeight, setMinRowHeight] = useState(rows?.[0]?.GetFormat().minHeight ?? 0);
  const [padding, setPadding] = useState(rows?.[0]?.GetTabBoxes()[0]?.GetFormat().padding ?? 100);
  const [border, setBorder] = useState(
    rows?.[0]?.GetTabBoxes()[0]?.GetFormat().border ?? "0.5pt solid #666666",
  );
  const [verticalAlign, setVerticalAlign] = useState<WriterTableDialogValue["verticalAlign"]>(
    rows?.[0]?.GetTabBoxes()[0]?.GetFormat().verticalAlign ?? "top",
  );
  const [error, setError] = useState<string>();
  const toCm =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      twips: number,
    ): number => Math.round(((twips * 2.54) / 1440) * 100) / 100;
  const toTwips =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      cm: number,
    ): number => Math.round((cm * 1440) / 2.54);
  const field =
    /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @param argument3 - Callback input. @returns Callback result. */ (
      label: string,
      twips: number,
      change: (value: number) => void,
    ): React.JSX.Element => (
      <label className="grid gap-1 text-sm font-medium text-slate-700" key={label}>
        {label}
        <input
          aria-label={label}
          className="rounded border border-slate-300 px-2 py-1"
          min="0"
          onChange={
            /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
              event,
            ) => change(toTwips(Number(event.target.value)))
          }
          step="0.01"
          type="number"
          value={toCm(twips)}
        />
      </label>
    );
  return (
    <div
      aria-label={table === undefined ? "Insert Table" : "Table Properties"}
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <form
        className="w-full max-w-lg space-y-4 rounded-xl bg-white p-5 shadow-2xl"
        onSubmit={
          /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
            event,
          ) => {
            event.preventDefault();
            if (
              !Number.isInteger(rowCount) ||
              !Number.isInteger(columnCount) ||
              rowCount < 1 ||
              columnCount < 1 ||
              rowCount > 100 ||
              columnCount > 32 ||
              name.trim().length === 0 ||
              width <= 0 ||
              columnWidths.some(
                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                  value,
                ) => value <= 0,
              ) ||
              minRowHeight < 0 ||
              padding < 0
            ) {
              setError("Enter valid table dimensions and positive column widths.");
              return;
            }
            onSubmit({
              name: name.trim(),
              rows: rowCount,
              columns: columnCount,
              width,
              columnWidths,
              minRowHeight,
              padding,
              border,
              verticalAlign,
            });
          }
        }
      >
        <h2 className="text-lg font-bold">
          {table === undefined ? "Insert Table" : "Table Properties"}
        </h2>
        {table === undefined ? (
          <fieldset className="grid grid-cols-2 gap-3 rounded border p-3">
            <legend className="text-sm font-bold">General</legend>
            <label className="col-span-2 grid gap-1 text-sm font-medium">
              Name
              <input
                aria-label="Name"
                className="rounded border px-2 py-1"
                onChange={
                  /** Updates the upstream table name field. @param event - Name input. @returns Nothing. */
                  (event) => setName(event.target.value)
                }
                value={name}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Rows
              <input
                aria-label="Rows"
                className="rounded border px-2 py-1"
                max="100"
                min="1"
                onChange={
                  /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                    event,
                  ) => setRowCount(Number(event.target.value))
                }
                type="number"
                value={rowCount}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Columns
              <input
                aria-label="Columns"
                className="rounded border px-2 py-1"
                max="32"
                min="1"
                onChange={
                  /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                    event,
                  ) => {
                    const count = Number(event.target.value);
                    setColumnCount(count);
                    setColumnWidths(
                      Array.from(
                        { length: Math.max(0, Math.min(32, count)) },
                        /** Handles the browser table interaction.  @returns Callback result. */ () =>
                          width / count,
                      ),
                    );
                  }
                }
                type="number"
                value={columnCount}
              />
            </label>
          </fieldset>
        ) : null}
        {field("Table width (cm)", width, setWidth)}
        <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
          <legend className="text-sm font-bold">Columns</legend>
          {Array.from(
            { length: columnCount },
            /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
              _,
              index,
            ) =>
              field(
                `Column ${index + 1} width (cm)`,
                columnWidths[index] as number,
                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                  value,
                ) =>
                  setColumnWidths(
                    Array.from(
                      { length: columnCount },
                      /** Handles the browser table interaction. @param argument1 - Callback input. @param argument2 - Callback input. @returns Callback result. */ (
                        _,
                        column,
                      ) => (column === index ? value : (columnWidths[column] as number)),
                    ),
                  ),
              ),
          )}
        </fieldset>
        <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
          <legend className="text-sm font-bold">Rows and cells</legend>
          {field("Minimum row height (cm)", minRowHeight, setMinRowHeight)}
          {field("Cell padding (cm)", padding, setPadding)}
          <label className="grid gap-1 text-sm">
            Border
            <select
              aria-label="Cell border"
              className="rounded border px-2 py-1"
              onChange={
                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                  event,
                ) => setBorder(event.target.value)
              }
              value={border}
            >
              <option value="none">None</option>
              <option value="0.5pt solid #666666">Thin solid</option>
              <option value="1pt solid #000000">Solid</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Vertical alignment
            <select
              aria-label="Cell vertical alignment"
              className="rounded border px-2 py-1"
              onChange={
                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                  event,
                ) => setVerticalAlign(event.target.value as WriterTableDialogValue["verticalAlign"])
              }
              value={verticalAlign}
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        </fieldset>
        {error === undefined ? null : <p className="text-sm text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button className="rounded border px-3 py-1" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="rounded bg-indigo-700 px-3 py-1 text-white" type="submit">
            {table === undefined ? "Insert" : "OK"}
          </button>
        </div>
      </form>
    </div>
  );
}
