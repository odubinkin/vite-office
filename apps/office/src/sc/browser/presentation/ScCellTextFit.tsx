/** @fileoverview Measures styled Calc text in the browser and applies the native output fit decisions. */
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SvxCellOrientation } from "../../../editeng/inc/svxenum";
import { SvxRotateMode } from "../../../svx/inc/rotmodit";
import {
  getCellTextRepeatCount,
  getCellTextShrinkScale,
  type ScCellTextLayout,
} from "../../source/ui/view/output2";

const fontScale = "--calc-cell-text-scale";

/** Fits the actual script runs in a cell's content box and preserves one accessible copy. @param props - Text runs and native layout. @returns Measured cell text. */
export function ScCellTextFit({
  children,
  layout,
}: Readonly<{ children: ReactNode; layout: ScCellTextLayout }>): React.JSX.Element {
  const probe = useRef<HTMLSpanElement>(null);
  const [fitted, setFitted] = useState({ percent: 100, count: 1, clipped: false });
  const { repeat, orientation, asianVertical, rotation, reference, numeric } = layout;
  useLayoutEffect(
    /** Observes cell resizing, merged geometry and changes to the measured text runs. @returns Observer cleanup. */ () => {
      const sample = probe.current;
      const cell = sample?.closest<HTMLElement>("[data-calc-column][data-calc-row]");
      if (!sample || !cell) return;

      /** Measures the intrinsic text with the requested font size against the current content box. @returns Nothing. */
      function fit(): void {
        if (!sample || !cell) return;
        const box = getComputedStyle(cell);
        const width =
          cell.clientWidth -
          parseFloat(box.paddingLeft || "0") -
          parseFloat(box.paddingRight || "0");
        const height =
          cell.clientHeight -
          parseFloat(box.paddingTop || "0") -
          parseFloat(box.paddingBottom || "0");
        let percent = 100;
        let count = 1;
        let clipped = false;
        if (repeat) count = getCellTextRepeatCount(width, sample.offsetWidth);
        else {
          const radians = (rotation * Math.PI) / 18000;
          const sin = Math.abs(Math.sin(radians));
          const cos = Math.abs(Math.cos(radians));
          const fitHeight =
            rotation !== 0 ||
            asianVertical ||
            orientation === SvxCellOrientation.TopBottom ||
            orientation === SvxCellOrientation.BottomUp;
          const fitWidth =
            !fitHeight || (rotation !== 0 && reference === SvxRotateMode.SVX_ROTATE_MODE_STANDARD);

          /** Reads one axis of the actual text extent. @param horizontal - Whether to measure width. @returns CSS pixel extent. */
          function advance(horizontal: boolean): number {
            if (!sample) return 0;
            const w = sample.offsetWidth;
            const h = sample.offsetHeight;
            if (!rotation) return horizontal ? w : h;
            return horizontal ? Math.trunc(w * cos + h * sin) : Math.trunc(h * cos + w * sin);
          }

          /** Applies the pinned first scale and retry loop on one axis. @param horizontal - Whether to fit width. @param available - Current cell content extent. @returns Nothing. */
          function fitAxis(horizontal: boolean, available: number): void {
            if (!sample) return;
            const initial = percent;
            const { fits } = getCellTextShrinkScale(
              available,
              advance(horizontal),
              /** Updates font height only when the resulting scale is positive. @param factor - Percentage relative to the current scale. @returns Updated extent. */
              (factor) => {
                const next = Math.trunc((initial * factor) / 100);
                if (next > 0) {
                  percent = next;
                  sample.style.setProperty(fontScale, String(percent / 100));
                }
                return advance(horizontal);
              },
            );
            clipped ||= !fits;
          }

          if (fitHeight) fitAxis(false, height);
          if (fitWidth) fitAxis(true, width);
          sample.style.removeProperty(fontScale);
        }
        setFitted(
          /** Avoids re-rendering when the browser measured the same fit. @param previous - Current fit result. @returns Next fit result. */
          (previous) =>
            previous.percent === percent && previous.count === count && previous.clipped === clipped
              ? previous
              : { percent, count, clipped },
        );
      }

      fit();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(fit);
      observer.observe(cell);
      observer.observe(sample);
      return /** Releases both geometry subscriptions. @returns Nothing. */ () =>
        observer.disconnect();
    },
    [children, repeat, orientation, asianVertical, rotation, reference],
  );

  const hashes = numeric && rotation === 0 && fitted.clipped;
  const style = { [fontScale]: fitted.percent / 100 } as CSSProperties;
  return (
    <span style={style}>
      <span
        ref={probe}
        aria-hidden="true"
        style={
          {
            position: "absolute",
            visibility: "hidden",
            pointerEvents: "none",
            inlineSize: "max-content",
            whiteSpace: "pre",
            [fontScale]: 1,
          } as CSSProperties
        }
      >
        {children}
      </span>
      {hashes ? (
        <>
          <span className="sr-only">{children}</span>
          <span aria-hidden="true">###</span>
        </>
      ) : (
        children
      )}
      {fitted.count > 1 && (
        <span aria-hidden="true">
          {Array.from(
            { length: fitted.count - 1 },
            /** Appends one complete copy of the original styled run. @param _ - Unused value. @param index - Copy index. @returns Additional text run. */
            (_, index) => (
              <span key={index}>{children}</span>
            ),
          )}
        </span>
      )}
    </span>
  );
}
