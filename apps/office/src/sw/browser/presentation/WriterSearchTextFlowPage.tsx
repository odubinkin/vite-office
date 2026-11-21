/** @fileoverview Text Flow options of SvxSearchFormatDialog. */
import { useState } from "react";
import { RES_PARATR_ORPHANS, RES_PARATR_SPLIT, RES_PARATR_WIDOWS } from "../../inc/hintids";

const lineLimits = [
  [RES_PARATR_ORPHANS, "orphans", "Don’t split at beginning of paragraph"],
  [RES_PARATR_WIDOWS, "widows", "Don’t split at end of paragraph"],
] as const;

/** Cycles an initially unspecified native checkbox through off, on and indeterminate. @param current - Current criterion. @param initial - Saved criterion. @returns Next field state. */
function nextState(current: string, initial: string): string {
  if (current === "false") return "true";
  if (current === "true" && initial === "") return "";
  return "false";
}

/** Binds existing paragraph pagination items to the native Options controls. @param props - Format draft bindings. @returns Text Flow options. */
export function WriterSearchTextFlowPage({
  label,
  value,
  initial,
  onChange,
}: Readonly<{
  label: (key: string, fallback: string) => string;
  value: (which: number) => string;
  initial: (which: number) => string;
  onChange: (which: number, value: string) => void;
}>): React.JSX.Element {
  const [counts, setCounts] = useState<Readonly<Record<number, number>>>({});
  const [splitSensitive, setSplitSensitive] = useState(true);
  const split = value(RES_PARATR_SPLIT);
  return (
    <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
      <legend className="text-sm">{label("textflow-options", "Options")}</legend>
      {/* SvxSearchDialog::FormatHdl_Impl disables the keep item before opening this page. */}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" disabled />
        {label("keep-with-next", "Keep with next paragraph")}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={split === "true"}
          disabled={!splitSensitive}
          ref={
            /** Marks an unspecified split criterion. @param input - Checkbox. @returns Nothing. */
            (input) => {
              if (input) input.indeterminate = split === "";
            }
          }
          onChange={
            /** Routes the native split checkbox. @returns Nothing. */ () =>
              onChange(RES_PARATR_SPLIT, nextState(split, initial(RES_PARATR_SPLIT)))
          }
        />
        {label("split-paragraph", "Allow to split paragraph")}
      </label>
      {lineLimits.map(
        /** Renders the native checkbox and linked spin button. @param limit - Attribute binding. @returns Line limit. */
        ([which, key, caption]) => {
          const criterion = value(which);
          const enabled = Number(criterion) > 0;
          const count = enabled ? Number(criterion) : (counts[which] ?? 2);
          const state = criterion === "" ? "" : String(enabled);
          const name = label(key, caption);
          return (
            <div key={which} className="flex flex-wrap items-center gap-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={enabled}
                  disabled={split !== "true"}
                  ref={
                    /** Marks an unspecified line limit. @param input - Checkbox. @returns Nothing. */
                    (input) => {
                      if (input) input.indeterminate = state === "";
                    }
                  }
                  onChange={
                    /** Applies the native widow or orphan toggle and retains its line count. @returns Nothing. */ () => {
                      const next = nextState(state, initial(which));
                      setCounts({ ...counts, [which]: count });
                      onChange(
                        which,
                        next === "true" ? String(count) : next === "false" ? "0" : "",
                      );
                      if (next === "true") setSplitSensitive(true);
                      // WidowHdl and OrphanHdl have opposite effects when both limits are off.
                      if (next === "false") {
                        const other =
                          which === RES_PARATR_WIDOWS ? RES_PARATR_ORPHANS : RES_PARATR_WIDOWS;
                        if (value(other) === "0") setSplitSensitive(which === RES_PARATR_ORPHANS);
                      }
                    }
                  }
                />
                {name}
              </label>
              <input
                type="number"
                aria-label={name}
                className="w-16 rounded border border-slate-400 p-1"
                disabled={!enabled}
                value={count}
                min={2}
                max={9}
                onChange={
                  /** Writes a valid native whole-line count. @param event - Spin change. @returns Nothing. */
                  (event) => {
                    if (event.currentTarget.validity.valid && event.currentTarget.value !== "")
                      onChange(which, event.currentTarget.value);
                  }
                }
              />
              {label("lines", "lines")}
            </div>
          );
        },
      )}
    </fieldset>
  );
}
