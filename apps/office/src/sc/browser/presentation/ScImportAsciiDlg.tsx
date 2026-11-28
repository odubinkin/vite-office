/** @fileoverview Browser rendering of the Calc paste-text import controls and native field preview. */
import { useMemo, useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { ASIAN, COMPLEX, LATIN } from "../../../offapi/com/sun/star/i18n/ScriptType";
import { SfxObjectShell } from "../../../sfx2/source/doc/objsh";
import {
  describeLanguage,
  getLanguageChoices,
  sortLanguageChoices,
} from "../../../svx/source/dialog/langbox";
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
import { ScCsvRuler } from "./ScCsvRuler";
import type {
  PasteTextRequest,
  PasteTextResult,
  TextImportSeparatorMode,
} from "../workflows/calc-clipboard-workflow";

const separators = [
  ["\t", "Tab"],
  [";", "Semicolon"],
  [",", "Comma"],
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
  readonly onRespond: (result: PasteTextResult) => void;
}

/** Reads fixed-width preview fields using the source grid's visual column positions. @param record - Logical line. @param starts - Split positions, including zero. @returns Raw preview fields. */
function FixedWidthFields(record: string, starts: readonly number[]): string[] {
  const cursor: [number] = [0];
  return starts.map(
    /** Reads one visual-width column while advancing the CSV cursor. @param start - Visual start offset. @param index - Column index. @returns Field text for this column. */ (
      start,
      index,
    ) => {
      const from = cursor[0];
      const next = starts[index + 1];
      if (next === undefined) cursor[0] = record.length;
      else ScImportExport.CountVisualWidth(record, cursor, next - start);
      return record.slice(from, cursor[0]);
    },
  );
}

/** Uses the native scanners and visual widths that drive the final import. @param input - Clipboard text. @param options - Current dialog choices. @param fixedStarts - Visual start positions in fixed-width mode. @returns Visible fields and ruler length. */
function Preview(input: string, options: ScAsciiOptions, fixedStarts: readonly number[]) {
  const stream = new SvStream(new TextEncoder().encode(input), options.eCharSet);
  const separators: [string] = [options.aFieldSeps];
  const lines: string[][] = [];
  let visualWidth = 0;
  for (let row = 1; !stream.eof() && lines.length < 7; ++row) {
    const record = ReadCsvLine(
      stream,
      !options.bFixedLen,
      separators,
      options.cTextSep,
      [0xffff],
    ).replaceAll("\0", "");
    if (stream.eof() && !record) break;
    if (row < options.nStartRow) continue;
    if (options.bFixedLen) {
      visualWidth = Math.max(
        visualWidth,
        ScImportExport.CountVisualWidth(record, [0], Number.POSITIVE_INFINITY),
      );
      lines.push(FixedWidthFields(record, fixedStarts));
      continue;
    }
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
  return { lines, visualWidth };
}

/** Presents the source separator, conversion and field choices and commits them only on OK. @param props - Active request. @returns Text Import dialog. */
export function ScImportAsciiDlg({ request, onRespond }: Props): React.JSX.Element {
  const { locale } = useBrowserLocalization();
  const textToColumns = request.call === "textToColumns";
  const title = textToColumns ? "Text to Columns" : "Text Import";
  const [options, setOptions] = useState(
    /** Copies the saved source import preferences into the dialog model. @returns CSV import options. */ () =>
      new ScAsciiOptions(request.preferences.options),
  );
  const [mode, setMode] = useState(request.preferences.mode);
  const [splits, setSplits] = useState(request.fixedSplits);
  const [otherEnabled, setOtherEnabled] = useState(
    /** Checks whether saved separators include a custom separator. @returns Initial custom-separator toggle state. */ () =>
      [...options.aFieldSeps].some(
        /** Checks whether the source uses an unlisted separator. @param key - Separator character. @returns Whether a custom separator is present. */ (
          key,
        ) =>
          !separators.some(
            /** Checks whether `key` equals `known`. @param entry - Candidate entry. @returns Whether the condition holds. */ ([
              known,
            ]) => key === known,
          ),
      ),
  );
  const [fixedTypes, setFixedTypes] = useState<ReadonlyMap<number, number>>(
    /** Creates the initial fixed-column format assignments. @returns Empty column-format map. */ () =>
      new Map(),
  );
  const [separatedTypes, setSeparatedTypes] = useState<ReadonlyMap<number, number>>(
    /** Creates the initial separator-delimited column format assignments. @returns Empty column-format map. */ () =>
      new Map(),
  );
  const [column, setColumn] = useState(1);
  const languages = useMemo(
    /** Loads sorted language choices for a regular text import. @returns Available locales or an empty list in Text to Columns. */ () =>
      textToColumns
        ? []
        : sortLanguageChoices(
            [LATIN, ASIAN, COMPLEX].flatMap(
              /** Reads actual locale choices for one language script. @param script - Language script group. @returns Choices after removing placeholders. */ (
                script,
              ) => getLanguageChoices(script).slice(4),
            ),
            locale,
          ),
    [locale, textToColumns],
  );
  const { text } = request;
  const { eCharSet, cTextSep } = options;
  const detected = useMemo(
    /** Detects separators from the raw import preview using the chosen encoding. @returns Detected delimiter information. */ () =>
      SfxObjectShell.DetectCsvSeparators(
        new SvStream(new TextEncoder().encode(text), eCharSet),
        eCharSet,
        cTextSep,
      ),
    [text, eCharSet, cTextSep],
  );
  const detectedLabel = [...detected]
    .map(
      /** Names invisible separator characters for the user. @param key - Separator character. @returns Readable separator label. */ (
        key,
      ) => (key === "\t" ? "Tab" : key === " " ? "space" : key),
    )
    .join(" ");
  const fixed = mode === "fixed";
  const fixedStarts = [0, ...splits];
  const selectedSeparators = separators
    .map(
      /** Extracts the character from one registered separator option. @param entry - Separator option tuple. @returns Separator character. */ ([
        key,
      ]) => key,
    )
    .filter(
      /** Keeps separator characters enabled in the current import options. @param key - Separator character. @returns Whether the separator is active. */ (
        key,
      ) => options.aFieldSeps.includes(key),
    );
  const otherSeparators = [...options.aFieldSeps]
    .filter(
      /** Collects separators represented by the user-defined control. @param key - Separator character. @returns Whether it is a custom separator. */ (
        key,
      ) =>
        !separators.some(
          /** Checks whether `key` equals `known`. @param entry - Candidate entry. @returns Whether the condition holds. */ ([
            known,
          ]) => key === known,
        ),
    )
    .join("");
  const manual = selectedSeparators.join("") + (otherEnabled ? otherSeparators : "");
  const active = Object.assign(new ScAsciiOptions(options), {
    bFixedLen: fixed,
    aFieldSeps: fixed ? "" : mode === "detected" ? detected : manual,
  });
  const { lines: rows, visualWidth } = Preview(text, active, fixedStarts);
  const rulerWidth = Math.max(visualWidth, (splits.at(-1) ?? 0) + 1);
  const width = fixed
    ? fixedStarts.length
    : Math.max(
        1,
        ...rows.map(
          /** Reads the entry's `length` field. @param row - Collection entry. @returns The field value. */ (
            row,
          ) => row.length,
        ),
      );
  const currentColumn = Math.min(column, width);
  const sourceColumn = fixed ? (fixedStarts[currentColumn - 1] ?? 0) : currentColumn;
  const type = (fixed ? fixedTypes : separatedTypes).get(sourceColumn) ?? SC_COL_STANDARD;

  /** Applies one native option to an independent dialog draft. @param next - Changed options. @returns Nothing. */
  function update(next: Partial<ScAsciiOptions>): void {
    setOptions(
      /** Clones the active native ASCII options and applies edited fields. @param previous - Previous options. @returns Updated import options. */ (
        previous,
      ) => Object.assign(new ScAsciiOptions(previous), next),
    );
  }

  /** Associates the original typed column information with one preview column. @param value - Native column type. @returns Nothing. */
  function setType(value: number): void {
    const updateTypes = fixed ? setFixedTypes : setSeparatedTypes;
    updateTypes(
      /** Changes the format assignment for the chosen source column. @param previous - Previous column assignments. @returns Updated column type map. */ (
        previous,
      ) => new Map(previous).set(sourceColumn, value),
    );
  }

  /** Saves the clipboard settings and builds the original ScAsciiOptions column contract. @returns Nothing. */
  function accept(): void {
    const preferenceOptions = Object.assign(new ScAsciiOptions(options), { aFieldSeps: manual });
    const importOptions = new ScAsciiOptions(active);
    if (fixed) {
      importOptions.mvColStart = [...fixedStarts, 0x7fffffff];
      importOptions.mvColFormat = [
        ...fixedStarts.map(
          /** Reads the fixed-column format assignment by its start position. @param start - Source column start. @returns Assigned format or Standard. */ (
            start,
          ) => fixedTypes.get(start) ?? SC_COL_STANDARD,
        ),
        SC_COL_SKIP,
      ];
    } else {
      importOptions.mvColStart = [...separatedTypes.keys()].sort(
        /** Orders values numerically in ascending order. @param left - First value. @param right - Second value. @returns Numeric comparison. */ (
          left,
          right,
        ) => left - right,
      );
      importOptions.mvColFormat = importOptions.mvColStart.map(
        /** Reads the delimited column's format assignment by its start position. @param start - Source column start. @returns Assigned format or Standard. */ (
          start,
        ) => separatedTypes.get(start) ?? SC_COL_STANDARD,
      );
    }
    onRespond({
      accepted: true,
      options: importOptions,
      preferences: { mode, options: preferenceOptions },
      fixedSplits: splits,
    });
  }

  /** Retains the ruler state while canceling the transfer. @returns Nothing. */
  function cancel(): void {
    onRespond({ accepted: false, fixedSplits: splits });
  }

  /** Switches the source separator mode and grid column cursor. @param next - Mode. @returns Nothing. */
  function selectMode(next: TextImportSeparatorMode): void {
    if (fixed !== (next === "fixed")) setColumn(1);
    setMode(next);
  }

  return (
    <form
      role="dialog"
      aria-label={title}
      aria-modal="true"
      className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[46rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 space-y-3 overflow-y-auto rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
      onSubmit={
        /** Applies the current dialog values. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          event.preventDefault();
          accept();
        }
      }
      onKeyDown={
        /** Closes the active dialog. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            cancel();
          }
        }
      }
    >
      <DialogHeader title={title} onClose={cancel} />
      {!textToColumns && (
        <fieldset className="grid gap-2 rounded border border-slate-200 p-2 sm:grid-cols-3">
          <legend>Import</legend>
          <label className="grid gap-1">
            Character set
            <select className={controlClass} disabled>
              <option>Unicode</option>
            </select>
          </label>
          <label className="grid gap-1">
            Locale
            <select
              className={controlClass + " min-w-0"}
              value={options.eLang}
              onChange={
                /** Selects the locale used to interpret pasted values. @param event - Import control change event. @returns Nothing. */ (
                  event,
                ) => update({ eLang: Number(event.currentTarget.value) })
              }
            >
              <option value={LANGUAGE_SYSTEM}>{describeLanguage(LANGUAGE_SYSTEM)}</option>
              {languages.map(
                /** Renders the `id` option for the source entry. @param entry - Source entry. @returns Rendered element. */ ({
                  id,
                  name,
                }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="grid gap-1">
            From row
            <input
              type="number"
              min={1}
              className={controlClass + " w-20"}
              value={options.nStartRow}
              onChange={
                /** Sets the first import row with a lower bound of one. @param event - Import control change event. @returns Nothing. */ (
                  event,
                ) => update({ nStartRow: Math.max(1, Number(event.currentTarget.value)) })
              }
            />
          </label>
        </fieldset>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <fieldset className="space-y-2 rounded border border-slate-200 p-2">
          <legend>Separator Options</legend>
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["detected", `Detected (${detectedLabel || "- none -"})`],
                ["separated", "Separated by"],
                ["fixed", "Fixed width"],
              ] as const
            ).map(
              /** Renders one label for the source entry. @param entry - Source entry. @returns Rendered element. */ ([
                value,
                label,
              ]) => (
                <label key={value} className="flex items-center gap-1">
                  <input
                    autoFocus={value === mode}
                    type="radio"
                    name="separator-mode"
                    checked={mode === value}
                    onChange={
                      /** Changes the active mode. @returns Nothing. */ () => selectMode(value)
                    }
                  />
                  {label}
                </label>
              ),
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {separators.map(
              /** Renders one label for the source entry. @param entry - Source entry. @returns Rendered element. */ ([
                key,
                label,
              ]) => (
                <label key={key} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    disabled={mode !== "separated"}
                    checked={options.aFieldSeps.includes(key)}
                    onChange={
                      /** Updates `aFieldSeps`. @param event - Control change event. @returns Nothing. */ (
                        event,
                      ) =>
                        update({
                          aFieldSeps: event.currentTarget.checked
                            ? options.aFieldSeps + key
                            : options.aFieldSeps.replaceAll(key, ""),
                        })
                    }
                  />
                  {label}
                </label>
              ),
            )}
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={otherEnabled}
                disabled={mode !== "separated"}
                onChange={
                  /** Updates the other enabled. @param event - Control change event. @returns Nothing. */ (
                    event,
                  ) => setOtherEnabled(event.currentTarget.checked)
                }
              />
              Other
            </label>
            <input
              aria-label="Other separators"
              className={controlClass + " w-14"}
              disabled={mode !== "separated" || !otherEnabled}
              value={otherSeparators}
              onChange={
                /** Updates `aFieldSeps`. @param event - Control change event. @returns Nothing. */ (
                  event,
                ) =>
                  update({
                    aFieldSeps: selectedSeparators.join("") + event.currentTarget.value,
                  })
              }
            />
          </div>
          <label className="flex items-center gap-2">
            String delimiter
            <input
              className={controlClass + " w-14"}
              disabled={fixed}
              maxLength={1}
              value={options.cTextSep === "\0" ? "" : options.cTextSep}
              onChange={
                /** Sets the text delimiter or clears it for an empty control. @param event - Import control change event. @returns Nothing. */ (
                  event,
                ) => update({ cTextSep: event.currentTarget.value || "\0" })
              }
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={fixed}
              checked={options.bMergeFieldSeps}
              onChange={
                /** Enables or disables merging adjacent separators. @param event - Import control change event. @returns Nothing. */ (
                  event,
                ) => update({ bMergeFieldSeps: event.currentTarget.checked })
              }
            />
            Merge delimiters
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={fixed}
              checked={options.bRemoveSpace}
              onChange={
                /** Updates trimming of leading and trailing spaces. @param event - Import control change event. @returns Nothing. */ (
                  event,
                ) => update({ bRemoveSpace: event.currentTarget.checked })
              }
            />
            Trim spaces
          </label>
        </fieldset>
        <fieldset className="space-y-2 rounded border border-slate-200 p-2">
          <legend>Other Options</legend>
          {optionControls.map(
            /** Renders one label for the source entry. @param entry - Source entry. @returns Rendered element. */ ([
              key,
              label,
            ]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={
                    (key === "bDetectScientificNumber" && options.bDetectSpecialNumber) ||
                    (textToColumns &&
                      (key === "bDetectSpecialNumber" || key === "bQuotedFieldAsText"))
                  }
                  checked={options[key]}
                  onChange={
                    /** Applies a CSV detection checkbox and its dependency on special-number detection. @param event - Checkbox change event. @returns Nothing. */ (
                      event,
                    ) => {
                      const checked = event.currentTarget.checked;
                      update(
                        key === "bDetectSpecialNumber" && checked
                          ? { bDetectSpecialNumber: true, bDetectScientificNumber: true }
                          : { [key]: checked },
                      );
                    }
                  }
                />
                {label}
              </label>
            ),
          )}
        </fieldset>
      </div>
      <fieldset className="space-y-2 rounded border border-slate-200 p-2">
        <legend>Fields</legend>
        <label className="flex items-center gap-2">
          Column type
          <select
            className={controlClass}
            value={type}
            onChange={
              /** Updates the type. @param event - Control change event. @returns Nothing. */ (
                event,
              ) => setType(Number(event.currentTarget.value))
            }
          >
            {columnTypes.map(
              /** Renders the `value` option for the source entry. @param entry - Source entry. @returns Rendered element. */ ([
                value,
                label,
              ]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>
        <div className="max-h-32 overflow-auto">
          {fixed && <ScCsvRuler width={rulerWidth} splits={splits} onChange={setSplits} />}
          <table
            aria-label="Import preview"
            className={`border-collapse text-left ${fixed ? "table-fixed font-mono" : "w-full"}`}
            style={fixed ? { width: `${rulerWidth}ch` } : undefined}
          >
            {fixed && (
              <colgroup>
                {fixedStarts.map(
                  /** Renders one col for the source entry. @param start - Source entry. @param index - Entry index. @returns Rendered element. */ (
                    start,
                    index,
                  ) => (
                    <col
                      key={start}
                      style={{
                        width: `${(fixedStarts[index + 1] ?? rulerWidth) - start}ch`,
                      }}
                    />
                  ),
                )}
              </colgroup>
            )}
            <thead>
              <tr>
                {Array.from(
                  { length: width },
                  /** Renders one th for the source entry. @param _ - Source entry. @param index - Entry index. @returns Rendered element. */ (
                    _,
                    index,
                  ) => (
                    <th key={index} className="border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        className="w-full overflow-hidden px-1 py-1 text-left aria-pressed:bg-sky-100"
                        aria-pressed={currentColumn === index + 1}
                        onClick={
                          /** Updates the column. @returns Nothing. */ () => setColumn(index + 1)
                        }
                      >
                        {index + 1}
                      </button>
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(
                /** Renders one tr for the source entry. @param row - Source entry. @param index - Entry index. @returns Rendered element. */ (
                  row,
                  index,
                ) => (
                  <tr key={index}>
                    {Array.from(
                      { length: width },
                      /** Renders one td for the source entry. @param _ - Source entry. @param field - Entry index. @returns Rendered element. */ (
                        _,
                        field,
                      ) => (
                        <td
                          key={field}
                          className={`border border-slate-200 py-1 ${fixed ? "overflow-hidden whitespace-pre font-mono" : "px-2"}`}
                        >
                          {row[field] ?? ""}
                        </td>
                      ),
                    )}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </fieldset>
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonClass + " mr-auto"} disabled>
          Help
        </button>
        <button type="button" className={buttonClass} onClick={cancel}>
          Cancel
        </button>
        <button type="submit" className={buttonClass}>
          OK
        </button>
      </div>
    </form>
  );
}
