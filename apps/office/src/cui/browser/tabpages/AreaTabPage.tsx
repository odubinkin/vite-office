/** @fileoverview Browser presentation of the native Area page and its solid Color subpage. */
import type { ReactNode } from "react";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { Color } from "../../../tools/inc/color";
import PALETTES from "../../../svx/browser/tbxctrls/color-palettes.json" with { type: "json" };
import { useState } from "react";
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
  const [palette, setPalette] = useState<keyof typeof PALETTES>("Standard");
  const selected = page.GetFillStyle();
  const color = rgb(page.GetColor());
  const previous = rgb(page.GetOriginalColor());

  /** Applies either a palette or custom RGB selection through the native fill item. @param value - RGB in browser hex notation. @returns Nothing. */
  function setColor(value: string): void {
    page.SetColor(new Color(Number.parseInt(value.slice(1), 16)), value.toUpperCase());
    changed();
  }

  return (
    <div className="grid gap-3">
      <div className="flex gap-2" role="group" aria-label={label("fill-style", "Fill style")}>
        {(
          [
            [FillStyle.NONE, label("fill-none", "None")],
            [FillStyle.SOLID, label("fill-color", "Color")],
          ] as const
        ).map(
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
      {selected === FillStyle.SOLID && (
        <div className="grid gap-3 rounded border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-sm">
            {label("fill-palette", "Palette")}
            <select
              className="rounded border border-slate-400 p-1"
              value={palette}
              onChange={
                /** Displays another existing suite palette. @param event - Palette selection. @returns Nothing. */
                (event) => setPalette(event.currentTarget.value as keyof typeof PALETTES)
              }
            >
              {Object.keys(PALETTES).map(
                /** Displays one suite palette. @param name - Preset collection. @returns Palette option. */
                (name) => (
                  <option key={name}>{name}</option>
                ),
              )}
            </select>
          </label>
          <div
            className="grid grid-cols-[repeat(auto-fit,minmax(1.5rem,1fr))] gap-1"
            role="group"
            aria-label={label("fill-colors", "Palette colors")}
          >
            {PALETTES[palette].map(
              /** Presents one selectable opaque swatch. @param swatch - Palette RGB. @param index - Color index. @returns Swatch. */
              (swatch, index) => (
                <button
                  key={index}
                  aria-label={swatch}
                  aria-pressed={swatch.toLowerCase() === color}
                  className="aspect-square min-h-5 rounded border border-slate-300 aria-pressed:ring-2 aria-pressed:ring-indigo-700"
                  style={{ backgroundColor: swatch }}
                  type="button"
                  onClick={
                    /** Applies this palette color. @returns Nothing. */ () => setColor(swatch)
                  }
                />
              ),
            )}
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
