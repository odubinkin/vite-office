/** @fileoverview Writer's search-attribute picker from cui/uiconfig/ui/searchattrdialog.ui. */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import {
  ApplySearchAttributeChecks,
  GetSearchAttributeRows,
} from "../../../cui/source/dialogs/srchxtra";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WRITER_SEARCH_ATTR_WHICH_RANGES } from "../../source/uibase/uiview/viewsrch";
import { WriterDialogHeader } from "./WriterDialogHeader";

/** Edits the search side's attribute names in a modal checklist. @param props - Pool, attributes and result handler. @returns Attribute checklist. */
export function WriterSearchAttributesDialog(
  props: Readonly<{
    pool: SfxItemPool;
    initial: SearchAttrItemList | undefined;
    restoreFocus: RefObject<HTMLInputElement | null>;
    onClose: (result?: SearchAttrItemList) => void;
  }>,
): React.JSX.Element {
  const root = useRef<HTMLFormElement>(null);
  const localization = useBrowserLocalization();
  const collator = new Intl.Collator(localization.locale);
  const rows = GetSearchAttributeRows(props.pool, WRITER_SEARCH_ATTR_WHICH_RANGES, props.initial)
    .map(
      /** Resolves the native label for the application's locale. @param row - Native attribute. @returns Localized row. */
      (row) => ({
        ...row,
        label: localization.GetText(`writer.search.attribute.slot.${row.slot}`, row.label),
      }),
    )
    .sort(
      /** Sorts localized names as the native tree view does. @param left - First row. @param right - Second row. @returns Sort order. */
      (left, right) => collator.compare(left.label, right.label),
    );
  const [selected, setSelected] = useState(
    /** Starts with only native presence criteria checked. @returns Selected slots. */
    () =>
      new Set(
        rows
          .filter(
            /** Identifies checked rows. @param row - Attribute. @returns Whether checked. */
            (row) => row.checked,
          )
          .map(
            /** Returns the underlying slot. @param row - Attribute. @returns Slot identity. */
            (row) => row.slot,
          ),
      ),
  );
  const title = localization.GetText("writer.search.attributes-title", "Attributes");

  useLayoutEffect(
    /** Focuses the modal, then returns focus to the Find field. @returns Focus cleanup. */ () => {
      const invoker = props.restoreFocus.current;
      root.current?.focus();
      return /** Restores focus to the Find field. @returns Nothing. */ () =>
        queueMicrotask(
          /** Focuses the Find field after the modal closes. @returns Nothing. */ () =>
            invoker?.focus(),
        );
    },
    [props.restoreFocus],
  );

  /** Cancels the draft. @returns Nothing. */
  function cancel(): void {
    props.onClose();
  }

  /** Accepts the native checklist draft. @returns Nothing. */
  function accept(): void {
    props.onClose(ApplySearchAttributeChecks(rows, selected, props.initial));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="grid w-full max-w-sm gap-3 rounded-lg border border-slate-300 bg-white p-4 shadow-xl"
        onSubmit={
          /** Commits the checklist. @param event - Form submission. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            accept();
          }
        }
        onKeyDown={
          /** Handles Escape inside the modal. @param event - Key event. @returns Nothing. */ (
            event,
          ) => {
            event.stopPropagation();
            if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
          }
        }
      >
        <WriterDialogHeader title={title} onClose={cancel} />
        <div className="grid max-h-64 gap-1 overflow-auto rounded border border-slate-300 p-2">
          {rows.map(
            /** Renders one native attribute choice. @param entry - Attribute descriptor. @returns Checkbox. */ ({
              slot,
              label,
            }) => {
              return (
                <label key={slot} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.has(slot)}
                    onChange={
                      /** Toggles the slot in the draft. @param event - Input change. @returns Nothing. */ (
                        event,
                      ) => {
                        const next = new Set(selected);
                        if (event.currentTarget.checked) next.add(slot);
                        else next.delete(slot);
                        setSelected(next);
                      }
                    }
                  />
                  {label}
                </label>
              );
            },
          )}
        </div>
        <footer className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1"
            onClick={cancel}
          >
            {localization.GetText("writer.search.cancel", "Cancel")}
          </button>
          <button type="submit" className="rounded bg-indigo-700 px-3 py-1 text-white">
            {localization.GetText("writer.search.ok", "OK")}
          </button>
        </footer>
      </form>
    </div>
  );
}
