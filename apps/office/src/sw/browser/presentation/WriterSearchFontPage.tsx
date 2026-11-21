/** @fileoverview Browser binding of SvxCharNamePage's Western search controls over Writer character items. */
import { useEffect, useId, useMemo, useState } from "react";
import { ASIAN, COMPLEX, LATIN } from "../../../offapi/com/sun/star/i18n/ScriptType";
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
import { fontWeights, postures } from "./writer-search-format-values";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import {
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_WEIGHT,
} from "../../inc/hintids";

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

/** Edits the Western font page's actual search criteria. @param props - Current values, saved baseline and dialog output port. @returns Font controls. */
export function WriterSearchFontPage(
  props: Readonly<{
    value: (which: number) => string;
    initial: (which: number) => string;
    change: (which: number, value: string) => void;
    label: (key: string, fallback: string) => string;
  }>,
): React.JSX.Element {
  const localization = useBrowserLocalization();
  const familyList = useId();
  const languageList = useId();
  const [fontList, setFontList] = useState<FontList>();
  const [editedStyle, setEditedStyle] = useState<string>();
  const [editedLanguage, setEditedLanguage] = useState<string>();
  const family = props.value(RES_CHRATR_FONT);
  const styles = [...getStyles(fontList, family)];
  const oldWeight = props.initial(RES_CHRATR_WEIGHT);
  const oldPosture = props.initial(RES_CHRATR_POSTURE);
  const savedStyle = oldWeight !== "" && oldPosture !== "" ? `${oldWeight}:${oldPosture}` : "";
  if (
    savedStyle &&
    !styles.some(
      /** Tests whether the previous style still appears for this device family. @param choice - Available style. @returns Whether it represents the saved pair. */
      (choice) => styleId(choice) === savedStyle,
    )
  ) {
    const weight = Number(oldWeight);
    const posture = Number(oldPosture);
    const weightText = new Map<number, string>(fontWeights).get(weight) ?? String(weight);
    const postureText = new Map<number, string>(postures).get(posture) ?? String(posture);
    styles.unshift({
      caption: posture === upright ? weightText : `${weightText} ${postureText}`,
      weight,
      posture,
    });
  }
  const currentStyle = editedStyle ?? savedStyle;
  const languageValue = props.value(RES_CHRATR_LANGUAGE);
  const languageChoices = useMemo(
    /** Projects source labels in the current browser locale. @returns Special and sorted script choices. */
    () => {
      const choices = getLanguageChoices(LATIN).map(
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
    [localization],
  );

  useEffect(
    /** Acquires the actual device font families for the open dialog. @returns Cleanup. */
    () => {
      let active = true;
      void FontList.FromBrowser().then(
        /** Publishes the inventory only for the current dialog instance. @param list - Device font list. @returns Nothing. */
        (list) => {
          if (active) setFontList(list);
        },
      );
      return /** Ends the inventory subscription. @returns Nothing. */ () => {
        active = false;
      };
    },
    [],
  );

  /** Applies the original independent search-mode weight and posture rules. @param id - Selected style identity. @returns Nothing. */
  function changeStyle(id: string): void {
    setEditedStyle(id);
    const choice = styles.find(
      /** Finds the selected physical or search-only style. @param row - Candidate. @returns Whether selected. */
      (row) => styleId(row) === id,
    );
    if (choice === notBold || choice === notItalic) {
      props.change(RES_CHRATR_WEIGHT, choice === notBold ? String(normal) : "");
      props.change(RES_CHRATR_POSTURE, choice === notItalic ? String(upright) : "");
      return;
    }
    const weight = choice?.weight;
    const posture = choice?.posture;
    const previousWeight = oldWeight === "" ? normal : Number(oldWeight);
    const previousPosture = oldPosture === "" ? upright : Number(oldPosture);
    props.change(
      RES_CHRATR_WEIGHT,
      weight !== undefined &&
        (weight !== previousWeight ||
          (savedStyle === "" && !(weight === normal && posture !== upright)))
        ? String(weight)
        : "",
    );
    props.change(
      RES_CHRATR_POSTURE,
      posture !== undefined &&
        (posture !== previousPosture ||
          (savedStyle === "" && !(posture === upright && weight !== normal)))
        ? String(posture)
        : "",
    );
  }

  /** Applies the current language entry using its real LanguageType. @param id - Native language identity. @returns Nothing. */
  function chooseLanguage(id: number): void {
    setEditedLanguage(undefined);
    const script = getScriptType(id);
    const which =
      script === ASIAN
        ? RES_CHRATR_CJK_LANGUAGE
        : script === COMPLEX
          ? RES_CHRATR_CTL_LANGUAGE
          : RES_CHRATR_LANGUAGE;
    props.change(which, String(id));
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
            ) => props.change(RES_CHRATR_FONT, event.currentTarget.value)
          }
        />
        <datalist id={familyList}>
          {(fontList?.GetFontNames() ?? FALLBACK_FONT_FAMILIES).map(
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
          value={currentStyle}
          onChange={
            /** Selects the font style. @param event - Selected row. @returns Nothing. */ (event) =>
              changeStyle(event.currentTarget.value)
          }
        >
          <option value="" />
          {styles.map(
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
          value={props.value(RES_CHRATR_FONTSIZE)}
          onChange={
            /** Stages the absolute point height. @param event - Current value. @returns Nothing. */ (
              event,
            ) => props.change(RES_CHRATR_FONTSIZE, event.currentTarget.value)
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
              else chooseLanguage(choice.id);
            }
          }
          onBlur={
            /** Resolves a typed BCP47 language and restores the previous entry when invalid. @returns Nothing. */
            () => {
              if (editedLanguage === undefined) return;
              setEditedLanguage(undefined);
              const id = resolveEditedLanguage(editedLanguage);
              if (id !== undefined) chooseLanguage(id);
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
