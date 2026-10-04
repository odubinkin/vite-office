/** @fileoverview Adapts native SvxStyleBox acceptance, travel and focus release to a browser style selector. */
import { useState } from "react";
import type { StyleToolboxEntry } from "./style-toolbox-control";

/** Family-independent browser style-box ports; the frame retains dispatch and model ownership. */
export interface StyleToolboxSelectProps {
  readonly options: readonly StyleToolboxEntry[];
  readonly value: string;
  readonly enabled: boolean;
  readonly label: string;
  readonly getLabel: (style: StyleToolboxEntry) => string;
  readonly applyStyle: (style: StyleToolboxEntry) => void;
  readonly focusDocument?: () => void;
}

/** Renders tentative native keyboard travel and explicit acceptance without presentation-owned model writes. @param props - Current bindings and frame ports. @returns Style selector. */
export function StyleToolboxSelect({
  options,
  value,
  enabled,
  label,
  getLabel,
  applyStyle,
  focusDocument,
}: StyleToolboxSelectProps): React.JSX.Element {
  const [draft, setDraft] =
    useState<
      Readonly<{ options: readonly StyleToolboxEntry[]; boundValue: string; value: string }>
    >();
  const selected = draft?.options === options && draft.boundValue === value ? draft.value : value;

  /** Resolves the selected entry before native focus-before-dispatch acceptance. @param id - Rendered identity. @param releaseFocus - Whether normal focus navigation is suppressed. @returns Nothing. */
  function accept(id: string, releaseFocus: boolean): void {
    const style = options.find(
      /** Resolves an actual rendered entry. @param entry - Candidate. @returns Match. */ (entry) =>
        entry.id === id,
    );
    if (!enabled || style === undefined) return;
    setDraft(undefined);
    if (releaseFocus) focusDocument?.();
    applyStyle(style);
  }

  return (
    <label className="contents">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        disabled={!enabled}
        className="h-8 min-w-44 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        value={selected}
        onBlur={
          /** Restores the saved binding value after unaccepted travel. @returns Nothing. */ () =>
            setDraft(undefined)
        }
        onChange={
          /** Accepts a direct native list pick. @param event - Select change. @returns Nothing. */ (
            event,
          ) => accept(event.target.value, true)
        }
        onKeyDown={
          /** Routes native acceptance/cancellation and closed-widget travel. @param event - Browser key. @returns Nothing. */ (
            event,
          ) => {
            if (!enabled) return;
            if (event.key === "Escape") {
              event.preventDefault();
              setDraft(undefined);
              focusDocument?.();
              return;
            }
            if (event.key === "Tab") {
              accept(selected, false);
              return;
            }
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.key === "Enter") {
              event.preventDefault();
              accept(selected, true);
              return;
            }
            const index = options.findIndex(
              /** Finds current travel position. @param entry - Candidate. @returns Match. */ (
                entry,
              ) => entry.id === selected,
            );
            let next: number;
            switch (event.key) {
              case "ArrowDown":
                next = Math.min(options.length - 1, index + 1);
                break;
              case "ArrowUp":
                next = Math.max(0, index - 1);
                break;
              case "PageUp":
                next = 0;
                break;
              case "PageDown":
                next = options.length - 1;
                break;
              default:
                return;
            }
            event.preventDefault();
            const style = options[next];
            if (style !== undefined) setDraft({ options, boundValue: value, value: style.id });
          }
        }
      >
        {selected === "" && <option value="" />}
        {options.map(
          /** Renders one native flat entry. @param style - Entry. @returns Option. */ (style) => (
            <option key={style.id} value={style.id}>
              {getLabel(style)}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
