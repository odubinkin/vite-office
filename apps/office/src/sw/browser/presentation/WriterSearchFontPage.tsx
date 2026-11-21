/** @fileoverview Browser binding of SvxCharNamePage's three script groups over Writer character items. */
import { useEffect, useId, useImperativeHandle, useMemo, useRef, useState, type Ref } from "react";
import { ASIAN, COMPLEX } from "../../../offapi/com/sun/star/i18n/ScriptType";
import { getScriptType } from "../../../i18nlangtag/source/isolang/mslangid.script";
import { FontItalic, FontWeight } from "../../../tools/inc/fontenum";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../svtools/browser/font-list";
import { getBrowserPreviewMetric } from "../../../svtools/browser/font-preview-resources";
import {
  describeLanguage,
  getLanguageChoices,
  resolveEditedLanguage,
  sortLanguageChoices,
} from "../../../svx/source/dialog/langbox";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import {
  fontGroups,
  fontWeights,
  postures,
  readSearchFormatValue,
} from "./writer-search-format-values";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";

const normal = FontWeight.WEIGHT_NORMAL;
const bold = FontWeight.WEIGHT_BOLD;
const upright = FontItalic.ITALIC_NONE;
const italic = FontItalic.ITALIC_NORMAL;

/** One device style pair or one of the source search-only overrides. */
interface StyleChoice {
  readonly caption: string;
  readonly weight?: FontWeight;
  readonly posture?: FontItalic;
}

const standardStyles: readonly StyleChoice[] = [
  { caption: "Regular", weight: normal, posture: upright },
  { caption: "Italic", weight: normal, posture: italic },
  { caption: "Bold", weight: bold, posture: upright },
  { caption: "Bold Italic", weight: bold, posture: italic },
];
const notBold: StyleChoice = { caption: "Not Bold", weight: normal };
const notItalic: StyleChoice = { caption: "Not Italic", posture: upright };

/** Identifies two physical styles that produce the same represented search items. @param style - Available style. @returns Pair or one-sided override identity. */
function styleId(style: StyleChoice): string {
  return `${style.weight ?? ""}:${style.posture ?? ""}`;
}

/** Lists available native-style pairs and the search-only choices. @param list - Browser device font list. @param family - Entered family. @returns Styles that can be expressed with actual weight and posture values. */
function getStyles(list: FontList | undefined, family: string): readonly StyleChoice[] {
  const actual = new Map<string, StyleChoice>();
  for (const face of list?.GetBrowserFaces(family) ?? []) {
    const metric = getBrowserPreviewMetric(face);
    const weight = metric.GetWeight();
    const posture = metric.GetItalic();
    if (weight === FontWeight.WEIGHT_DONTKNOW || posture === FontItalic.ITALIC_DONTKNOW) continue;
    const standard = standardStyles.find(
      /** Looks up the native standard name for this pair. @param style - Standard option. @returns Whether the pair matches. */
      (style) => style.weight === weight && style.posture === posture,
    );
    const caption = metric.GetStyleName() || standard?.caption;
    if (caption === undefined) continue;
    const choice = { caption, weight, posture };
    const key = styleId(choice);
    if (!actual.has(key)) actual.set(key, choice);
  }
  if (actual.size === 0) return [...standardStyles, notBold, notItalic];
  const physical = [...actual.values()];
  const italicFace = physical.some(
    /** Tests whether the family has italic in the normal weight group. @param face - Native pair. @returns Whether it is present. */
    (face) => face.posture !== upright && (face.weight ?? normal) <= normal,
  );
  const boldFace = physical.some(
    /** Tests whether the family has upright bold. @param face - Native pair. @returns Whether it is present. */
    (face) => face.posture === upright && (face.weight ?? normal) > normal,
  );
  const regularFace = physical.some(
    /** Tests whether the family has upright normal weight. @param face - Native pair. @returns Whether it is present. */
    (face) => face.posture === upright && (face.weight ?? normal) <= normal,
  );
  const boldItalicFace = physical.some(
    /** Tests whether the family has bold italic. @param face - Native pair. @returns Whether it is present. */
    (face) => face.posture !== upright && (face.weight ?? normal) > normal,
  );
  const synthesis = [
    false,
    regularFace && !italicFace,
    regularFace && !boldFace,
    !boldItalicFace && (regularFace || italicFace || boldFace),
  ];
  return [
    ...physical,
    ...standardStyles.filter(
      /** Synthesizes only the source missing standard styles. @param choice - Standard option. @param index - Standard index. @returns Whether to present the option. */
      (choice, index) => synthesis[index] && !actual.has(styleId(choice)),
    ),
    notBold,
    notItalic,
  ];
}

/** Native Which mappings per script group. */
type FontGroup = (typeof fontGroups)[number];

/** Parent page values and delta port. */
interface FontPageProperties {
  readonly value: (which: number) => string;
  readonly initial: (which: number) => string;
  readonly change: (which: number, value: string) => void;
  readonly label: (key: string, fallback: string) => string;
}

/** A native font page publishes its staged style changes together. */
export interface WriterSearchFontPageHandle {
  GetStyleChanges(): ReadonlyMap<number, string>;
}

/** Reads the saved style from both concrete criteria. @param group - Active script group. @param props - Native input items. @returns Pair identity or an unset style. */
function getSavedStyle(group: FontGroup, props: FontPageProperties): string {
  const weight = props.initial(group.weight);
  const posture = props.initial(group.posture);
  return weight !== "" && posture !== "" ? `${weight}:${posture}` : "";
}

/** Gets the style list and retains an earlier exact pair which the device did not enumerate. @param list - Browser device inventory. @param group - Active script group. @param props - Native input items. @returns Original entries and the saved pair if needed. */
function getGroupStyles(
  list: FontList | undefined,
  group: FontGroup,
  props: FontPageProperties,
): readonly StyleChoice[] {
  const styles = [...getStyles(list, props.value(group.family))];
  const savedStyle = getSavedStyle(group, props);
  if (
    savedStyle &&
    !styles.some(
      /** Tests whether the saved values have an existing row. @param choice - Available style. @returns Whether it represents the exact pair. */
      (choice) => styleId(choice) === savedStyle,
    )
  ) {
    const weight = Number(props.initial(group.weight));
    const posture = Number(props.initial(group.posture));
    const weightText = new Map<number, string>(fontWeights).get(weight) ?? String(weight);
    const postureText = new Map<number, string>(postures).get(posture) ?? String(posture);
    // A saved pair is an editable entry when it is absent from the device list.
    styles.push({
      caption: posture === upright ? weightText : `${weightText} ${postureText}`,
      weight,
      posture,
    });
  }
  return styles;
}

/** Binds one visible font group's controls to its distinct native attributes. @param props - Script, inventory and native value callbacks. @returns Font controls. */
function FontGroupControls(
  props: FontPageProperties &
    Readonly<{
      group: FontGroup;
      fontList?: FontList | undefined;
      styles: readonly StyleChoice[];
      style: string;
      changeFamily: (value: string) => void;
      changeStyle: (value: string) => void;
    }>,
): React.JSX.Element {
  const localization = useBrowserLocalization();
  const { group } = props;
  const familyList = useId();
  const languageList = useId();
  const [editedLanguage, setEditedLanguage] = useState<string>();
  const family = props.value(group.family);
  const languageValue = props.value(group.language);
  const languageChoices = useMemo(
    /** Projects source labels in the current browser locale. @returns Special and sorted script choices. */
    () => {
      const choices = getLanguageChoices(group.script).map(
        /** Localizes a native resource through the browser catalog. @param row - Native language choice. @returns Display choice. */
        (row) => ({
          ...row,
          name: localization.GetText(`writer.search.format.language-value.${row.id}`, row.name),
        }),
      );
      return [
        ...choices.slice(0, 4),
        ...sortLanguageChoices(choices.slice(4), localization.locale),
      ];
    },
    [localization, group.script],
  );

  /** Stages a typed tag in the script group where it belongs. @param id - Native language identity. @returns Nothing. */
  function chooseTypedLanguage(id: number): void {
    const script = getScriptType(id);
    const target =
      script === ASIAN ? fontGroups[1] : script === COMPLEX ? fontGroups[2] : fontGroups[0];
    props.change(target.language, String(id));
  }

  const languageText =
    languageValue === ""
      ? ""
      : (languageChoices.find(
          /** Finds the stored native language. @param row - Choice. @returns Whether the ID matches. */
          (row) => String(row.id) === languageValue,
        )?.name ?? describeLanguage(Number(languageValue)));
  return (
    <>
      <label className="grid gap-1 text-sm">
        {props.label("family", "Family")}
        <input
          className="rounded border border-slate-400 p-1"
          list={familyList}
          value={family}
          onChange={
            /** Stages the font family. @param event - Edited family. @returns Nothing. */ (
              event,
            ) => props.changeFamily(event.currentTarget.value)
          }
        />
        <datalist id={familyList}>
          {(props.fontList?.GetFontNames() ?? FALLBACK_FONT_FAMILIES).map(
            /** Renders an available family. @param name - Font family. @returns Choice. */ (
              name,
            ) => (
              <option key={name} value={name} />
            ),
          )}
        </datalist>
      </label>
      <label className="grid gap-1 text-sm">
        {props.label("font-style", "Style")}
        <select
          className="rounded border border-slate-400 p-1"
          value={props.style}
          onChange={
            /** Selects the font style. @param event - Selected row. @returns Nothing. */ (event) =>
              props.changeStyle(event.currentTarget.value)
          }
        >
          <option value="" />
          {props.styles.map(
            /** Renders one style. @param style - Native style binding. @returns Choice. */ (
              style,
            ) => (
              <option key={styleId(style)} value={styleId(style)}>
                {props.label(`font-style.${styleId(style)}`, style.caption)}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        {props.label("size", "Size")}
        <input
          type="number"
          min={1}
          max={999.9}
          step={0.1}
          className="rounded border border-slate-400 p-1"
          value={props.value(group.size)}
          onChange={
            /** Stages the absolute point height. @param event - Current value. @returns Nothing. */ (
              event,
            ) => props.change(group.size, event.currentTarget.value)
          }
        />
      </label>
      <label className="grid gap-1 text-sm">
        {props.label("language", "Language")}
        <input
          className="rounded border border-slate-400 p-1"
          list={languageList}
          value={editedLanguage ?? languageText}
          onChange={
            /** Applies known rows immediately and retains typed language tags. @param event - Edited value. @returns Nothing. */
            (event) => {
              const value = event.currentTarget.value;
              const choice = languageChoices.find(
                /** Finds the selected display label. @param row - Choice. @returns Whether the text matches. */
                (row) => row.name === value,
              );
              if (choice === undefined) setEditedLanguage(value);
              else {
                setEditedLanguage(undefined);
                props.change(group.language, String(choice.id));
              }
            }
          }
          onBlur={
            /** Resolves a typed BCP47 language and restores the previous entry when invalid. @returns Nothing. */
            () => {
              if (editedLanguage === undefined) return;
              setEditedLanguage(undefined);
              const id = resolveEditedLanguage(editedLanguage);
              if (id !== undefined) chooseTypedLanguage(id);
            }
          }
          onKeyDown={
            /** Commits typed language before the dialog accepts. @param event - Keyboard event. @returns Nothing. */
            (event) => {
              if (event.key === "Enter" && editedLanguage !== undefined) {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }
          }
        />
        <datalist id={languageList}>
          {languageChoices.map(
            /** Renders a source language choice. @param row - Choice. @returns Datalist row. */ (
              row,
            ) => (
              <option key={row.id} value={row.name} />
            ),
          )}
        </datalist>
      </label>
    </>
  );
}

/** Shows the native Western group beside the Asian and Complex notebook. @param props - Criteria, selected script and native page output. @returns Font tab. */
export function WriterSearchFontPage({
  ref,
  ...props
}: FontPageProperties &
  Readonly<{
    pool: SfxItemPool;
    complex: boolean;
    onComplexChange: (complex: boolean) => void;
    ref: Ref<WriterSearchFontPageHandle>;
  }>): React.JSX.Element {
  const tabs = useId();
  const [fontList, setFontList] = useState<FontList>();
  const [edits, setEdits] = useState<ReadonlyMap<number, string>>(new Map());
  const lastFilledGroup = useRef<FontGroup>(fontGroups[2]);
  const asianTab = useRef<HTMLButtonElement>(null);
  const complexTab = useRef<HTMLButtonElement>(null);

  useEffect(
    /** Acquires the device inventory once for the full native page. @returns Cleanup. */
    () => {
      let active = true;
      void FontList.FromBrowser().then(
        /** Supplies the shared font inventory to all three script groups. @param list - Device fonts. @returns Nothing. */
        (list) => {
          if (active) setFontList(list);
        },
      );
      return /** Discards late results after closing the page. @returns Nothing. */ () => {
        active = false;
      };
    },
    [],
  );

  useImperativeHandle(
    ref,
    /** Collects the committed style items with the source's shared extra-entry offset. @returns Native page output port. */
    () => ({
      /** Reads all three groups when the dialog accepts. @returns Style deltas keyed by Which. */
      GetStyleChanges() {
        const result = new Map<number, string>();
        // The original FontStyleBox fill records a single search-only entry index for the page.
        const boundary =
          getStyles(fontList, props.value(lastFilledGroup.current.family)).length - 2;
        for (const group of fontGroups) {
          const styles = getGroupStyles(fontList, group, props);
          const saved = getSavedStyle(group, props);
          const id = edits.get(group.script) ?? saved;
          const position = styles.findIndex(
            /** Finds the source-style row used during conversion. @param style - Style choice. @returns Whether it is selected. */
            (style) => styleId(style) === id,
          );
          const choice = styles[position];
          if (!choice) continue;
          // Saved values absent from the inventory are editable text, whose native find_text is -1.
          const nativePosition = getStyles(fontList, props.value(group.family)).findIndex(
            /** Looks up the selected row in the device list. @param style - Native row. @returns Whether it is selected. */
            (style) => styleId(style) === id,
          );
          if (nativePosition >= boundary) {
            if (nativePosition === boundary) result.set(group.weight, String(normal));
            if (nativePosition === boundary + 1) result.set(group.posture, String(upright));
            continue;
          }
          const weight = choice.weight ?? normal;
          const posture = choice.posture ?? upright;
          const previousWeight = Number(
            props.initial(group.weight) ||
              readSearchFormatValue(props.pool.GetUserOrPoolDefaultItem(group.weight)),
          );
          const previousPosture = Number(
            props.initial(group.posture) ||
              readSearchFormatValue(props.pool.GetUserOrPoolDefaultItem(group.posture)),
          );
          if (
            weight !== previousWeight ||
            (saved === "" && !(weight === normal && posture !== upright))
          )
            result.set(group.weight, String(weight));
          if (
            posture !== previousPosture ||
            (saved === "" && !(posture === upright && weight !== normal))
          )
            result.set(group.posture, String(posture));
        }
        return result;
      },
    }),
    [fontList, edits, props],
  );

  /** Renders one independent script group using the shared device font list. @param group - Script-specific Which bindings. @returns Group controls. */
  function controls(group: FontGroup): React.JSX.Element {
    return (
      <FontGroupControls
        {...props}
        group={group}
        fontList={fontList}
        styles={getGroupStyles(fontList, group, props)}
        style={edits.get(group.script) ?? getSavedStyle(group, props)}
        changeFamily={
          /** Fills that script's style list for the newly selected family. @param value - Edit text. @returns Nothing. */
          (value) => {
            lastFilledGroup.current = group;
            props.change(group.family, value);
          }
        }
        changeStyle={
          /** Records that script's active style independently. @param value - Style identity. @returns Nothing. */
          (value) =>
            setEdits(
              /** Keeps the other scripts' selections. @param current - Previous choices. @returns Updated choices. */
              (current) => new Map(current).set(group.script, value),
            )
        }
      />
    );
  }

  const west = props.label("font-western", "Western");
  const asian = props.label("font-asian", "Asian");
  const complex = props.label("font-complex", "Complex");
  return (
    <div className="grid min-w-0 gap-3 sm:grid-cols-2">
      <fieldset
        aria-label={west}
        className="grid min-w-0 content-start gap-2 rounded border border-slate-200 p-2"
      >
        <legend className="text-sm">{west}</legend>
        {controls(fontGroups[0])}
      </fieldset>
      <div className="min-w-0 rounded border border-slate-200 p-2">
        <div
          className="flex gap-2 border-b"
          role="tablist"
          aria-label={props.label("font-other-scripts", "Asian and Complex")}
        >
          <button
            ref={asianTab}
            type="button"
            role="tab"
            id={`${tabs}-asian`}
            aria-controls={`${tabs}-asian-panel`}
            aria-selected={!props.complex}
            tabIndex={props.complex ? -1 : 0}
            className="px-2 py-1 aria-selected:border-b-2"
            onClick={
              /** Shows Asian font controls. @returns Nothing. */ () => props.onComplexChange(false)
            }
            onKeyDown={
              /** Navigates the native two-page notebook. @param event - Key event. @returns Nothing. */
              (event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "End")
                  return;
                event.preventDefault();
                props.onComplexChange(true);
                complexTab.current?.focus();
              }
            }
          >
            {asian}
          </button>
          <button
            ref={complexTab}
            type="button"
            role="tab"
            id={`${tabs}-complex`}
            aria-controls={`${tabs}-complex-panel`}
            aria-selected={props.complex}
            tabIndex={props.complex ? 0 : -1}
            className="px-2 py-1 aria-selected:border-b-2"
            onClick={
              /** Shows Complex font controls. @returns Nothing. */ () =>
                props.onComplexChange(true)
            }
            onKeyDown={
              /** Navigates the native two-page notebook. @param event - Key event. @returns Nothing. */
              (event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home")
                  return;
                event.preventDefault();
                props.onComplexChange(false);
                asianTab.current?.focus();
              }
            }
          >
            {complex}
          </button>
        </div>
        <div
          id={`${tabs}-asian-panel`}
          role="tabpanel"
          aria-labelledby={`${tabs}-asian`}
          hidden={props.complex}
          className={props.complex ? undefined : "grid gap-2 pt-2"}
        >
          {controls(fontGroups[1])}
        </div>
        <div
          id={`${tabs}-complex-panel`}
          role="tabpanel"
          aria-labelledby={`${tabs}-complex`}
          hidden={!props.complex}
          className={props.complex ? "grid gap-2 pt-2" : undefined}
        >
          {controls(fontGroups[2])}
        </div>
      </div>
    </div>
  );
}
