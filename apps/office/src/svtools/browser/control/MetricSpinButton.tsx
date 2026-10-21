/** @fileoverview Browser text/spin presentation of the actual weld metric parser and normalized numeric owner. */
import { useRef, useState, type InputHTMLAttributes } from "react";
import { MetricSpinButton as NativeMetricSpinButton } from "../../../vcl/source/weld/MetricSpinButton";
import { SetFieldUnit } from "../../source/misc/unitconv";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SV_FUNIT_STRINGS } from "../../../vcl/inc/units";
import {
  getSystemDecimalSeparator,
  getSystemDecimalSeparatorAlternate,
} from "../../../unotools/source/misc/syslocale";

/** Physical twip binding;only temporary editable text belongs to React. */
export interface MetricSpinButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> {
  readonly value: number | undefined;
  readonly onValueChange: (twips: number) => void;
  readonly unit?: FieldUnit;
  readonly minimum?: number;
  readonly maximum?: number;
}

/** Presents native unit suffix entry without rounding untouched physical values back into the document. @param props - Twip binding,display unit and native bounds. @returns Metric entry. */
export function MetricSpinButton({
  value,
  onValueChange,
  unit = FieldUnit.CM,
  minimum = 0,
  maximum = 2147483647,
  disabled = false,
  onBlur,
  onKeyDown,
  ...attributes
}: MetricSpinButtonProps): React.JSX.Element {
  const decimal = getSystemDecimalSeparator(),
    alternate = getSystemDecimalSeparatorAlternate();
  const input = useRef<HTMLInputElement>(null);
  const model = new NativeMetricSpinButton();
  model.set_digits(2);
  model.set_range(
    model.normalize(BigInt(minimum)),
    model.normalize(BigInt(maximum)),
    FieldUnit.TWIP,
  );
  SetFieldUnit(model, unit);
  const displayUnit = model.get_unit();
  const scale = 10 ** model.get_digits();
  if (value !== undefined)
    model.set_value(model.normalize(BigInt(Math.round(value))), FieldUnit.TWIP);
  /** Formats the native display value with the original first resource alias. @returns Metric text. */
  function format(): string {
    const suffix = SV_FUNIT_STRINGS.find(
      /** Locates the source's first display alias. @param entry - Resource pair. @returns Matching unit. */
      (entry) => entry[1] === displayUnit,
    )?.[0];
    return (
      (Number(model.get_value(FieldUnit.NONE)) / scale)
        .toFixed(model.get_digits())
        .replace(".", decimal) +
      (suffix === undefined
        ? ""
        : (displayUnit === FieldUnit.INCH ||
          displayUnit === FieldUnit.NONE ||
          displayUnit === FieldUnit.DEGREE
            ? ""
            : " ") + suffix)
    );
  }
  const [edit, setEdit] = useState({
    source: value,
    unit,
    text: value === undefined ? "" : format(),
  });
  const text =
    edit.source === value && edit.unit === unit ? edit.text : value === undefined ? "" : format();
  /** Publishes accepted native twips while retaining the user's editable text. @param next - Entry text. @returns Whether native parsing succeeded. */
  function parse(next: string): boolean {
    const accepted = model.set_text(next, decimal, alternate);
    const result = Number(model.denormalize(model.get_value(FieldUnit.TWIP)));
    setEdit({ source: accepted ? result : value, unit, text: next });
    if (accepted) onValueChange(result);
    return accepted;
  }
  /** Applies a normalized native increment after parsing pending input. @param increment - Signed display-unit hundredths. @returns Nothing. */
  function step(increment: bigint): void {
    model.set_text(text, decimal, alternate);
    model.set_value(model.get_value(FieldUnit.NONE) + increment, FieldUnit.NONE);
    const result = Number(model.denormalize(model.get_value(FieldUnit.TWIP)));
    setEdit({ source: result, unit, text: format() });
    onValueChange(result);
  }
  return (
    <span className="inline-flex min-w-0 items-stretch">
      <input
        ref={input}
        disabled={disabled}
        {...attributes}
        type="text"
        role="spinbutton"
        inputMode="decimal"
        aria-valuemin={Number(model.get_range(FieldUnit.NONE)[0]) / scale}
        aria-valuemax={Number(model.get_range(FieldUnit.NONE)[1]) / scale}
        aria-valuenow={
          value === undefined ? undefined : Number(model.get_value(FieldUnit.NONE)) / scale
        }
        aria-valuetext={text}
        value={text}
        onChange={
          /** Retains incomplete input and forwards only parsed values. @param event - Text edit. @returns Nothing. */ (
            event,
          ) => {
            parse(event.target.value);
          }
        }
        onBlur={
          /** Restores native formatting without rewriting untouched geometry. @param event - Focus departure. @returns Nothing. */ (
            event,
          ) => {
            setEdit({ source: value, unit, text: value === undefined ? "" : format() });
            onBlur?.(event);
          }
        }
        onKeyDown={
          /** Applies native configured step and page increments;other keys remain owned by the dialog. @param event - Key event. @returns Nothing. */ (
            event,
          ) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const key = event.key;
            if (!["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(key)) return;
            event.preventDefault();
            const increments = model.get_increments(FieldUnit.NONE);
            const increment =
              key === "PageUp" || key === "PageDown" ? increments[1] : increments[0];
            step(key === "ArrowDown" || key === "PageDown" ? -increment : increment);
          }
        }
      />
      <span className="grid shrink-0 grid-rows-2">
        {([1n, -1n] as const).map(
          /** Presents native increase/decrease buttons. @param direction - Step sign. @returns Spin arrow. */ (
            direction,
          ) => (
            <button
              key={String(direction)}
              type="button"
              tabIndex={-1}
              aria-label={
                (direction > 0n ? "Increase " : "Decrease ") + (attributes["aria-label"] ?? "value")
              }
              disabled={
                disabled ||
                value === undefined ||
                (direction > 0n
                  ? model.get_value(FieldUnit.NONE) >= model.get_range(FieldUnit.NONE)[1]
                  : model.get_value(FieldUnit.NONE) <= model.get_range(FieldUnit.NONE)[0])
              }
              className="border border-slate-300 px-1 text-[9px] leading-none disabled:text-slate-300"
              onMouseDown={
                /** Retains entry focus during native spinner use. @param event - Pointer down. @returns Nothing. */ (
                  event,
                ) => event.preventDefault()
              }
              onClick={
                /** Applies a configured native step in the mounted entry. @returns Nothing. */ () => {
                  (input.current as HTMLInputElement).focus();
                  step(direction * model.get_increments(FieldUnit.NONE)[0]);
                }
              }
            >
              {direction > 0n ? "▴" : "▾"}
            </button>
          ),
        )}
      </span>
    </span>
  );
}
