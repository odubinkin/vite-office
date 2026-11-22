/** @fileoverview Browser image import and placement in the native Area bitmap subpage. */
import { useState } from "react";
import { BitmapMode } from "../../../offapi/com/sun/star/drawing/BitmapMode";
import { RectanglePoint } from "../../../offapi/com/sun/star/drawing/RectanglePoint";
import { Size } from "../../../tools/inc/gen";
import { graphicImageSource } from "../../../vcl/browser/graphic-image-source";
import { Graphic } from "../../../vcl/source/gdi/graph";
import type { SvxBitmapTabPage } from "../../source/tabpages/tpbitmap";

/** Native rectangle points in the original image position list order. */
const bitmapPositions = [
  [RectanglePoint.LEFT_TOP, "Top Left"],
  [RectanglePoint.MIDDLE_TOP, "Top Center"],
  [RectanglePoint.RIGHT_TOP, "Top Right"],
  [RectanglePoint.LEFT_MIDDLE, "Center Left"],
  [RectanglePoint.MIDDLE_MIDDLE, "Center"],
  [RectanglePoint.RIGHT_MIDDLE, "Center Right"],
  [RectanglePoint.LEFT_BOTTOM, "Bottom Left"],
  [RectanglePoint.MIDDLE_BOTTOM, "Bottom Center"],
  [RectanglePoint.RIGHT_BOTTOM, "Bottom Right"],
] as const;

/** Presents the native Image fields for the supported encoded PNG and JPEG fills. @param props - Native image page and change notification. @returns Image page. */
export function BitmapTabPage({
  page,
  changed,
  label,
}: Readonly<{
  page: SvxBitmapTabPage;
  changed: () => void;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const item = page.GetBitmap();
  const graphic = item.GetGraphic();

  /** Validates and embeds an image with its preferred 96 DPI browser size converted to twips. @param file - User-selected image. @returns Import completion. */
  async function importBitmap(file: File): Promise<void> {
    setLoading(true);
    setError(false);
    try {
      if (file.type !== "image/png" && file.type !== "image/jpeg")
        throw new Error("Unsupported bitmap format");
      const image = await createImageBitmap(file);
      const size = new Size(image.width * 15, image.height * 15);
      image.close();
      page.SetBitmap(
        file.name,
        new Graphic(new Uint8Array(await file.arrayBuffer()), file.type, size),
      );
      changed();
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
      <fieldset className="grid gap-3 rounded border border-slate-200 p-3 text-sm">
        <legend>{label("fill-image", "Image")}</legend>
        <label className="grid gap-1">
          {label("fill-image-import", "Add / Import")}
          <input
            type="file"
            accept="image/png,image/jpeg"
            disabled={loading}
            onChange={
              /** Imports the chosen file and lets the same file be chosen again. @param event - Actual file input. @returns Nothing. */
              (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (file) void importBitmap(file);
              }
            }
          />
        </label>
        {graphic && <span>{item.GetName()}</span>}
        {error && (
          <span role="alert">{label("fill-image-error", "Choose a valid PNG or JPEG image.")}</span>
        )}
        <label className="grid gap-1">
          {label("fill-image-style", "Style")}
          <select
            value={page.GetMode()}
            onChange={
              /** Exchanges the selected native image style. @param event - Style field. @returns Nothing. */
              (event) => {
                page.SetMode(Number(event.currentTarget.value) as BitmapMode);
                changed();
              }
            }
          >
            <option value={BitmapMode.NO_REPEAT}>
              {label("fill-image-custom", "Custom position/size")}
            </option>
            <option value={BitmapMode.REPEAT}>{label("fill-image-tiled", "Tiled")}</option>
            <option value={BitmapMode.STRETCH}>{label("fill-image-stretched", "Stretched")}</option>
          </select>
        </label>
        <label className="grid gap-1">
          {label("fill-image-position", "Position")}
          <select
            value={page.GetPosition()}
            disabled={page.GetMode() === BitmapMode.STRETCH}
            onChange={
              /** Exchanges the selected reference point. @param event - Position field. @returns Nothing. */
              (event) => {
                page.SetPosition(Number(event.currentTarget.value) as RectanglePoint);
                changed();
              }
            }
          >
            {bitmapPositions.map(
              /** Presents one original position. @param entry - Native point and labels. @returns Option. */
              ([value, name]) => (
                <option key={value} value={value}>
                  {label(`fill-image-position-${value}`, name)}
                </option>
              ),
            )}
          </select>
        </label>
      </fieldset>
      {graphic && (
        <img
          className="m-auto max-h-32 max-w-full object-contain"
          alt={label("fill-image-preview", "Preview")}
          src={graphicImageSource(graphic)}
        />
      )}
    </div>
  );
}
