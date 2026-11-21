/** @fileoverview Text Flow options of SvxSearchFormatDialog. */
import { useState } from "react";
import {
  ParagraphHyphenationKeepType,
  SvxHyphenZoneItem,
  type HyphenZoneSettings,
} from "../../../editeng/source/items/paraitem";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { FieldUnit } from "../../../tools/inc/fldunit";
import {
  RES_PARATR_HYPHENZONE,
  RES_PARATR_ORPHANS,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
} from "../../inc/hintids";

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
  hyphenation,
  hyphenationDefault,
  unit,
}: Readonly<{
  label: (key: string, fallback: string) => string;
  value: (which: number) => string;
  initial: (which: number) => string;
  onChange: (which: number, value: string | SfxPoolItem) => void;
  hyphenation: SfxPoolItem | undefined;
  hyphenationDefault: SfxPoolItem;
  unit: FieldUnit | undefined;
}>): React.JSX.Element {
  const [counts, setCounts] = useState<Readonly<Record<number, number>>>({});
  const [splitSensitive, setSplitSensitive] = useState(true);
  const split = value(RES_PARATR_SPLIT);
  return (
    <div className="grid gap-2">
      {hyphenationDefault instanceof SvxHyphenZoneItem && (
        <HyphenationControls
          label={label}
          initial={hyphenation instanceof SvxHyphenZoneItem ? hyphenation : undefined}
          poolDefault={hyphenationDefault}
          unit={unit}
          onChange={
            /** Writes the complete native paragraph criterion. @param item - Hyphenation item. @returns Nothing. */
            (item) => onChange(RES_PARATR_HYPHENZONE, item ?? "")
          }
        />
      )}
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
    </div>
  );
}

const hyphenCounts = [
  ["minLead", "hyphen-lead", "Characters at line end", 1, 9, 2],
  ["minTrail", "hyphen-trail", "Characters at line begin", 1, 9, 2],
  ["compoundMinLead", "hyphen-compound-lead", "Compound characters at line end", 0, 99, 2],
  ["compoundMinTrail", "hyphen-compound-trail", "Compound characters at line begin", 0, 99, 2],
  ["maxHyphens", "hyphen-max", "Maximum consecutive hyphenated lines", 0, 99, 0],
  ["minWordLength", "hyphen-min-word", "Minimum word length in characters", 4, 99, 4],
] as const;

const hyphenBoundaries = [
  ["paragraphEndZone", "paragraph", "Last full line of paragraph", "Paragraph end zone"],
  ["columnEndZone", "column", "Column", "Column end zone"],
  ["pageEndZone", "page", "Page", "Page end zone"],
  ["spreadEndZone", "spread", "Spread", "Spread end zone"],
] as const;

/** Widget state of the native Text Flow hyphenation groups. */
interface HyphenationDraft {
  readonly values: HyphenZoneSettings;
  readonly automatic: boolean | null;
  readonly caps: boolean | null;
  readonly lastWord: boolean | null;
  readonly moveLine: boolean | null;
  readonly across: readonly (boolean | null)[];
}

/** Resets native widgets from an exact criterion or the search page's indeterminate state. @param initial - Existing criterion. @param poolDefault - Writer item default. @returns Page state. */
function resetHyphenation(
  initial: SvxHyphenZoneItem | undefined,
  poolDefault: SvxHyphenZoneItem,
): HyphenationDraft {
  const settings = (initial ?? poolDefault).QueryValue();
  const values = { ...settings };
  for (const [field, , , min, max, fallback] of hyphenCounts)
    values[field] = initial ? Math.max(min, Math.min(max, values[field])) : fallback;
  const across = hyphenBoundaries.map(
    /** Reads the native cascading admission in boundary order. @param _entry - Boundary binding. @param index - Boundary order. @returns Checkbox state. */
    (_entry, index) => (initial ? !settings.keep || settings.keepType < 4 - index : null),
  );
  return {
    values,
    automatic: initial ? settings.hyphen : null,
    caps: initial ? !settings.noCaps : null,
    lastWord: initial ? !settings.noLastWord : null,
    moveLine: initial ? across[3] !== true && !settings.keepLine : null,
    across,
  };
}

/** Presents the original Text Flow hyphenation groups over the native item. @param props - Existing criterion and bindings. @returns Hyphenation controls. */
function HyphenationControls({
  initial,
  poolDefault,
  unit,
  label,
  onChange,
}: Readonly<{
  initial: SvxHyphenZoneItem | undefined;
  poolDefault: SvxHyphenZoneItem;
  unit: FieldUnit | undefined;
  label: (key: string, fallback: string) => string;
  onChange: (item: SvxHyphenZoneItem | undefined) => void;
}>): React.JSX.Element {
  const [draft, setDraft] = useState(
    /** Reads the native page's saved settings. @returns Initial draft. */ () =>
      resetHyphenation(initial, poolDefault),
  );
  const automatic = draft.automatic === true;

  /** Fills the complete source item after propagating widget edits. @param next - New draft. @returns Nothing. */
  function update(next: HyphenationDraft): void {
    setDraft(next);
    const base = (initial ?? poolDefault).QueryValue();
    const enabled = next.automatic === true;
    const spread = next.across[3] === true;
    const keepType = spread
      ? ParagraphHyphenationKeepType.COLUMN
      : 4 - next.across.lastIndexOf(true) - 1;
    const item = new SvxHyphenZoneItem(enabled, RES_PARATR_HYPHENZONE, {
      ...next.values,
      minLead: enabled ? next.values.minLead : base.minLead,
      minTrail: enabled ? next.values.minTrail : base.minTrail,
      compoundMinLead: enabled ? next.values.compoundMinLead : base.compoundMinLead,
      compoundMinTrail: enabled ? next.values.compoundMinTrail : base.compoundMinTrail,
      minWordLength: enabled ? next.values.minWordLength : base.minWordLength,
      noCaps: next.caps !== true,
      noLastWord: next.lastWord !== true,
      keepLine: next.moveLine !== true,
      keep: !spread,
      keepType,
    });
    onChange(initial?.equals(item) ? undefined : item);
  }

  /** Applies the pinned cascade for the selected scope, including Move Line sensitivity. @param index - Scope changed. @returns Nothing. */
  function toggleBoundary(index: number): void {
    const current = draft.across[index];
    const next = current === true ? (initial ? false : null) : current !== null;
    const across = draft.across.map(
      /** Mirrors native implicit neighbor toggles. @param value - Current scope state. @param position - Scope order. @returns New state. */
      (value, position) => {
        if (position === index) return next;
        if (next === true && position < index) return true;
        if (next !== true && position > index) return false;
        return value;
      },
    );
    update({ ...draft, across, moveLine: across[3] === true ? false : draft.moveLine });
  }

  /** Writes one bounded numeric widget. @param key - Native numeric field. @param value - Edited amount. @returns Nothing. */
  function numberChange(key: keyof HyphenZoneSettings, value: number): void {
    update({ ...draft, values: { ...draft.values, [key]: value } });
  }

  /** Renders a native checkbox and its initial mixed state. @param caption - Control label. @param checked - Current exact or mixed state. @param update - Toggle handler. @param disabled - Native sensitivity. @returns Checkbox. */
  function checkbox(
    caption: string,
    checked: boolean | null,
    update: (checked: boolean) => void,
    disabled = false,
  ): React.JSX.Element {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={checked === true}
          disabled={disabled}
          ref={
            /** Marks the mixed search value. @param input - Checkbox. @returns Nothing. */
            (input) => {
              if (input) input.indeterminate = checked === null;
            }
          }
          onChange={
            /** Forwards the browser toggle. @param event - Checkbox change. @returns Nothing. */
            (event) => update(event.currentTarget.checked)
          }
        />
        {caption}
      </label>
    );
  }

  /** Renders one native zone in the current Writer measurement unit. @param caption - Zone label. @param field - Zone item field. @param disabled - Native sensitivity. @param inheritZero - Whether zero is presented as empty. @returns Metric control. */
  function zone(
    caption: string,
    field: "zone" | (typeof hyphenBoundaries)[number][0],
    disabled: boolean,
    inheritZero = false,
  ): React.JSX.Element {
    return (
      <label className="grid gap-1 text-sm">
        {caption}
        <MetricSpinButton
          aria-label={caption}
          className="w-24 rounded border border-slate-400 p-1"
          value={inheritZero && draft.values[field] === 0 ? undefined : draft.values[field]}
          unit={unit ?? FieldUnit.CM}
          maximum={31680}
          disabled={disabled}
          onValueChange={
            /** Stages the zone in its native twips. @param value - Converted measure. @returns Nothing. */
            (value) => numberChange(field, value)
          }
          onBlur={
            /** A cleared boundary zone inherits the surrounding zone. @param event - Focus departure. @returns Nothing. */
            (event) => {
              if (inheritZero && event.currentTarget.value === "" && draft.values[field] !== 0)
                numberChange(field, 0);
            }
          }
        />
      </label>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
        <legend className="text-sm">{label("hyphenation", "Hyphenation")}</legend>
        {checkbox(
          label("hyphen-automatic", "Automatically"),
          draft.automatic,
          /** Native mixed state toggles to off before its first on state. @returns Nothing. */
          () => update({ ...draft, automatic: draft.automatic === false }),
        )}
        {checkbox(
          label("hyphen-caps", "Hyphenate words in CAPS"),
          draft.caps,
          /** Updates the native caps flag. @param caps - Whether caps are allowed. @returns Nothing. */
          (caps) => update({ ...draft, caps }),
          !automatic,
        )}
        {checkbox(
          label("hyphen-last-word", "Hyphenate last word"),
          draft.lastWord,
          /** Updates the last word flag. @param lastWord - Whether it is allowed. @returns Nothing. */
          (lastWord) => update({ ...draft, lastWord }),
          !automatic,
        )}
        {hyphenCounts.map(
          /** Renders the discrete native spin widgets. @param count - Widget binding. @returns Field. */
          ([field, key, caption, min, max]) => (
            <label key={field} className="flex items-center justify-between gap-2 text-sm">
              {label(key, caption)}
              <input
                type="number"
                className="w-16 rounded border border-slate-400 p-1"
                min={min}
                max={max}
                disabled={!automatic}
                value={draft.values[field]}
                onChange={
                  /** Records a valid whole-character or line count. @param event - Spin change. @returns Nothing. */
                  (event) => {
                    if (event.currentTarget.validity.valid && event.currentTarget.value !== "")
                      numberChange(field, event.currentTarget.valueAsNumber);
                  }
                }
              />
            </label>
          ),
        )}
        {zone(label("hyphen-zone", "Hyphenation zone"), "zone", !automatic)}
      </fieldset>
      <fieldset className="grid content-start gap-2 rounded border border-slate-200 p-2">
        <legend className="text-sm">{label("hyphen-across", "Hyphenation across")}</legend>
        {hyphenBoundaries.map(
          /** Renders the four cascading native boundaries and their zone fields. @param boundary - Boundary binding. @param index - Native order. @returns Controls. */
          ([field, key, caption, zoneCaption], index) => (
            <div key={key} className="grid grid-cols-2 items-center gap-2">
              {checkbox(
                label("hyphen-across." + key, caption),
                draft.across[index] ?? null,
                /** Routes the cascade toggle. @returns Nothing. */
                () => toggleBoundary(index),
                !automatic,
              )}
              {zone(
                label("hyphen-end-zone." + key, zoneCaption),
                field,
                !automatic || draft.across[index] !== true,
                true,
              )}
            </div>
          ),
        )}
        {checkbox(
          label("hyphen-move-line", "Move Line"),
          draft.moveLine,
          /** Saves the native moved-line setting. @param moveLine - Whether the full line is moved. @returns Nothing. */
          (moveLine) => update({ ...draft, moveLine }),
          !automatic || draft.across[3] === true,
        )}
      </fieldset>
    </div>
  );
}
