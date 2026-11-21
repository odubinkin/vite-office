/** @fileoverview Browser rendering of the Calc paste-text import controls and native field preview. */
import { useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import { SvStream } from "../../../tools/source/stream/stream";
import {
  ScAsciiOptions,
  SC_COL_STANDARD,
  SC_COL_TEXT,
  SC_COL_SKIP,
  SC_COL_DMY,
  SC_COL_MDY,
  SC_COL_YMD,
  SC_COL_ENGLISH,
} from "../../source/ui/dbgui/asciiopt";
import { ReadCsvLine, ScImportExport } from "../../source/ui/docshell/impex";
import type { PasteTextRequest } from "../workflows/calc-clipboard-workflow";

const separators = [
  ["\t", "Tab"],
  [",", "Comma"],
  [";", "Semicolon"],
  [" ", "Space"],
] as const;
const optionControls = [
  ["bQuotedFieldAsText", "Format quoted field as text"],
  ["bDetectSpecialNumber", "Detect special numbers"],
  ["bDetectScientificNumber", "Detect scientific notation"],
  ["bEvaluateFormulas", "Evaluate formulas"],
  ["bSkipEmptyCells", "Skip empty cells"],
] as const;
const columnTypes = [
  [SC_COL_STANDARD, "Standard"],
  [SC_COL_TEXT, "Text"],
  [SC_COL_DMY, "Date (DMY)"],
  [SC_COL_MDY, "Date (MDY)"],
  [SC_COL_YMD, "Date (YMD)"],
  [SC_COL_ENGLISH, "US English"],
  [SC_COL_SKIP, "Hide"],
] as const;
const buttonClass = "rounded border border-slate-300 px-3 py-1";
const controlClass = "rounded border border-slate-300 px-2 py-1";

/** A pending native text import request and its completion port. */
interface Props {
  readonly request: PasteTextRequest;
  readonly onAccept: (options: ScAsciiOptions) => void;
  readonly onCancel: () => void;
}

/** Uses the same native separator and field scanner as final import. @param input - Clipboard text. @param options - Current dialog choices. @returns Visible sample fields. */
function Preview(input: string, options: ScAsciiOptions): readonly string[][] {
  const stream = new SvStream(new TextEncoder().encode(input), options.eCharSet);
  const separators: [string] = [options.aFieldSeps];
  const lines: string[][] = [];
  for (let row = 1; !stream.eof() && lines.length < 7; ++row) {
    const record = ReadCsvLine(stream, true, separators, options.cTextSep, [0xffff]);
    if (stream.eof() && !record) break;
    if (row < options.nStartRow) continue;
    const fields: string[] = [];
    let cursor = 0;
    do {
      const scanned = ScImportExport.ScanNextFieldFromString(
        record,
        cursor,
        options.cTextSep,
        options.aFieldSeps,
        options.bMergeFieldSeps,
        options.bRemoveSpace,
        [false],
      );
      fields.push(scanned.field.value);
      if (scanned.next <= cursor) break;
      cursor = scanned.next;
    } while (cursor < record.length && fields.length < 40);
    lines.push(fields);
  }
  return lines;
}

/** Presents the source separator, conversion and field choices and commits them only on OK. @param props - Active request. @returns Text Import dialog. */
export function ScImportAsciiDlg({ request, onAccept, onCancel }: Props): React.JSX.Element {
  const [options, setOptions] = useState(() => new ScAsciiOptions(request.options));
  const [column, setColumn] = useState(1);
  const rows = Preview(request.text, options);
  const width = Math.max(1, ...rows.map((row) => row.length));
  const columnIndex = options.mvColStart.indexOf(column);
  const type = options.mvColFormat[columnIndex] ?? SC_COL_STANDARD;

  /** Applies one native option to an independent dialog draft. @param next - Changed options. @returns Nothing. */
  function update(next: Partial<ScAsciiOptions>): void {
    setOptions((previous) => Object.assign(new ScAsciiOptions(previous), next));
  }

  /** Associates the original typed column information with one preview column. @param value - Native column type. @returns Nothing. */
  function setType(value: number): void {
    const types = new Map(
      options.mvColStart.map((start, index) => [
        start,
        options.mvColFormat[index] ?? SC_COL_STANDARD,
      ]),
    );
    types.set(column, value);
    const starts = [...types.keys()].sort((a, b) => a - b);
    update({
      mvColStart: starts,
      mvColFormat: starts.map((start) => types.get(start) ?? SC_COL_STANDARD),
    });
  }

  return (
    <form
      role="dialog"
      aria-label="Text Import"
      aria-modal="true"
      className="fixed left-1/2 top-1/2 z-50 w-[46rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
      onSubmit={(event) => {
        event.preventDefault();
        onAccept(options);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onCancel();
        }
      }}
    >
      <DialogHeader title="Text Import" onClose={onCancel} />
      <label className="flex items-center gap-2">
        From row
        <input
          type="number"
          min={1}
          className={controlClass + " w-20"}
          value={options.nStartRow}
          onChange={(event) =>
            update({ nStartRow: Math.max(1, Number(event.currentTarget.value)) })
          }
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="space-y-2 rounded border border-slate-200 p-2">
          <legend>Separator Options</legend>
          <div className="flex flex-wrap gap-3">
            {separators.map(([key, label]) => (
              <label key={key} className="flex items-center gap-1">
                <input
                  autoFocus={key === "\t"}
                  type="checkbox"
                  checked={options.aFieldSeps.includes(key)}
                  onChange={(event) =>
                    update({
                      aFieldSeps: event.currentTarget.checked
                        ? options.aFieldSeps + key
                        : options.aFieldSeps.replaceAll(key, ""),
                    })
                  }
                />
                {label}
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2">
            Other
            <input
              className={controlClass + " w-14"}
              value={[...options.aFieldSeps]
                .filter((key) => !separators.some(([separator]) => separator === key))
                .join("")}
              onChange={(event) =>
                update({
                  aFieldSeps:
                    separators
                      .map(([key]) => key)
                      .filter((key) => options.aFieldSeps.includes(key))
                      .join("") + event.currentTarget.value,
                })
              }
            />
          </label>
          <label className="flex items-center gap-2">
            String delimiter
            <input
              className={controlClass + " w-14"}
              maxLength={1}
              value={options.cTextSep === "\0" ? "" : options.cTextSep}
              onChange={(event) => update({ cTextSep: event.currentTarget.value || "\0" })}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.bMergeFieldSeps}
              onChange={(event) => update({ bMergeFieldSeps: event.currentTarget.checked })}
            />
            Merge delimiters
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.bRemoveSpace}
              onChange={(event) => update({ bRemoveSpace: event.currentTarget.checked })}
            />
            Trim spaces
          </label>
        </fieldset>
        <fieldset className="space-y-2 rounded border border-slate-200 p-2">
          <legend>Other Options</legend>
          {optionControls.map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(event) => update({ [key]: event.currentTarget.checked })}
              />
              {label}
            </label>
          ))}
        </fieldset>
      </div>
      <fieldset className="space-y-2 rounded border border-slate-200 p-2">
        <legend>Fields</legend>
        <label className="flex items-center gap-2">
          Column type
          <select
            className={controlClass}
            value={type}
            onChange={(event) => setType(Number(event.currentTarget.value))}
          >
            {columnTypes.map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div className="max-h-32 overflow-auto">
          <table aria-label="Import preview" className="w-full border-collapse text-left">
            <thead>
              <tr>
                {Array.from({ length: width }, (_, index) => (
                  <th key={index} className="border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      className="w-full px-2 py-1 text-left aria-pressed:bg-sky-100"
                      aria-pressed={column === index + 1}
                      onClick={() => setColumn(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {Array.from({ length: width }, (_, field) => (
                    <td key={field} className="border border-slate-200 px-2 py-1">
                      {row[field] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </fieldset>
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonClass} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className={buttonClass}>
          OK
        </button>
      </div>
    </form>
  );
}
