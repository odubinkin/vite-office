/** @fileoverview Editable SvxStyleBox acceptance, tentative travel and saved-value focus restoration from pinned tbcontrl.cxx. */
import { useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { StyleToolboxEntry } from "./style-toolbox-control";

/** Original frame-owned style pool lookup and dispatch ports. */
export interface StyleToolboxSelectProps {
  readonly options: readonly StyleToolboxEntry[];
  readonly value: string;
  readonly enabled: boolean;
  readonly label: string;
  readonly getLabel: (style: StyleToolboxEntry) => string;
  readonly applyStyle: (style: StyleToolboxEntry) => void;
  readonly acceptName: (name: string) => void;
  readonly focusDocument?: () => void;
  readonly inSidebar?: boolean;
}

/** Renders a family-neutral editable combo; input and travel do not dispatch until explicit acceptance. @param props - Actual pool and command bindings. @returns Style box. */
export function StyleToolboxSelect(props: StyleToolboxSelectProps): React.JSX.Element {
  const { options, value, enabled, label, getLabel, applyStyle, focusDocument } = props;
  const listId = useId(),
    input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] =
    useState<Readonly<{ bound: string; text: string; options: readonly StyleToolboxEntry[] }>>();
  const [open, setOpen] = useState(false);
  const current = options.find(
    /** Resolves current model identity. @param entry - Pool projection. @returns Match. */
    (entry) => entry.id === value,
  );
  const saved = current === undefined ? "" : getLabel(current);
  const selected = draft?.bound === saved && draft.options === options ? draft.text : saved;
  /** Releases focus before dispatch, preserving the exact raw typed name. @param text - Accepted entry text. @param release - Whether Tab suppresses explicit document focus. @returns Nothing. */
  function accept(text: string, release: boolean): void {
    if (!enabled) return;
    const entry = options.find(
      /** Translates localized list labels to actual names. @param style - Actual entry. @returns Match. */
      (style) => getLabel(style) === text,
    );
    setDraft(undefined);
    setOpen(false);
    if (release) focusDocument?.();
    if (entry !== undefined) applyStyle(entry);
    else props.acceptName(text);
  }
  return (
    <span
      className="relative inline-flex min-w-0 max-w-full"
      onBlur={
        /** Restores the saved value when the entire combo loses focus. @param event - Actual focus transfer. @returns Nothing. */
        (event) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          setDraft(undefined);
          setOpen(false);
        }
      }
    >
      <input
        ref={input}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        disabled={!enabled}
        value={selected}
        className="h-8 w-44 min-w-0 rounded-l-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onFocus={
          /** Native focus selects the entire entry. @param event - Entry focus. @returns Nothing. */
          (event) => event.currentTarget.select()
        }
        onChange={
          /** Typing retains a tentative draft only. @param event - Entry change. @returns Nothing. */
          (event) => setDraft({ options, bound: saved, text: event.target.value })
        }
        onKeyDown={
          /** Routes original Enter, Tab, Escape and nondispatching travel. @param event - Actual key. @returns Nothing. */
          (event) => {
            if (!enabled) return;
            if (event.key === "Escape") {
              setDraft(undefined);
              setOpen(false);
              if (!props.inSidebar) {
                event.preventDefault();
                event.stopPropagation();
                focusDocument?.();
              }
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
              /** Finds tentative travel row. @param entry - Candidate row. @returns Match. */
              (entry) => getLabel(entry) === selected,
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
            const entry = options[next];
            if (entry !== undefined) setDraft({ options, bound: saved, text: getLabel(entry) });
          }
        }
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={!enabled}
        aria-label={`Show ${label}`}
        aria-expanded={open}
        aria-controls={listId}
        data-office-combobox-toggle="true"
        className="grid w-5 shrink-0 place-items-center rounded-r-md border border-l-0 border-slate-300 bg-white"
        onMouseDown={
          /** Retains entry focus before popup pick. @param event - Pointer. @returns Nothing. */
          (event) => event.preventDefault()
        }
        onClick={
          /** Opens the original full list. @returns Nothing. */
          () => {
            input.current?.focus();
            setOpen(!open);
          }
        }
      >
        <ChevronDown aria-hidden size={12} />
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute top-full left-0 z-50 max-h-60 min-w-full overflow-y-auto border border-slate-300 bg-white py-1 shadow-md"
        >
          {options.map(
            /** Direct list picks accept once; travel remains tentative. @param entry - Original row. @returns Option. */
            (entry) => (
              <button
                type="button"
                role="option"
                key={entry.id}
                tabIndex={-1}
                aria-selected={getLabel(entry) === selected}
                className="block w-full px-2 py-1 text-left text-sm hover:bg-slate-100"
                onMouseDown={
                  /** Retains focus until explicit release. @param event - Pointer. @returns Nothing. */
                  (event) => event.preventDefault()
                }
                onClick={
                  /** Accepts the direct native row. @returns Nothing. */
                  () => accept(getLabel(entry), true)
                }
              >
                {getLabel(entry)}
              </button>
            ),
          )}
        </div>
      )}
    </span>
  );
}
