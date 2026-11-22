/** @fileoverview Native HTML host for the Calc contribution to the Options tree. */
import { useReducer, useState } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { ScCalcConfig } from "../../../source/core/tool/calcconfig";
import { calcNullDates, type ScTpCalcOptions } from "../../../source/ui/optdlg/tpcalc";
import { calcFormulaSyntaxes, type ScTpFormulaOptions } from "../../../source/ui/optdlg/tpformula";

const buttonClass = "rounded border border-slate-300 px-3 py-1";
const inputClass = "rounded border border-slate-300 px-2 py-1";
const groupClass = "space-y-2 rounded border border-slate-200 px-3 pb-3";
const criteria = [
  ["wildcards", "Enable wildcards in formulas"],
  ["regexp", "Enable regular expressions in formulas"],
  ["literal", "No wildcards or regular expressions in formulas"],
] as const;
/** Pages contributed by Calc to the Options tree. */
type Page = "Calculate" | "Formula";

/** Options request with drafts and native modal responses. */
interface Props {
  readonly calculate: ScTpCalcOptions;
  readonly formula: ScTpFormulaOptions;
  readonly onCancel: () => void;
  readonly onAccept: () => void;
}

/** Shows the source Calc tree, page reset, and standard modal responses. @param props - Draft pages and responses. @returns Options dialog. */
export function ScCalcOptionsDialog({
  calculate,
  formula,
  onCancel,
  onAccept,
}: Props): React.JSX.Element {
  const [page, setPage] = useState<Page>("Calculate");
  const [error, setError] = useState("");
  const [details, setDetails] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  const title = "Options";

  /** Keeps the Calculate page visible on an invalid increment. @returns Whether to proceed. */
  function validate(): boolean {
    const next = calculate.Validate();
    setError(next);
    if (next) {
      setPage("Calculate");
      setExpanded(true);
    }
    return !next;
  }

  return (
    <>
      <form
        role="dialog"
        aria-label={title}
        aria-modal={!details}
        inert={details}
        className="fixed left-1/2 top-1/2 z-50 w-[52rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
        noValidate
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (validate()) onAccept();
        }}
      >
        <DialogHeader title={title} onClose={onCancel} />
        <div className="grid max-h-[70vh] grid-cols-[minmax(7rem,1fr)_3fr] gap-3 overflow-auto">
          <div
            role="tree"
            aria-label="Options categories"
            className="rounded border border-slate-200 p-2"
          >
            <div role="treeitem" aria-expanded={expanded}>
              <button
                type="button"
                aria-label="LibreOffice Calc"
                autoFocus
                className="rounded px-1 text-left font-medium"
                onClick={() => setExpanded(!expanded)}
              >
                <span aria-hidden="true">{expanded ? "▾" : "▸"} </span>LibreOffice Calc
              </button>
              {expanded && (
                <div role="group" className="ml-3 space-y-1">
                  {(["Calculate", "Formula"] as const).map((name) => (
                    <button
                      key={name}
                      type="button"
                      role="treeitem"
                      aria-selected={name === page}
                      className="block w-full rounded px-1 text-left aria-selected:bg-slate-100"
                      onClick={() => {
                        if (name !== page && validate()) setPage(name);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="min-w-0 space-y-2">
            {page === "Calculate" ? (
              <CalculatePage model={calculate} refresh={refresh} error={error} />
            ) : (
              <>
                <fieldset className={groupClass}>
                  <legend className="font-medium">Formula Options</legend>
                  <label className="block">
                    Formula syntax:{" "}
                    <select
                      value={formula.syntax}
                      className={inputClass}
                      onChange={(event) => {
                        formula.SetSyntax(Number(event.target.value));
                        refresh();
                      }}
                    >
                      {calcFormulaSyntaxes.map(({ label }, index) => (
                        <option key={label} value={index}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Check
                    checked={formula.english}
                    set={(checked) => {
                      formula.SetEnglish(checked);
                      refresh();
                    }}
                  >
                    Use English function names
                  </Check>
                </fieldset>
                <fieldset className={groupClass}>
                  <legend className="font-medium">Detailed Calculation Settings</legend>
                  <Radio
                    name="formula-settings"
                    checked={!formula.custom}
                    select={() => {
                      formula.SetCustom(false);
                      refresh();
                    }}
                  >
                    Default settings
                  </Radio>
                  <Radio
                    name="formula-settings"
                    checked={formula.custom}
                    select={() => {
                      formula.SetCustom(true);
                      refresh();
                    }}
                  >
                    Custom (conversion of text to numbers and more):
                  </Radio>
                  <button
                    type="button"
                    className={buttonClass}
                    disabled={!formula.custom}
                    onClick={() => setDetails(true)}
                  >
                    Details…
                  </button>
                </fieldset>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className={buttonClass}
            onClick={() => {
              if (page === "Calculate") calculate.Reset();
              else formula.Reset();
              setError("");
              refresh();
            }}
          >
            Reset
          </button>
          <button type="button" className={buttonClass} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={buttonClass}>
            OK
          </button>
        </div>
      </form>
      {details && <FormulaDetails model={formula} close={() => setDetails(false)} />}
    </>
  );
}

/** Renders the original Calculate groups. @param props - Page draft, validation and refresh callback. @returns Calculate page. */
function CalculatePage({
  model,
  refresh,
  error,
}: {
  model: ScTpCalcOptions;
  refresh: () => void;
  error: string;
}): React.JSX.Element {
  const values = model.values;
  const year: [number] = [0];
  values.GetDate([0], [0], year);
  const dateIndex = year[0] === 1900 ? 1 : year[0] === 1904 ? 2 : 0;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <fieldset className={groupClass}>
        <legend className="font-medium">General Calculations</legend>
        <Check
          checked={!values.IsIgnoreCase()}
          set={(value) => {
            values.SetIgnoreCase(!value);
            refresh();
          }}
        >
          Case sensitive
        </Check>
        <Check
          checked={values.IsCalcAsShown()}
          set={(value) => {
            values.SetCalcAsShown(value);
            refresh();
          }}
        >
          Precision as shown
        </Check>
        <Check
          checked={values.IsMatchWholeCell()}
          set={(value) => {
            values.SetMatchWholeCell(value);
            refresh();
          }}
        >
          Search criteria = and &lt;&gt; must apply to whole cells
        </Check>
        <Check
          checked={values.IsLookUpColRowNames()}
          set={(value) => {
            values.SetLookUpColRowNames(value);
            refresh();
          }}
        >
          Automatically find column and row labels
        </Check>
        <Check
          checked={model.limitDecimals}
          set={(value) => {
            model.SetLimitDecimals(value);
            refresh();
          }}
        >
          Limit decimals for general number format
        </Check>
        <label className="flex items-center gap-2">
          Decimal places
          <input
            type="number"
            min={0}
            max={20}
            className={`${inputClass} w-16`}
            value={model.decimalPlaces}
            disabled={!model.limitDecimals}
            onChange={(event) => {
              model.SetDecimalPlaces(event.target.value);
              refresh();
            }}
          />
        </label>
      </fieldset>
      <fieldset className={groupClass}>
        <legend className="font-medium">Iterative References</legend>
        <Check
          checked={values.IsIter()}
          set={(value) => {
            values.SetIter(value);
            refresh();
          }}
        >
          Iterations
        </Check>
        <label className="flex items-center gap-2">
          Steps
          <input
            type="number"
            min={1}
            max={32767}
            className={`${inputClass} w-20`}
            value={model.steps}
            disabled={!values.IsIter()}
            onChange={(event) => {
              model.SetSteps(event.target.value);
              refresh();
            }}
          />
        </label>
        <label className="flex items-center gap-2">
          Minimum change
          <input
            type="number"
            step="any"
            className={`${inputClass} w-24`}
            value={model.minimumChange}
            disabled={!values.IsIter()}
            aria-invalid={Boolean(error)}
            onChange={(event) => {
              model.SetMinimumChange(event.target.value);
              refresh();
            }}
          />
        </label>
        {error && (
          <p role="alert" className="text-red-700">
            {error}
          </p>
        )}
      </fieldset>
      <fieldset className={groupClass}>
        <legend className="font-medium">Date</legend>
        {calcNullDates.map(({ day, month, year, label }, index) => (
          <Radio
            key={year}
            name="date"
            checked={dateIndex === index}
            select={() => {
              values.SetDate(day, month, year);
              refresh();
            }}
          >
            {label}
          </Radio>
        ))}
      </fieldset>
      <fieldset className={groupClass}>
        <legend className="font-medium">Formulas Wildcards</legend>
        {criteria.map(([mode, label]) => (
          <Radio
            key={mode}
            name="criteria"
            checked={model.GetCriteriaMode() === mode}
            select={() => {
              model.SetCriteriaMode(mode);
              refresh();
            }}
          >
            {label}
          </Radio>
        ))}
      </fieldset>
    </div>
  );
}

const referenceSyntaxes = [
  [FormulaGrammar.AddressConvention.CONV_UNSPECIFIED, "Use formula syntax"],
  ...calcFormulaSyntaxes.map(({ convention, label }) => [convention, label] as const),
  [FormulaGrammar.AddressConvention.CONV_A1_XL_A1, "Calc A1 | Excel A1"],
] as const;
const conversions = [
  "Generate #VALUE! error",
  "Treat as zero",
  "Convert only if unambiguous",
  "Convert also locale dependent",
];

/** Stages the source child dialog edits independently of the parent. @param props - Page and close response. @returns Calculation details. */
function FormulaDetails({
  model,
  close,
}: {
  model: ScTpFormulaOptions;
  close: () => void;
}): React.JSX.Element {
  const config = model.config;
  const [onlyDocument, setOnlyDocument] = useState(!model.writeConfig);
  const [conversion, setConversion] = useState(config.meStringConversion);
  const [empty, setEmpty] = useState(config.mbEmptyStringAsZero);
  const [syntax, setSyntax] = useState(config.meStringRefAddressSyntax);
  const { ILLEGAL, ZERO } = ScCalcConfig.StringConversion;
  const title = "Detailed Calculation Settings";
  return (
    <form
      role="dialog"
      aria-label={title}
      aria-modal="true"
      className="fixed left-1/2 top-1/2 z-[51] w-[25rem] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 space-y-3 rounded-lg border border-slate-300 bg-white p-4 text-sm shadow-xl"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
      onSubmit={(event) => {
        event.preventDefault();
        model.SetDetailedSettings(conversion, empty, syntax, onlyDocument);
        close();
      }}
    >
      <DialogHeader title={title} onClose={close} />
      <fieldset className={groupClass}>
        <legend className="font-medium">Contents to Numbers</legend>
        <label className="block">
          Conversion from text to number
          <select
            autoFocus
            value={conversion}
            className={`block ${inputClass}`}
            onChange={(event) => setConversion(Number(event.target.value))}
          >
            {conversions.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Check
          disabled={conversion === ILLEGAL || conversion === ZERO}
          checked={conversion === ZERO || (conversion !== ILLEGAL && empty)}
          set={setEmpty}
        >
          Treat empty string as zero
        </Check>
        <label className="block">
          Reference syntax for string reference
          <select
            value={syntax}
            className={`block ${inputClass}`}
            onChange={(event) => setSyntax(Number(event.target.value) as AddressConvention)}
          >
            {referenceSyntaxes.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <Check checked={onlyDocument} set={setOnlyDocument}>
          Apply those settings to current document only
        </Check>
      </fieldset>
      <div className="flex justify-end gap-2">
        <button type="button" className={buttonClass} onClick={close}>
          Cancel
        </button>
        <button type="submit" className={buttonClass}>
          OK
        </button>
      </div>
    </form>
  );
}

/** Binds an original check button to a native HTML checkbox. @param props - Caption, state and change handler. @returns Labeled checkbox. */
function Check({
  checked,
  disabled,
  set,
  children,
}: {
  checked: boolean;
  disabled?: boolean;
  set: (value: boolean) => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => set(event.target.checked)}
      />
      {children}
    </label>
  );
}

/** Binds an original radio control to its native HTML group. @param props - Caption, group and selection callback. @returns Labeled radio button. */
function Radio({
  name,
  checked,
  select,
  children,
}: {
  name: string;
  checked: boolean;
  select: () => void;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <label className="flex items-center gap-2">
      <input type="radio" name={name} checked={checked} onChange={select} />
      {children}
    </label>
  );
}
