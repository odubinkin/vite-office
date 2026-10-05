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

/** Validates a bounded text range. @param textLength - Complete text length. @param start - Inclusive start. @param end - Exclusive end. @returns Nothing. */
export function assertTextRange(textLength: number, start: number, end: number): void {
  if (
    !Number.isInteger(textLength) ||
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    textLength < 0 ||
    start < 0 ||
    end < start ||
    end > textLength
  )
    throw new Error("Writer hint range is outside the text node.");
}

/** Compares hints using LibreOffice start, end, and item ordering. @param left - First. @param right - Second. @returns Signed ordering. */
export function compareHints(
  left: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
  right: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
): number {
  return left.start - right.start || right.end - left.end || right.Which() - left.Which();
}

/** Compares native lexicographic boundaries. @param left - First boundary. @param right - Second boundary. @returns Signed order. */
export function compareWhichStartPairs(
  left: readonly [number, number],
  right: readonly [number, number],
): number {
  return left[0] - right[0] || left[1] - right[1];
}

/** Compares supported ranges in native end/start-reverse/Which order. @param left - First attribute. @param right - Second attribute. @returns Signed order. */
export function compareHintsByEnd(
  left: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
  right: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
): number {
  return left.end - right.end || right.start - left.start || left.Which() - right.Which();
}

/** Compares supported ranges in native Which/start/end-reverse order. @param left - First attribute. @param right - Second attribute. @returns Signed order. */
export function compareHintsByWhichAndStart(
  left: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
  right: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat>,
): number {
  return left.Which() - right.Which() || left.start - right.start || right.end - left.end;
}
