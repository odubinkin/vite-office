/** @fileoverview Browser palette for Writer character color commands. */
import { useEffect, useRef, useState } from "react";
import PALETTES from "./writer-color-palettes.json" with { type: "json" };

/** Renders a split apply button with a Writer-style swatch palette. @param props - Color state and callback. @returns Color control. */
export function WriterColorControl({
  label,
  property,
  value,
  fallback,
  disabled,
  onColor,
}: Readonly<{
  label: string;
  property: "color" | "highlight";
  value: string;
  fallback: string;
  disabled: boolean;
  onColor: (property: "color" | "highlight", value: string) => void;
}>): React.JSX.Element {
  const paletteRef = useRef<HTMLDetailsElement>(null);
  const [recent, setRecent] = useState<readonly string[]>([]);
  const [palette, setPalette] = useState<keyof typeof PALETTES>("Standard");
  useEffect(
    /** Dismisses the palette when interaction moves outside its controls. @returns Listener cleanup. */
    () => {
      /** Closes an open palette after an outside pointer press. @param event - Press target. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        if (!paletteRef.current?.contains(event.target as Node))
          paletteRef.current?.removeAttribute("open");
      }
      /** Closes an open palette on Escape. @param event - Keyboard input. @returns Nothing. */
      function dismissOnEscape(event: KeyboardEvent): void {
        if (event.key === "Escape") paletteRef.current?.removeAttribute("open");
      }
      document.addEventListener("pointerdown", dismiss);
      document.addEventListener("keydown", dismissOnEscape);
      return /** Removes palette listeners. @returns Nothing. */ () => {
        document.removeEventListener("pointerdown", dismiss);
        document.removeEventListener("keydown", dismissOnEscape);
      };
    },
    [],
  );
  const currentColor = value === "auto" || value === "transparent" ? fallback : value;
  const marker = property === "color" ? "A" : "▨";
  const apply =
    /** Handles Writer formatting state. @param next - Input value. @returns Callback result. */ (
      next: string,
    ): void => {
      onColor(property, next);
      if (next.startsWith("#"))
        setRecent(
          /** Keeps the most recent distinct colors. @param previous - Previous colors. @returns Updated colors. */
          (previous) =>
            [
              next,
              ...previous.filter(
                /** Checks whether a color differs. @param color - Existing color. @returns Whether it differs. */
                (color) => color !== next,
              ),
            ].slice(0, 6),
        );
      paletteRef.current?.removeAttribute("open");
    };
  return (
    <div className="flex items-center" aria-label={label}>
      <button
        aria-label={label}
        className="flex h-8 w-8 flex-col items-center justify-center rounded-l border border-slate-300 bg-white text-base font-bold"
        disabled={disabled}
        onClick={
          /** Handles Writer formatting state.  @returns Callback result. */ () =>
            apply(currentColor)
        }
        type="button"
      >
        <span>{marker}</span>
        <span
          className="h-1 w-5"
          style={{
            backgroundColor: currentColor,
          }}
        />
      </button>
      <details className="relative" ref={paletteRef}>
        <summary
          aria-label={`${label} palette`}
          className="flex h-8 w-5 cursor-pointer list-none items-center justify-center rounded-r border border-l-0 border-slate-300 bg-white text-xs"
        >
          ▾
        </summary>
        <div
          data-writer-palette="true"
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
      </details>
    </div>
  );
}
