/** @fileoverview Presents the Writer numbering-family template through its original pooled rule exchange. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { SID_ATTR_NUMBERING_RULE } from "../../../editeng/inc/editids";
import {
  SvxNumBulletItem,
  SvxNumberFormat,
  SvxNumRule,
  SvxNumRuleType,
} from "../../../editeng/inc/numitem";
import { SvxNumType } from "../../../editeng/inc/svxenum";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SvxBrushItem, SvxGraphicPosition } from "../../../editeng/source/items/frmitems.brush";
import { BitmapPickPage } from "../../../cui/browser/tabpages/BitmapPickPage";
import { getDefaultBulletGraphic } from "../../../cui/browser/tabpages/bitmap-gallery";
import { graphicImageSource } from "../../../vcl/browser/graphic-image-source";
import type { Graphic } from "../../../vcl/source/gdi/graph";
import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";
import { NumberingOptionsPage } from "../../../cui/browser/tabpages/NumberingOptionsPage";
import { NumberingPositionPage } from "../../../cui/browser/tabpages/NumberingPositionPage";
import {
  applyBulletPreset,
  applyOrderedPreset,
  applyOutlinePreset,
  defaultBullets,
  orderedPresets,
  outlinePresets,
} from "../../../cui/source/tabpages/numpages";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { tabControlDirection } from "../../../vcl/source/control/tabctrl";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import type { WriterListStyleTemplateRequest } from "../../source/uibase/dialog/writer-dialog-controller";
import { WriterDialogHeader } from "./WriterDialogHeader";

const pages = [
  ["organizer", "General"],
  ["bullets", "Unordered"],
  ["numbering", "Ordered"],
  ["outline", "Outline"],
  ["graphics", "Image"],
  ["position", "Position"],
  ["customize", "Customize"],
] as const;
/** Native template page identifier. */
type Page = (typeof pages)[number][0];
const button = "rounded border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50";

/** Reads the owned native numbering item from a style template. @param request - Actual Pseudo style template. @returns Shared numbering rule. */
function initialRule(request: WriterListStyleTemplateRequest): SvxNumRule {
  const item = request.input.GetItemIfSet(SID_ATTR_NUMBERING_RULE, false);
  if (!(item instanceof SvxNumBulletItem))
    throw new Error("List style template requires a numbering rule.");
  return item.GetNumRule();
}

/** Formats a sample marker through the selected native numbering rule. @param rule - Current draft. @param index - Preview level. @returns Native preview marker. */
function previewListMarker(rule: SvxNumRule, index: number): string {
  const format = rule.GetLevel(index);
  if (format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL) {
    const glyph = format.GetBulletChar();
    return glyph <= 0x10ffff ? String.fromCodePoint(glyph) : "";
  }
  if (!format.IsTextFormat()) return "";
  const pattern = format.GetMarkerProperties().listFormat;
  if (pattern === undefined)
    return format.GetPrefix() + format.GetNumStr(format.GetStart()) + format.GetSuffix();
  return pattern.replace(
    /%([1-9]|10)%/gu,
    /** Resolves a referenced native numbering level. @param token - Complete token. @returns Sample number. */
    (token) => {
      const reference = rule.GetLevel(Number(token.slice(1, -1)) - 1);
      return reference.GetNumStr(reference.GetStart(), undefined, format.GetIsLegal());
    },
  );
}

/** Presents a nested list-style template while the source Paragraph draft remains open. @param props - Style input, focus target and parent bindings. @returns Nested style dialog. */
export function WriterListStyleDialog({
  request,
  invoker,
  unit,
  onClose,
  onRename,
}: Readonly<{
  request: WriterListStyleTemplateRequest;
  invoker: HTMLButtonElement;
  unit: FieldUnit;
  onClose: () => void;
  onRename: (previous: string, next: string) => void;
}>): React.JSX.Element {
  const [page, setPage] = useState<Page>("organizer");
  const [name, setName] = useState(request.name);
  const [savedName, setSavedName] = useState(request.name);
  const [invalidName, setInvalidName] = useState(false);
  const nameField = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(
    /** Owns the initial comparison value. @returns Saved rule. */ () =>
      new SvxNumRule(initialRule(request)),
  );
  const [draft, setDraft] = useState(
    /** Owns the editable value. @returns Working rule. */ () => new SvxNumRule(saved),
  );
  const [levels, setLevels] = useState<readonly number[]>([0]);
  const exchangedLevels = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const tabRefs = useRef<Partial<Record<Page, HTMLButtonElement | null>>>({});
  const id = useId();
  const localization = useBrowserLocalization();
  /** Localizes style dialog controls. @param key - Native field key. @param fallback - Pinned English UI label. @returns UI label. */
  function label(key: string, fallback: string): string {
    return localization.GetText(`writer.list-style.${key}`, fallback);
  }
  const title = `${label("title", "List Style")}: ${savedName}`;
  const count = draft.GetLevelCount();
  const level = levels[0] === count ? 0 : (levels[0] ?? 0);
  const rows = Array.from(
    { length: count },
    /** Maps a native level to its index. @param unused - Empty slot. @param index - Zero-based level. @returns Level. */ (
      unused,
      index,
    ) => {
      void unused;
      return index;
    },
  );
  const nextName = name.replace(/^ +/u, "");
  const changed = !draft.Equals(saved) || name !== savedName;

  useLayoutEffect(
    /** Places focus in this dialog and restores the parent control after it closes. @returns Cleanup. */ () => {
      const modal = dialog.current;
      if (!modal) return;
      if (typeof modal.showModal === "function") modal.showModal();
      else modal.open = true;
      if (request.nameEditable) nameField.current?.focus();
      else tabRefs.current.organizer?.focus();
      return /** Restores focus after the parent leaves its inert state. @returns Nothing. */ () => {
        if (typeof modal.close === "function") modal.close();
        else modal.open = false;
        queueMicrotask(/** Returns focus to Edit Style. @returns Nothing. */ () => invoker.focus());
      };
    },
    [invoker, request.nameEditable],
  );

  /** Edits an independent native rule copy. @param edit - Page exchange. @returns Nothing. */
  function update(edit: (rule: SvxNumRule) => void): void {
    const next = new SvxNumRule(draft);
    edit(next);
    setDraft(next);
  }
  /** Applies a page operation to the selected level set. @param edit - Per-level format operation. @returns Nothing. */
  function editLevels(edit: (format: SvxNumberFormat, level: number) => void): void {
    update(
      /** Commits independent levels to the copied rule. @param next - Draft rule. @returns Nothing. */ (
        next,
      ) => {
        for (const index of levels.includes(count) ? rows : levels) {
          const format = new SvxNumberFormat(next.GetLevel(index));
          edit(format, index);
          next.SetLevel(index, format);
        }
      },
    );
  }
  /** Restores only the positioning group using the source standard-rule constructor. @returns Nothing. */
  function resetPosition(): void {
    const defaults = new SvxNumRule(
      draft.GetFeatureFlags(),
      count,
      draft.IsContinuousNumbering(),
      SvxNumRuleType.NUMBERING,
      draft.GetLevel(0).GetPositionAndSpaceMode(),
    );
    editLevels(
      /** Copies geometry without changing label settings. @param format - Editable level. @param index - Level index. @returns Nothing. */ (
        format,
        index,
      ) => {
        const standard = defaults.GetLevel(index);
        format.SetPositionAndSpaceMode(standard.GetPositionAndSpaceMode());
        format.SetNumAdjust(standard.GetNumAdjust());
        if (standard.GetPositionAndSpaceMode() === "label-alignment") {
          format.SetLabelFollowedBy(standard.GetLabelFollowedBy());
          format.SetListtabPos(standard.GetListtabPos());
          format.SetIndentAt(standard.GetIndentAt());
          format.SetFirstLineIndent(standard.GetFirstLineIndent());
        } else {
          format.SetAbsLSpace(standard.GetAbsLSpace());
          format.SetFirstLineOffset(standard.GetFirstLineOffset());
          format.SetCharTextDistance(standard.GetCharTextDistance());
        }
      },
    );
  }
  /** Reports a rejected General name and keeps the name field active. @returns False to veto the current action. */
  function rejectName(): false {
    setInvalidName(true);
    setPage("organizer");
    nameField.current?.focus();
    nameField.current?.select();
    return false;
  }
  /** Runs the General name validation before changing native pages. @param next - Target native tab. @returns Whether it was activated. */
  function activate(next: Page): boolean {
    if (next === page) return true;
    if (page === "organizer" && !request.isValidName(nextName)) return rejectName();
    if (page === "position" || page === "customize") exchangedLevels.current = true;
    if (
      next === "graphics" &&
      graphicLevels().every(
        /** Finds whether the gallery needs to initialize an unset numbering level. @param index - Native level. @returns Whether its format is inherited. */
        (index) => draft.Get(index) === null,
      )
    )
      selectGraphic(getDefaultBulletGraphic(), false);
    setPage(next);
    return true;
  }
  /** Commits the name and native style item independently of the parent paragraph draft. @param rule - Edited rule to commit. @returns Whether the child may close. */
  function apply(rule = draft): boolean {
    const formatsChanged = !rule.Equals(saved);
    if (!formatsChanged && name === savedName) return true;
    const output = formatsChanged
      ? new SfxItemSet(request.input.GetPool(), request.input.GetRanges())
      : undefined;
    output?.Put(new SvxNumBulletItem(rule), true);
    try {
      if (!request.apply(nextName, output)) return rejectName();
      if (nextName !== savedName) onRename(savedName, nextName);
      setSavedName(nextName);
      setName(nextName);
      setInvalidName(false);
      if (formatsChanged) setSaved(new SvxNumRule(rule));
      return true;
    } finally {
      output?.Dispose();
    }
  }

  const selectedLevels = levels.includes(count) ? rows : levels;
  /** The graphic picker defaults to every level until a position or options page publishes the mask. @returns Active graphic levels. */
  function graphicLevels(): readonly number[] {
    return exchangedLevels.current ? selectedLevels : rows;
  }
  /** Applies the native graphic preset to each active level. @param graphic - Gallery graphic. @param accept - Whether to close after selecting it. @returns Nothing. */
  function selectGraphic(graphic: Graphic, accept: boolean): void {
    const next = new SvxNumRule(draft);
    const brush = new SvxBrushItem(graphic, SvxGraphicPosition.GPOS_AREA, 0);
    const size = graphic.GetPrefSize();
    for (const index of graphicLevels()) {
      const format = new SvxNumberFormat(next.GetLevel(index));
      format.SetNumberingType(SvxNumType.SVX_NUM_BITMAP);
      format.SetListFormat("", "", index);
      format.SetCharFormatName("");
      format.SetGraphicBrush(brush, size, VertOrientation.LINE_CENTER);
      next.SetLevel(index, format);
    }
    setDraft(next);
    if (accept && apply(next)) onClose();
  }
  const otherFormats = selectedLevels.slice(1).map(
    /** Reads the remaining selected native formats. @param index - Level. @returns Shared format. */
    (index) => draft.GetLevel(index),
  );
  const selectedFormats = [draft.GetLevel(level), ...otherFormats] as const;
  const presetButtons: Array<readonly [string, (rule: SvxNumRule) => void]> = [];
  if (page === "bullets") {
    for (const glyph of defaultBullets)
      presetButtons.push([
        glyph,
        /** Chooses the configured glyph. @param rule - Working rule. @returns Nothing. */
        (rule) => applyBulletPreset(rule, glyph, request.bulletStyle),
      ]);
  } else if (page === "numbering") {
    for (const preset of orderedPresets) {
      const [type, prefix, suffix] = preset;
      const format = new SvxNumberFormat(type);
      presetButtons.push([
        `${prefix.trim()}${format.GetNumStr(1)}${suffix.trim()}`,
        /** Chooses the locale number format. @param rule - Working rule. @returns Nothing. */
        (rule) => applyOrderedPreset(rule, preset),
      ]);
    }
  } else if (page === "outline") {
    for (const preset of outlinePresets) {
      const preview = preset
        .slice(0, 3)
        .map(
          /** Formats one level in the selected outline convention. @param entry - Preset level. @returns Sample label. */
          ([type, prefix, suffix, glyph]) =>
            type === SvxNumType.SVX_NUM_CHAR_SPECIAL
              ? String.fromCodePoint(glyph)
              : `${prefix.trim()}${new SvxNumberFormat(type).GetNumStr(1)}${suffix.trim()}`,
        )
        .join("  ");
      presetButtons.push([
        preview,
        /** Chooses the complete locale level sequence. @param rule - Working rule. @returns Nothing. */
        (rule) => applyOutlinePreset(rule, preset, request.bulletStyle, request.numberingStyle),
      ]);
    }
  }

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      data-writer-modal-panel="true"
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-auto rounded-lg border border-slate-300 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
      onCancel={
        /** Preserves native cancellation without letting the dialog close outside request ownership. @param event - Browser dialog cancellation. @returns Nothing. */
        (event) => {
          event.preventDefault();
          onClose();
        }
      }
    >
      <form
        className="grid"
        onSubmit={
          /** Applies and closes on native form submission. @param event - Actual submission. @returns Nothing. */
          (event) => {
            event.preventDefault();
            if (apply()) onClose();
          }
        }
        onKeyDown={
          /** Owns Escape and native tab switching within the nested dialog. @param event - Browser keyboard event. @returns Nothing. */
          (event) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
              event.stopPropagation();
              event.preventDefault();
              onClose();
              return;
            }
            const direction = tabControlDirection(
              event.key,
              event.ctrlKey || event.metaKey,
              event.shiftKey,
              (event.target as HTMLElement).getAttribute("role") === "tab",
            );
            if (direction === undefined) return;
            event.preventDefault();
            event.stopPropagation();
            const index = pages.findIndex(
              /** Finds the active tab. @param entry - Native tab. @returns Match. */ ([key]) =>
                key === page,
            );
            const next = pages[(index + direction + pages.length) % pages.length]?.[0];
            if (next && activate(next)) tabRefs.current[next]?.focus();
          }
        }
      >
        <WriterDialogHeader title={title} onClose={onClose} />
        <div
          role="tablist"
          aria-label={label("tabs", "List Style pages")}
          className="flex flex-wrap gap-1 border-b border-slate-200 p-3"
        >
          {pages.map(
            /** Creates one native template page tab. @param entry - Page and caption. @returns Tab button. */
            ([key, caption]) => (
              <button
                key={key}
                id={`${id}-${key}`}
                type="button"
                role="tab"
                aria-controls={`${id}-panel`}
                aria-selected={page === key}
                tabIndex={page === key ? 0 : -1}
                className={`${button} ${page === key ? "bg-slate-100 font-semibold" : ""}`}
                ref={
                  /** Stores the native tab focus target. @param node - Mounted tab. @returns Nothing. */ (
                    node,
                  ) => {
                    tabRefs.current[key] = node;
                  }
                }
                onClick={
                  /** Activates this page when the current page accepts its values. @returns Nothing. */ () => {
                    activate(key);
                  }
                }
              >
                {label(`tab.${key}`, caption)}
              </button>
            ),
          )}
        </div>
        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-${page}`}
          className="grid gap-3 p-4 text-sm"
        >
          {page === "organizer" && (
            <div className="grid gap-1">
              <label htmlFor={`${id}-name`}>{label("name", "Name")}</label>
              <input
                id={`${id}-name`}
                ref={nameField}
                className="rounded border border-slate-300 p-1 read-only:bg-slate-50"
                readOnly={!request.nameEditable}
                value={name}
                aria-invalid={invalidName || undefined}
                aria-describedby={invalidName ? `${id}-name-error` : undefined}
                onChange={
                  /** Edits the user-defined name in the dialog draft. @param event - Current input. @returns Nothing. */
                  (event) => {
                    setName(event.currentTarget.value);
                    setInvalidName(false);
                  }
                }
              />
              {invalidName && (
                <span role="alert" id={`${id}-name-error`} className="text-red-700">
                  {label("invalid-name", "This name is already in use or is invalid.")}
                </span>
              )}
            </div>
          )}
          {page === "graphics" && (
            <BitmapPickPage
              current={draft.GetLevel(level).GetBrush()?.GetGraphic()}
              browseLabel={label("add-and-resize", "Add and Resize")}
              onSelect={selectGraphic}
            />
          )}
          {presetButtons.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {presetButtons.map(
                /** Shows one native gallery choice. @param preset - Sample and rule mutation. @param index - Gallery index. @returns Preset button. */
                ([preview, pick], index) => (
                  <button
                    key={index}
                    type="button"
                    className={`${button} h-14`}
                    onClick={
                      /** Selects this gallery preset. @returns Nothing. */ () => update(pick)
                    }
                  >
                    {preview}
                  </button>
                ),
              )}
            </div>
          )}
          {(page === "position" || page === "customize") && (
            <div className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <label className="grid content-start gap-1">
                {label("level", "Level")}
                <select
                  multiple
                  size={rows.length + 1}
                  className="rounded border border-slate-300 p-1"
                  value={levels.map(String)}
                  onChange={
                    /** Updates the native level mask and all-level selection. @param event - Browser list selection. @returns Nothing. */
                    (event) => {
                      const next = Array.from(
                        event.currentTarget.selectedOptions,
                        /** Reads one level index. @param option - Selected row. @returns Zero-based index. */ (
                          option,
                        ) => Number(option.value),
                      );
                      if (next.includes(count) && !levels.includes(count)) setLevels([count]);
                      else if (next.length > 1)
                        setLevels(
                          next.filter(
                            /** Removes the all-level option when selecting a range. @param index - Row. @returns Whether an individual level. */ (
                              index,
                            ) => index !== count,
                          ),
                        );
                      else if (next.length) setLevels(next);
                    }
                  }
                >
                  {rows.map(
                    /** Lists one native level. @param index - Zero-based level. @returns Level option. */ (
                      index,
                    ) => (
                      <option key={index} value={index}>
                        {index + 1}
                      </option>
                    ),
                  )}
                  <option value={count}>{label("every-level", "1–10")}</option>
                </select>
              </label>
              <div className="grid content-start gap-3">
                {page === "position" ? (
                  <NumberingPositionPage
                    formats={selectedFormats}
                    unit={unit}
                    edit={editLevels}
                    reset={resetPosition}
                    MetricField={MetricSpinButton}
                    label={label}
                  />
                ) : (
                  <NumberingOptionsPage
                    formats={selectedFormats}
                    unit={unit}
                    MetricField={MetricSpinButton}
                    numberingStyle={request.numberingStyle}
                    highestLevel={Math.max(...selectedLevels)}
                    edit={editLevels}
                    characterStyles={request.characterStyles}
                    continuous={draft.IsContinuousNumbering()}
                    setContinuous={
                      /** Exchanges the complete rule's consecutive numbering flag. @param value - New flag. @returns Nothing. */
                      (value) =>
                        update(
                          /** Changes the flag on the native draft. @param next - Rule. @returns Nothing. */ (
                            next,
                          ) => next.SetContinuousNumbering(value),
                        )
                    }
                    label={label}
                  />
                )}
              </div>
            </div>
          )}
          {(page === "position" || page === "customize") && (
            <fieldset className="grid gap-2 rounded border border-slate-200 p-3">
              <legend>{label("preview", "Preview")}</legend>
              <ol className="grid gap-1" aria-hidden="true">
                {rows
                  .slice(Math.min(level, Math.max(0, count - 3)))
                  .slice(0, 3)
                  .map(
                    /** Displays one native level next to a sample text line. @param index - Native level. @returns Preview row. */
                    (index) => {
                      const format = draft.GetLevel(index);
                      const indent =
                        format.GetPositionAndSpaceMode() === "label-alignment"
                          ? format.GetIndentAt() + format.GetFirstLineIndent()
                          : format.GetAbsLSpace() + format.GetFirstLineOffset();
                      const graphic =
                        format.GetNumberingType() === SvxNumType.SVX_NUM_BITMAP
                          ? format.GetBrush()?.GetGraphic()
                          : undefined;
                      const size = format.GetGraphicSize();
                      return (
                        <li
                          key={index}
                          className="flex items-center gap-2"
                          style={{ paddingInlineStart: `clamp(0px, ${indent / 20}pt, 70%)` }}
                        >
                          {graphic ? (
                            <img
                              alt=""
                              src={graphicImageSource(graphic)}
                              style={{
                                width: `${size.Width() / 20}pt`,
                                height: `${size.Height() / 20}pt`,
                              }}
                            />
                          ) : (
                            <span>{previewListMarker(draft, index)}</span>
                          )}
                          <span className="h-0.5 grow bg-slate-300" />
                        </li>
                      );
                    },
                  )}
              </ol>
            </fieldset>
          )}
        </div>
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 p-3">
          <button
            type="button"
            className={button}
            onClick={
              /** Rolls the draft back to its last accepted value. @returns Nothing. */ () =>
                setDraft(new SvxNumRule(saved))
            }
            disabled={!changed}
          >
            {label("reset", "Reset")}
          </button>
          <button type="button" className={button} onClick={onClose}>
            {label("cancel", "Cancel")}
          </button>
          <button
            type="button"
            className={button}
            onClick={
              /** Commits the current draft. @returns Whether it was accepted. */ () => apply()
            }
            disabled={!changed}
          >
            {label("apply", "Apply")}
          </button>
          <button type="submit" className={`${button} bg-slate-100 font-semibold`}>
            {label("ok", "OK")}
          </button>
        </div>
      </form>
    </dialog>
  );
}
