/** @fileoverview Editable browser combo for original absolute FontSizeBox and SvxFontSizeBox_Base controllers. */
import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import { FontSizeBinding, type FontSizeSelectProps } from "./font-size-binding";
/** Shared actual frame contract. */
export type { FontSizeSelectProps } from "./font-size-binding";
/** Retains native typed-versus-picked acceptance, status text and keyboard focus behavior. @param props - Actual frame binding. @returns Editable combo. */
export function FontSizeSelect(props: FontSizeSelectProps): React.JSX.Element {
  const input = useRef<HTMLInputElement>(null),
    listId = useId();
  const [binding] = useState(
    /** Creates persistent source control ownership. @returns Binding. */ () =>
      new FontSizeBinding(props),
  );
  const owner = binding.owner;
  const text = useSyncExternalStore(binding.Subscribe, binding.GetSnapshot, binding.GetSnapshot);
  const [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  useLayoutEffect(
    /** Updates real parent status and execution ports before paint. @returns Nothing. */ () => {
      binding.Update(props);
    },
    [binding, props],
  );
  /** Picks a real numerical source row and executes the original direct-pick path. @param index - Source row. @returns Nothing. */
  function pick(index: number): void {
    const value = owner.widget.GetEntries()[index] as number;
    owner.widget.set_value(value);
    owner.SelectHdl(true);
    binding.Publish();
    setOpen(false);
  }
  return (
    <span
      className="relative inline-flex min-w-0 max-w-full"
      onBlur={
        /** Only whole-combo focus departure restores last native status text. @param event - Actual focus transfer. @returns Nothing. */ (
          event,
        ) => {
          if (event.currentTarget.contains(event.relatedTarget)) return;
          owner.widget.ReformatHdl();
          owner.FocusOutHdl(false);
          binding.Publish();
          setOpen(false);
        }
      }
    >
      <input
        ref={input}
        role="combobox"
        type="text"
        inputMode="decimal"
        aria-label={props.label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="none"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        disabled={!props.enabled}
        value={text}
        className="h-8 w-20 min-w-0 rounded-l-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onChange={
          /** Editable text never dispatches a partially typed size. @param event - Entry change. @returns Nothing. */ (
            event,
          ) => {
            binding.SetText(event.target.value);
          }
        }
        onKeyDown={
          /** Projects actual combo navigation and native toolbox acceptance. @param event - Actual key. @returns Nothing. */ (
            event,
          ) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              setOpen(true);
              setActive(
                Math.max(
                  0,
                  Math.min(
                    owner.widget.GetEntries().length - 1,
                    (open ? active : owner.widget.GetEntries().indexOf(owner.widget.get_value())) +
                      (event.key === "ArrowDown" ? 1 : -1),
                  ),
                ),
              );
              return;
            }
            if (event.key === "Enter") {
              event.preventDefault();
              if (open && active >= 0) pick(active);
              else owner.ActivateHdl();
              setOpen(false);
            } else if (owner.DoKeyInput(event.key, props.inSidebar === true)) {
              event.preventDefault();
              event.stopPropagation();
            }
            if (event.key === "Escape" || event.key === "Tab") setOpen(false);
            binding.Publish();
          }
        }
      />
      <button
        type="button"
        disabled={!props.enabled}
        tabIndex={-1}
        data-office-combobox-toggle="true"
        aria-label={`Show ${props.label}`}
        aria-expanded={open}
        aria-controls={listId}
        className="grid w-5 shrink-0 place-items-center rounded-r-md border border-l-0 border-slate-300 bg-white"
        onMouseDown={
          /** Pointer popup activation retains combo entry focus. @param event - Actual pointer. @returns Nothing. */ (
            event,
          ) => event.preventDefault()
        }
        onClick={
          /** Opens the full original unfiltered size resource. @returns Nothing. */ () => {
            input.current?.focus();
            setOpen(!open);
            setActive(owner.widget.GetEntries().indexOf(owner.widget.get_value()));
          }
        }
      >
        <ChevronDown aria-hidden size={12} />
      </button>
      {open && (
        <div
          id={listId}
          role="listbox"
          aria-label={props.label}
          className="absolute top-full left-0 z-50 max-h-60 min-w-full overflow-y-auto border border-slate-300 bg-white py-1 shadow-md"
        >
          {owner.widget.GetEntries().map(
            /** Retains source order without inserting an arbitrary custom row. @param value - Tenths of a point. @param index - Native row. @returns Option. */ (
              value,
              index,
            ) => (
              <button
                type="button"
                role="option"
                id={`${listId}-${index}`}
                key={value}
                aria-selected={index === active}
                tabIndex={-1}
                className={`block w-full px-2 py-1 text-left text-sm hover:bg-slate-100 ${index === active ? "bg-slate-100" : ""}`}
                onMouseDown={
                  /** Original direct pick retains input focus until its explicit release. @param event - Pointer input. @returns Nothing. */ (
                    event,
                  ) => event.preventDefault()
                }
                onClick={
                  /** Accepts this actual original row. @returns Nothing. */ () => pick(index)
                }
              >
                {owner.widget.format_number(value)}
              </button>
            ),
          )}
        </div>
      )}
    </span>
  );
}
