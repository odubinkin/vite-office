/** @fileoverview Original ICU78.3 UCaseProps structure and consumed scalar/full-fold constants/macros. */
import type { UTrie2 } from "./utrie2.h";

/** Original UCaseProps data owner; numeric typed arrays represent original native constant spans. */
export interface UCaseProps {
  readonly mem: unknown | null;
  readonly indexes: Int32Array;
  readonly exceptions: Uint16Array;
  readonly unfold: Uint16Array;
  readonly trie: UTrie2;
  readonly formatVersion: Uint8Array;
}

export const _FOLD_CASE_OPTIONS_MASK = 7;
export const UCASE_TYPE_MASK = 3;
export const UCASE_NONE = 0;
export const UCASE_LOWER = 1;
export const UCASE_UPPER = 2;
export const UCASE_TITLE = 3;
export const UCASE_EXCEPTION = 8;
export const UCASE_DELTA_SHIFT = 7;
export const UCASE_EXC_SHIFT = 4;
export const UCASE_EXC_LOWER = 0;
export const UCASE_EXC_FOLD = 1;
export const UCASE_EXC_UPPER = 2;
export const UCASE_EXC_TITLE = 3;
export const UCASE_EXC_DELTA = 4;
export const UCASE_EXC_FULL_MAPPINGS = 7;
export const UCASE_FULL_LOWER = 0xf;
export const UCASE_MAX_STRING_LENGTH = 0x1f;
export const UCASE_EXC_DOUBLE_SLOTS = 0x100;
export const UCASE_EXC_NO_SIMPLE_CASE_FOLDING = 0x200;
export const UCASE_EXC_DELTA_IS_NEGATIVE = 0x400;
export const UCASE_EXC_CONDITIONAL_FOLD = 0x8000;

/** Original case type macro. @param props - UInt16 property. @returns Case type. */
export function UCASE_GET_TYPE(props: number): number {
  return props & UCASE_TYPE_MASK;
}

/** Original upper/title bit macro. @param props - UInt16 property. @returns Original non-normalized bit value. */
export function UCASE_IS_UPPER_OR_TITLE(props: number): number {
  return props & 2;
}

/** Original exception bit macro. @param props - UInt16 property. @returns Original non-normalized bit value. */
export function UCASE_HAS_EXCEPTION(props: number): number {
  return props & UCASE_EXCEPTION;
}

/** Original signed int16 arithmetic-shift delta. @param props - UInt16 property. @returns Signed9-bit delta. */
export function UCASE_GET_DELTA(props: number): number {
  return ((props << 16) >> 16) >> UCASE_DELTA_SHIFT;
}
