/** @fileoverview Browser annotation mode of Writer's pinned Character dialog. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { WriterDialogHeader } from "./WriterDialogHeader";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import * as EE from "../../../editeng/inc/eeitem";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { SvxFontItem } from "../../../editeng/inc/fontitem";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { SvxEscapementItem } from "../../../editeng/inc/escapementitem";
import { SvxEscapement } from "../../../editeng/inc/svxenum";
import {
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../editeng/source/items/textitem";
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

/** Presents the annotation mode of characterproperties.ui over native EditEngine input and output sets. @param props - Initial attributes and request completion. @returns Character dialog. */
export function WriterAnnotationCharDialog({
  input,
  initialPage,
  onCancel,
  onSubmit,
}: Readonly<{
  input: SfxItemSet;
  initialPage?: string | undefined;
  onCancel: () => void;
  onSubmit: (output: SfxItemSet) => void;
}>): React.JSX.Element {
  const localization = useBrowserLocalization();
  const dialog = useRef<HTMLDialogElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const formId = useId();
  const [tab, setTab] = useState(
    Math.max(
      0,
      annotationCharTabs.findIndex(
        /** Matches the original notebook page name. @param page - Native page entry. @returns Whether requested. */
        ([id]) => id === initialPage,
      ),
    ),
  );
  const [resets, setResets] = useState([0, 0, 0, 0]);
  const font = input.GetItemIfSet(EE.EE_CHAR_FONTINFO);
  const height = input.GetItemIfSet(EE.EE_CHAR_FONTHEIGHT);
  const weight = input.GetItemIfSet(EE.EE_CHAR_WEIGHT);
  const posture = input.GetItemIfSet(EE.EE_CHAR_ITALIC);
  const underline = input.GetItemIfSet(EE.EE_CHAR_UNDERLINE);
  const strike = input.GetItemIfSet(EE.EE_CHAR_STRIKEOUT);
  const escapement = input.GetItemIfSet(EE.EE_CHAR_ESCAPEMENT);
  const colorItem = input.GetItemIfSet(EE.EE_CHAR_COLOR);
  const backgroundItem = input.GetItemIfSet(EE.EE_CHAR_BKGCOLOR);
  const family = font instanceof SvxFontItem ? font.GetFamilyName() : "";
  const size = height instanceof SvxFontHeightItem ? String(height.GetHeight() / 20) : "";
  const fontStyle =
    weight instanceof SvxWeightItem && posture instanceof SvxPostureItem
      ? String(Number(weight.GetBoolValue()) * 2 + Number(posture.GetBoolValue()))
      : "";
  const underlining = underline instanceof SvxUnderlineItem ? String(underline.GetValue()) : "";
  const strikethrough = strike instanceof SvxCrossedOutItem ? String(strike.GetValue()) : "";
  const position =
    escapement instanceof SvxEscapementItem ? String(escapement.GetEscapement()) : "";
  const initialColor =
    colorItem instanceof SvxColorItem ? writerColorValue(colorItem.GetValue()) : "";
  const initialBackground =
    backgroundItem instanceof SvxColorItem
      ? writerColorValue(backgroundItem.GetValue(), "transparent")
      : "";
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
    if (tab === 1) setColor(initialColor);
    if (tab === 3) setBackground(initialBackground);
  }

  /** Builds tab-page output items for changed controls. @param event - Character form submission. @returns Nothing. */
  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const output = new SfxItemSet(input.GetPool(), input.GetRanges());
    const nextFamily = String(values.get("family") ?? "").trim();
    if (nextFamily && nextFamily !== family) {
      const base = input.Get(EE.EE_CHAR_FONTINFO);
      if (base instanceof SvxFontItem) {
        const item = base.Clone();
        item.SetFamilyName(nextFamily);
        output.Put(item, true);
      }
    }
    const nextSize = String(values.get("size") ?? "");
    if (nextSize && nextSize !== size)
      output.Put(
        new SvxFontHeightItem(Math.round(Number(nextSize) * 20), 100, EE.EE_CHAR_FONTHEIGHT),
        true,
      );
    const nextStyle = String(values.get("style") ?? "");
    if (nextStyle && nextStyle !== fontStyle) {
      output.Put(
        new SvxWeightItem(
          Number(nextStyle) >= 2 ? FontWeight.WEIGHT_BOLD : FontWeight.WEIGHT_NORMAL,
          EE.EE_CHAR_WEIGHT,
        ),
        true,
      );
      output.Put(
        new SvxPostureItem(
          Number(nextStyle) % 2 ? FontItalic.ITALIC_NORMAL : FontItalic.ITALIC_NONE,
          EE.EE_CHAR_ITALIC,
        ),
        true,
      );
    }
    const nextUnderline = String(values.get("underline") ?? "");
    if (nextUnderline && nextUnderline !== underlining)
      output.Put(new SvxUnderlineItem(Number(nextUnderline), EE.EE_CHAR_UNDERLINE), true);
    const nextStrike = String(values.get("strike") ?? "");
    if (nextStrike && nextStrike !== strikethrough)
      output.Put(new SvxCrossedOutItem(Number(nextStrike), EE.EE_CHAR_STRIKEOUT), true);
    const nextPosition = String(values.get("position") ?? "");
    if (nextPosition && nextPosition !== position)
      output.Put(new SvxEscapementItem(Number(nextPosition), EE.EE_CHAR_ESCAPEMENT), true);
    if (color && color !== initialColor)
      output.Put(new SvxColorItem(writerColorFromPrimitive(color, "auto"), EE.EE_CHAR_COLOR), true);
    if (background && background !== initialBackground)
      output.Put(
        new SvxColorItem(writerColorFromPrimitive(background, "transparent"), EE.EE_CHAR_BKGCOLOR),
        true,
      );
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
              const count = annotationCharTabs.length;
              const next = (tab + (event.key === "ArrowRight" ? 1 : -1) + count) % count;
              setTab(next);
              tabs.current?.querySelectorAll("button")[next]?.focus();
            }
          }
        >
          {annotationCharTabs.map(
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
              <label className={fieldClass}>
                {localization.GetText("writer.character.underlining", "Underlining")}
                <select
                  name="underline"
                  defaultValue={underlining}
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  <option value="" />
                  <option value={FontLineStyle.LINESTYLE_NONE}>None</option>
                  <option value={FontLineStyle.LINESTYLE_SINGLE}>Single</option>
                  <option value={FontLineStyle.LINESTYLE_DOUBLE}>Double</option>
                  <option value={FontLineStyle.LINESTYLE_DOTTED}>Dotted</option>
                </select>
              </label>
              <label className={fieldClass}>
                {localization.GetText("writer.character.strikethrough", "Strikethrough")}
                <select
                  name="strike"
                  defaultValue={strikethrough}
                  className="rounded border border-slate-300 px-2 py-1"
                >
                  <option value="" />
                  <option value={FontStrikeout.STRIKEOUT_NONE}>None</option>
                  <option value={FontStrikeout.STRIKEOUT_SINGLE}>Single</option>
                  <option value={FontStrikeout.STRIKEOUT_DOUBLE}>Double</option>
                </select>
              </label>
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
          </section>
          <section
            role="tabpanel"
            id={`${formId}-page-3`}
            aria-labelledby={`${formId}-tab-3`}
            hidden={tab !== 3}
            key={`background-${resets[3]}`}
          >
            <ColorControl
              label={localization.GetText("writer.character.background", "Character Background")}
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
