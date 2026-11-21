/** @fileoverview Browser presentation of Writer's standard and annotation Character modes. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { SvxBorderTabPage } from "../../../cui/source/tabpages/border";
import { WriterBorderPage } from "./WriterBorderPage";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import * as EE from "../../../editeng/inc/eeitem";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { SvxKerningItem } from "../../../editeng/inc/kernitem";
import * as SW from "../../inc/hintids";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SvxEscapementItem } from "../../../editeng/inc/escapementitem";
import { SvxCaseMapItem } from "../../../editeng/inc/cmapitem";
import { SvxEscapement } from "../../../editeng/inc/svxenum";
import {
  SvxPostureItem,
  SvxOverlineItem,
  SvxTextLineItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { caseEffects, nextWordLineMode, underlines } from "./writer-search-format-values";
import { WriterSearchEmphasisControls } from "./WriterSearchEmphasisControls";
import { SvxEmphasisMarkItem } from "../../../editeng/inc/emphasismarkitem";
import { SvxWordLineModeItem } from "../../../editeng/inc/wrlmitem";
import { SvxCrossedOutItem } from "../../../editeng/source/items/textitem.effects";
import { FontItalic, FontLineStyle, FontStrikeout, FontWeight } from "../../../tools/inc/fontenum";
import { ColorControl } from "../../../svx/browser/tbxctrls/ColorControl";
import { writerColorFromPrimitive, writerColorValue } from "../../source/core/attr/swatrset";

const annotationCharTabs = [
  ["font", "Font"],
  ["fonteffects", "Font Effects"],
  ["position", "Position"],
  ["background", "Background"],
] as const;

const characterItems = {
  annotation: {
    family: EE.EE_CHAR_FONTINFO,
    size: EE.EE_CHAR_FONTHEIGHT,
    weight: EE.EE_CHAR_WEIGHT,
    posture: EE.EE_CHAR_ITALIC,
    underline: EE.EE_CHAR_UNDERLINE,
    overline: EE.EE_CHAR_OVERLINE,
    strike: EE.EE_CHAR_STRIKEOUT,
    wordMode: EE.EE_CHAR_WLM,
    emphasis: EE.EE_CHAR_EMPHASISMARK,
    caseMap: EE.EE_CHAR_CASEMAP,
    position: EE.EE_CHAR_ESCAPEMENT,
    spacing: EE.EE_CHAR_KERNING,
    color: EE.EE_CHAR_COLOR,
    background: EE.EE_CHAR_BKGCOLOR,
  },
  standard: {
    family: SW.RES_CHRATR_FONT,
    size: SW.RES_CHRATR_FONTSIZE,
    weight: SW.RES_CHRATR_WEIGHT,
    posture: SW.RES_CHRATR_POSTURE,
    underline: SW.RES_CHRATR_UNDERLINE,
    overline: SW.RES_CHRATR_OVERLINE,
    strike: SW.RES_CHRATR_CROSSEDOUT,
    wordMode: SW.RES_CHRATR_WORDLINEMODE,
    emphasis: SW.RES_CHRATR_EMPHASIS_MARK,
    caseMap: SW.RES_CHRATR_CASEMAP,
    position: SW.RES_CHRATR_ESCAPEMENT,
    spacing: SW.RES_CHRATR_KERNING,
    color: SW.RES_CHRATR_COLOR,
    background: SW.RES_CHRATR_BACKGROUND,
  },
} as const;

const characterLines = ["overline", "underline"] as const;
/** Decoration item identities on the Font Effects tab. */
type CharacterLine = (typeof characterLines)[number];
/** Pending changes from one line selector and its color palette. */
interface CharacterLineChange {
  readonly style?: FontLineStyle;
  readonly color?: string;
}

/** Presents the represented characterproperties.ui controls over native input and output sets. @param props - Initial attributes and request completion. @returns Character dialog. */
export function WriterCharacterDialog({
  input,
  mode,
  unit,
  initialPage,
  onCancel,
  onSubmit,
}: Readonly<{
  input: SfxItemSet;
  mode: "annotation" | "standard";
  unit: FieldUnit;
  initialPage?: string | undefined;
  onCancel: () => void;
  onSubmit: (output: SfxItemSet) => void;
}>): React.JSX.Element {
  const localization = useBrowserLocalization();
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const formId = useId();
  const characterTabs =
    mode === "standard"
      ? [...annotationCharTabs, ["borders", "Borders"] as const]
      : annotationCharTabs;
  const [tab, setTab] = useState(
    Math.max(
      0,
      characterTabs.findIndex(
        /** Matches the original notebook page name. @param page - Native page entry. @returns Whether requested. */
        ([id]) => id === initialPage,
      ),
    ),
  );
  const [resets, setResets] = useState([0, 0, 0, 0, 0]);
  const [border] = useState(
    /** Opens the native character border page only in standard mode. @returns Border page owner. */
    () => (mode === "standard" ? new SvxBorderTabPage(input, SW.RES_CHRATR_BOX) : undefined),
  );
  const [borderEdited, setBorderEdited] = useState(false);
  const [, refreshBorder] = useState(0);
  const which = characterItems[mode];
  /** Reads a uniform effect, including the original pool default. @param id - Native item identity. @returns Uniform item or undefined for mixed input. */
  function read(id: number) {
    return input.GetItemState(id) >= SfxItemState.DEFAULT ? input.Get(id) : undefined;
  }
  const font = read(which.family);
  const height = read(which.size);
  const weight = read(which.weight);
  const posture = read(which.posture);
  const lines = { overline: read(which.overline), underline: read(which.underline) };
  const strike = read(which.strike);
  const escapement = read(which.position);
  const kerning = read(which.spacing);
  const colorItem = read(which.color);
  const backgroundItem = read(which.background);
  const family = font instanceof SvxFontItem ? font.GetFamilyName() : "";
  const size = height instanceof SvxFontHeightItem ? String(height.GetHeight() / 20) : "";
  const fontStyle =
    weight instanceof SvxWeightItem && posture instanceof SvxPostureItem
      ? String(Number(weight.GetBoolValue()) * 2 + Number(posture.GetBoolValue()))
      : "";
  const spacing = kerning instanceof SvxKerningItem ? String(kerning.GetValue() / 20) : "";
  const initialStrike = strike instanceof SvxCrossedOutItem ? String(strike.GetValue()) : "";
  const [strikethrough, setStrikethrough] = useState(initialStrike);
  const wordModeState = input.GetItemState(which.wordMode);
  const wordModeItem = read(which.wordMode);
  const initialWordMode =
    wordModeItem instanceof SvxWordLineModeItem ? wordModeItem.GetValue() : undefined;
  const [wordMode, setWordMode] = useState(initialWordMode);
  const position =
    escapement instanceof SvxEscapementItem ? String(escapement.GetEscapement()) : "";
  const initialColor =
    colorItem instanceof SvxColorItem ? writerColorValue(colorItem.GetValue()) : "";
  const initialBackground =
    backgroundItem instanceof SvxBrushItem
      ? writerColorValue(backgroundItem.GetColor(), "transparent")
      : backgroundItem instanceof SvxColorItem
        ? writerColorValue(backgroundItem.GetValue(), "transparent")
        : "";
  const caseItem = read(which.caseMap);
  const initialCase = caseItem instanceof SvxCaseMapItem ? String(caseItem.GetCaseMap()) : "";
  const emphasisItem = read(which.emphasis);
  const initialEmphasis =
    emphasisItem instanceof SvxEmphasisMarkItem ? String(emphasisItem.GetEmphasisMark()) : "";
  const [emphasis, setEmphasis] = useState(initialEmphasis);
  const [lineChanges, setLineChanges] = useState<
    Partial<Record<CharacterLine, CharacterLineChange>>
  >({});
  const hasWordLine =
    Number(strikethrough) > 0 ||
    characterLines.some(
      /** Checks the selected decoration style. @param name - Underline or overline. @returns Whether drawn. */
      (name) => {
        const item = lines[name];
        return (
          (lineChanges[name]?.style ??
            (item instanceof SvxTextLineItem ? item.GetLineStyle() : 0)) > 0
        );
      },
    );
  const [color, setColor] = useState(initialColor);
  const [background, setBackground] = useState(initialBackground);
  const title = localization.GetText("writer.character.title", "Character");

  useLayoutEffect(
    /** Opens the platform modal and focuses the selected tab. @returns Nothing. */ () => {
      const element = dialog.current;
      if (!element) return;
      if (typeof element.showModal === "function") element.showModal();
      else element.open = true;
      tabs.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    },
    [],
  );

  /** Releases modal focus before the originating Writer request is completed. @returns Nothing. */
  function close(): void {
    const element = dialog.current;
    if (!element?.open) return;
    if (typeof element.close === "function") element.close();
    else element.open = false;
  }

  /** Cancels the dialog, returning no output items. @returns Nothing. */
  function cancel(): void {
    close();
    onCancel();
  }

  /** Resets the active page to its input attributes. @returns Nothing. */
  function reset(): void {
    setResets(
      /** Remounts only the active page inputs. @param previous - Page revisions. @returns Updated revisions. */
      (previous) =>
        previous.map(
          /** Updates the selected page's revision. @param revision - Page revision. @param index - Native tab index. @returns Revision. */
          (revision, index) => revision + Number(index === tab),
        ),
    );
    if (tab === 1) {
      setColor(initialColor);
      setEmphasis(initialEmphasis);
      setLineChanges({});
      setStrikethrough(initialStrike);
      setWordMode(initialWordMode);
    }
    if (tab === 3) setBackground(initialBackground);
    if (tab === 4) {
      border?.Reset();
      setBorderEdited(false);
    }
  }

  /** Retains the pending fields for one native line item. @param name - Decoration. @param change - Edited values. @returns Nothing. */
  function changeLine(name: CharacterLine, change: CharacterLineChange): void {
    setLineChanges(
      /** Updates one decoration while retaining its other field. @param previous - Pending decorations. @returns Updated decorations. */
      (previous) => ({ ...previous, [name]: { ...previous[name], ...change } }),
    );
  }

  /** Presents a native line selector and its color palette. @param name - Decoration. @param caption - Style caption. @param colorCaption - Palette caption. @returns Controls. */
  function lineControls(
    name: CharacterLine,
    caption: string,
    colorCaption: string,
  ): React.JSX.Element {
    const item = lines[name];
    const original = item instanceof SvxTextLineItem ? item : undefined;
    const pending = lineChanges[name];
    const style = pending?.style ?? original?.GetLineStyle();
    const originalColor = original?.GetColor();
    const color =
      pending?.color ??
      (originalColor === undefined || originalColor.IsFullyTransparent()
        ? "auto"
        : writerColorValue(originalColor));
    return (
      <>
        <label className={fieldClass}>
          {caption}
          <select
            value={style ?? ""}
            className="rounded border border-slate-300 px-2 py-1"
            onChange={
              /** Saves the selected native line style. @param event - Style selection. @returns Nothing. */
              (event) => changeLine(name, { style: Number(event.currentTarget.value) })
            }
          >
            <option value="" disabled />
            {underlines.map(
              /** Presents a native decoration choice. @param entry - Style and caption. @returns Option. */
              ([value, label]) => (
                <option key={value} value={value}>
                  {localization.GetText(`writer.search.format.${name}.${value}`, label)}
                </option>
              ),
            )}
          </select>
        </label>
        <ColorControl
          label={colorCaption}
          property="color"
          value={color}
          fallback="#000000"
          disabled={style === undefined || style === FontLineStyle.LINESTYLE_NONE}
          onColor={
            /** Saves the selected line color. @param _property - Palette family. @param value - Native color choice. @returns Nothing. */
            (_property, value) => changeLine(name, { color: value })
          }
        />
      </>
    );
  }

  /** Builds tab-page output items for changed controls. @param event - Character form submission. @returns Nothing. */
  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const output = new SfxItemSet(input.GetPool(), input.GetRanges());
    const nextFamily = String(values.get("family") ?? "").trim();
    if (nextFamily && nextFamily !== family) {
      const base = input.Get(which.family);
      if (base instanceof SvxFontItem) {
        const item = base.Clone();
        item.SetFamilyName(nextFamily);
        output.Put(item, true);
      }
    }
    const nextSize = String(values.get("size") ?? "");
    if (nextSize && nextSize !== size)
      output.Put(new SvxFontHeightItem(Math.round(Number(nextSize) * 20), 100, which.size), true);
    const nextStyle = String(values.get("style") ?? "");
    if (nextStyle && nextStyle !== fontStyle) {
      output.Put(
        new SvxWeightItem(
          Number(nextStyle) >= 2 ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL,
          which.weight,
        ),
        true,
      );
      output.Put(
        new SvxPostureItem(
          Number(nextStyle) % 2 ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE,
          which.posture,
        ),
        true,
      );
    }
    for (const name of characterLines) {
      const change = lineChanges[name];
      if (change === undefined) continue;
      const original = lines[name];
      const originalStyle =
        original instanceof SvxTextLineItem ? original.GetLineStyle() : undefined;
      const style = change.style ?? originalStyle;
      if (style === undefined) continue;
      const color =
        change.color === undefined
          ? undefined
          : writerColorFromPrimitive(
              change.color === "auto" ? "transparent" : change.color,
              "transparent",
            );
      const item =
        original instanceof SvxTextLineItem
          ? original.Clone()
          : name === "overline"
            ? new SvxOverlineItem(style, which[name])
            : new SvxUnderlineItem(style, which[name]);
      item.SetLineStyle(style);
      if (style !== FontLineStyle.LINESTYLE_NONE && color !== undefined) {
        item.SetColor(color);
        item.setComplexColor(new ComplexColor());
      }
      if (original instanceof SvxTextLineItem && item.equals(original)) item.Dispose();
      else output.Put(item, true);
    }
    if (strikethrough && strikethrough !== initialStrike)
      output.Put(new SvxCrossedOutItem(Number(strikethrough), which.strike), true);
    if (wordMode !== undefined && wordMode !== initialWordMode)
      output.Put(new SvxWordLineModeItem(wordMode, which.wordMode), true);
    const nextCase = String(values.get("caseMap") ?? "");
    if (nextCase !== "" && nextCase !== initialCase)
      output.Put(new SvxCaseMapItem(Number(nextCase), which.caseMap), true);
    if (emphasis !== "" && emphasis !== initialEmphasis)
      output.Put(new SvxEmphasisMarkItem(Number(emphasis), which.emphasis), true);
    const nextPosition = String(values.get("position") ?? "");
    if (nextPosition && nextPosition !== position)
      output.Put(new SvxEscapementItem(Number(nextPosition), which.position), true);
    if (color && color !== initialColor)
      output.Put(new SvxColorItem(writerColorFromPrimitive(color, "auto"), which.color), true);
    const nextSpacing = String(values.get("spacing") ?? "");
    if (nextSpacing && nextSpacing !== spacing) {
      const twips = Math.sign(Number(nextSpacing)) * Math.round(Math.abs(Number(nextSpacing)) * 20);
      output.Put(new SvxKerningItem(twips, which.spacing), true);
    }
    if (background && background !== initialBackground) {
      const resolved = writerColorFromPrimitive(background, "transparent");
      output.Put(
        mode === "standard"
          ? new SvxBrushItem(resolved, which.background)
          : new SvxColorItem(resolved, which.background),
        true,
      );
    }
    if (borderEdited) border?.FillItemSet(output);
    close();
    onSubmit(output);
  }

  const fieldClass = "flex flex-col gap-1";
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      className="m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-950/40"
      onCancel={
        /** Routes Escape through the matching request. @param event - Native cancel event. @returns Nothing. */
        (event) => {
          event.preventDefault();
          cancel();
        }
      }
    >
      <WriterDialogHeader title={title} onClose={cancel} />
      <form onSubmit={submit}>
        <div
          role="tablist"
          aria-label={title}
          ref={tabs}
          className="flex flex-wrap gap-2 border-b border-slate-200 px-4 py-2"
          onKeyDown={
            /** Navigates the original tabs within the modal. @param event - Tab control key. @returns Nothing. */
            (event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const count = characterTabs.length;
              const next = (tab + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
              setTab(next);
              tabs.current?.querySelectorAll("button")[next]?.focus();
            }
          }
        >
          {characterTabs.map(
            /** Renders an original annotation tab. @param page - Native page name and label. @param index - Native page order. @returns Tab. */
            ([id, label], index) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${formId}-tab-${index}`}
                aria-controls={`${formId}-page-${index}`}
                aria-selected={index === tab}
                tabIndex={index === tab ? 0 : -1}
                className="rounded px-2 py-1 text-sm aria-selected:bg-slate-100"
                onClick={/** Switches the selected page. @returns Nothing. */ () => setTab(index)}
              >
                {localization.GetText(`writer.character.tab.${index}`, label)}
              </button>
            ),
          )}
        </div>
        <div className="px-5 py-4">
          <section
            role="tabpanel"
            id={`${formId}-page-0`}
            aria-labelledby={`${formId}-tab-0`}
            hidden={tab !== 0}
            key={`font-${resets[0]}`}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={fieldClass}>
                {localization.GetText("writer.character.family", "Font")}
                <input
                  name="family"
                  defaultValue={family}
                  className="rounded border border-slate-300 px-2 py-1"
                />
              </label>
              <label className={fieldClass}>
                {localization.GetText("writer.character.style", "Style")}
                <select
                  name="style"
                  defaultValue={fontStyle}
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  <option value="" />
                  <option value="0">
                    {localization.GetText("writer.character.regular", "Regular")}
                  </option>
                  <option value="1">
                    {localization.GetText("writer.character.italic", "Italic")}
                  </option>
                  <option value="2">{localization.GetText("writer.character.bold", "Bold")}</option>
                  <option value="3">
                    {localization.GetText("writer.character.boldItalic", "Bold Italic")}
                  </option>
                </select>
              </label>
              <label className={fieldClass}>
                {localization.GetText("writer.character.size", "Size")}
                <input
                  type="number"
                  name="size"
                  min="2"
                  max="999.9"
                  step="any"
                  defaultValue={size}
                  className="rounded border border-slate-300 px-2 py-1"
                />
              </label>
            </div>
          </section>
          <section
            role="tabpanel"
            id={`${formId}-page-1`}
            aria-labelledby={`${formId}-tab-1`}
            hidden={tab !== 1}
            key={`effects-${resets[1]}`}
          >
            <div className="grid gap-3">
              <ColorControl
                label={localization.GetText("writer.character.fontColor", "Font Color")}
                property="color"
                value={color || "auto"}
                fallback="#000000"
                disabled={false}
                onColor={
                  /** Updates the changed foreground color. @param _property - Color family. @param value - Chosen color. @returns Nothing. */ (
                    _property,
                    value,
                  ) => setColor(value)
                }
              />
              {lineControls(
                "overline",
                localization.GetText("writer.search.format.overlining", "Overlining"),
                localization.GetText("writer.search.format.overline-color", "Overline color"),
              )}
              <label className={fieldClass}>
                {localization.GetText("writer.character.strikethrough", "Strikethrough")}
                <select
                  value={strikethrough}
                  onChange={
                    /** Tracks the chosen strikeout for the word-line checkbox. @param event - Style selection. @returns Nothing. */
                    (event) => setStrikethrough(event.currentTarget.value)
                  }
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  <option value="" />
                  <option value={FontStrikeout.STRIKEOUT_NONE}>None</option>
                  <option value={FontStrikeout.STRIKEOUT_SINGLE}>Single</option>
                  <option value={FontStrikeout.STRIKEOUT_DOUBLE}>Double</option>
                </select>
              </label>
              {lineControls(
                "underline",
                localization.GetText("writer.character.underlining", "Underlining"),
                localization.GetText("writer.search.format.underline-color", "Underline color"),
              )}
              {wordModeState !== SfxItemState.UNKNOWN && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={wordMode === true}
                    disabled={!hasWordLine || wordModeState === SfxItemState.DISABLED}
                    ref={
                      /** Paints a mixed selection as indeterminate. @param input - Checkbox element. @returns Nothing. */
                      (input) => {
                        if (input) input.indeterminate = wordMode === undefined;
                      }
                    }
                    onChange={
                      /** Advances the original false, true and mixed cycle. @returns Nothing. */
                      () =>
                        setWordMode(
                          nextWordLineMode(wordMode, wordModeState === SfxItemState.INVALID),
                        )
                    }
                  />
                  {localization.GetText(
                    "writer.search.format.individual-words",
                    "Individual words",
                  )}
                </label>
              )}
              <label className={fieldClass}>
                {localization.GetText("writer.search.format.case", "Effects")}
                <select
                  name="caseMap"
                  defaultValue={initialCase}
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  <option value="" disabled />
                  {caseEffects.map(
                    /** Presents one native case effect. @param entry - Value and caption. @returns Option. */
                    ([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <WriterSearchEmphasisControls
                value={emphasis}
                label={
                  /** Resolves the shared Font Effects captions. @param key - Label key. @param fallback - Default caption. @returns Localized caption. */
                  (key, fallback) => localization.GetText(`writer.search.format.${key}`, fallback)
                }
                onChange={
                  /** Records a native emphasis selection. @param value - Combined style and position. @returns Nothing. */
                  (value) => setEmphasis(String(value))
                }
              />
            </div>
          </section>
          <section
            role="tabpanel"
            id={`${formId}-page-2`}
            aria-labelledby={`${formId}-tab-2`}
            hidden={tab !== 2}
            key={`position-${resets[2]}`}
          >
            <label className={fieldClass}>
              {localization.GetText("writer.character.position", "Position")}
              <select
                name="position"
                defaultValue={position}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value="" />
                <option value={SvxEscapement.Off}>Normal</option>
                <option value={SvxEscapement.Superscript}>Superscript</option>
                <option value={SvxEscapement.Subscript}>Subscript</option>
              </select>
            </label>
            <label className={`${fieldClass} mt-3`}>
              {localization.GetText("writer.character.spacing", "Character spacing")}
              <input
                type="number"
                name="spacing"
                defaultValue={spacing}
                min="-1000"
                max="1000"
                step="0.1"
                className="rounded border border-slate-300 px-2 py-1"
              />
            </label>
          </section>
          <section
            role="tabpanel"
            id={`${formId}-page-3`}
            aria-labelledby={`${formId}-tab-3`}
            hidden={tab !== 3}
            key={`background-${resets[3]}`}
          >
            <ColorControl
              label={
                mode === "standard"
                  ? localization.GetText("writer.character.highlighting", "Highlighting")
                  : localization.GetText("writer.character.background", "Character Background")
              }
              property="highlight"
              value={background || "transparent"}
              fallback="#ffffff"
              disabled={false}
              onColor={
                /** Updates the changed background color. @param _property - Color family. @param value - Chosen color. @returns Nothing. */ (
                  _property,
                  value,
                ) => setBackground(value)
              }
            />
          </section>
          {border && (
            <section
              role="tabpanel"
              id={`${formId}-page-4`}
              aria-labelledby={`${formId}-tab-4`}
              hidden={tab !== 4}
              key={`borders-${resets[4]}`}
            >
              <WriterBorderPage
                page={border}
                unit={unit}
                resetKey={resets[4]}
                onChange={
                  /** Retains native edits in the tab's draft only. @returns Nothing. */ () => {
                    setBorderEdited(true);
                    refreshBorder(
                      /** Invalidates the border projection. @param previous - Current revision. @returns New revision. */
                      (previous) => previous + 1,
                    );
                  }
                }
              />
            </section>
          )}
        </div>
        <div className="writer-dialog-actions">
          <button type="button" className="mr-auto" onClick={reset}>
            {localization.GetText("writer.character.reset", "Reset")}
          </button>
          <button type="button" onClick={cancel}>
            {localization.GetText("writer.character.cancel", "Cancel")}
          </button>
          <button type="submit" className="writer-dialog-primary">
            {localization.GetText("writer.character.ok", "OK")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
