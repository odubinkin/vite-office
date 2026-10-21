/** @fileoverview Browser text/spin presentation of the actual weld metric parser and normalized numeric owner. */
import {
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type InputHTMLAttributes,
} from "react";
import { MetricSpinBinding } from "./metric-spin-binding";
import { FieldUnit } from "../../../tools/inc/fldunit";
import {
  getSystemDecimalSeparator,
  getSystemDecimalSeparatorAlternate,
} from "../../../unotools/source/misc/syslocale";

/** Physical twip binding;the browser adapter retains editable text and the actual native numeric owner. */
export interface MetricSpinButtonProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "min" | "max" | "step"
> {
  readonly value: number | undefined;
  readonly onValueChange: (twips: number) => void;
  readonly unit?: FieldUnit;
  readonly minimum?: number;
  readonly maximum?: number;
  /** Native page Reset/assignment identity;ordinary twip notifications do not reset normalized input. */
  readonly resetKey?: unknown;
}

/** Presents native unit suffix entry without rounding untouched physical values back into the document. @param props - Twip binding,display unit and native bounds. @returns Metric entry. */
export function MetricSpinButton({
  value,
  onValueChange,
  unit = FieldUnit.CM,
  minimum = 0,
  maximum = 2147483647,
  resetKey,
  disabled = false,
  onBlur,
  onKeyDown,
  ...attributes
}: MetricSpinButtonProps): React.JSX.Element {
  const decimal = getSystemDecimalSeparator(),
    alternate = getSystemDecimalSeparatorAlternate();
  const input = useRef<HTMLInputElement>(null);
  const [binding] = useState(
    /** Creates the native owner once for this mounted entry. @returns Binding. */ () =>
      new MetricSpinBinding({ value, unit, minimum, maximum, decimal, alternate, resetKey }),
  );
  useLayoutEffect(
    /** Applies genuine native parent assignments before paint;feedback keeps normalized precision. @returns Nothing. */ () => {
      binding.Update({ value, unit, minimum, maximum, decimal, alternate, resetKey });
    },
    [binding, value, unit, minimum, maximum, decimal, alternate, resetKey],
  );
  const snapshot = useSyncExternalStore(
    binding.Subscribe,
    binding.GetSnapshot,
    binding.GetSnapshot,
  );
  return (
    <span className="inline-flex min-w-0 items-stretch">
      <input
        ref={input}
        disabled={disabled}
        {...attributes}
        type="text"
        role="spinbutton"
        inputMode="decimal"
        aria-valuemin={snapshot.minimum}
        aria-valuemax={snapshot.maximum}
        aria-valuenow={snapshot.value}
        aria-valuetext={snapshot.text}
        value={snapshot.text}
        onChange={
          /** Retains incomplete input and forwards only parsed values. @param event - Text edit. @returns Nothing. */ (
            event,
          ) => {
            const result = binding.SetText(event.target.value);
            if (result !== undefined) onValueChange(result);
          }
        }
        onBlur={
          /** Restores native formatting without rewriting untouched geometry. @param event - Focus departure. @returns Nothing. */ (
            event,
          ) => {
            binding.CommitText();
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
            onValueChange(
              binding.Step(
                key === "ArrowDown" || key === "PageDown" ? -1 : 1,
                key === "PageUp" || key === "PageDown",
              ),
            );
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
                snapshot.value === undefined ||
                (direction > 0n
                  ? snapshot.value >= snapshot.maximum
                  : snapshot.value <= snapshot.minimum)
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
                  onValueChange(binding.Step(direction > 0n ? 1 : -1));
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
