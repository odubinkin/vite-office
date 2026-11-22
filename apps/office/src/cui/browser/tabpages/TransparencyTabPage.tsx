/** @fileoverview Browser presentation of the native uniform Transparency controls and fill preview. */
import { useId, type CSSProperties } from "react";
import type { Color } from "../../../tools/inc/color";
import type { SvxTransparenceTabPage } from "../../source/tabpages/tptrans";

/** Presents the represented native transparency modes. @param props - Page owner, preview color and item exchange. @returns Browser Transparency tab. */
export function TransparencyTabPage({
  page,
  color,
  bitmap,
  changed,
  label,
}: Readonly<{
  page: SvxTransparenceTabPage;
  color: Readonly<Color> | undefined;
  bitmap?: CSSProperties | undefined;
  changed: () => void;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const id = useId();
  const mode = page.GetMode();
  const transparency = page.GetLinear();
  const fieldLabel = label("fill-transparency-percent", "Transparency");
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_10rem]">
      <fieldset className="grid gap-3 rounded border border-slate-200 p-3 text-sm">
        <legend>{label("fill-transparency-mode", "Area Transparency Mode")}</legend>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name={id}
            checked={mode === "off"}
            onChange={
              /** Disables the authored uniform transparency. @returns Nothing. */ () => {
                page.SetMode("off");
                changed();
              }
            }
          />
          {label("fill-transparency-off", "No transparency")}
        </label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={id}
              checked={mode === "linear"}
              onChange={
                /** Selects the native uniform percentage mode. @returns Nothing. */ () => {
                  page.SetMode("linear");
                  changed();
                }
              }
            />
            {fieldLabel}
          </label>
          <input
            aria-label={fieldLabel}
            className="w-20 rounded border border-slate-400 p-1"
            type="number"
            min={0}
            max={100}
            step={1}
            value={transparency}
            disabled={mode !== "linear"}
            onChange={
              /** Exchanges the native integer percentage. @param event - Uniform input. @returns Nothing. */
              (event) => {
                page.SetLinear(event.currentTarget.valueAsNumber);
                changed();
              }
            }
          />
          <span aria-hidden="true">%</span>
        </div>
      </fieldset>
      <div
        aria-label={label("fill-transparency-preview", "Transparency preview")}
        className="overflow-hidden rounded border border-slate-300 bg-white"
        style={{
          backgroundImage: "conic-gradient(#e2e8f0 25%, #fff 0 50%, #e2e8f0 0 75%, #fff 0)",
          backgroundSize: "16px 16px",
        }}
      >
        <div
          className="h-full min-h-16"
          style={{
            backgroundColor:
              color && `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`,
            ...bitmap,
            opacity: mode === "linear" ? 1 - transparency / 100 : 1,
          }}
        />
      </div>
    </div>
  );
}
