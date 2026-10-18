/** @fileoverview Actual published numeric declarations and page-layout static enum type; formatting services are not simulated. */
import { expect, it } from "vitest";
import * as N from "./NumberingType";
import { SvxNumType as S } from "../../../../../editeng/inc/svxenum";
import {
  PageStyleLayout as L,
  cppu_detail_getUnoType_PageStyleLayout as type,
} from "./PageStyleLayout";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../../../udkapi/com/sun/star/uno/TypeClass";
it("retains original classic/page/bitmap and final published values without claiming formatters", /** The complete table is additionally compared to actual pinned IDL/header in the source audit. @returns Nothing. */ () => {
  expect(Object.keys(N)).toHaveLength(76);
  expect([
    N.CHARS_UPPER_LETTER,
    N.CHARS_LOWER_LETTER,
    N.ROMAN_UPPER,
    N.ROMAN_LOWER,
    N.ARABIC,
    N.NUMBER_NONE,
    N.CHAR_SPECIAL,
    N.PAGE_DESCRIPTOR,
    N.BITMAP,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  expect([
    N.NUMBER_LEGAL_KO,
    N.CHARS_CYRILLIC_UPPER_LETTER_UK,
    N.CHARS_CYRILLIC_LOWER_LETTER_UK,
    N.CHARS_CYRILLIC_UPPER_LETTER_N_UK,
    N.CHARS_CYRILLIC_LOWER_LETTER_N_UK,
  ]).toEqual([71, 72, 73, 74, 75]);
  expect([
    S.SVX_NUM_CHARS_UPPER_LETTER,
    S.SVX_NUM_ROMAN_UPPER,
    S.SVX_NUM_ARABIC,
    S.SVX_NUM_NUMBER_NONE,
    S.SVX_NUM_CHAR_SPECIAL,
    S.SVX_NUM_PAGEDESC,
    S.SVX_NUM_BITMAP,
    S.SVX_NUM_CHARS_CYRILLIC_LOWER_LETTER_N_UK,
  ]).toEqual([0, 2, 4, 5, 6, 7, 8, 75]);
});
it("binds actual cold/warm PageStyleLayout enum and typed Any values", /** Uses the existing normal CPPU type and actual Any, without a replacement type registry. @returns Nothing. */ () => {
  expect([L.ALL, L.LEFT, L.RIGHT, L.MIRRORED, L.MAKE_FIXED_SIZE]).toEqual([0, 1, 2, 3, 2147483647]);
  expect(type()).toBe(type());
  const any = new Any([L.MIRRORED], type),
    out: [L] = [L.ALL];
  try {
    expect(any.getValueTypeClass()).toBe(TypeClass.ENUM);
    expect(any.getValueType().equals(type())).toBe(true);
    expect(any.extract(out, type)).toBe(true);
    expect(out[0]).toBe(L.MIRRORED);
  } finally {
    any.dispose();
  }
});
