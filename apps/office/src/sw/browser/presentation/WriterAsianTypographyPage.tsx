/** @fileoverview Browser page for the native SvxAsianTabPage paragraph item exchange. */
import { useState } from "react";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SfxItemState, type SfxItemSet } from "../../../svl/inc/itemset";
import { asianTypographyOptions } from "./writer-search-format-values";

/** Projects the native checkboxes, including invalid, disabled and pool-default item states. @param props - The dialog input, exchange output and localization. @returns Asian Typography page. */
export function WriterAsianTypographyPage({
  input,
  output,
  label,
}: Readonly<{
  input: SfxItemSet;
  output: SfxItemSet;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const [, refresh] = useState(0);
  /** Exchanges only the edited WhichId using its concrete native item type. @param which - Paragraph item. @param active - Checkbox value. @returns Nothing. */
  function change(which: number, active: boolean): void {
    const initial = input.GetItem(which);
    const prototype = initial ?? input.GetPool().GetUserOrPoolDefaultItem(which);
    if (!(prototype instanceof SfxBoolItem)) return;
    if (initial instanceof SfxBoolItem && initial.GetValue() === active) {
      output.ClearItem(which);
    } else {
      const item = prototype.Clone();
      try {
        item.SetValue(active);
        output.Put(item);
      } finally {
        item.Dispose();
      }
    }
    refresh(
      /** Renders the exchanged item value. @param revision - Previous revision. @returns Next revision. */
      (revision) => revision + 1,
    );
  }

  return (
    <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
      <legend className="px-1 text-sm">{label("line-change", "Line Change")}</legend>
      {asianTypographyOptions.map(
        /** Binds one original checkbox. @param option - Item identity and caption. @returns Checkbox. */
        ([which, key, caption]) => {
          const state = input.GetItemState(which);
          const item = output.GetItemIfSet(which, false) ?? input.GetItem(which);
          return (
            <label key={which} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={item instanceof SfxBoolItem && item.GetValue()}
                disabled={state === SfxItemState.UNKNOWN || state === SfxItemState.DISABLED}
                ref={
                  /** Copies the native mixed state into the checkbox. @param control - Mounted checkbox. @returns Nothing. */
                  (control) => {
                    if (control)
                      control.indeterminate = item === undefined && state === SfxItemState.INVALID;
                  }
                }
                onChange={
                  /** Updates the current checkbox value. @param event - Native change event. @returns Nothing. */
                  (event) => change(which, event.currentTarget.checked)
                }
              />
              {label(key, caption)}
            </label>
          );
        },
      )}
    </fieldset>
  );
}
