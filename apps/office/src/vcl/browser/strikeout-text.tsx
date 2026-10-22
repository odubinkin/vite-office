/** @fileoverview Browser text-line device for native ImplDrawStrikeoutLine/Char and FontMetricData's non-HarfBuzz fallback; horizontal CSS96dpi metrics replace the unavailable native font device. */
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { getStrikeoutFallbackMetrics } from "../source/font/fontmetric";
import { getStrikeoutCharacterCount } from "../source/outdev/textline";
import { FontStrikeout as S } from "../../tools/inc/fontenum";

/** Paints decoration without adding duplicate DOM text or changing editable content geometry. Inline fragment backgrounds clone the same native paint across wrapped lines. @param props - Full native enum and one accessible text layer. @returns Device span. */
export function StrikeoutText({
  value,
  children,
}: {
  readonly value: S;
  readonly children: ReactNode;
}): React.JSX.Element {
  const element = useRef<HTMLSpanElement>(null);
  useLayoutEffect(
    /** Measures genuine browser font/fragment metrics; releases font and resize subscriptions. @returns Cleanup or nothing for an unpainted enum. */ () => {
      const target = element.current as HTMLSpanElement;
      if (value === S.STRIKEOUT_NONE || value === S.STRIKEOUT_DONTKNOW || value < 0) return;
      const paint =
        /** Repaints native horizontal strikeout against actual font metrics. @returns Nothing. */ () => {
          const style = getComputedStyle(target);
          const canvas = target.ownerDocument.createElement("canvas");
          const context = canvas.getContext("2d");
          if (context === null) return;
          const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
          context.font = font;
          const glyph = value === S.STRIKEOUT_SLASH ? "/" : "X";
          const measured = context.measureText(glyph.repeat(4));
          const ascent = Math.ceil(measured.fontBoundingBoxAscent),
            descent = Math.ceil(measured.fontBoundingBoxDescent);
          if (!Number.isFinite(ascent) || !Number.isFinite(descent)) return;
          const height = ascent + descent;
          if (height <= 0) return;
          let width: number;
          if (value === S.STRIKEOUT_SLASH || value === S.STRIKEOUT_X) {
            const rects = Array.from(target.getClientRects());
            const bounds = target.getBoundingClientRect();
            const scale = target.offsetWidth > 0 ? bounds.width / target.offsetWidth : 1;
            width = Math.ceil(
              Math.max(
                0,
                ...rects.map(
                  /** Reads genuine inline fragments. @param rect - Device box. @returns Width. */ (
                    rect,
                  ) => rect.width,
                ),
              ) / scale,
            );
            const count = getStrikeoutCharacterCount(width, measured.width);
            if (width <= 0) return;
            canvas.width = width;
            canvas.height = height;
            context.font = font;
            context.fillStyle = style.color;
            context.textBaseline = "alphabetic";
            context.direction = "ltr";
            context.fillText(glyph.repeat(count), 0, ascent);
            target.style.backgroundSize = `${width}px ${height}px`;
          } else {
            const metrics = getStrikeoutFallbackMetrics(
              ascent,
              descent,
              Math.max(0, Math.trunc(height - Number.parseFloat(style.fontSize))),
            );
            const mode = value > S.STRIKEOUT_X ? S.STRIKEOUT_SINGLE : value;
            const size =
              mode === S.STRIKEOUT_BOLD
                ? metrics.bold
                : mode === S.STRIKEOUT_DOUBLE
                  ? metrics.double
                  : metrics.size;
            const offsets =
              mode === S.STRIKEOUT_DOUBLE
                ? [metrics.first, metrics.second]
                : [mode === S.STRIKEOUT_BOLD ? metrics.boldOffset : metrics.offset];
            width = 1;
            canvas.width = width;
            canvas.height = height;
            context.fillStyle = style.color;
            for (const offset of offsets) context.fillRect(0, ascent + offset, width, size);
            target.style.backgroundSize = `100% ${height}px`;
          }
          target.style.backgroundImage = `url("${canvas.toDataURL()}")`;
        };
      paint();
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(paint);
      observer?.observe(target);
      const fonts = target.ownerDocument.fonts;
      let active = true;
      void fonts?.ready.then(
        /** Repaints only a live device. @returns Nothing. */ () => {
          if (active) paint();
        },
      );
      fonts?.addEventListener("loadingdone", paint);
      globalThis.addEventListener("resize", paint);
      return /** Stops device subscriptions and erases obsolete paint. @returns Nothing. */ () => {
        active = false;
        observer?.disconnect();
        fonts?.removeEventListener("loadingdone", paint);
        globalThis.removeEventListener("resize", paint);
        target.style.backgroundImage = "";
      };
    },
    [value, children],
  );
  return (
    <span
      ref={element}
      data-native-strikeout={value}
      style={{
        boxDecorationBreak: "clone",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
      }}
    >
      {children}
    </span>
  );
}
