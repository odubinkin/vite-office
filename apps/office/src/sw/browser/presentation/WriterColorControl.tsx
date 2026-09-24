/** @fileoverview Browser palette for Writer character color commands. */
const SWATCHES = [
  "#000000",
  "#444444",
  "#666666",
  "#999999",
  "#cccccc",
  "#ffffff",
  "#990000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00aa00",
  "#00ffff",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#f4cccc",
  "#d9ead3",
  "#cfe2f3",
] as const;

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
  const currentColor = value === "auto" || value === "transparent" ? fallback : value;
  const marker = property === "color" ? "A" : "▨";
  const apply =
    /** Handles Writer formatting state. @param next - Input value. @returns Callback result. */ (
      next: string,
    ): void => {
      onColor(property, next);
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
      <details className="relative">
        <summary
          aria-label={`${label} palette`}
          className="flex h-8 w-5 cursor-pointer list-none items-center justify-center rounded-r border border-l-0 border-slate-300 bg-white text-xs"
        >
          ▾
        </summary>
        <div className="absolute left-0 top-full z-40 w-56 rounded border border-slate-300 bg-white p-2 shadow-lg">
          <p className="mb-2 text-xs font-semibold">{label}</p>
          <div className="grid grid-cols-6 gap-1">
            {SWATCHES.map(
              /** Handles Writer formatting state. @param swatch - Input value. @returns Callback result. */ (
                swatch,
              ) => (
                <button
                  aria-label={`${label} ${swatch}`}
                  className="h-6 w-6 rounded border border-slate-400"
                  disabled={disabled}
                  key={swatch}
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
          <button
            className="mt-2 w-full rounded border px-2 py-1 text-left text-xs"
            disabled={disabled}
            onClick={
              /** Handles Writer formatting state.  @returns Callback result. */ () =>
                apply(property === "color" ? "auto" : "transparent")
            }
            type="button"
          >
            {property === "color" ? "Automatic" : "No Highlight"}
          </button>
          <label className="mt-2 flex items-center justify-between text-xs">
            Custom Color
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
