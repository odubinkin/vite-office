/** @fileoverview Consumed ICU Normalizer2WithImpl and ComposeNormalizer2 UTF-16 contracts. */
import type { Normalizer2Impl } from "./normalizer2impl";
import type { Normalizer2 } from "./unicode/normalizer2";
import { UErrorCode as E, U_FAILURE } from "./unicode/utypes";
import { UnicodeString } from "./unistr";

/** The non-contiguous composition mode from the loaded normalization data. */
export class ComposeNormalizer2 implements Normalizer2 {
  /** Retains the loaded original implementation. @param impl - Nrm2 owner. @returns Composition mode. */
  constructor(private readonly impl: Normalizer2Impl) {}

  /** Original normalize validation and counted composition. @param src - Source. @param dest - Output. @param status - Sticky source status. @returns The same output owner. */
  normalize(src: UnicodeString, dest: UnicodeString, status: [number]): UnicodeString {
    if (U_FAILURE(status[0])) {
      dest.setToBogus();
      return dest;
    }
    const text = src.getBuffer();
    if (src === dest || text === null) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      dest.setToBogus();
      return dest;
    }
    dest.remove();
    const normalized = this.impl.compose(text, true) as string;
    return dest.assign(new UnicodeString(normalized, normalized.length));
  }

  /** Original normalized-state branch, including bogus input handling. @param src - Counted input. @param status - Sticky source status. @returns Exact normalized-state result. */
  isNormalized(src: UnicodeString, status: [number]): boolean {
    if (U_FAILURE(status[0])) return false;
    const text = src.getBuffer();
    if (text === null) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return false;
    }
    return this.impl.compose(text, false) !== null;
  }

  /** Original composition boundary-before query. @param c - Code point. @returns Boundary flag. */
  hasBoundaryBefore(c: number): boolean {
    return this.impl.hasCompBoundaryBefore(c);
  }
}
