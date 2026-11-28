/** @fileoverview Browser presentation of the native Area page and its solid Color subpage. */
import type { ReactNode } from "react";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { Color } from "../../../tools/inc/color";
import {
  getPaletteColors,
  getPaletteName,
  getRecentColors,
  paletteNames,
  setPaletteName,
  type NamedColor,
  type PaletteName,
} from "../../../svx/browser/tbxctrls/palette-manager";
import { useState } from "react";
import { BitmapTabPage } from "./BitmapTabPage";
import type { SvxAreaTabPage } from "../../source/tabpages/tparea";

/** Renders the old and new solid color preview boxes in context. @param props - Native preview values and labels. @returns Color preview. */
function FillPreview({
  label,
  contents,
}: Readonly<{ label: string; contents: ReactNode }>): React.JSX.Element {
  return (
    <div className="flex-1">
      <span className="text-xs">{label}</span>
      <div className="mt-1 h-12 overflow-hidden rounded border border-slate-300 bg-white">
        {contents}
      </div>
    </div>
  );
}

/** Formats the represented native palette color. @param color - Solid fill color. @returns Browser RGB value. */
function rgb(color: Readonly<Color> | undefined): string | undefined {
  return color && `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
}

/** Presents the represented native None and Color controls. @param props - Area page owner and item exchange hook. @returns Browser Area page. */
export function AreaTabPage({
  page,
  changed,
  label,
}: Readonly<{
  page: SvxAreaTabPage;
  changed: () => void;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const [palette, setPalette] = useState(getPaletteName);
  const selected = page.GetFillStyle();
  const modes: [FillStyle.NONE | FillStyle.SOLID | FillStyle.BITMAP, string][] = [
    [FillStyle.NONE, label("fill-none", "None")],
    [FillStyle.SOLID, label("fill-color", "Color")],
  ];
  if (page.bitmap) modes.push([FillStyle.BITMAP, label("fill-image", "Image")]);
  const color = rgb(page.GetColor());
  const previous = rgb(page.GetOriginalColor());

  /** Applies either a palette or custom RGB selection through the native fill item. @param value - RGB in browser hex notation. @param name - Optional preset name. @returns Nothing. */
  function setColor(value: string, name = ""): void {
    page.SetColor(new Color(Number.parseInt(value.slice(1), 16)), name);
    changed();
  }

  /** Displays a native named palette with browser buttons. @param entries - Palette entries. @param label - Accessible palette name. @param recent - Whether these are recent picks. @returns Palette group. */
  function swatches(
    entries: readonly NamedColor[],
    label: string,
    recent = false,
  ): React.JSX.Element {
    return (
      <div
        className="grid max-h-52 grid-cols-[repeat(auto-fill,minmax(1.5rem,1fr))] gap-1 overflow-y-auto p-1"
        role="group"
        aria-label={label}
      >
        {entries.map(
          /** Presents one selectable named swatch. @param swatch - Native named color. @param index - Color position. @returns Swatch. */
          ({ name, rgb }, index) => (
            <button
              key={index}
              aria-label={name}
              title={name}
              aria-pressed={
                rgb === color && (recent ? !page.GetColorName() : page.GetColorName() === name)
              }
              className="aspect-square min-h-5 rounded border border-slate-300 aria-pressed:ring-2 aria-pressed:ring-indigo-700"
              data-rgb={rgb}
              style={{ backgroundColor: rgb }}
              type="button"
              onClick={
                /** Applies a palette color independently of document submission. @returns Nothing. */ () =>
                  setColor(rgb, recent ? "" : name)
              }
            />
          ),
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-2" role="group" aria-label={label("fill-style", "Fill style")}>
        {modes.map(
          /** Selects one represented Area mode. @param entry - Native mode and label. @returns Mode button. */
          ([style, name]) => (
            <button
              key={style}
              type="button"
              aria-pressed={selected === style}
              className="rounded border border-slate-300 px-3 py-1.5 text-sm aria-pressed:bg-indigo-50"
              onClick={
                /** Changes the shared native fill selection. @returns Nothing. */ () => {
                  page.SelectFillType(style);
                  changed();
                }
              }
            >
              {name}
            </button>
          ),
        )}
      </div>
      {selected === FillStyle.BITMAP && page.bitmap && (
        <BitmapTabPage page={page.bitmap} changed={changed} label={label} />
      )}
      {selected === FillStyle.SOLID && (
        <div className="grid gap-3 rounded border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-sm">
            {label("fill-palette", "Palette")}
            <select
              className="rounded border border-slate-400 p-1"
              value={palette}
              onChange={
                /** Displays another existing suite palette. @param event - Palette selection. @returns Nothing. */
                (event) => {
                  const name = event.currentTarget.value as PaletteName;
                  setPalette(name);
                  setPaletteName(name);
                }
              }
            >
              {paletteNames.map(
                /** Displays one suite palette. @param name - Preset collection. @returns Palette option. */
                (name) => (
                  <option key={name}>{name}</option>
                ),
              )}
            </select>
          </label>
          {swatches(getPaletteColors(palette), label("fill-colors", "Palette colors"))}
          <div className="grid gap-1">
            <span className="text-sm">{label("fill-recent-colors", "Recent Colors")}</span>
            {swatches(getRecentColors(), label("fill-recent-colors", "Recent Colors"), true)}
          </div>
          <label className="flex items-center gap-2 text-sm">
            {label("fill-custom-color", "Custom Color")}
            <input
              type="color"
              value={color ?? "#000000"}
              onChange={
                /** Applies the browser color chooser value. @param event - RGB selection. @returns Nothing. */
                (event) => setColor(event.currentTarget.value)
              }
            />
          </label>
          <div className="flex gap-3">
            <FillPreview
              label={label("fill-previous", "Previous")}
              contents={<div className="h-full" style={{ backgroundColor: previous }} />}
            />
            <FillPreview
              label={label("fill-new", "New")}
              contents={<div className="h-full" style={{ backgroundColor: color }} />}
            />
          </div>
        </div>
      )}
    </div>
  );
}
