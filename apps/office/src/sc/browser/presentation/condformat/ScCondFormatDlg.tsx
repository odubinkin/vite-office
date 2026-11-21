/** @fileoverview Browser view of the original conditional format rule list and range edit. */
import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref } from "react";
import { DialogHeader } from "../../../../framework/browser/presentation/DialogHeader";
import { ScRange, type ScAddress } from "../../../inc/address";
import { ScColorScaleEntryType } from "../../../source/core/data/colorscale";
import {
  FormatConditionalRange,
  ParseConditionalRanges,
  type ScCondFormatDlg as Model,
  type ConditionalFormatResult,
} from "../../../source/ui/condformat/condformatdlg";
import {
  conditionChoices,
  dataBarChoices,
  dateChoices,
  scaleChoices,
  ConditionOperands,
  type ConditionalRuleDraft,
  type ConditionalRuleKind,
} from "../../../source/ui/condformat/condformatdlgentry";
import type { ScPrintReferenceInput } from "../ScPrintAreasDlg";

const control = "min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1";
const ruleKinds = [
  ["scale3", "All Cells"],
  ["condition", "Cell value"],
  ["formula", "Formula is"],
  ["date", "Date is"],
] as const;

const scaleKinds = [
  ["scale2", "Color Scale (2 Entries)"],
  ["scale3", "Color Scale (3 Entries)"],
  ["databar", "Data Bar"],
] as const;

/** Recognizes the native All Cells rule pages. @param kind - Current page. @returns Whether it shows threshold controls. */
function isColorFormat(kind: ConditionalRuleKind): boolean {
  return kind === "scale2" || kind === "scale3" || kind === "databar";
}

/** Original editor callbacks and reference-input binding. */
interface Props {
  readonly model: Model;
  readonly referenceInput: Ref<ScPrintReferenceInput>;
  readonly onReference: (range: ScRange | undefined) => void;
  readonly onSubmit: (result: ConditionalFormatResult) => void;
  readonly onCancel: () => void;
}

/** Presents original rule activation, ordering, range entry, and acceptance. @param props - Source editor and callbacks. @returns Browser reference dialog. */
export function ScCondFormatDlg({
  model,
  referenceInput,
  onReference,
  onSubmit,
  onCancel,
}: Props): React.JSX.Element {
  const [rules, setRules] = useState([...model.rules]);
  const [selected, setSelected] = useState(0);
  const [range, setRange] = useState(model.rangeText);
  const [collapsed, setCollapsed] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const [activeField, setActiveField] = useState<"range" | "first" | "second">("range");
  const gesture = useRef<{
    anchor: ScAddress;
    kind: Parameters<ScPrintReferenceInput["Start"]>[1];
    prefix: string;
    suffix: string;
    index: number;
    field: typeof activeField;
  }>(undefined);
  const current = rules[selected];
  const easy = model.easyMode !== undefined;
  const title = easy ? "Highlight cells…" : "Conditional Formatting for " + range;

  useLayoutEffect(() => {
    field.current?.focus();
    field.current?.select();
  }, []);

  /** Replaces one rule card's edited values. @param index - Current rule number. @param draft - Entered values. @returns Nothing. */
  function change(index: number, draft: ConditionalRuleDraft): void {
    setRules((previous) => previous.map((rule, entry) => (entry === index ? draft : rule)));
  }

  /** Moves the selected original entry within the ordered list. @param offset - Move direction. @returns Nothing. */
  function move(offset: number): void {
    const next = selected + offset;
    if (!current || next < 0 || next >= rules.length) return;
    const reordered = [...rules];
    reordered.splice(selected, 1);
    reordered.splice(next, 0, current);
    setRules(reordered);
    setSelected(next);
  }

  /** Updates the active edit field and paints the pointed-to native range. @param position - Grid endpoint. @returns Nothing. */
  function pick(position: ScAddress): void {
    const drag = gesture.current;
    if (!drag) return;
    const rows = drag.kind === "row" || drag.kind === "all";
    const cols = drag.kind === "column" || drag.kind === "all";
    const area = new ScRange(
      rows ? 0 : drag.anchor.Col(),
      cols ? 0 : drag.anchor.Row(),
      model.tab,
      rows ? model.document.MaxCol() : position.Col(),
      cols ? model.document.MaxRow() : position.Row(),
      model.tab,
    );
    area.PutInOrder();
    const value = drag.prefix + FormatConditionalRange(area, model.document) + drag.suffix;
    if (drag.field === "range") setRange(value);
    else {
      const rule = rules[drag.index];
      if (rule) change(drag.index, { ...rule, [drag.field]: value });
    }
    onReference(area);
  }

  useImperativeHandle(referenceInput, () => ({
    /** Starts selecting cells for the original active reference field. @param position - Initial cell. @param kind - Original grid surface. @param append - Whether the modifier extends the range list. @returns Nothing. */
    Start(position, kind, append) {
      const fieldKind = activeField;
      const element = document.activeElement;
      const actual =
        element instanceof HTMLInputElement && element.dataset.reference === fieldKind
          ? element
          : undefined;
      const value = fieldKind === "range" ? range : (current?.[fieldKind] ?? "");
      const appendRange = append && fieldKind === "range" && value.length > 0;
      const start = appendRange ? value.length : (actual?.selectionStart ?? 0);
      const end = appendRange ? value.length : (actual?.selectionEnd ?? value.length);
      gesture.current = {
        anchor: position,
        kind,
        field: fieldKind,
        index: selected,
        prefix: value.slice(0, start) + (appendRange ? ";" : ""),
        suffix: value.slice(end),
      };
      pick(position);
    },
    Move: pick,
    /** Finishes the current native reference drag. @returns Nothing. */
    End() {
      gesture.current = undefined;
    },
  }));

  const validRange = !rules.length || !!ParseConditionalRanges(range, model.document, model.tab);

  return (
    <form
      role="dialog"
      aria-label={title}
      data-office-modal-panel="true"
      className="office-dialog-form fixed right-4 top-4 z-[60] w-[min(38rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        if (collapsed) {
          setCollapsed(false);
          return;
        }
        const result = model.CreateResult(range, rules);
        if (result) onSubmit(result);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          if (collapsed) setCollapsed(false);
          else onCancel();
        }
      }}
    >
      <DialogHeader title={title} onClose={onCancel} />
      <div className="office-dialog-content grid gap-3 text-sm">
        {!collapsed && (
          <>
            <fieldset className="grid max-h-[44vh] gap-2 overflow-y-auto">
              <legend className="mb-1 font-semibold">
                {easy
                  ? "Cell value " +
                    (conditionChoices.find(([mode]) => mode === model.easyMode)?.[1] ?? "")
                  : "Conditions"}
              </legend>
              {rules.map((rule, index) => (
                <div key={index} className="grid gap-2 rounded-md border border-slate-200 p-2">
                  {!easy && (
                    <button
                      type="button"
                      className="text-left font-medium"
                      aria-expanded={index === selected}
                      onClick={() => setSelected(index)}
                    >
                      {index + 1}.{" "}
                      {
                        [...ruleKinds, ...scaleKinds]
                          .filter(([kind]) => kind === rule.kind)
                          .at(-1)?.[1]
                      }
                    </button>
                  )}
                  {index === selected && (
                    <>
                      {!easy && (
                        <select
                          aria-label="Rule type"
                          className={control}
                          value={isColorFormat(rule.kind) ? "scale3" : rule.kind}
                          onChange={(event) =>
                            change(index, model.NewRule(event.target.value as ConditionalRuleKind))
                          }
                        >
                          {ruleKinds.map(([kind, caption]) => (
                            <option key={kind} value={kind}>
                              {caption}
                            </option>
                          ))}
                        </select>
                      )}
                      {isColorFormat(rule.kind) && (
                        <select
                          aria-label="Color format"
                          className={control}
                          value={rule.kind}
                          onChange={(event) =>
                            change(index, model.NewRule(event.target.value as ConditionalRuleKind))
                          }
                        >
                          {scaleKinds.map(([kind, label]) => (
                            <option key={kind} value={kind}>
                              {label}
                            </option>
                          ))}
                        </select>
                      )}
                      {!easy && rule.kind === "condition" && (
                        <select
                          aria-label="Condition"
                          className={control}
                          value={rule.mode}
                          onChange={(event) =>
                            change(index, { ...rule, mode: Number(event.target.value) })
                          }
                        >
                          {conditionChoices.map(([mode, caption]) => (
                            <option key={mode} value={mode}>
                              {caption}
                            </option>
                          ))}
                        </select>
                      )}
                      {rule.kind === "date" && (
                        <select
                          aria-label="Date"
                          className={control}
                          value={rule.date}
                          onChange={(event) =>
                            change(index, { ...rule, date: Number(event.target.value) })
                          }
                        >
                          {dateChoices.map(([type, caption]) => (
                            <option key={type} value={type}>
                              {caption}
                            </option>
                          ))}
                        </select>
                      )}
                      {(rule.kind === "formula" || rule.kind === "condition") &&
                        (["first", "second"] as const)
                          .slice(0, rule.kind === "formula" ? 1 : ConditionOperands(rule.mode))
                          .map((part, operand) => (
                            <input
                              key={part}
                              data-reference={part}
                              aria-label={
                                rule.kind === "formula" ? "Formula" : "Value " + (operand + 1)
                              }
                              className={control}
                              value={rule[part]}
                              onFocus={() => {
                                setActiveField(part);
                              }}
                              onChange={(event) =>
                                change(index, { ...rule, [part]: event.target.value })
                              }
                            />
                          ))}
                      {isColorFormat(rule.kind) ? (
                        <div className="grid gap-2">
                          {rule.stops.map((stop, number) => {
                            const bar = rule.kind === "databar";
                            const choices = bar
                              ? dataBarChoices.filter(
                                  ([type]) =>
                                    type === stop.type ||
                                    type !==
                                      (number === 0
                                        ? ScColorScaleEntryType.MAX
                                        : ScColorScaleEntryType.MIN),
                                )
                              : scaleChoices;
                            const label =
                              number === 0
                                ? "Minimum"
                                : number === rule.stops.length - 1
                                  ? "Maximum"
                                  : "Middle";
                            const update = (replacement: typeof stop) =>
                              change(index, {
                                ...rule,
                                stops: rule.stops.map((value, i) =>
                                  i === number ? replacement : value,
                                ),
                              });
                            return (
                              <div key={label} className="grid grid-cols-[1fr_1fr_auto] gap-1">
                                <select
                                  aria-label={label + " type"}
                                  value={stop.type}
                                  className={control}
                                  onChange={(event) =>
                                    update({ ...stop, type: Number(event.target.value) })
                                  }
                                >
                                  {choices.map(([type, caption]) => (
                                    <option key={type} value={type}>
                                      {caption}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  aria-label={label + " value"}
                                  className={control}
                                  value={stop.value}
                                  disabled={
                                    stop.type === ScColorScaleEntryType.AUTO ||
                                    stop.type === ScColorScaleEntryType.MIN ||
                                    stop.type === ScColorScaleEntryType.MAX
                                  }
                                  onChange={(event) =>
                                    update({ ...stop, value: event.target.value })
                                  }
                                />
                                {!bar && (
                                  <input
                                    type="color"
                                    aria-label={label + " color"}
                                    value={stop.color}
                                    onChange={(event) =>
                                      update({ ...stop, color: event.target.value })
                                    }
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <label className="grid gap-1">
                          Apply Style
                          <select
                            className={control}
                            value={rule.style}
                            onChange={(event) =>
                              change(index, { ...rule, style: event.target.value })
                            }
                          >
                            {[...new Set([...model.styles, rule.style])].map((style) => (
                              <option key={style}>{style}</option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}
                </div>
              ))}
            </fieldset>
            {!easy && (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className="office-dialog-secondary"
                  onClick={() => {
                    setRules([...rules, model.NewRule("condition")]);
                    setSelected(rules.length);
                  }}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="office-dialog-secondary"
                  disabled={!current}
                  onClick={() => {
                    setRules(rules.filter((_, index) => index !== selected));
                    setSelected(Math.max(0, Math.min(selected, rules.length - 2)));
                  }}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="office-dialog-secondary"
                  disabled={selected <= 0 || !current}
                  onClick={() => move(-1)}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="office-dialog-secondary"
                  disabled={selected >= rules.length - 1}
                  onClick={() => move(1)}
                >
                  Down
                </button>
              </div>
            )}
          </>
        )}
        <div className="flex items-end gap-2">
          <label className="grid min-w-0 flex-1 gap-1">
            Range
            <input
              ref={field}
              data-reference="range"
              className={control}
              value={range}
              aria-invalid={!validRange}
              onFocus={() => {
                setActiveField("range");
              }}
              onChange={(event) => setRange(event.target.value)}
            />
          </label>
          <button
            className="office-dialog-secondary"
            type="button"
            aria-pressed={collapsed}
            onClick={() => {
              setActiveField("range");
              setCollapsed(!collapsed);
            }}
          >
            {collapsed ? "Expand" : "Select Range"}
          </button>
        </div>
      </div>
      {!collapsed && (
        <div className="office-dialog-actions">
          <button className="office-dialog-secondary mr-auto" type="button" disabled>
            Help
          </button>
          <button className="office-dialog-secondary" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="office-dialog-primary" type="submit" disabled={!validRange}>
            OK
          </button>
        </div>
      )}
    </form>
  );
}
