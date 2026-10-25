/** @fileoverview Controlled browser composition of ScPosWnd and the ScInputWindow formula/OK-cancel input line. Draft and address transitions belong to the input/view controllers. */
import type { SyntheticEvent, FocusEvent } from "react";
import type { KeyboardEvent } from "react";
import { FunctionSquare, Sigma, Equal, X, Check, ChevronDown, type LucideIcon } from "lucide-react";
import {
  officeToolbarButtonClassName,
  officeTextInputClassName,
} from "../../../framework/browser/presentation/office-control-styles";
/** Native input-window action identities, independent of their browser event representation. */
export type CalcInputAction =
  "function" | "sum" | "equals" | "cancel" | "accept" | "expand" | "names";
/** Controller-owned input and command state. */
export interface ScInputWindowProps {
  readonly addressText: string;
  readonly inputText: string;
  readonly editing: boolean;
  readonly enabledActions: ReadonlySet<CalcInputAction>;
  readonly onAddressChange: (value: string) => void;
  readonly onAddressKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onInput: (value: string, selection: readonly [number, number]) => void;
  readonly onInputCommand?: (event: SyntheticEvent<HTMLInputElement>) => void;
  readonly onInputSelection?: (start: number, end: number, text: string) => void;
  readonly onInputFocus: (event: FocusEvent<HTMLInputElement>) => void;
  readonly onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly onAction: (action: CalcInputAction) => void;
}
/** Renders source input-window controls, replacing sum/equals with cancel/accept in native editing mode. @param props - Controlled input-line bindings. @returns Calc formula bar. */
export function ScInputWindow(props: ScInputWindowProps): React.JSX.Element {
  const controls: readonly (readonly [CalcInputAction, string, LucideIcon])[] = props.editing
    ? [
        ["function", "Function Wizard", FunctionSquare],
        ["cancel", "Cancel input", X],
        ["accept", "Accept input", Check],
      ]
    : [
        ["function", "Function Wizard", FunctionSquare],
        ["sum", "Sum", Sigma],
        ["equals", "Formula", Equal],
      ];
  return (
    <div
      role="group"
      aria-label="Formula bar"
      className="flex min-h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700"
    >
      <input
        aria-label="Name Box"
        value={props.addressText}
        onChange={
          /** Sends position text to its owner. @param event - DOM input. @returns Nothing. */ (
            event,
          ) => props.onAddressChange(event.target.value)
        }
        onKeyDown={props.onAddressKeyDown}
        className={`${officeTextInputClassName} w-28`}
      />
      <button
        type="button"
        aria-label="Named ranges"
        disabled={!props.enabledActions.has("names")}
        onClick={
          /** Opens the name-list command when available. @returns Nothing. */ () =>
            props.onAction("names")
        }
        className={officeToolbarButtonClassName}
      >
        <ChevronDown aria-hidden="true" size={16} />
      </button>
      {controls.map(
        /** Renders one source-mode action. @param control - Action identity, accessible label and glyph. @returns Button. */ ([
          action,
          label,
          Icon,
        ]) => (
          <button
            key={action}
            type="button"
            aria-label={label}
            disabled={!props.enabledActions.has(action)}
            onMouseDown={
              /** Keeps the current edit selection until the command decides focus. @param event - Platform pointer. @returns Nothing. */ (
                event,
              ) => event.preventDefault()
            }
            onClick={
              /** Routes the controller-owned action. @returns Nothing. */ () =>
                props.onAction(action)
            }
            className={officeToolbarButtonClassName}
          >
            <Icon aria-hidden="true" size={16} />
          </button>
        ),
      )}
      <input
        aria-label="Input line"
        value={props.inputText}
        onFocus={props.onInputFocus}
        onChange={
          /** Forwards formula or scalar input. @param event - DOM input. @returns Nothing. */ (
            event,
          ) =>
            props.onInput(event.target.value, [
              event.target.selectionStart as number,
              event.target.selectionEnd as number,
            ])
        }
        onCompositionStart={props.onInputCommand}
        onPaste={props.onInputCommand}
        onSelect={
          /** Projects actual UTF16 edit selection to the input owner. @param event - Editor selection. @returns Nothing. */
          (event) =>
            props.onInputSelection?.(
              event.currentTarget.selectionStart as number,
              event.currentTarget.selectionEnd as number,
              event.currentTarget.value,
            )
        }
        onKeyDown={props.onInputKeyDown}
        className={`${officeTextInputClassName} flex-1`}
      />
      <button
        type="button"
        aria-label="Expand formula bar"
        disabled={!props.enabledActions.has("expand")}
        onClick={
          /** Routes the input-line expansion command. @returns Nothing. */ () =>
            props.onAction("expand")
        }
        className={officeToolbarButtonClassName}
      >
        <ChevronDown aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
