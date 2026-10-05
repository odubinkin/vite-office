/** @fileoverview Owns bounded range clipping at the native SwpHints insertion/formatting responsibility boundary. */
import type { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";
import type { SwFormatINetFormat } from "./fmtatr2";

/** Retains the portions of one hint outside a replacement range. @param hint - Existing hint. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @returns Zero, one, or two clipped clones. */
export function clipHintOutsideRange<T extends SwFormatAutoFormat | SwFormatINetFormat>(
  hint: SwTextAttrEnd<T>,
  start: number,
  end: number,
): readonly SwTextAttrEnd<T>[] {
  if (hint.end <= start || hint.start >= end) return [hint.clone()];
  const retained: SwTextAttrEnd<T>[] = [];
  if (hint.start < start) {
    const prefix = hint.clone();
    prefix.SetEnd(start);
    retained.push(prefix);
  }
  if (hint.end > end) {
    const suffix = hint.clone();
    suffix.start = end;
    retained.push(suffix);
  }
  return retained;
}
