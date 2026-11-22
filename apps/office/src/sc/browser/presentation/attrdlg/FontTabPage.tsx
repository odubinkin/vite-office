/** @fileoverview Calc presentation of the source character-name page over all three script item groups. */
import { useEffect, useId, useState } from "react";
import { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SvxFontItem } from "../../../../editeng/source/items/textitem.font";
import { SvxFontHeightItem } from "../../../../editeng/source/items/textitem.height";
import { SvxLanguageItem } from "../../../../editeng/source/items/textitem.language";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { FALLBACK_FONT_FAMILIES, FontList } from "../../../../svtools/browser/font-list";
import { getBrowserPreviewMetric } from "../../../../svtools/browser/font-preview-resources";
import {
  describeLanguage,
  getLanguageChoices,
  sortLanguageChoices,
} from "../../../../svx/source/dialog/langbox";
import { FontItalic as I, FontWeight as W } from "../../../../tools/inc/fontenum";
import { fontGroups as groups, type ScAttrDlg } from "../../../source/ui/attrdlg/attrdlg";

/** One native script's attribute owners. */
type FontGroup = (typeof groups)[number];

/** Native style row. */
interface FontStyle {
  readonly name: string;
  readonly weight: W;
  readonly posture: I;
}

const standardStyles: readonly FontStyle[] = [
  { name: "Regular", weight: W.WEIGHT_NORMAL, posture: I.ITALIC_NONE },
  { name: "Italic", weight: W.WEIGHT_NORMAL, posture: I.ITALIC_NORMAL },
  { name: "Bold", weight: W.WEIGHT_BOLD, posture: I.ITALIC_NONE },
  { name: "Bold Italic", weight: W.WEIGHT_BOLD, posture: I.ITALIC_NORMAL },
];
const field = "w-full min-w-0 rounded border border-slate-300 bg-white px-2 py-1 text-sm";

/** Maps a typeface to its script-aware character-name state. */
interface Props {
  readonly model: ScAttrDlg;
  readonly onChange: (items: readonly SfxPoolItem[]) => void;
}

/** Owns the original Western controls and two-script notebook. @param props - Native input and output. @returns Font tab. */
export function FontTabPage(props: Props): React.JSX.Element {
  const [list, setList] = useState<FontList>();
  const [complex, setComplex] = useState(false);
  const id = useId();
  useEffect(
    /** Resolves browser device fonts without requiring local font permission. @returns Unmount guard. */
    () => {
      let mounted = true;
      void FontList.FromBrowser().then(
        /** Supplies the native device font list. @param fonts - Resolved fonts. @returns Nothing. */
        (fonts) => {
          if (mounted) setList(fonts);
        },
      );
      return /** Releases the browser font inventory callback. @returns Nothing. */ () => {
        mounted = false;
      };
    },
    [],
  );
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <fieldset className="grid min-w-0 content-start gap-2 rounded border p-3">
        <legend className="px-1 text-sm font-medium">Western</legend>
        <FontGroupFields {...props} group={groups[0]} list={list} />
      </fieldset>
      <div className="min-w-0 rounded border p-3">
        <div role="tablist" aria-label="Asian and Complex scripts" className="flex gap-2 border-b">
          <button
            type="button"
            role="tab"
            id={id + "-asian"}
            aria-controls={id + "-other"}
            aria-selected={!complex}
            className="px-2 py-1 aria-selected:border-b-2"
            onClick={/** Shows the Asian script page. @returns Nothing. */ () => setComplex(false)}
          >
            Asian
          </button>
          <button
            type="button"
            role="tab"
            id={id + "-complex"}
            aria-controls={id + "-other"}
            aria-selected={complex}
            className="px-2 py-1 aria-selected:border-b-2"
            onClick={/** Shows the Complex script page. @returns Nothing. */ () => setComplex(true)}
          >
            Complex
          </button>
        </div>
        <div
          id={id + "-other"}
          role="tabpanel"
          aria-labelledby={id + (complex ? "-complex" : "-asian")}
          className="grid gap-2 pt-2"
        >
          <FontGroupFields
            key={String(complex)}
            {...props}
            group={complex ? groups[2] : groups[1]}
            list={list}
          />
        </div>
      </div>
    </div>
  );
}

/** Returns a stable identity for one physical weight/posture pair. @param style - Device style row. @returns Style identity. */
function styleKey(style: FontStyle): string {
  return `${style.weight}:${style.posture}`;
}

/** Binds one native script group. @param props - Font inventory and item-set bindings. @returns Controls and preview. */
function FontGroupFields({
  model,
  onChange,
  group,
  list,
}: Props & {
  readonly group: FontGroup;
  readonly list: FontList | undefined;
}): React.JSX.Element {
  const familyOptions = useId();
  const font = model.GetItem<SvxFontItem>(group.font);
  const family = font?.GetFamilyName() ?? "";
  const [familyDraft, setFamilyDraft] = useState<string>();
  const weight = model.GetItem<SvxWeightItem>(group.weight)?.GetValue();
  const posture = model.GetItem<SvxPostureItem>(group.posture)?.GetValue();
  const height = model.GetItem<SvxFontHeightItem>(group.height)?.GetHeight();
  const language = model.GetItem<SvxLanguageItem>(group.language)?.GetLanguage();
  const [languageRows] = useState(
    /** Loads the source language rows for this script. @returns Language rows. */ () => {
      const choices = getLanguageChoices(group.script);
      return [...choices.slice(0, 4), ...sortLanguageChoices(choices.slice(4), "en")];
    },
  );
  const styles = new Map<string, FontStyle>();
  for (const face of list?.GetBrowserFaces(family) ?? []) {
    const metric = getBrowserPreviewMetric(face);
    const style = {
      name: metric.GetStyleName(),
      weight: metric.GetWeight(),
      posture: metric.GetItalic(),
    };
    if (style.name) styles.set(styleKey(style), style);
  }
  for (const style of standardStyles) {
    if (!styles.has(styleKey(style))) styles.set(styleKey(style), style);
  }
  const current = weight === undefined || posture === undefined ? "" : `${weight}:${posture}`;
  if (current && !styles.has(current) && weight !== undefined && posture !== undefined) {
    styles.set(current, { name: font?.GetStyleName() || "Custom", weight, posture });
  }

  /** Stages a family edit using the source font item and optional device metric. @param name - Entered family. @param selected - Chosen style. @returns Nothing. */
  function changeFont(name: string, selected?: FontStyle): void {
    if (!name.trim()) return;
    const face = list?.GetBrowserFaces(name)[0];
    const metric = face ? getBrowserPreviewMetric(face) : undefined;
    const item = font?.Clone() ?? new SvxFontItem(group.font);
    item.SetFamilyName(name);
    item.SetStyleName(selected?.name ?? "");
    if (metric) {
      item.SetFamily(metric.GetFamilyType());
      item.SetPitch(metric.GetPitch());
      item.SetCharSet(metric.GetCharSet());
    }
    onChange(
      selected
        ? [
            item,
            new SvxWeightItem(selected.weight, group.weight),
            new SvxPostureItem(selected.posture, group.posture),
          ]
        : [item],
    );
  }

  return (
    <>
      <label className="grid gap-1 text-sm">
        Family
        <input
          className={field}
          list={familyOptions}
          value={familyDraft ?? family}
          onChange={
            /** Edits the current font family. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => {
              const value = event.currentTarget.value;
              setFamilyDraft(value);
              changeFont(value);
            }
          }
          onBlur={
            /** Clears the temporary family draft after editing. @returns Nothing. */ () =>
              setFamilyDraft(undefined)
          }
        />
        <datalist id={familyOptions}>
          {(list?.GetFontNames() ?? FALLBACK_FONT_FAMILIES).map(
            /** Projects one device font family. @param name - New control value. @returns Choice. */ (
              name,
            ) => (
              <option key={name} value={name} />
            ),
          )}
        </datalist>
      </label>
      <label className="grid gap-1 text-sm">
        Style
        <select
          className={field}
          value={current}
          onChange={
            /** Stages the selected font style. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => {
              const selected = styles.get(event.currentTarget.value);
              if (selected)
                changeFont(
                  family || model.GetDefaultItem<SvxFontItem>(group.font).GetFamilyName(),
                  selected,
                );
            }
          }
        >
          {!current && <option value="" hidden />}
          {[...styles].map(
            /** Projects a native weight and posture pair. @param row - Source choice. @returns Choice. */ ([
              value,
              style,
            ]) => (
              <option key={value} value={value}>
                {style.name}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Size
        <input
          className={field}
          type="number"
          step={0.1}
          min={2}
          max={999.9}
          value={height === undefined ? "" : height / 20}
          onChange={
            /** Stages the chosen size in native twips. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => {
              const size = event.currentTarget.valueAsNumber;
              if (size >= 2 && size <= 999.9)
                onChange([new SvxFontHeightItem(Math.round(size * 20), 100, group.height)]);
            }
          }
        />
      </label>
      <label className="grid gap-1 text-sm">
        Language
        <select
          className={field}
          value={language ?? ""}
          onChange={
            /** Updates the selected language item. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => onChange([new SvxLanguageItem(Number(event.currentTarget.value), group.language)])
          }
        >
          {language === undefined && <option value="" hidden />}
          {language !== undefined &&
            !languageRows.some(
              /** Checks whether the native language is listed. @param row - Source choice. @returns Whether present. */ ({
                id,
              }) => id === language,
            ) && <option value={language}>{describeLanguage(language)}</option>}
          {languageRows.map(
            /** Projects one source language row. @param row - Source choice. @returns Choice. */ ({
              id,
              name,
            }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ),
          )}
        </select>
      </label>
      <output
        aria-label={group.name + " font preview"}
        className="block min-h-10 overflow-hidden rounded border p-2"
        style={{
          fontFamily: family || undefined,
          fontSize: height === undefined ? undefined : `${height / 20}pt`,
          fontWeight: weight && weight >= W.WEIGHT_BOLD ? "bold" : undefined,
          fontStyle: posture ? "italic" : undefined,
        }}
      >
        {typeof model.sample === "string" && model.sample
          ? model.sample
          : group.name === "Asian"
            ? "文字サンプル"
            : group.name === "Complex"
              ? "نموذج الخط"
              : "Sample text"}
      </output>
    </>
  );
}
