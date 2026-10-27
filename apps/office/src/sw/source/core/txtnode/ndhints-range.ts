/** @fileoverview Owns bounded range clipping at the native SwpHints insertion/formatting responsibility boundary. */
import { SwFormatCharFormat } from "./fmtatr2";
import { SwFormatAutoFormat, type SwTextAttrEnd } from "./txatbase";
import { DestroyTextNodeAttribute } from "./thints-insert";
import { RES_TXTATR_CHARFMT, RES_TXTATR_AUTOFMT } from "../../../inc/hintids";
import { SwTextCharFormat } from "./txtatr2";
import { SwFormatINetFormat } from "./fmtatr2";

/** Retains the portions of one hint outside a replacement range. @param hint - Existing hint. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @returns Zero, one, or two clipped clones. */
export function clipHintOutsideRange<
  T extends SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat,
>(hint: SwTextAttrEnd<T>, start: number, end: number): readonly SwTextAttrEnd<T>[] {
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
  left: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
  right: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
): number {
  return (
    left.start - right.start ||
    right.end - left.end ||
    right.Which() - left.Which() ||
    (left instanceof SwTextCharFormat && right instanceof SwTextCharFormat
      ? left.GetSortNumber() - right.GetSortNumber()
      : 0)
  );
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
  left: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
  right: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
): number {
  return (
    left.end - right.end ||
    right.start - left.start ||
    left.Which() - right.Which() ||
    (left instanceof SwTextCharFormat && right instanceof SwTextCharFormat
      ? right.GetSortNumber() - left.GetSortNumber()
      : 0)
  );
}

/** Compares supported ranges in native Which/start/end-reverse order. @param left - First attribute. @param right - Second attribute. @returns Signed order. */
export function compareHintsByWhichAndStart(
  left: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
  right: SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>,
): number {
  return (
    left.Which() - right.Which() ||
    left.start - right.start ||
    (left instanceof SwTextCharFormat && right instanceof SwTextCharFormat
      ? left.GetSortNumber() - right.GetSortNumber()
      : 0) ||
    right.end - left.end
  );
}

/** Finds native lower/upper Which/start bounds without comparing ends. @param hints - Which map. @param position - Lexicographic boundary. @param upper - Include equals before the bound. @returns Insertion index. */
export function hintWhichStartBound(
  hints: readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>[],
  position: readonly [number, number],
  upper: boolean,
): number {
  let first = 0,
    last = hints.length;
  while (first < last) {
    const middle = Math.floor((first + last) / 2),
      hint = hints[middle] as SwTextAttrEnd<
        SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat
      >;
    const order = hint.Which() - position[0] || hint.start - position[1];
    if (order < 0 || (upper && order === 0)) first = middle + 1;
    else last = middle;
  }
  return first;
}

/** Finds native lower/upper position bounds in a map ordered by that coordinate. @param hints - Start or end map. @param position - Boundary. @param upper - Include equals before the bound. @param byEnd - Whether to compare ends instead of starts. @returns Insertion index. */
export function hintPositionBound(
  hints: readonly SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>[],
  position: number,
  upper: boolean,
  byEnd = false,
): number {
  let first = 0,
    last = hints.length;
  while (first < last) {
    const middle = Math.floor((first + last) / 2);
    const hint = hints[middle] as SwTextAttrEnd<
      SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat
    >;
    const coordinate = byEnd ? hint.end : hint.start;
    if (coordinate < position || (upper && coordinate === position)) first = middle + 1;
    else last = middle;
  }
  return first;
}

/** Supported native map element. */
type RangedTextAttr = SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat | SwFormatCharFormat>;
/** Normalizes fresh owned projection hints, destroying discarded owners while preserving retained object identity. @param hints - Owned values. @returns Ordered normalized map. */
export function NormalizeOwnedTextHints(hints: readonly RangedTextAttr[]): RangedTextAttr[] {
  const sorted = hints
    .filter(
      /** Keeps meaningful supported items, including native empty ranges. @param hint - Candidate attribute. @returns Whether meaningful. */
      (hint) =>
        hint.end >= hint.start &&
        ((hint.format instanceof SwFormatAutoFormat && hint.format.GetStyleHandle().Count() > 0) ||
          (hint.format instanceof SwFormatINetFormat && hint.format.GetValue().length > 0) ||
          hint.format instanceof SwFormatCharFormat),
    )
    .sort(compareHints);
  const normalized: RangedTextAttr[] = [];
  sorted.forEach(
    /** Appends or merges one ordered non-overlapping hint. @param hint - Sorted hint. @returns Nothing. */
    (hint) => {
      if (hint.start === hint.end) {
        normalized.push(hint);
        return;
      }
      let previous: RangedTextAttr | undefined;
      for (let index = normalized.length - 1; index >= 0; index -= 1) {
        const candidate = normalized[index];
        if (candidate?.Which() !== hint.Which() || candidate.start === candidate.end) continue;
        previous = candidate;
        break;
      }
      if (
        previous !== undefined &&
        hint.Which() !== RES_TXTATR_CHARFMT &&
        hint.start < previous.end
      )
        throw new Error("Overlapping Writer same-type hints are not normalized.");
      if (
        previous !== undefined &&
        hint.Which() === RES_TXTATR_AUTOFMT &&
        previous.end === hint.start &&
        previous.format.equals(hint.format)
      )
        previous.SetEnd(hint.end);
      else normalized.push(hint);
    },
  );
  const retained = new Set(normalized);
  for (const hint of hints) if (!retained.has(hint)) DestroyTextNodeAttribute(hint);
  return normalized.sort(compareHints);
}
