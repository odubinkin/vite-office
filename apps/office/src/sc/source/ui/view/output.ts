/** @fileoverview Native data-bar rectangle and zero-axis geometry in cell coordinates. */
import type { ScDataBarInfo } from "../../../inc/colorscale";
import { Rectangle } from "../../../../tools/inc/gen";

/** Resolves the extent an output device paints for a data bar. @param info - Conditional value and axis. @param rect - Inclusive native cell bounds. @param oneX - Logical width of a pixel. @param oneY - Logical height of a pixel. @returns Bar bounds and optional axis column. */
export function drawDataBars(
  info: ScDataBarInfo,
  rect: Rectangle,
  oneX: number,
  oneY: number,
): { bar: Rectangle; axis: number | undefined } | undefined {
  const left = rect.Left() + 2 * oneX;
  const right = rect.Right() - 2 * oneX;
  const top = rect.Top() + 2 * oneY;
  const bottom = rect.Bottom() - 2 * oneY;
  const zero = Math.trunc(left + ((right - left) * info.mnZero) / 100);
  const length = info.mnLength;
  let bar: Rectangle;
  if (length < 0) {
    bar = new Rectangle(zero + Math.trunc(((zero - left) * length) / 100), top, zero, bottom);
  } else if (length > 0) {
    bar = new Rectangle(zero, top, zero + Math.trunc(((right - zero) * length) / 100), bottom);
  } else {
    return undefined;
  }
  bar.Normalize();
  return { bar, axis: info.mnZero && info.mnZero !== 100 ? zero : undefined };
}
