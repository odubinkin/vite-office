/** @fileoverview Browser Table and Table Properties tabs modeled on pinned Writer table dialogs. */

import { useState } from "react";
import { WriterInsertTableDialog } from "./WriterInsertTableDialog";
import type { SwTable, SwTableBox } from "../../source/core/table/swtable";
import type { SwTableProperties } from "../../source/uibase/shells/tabsh";
import {
  SwFormatTablePage,
  SwTableColumnPage,
  SwTextFlowPage,
} from "../../source/ui/table/tabledlg";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwFormatFrameSize } from "../../inc/fmtfsize";

/** Editable table geometry expressed in Writer twips. */
export interface WriterTableDialogValue extends SwTableProperties {
  readonly name: string;
  readonly rows: number;
  readonly columns: number;
  /** Native insertion-only option, independent of properties changed-item flags. */
  readonly dontSplit?: boolean;
}

/** Selects insertion or properties presentation without sharing their native drafts. @param props - Dialog selection. @returns Selected dialog. */
export function WriterTableDialog(
  props: Readonly<{
    table?: SwTable;
    selectedBoxes?: readonly SwTableBox[];
    rowHeight?: SwFormatFrameSize | undefined;
    lineSelected?: boolean;
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
  selectedBoxes,
  rowHeight,
  availableWidth,
  lineSelected = false,
  onCancel,
  onSubmit,
}: Readonly<{
  table: SwTable;
  selectedBoxes?: readonly SwTableBox[];
  rowHeight?: SwFormatFrameSize | undefined;
  lineSelected?: boolean;
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
    () => {
      return new SwFormatTablePage(table, availableWidth, lineSelected);
    },
  );
  const [columnPage] = useState(
    /** Binds the columns page to the shared native table-dialog draft. @returns Native column owner. */
    () => new SwTableColumnPage(formatPage.data),
  );
  const [textFlowPage] = useState(
    /** Captures the native initial headline item once per dialog. @returns Native Text Flow headline owner. */
    () => new SwTextFlowPage(table, selectedBoxes),
  );
  const [, refreshPage] = useState(0);
  const width = formatPage.GetFieldValue("width");
  const columnWidths = formatPage.data.columns;
  const [initial] = useState(
    /** Retains initial input values for the represented Text Flow and Borders pages. @returns Original page values. */
    () => ({
      minRowHeight: rowHeight?.GetHeight() ?? 0,
      padding: rows[0]?.GetTabBoxes()[0]?.GetFormat().padding ?? 100,
      border: rows[0]?.GetTabBoxes()[0]?.GetFormat().border ?? "0.5pt solid #666666",
      verticalAlign: rows[0]?.GetTabBoxes()[0]?.GetFormat().verticalAlign ?? "top",
    }),
  );
  const [minRowHeight, setMinRowHeight] = useState(initial.minRowHeight);
  const [padding, setPadding] = useState(initial.padding);
  const [border, setBorder] = useState(initial.border);
  const [verticalAlign, setVerticalAlign] = useState<WriterTableDialogValue["verticalAlign"]>(
    initial.verticalAlign,
  );
  const [error, setError] = useState<string>();
  const [activeTab, setActiveTab] = useState<"table" | "columns" | "text-flow" | "borders">(
    "table",
  );
  const toCm =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      twips: number,
    ): number => Math.round(((twips * 2.54) / 1440) * 100) / 100;
  const toTwips =
    /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
      cm: number,
    ): number => Math.round((cm * 1440) / 2.54);
  const field =
    /** Renders a metric field. @param label - Accessible label. @param twips - Current value. @param change - Owner handler. @param disabled - Sensitivity. @param signed - Allows negative spacing. @param formatField - Native format metric identity. @returns Input. */ (
      label: string,
      twips: number,
      change: (value: number) => void,
      disabled = false,
      signed = false,
      formatField?: Parameters<SwFormatTablePage["DeactivatePage"]>[0],
    ): React.JSX.Element => (
      <label className="grid gap-1 text-sm font-medium text-slate-700" key={label}>
        {label}
        <input
          aria-label={label}
          data-writer-table-format-field={formatField}
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
            if (activeTab === "table") {
              const focused = event.currentTarget.ownerDocument.activeElement?.getAttribute(
                "data-writer-table-format-field",
              ) as Parameters<SwFormatTablePage["DeactivatePage"]>[0] | null;
              formatPage.DeactivatePage(focused ?? undefined);
            }
            if (activeTab === "columns") columnPage.DeactivatePage();
            if (
              !Number.isInteger(rowCount) ||
              !Number.isInteger(columnCount) ||
              rowCount < 1 ||
              columnCount < 1 ||
              name.trim().length === 0 ||
              formatPage.data.width <= 0 ||
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
              width: formatPage.data.width,
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
              headerRows: textFlowPage.GetRowsToRepeat(),
              repeatHeaderRows: textFlowPage.GetRowsToRepeat() > 0,
              ...textFlowPage.FillItemSet(),
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
                  onClick={
                    /** Deactivates and activates the shared native pages. @returns Nothing. */ () => {
                      if (activeTab === "table") formatPage.DeactivatePage();
                      if (activeTab === "columns") columnPage.DeactivatePage();
                      if (id === "columns") columnPage.ActivatePage();
                      if (id === "table") formatPage.ActivatePage();
                      setActiveTab(id);
                      refreshPage(
                        /** Presents accepted shared geometry. @param version - Display version. @returns Next version. */
                        (version) => version + 1,
                      );
                    }
                  }
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
                          checked={formatPage.GetAlign() === align}
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
                  false,
                  "width",
                )}
                <fieldset className="grid grid-cols-2 gap-2 rounded border p-3">
                  <legend className="text-sm font-bold">Spacing</legend>
                  {(["left", "right", "above", "below"] as const).map(
                    /** Renders the native metric field. @param metric - Native field. @returns Input. */
                    (metric) =>
                      field(
                        `${metric.charAt(0).toUpperCase()}${metric.slice(1)} (cm)`,
                        formatPage.GetFieldValue(metric),
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
                        metric,
                      ),
                  )}
                </fieldset>
              </>
            ) : null}
            {activeTab === "columns" ? (
              <fieldset className="grid min-w-0 gap-2 rounded border p-3">
                <legend className="text-sm font-bold">Columns</legend>
                {(
                  [
                    ["adapt", "Adapt table width"],
                    ["proportional", "Adjust columns proportionally"],
                  ] as const
                ).map(
                  /** Presents the native checkbox coupling and sensitivity. @param entry - Mode and source label. @returns Control. */
                  ([mode, label]) => (
                    <label key={mode} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={columnPage.IsChecked(mode)}
                        disabled={!columnPage.IsSensitive(mode)}
                        onChange={
                          /** Dispatches the native mode transition. @param event - Checkbox event. @returns Nothing. */
                          (event) => {
                            columnPage.ModeHdl(mode, event.target.checked);
                            refreshPage(
                              /** Refreshes source mode coupling. @param version - Display version. @returns Next version. */
                              (version) => version + 1,
                            );
                          }
                        }
                      />
                      {label}
                    </label>
                  ),
                )}
                <div className="text-sm">
                  Remaining space:{" "}
                  <output aria-label="Remaining space (cm)">
                    {toCm(columnPage.GetRemainingSpace())}
                  </output>{" "}
                  cm
                </div>
                <div className="flex gap-2">
                  {(["back", "next"] as const).map(
                    /** Presents source one-column paging. @param direction - Window direction. @returns Button. */
                    (direction) => (
                      <button
                        key={direction}
                        type="button"
                        aria-label={direction === "back" ? "Previous columns" : "Next columns"}
                        disabled={!columnPage.CanScroll(direction)}
                        onClick={
                          /** Dispatches native field-window navigation. @returns Nothing. */
                          () => {
                            columnPage.AutoClickHdl(direction);
                            refreshPage(
                              /** Refreshes native field labels and values. @param version - Display version. @returns Next version. */
                              (version) => version + 1,
                            );
                          }
                        }
                        className="rounded border px-3 py-1 disabled:opacity-40"
                      >
                        {direction === "back" ? "←" : "→"}
                      </button>
                    ),
                  )}
                </div>
                <div className="grid min-w-0 grid-cols-2 gap-2">
                  {Array.from(
                    { length: SwTableColumnPage.MET_FIELDS },
                    /** Renders the native fixed metric slots, including blank disabled fields. @param _unused - Array entry. @param slot - Native field index. @returns Metric input. */
                    (_unused, slot) => {
                      const value = columnPage.GetFieldValue(slot),
                        label = `Column ${columnPage.GetFieldColumn(slot) + 1} width (cm)`;
                      return (
                        <label
                          className="grid min-w-0 gap-1 text-sm font-medium text-slate-700"
                          key={slot}
                        >
                          {label}
                          <input
                            type="number"
                            aria-label={label}
                            className="min-w-0 rounded border border-slate-300 px-2 py-1"
                            disabled={value === undefined}
                            min={toCm(columnPage.GetMinimum())}
                            max={toCm(columnPage.GetMaximum())}
                            step="0.01"
                            value={value === undefined ? "" : toCm(value)}
                            onChange={
                              /** Dispatches metric edits directly to the source policy owner. @param event - Input event. @returns Nothing. */
                              (event) => {
                                columnPage.ValueChangedHdl(
                                  slot,
                                  toTwips(Number(event.target.value)),
                                );
                                refreshPage(
                                  /** Presents native neighbor compensation. @param version - Display version. @returns Next version. */
                                  (version) => version + 1,
                                );
                              }
                            }
                          />
                        </label>
                      );
                    },
                  )}
                </div>
              </fieldset>
            ) : null}
            {activeTab === "text-flow" ? (
              <fieldset className="grid gap-2 rounded border p-3">
                <legend className="text-sm font-bold">Text Flow</legend>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={textFlowPage.IsHeadline()}
                    onChange={
                      /** Dispatches the source headline checkbox and sensitivity. @param event - Checkbox input. @returns Nothing. */ (
                        event,
                      ) => {
                        textFlowPage.HeadLineCBClickHdl(event.target.checked);
                        refreshPage(
                          /** Presents native headline widgets. @param version - Current version. @returns Next version. */
                          (version) => version + 1,
                        );
                      }
                    }
                    type="checkbox"
                  />
                  Repeat header
                </label>
                <label className="flex items-center gap-2 text-sm">
                  The first
                  <input
                    aria-label="Header rows"
                    className="w-16 rounded border px-2 py-1"
                    disabled={!textFlowPage.IsSensitive()}
                    max="100"
                    min="1"
                    onChange={
                      /** Dispatches source integer editing. @param event - Number input. @returns Nothing. */ (
                        event,
                      ) => {
                        textFlowPage.ValueChangedHdl(Number(event.target.value));
                        refreshPage(
                          /** Presents accepted source count. @param version - Current version. @returns Next version. */
                          (version) => version + 1,
                        );
                      }
                    }
                    type="number"
                    value={textFlowPage.GetHeaderRows()}
                  />
                  rows
                </label>
                {field("Minimum row height (cm)", minRowHeight, setMinRowHeight)}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={textFlowPage.IsSplit()}
                    onChange={
                      /** Dispatches native table split and child sensitivity. @param event - Checkbox event. @returns Nothing. */ (
                        event,
                      ) => {
                        textFlowPage.SplitHdl_Impl(event.target.checked);
                        refreshPage(
                          /** Renders native widget state. @param version - Current version. @returns Next version. */ (
                            version,
                          ) => version + 1,
                        );
                      }
                    }
                    type="checkbox"
                  />
                  Allow table to split across pages and columns
                </label>
                <label className="ml-4 flex items-center gap-2 text-sm">
                  <input
                    checked={textFlowPage.GetRowSplitState() === true}
                    aria-checked={
                      textFlowPage.GetRowSplitState() === undefined
                        ? "mixed"
                        : textFlowPage.GetRowSplitState()
                    }
                    disabled={!textFlowPage.IsRowSplitSensitive()}
                    ref={
                      /** Presents the native mixed state on the browser checkbox. @param element - Mounted native widget. @returns Nothing. */ (
                        element,
                      ) => {
                        if (element !== null)
                          element.indeterminate = textFlowPage.GetRowSplitState() === undefined;
                      }
                    }
                    onChange={
                      /** Dispatches an explicit native row item. @param event - Checkbox event. @returns Nothing. */ (
                        event,
                      ) => {
                        textFlowPage.SetRowSplitState(event.target.checked);
                        refreshPage(
                          /** Renders the changed native row widget. @param version - Current version. @returns Next version. */ (
                            version,
                          ) => version + 1,
                        );
                      }
                    }
                    type="checkbox"
                  />
                  Allow row to break across pages and columns
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
          <button
            className="mr-auto rounded border px-3 py-1"
            type="button"
            onClick={
              /** Resets only the current native page to its original input values. @returns Nothing. */ () => {
                if (activeTab === "table") formatPage.Reset();
                else if (activeTab === "columns") columnPage.Reset();
                else if (activeTab === "text-flow") {
                  textFlowPage.Reset();
                  setMinRowHeight(initial.minRowHeight);
                  setVerticalAlign(initial.verticalAlign);
                } else {
                  setPadding(initial.padding);
                  setBorder(initial.border);
                }
                setError(undefined);
                refreshPage(
                  /** Presents reset native fields without changing the active page. @param version - Current version. @returns Next version. */
                  (version) => version + 1,
                );
              }
            }
          >
            Reset
          </button>
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
