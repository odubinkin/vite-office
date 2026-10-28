/** @fileoverview Original encoded OUString constructor and number(double) contracts consumed by XLSX cached-result serialization. */
import { expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import {
  RTL_TEXTENCODING_UTF8 as UTF8,
  RTL_TEXTENCODING_ASCII_US as ASCII,
} from "../inc/rtl/textenc";
import { RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR } from "../inc/rtl/textcvt.h";
import { rtl_stringAllocation } from "./strimp.hxx";
import { text } from "../../i18nlangtag/source/isolang/isolang.tables";
it("uses actual SAL conversion for explicit byte count, embedded zero and default/custom flags", /** The overload differs from the existing const-char literal constructor. @returns Nothing. */ () => {
  const input = Uint8Array.of(65, 0, 0xf0, 0x9f, 0x98, 0x80, 66),
    string = new OUString(input, 6, UTF8),
    zero = new OUString(null, 0, ASCII),
    ascii = new OUString(Uint8Array.of(65, 66, 67), 2, ASCII),
    custom = new OUString(Uint8Array.of(65), 1, ASCII, RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR),
    shared = new OUString(string);
  try {
    expect(text(string)).toBe("A\0😀");
    expect(text(zero)).toBe("");
    expect(text(ascii)).toBe("AB");
    expect(text(custom)).toBe("A");
    expect(shared.pData).toBe(string.pData);
    expect(string.pData.refCount).toBe(2);
    input[0] = 90;
    expect(text(string)).toBe("A\0😀");
  } finally {
    shared.dispose();
    string.dispose();
    zero.dispose();
    ascii.dispose();
    custom.dispose();
  }
});
it.each([
  [0, "0"],
  [-0, "-0"],
  [1.25, "1.25"],
  [-12.5, "-12.5"],
  [1 / 3, "0.333333333333333"],
  [123456789.125, "123456789.125"],
] as const)(
  "retains native number(double) significant digits for %s",
  /** Locale-independent G formatting uses the original17-digit constant. @param input - Binary64. @param expected - Literal output. @returns Nothing. */
  (input, expected) => {
    const value = OUString.numberDouble(input);
    try {
      expect(text(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  },
);
it("preserves encoded-constructor bad_alloc for the actual nullable allocator", /** Uses the source allocator failure seam, not a replacement conversion service. @returns Nothing. */ () => {
  const allocate = rtl_stringAllocation.rtl_allocateString;
  rtl_stringAllocation.rtl_allocateString =
    /** Original allocator failure result. @returns Null. */ () => null;
  try {
    expect(
      /** Calls the original constructor through its real C converter. @returns Owned string. */ () =>
        new OUString(Uint8Array.of(65), 1, ASCII),
    ).toThrow("std::bad_alloc");
  } finally {
    rtl_stringAllocation.rtl_allocateString = allocate;
  }
});
