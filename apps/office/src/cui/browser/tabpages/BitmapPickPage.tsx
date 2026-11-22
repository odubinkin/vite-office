/** @fileoverview Browser controls for the CUI graphic bullet gallery and Add and Resize. */
import { useRef, useState } from "react";
import { SvxBrushItem, SvxGraphicPosition } from "../../../editeng/source/items/frmitems.brush";
import type { ConstSvxNumberFormat, SvxNumberFormat } from "../../../editeng/inc/numitem";
import { VertOrientation } from "../../../offapi/com/sun/star/text/VertOrientation";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { getUniformNumberingValue } from "../../source/tabpages/numpages";
import type { Graphic } from "../../../vcl/source/gdi/graph";
import { addGalleryItem, loadGallery, readGalleryFile } from "./bitmap-gallery";

/** Presents the native graphic value set and local-file picker. @param props - Current graphic, strings and native selection callbacks. @returns Graphic pick page. */
export function BitmapPickPage({
  current,
  browseLabel,
  onSelect,
}: Readonly<{
  current: Graphic | undefined;
  browseLabel: string;
  onSelect: (graphic: Graphic, accept: boolean) => void;
}>): React.JSX.Element {
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(loadGallery);
  return (
    <div className="grid gap-3">
      <div className="grid max-h-64 grid-cols-4 gap-2 overflow-auto sm:grid-cols-8">
        {items.map(
          /** Presents one gallery value. @param item - Gallery image. @param index - Stable gallery index. @returns Selectable image. */
          (item, index) => (
            <button
              key={index}
              type="button"
              aria-label={item.name}
              title={item.name}
              aria-pressed={current?.Equals(item.graphic) ?? false}
              className="grid h-12 place-items-center rounded border border-slate-300 aria-pressed:bg-slate-200"
              onClick={
                /** Selects the image. @returns Nothing. */ () => onSelect(item.graphic, false)
              }
              onDoubleClick={
                /** Selects and accepts the dialog. @returns Nothing. */ () =>
                  onSelect(item.graphic, true)
              }
            >
              <img alt="" src={item.src} />
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        className="justify-self-start rounded border border-slate-300 px-3 py-1.5 text-sm"
        onClick={
          /** Opens the browser image picker. @returns Nothing. */ () => input.current?.click()
        }
      >
        {browseLabel}
      </button>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={
          /** Adds the resized file to the gallery without changing the style selection. @param event - Current picker. @returns Nothing. */
          (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (!file) return;
            void readGalleryFile(file, 30).then(
              /** Publishes a successfully decoded file. @param item - Optional result. @returns Nothing. */
              (item) => {
                if (!item) return;
                setItems(addGalleryItem(item));
              },
              /** Mirrors the native picker on unsupported image data. @returns Nothing. */ () =>
                undefined,
            );
          }
        }
      />
    </div>
  );
}

const orientations = [
  [VertOrientation.TOP, "Top of baseline"],
  [VertOrientation.CENTER, "Center of baseline"],
  [VertOrientation.BOTTOM, "Bottom of baseline"],
  [VertOrientation.CHAR_TOP, "Top of character"],
  [VertOrientation.CHAR_CENTER, "Center of character"],
  [VertOrientation.CHAR_BOTTOM, "Bottom of character"],
  [VertOrientation.LINE_TOP, "Top of line"],
  [VertOrientation.LINE_CENTER, "Center of line"],
  [VertOrientation.LINE_BOTTOM, "Bottom of line"],
] as const;

/** Native twip values exchanged with the host's metric editor. */
export type BitmapMetricField = React.ComponentType<{
  "aria-label": string;
  value: number | undefined;
  unit: FieldUnit;
  disabled: boolean;
  onValueChange: (twips: number) => void;
}>;

/** Binds the native Customize graphic chooser and geometry controls. @param props - Format exchange and UI bindings. @returns Native graphic controls. */
export function NumberingBitmapOptions({
  formats,
  edit,
  unit,
  MetricField,
  numberingStyle,
  label,
}: Readonly<{
  formats: readonly [ConstSvxNumberFormat, ...ConstSvxNumberFormat[]];
  edit: (change: (format: SvxNumberFormat, level: number) => void) => void;
  unit: FieldUnit;
  MetricField: BitmapMetricField;
  numberingStyle: string;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const input = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const [keepRatio, setKeepRatio] = useState(false);
  const enabled = formats.some(
    /** Checks for a selected image. @param format - Native format. @returns Image presence. */
    (format) => format.GetBrush()?.GetGraphic() !== undefined,
  );
  const orientation = getUniformNumberingValue(
    formats,
    /** Reads a selected native orientation. @param format - Level format. @returns Orientation code. */
    (format) => format.GetVertOrient(),
  );
  /** Applies the original graphic dimensions and captures the style and orientation. @param graphic - Embedded graphic. @returns Nothing. */
  function assign(graphic: Graphic): void {
    const brush = new SvxBrushItem(graphic, SvxGraphicPosition.GPOS_AREA, 0);
    edit(
      /** Exchanges the selected bitmap in each affected level. @param format - Native level. @returns Nothing. */
      (format) => {
        format.SetCharFormatName(numberingStyle);
        format.SetGraphicBrush(
          brush,
          graphic.GetPrefSize(),
          format.GetVertOrient() || VertOrientation.TOP,
        );
      },
    );
    if (menu.current) menu.current.open = false;
  }
  /** Exchanges native sizes without changing the stored graphic. @param dimension - Changed dimension. @param value - Twip extent. @returns Nothing. */
  function resize(dimension: "Width" | "Height", value: number): void {
    edit(
      /** Applies the preferred ratio of this graphic. @param format - Mutable level. @returns Nothing. */
      (format) => {
        const brush = format.GetBrush();
        const preferred = brush?.GetGraphic()?.GetPrefSize();
        const size = format.GetGraphicSize();
        const ratio = preferred?.Height() ? preferred.Width() / preferred.Height() : 1;
        if (dimension === "Width") {
          size.setWidth(value);
          if (keepRatio) size.setHeight(Math.trunc(value / ratio));
        } else {
          size.setHeight(value);
          if (keepRatio) size.setWidth(Math.trunc(value * ratio));
        }
        format.SetGraphicBrush(brush, size, format.GetVertOrient());
      },
    );
  }
  return (
    <>
      <div className="flex items-start gap-2 sm:col-span-2">
        <span>{label("customize.graphics", "Graphics")}:</span>
        <details ref={menu}>
          <summary className="cursor-pointer">{label("customize.select-image", "Select…")}</summary>
          <button
            type="button"
            onClick={
              /** Opens the native file picker. @returns Nothing. */ () => input.current?.click()
            }
          >
            {label("customize.from-file", "From file…")}
          </button>
          <details>
            <summary>{label("customize.gallery", "Gallery")}</summary>
            <div className="grid grid-cols-5 gap-1">
              {loadGallery().map(
                /** Lists one native gallery item. @param item - Image. @param index - Gallery index. @returns Gallery action. */
                (item, index) => (
                  <button
                    key={index}
                    className="grid h-8 place-items-center rounded border"
                    type="button"
                    aria-label={item.name}
                    onClick={
                      /** Assigns this graphic. @returns Nothing. */ () => assign(item.graphic)
                    }
                  >
                    <img alt="" src={item.src} />
                  </button>
                ),
              )}
            </div>
          </details>
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={
              /** Imports a document-local graphic. @param event - Browser file input. @returns Nothing. */
              (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                void readGalleryFile(file, Infinity).then(
                  /** Applies the decoded local graphic. @param item - Optional graphic. @returns Nothing. */
                  (item) => {
                    if (item) assign(item.graphic);
                  },
                  /** Abandons unsupported images. @returns Nothing. */ () => undefined,
                );
              }
            }
          />
        </details>
      </div>
      {(["Width", "Height"] as const).map(
        /** Binds one native extent. @param dimension - Extent getter. @returns Metric control. */
        (dimension) => (
          <label key={dimension} className="grid gap-1">
            {label(`customize.${dimension.toLowerCase()}`, dimension)}
            <MetricField
              aria-label={label(`customize.${dimension.toLowerCase()}`, dimension)}
              unit={unit}
              disabled={!enabled}
              value={getUniformNumberingValue(
                formats,
                /** Reads this level's physical extent. @param format - Native level. @returns Twips. */
                (format) => format.GetGraphicSize()[dimension](),
              )}
              onValueChange={
                /** Changes the dimension. @param value - Extent. @returns Nothing. */ (value) =>
                  resize(dimension, value)
              }
            />
          </label>
        ),
      )}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          disabled={!enabled}
          checked={keepRatio}
          onChange={
            /** Sets the native ratio toggle. @param event - Native checkbox. @returns Nothing. */
            (event) => setKeepRatio(event.currentTarget.checked)
          }
        />
        {label("customize.keep-ratio", "Keep ratio")}
      </label>
      <label className="grid gap-1">
        {label("customize.alignment", "Alignment")}
        <select
          disabled={!enabled}
          className="rounded border border-slate-400 p-1"
          value={orientation || ""}
          onChange={
            /** Applies the bitmap's orientation in each selected level. @param event - Current selection. @returns Nothing. */
            (event) => {
              const next = Number(event.currentTarget.value);
              edit(
                /** Transfers alignment without modifying the graphic or size. @param format - Native level. @returns Nothing. */
                (format) =>
                  format.SetGraphicBrush(format.GetBrush(), format.GetGraphicSize(), next),
              );
            }
          }
        >
          {!orientation && <option value="" disabled />}
          {orientations.map(
            /** Presents one native placement. @param entry - Original code and label. @returns Placement. */
            ([id, caption]) => (
              <option key={id} value={id}>
                {label(`customize.orientation.${id}`, caption)}
              </option>
            ),
          )}
        </select>
      </label>
    </>
  );
}
