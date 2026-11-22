/** @fileoverview Browser currency split button and source twelve-row list projection. */
import { useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Coins } from "lucide-react";
import { NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../../svl/inc/zforlist";
import type { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import {
  GetCurrencyFormatKey,
  type CurrencyListEntry,
} from "../../source/tbxctrls/tbcontrl.currency";
import { useToolboxPopup } from "./use-toolbox-popup";

/** Provides the native currency button with the active model's number formats. */
export interface CurrencyToolBoxControlProps {
  readonly enabled: boolean;
  readonly checked: boolean;
  readonly buttonClassName: string;
  readonly onApply: (key?: number) => void;
  readonly getFormatter: () => SvNumberFormatter;
  readonly getCurrencyRows: () => CurrencyListEntry[];
}

/** Renders the usual currency action and opens the original currency selector shape.
 * @param props - Active binding and document number-format access.
 * @param props.enabled - Bound command admission.
 * @param props.checked - Bound command selection.
 * @param props.buttonClassName - Active toolbar styling.
 * @param props.onApply - Applies a typed key or the native no-argument toggle.
 * @param props.getFormatter - Current document formatter.
 * @param props.getCurrencyRows - Source currency list for the current document.
 * @returns Split button and its lazy popup.
 */
export function CurrencyToolBoxControl({
  enabled,
  checked,
  buttonClassName,
  onApply,
  getFormatter,
  getCurrencyRows,
}: CurrencyToolBoxControlProps): React.JSX.Element {
  const { ref: popup, open, toggle, close } = useToolboxPopup();
  const [rows, setRows] = useState<CurrencyListEntry[]>([]);
  const [last, setLast] = useState<{ choice: CurrencyListEntry; key: number }>();
  const list = useRef<HTMLSelectElement>(null);
  useLayoutEffect(
    /** Focuses the source list and selects the retained choice on open. @returns Nothing. */
    () => {
      if (!open || !list.current) return;
      list.current.selectedIndex = last
        ? rows.findIndex(
            /** Matches one native table entry and presentation mode. @param row - Currency row. @returns Whether this was the choice. */
            (row) => row.entry === last.choice.entry && row.bank === last.choice.bank,
          )
        : -1;
      list.current.focus();
    },
    [open, rows, last],
  );

  /** Reapplies the remembered currency key or invokes the original default toggle. @returns Nothing. */
  function apply(): void {
    onApply(last?.key);
  }

  /** Activates the selected native currency row. @returns Nothing. */
  function choose(): void {
    const choice = rows[list.current?.selectedIndex ?? -1];
    if (!choice) return;
    const key = GetCurrencyFormatKey(getFormatter(), choice);
    if (key !== NUMBERFORMAT_ENTRY_NOT_FOUND) {
      onApply(key);
      setLast({ choice, key });
    } else apply();
    close(true);
  }

  return (
    <div className="inline-flex shrink-0" aria-label="Currency" role="group">
      <button
        aria-label="Currency"
        aria-pressed={checked}
        className={buttonClassName + " rounded-r-none"}
        data-active={checked}
        data-office-tooltip="Currency"
        disabled={!enabled}
        onClick={apply}
        type="button"
      >
        <Coins aria-hidden size={16} />
      </button>
      <details ref={popup} className="relative">
        <summary
          aria-label="Currency formats"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-disabled={!enabled}
          className="grid h-7 w-4 cursor-pointer list-none place-items-center rounded-r border-l border-slate-200 bg-white text-slate-700 hover:bg-indigo-50"
          onClick={
            /** Opens the source currency list on demand. @param event - Selected arrow. @returns Nothing. */
            (event) => {
              event.preventDefault();
              if (!enabled) return;
              if (!open) setRows(getCurrencyRows());
              toggle();
            }
          }
        >
          <ChevronDown aria-hidden size={12} />
        </summary>
        {open ? (
          <div className="z-50 overflow-hidden rounded border border-slate-300 bg-white p-1 shadow-lg">
            <select
              aria-label="Currency formats"
              className="block max-w-full rounded bg-white text-sm text-slate-900"
              ref={list}
              size={12}
              onClick={choose}
              onKeyDown={
                /** Activates a row on Enter and returns Escape to the existing popup owner. @param event - List keyboard event. @returns Nothing. */
                (event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    choose();
                  } else if (event.key === "Escape") {
                    event.preventDefault();
                    close(true);
                  }
                }
              }
            >
              {rows.map(
                /** Renders the symbol and bank sections in source row order. @param row - Currency choice. @param index - Row index. @returns Option. */
                (row, index) => (
                  <option key={index} value={index}>
                    {row.label}
                  </option>
                ),
              )}
            </select>
          </div>
        ) : null}
      </details>
    </div>
  );
}
