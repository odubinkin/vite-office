/** @fileoverview Original ICU78.3 scalar case algorithms, public scalar delegates and full-fold mapping over pinned tables; locale/context string mapping remains unported. */
import {
  _FOLD_CASE_OPTIONS_MASK,
  UCASE_EXC_SHIFT,
  UCASE_EXC_LOWER,
  UCASE_EXC_FOLD,
  UCASE_EXC_UPPER,
  UCASE_EXC_TITLE,
  UCASE_EXC_DELTA,
  UCASE_EXC_FULL_MAPPINGS,
  UCASE_FULL_LOWER,
  UCASE_EXC_DOUBLE_SLOTS,
  UCASE_EXC_NO_SIMPLE_CASE_FOLDING,
  UCASE_EXC_DELTA_IS_NEGATIVE,
  UCASE_EXC_CONDITIONAL_FOLD,
  UCASE_LOWER,
  UCASE_GET_TYPE,
  UCASE_IS_UPPER_OR_TITLE,
  UCASE_HAS_EXCEPTION,
  UCASE_GET_DELTA,
  type UCaseProps,
} from "./ucase.h";
import { UTRIE2_GET16 } from "./utrie2.h";
import { ucase_props_singleton } from "./ucase_props_data";
import { U_FOLD_CASE_DEFAULT } from "./unicode/stringoptions";

/** Original flagsOffset population-count table, copied byte-for-byte as integer data. */
const flagsOffset = new Uint8Array([
  0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 1,
  2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 1, 2,
  2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 2, 3, 3,
  4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 1, 2, 2, 3,
  2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 2, 3, 3, 4, 3,
  4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 2, 3, 3, 4, 3, 4,
  4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 3, 4, 4, 5, 4, 5, 5,
  6, 4, 5, 5, 6, 5, 6, 6, 7, 4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8,
]);

/** Explicit language adapter for the original mutable const uint16_t pointer variable. */
export interface ExceptionPointer {
  readonly data: Uint16Array;
  index: number;
}

/** Original exception pointer macro. @param csp - Actual properties owner. @param props - Original UInt16 properties. @returns Original exception span/offset. */
export function GET_EXCEPTIONS(csp: UCaseProps, props: number): ExceptionPointer {
  return { data: csp.exceptions, index: props >> UCASE_EXC_SHIFT };
}

/** Original optional slot bit. @param flags - Original exception word. @param idx - Slot. @returns Bit value. */
export function HAS_SLOT(flags: number, idx: number): number {
  return flags & (1 << idx);
}

/** Original lookup of preceding populated slots. @param flags - Exception word. @param idx - Slot. @returns Slot offset. */
export function SLOT_OFFSET(flags: number, idx: number): number {
  return flagsOffset[flags & ((1 << idx) - 1)] as number;
}

/** Original slot macro, preserving the pointer at the final UInt16 word. @param excWord - Exception word. @param idx - Populated slot. @param pe - Pointer after the exception word. @returns Original int32 slot value. */
export function GET_SLOT_VALUE(excWord: number, idx: number, pe: ExceptionPointer): number {
  if ((excWord & UCASE_EXC_DOUBLE_SLOTS) === 0) {
    pe.index += SLOT_OFFSET(excWord, idx);
    return pe.data[pe.index] as number;
  } else {
    pe.index += 2 * SLOT_OFFSET(excWord, idx);
    const value = pe.data[pe.index++] as number;
    return (value << 16) | (pe.data[pe.index] as number);
  }
}

/** Original table-driven simple lowercase, without a host casing provider. @param c - Integral UChar32. @returns Original simple scalar mapping. */
export function ucase_tolower(c: number): number {
  c |= 0;
  const props = UTRIE2_GET16(ucase_props_singleton.trie, c);
  if (!UCASE_HAS_EXCEPTION(props)) {
    if (UCASE_IS_UPPER_OR_TITLE(props)) c += UCASE_GET_DELTA(props);
  } else {
    const pe = GET_EXCEPTIONS(ucase_props_singleton, props),
      excWord = pe.data[pe.index++] as number;
    if (HAS_SLOT(excWord, UCASE_EXC_DELTA) && UCASE_IS_UPPER_OR_TITLE(props)) {
      const delta = GET_SLOT_VALUE(excWord, UCASE_EXC_DELTA, pe);
      return (excWord & UCASE_EXC_DELTA_IS_NEGATIVE) === 0 ? c + delta : c - delta;
    }
    if (HAS_SLOT(excWord, UCASE_EXC_LOWER)) c = GET_SLOT_VALUE(excWord, UCASE_EXC_LOWER, pe);
  }
  return c;
}

/** Borrowed native const-char16 mapping span; index is the pointed-to unit. */
export interface FullFoldingPointer {
  readonly data: Readonly<ArrayLike<number>>;
  readonly index: number;
}
const iDot = new Uint16Array([0x69, 0x307]);
/** Original scalar/full-string folding with complemented unchanged output and reset borrowed pointer. @param c - Nonnegative UChar32. @param output - Native string pointer output. @param options - Fold options. @returns Code point, string length up to31, or complemented unchanged input. */
export function ucase_toFullFolding(
  c: number,
  output: [FullFoldingPointer | null],
  options: number,
): number {
  c |= 0;
  options >>>= 0;
  let result = c;
  output[0] = null;
  const props = UTRIE2_GET16(ucase_props_singleton.trie, c);
  if (!UCASE_HAS_EXCEPTION(props)) {
    if (UCASE_IS_UPPER_OR_TITLE(props)) result = c + UCASE_GET_DELTA(props);
  } else {
    const pe = GET_EXCEPTIONS(ucase_props_singleton, props),
      excWord = pe.data[pe.index++] as number,
      pe2 = { ...pe };
    if (excWord & UCASE_EXC_CONDITIONAL_FOLD) {
      if ((options & _FOLD_CASE_OPTIONS_MASK) === U_FOLD_CASE_DEFAULT) {
        if (c === 0x49) return 0x69;
        if (c === 0x130) {
          output[0] = { data: iDot, index: 0 };
          return 2;
        }
      } else {
        if (c === 0x49) return 0x131;
        if (c === 0x130) return 0x69;
      }
    } else if (HAS_SLOT(excWord, UCASE_EXC_FULL_MAPPINGS)) {
      let full = GET_SLOT_VALUE(excWord, UCASE_EXC_FULL_MAPPINGS, pe);
      ++pe.index;
      pe.index += full & UCASE_FULL_LOWER;
      full = (full >> 4) & 0xf;
      if (full !== 0) {
        output[0] = { data: pe.data, index: pe.index };
        return full;
      }
    }
    if (excWord & UCASE_EXC_NO_SIMPLE_CASE_FOLDING) return ~c;
    if (HAS_SLOT(excWord, UCASE_EXC_DELTA) && UCASE_IS_UPPER_OR_TITLE(props)) {
      const delta = GET_SLOT_VALUE(excWord, UCASE_EXC_DELTA, pe2);
      return (excWord & UCASE_EXC_DELTA_IS_NEGATIVE) === 0 ? c + delta : c - delta;
    }
    const index = HAS_SLOT(excWord, UCASE_EXC_FOLD)
      ? UCASE_EXC_FOLD
      : HAS_SLOT(excWord, UCASE_EXC_LOWER)
        ? UCASE_EXC_LOWER
        : -1;
    if (index < 0) return ~c;
    result = GET_SLOT_VALUE(excWord, index, pe2);
  }
  return result === c ? ~result : result;
}

/** Original simple uppercase. @param c - Integral UChar32. @returns Original simple scalar mapping. */
export function ucase_toupper(c: number): number {
  c |= 0;
  const props = UTRIE2_GET16(ucase_props_singleton.trie, c);
  if (!UCASE_HAS_EXCEPTION(props)) {
    if (UCASE_GET_TYPE(props) === UCASE_LOWER) c += UCASE_GET_DELTA(props);
  } else {
    const pe = GET_EXCEPTIONS(ucase_props_singleton, props);
    const excWord = pe.data[pe.index++] as number;
    if (HAS_SLOT(excWord, UCASE_EXC_DELTA) && UCASE_GET_TYPE(props) === UCASE_LOWER) {
      const delta = GET_SLOT_VALUE(excWord, UCASE_EXC_DELTA, pe);
      return (excWord & UCASE_EXC_DELTA_IS_NEGATIVE) === 0 ? c + delta : c - delta;
    }
    if (HAS_SLOT(excWord, UCASE_EXC_UPPER)) c = GET_SLOT_VALUE(excWord, UCASE_EXC_UPPER, pe);
  }
  return c;
}

/** Original simple titlecase. @param c - Integral UChar32. @returns Original simple scalar mapping. */
export function ucase_totitle(c: number): number {
  c |= 0;
  const props = UTRIE2_GET16(ucase_props_singleton.trie, c);
  if (!UCASE_HAS_EXCEPTION(props)) {
    if (UCASE_GET_TYPE(props) === UCASE_LOWER) c += UCASE_GET_DELTA(props);
  } else {
    const pe = GET_EXCEPTIONS(ucase_props_singleton, props);
    const excWord = pe.data[pe.index++] as number;
    if (HAS_SLOT(excWord, UCASE_EXC_DELTA) && UCASE_GET_TYPE(props) === UCASE_LOWER) {
      const delta = GET_SLOT_VALUE(excWord, UCASE_EXC_DELTA, pe);
      return (excWord & UCASE_EXC_DELTA_IS_NEGATIVE) === 0 ? c + delta : c - delta;
    }
    let idx: number;
    if (HAS_SLOT(excWord, UCASE_EXC_TITLE)) idx = UCASE_EXC_TITLE;
    else if (HAS_SLOT(excWord, UCASE_EXC_UPPER)) idx = UCASE_EXC_UPPER;
    else return c;
    c = GET_SLOT_VALUE(excWord, idx, pe);
  }
  return c;
}

/** Original simple case folding. @param c - Integral UChar32. @param options - UInt32 options, low3 bits participate. @returns Original simple scalar fold. */
export function ucase_fold(c: number, options: number): number {
  c |= 0;
  options >>>= 0;
  const props = UTRIE2_GET16(ucase_props_singleton.trie, c);
  if (!UCASE_HAS_EXCEPTION(props)) {
    if (UCASE_IS_UPPER_OR_TITLE(props)) c += UCASE_GET_DELTA(props);
  } else {
    const pe = GET_EXCEPTIONS(ucase_props_singleton, props);
    const excWord = pe.data[pe.index++] as number;
    let idx: number;
    if (excWord & UCASE_EXC_CONDITIONAL_FOLD) {
      switch (c) {
        case 0x49:
          return (options & _FOLD_CASE_OPTIONS_MASK) === U_FOLD_CASE_DEFAULT ? 0x69 : 0x131;
        case 0x130:
          return (options & _FOLD_CASE_OPTIONS_MASK) === U_FOLD_CASE_DEFAULT ? c : 0x69;
      }
    }
    if ((excWord & UCASE_EXC_NO_SIMPLE_CASE_FOLDING) !== 0) return c;
    if (HAS_SLOT(excWord, UCASE_EXC_DELTA) && UCASE_IS_UPPER_OR_TITLE(props)) {
      const delta = GET_SLOT_VALUE(excWord, UCASE_EXC_DELTA, pe);
      return (excWord & UCASE_EXC_DELTA_IS_NEGATIVE) === 0 ? c + delta : c - delta;
    }
    if (HAS_SLOT(excWord, UCASE_EXC_FOLD)) idx = UCASE_EXC_FOLD;
    else if (HAS_SLOT(excWord, UCASE_EXC_LOWER)) idx = UCASE_EXC_LOWER;
    else return c;
    c = GET_SLOT_VALUE(excWord, idx, pe);
  }
  return c;
}

/** Original public lowercase delegate. @param c - UChar32. @returns Scalar mapping. */
export function u_tolower(c: number): number {
  return ucase_tolower(c);
}
/** Original public uppercase delegate. @param c - UChar32. @returns Scalar mapping. */
export function u_toupper(c: number): number {
  return ucase_toupper(c);
}
/** Original public titlecase delegate. @param c - UChar32. @returns Scalar mapping. */
export function u_totitle(c: number): number {
  return ucase_totitle(c);
}
/** Original public fold delegate. @param c - UChar32. @param options - UInt32 options. @returns Scalar mapping. */
export function u_foldCase(c: number, options: number): number {
  return ucase_fold(c, options);
}
