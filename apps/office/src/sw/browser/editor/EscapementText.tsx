/** @fileoverview Browser font-metric port for the consumed horizontal SwSubFont escapement path; one accessible text layer and native complete values are retained. */
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { getHorizontalEscapementOffset } from "../../source/core/txtnode/swfont";
/** Measures actual full and proportional font metrics for native automatic/manual baseline arithmetic. @param props - Original offset,height and accessible content. @returns Font device spans. */
export function EscapementText({
  value,
  children,
}: {
  readonly value: Readonly<{ offset: number; height: number }>;
  readonly children: ReactNode;
}): React.JSX.Element {
  const element = useRef<HTMLSpanElement>(null),
    text = useRef<HTMLSpanElement>(null);
  useLayoutEffect(
    /** Synchronizes device metrics with font and viewport lifecycle. @returns Cleanup or nothing for native off. */
    () => {
      if (value.offset === 0) return;
      const target = element.current as HTMLSpanElement,
        portion = text.current as HTMLSpanElement;
      const paint =
        /** Reads original and proportional font-device metrics in CSS96dpi units. @returns Nothing. */
        () => {
          const style = getComputedStyle(target),
            size = Number.parseFloat(style.fontSize),
            canvas = target.ownerDocument.createElement("canvas"),
            context = canvas.getContext("2d");
          if (context === null || !Number.isFinite(size)) return;
          context.font = `${style.fontStyle} ${style.fontWeight} ${size}px ${style.fontFamily}`;
          const original = context.measureText("Mg");
          context.font = `${style.fontStyle} ${style.fontWeight} ${(size * value.height) / 100}px ${style.fontFamily}`;
          const proportional = context.measureText("Mg");
          const ascent = Math.ceil(original.fontBoundingBoxAscent),
            descent = Math.ceil(original.fontBoundingBoxDescent),
            scaledAscent = Math.ceil(proportional.fontBoundingBoxAscent),
            scaledDescent = Math.ceil(proportional.fontBoundingBoxDescent);
          if (![ascent, descent, scaledAscent, scaledDescent].every(Number.isFinite)) return;
          const displacement = getHorizontalEscapementOffset(
            value.offset,
            ascent + descent,
            ascent,
            scaledAscent + scaledDescent,
            scaledAscent,
          );
          portion.style.verticalAlign = `${-displacement}px`;
        };
      paint();
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(paint);
      observer?.observe(target);
      const fonts = target.ownerDocument.fonts;
      let active = true;
      void fonts?.ready.then(
        /** Ignores detached font readiness. @returns Nothing. */
        () => {
          if (active) paint();
        },
      );
      fonts?.addEventListener("loadingdone", paint);
      globalThis.addEventListener("resize", paint);
      return /** Releases the actual device subscriptions. @returns Nothing. */ () => {
        active = false;
        observer?.disconnect();
        fonts?.removeEventListener("loadingdone", paint);
        globalThis.removeEventListener("resize", paint);
        portion.style.verticalAlign = "";
      };
    },
    [value.offset, value.height, children],
  );
  return (
    <span
      ref={element}
      data-native-escapement={value.offset}
      data-native-escapement-height={value.height}
    >
      <span ref={text} style={value.offset === 0 ? undefined : { fontSize: `${value.height}%` }}>
        {children}
      </span>
    </span>
  );
}
