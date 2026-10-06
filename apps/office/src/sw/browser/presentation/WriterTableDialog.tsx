/** @fileoverview Browser Table and Table Properties tabs modeled on pinned Writer table dialogs. */

import { useState } from "react";
import { WriterInsertTableDialog } from "./WriterInsertTableDialog";
import type { SwTable } from "../../source/core/table/swtable";
import type { SwTableProperties } from "../../source/uibase/shells/tabsh";
import { SwFormatTablePage } from "../../source/ui/table/tabledlg";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";

/** Editable table geometry expressed in Writer twips. */
export interface WriterTableDialogValue extends SwTableProperties {
  readonly name: string;
  readonly rows: number;
  readonly columns: number;
}

/** Selects insertion or properties presentation without sharing their native drafts. @param props - Dialog selection. @returns Selected dialog. */
export function WriterTableDialog(
  props: Readonly<{
    table?: SwTable;
    suggestedName?: string;
    occupiedNames?: readonly string[];
    availableWidth: number;
    onCancel: () => void;
    onSubmit: (value: WriterTableDialogValue) => void;
  }>,
): React.JSX.Element {
  return props.table === undefined ? (
    <WriterInsertTableDialog {...props} />
  ) : (
    <WriterTablePropertiesDialog {...props} table={props.table} />
  );
}

/** Presents native table properties. @param props - Original table and handlers. @returns Properties dialog. */
function WriterTablePropertiesDialog({
  table,
  availableWidth,
  onCancel,
  onSubmit,
}: Readonly<{
  table: SwTable;
  availableWidth: number;
  onCancel: () => void;
  onSubmit: (value: WriterTableDialogValue) => void;
}>): React.JSX.Element {
  const rows = table.GetTabLines();
  const name = table.GetName();
  const rowCount = rows.length;
  const columnCount = table.GetColumnWidths().length;
  const [formatPage] = useState(
    /** Creates the native draft once per mounted dialog. @returns Format page or insert mode. */
    () => new SwFormatTablePage(table, availableWidth),
  );
  const [, refreshPage] = useState(0);
  const width = formatPage.data.width;
  const columnWidths = formatPage.data.columns;
  /** Changes the native columns draft and refreshes its presentation. @param values - New widths. @returns Nothing. */
  function setColumnWidths(values: readonly number[]): void {
    formatPage.data.columns.splice(0, formatPage.data.columns.length, ...values);
    refreshPage(
      /** Advances the display version. @param version - Current version. @returns Next version. */ (
        version,
      ) => version + 1,
    );
  }
  const [minRowHeight, setMinRowHeight] = useState(rows?.[0]?.GetFormat().minHeight ?? 0);
  const [padding, setPadding] = useState(rows?.[0]?.GetTabBoxes()[0]?.GetFormat().padding ?? 100);
  const [border, setBorder] = useState(
    rows?.[0]?.GetTabBoxes()[0]?.GetFormat().border ?? "0.5pt solid #666666",
  );
  const [verticalAlign, setVerticalAlign] = useState<WriterTableDialogValue["verticalAlign"]>(
    rows?.[0]?.GetTabBoxes()[0]?.GetFormat().verticalAlign ?? "top",
  );
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<"table" | "columns" | "text-flow" | "borders">(
    "table",
  );
  const [hasHeader, setHasHeader] = useState((table.GetFormat().headerRows ?? 1) > 0);
  const [headerRows, setHeaderRows] = useState(table.GetFormat().headerRows ?? 1);
  const [repeatHeaderRows, setRepeatHeaderRows] = useState(
    table.GetFormat().repeatHeaderRows ?? true,
  );
  const [dontSplit, setDontSplit] = useState(rows?.[0]?.GetFormat().keepTogether ?? false);
  const toCm =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      twips: number,
    ): number => Math.round(((twips * 2.54) / 1440) * 100) / 100;
  const toTwips =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      cm: number,
    ): number => Math.round((cm * 1440) / 2.54);
  const field =
    /** Renders a metric field. @param label - Accessible label. @param twips - Current value. @param change - Owner handler. @param disabled - Sensitivity. @param signed - Allows negative spacing. @returns Input. */ (
      label: string,
      twips: number,
      change: (value: number) => void,
      disabled = false,
      signed = false,
    ): React.JSX.Element => (
      <label className="grid gap-1 text-sm font-medium text-slate-700" key={label}>
        {label}
        <input
          aria-label={label}
          className="rounded border border-slate-300 px-2 py-1"
          disabled={disabled}
          min={signed ? "-999999" : "0"}
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
      aria-label="Table Properties"
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
    >
      <form
        data-writer-modal-panel="true"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-lg space-y-4 overflow-auto rounded-xl bg-white p-5 shadow-2xl"
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
              name.trim().length === 0 ||
              width <= 0 ||
              columnWidths.some(
                /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
                  value,
                ) => value <= 0,
              ) ||
              minRowHeight < 0 ||
              padding < 0 ||
              (hasHeader && (headerRows < 1 || headerRows > rowCount))
            ) {
              setError("Enter valid table dimensions and positive column widths.");
              return;
            }
            formatPage.DeactivatePage();
            onSubmit({
              name: name.trim(),
              rows: rowCount,
              columns: columnCount,
              width,
              horiOrient: formatPage.data.align,
              marginLeft: formatPage.data.left,
              marginRight: formatPage.data.right,
              marginTop: formatPage.above,
              marginBottom: formatPage.below,
              columnWidths,
              minRowHeight,
              padding,
              border,
              verticalAlign,
              headerRows: hasHeader ? headerRows : 0,
              repeatHeaderRows: hasHeader && repeatHeaderRows,
              dontSplit,
            });
          }
        }
      >
        <h2 className="text-lg font-bold">Table Properties</h2>
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
          <div
            aria-label="Table Properties settings"
            className="flex shrink-0 overflow-x-auto border-b border-slate-300 sm:w-32 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r"
            role="tablist"
          >
            {(
              [
                ["table", "Table"],
                ["text-flow", "Text Flow"],
                ["columns", "Columns"],
                ["borders", "Borders"],
              ] as const
            ).map(
              /** Renders a properties tab. @param entry - Tab identifier and label. @returns Tab button. */ ([
                id,
                label,
              ]) => (
                <button
                  aria-selected={activeTab === id}
                  className={`shrink-0 border-b-2 px-3 py-2 text-left text-sm sm:border-b-0 sm:border-r-2 ${activeTab === id ? "border-indigo-700 font-semibold" : "border-transparent"}`}
                  key={id}
                  onClick={/** Opens the selected tab. @returns Nothing. */ () => setActiveTab(id)}
                  role="tab"
                  type="button"
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <div className="grid min-w-0 flex-1 content-start gap-3" role="tabpanel">
            {activeTab === "table" ? (
              <>
                <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
                  <legend className="text-sm font-bold">Alignment</legend>
                  {(
                    [
                      [HoriOrientation.FULL, "Automatic"],
                      [HoriOrientation.LEFT, "Left"],
                      [HoriOrientation.LEFT_AND_WIDTH, "From left"],
                      [HoriOrientation.RIGHT, "Right"],
                      [HoriOrientation.CENTER, "Center"],
                      [HoriOrientation.NONE, "Manual"],
                    ] as const
                  ).map(
                    /** Renders a native orientation radio. @param entry - ID and label. @returns Control. */
                    ([align, label]) => (
                      <label key={align} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="table-alignment"
                          checked={formatPage.data.align === align}
                          onChange={
                            /** Dispatches the native radio transition. @returns Nothing. */ () => {
                              formatPage.AutoClickHdl(align);
                              refreshPage(
                                /** Refreshes metric sensitivity and values. @param version - Current version. @returns Next version. */
                                (version) => version + 1,
                              );
                            }
                          }
                        />
                        {label}
                      </label>
                    ),
                  )}
                </fieldset>
                {field(
                  "Table width (cm)",
                  width,
                  /** Dispatches native width editing. @param value - Twips. @returns Nothing. */ (
                    value,
                  ) => {
                    formatPage.ValueChangedHdl("width", value);
                    refreshPage(
                      /** Refreshes linked native metrics. @param version - Current version. @returns Next version. */
                      (version) => version + 1,
                    );
                  },
                  !formatPage.IsSensitive("width"),
                )}
                <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
                  <legend className="text-sm font-bold">Spacing</legend>
                  {(["left", "right", "above", "below"] as const).map(
                    /** Renders the native metric field. @param metric - Native field. @returns Input. */
                    (metric) =>
                      field(
                        `${metric.charAt(0).toUpperCase()}${metric.slice(1)} (cm)`,
                        metric === "above" || metric === "below"
                          ? formatPage[metric]
                          : formatPage.data[metric],
                        /** Dispatches spacing editing. @param value - Twips. @returns Nothing. */ (
                          value,
                        ) => {
                          formatPage.ValueChangedHdl(metric, value);
                          refreshPage(
                            /** Refreshes linked geometry. @param version - Current version. @returns Next version. */
                            (version) => version + 1,
                          );
                        },
                        (metric === "left" || metric === "right") &&
                          !formatPage.IsSensitive(metric),
                        metric === "left" || metric === "right",
                      ),
                  )}
                </fieldset>
              </>
            ) : null}
            {activeTab === "columns" ? (
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
            ) : null}
            {activeTab === "text-flow" ? (
              <fieldset className="grid gap-2 rounded border p-3">
                <legend className="text-sm font-bold">Text Flow</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={hasHeader}
                    onChange={
                      /** Toggles header rows. @param event - Checkbox event. @returns Nothing. */ (
                        event,
                      ) => setHasHeader(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Header
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={repeatHeaderRows}
                    disabled={!hasHeader}
                    onChange={
                      /** Toggles repeated headers. @param event - Checkbox event. @returns Nothing. */ (
                        event,
                      ) => setRepeatHeaderRows(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Repeat header rows on new pages
                </label>
                <label className="flex items-center gap-2 text-sm">
                  Header rows
                  <input
                    aria-label="Header rows"
                    className="w-16 rounded border px-2 py-1"
                    disabled={!hasHeader || !repeatHeaderRows}
                    max={rowCount}
                    min="1"
                    onChange={
                      /** Updates repeated header count. @param event - Number input. @returns Nothing. */ (
                        event,
                      ) => setHeaderRows(Number(event.target.value))
                    }
                    type="number"
                    value={headerRows}
                  />
                </label>
                {field("Minimum row height (cm)", minRowHeight, setMinRowHeight)}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={dontSplit}
                    onChange={
                      /** Toggles table splitting. @param event - Checkbox event. @returns Nothing. */ (
                        event,
                      ) => setDontSplit(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Don’t split table over pages
                </label>
                <label className="grid gap-1 text-sm">
                  Vertical alignment
                  <select
                    aria-label="Cell vertical alignment"
                    className="rounded border px-2 py-1"
                    onChange={
                      /** Sets cell vertical alignment. @param event - Selection event. @returns Nothing. */ (
                        event,
                      ) =>
                        setVerticalAlign(
                          event.target.value as WriterTableDialogValue["verticalAlign"],
                        )
                    }
                    value={verticalAlign}
                  >
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </label>
              </fieldset>
            ) : null}
            {activeTab === "borders" ? (
              <fieldset className="grid gap-2 rounded border p-3">
                <legend className="text-sm font-bold">Borders</legend>
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
              </fieldset>
            ) : null}
          </div>
        </div>
        {error === undefined ? null : <p className="text-sm text-red-700">{error}</p>}
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
