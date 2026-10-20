/** @fileoverview Browser raster composition for the original ImplDrawSpecialText outline stencil over actual glyph/line pixels;native font/device services are not simulated. */
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
export function OutlinedText({
  enabled,
  children,
  paintStyle,
}: {
  readonly enabled: boolean;
  readonly children: ReactNode;
  readonly paintStyle?: CSSProperties;
}): React.JSX.Element {
  const id = `native-outline-${useId()}`,
    element = useRef<HTMLDivElement>(null),
    [bounds, setBounds] = useState({ width: 0, height: 0 });
  useLayoutEffect(
    /** Borrows actual browser drawing bounds rather than inventing font metrics. @returns Observer cleanup or nothing. */ () => {
      if (!enabled) return;
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
    [enabled, children],
  );
  if (!enabled) return <>{children}</>;
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
            x="-1"
            y="-1"
            width={bounds.width + 2}
            height={bounds.height + 2}
            colorInterpolationFilters="sRGB"
          >
            {outlineTextOffsets.map(
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
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
              result="center"
            />
            <feMerge>
              {outlineTextOffsets.map(
                /** Composites the eight source-colored draws in native order. @param offset - Original displacement. @param index - Raster identity. @returns Composite input. */ (
                  offset,
                  index,
                ) => {
                  void offset;
                  return <feMergeNode key={index} in={`outline${index}`} />;
                },
              )}
              <feMergeNode in="center" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div ref={element} style={{ ...paintStyle, filter: `url(#${id})` }}>
        {children}
      </div>
    </>
  );
}
