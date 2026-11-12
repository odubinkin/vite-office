/** @fileoverview Original unsigned64 string overflow QA and internal UTF16 ASCII equality consumed by the native type converter. */
import { afterEach, expect, it } from "vitest";
import { own, u, releaseDomScope } from "../../test/native-dom";
import { OUString } from "../inc/rtl/ustring";
import {
  rtl_ustr_compareIgnoreAsciiCase_WithLength,
  rtl_ustr_toUInt64,
} from "../inc/rtl/ustring.h";
afterEach(releaseDomScope);
it("ports Test<OUString>::testToUInt64Overflow with all original values", /** Original sal/qa/rtl/strings/test_strings_toint.cxx unsigned64 method. @returns Nothing. */ () => {
  expect(u("18446744073709551614").toUInt64()).toBe((1n << 64n) - 2n);
  expect(u("18446744073709551615").toUInt64()).toBe((1n << 64n) - 1n);
  expect(u("18446744073709551616").toUInt64()).toBe(0n);
});
it("retains unsigned prefix, radix, embedded zero and minus handling through the actual shared parser", /** No replacement numeric parser. @returns Nothing. */ () => {
  expect(u("ffffffffffffffff").toUInt64(16)).toBe((1n << 64n) - 1n);
  expect(u("-1").toUInt64()).toBe(0n);
  expect(u(" +2az").toUInt64(16)).toBe(42n);
  expect(u("17\0ignored").toUInt64()).toBe(17n);
  expect(rtl_ustr_toUInt64(Uint16Array.of(48, 0), 10)).toBe(0n);
});
it("ports checkUtf16 ASCII-equality assertion and qualifies counted views without locale folding", /** Only the actual equalsIgnoreAsciiCase assertion from the wider upstream method is ported. @returns Nothing. */ () => {
  const s = u("abc");
  s.assign(u("de"));
  s.append(u("fde"));
  expect(s.equalsIgnoreAsciiCase(u("DEFDE").subView(0))).toBe(true);
  expect(s.equalsIgnoreAsciiCase(s.getStr().subarray(0, s.getLength()))).toBe(true);
  expect(u("A\0B").equalsIgnoreAsciiCase(u("a\0b"))).toBe(true);
  expect(u("A").equalsIgnoreAsciiCase(u("AB"))).toBe(false);
  expect(u("Ä").equalsIgnoreAsciiCase(u("ä"))).toBe(false);
  expect(u("").equalsIgnoreAsciiCase(new Uint16Array())).toBe(true);
  expect(own(new OUString()).equalsIgnoreAsciiCase(new Uint16Array())).toBe(true);
  expect(
    rtl_ustr_compareIgnoreAsciiCase_WithLength(Uint16Array.of(65), 1, Uint16Array.of(97, 98), 2),
  ).toBe(-1);
  expect(
    rtl_ustr_compareIgnoreAsciiCase_WithLength(Uint16Array.of(65, 98), 2, Uint16Array.of(97), 1),
  ).toBe(1);
  expect(
    rtl_ustr_compareIgnoreAsciiCase_WithLength(Uint16Array.of(66), 1, Uint16Array.of(97), 1),
  ).toBe(1);
});
