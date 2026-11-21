/** @fileoverview Writer browser binding for character and paragraph pages of SvxSearchFormatDialog. */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
  SvxEscapementItem,
} from "../../../editeng/source/items/textitem.escapement";
import { SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import { SvxFirstLineIndentItem } from "../../../editeng/inc/lrspitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { SvxULSpaceItem } from "../../../editeng/inc/ulspitem";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import { ConvertValue } from "../../../vcl/source/control/field";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SvxOverlineItem, SvxUnderlineItem } from "../../../editeng/source/items/textitem";
import { Color, COL_TRANSPARENT } from "../../../tools/inc/color";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { SvxCharRotateItem } from "../../../editeng/source/items/textitem.layout";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SearchAttrItemList } from "../../../svx/source/dialog/srchdlg";
import {
  caseEffects,
  fontWeights,
  makeSearchFormatItem,
  paragraphVerticalAlignments,
  ParagraphLineSpaceMode,
  readParagraphLineSpacing,
  setParagraphLineSpacing,
  postures,
  readSearchFormatValue,
  reliefs,
  strikeouts,
  underlines,
} from "./writer-search-format-values";
import {
  RES_CHRATR_AUTOKERN,
  RES_CHRATR_BACKGROUND,
  RES_CHRATR_CASEMAP,
  RES_CHRATR_COLOR,
  RES_CHRATR_CONTOUR,
  RES_CHRATR_CROSSEDOUT,
  RES_CHRATR_ESCAPEMENT,
  RES_CHRATR_KERNING,
  RES_CHRATR_OVERLINE,
  RES_CHRATR_RELIEF,
  RES_CHRATR_ROTATE,
  RES_CHRATR_SCALEW,
  RES_CHRATR_SHADOWED,
  RES_CHRATR_WORDLINEMODE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_ORPHANS,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_VERTALIGN,
  RES_UL_SPACE,
} from "../../inc/hintids";
import { WRITER_SEARCH_ATTR_WHICH_RANGES } from "../../source/uibase/uiview/viewsrch";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { WriterSearchParagraphAlignment } from "./WriterSearchParagraphAlignment";

const formatPages = {
  font: ["Font", [RES_CHRATR_FONT, RES_CHRATR_FONTSIZE, RES_CHRATR_WEIGHT, RES_CHRATR_POSTURE]],
  effects: [
    "Font Effects",
    [
      RES_CHRATR_COLOR,
      RES_CHRATR_UNDERLINE,
      RES_CHRATR_OVERLINE,
      RES_CHRATR_CROSSEDOUT,
      RES_CHRATR_CASEMAP,
      RES_CHRATR_RELIEF,
      RES_CHRATR_CONTOUR,
      RES_CHRATR_SHADOWED,
      RES_CHRATR_WORDLINEMODE,
    ],
  ],
  position: [
    "Position",
    [
      RES_CHRATR_ESCAPEMENT,
      RES_CHRATR_ROTATE,
      RES_CHRATR_SCALEW,
      RES_CHRATR_KERNING,
      RES_CHRATR_AUTOKERN,
    ],
  ],
  indents: [
    "Indents & Spacing",
    [
      RES_MARGIN_TEXTLEFT,
      RES_MARGIN_RIGHT,
      RES_MARGIN_FIRSTLINE,
      RES_UL_SPACE,
      RES_PARATR_LINESPACING,
    ],
  ],
  alignment: ["Alignment", [RES_PARATR_ADJUST, RES_PARATR_VERTALIGN]],
  textflow: ["Text Flow", [RES_PARATR_SPLIT, RES_PARATR_ORPHANS, RES_PARATR_WIDOWS]],
  highlighting: ["Highlighting", [RES_CHRATR_BACKGROUND]],
} as const;

/** Edits exact search or replacement formatting. @param props - Criteria and owning pool. @returns Modal formatting form. */
export function WriterSearchFormatDialog(
  props: Readonly<{
    pool: SfxItemPool;
    unit?: FieldUnit;
    initial: SearchAttrItemList | undefined;
    target: "search" | "replace";
    restoreFocus: RefObject<HTMLInputElement | null>;
    onClose: (result?: SearchAttrItemList) => void;
  }>,
): React.JSX.Element {
  const localization = useBrowserLocalization();
  const root = useRef<HTMLFormElement>(null);
  const [page, setPage] = useState<keyof typeof formatPages>("font");
  const [lineMode, setLineMode] = useState<ParagraphLineSpaceMode>();
  const [draft, setDraft] = useState<ReadonlyMap<number, string | SfxPoolItem>>(new Map());
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
    const list = props.initial;
    return list?.GetEntries()[list.FindLast(slot)]?.item;
  }

  /** Reads the current value for a scalar control. @param which - Item family. @returns Current field value. */
  function scalar(which: number): string {
    const delta = draft.get(which);
    return typeof delta === "string" ? delta : readSearchFormatValue(delta ?? existing(which));
  }

  /** Tracks the delta produced by the active pages. @param which - Writer WhichId. @param value - Entered value or compound native item. @returns Nothing. */
  function change(which: number, value: string | SfxPoolItem): void {
    setDraft(
      /** Applies the edit to the most recent draft. @param current - Previous values. @returns Updated values. */ (
        current,
      ) => new Map(current).set(which, value),
    );
  }

  /** Restores only the active native page's values. @returns Nothing. */
  function reset(): void {
    const restored = new Map(draft);
    for (const which of formatPages[page][1]) restored.delete(which);
    if (page === "indents") setLineMode(undefined);
    setDraft(restored);
  }

  /** Writes the changed native attributes back to the owning list. @returns Nothing. */
  function accept(): void {
    const set = new SfxItemSet(props.pool, WRITER_SEARCH_ATTR_WHICH_RANGES);
    try {
      for (const [which, value] of draft) {
        if (value !== "")
          set.Put(
            value instanceof SfxPoolItem
              ? value
              : makeSearchFormatItem(which, value, existing(which)),
          );
      }
      const result = new SearchAttrItemList(props.initial);
      result.MergeFormat(set);
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
          value={scalar(which)}
          onChange={
            /** Records the selected value. @param event - Input event. @returns Nothing. */ (
              event,
            ) => {
              const value = event.currentTarget.value;
              const line = draft.get(which) ?? existing(which);
              change(
                which,
                value !== "" &&
                  (line instanceof SvxUnderlineItem || line instanceof SvxOverlineItem)
                  ? makeSearchFormatItem(which, value, line)
                  : value,
              );
            }
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

  /** Resolves text in the active formatting dialog. @param key - Native field key. @param fallback - English text. @returns Localized text. */
  function label(key: string, fallback: string): string {
    return localization.GetText(`writer.search.format.${key}`, fallback);
  }

  /** Presents an indeterminate checkbox for an unset search item. @param which - Native WhichId. @param caption - Control label. @param disabled - Native dependency state. @returns Checkbox field. */
  function check(which: number, caption: string, disabled = false): React.JSX.Element {
    const value = scalar(which);
    return (
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          disabled={disabled}
          checked={value === "true"}
          ref={
            /** Applies the native indeterminate state. @param input - Browser checkbox. @returns Nothing. */ (
              input,
            ) => {
              if (input) input.indeterminate = value === "";
            }
          }
          onChange={
            /** Commits an explicit boolean criterion. @param event - Checkbox change. @returns Nothing. */ (
              event,
            ) => change(which, String(event.currentTarget.checked))
          }
        />
        {caption}
      </label>
    );
  }

  /** Presents a color picker with the palette's automatic choice. @param value - Current color. @param caption - Field label. @param automaticLabel - Automatic color label. @param set - Native item editing callback. @param disabled - Native dependency state. @returns Color controls. */
  function color(
    value: string,
    caption: string,
    automaticLabel: string,
    set: (value: string) => void,
    disabled = false,
  ): React.JSX.Element {
    const rgb = value.startsWith("#") ? value : "#000000";
    return (
      <fieldset disabled={disabled} className="grid gap-1 rounded border border-slate-200 p-2">
        <legend className="text-sm">{caption}</legend>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="color"
            aria-label={caption}
            value={rgb}
            onChange={
              /** Uses the chosen RGB value. @param event - Color change. @returns Nothing. */ (
                event,
              ) => set(event.currentTarget.value)
            }
          />
          <button
            type="button"
            className="rounded border px-2 py-1 text-sm"
            aria-pressed={value.startsWith("#")}
            onClick={/** Selects the current RGB swatch. @returns Nothing. */ () => set(rgb)}
          >
            {label("custom-color", "Color")}
          </button>
          <button
            type="button"
            className="rounded border px-2 py-1 text-sm"
            aria-pressed={value === "automatic"}
            onClick={
              /** Selects the palette's automatic value. @returns Nothing. */ () => set("automatic")
            }
          >
            {automaticLabel}
          </button>
        </div>
      </fieldset>
    );
  }

  /** Edits color as part of the same native line-style item. @param which - Underline or overline item. @param caption - Control caption. @returns Line color controls. */
  function lineColor(which: number, caption: string): React.JSX.Element {
    const pending = draft.get(which);
    const original = pending instanceof SfxPoolItem ? pending : existing(which);
    const style = Number(scalar(which));
    const current =
      original instanceof SvxUnderlineItem || original instanceof SvxOverlineItem
        ? original.GetColor()
        : undefined;
    const value =
      current === undefined || current.IsFullyTransparent()
        ? "automatic"
        : `#${(current.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
    return color(
      value,
      caption,
      label("automatic-color", "Automatic"),
      /** Updates the color without changing the selected style. @param selected - Palette choice. @returns Nothing. */ (
        selected,
      ) => {
        const item = makeSearchFormatItem(which, String(style), original);
        if (item instanceof SvxUnderlineItem || item instanceof SvxOverlineItem) {
          item.SetColor(
            selected === "automatic"
              ? COL_TRANSPARENT
              : new Color(Number.parseInt(selected.slice(1), 16)),
          );
          item.setComplexColor(new ComplexColor());
          change(which, item);
        }
      },
      style === 0,
    );
  }

  /** Presents paragraph lengths using the current Writer measurement unit. @param caption - Field label. @param twips - Existing length. @param minimum - Minimum in twips. @param update - Native length delta callback. @returns Metric entry. */
  function paragraphLength(
    caption: string,
    twips: number | undefined,
    minimum: number,
    update: (twips: number) => void,
  ): React.JSX.Element {
    return (
      <label className="grid gap-1 text-sm">
        {caption}
        <MetricSpinButton
          aria-label={caption}
          className="w-28 rounded border border-slate-400 p-1"
          unit={props.unit ?? FieldUnit.CM}
          value={twips}
          minimum={minimum}
          maximum={65535}
          onValueChange={update}
        />
      </label>
    );
  }

  /** Edits one absolute native indent field. @param which - Paragraph item. @param caption - Field label. @returns Indent control. */
  function indent(which: number, caption: string): React.JSX.Element {
    const value = scalar(which);
    return paragraphLength(
      caption,
      value === "" ? undefined : Math.round(Number(value) * 20),
      -65535,
      /** Receives the committed native length. @param twips - Selected length. @returns Nothing. */ (
        twips,
      ) =>
        change(
          which,
          makeSearchFormatItem(
            which,
            String(twips / 20),
            which === RES_MARGIN_FIRSTLINE ? firstLine : existing(which),
          ),
        ),
    );
  }

  const alignment = draft.get(RES_PARATR_ADJUST) ?? existing(RES_PARATR_ADJUST);
  const firstLineInput = draft.get(RES_MARGIN_FIRSTLINE) ?? existing(RES_MARGIN_FIRSTLINE);
  const firstLine = firstLineInput instanceof SvxFirstLineIndentItem ? firstLineInput : undefined;

  const paraSpacingValue = draft.get(RES_UL_SPACE) ?? existing(RES_UL_SPACE);
  const paraSpacing = paraSpacingValue instanceof SvxULSpaceItem ? paraSpacingValue : undefined;

  /** Edits one member without overwriting the remaining fields of the native spacing item. @param member - Upper or lower margin. @param value - Native twips. @returns Nothing. */
  function changeParagraphSpacing(member: "upper" | "lower", value: number): void {
    const next = paraSpacing?.Clone() ?? new SvxULSpaceItem(RES_UL_SPACE);
    if (member === "upper") next.SetUpper(value);
    else next.SetLower(value);
    change(RES_UL_SPACE, next);
  }

  const lineSpacingValue = draft.get(RES_PARATR_LINESPACING) ?? existing(RES_PARATR_LINESPACING);
  const lineSpacingItem =
    lineSpacingValue instanceof SvxLineSpacingItem ? lineSpacingValue : undefined;
  const currentLineSpacing = readParagraphLineSpacing(lineSpacingItem);
  const lineSpacing =
    currentLineSpacing === undefined
      ? undefined
      : { mode: lineMode ?? currentLineSpacing.mode, value: currentLineSpacing.value };

  /** Writes the chosen line-spacing page mode and its native measure. @param mode - Selected row. @param value - Percent or twip amount. @returns Nothing. */
  function updateLineSpacing(mode: ParagraphLineSpaceMode, value: number): void {
    const base =
      existing(RES_PARATR_LINESPACING) ??
      props.pool.GetUserOrPoolDefaultItem(RES_PARATR_LINESPACING);
    if (base instanceof SvxLineSpacingItem) {
      setLineMode(mode);
      change(RES_PARATR_LINESPACING, setParagraphLineSpacing(base, mode, value));
    }
  }

  /** Renders a numeric metric field, leaving an untouched criterion empty. @param which - Writer WhichId. @param caption - Field label. @param minimum - Native lower bound. @param maximum - Native upper bound. @param step - Native step. @param unit - Displayed unit. @returns Metric control. */
  function metric(
    which: number,
    caption: string,
    minimum: number,
    maximum: number,
    step: number,
    unit: string,
  ): React.JSX.Element {
    return (
      <label className="grid gap-1 text-sm">
        {caption}
        <div className="flex items-center gap-1">
          <input
            type="number"
            className="w-24 rounded border border-slate-400 p-1"
            value={scalar(which)}
            min={minimum}
            max={maximum}
            step={step}
            onChange={
              /** Updates the metric criterion. @param event - Numeric change. @returns Nothing. */ (
                event,
              ) => change(which, event.currentTarget.value)
            }
          />
          <span aria-hidden="true">{unit}</span>
        </div>
      </label>
    );
  }

  const escapeValue = draft.get(RES_CHRATR_ESCAPEMENT) ?? existing(RES_CHRATR_ESCAPEMENT);
  const escapeItem = escapeValue instanceof SvxEscapementItem ? escapeValue : undefined;
  const offset = escapeItem?.GetEsc() ?? 0;
  const direction = Math.sign(offset);
  const automatic = Math.abs(offset) === DFLT_ESC_AUTO_SUPER;
  const manualOffset = direction === -1 ? -DFLT_ESC_SUB : DFLT_ESC_SUPER;
  const rotationValue = draft.get(RES_CHRATR_ROTATE) ?? existing(RES_CHRATR_ROTATE);
  const rotation = rotationValue instanceof SvxCharRotateItem ? rotationValue : undefined;

  /** Stores position and relative size as one native item. @param offset - Signed native position. @param height - Relative height percent. @returns Nothing. */
  function escapement(offset: number, height: number): void {
    change(RES_CHRATR_ESCAPEMENT, new SvxEscapementItem(offset, height, RES_CHRATR_ESCAPEMENT));
  }

  /** Stores the degree and fit flag as one native rotation item. @param angle - Tenths of a degree. @param fit - Fit to line. @returns Nothing. */
  function rotate(angle: number, fit: boolean): void {
    change(RES_CHRATR_ROTATE, new SvxCharRotateItem(angle, fit, RES_CHRATR_ROTATE));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="grid w-full max-w-md max-h-[90dvh] overflow-auto gap-3 rounded-lg border border-slate-300 bg-white p-4 shadow-xl"
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
        <div role="tablist" className="flex flex-wrap gap-2 border-b border-slate-300">
          {(Object.keys(formatPages) as (keyof typeof formatPages)[]).map(
            /** Renders one of the represented native search pages. @param tab - Page ID. @returns Tab button. */ (
              tab,
            ) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={page === tab}
                className="px-2 py-1 aria-selected:border-b-2 aria-selected:border-indigo-700"
                onClick={/** Activates this page. @returns Nothing. */ () => setPage(tab)}
              >
                {label(tab, formatPages[tab][0])}
              </button>
            ),
          )}
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
              value={scalar(RES_CHRATR_FONT)}
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
              value={scalar(RES_CHRATR_FONTSIZE)}
              onChange={
                /** Tracks the absolute point height. @param event - Input event. @returns Nothing. */ (
                  event,
                ) => change(RES_CHRATR_FONTSIZE, event.currentTarget.value)
              }
            />
          </label>
        </div>
        <div
          role="tabpanel"
          hidden={page !== "effects"}
          className={page === "effects" ? "grid gap-2" : undefined}
        >
          {color(
            scalar(RES_CHRATR_COLOR),
            label("color", "Font color"),
            label("automatic-color", "Automatic"),
            /** Updates the font color item. @param value - Palette choice. @returns Nothing. */ (
              value,
            ) => change(RES_CHRATR_COLOR, value),
          )}
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("decoration", "Text Decoration")}</legend>
            {select(RES_CHRATR_OVERLINE, label("overlining", "Overlining"), underlines)}
            {lineColor(RES_CHRATR_OVERLINE, label("overline-color", "Overline color"))}
            {select(RES_CHRATR_CROSSEDOUT, label("strikeout", "Strikethrough"), strikeouts)}
            {select(RES_CHRATR_UNDERLINE, label("underline", "Underlining"), underlines)}
            {lineColor(RES_CHRATR_UNDERLINE, label("underline-color", "Underline color"))}
            {check(
              RES_CHRATR_WORDLINEMODE,
              label("individual-words", "Individual words"),
              !Number(scalar(RES_CHRATR_UNDERLINE)) &&
                !Number(scalar(RES_CHRATR_OVERLINE)) &&
                !Number(scalar(RES_CHRATR_CROSSEDOUT)),
            )}
          </fieldset>
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("effects-group", "Effects")}</legend>
            {select(RES_CHRATR_CASEMAP, label("case", "Effects"), caseEffects)}
            {select(RES_CHRATR_RELIEF, label("relief", "Relief"), reliefs)}
            {check(
              RES_CHRATR_CONTOUR,
              label("outline", "Outline"),
              Number(scalar(RES_CHRATR_RELIEF)) !== 0,
            )}
            {check(
              RES_CHRATR_SHADOWED,
              label("shadow", "Shadow"),
              Number(scalar(RES_CHRATR_RELIEF)) !== 0,
            )}
          </fieldset>
        </div>
        <div
          role="tabpanel"
          hidden={page !== "position"}
          className={page === "position" ? "grid gap-2" : undefined}
        >
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("position", "Position")}</legend>
            <div className="grid gap-1 text-sm">
              {(
                [
                  [1, "Superscript"],
                  [0, "Normal"],
                  [-1, "Subscript"],
                ] as const
              ).map(
                /** Presents the native high, normal and low choices. @param option - Position mode. @returns Radio button. */ ([
                  mode,
                  name,
                ]) => (
                  <label key={mode} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="search-escapement"
                      checked={escapeItem !== undefined && direction === mode}
                      onChange={
                        /** Creates the native position and size defaults. @returns Nothing. */ () =>
                          escapement(
                            mode === 0 ? 0 : mode === 1 ? DFLT_ESC_SUPER : DFLT_ESC_SUB,
                            mode === 0 ? 100 : DFLT_ESC_PROP,
                          )
                      }
                    />
                    {label(`escapement.${mode}`, name)}
                  </label>
                ),
              )}
            </div>
            <div className="grid gap-1 text-sm">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={automatic}
                  disabled={direction === 0}
                  onChange={
                    /** Switches between the automatic sentinel and manual shift. @param event - Automatic flag. @returns Nothing. */ (
                      event,
                    ) =>
                      escapement(
                        event.currentTarget.checked
                          ? direction === -1
                            ? DFLT_ESC_AUTO_SUB
                            : DFLT_ESC_AUTO_SUPER
                          : direction * manualOffset,
                        escapeItem?.GetProportionalHeight() ?? DFLT_ESC_PROP,
                      )
                  }
                />
                {label("automatic-position", "Automatic")}
              </label>
              <label className="grid">
                {label("raise-lower", "Raise/lower by")}
                <input
                  type="number"
                  min={1}
                  max={13999}
                  aria-label={label("raise-lower", "Raise/lower by")}
                  disabled={direction === 0 || automatic}
                  value={automatic ? manualOffset : Math.abs(offset) || ""}
                  onChange={
                    /** Changes the manual shift in percent. @param event - Offset input. @returns Nothing. */ (
                      event,
                    ) =>
                      escapement(
                        direction * (event.currentTarget.valueAsNumber || manualOffset),
                        escapeItem?.GetProportionalHeight() ?? DFLT_ESC_PROP,
                      )
                  }
                />
              </label>
              <label className="grid">
                {label("relative-size", "Relative font size")}
                <input
                  type="number"
                  min={1}
                  max={100}
                  disabled={direction === 0}
                  value={escapeItem?.GetProportionalHeight() ?? ""}
                  onChange={
                    /** Changes the proportional height only. @param event - Size input. @returns Nothing. */ (
                      event,
                    ) => escapement(offset, event.currentTarget.valueAsNumber || DFLT_ESC_PROP)
                  }
                />
              </label>
            </div>
          </fieldset>
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("rotation-scaling", "Rotation / Scaling")}</legend>
            <div className="grid gap-1 text-sm">
              {[0, 90, 270].map(
                /** Presents each supported native rotation. @param degrees - Degrees to display. @returns Radio button. */ (
                  degrees,
                ) => (
                  <label key={degrees} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="search-rotation"
                      checked={rotation?.GetValue() === degrees * 10}
                      onChange={
                        /** Applies the selected rotation. @returns Nothing. */ () =>
                          rotate(degrees * 10, degrees !== 0 && (rotation?.IsFitToLine() ?? false))
                      }
                    />
                    {label(`rotation.${degrees}`, `${degrees} degrees`)}
                  </label>
                ),
              )}
            </div>
            <div className="grid gap-1">
              {metric(RES_CHRATR_SCALEW, label("scale-width", "Scaling"), 1, 999, 1, "%")}
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={rotation?.IsFitToLine() ?? false}
                  disabled={!rotation?.GetValue()}
                  onChange={
                    /** Updates the fit flag on the active rotation. @param event - Checkbox change. @returns Nothing. */ (
                      event,
                    ) => rotate(rotation?.GetValue() ?? 0, event.currentTarget.checked)
                  }
                />
                {label("fit-line", "Fit to line")}
              </label>
            </div>
          </fieldset>
          <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("spacing", "Spacing")}</legend>
            {metric(RES_CHRATR_KERNING, label("spacing-by", "By"), -1000, 1000, 0.1, "pt")}
            {check(RES_CHRATR_AUTOKERN, label("pair-kerning", "Pair kerning"))}
          </fieldset>
        </div>
        <div
          role="tabpanel"
          hidden={page !== "indents"}
          className={page === "indents" ? "grid gap-2" : undefined}
        >
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("paragraph-indent", "Indent")}</legend>
            {indent(RES_MARGIN_TEXTLEFT, label("before-text", "Before text"))}
            {indent(RES_MARGIN_RIGHT, label("after-text", "After text"))}
            <fieldset disabled={firstLine?.IsAutoFirst()}>
              {indent(RES_MARGIN_FIRSTLINE, label("first-line", "First line"))}
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={firstLine?.IsAutoFirst() ?? false}
                onChange={
                  /** Stages the native automatic flag while retaining the entered measure. @param event - Checkbox change. @returns Nothing. */
                  (event) => {
                    const item =
                      firstLine?.Clone() ?? new SvxFirstLineIndentItem(RES_MARGIN_FIRSTLINE);
                    item.SetAutoFirst(event.currentTarget.checked);
                    change(RES_MARGIN_FIRSTLINE, item);
                  }
                }
              />
              {label("automatic-first-line", "Automatic")}
            </label>
          </fieldset>
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("paragraph-spacing", "Spacing")}</legend>
            {paragraphLength(
              label("above-paragraph", "Above paragraph"),
              paraSpacing?.GetUpper(),
              0,
              /** Stores the paragraph's before spacing. @param value - Native length. @returns Nothing. */ (
                value,
              ) => changeParagraphSpacing("upper", value),
            )}
            {paragraphLength(
              label("below-paragraph", "Below paragraph"),
              paraSpacing?.GetLower(),
              0,
              /** Stores the paragraph's after spacing. @param value - Native length. @returns Nothing. */ (
                value,
              ) => changeParagraphSpacing("lower", value),
            )}
          </fieldset>
          <fieldset className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("line-spacing", "Line spacing")}</legend>
            <select
              aria-label={label("line-spacing", "Line spacing")}
              value={lineSpacing?.mode ?? ""}
              onChange={
                /** Applies the native line-spacing selection. @param event - Selected row. @returns Nothing. */ (
                  event,
                ) => {
                  const value = event.currentTarget.value;
                  if (value === "") {
                    setLineMode(undefined);
                    change(RES_PARATR_LINESPACING, "");
                    return;
                  }
                  const mode = Number(value) as ParagraphLineSpaceMode;
                  const currentMetric =
                    lineSpacing && lineSpacing.mode > ParagraphLineSpaceMode.Proportional
                      ? lineSpacing.value
                      : undefined;
                  const leading = Number(
                    ConvertValue(1n, 0n, 0, props.unit ?? FieldUnit.CM, FieldUnit.TWIP),
                  );
                  const initial =
                    mode === ParagraphLineSpaceMode.Proportional
                      ? 100
                      : mode === ParagraphLineSpaceMode.Leading
                        ? (currentMetric ?? leading)
                        : mode === ParagraphLineSpaceMode.Minimum
                          ? (currentMetric ?? 10)
                          : (currentMetric ?? 0);
                  updateLineSpacing(mode, initial);
                }
              }
            >
              <option value="" />
              {[
                "Single",
                "1.15 Lines",
                "1.5 Lines",
                "Double",
                "Proportional",
                "At Least",
                "Leading",
                "Fixed",
              ].map(
                /** Renders the native order of line spacing choices. @param name - Caption. @param index - Mode. @returns Option. */ (
                  name,
                  index,
                ) => (
                  <option key={name} value={index}>
                    {label(`line-spacing.${index}`, name)}
                  </option>
                ),
              )}
            </select>
            {lineSpacing?.mode === ParagraphLineSpaceMode.Proportional ? (
              <label className="text-sm">
                {label("line-space-at", "At")}
                <input
                  type="number"
                  aria-label={label("line-spacing-value", "Line Spacing Value")}
                  min={6}
                  max={65535}
                  value={lineSpacing.value}
                  onChange={
                    /** Updates the native proportional percentage. @param event - Metric edit. @returns Nothing. */ (
                      event,
                    ) => {
                      if (event.currentTarget.validity.valid && event.currentTarget.value !== "")
                        updateLineSpacing(
                          ParagraphLineSpaceMode.Proportional,
                          event.currentTarget.valueAsNumber,
                        );
                    }
                  }
                />{" "}
                %
              </label>
            ) : lineSpacing !== undefined &&
              lineSpacing.mode > ParagraphLineSpaceMode.Proportional ? (
              paragraphLength(
                label("line-space-at", "At"),
                lineSpacing.value,
                0,
                /** Updates the existing native metric mode. @param value - Twip amount. @returns Nothing. */ (
                  value,
                ) => updateLineSpacing(lineSpacing.mode, value),
              )
            ) : null}
          </fieldset>
        </div>
        <div role="tabpanel" hidden={page !== "alignment"}>
          <WriterSearchParagraphAlignment
            value={alignment instanceof SvxAdjustItem ? alignment : undefined}
            label={label}
            onChange={
              /** Stages the complete alignment and justification item. @param item - Native value. @returns Nothing. */
              (item) => change(RES_PARATR_ADJUST, item)
            }
          />
          <fieldset className="grid gap-1 rounded border border-slate-200 p-2">
            <legend className="text-sm">{label("text-to-text", "Text-to-text")}</legend>
            {select(
              RES_PARATR_VERTALIGN,
              label("vertical-alignment", "Alignment"),
              paragraphVerticalAlignments,
            )}
          </fieldset>
        </div>
        <div role="tabpanel" hidden={page !== "textflow"}>
          <fieldset
            disabled={scalar(RES_PARATR_SPLIT) === "false"}
            className="grid gap-2 rounded border border-slate-200 p-2"
          >
            <legend className="text-sm">{label("textflow-options", "Options")}</legend>
            {metric(
              RES_PARATR_ORPHANS,
              label("orphans", "Don’t split at beginning of paragraph"),
              0,
              9,
              1,
              label("lines", "lines"),
            )}
            {metric(
              RES_PARATR_WIDOWS,
              label("widows", "Don’t split at end of paragraph"),
              0,
              9,
              1,
              label("lines", "lines"),
            )}
          </fieldset>
          {check(RES_PARATR_SPLIT, label("split-paragraph", "Allow to split paragraph"))}
        </div>
        <div role="tabpanel" hidden={page !== "highlighting"}>
          {color(
            scalar(RES_CHRATR_BACKGROUND),
            label("highlight-color", "Highlight color"),
            label("no-fill", "None"),
            /** Updates the character background brush. @param value - Palette choice. @returns Nothing. */ (
              value,
            ) => change(RES_CHRATR_BACKGROUND, value),
          )}
        </div>
        <footer className="flex justify-end gap-2">
          <button
            type="button"
            className="mr-auto rounded border border-slate-300 px-3 py-1"
            onClick={reset}
          >
            {label("reset", "Reset")}
          </button>
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
