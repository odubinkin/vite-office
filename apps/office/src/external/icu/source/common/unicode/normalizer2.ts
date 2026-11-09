/** @fileoverview Consumed original Normalizer2 counted UTF-16 composition API. */
import type { UnicodeString } from "../unistr";

/** Original normalization operations used by CjkBreakEngine. */
export interface Normalizer2 {
  /** Composes a counted UTF-16 value into a distinct destination. @param src - Source. @param dest - Mutable result. @param status - Sticky source status. @returns The destination. */
  normalize(src: UnicodeString, dest: UnicodeString, status: [number]): UnicodeString;
  /** Tests whether the input is already composed. @param src - Counted UTF-16 input. @param status - Sticky source status. @returns Exact normalized-state result. */
  isNormalized(src: UnicodeString, status: [number]): boolean;
  /** Original composition boundary-before query. @param c - Code point. @returns Whether a boundary precedes it. */
  hasBoundaryBefore(c: number): boolean;
}

export { getNFKCInstance } from "../loadednormalizer2impl";
