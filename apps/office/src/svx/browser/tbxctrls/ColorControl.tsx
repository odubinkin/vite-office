/** @fileoverview Shared browser palette for suite color commands. */
import { type ReactNode, useState } from "react";
import { useToolboxPopup } from "./use-toolbox-popup";
import PALETTES from "./color-palettes.json" with { type: "json" };
/** Native StyleSettings default consumed by PaletteManager::mnMaxRecentColors; browser style preference editing remains unported. */
const DEFAULT_RECENT_COLOR_COUNT = 12;

/** Renders a split apply button with a Writer-style swatch palette. @param props - Color state and callback. @returns Color control. */
export function ColorControl({
  label,
  property,
  value,
  fallback,
  disabled,
  onColor,
  applyColor,
  onApply,
  icon,
}: Readonly<{
  icon?: ReactNode;
  label: string;
  property: "color" | "highlight";
  value: string;
  fallback: string;
  disabled: boolean;
  onColor: (property: "color" | "highlight", value: string) => void;
  applyColor?: string;
  onApply?: () => void;
}>): React.JSX.Element {
  const { ref: paletteRef, open, toggle, close } = useToolboxPopup();
  const [recent, setRecent] = useState<readonly string[]>([]);
  const [palette, setPalette] = useState<keyof typeof PALETTES>("Standard");
  const currentColor = value === "auto" || value === "transparent" ? fallback : value;
  const marker = property === "color" ? "A" : "▨";
  const apply =
    /** Handles Writer formatting state. @param next - Input value. @returns Callback result. */ (
      next: string,
    ): void => {
      onColor(property, next);
      if (next.startsWith("#")) {
        const recentColor = next.toLowerCase();
        setRecent(
          /** Keeps the most recent distinct colors. @param previous - Previous colors. @returns Updated colors. */
          (previous) =>
            [
              recentColor,
              ...previous.filter(
                /** Checks whether a color differs. @param color - Existing color. @returns Whether it differs. */
                (color) => color !== recentColor,
              ),
            ].slice(0, DEFAULT_RECENT_COLOR_COUNT),
        );
      }
      close(true);
    };
  return (
    <div className="flex items-center" aria-label={label}>
      <button
        aria-label={label}
        className="flex h-8 w-8 flex-col items-center justify-center rounded-l border border-slate-300 bg-white text-base font-bold"
        disabled={disabled}
        onClick={
          /** Handles Writer formatting state.  @returns Callback result. */ () =>
            onApply === undefined ? apply(currentColor) : onApply()
        }
        type="button"
      >
        <span>{icon ?? marker}</span>
        <span
          className="h-1 w-5"
          style={{
            backgroundColor: applyColor ?? currentColor,
          }}
        />
      </button>
      <details className="relative" ref={paletteRef}>
        <summary
          aria-label={`${label} palette`}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={
            /** Keeps an unavailable source control closed. @param event - Native summary press. @returns Nothing. */ (
              event,
            ) => {
              event.preventDefault();
              if (!disabled) toggle();
            }
          }
          className="flex h-8 w-5 cursor-pointer list-none items-center justify-center rounded-r border border-l-0 border-slate-300 bg-white text-xs"
        >
          ▾
        </summary>
        {open && (
          <div
            data-office-palette="true"
            className="absolute left-0 top-full z-40 max-h-[min(24rem,70dvh)] w-56 overflow-auto rounded border border-slate-300 bg-white p-2 shadow-lg"
          >
            <p className="mb-2 text-xs font-semibold">{label}</p>
            <button
              className="mb-2 w-full rounded border px-2 py-1 text-left text-xs"
              disabled={disabled}
              onClick={
                /** Applies the default color. @returns Nothing. */ () =>
                  apply(property === "color" ? "auto" : "transparent")
              }
              type="button"
            >
              {property === "color" ? "Automatic" : "None"}
            </button>
            <select
              aria-label={`${label} palette collection`}
              className="mb-2 w-full border border-slate-300 bg-white px-1 py-1 text-xs"
              onChange={
                /** Changes the color collection. @param event - Selection event. @returns Nothing. */ (
                  event,
                ) => setPalette(event.target.value as keyof typeof PALETTES)
              }
              value={palette}
            >
              {Object.keys(PALETTES).map(
                /** Renders a palette name. @param name - Palette name. @returns Option. */ (
                  name,
                ) => (
                  <option key={name}>{name}</option>
                ),
              )}
            </select>
            <div className="grid grid-cols-6 gap-1">
              {PALETTES[palette].map(
                /** Handles Writer formatting state. @param swatch - Input value. @param index - Palette position. @returns Callback result. */ (
                  swatch,
                  index,
                ) => (
                  <button
                    aria-label={`${label} ${swatch}`}
                    className="h-6 w-6 rounded border border-slate-400"
                    disabled={disabled}
                    key={`${swatch}-${index}`}
                    onClick={
                      /** Handles Writer formatting state.  @returns Callback result. */ () =>
                        apply(swatch)
                    }
                    style={{ backgroundColor: swatch }}
                    type="button"
                  />
                ),
              )}
            </div>
            {recent.length > 0 ? (
              <>
                <p className="my-2 border-b border-slate-200 pb-1 text-xs">Recent</p>
                <div className="grid grid-cols-6 gap-1">
                  {recent.map(
                    /** Renders a recent color. @param color - Color value. @returns Color button. */ (
                      color,
                    ) => (
                      <button
                        aria-label={`${label} recent ${color}`}
                        className="h-6 w-6 rounded border border-slate-400"
                        key={color}
                        onClick={
                          /** Reapplies a recent color. @returns Nothing. */ () => apply(color)
                        }
                        style={{ backgroundColor: color }}
                        type="button"
                      />
                    ),
                  )}
                </div>
              </>
            ) : null}
            <label className="mt-2 flex items-center justify-between text-xs">
              Custom Color…
              <input
                aria-label={`${label} custom color`}
                disabled={disabled}
                onChange={
                  /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                    event,
                  ) => apply(event.target.value)
                }
                type="color"
                value={currentColor}
              />
            </label>
          </div>
        )}
      </details>
    </div>
  );
}
