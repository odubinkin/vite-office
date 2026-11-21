/** @fileoverview Writer's browser binding for the Font and Font Effects pages of SvxSearchFormatDialog. */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { SvxFontItem } from "../../../editeng/source/items/textitem.font";
import {
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import { fontWeights, postures, underlines } from "./writer-search-format-values";
import {
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
} from "../../inc/hintids";
import { WriterDialogHeader } from "./WriterDialogHeader";

/** Edits exact search or replacement formatting. @param props - Criteria and owning pool. @returns Modal formatting form. */
export function WriterSearchFormatDialog(
  props: Readonly<{
    pool: SfxItemPool;
    initial: SearchAttrItemList | undefined;
    target: "search" | "replace";
    restoreFocus: RefObject<HTMLInputElement | null>;
    onClose: (result?: SearchAttrItemList) => void;
  }>,
): React.JSX.Element {
  const localization = useBrowserLocalization();
  const root = useRef<HTMLFormElement>(null);
  const [page, setPage] = useState<"font" | "effects">("font");
  const [draft, setDraft] = useState<ReadonlyMap<number, string>>(new Map());
  const title =
    props.target === "search"
      ? localization.GetText("writer.search.format-search", "Search")
      : localization.GetText("writer.search.format-replace", "Replace");

  useLayoutEffect(
    /** Transfers focus between the editor and the active criterion field. @returns Focus cleanup. */ () => {
      const invoker = props.restoreFocus.current;
      root.current?.focus();
      return /** Restores focus after the parent becomes interactive. @returns Nothing. */ () =>
        queueMicrotask(/** Focuses the active entry. @returns Nothing. */ () => invoker?.focus());
    },
    [props.restoreFocus],
  );

  /** Looks up an existing concrete attribute. @param which - Writer WhichId. @returns Existing item. */
  function existing(which: number): SfxPoolItem | undefined {
    const slot = props.pool.GetSlotId(which);
    return props.initial
      ?.GetEntries()
      .find(
        /** Finds a criterion by native slot. @param entry - Native slot item. @returns Whether it matches. */ (
          entry,
        ) => entry.slot === slot,
      )?.item;
  }

  /** Reads an exact value for a control before user edits. @param which - Writer WhichId. @returns Unmodified value. */
  function original(which: number): string {
    const item = existing(which);
    if (item instanceof SvxFontItem) return item.GetFamilyName();
    if (item instanceof SvxFontHeightItem) return String(item.GetHeight() / 20);
    if (item instanceof SvxWeightItem) return String(item.GetWeight());
    if (item instanceof SvxPostureItem) return String(item.GetPosture());
    if (item instanceof SvxUnderlineItem) return String(item.GetLineStyle());
    return "";
  }

  /** Tracks the delta produced by the active pages. @param which - Writer WhichId. @param value - Entered value. @returns Nothing. */
  function change(which: number, value: string): void {
    setDraft(new Map(draft).set(which, value));
  }

  /** Writes the changed native attributes back to the owning list. @returns Nothing. */
  function accept(): void {
    const set = new SfxItemSet(props.pool, [[RES_CHRATR_BEGIN, RES_CHRATR_END - 1]]);
    try {
      props.initial?.Get(set);
      for (const [which, value] of draft) {
        if (value === "") set.ClearItem(which);
        else if (which === RES_CHRATR_FONT) {
          const item = new SvxFontItem(which);
          item.SetFamilyName(value);
          set.Put(item);
        } else if (which === RES_CHRATR_FONTSIZE)
          set.Put(new SvxFontHeightItem(Math.round(Number(value) * 20), 100, which));
        else if (which === RES_CHRATR_WEIGHT) set.Put(new SvxWeightItem(Number(value), which));
        else if (which === RES_CHRATR_POSTURE) set.Put(new SvxPostureItem(Number(value), which));
        else if (which === RES_CHRATR_UNDERLINE)
          set.Put(new SvxUnderlineItem(Number(value), which));
      }
      const result = new SearchAttrItemList();
      result.Put(set);
      props.onClose(result);
    } finally {
      set.Dispose();
    }
  }

  /** Cancels the formatting dialog. @returns Nothing. */
  function cancel(): void {
    props.onClose();
  }

  /** Renders a native attribute choice. @param which - Writer WhichId. @param label - Control caption. @param choices - Represented enum values. @returns Select field. */
  function select(
    which: number,
    label: string,
    choices: readonly (readonly [number, string])[],
  ): React.JSX.Element {
    return (
      <label className="grid gap-1 text-sm">
        {label}
        <select
          className="rounded border border-slate-400 p-1"
          value={draft.get(which) ?? original(which)}
          onChange={
            /** Records the selected value. @param event - Input event. @returns Nothing. */ (
              event,
            ) => change(which, event.currentTarget.value)
          }
        >
          <option value="" />
          {choices.map(
            /** Renders one exact value. @param entry - Value and label. @returns Select option. */ ([
              value,
              text,
            ]) => (
              <option key={value} value={value}>
                {text}
              </option>
            ),
          )}
        </select>
      </label>
    );
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
          /** Applies the formatting delta. @param event - Form event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            accept();
          }
        }
        onKeyDown={
          /** Handles Escape and blocks document commands. @param event - Key event. @returns Nothing. */ (
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
        <div role="tablist" className="flex gap-2 border-b border-slate-300">
          <button
            type="button"
            role="tab"
            aria-selected={page === "font"}
            className="px-2 py-1 aria-selected:border-b-2 aria-selected:border-indigo-700"
            onClick={/** Opens the Font page. @returns Nothing. */ () => setPage("font")}
          >
            {localization.GetText("writer.search.format.font", "Font")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={page === "effects"}
            className="px-2 py-1 aria-selected:border-b-2 aria-selected:border-indigo-700"
            onClick={/** Opens the Font Effects page. @returns Nothing. */ () => setPage("effects")}
          >
            {localization.GetText("writer.search.format.effects", "Font Effects")}
          </button>
        </div>
        <div
          role="tabpanel"
          hidden={page !== "font"}
          className={page === "font" ? "grid gap-2" : undefined}
        >
          <label className="grid gap-1 text-sm">
            {localization.GetText("writer.search.format.family", "Family")}
            <input
              className="rounded border border-slate-400 p-1"
              value={draft.get(RES_CHRATR_FONT) ?? original(RES_CHRATR_FONT)}
              onChange={
                /** Tracks the chosen family. @param event - Input event. @returns Nothing. */ (
                  event,
                ) => change(RES_CHRATR_FONT, event.currentTarget.value)
              }
            />
          </label>
          {select(
            RES_CHRATR_WEIGHT,
            localization.GetText("writer.search.format.weight", "Weight"),
            fontWeights,
          )}
          {select(
            RES_CHRATR_POSTURE,
            localization.GetText("writer.search.format.posture", "Posture"),
            postures,
          )}
          <label className="grid gap-1 text-sm">
            {localization.GetText("writer.search.format.size", "Size")}
            <input
              type="number"
              min={1}
              max={999.9}
              step={0.1}
              className="rounded border border-slate-400 p-1"
              value={draft.get(RES_CHRATR_FONTSIZE) ?? original(RES_CHRATR_FONTSIZE)}
              onChange={
                /** Tracks the absolute point height. @param event - Input event. @returns Nothing. */ (
                  event,
                ) => change(RES_CHRATR_FONTSIZE, event.currentTarget.value)
              }
            />
          </label>
        </div>
        <div role="tabpanel" hidden={page !== "effects"}>
          {select(
            RES_CHRATR_UNDERLINE,
            localization.GetText("writer.search.format.underline", "Underlining"),
            underlines,
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
