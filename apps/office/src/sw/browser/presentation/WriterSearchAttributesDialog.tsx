/** @fileoverview Writer's search-attribute picker from cui/uiconfig/ui/searchattrdialog.ui. */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { searchAttributes } from "./writer-search-format-values";
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
  const [selected, setSelected] = useState(
    /** Starts with the dialog's native attribute list. @returns Selected slots. */ () =>
      new Set(
        props.initial
          ?.GetEntries()
          .map(
            /** Returns the slot stored by the search list. @param entry - Original criterion. @returns Slot. */ (
              entry,
            ) => entry.slot,
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

  /** Applies presence criteria and retains exact values for attributes still checked. @returns Nothing. */
  function accept(): void {
    const set = new SfxItemSet(props.pool, WRITER_SEARCH_ATTR_WHICH_RANGES);
    try {
      props.initial?.Get(set);
      for (const [which] of searchAttributes) {
        const slot = props.pool.GetSlotId(which);
        if (!selected.has(slot)) set.ClearItem(which);
        else if (
          !props.initial
            ?.GetEntries()
            .some(
              /** Preserves checked criteria's existing values. @param entry - Persisted criterion. @returns Whether it is already present. */ (
                entry,
              ) => entry.slot === slot,
            )
        )
          set.InvalidateItem(which);
      }
      const result = new SearchAttrItemList();
      result.Put(set);
      props.onClose(result);
    } finally {
      set.Dispose();
    }
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
          {searchAttributes.map(
            /** Renders one native attribute choice. @param entry - Attribute descriptor. @returns Checkbox. */ ([
              which,
              key,
              label,
            ]) => {
              const slot = props.pool.GetSlotId(which);
              return (
                <label key={which} className="flex items-center gap-2 text-sm">
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
                  {localization.GetText(`writer.search.attribute.${key}`, label)}
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
