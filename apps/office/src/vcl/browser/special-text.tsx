/** @fileoverview Shared browser ImplDrawSpecialText raster projection preserving native relief/shadow/outline order over one actual text layer. Browser bounds and CSS96dpi replace device metrics explicitly;native font/device services remain unported. */
import { Color, COL_BLACK, COL_WHITE, COL_LIGHTGRAY } from "../../tools/inc/color";
import { FontRelief } from "../inc/fntstyle";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
/** Original ordered one-device-pixel offsets,expressed in the browser drawing surface's CSS pixel coordinates. */
const outlineTextOffsets = [
  [-1, -1],
  [1, 1],
  [-1, 0],
  [-1, 1],
  [0, 1],
  [0, -1],
  [1, -1],
  [1, 0],
] as const;
/** Composes original colored offset rasters followed by a white center,without duplicating DOM text. @param props - Actual content,original line paint and contour flag. @returns Native-shaped raster effect over one accessible text instance. */
export function SpecialText({
  enabled,
  shadow = false,
  relief = FontRelief.NONE,
  color = COL_BLACK,
  lineColor,
  children,
  paintStyle,
}: {
  readonly enabled: boolean;
  readonly shadow?: boolean;
  readonly relief?: FontRelief;
  readonly color?: Readonly<Color>;
  readonly lineColor?: Readonly<Color>;
  readonly children: ReactNode;
  readonly paintStyle?: CSSProperties;
}): React.JSX.Element {
  const id = `native-outline-${useId()}`,
    element = useRef<HTMLDivElement>(null),
    [bounds, setBounds] = useState({ width: 0, height: 0 });
  const active = enabled || shadow || relief !== FontRelief.NONE;
  useLayoutEffect(
    /** Borrows actual browser drawing bounds rather than inventing font metrics. @returns Observer cleanup or nothing. */ () => {
      if (!active) return;
      const target = element.current as HTMLDivElement;
      const measure =
        /** Reads actual text-layer geometry in its browser drawing coordinate space. @returns Nothing. */ () => {
          const rect = target.getBoundingClientRect();
          setBounds({ width: rect.width, height: rect.height });
        };
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(
        /** Tracks genuine text-layer layout changes,including loaded fonts. @param entries - Platform observations. @returns Nothing. */ (
          entries,
        ) => {
          for (const entry of entries)
            if (entry.target === target)
              setBounds({ width: entry.contentRect.width, height: entry.contentRect.height });
        },
      );
      observer.observe(target);
      return /** Releases the actual platform subscription. @returns Nothing. */ () =>
        observer.disconnect();
    },
    [active, children],
  );
  if (!active) return <>{children}</>;
  const isRelief = relief !== FontRelief.NONE,
    foreground = isRelief && color.equals(COL_BLACK) ? COL_WHITE : color,
    tint = isRelief
      ? foreground.equals(COL_WHITE)
        ? COL_BLACK
        : COL_LIGHTGRAY
      : color.equals(COL_BLACK) || color.GetLuminance() < 8
        ? COL_LIGHTGRAY
        : COL_BLACK,
    offset = isRelief
      ? (relief === FontRelief.Engraved ? -1 : 1) * (1 + Math.trunc(96 / 300))
      : 1 + Math.trunc((bounds.height - 24) / 24) + (enabled ? 1 : 0),
    hasTint = isRelief || shadow,
    contour = enabled && !isRelief,
    low = Math.min(contour ? -1 : 0, hasTint ? offset : 0),
    high = Math.max(contour ? 1 : 0, hasTint ? offset : 0);

  return (
    <>
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute" }}
      >
        <defs>
          <filter
            id={id}
            filterUnits="userSpaceOnUse"
            x={low}
            y={low}
            width={bounds.width + high - low}
            height={bounds.height + high - low}
            colorInterpolationFilters="sRGB"
          >
            {hasTint && (
              <>
                <feColorMatrix
                  in="SourceGraphic"
                  type="matrix"
                  values={`0 0 0 0 ${tint.GetRed() / 255} 0 0 0 0 ${tint.GetGreen() / 255} 0 0 0 0 ${tint.GetBlue() / 255} 0 0 0 1 0`}
                  result="special-tint"
                />
                <feOffset in="special-tint" dx={offset} dy={offset} result="special-offset" />
              </>
            )}
            {contour &&
              outlineTextOffsets.map(
                /** Preserves each original offset and the source raster's independent colors. @param offset - Source displacement. @param index - Ordered output identity. @returns Raster primitive. */ (
                  [dx, dy],
                  index,
                ) => (
                  <feOffset
                    key={index}
                    in="SourceGraphic"
                    dx={dx}
                    dy={dy}
                    result={`outline${index}`}
                  />
                ),
              )}
            {contour && (
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
                result="center"
              />
            )}
            <feMerge>
              {hasTint && <feMergeNode in="special-offset" />}
              {contour &&
                outlineTextOffsets.map(
                  /** Composites the eight source-colored draws in native order. @param offset - Original displacement. @param index - Raster identity. @returns Composite input. */ (
                    offset,
                    index,
                  ) => {
                    void offset;
                    return <feMergeNode key={index} in={`outline${index}`} />;
                  },
                )}
              <feMergeNode in={contour ? "center" : "SourceGraphic"} />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div
        ref={element}
        style={{
          ...paintStyle,
          ...(isRelief
            ? {
                color: `rgb(${foreground.GetRed()}, ${foreground.GetGreen()}, ${foreground.GetBlue()})`,
                textDecorationColor: lineColor?.equals(COL_BLACK)
                  ? "white"
                  : paintStyle?.textDecorationColor,
              }
            : {}),
          filter: `url(#${id})`,
        }}
      >
        {children}
      </div>
    </>
  );
}
