/** @fileoverview Original OUString/C NUL-terminated signed64 conversion delegates to the existing exact SAL parser. */
import { expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import { rtl_ustr_toInt32, rtl_ustr_toInt64 } from "../inc/rtl/ustring.h";
import { rtl_str_toInt64, rtl_str_toUInt64 } from "../inc/rtl/string.h";
import { HandleSignChar } from "./strtmpl";
it("retains unsigned byte null assertions and the default signed sign-handler contract", /** Exercises actual original public scalar entry points. @returns Nothing. */ () => {
  expect(
    /** Native null pointer assertion. @returns Integer. */ () => rtl_str_toUInt64(null, 10),
  ).toThrow("assert(pStr)");
  expect(
    /** Signed terminated-byte assertion also precedes integer parsing. @returns Integer. */ () =>
      rtl_str_toInt64(null, 10),
  ).toThrow("assert(pStr)");
  const position: [number] = [0];
  expect(HandleSignChar(terminated("-12"), position)).toBe(true);
  expect(position[0]).toBe(1);
});
/** Creates a source with actual trailing NUL. @param text - UTF16 text. @returns Storage. */
function terminated(text: string): Uint16Array {
  const data = new Uint16Array(text.length + 1);
  for (let i = 0; i < text.length; ++i) data[i] = text.charCodeAt(i);
  return data;
}
it("retains decimal defaults,exact signed64 limits,source prefix parsing and embedded-zero termination", /** Uses real native entry points. @returns Nothing. */ () => {
  for (const [text, value] of [
    ["", 0n],
    [" +42tail", 42n],
    ["-42tail", -42n],
    ["9223372036854775807", 9223372036854775807n],
    ["-9223372036854775808", -9223372036854775808n],
    ["9223372036854775808", 0n],
    ["-9223372036854775809", 0n],
    ["12\u000034", 12n],
    ["bad", 0n],
    ["+", 0n],
    ["-", 0n],
  ] as const) {
    const data = terminated(text),
      source = new OUString(data, text.length);
    expect(rtl_ustr_toInt64(data, 10)).toBe(value);
    expect(source.toInt64()).toBe(value);
    source.dispose();
  }
});
it("uses the existing radix grammar for all admitted bases without narrowing through Number", /** Native formatting supplies literal expected signed64 values. @returns Nothing. */ () => {
  for (let radix = 2; radix <= 36; ++radix)
    for (const value of [
      -9223372036854775808n,
      -1234567890123456789n,
      0n,
      1234567890123456789n,
      9223372036854775807n,
    ]) {
      const text = value.toString(radix),
        data = terminated(text),
        source = new OUString(data, text.length);
      expect(source.toInt64(radix)).toBe(value);
      expect(rtl_ustr_toInt64(data, radix)).toBe(value);
      source.dispose();
    }
  expect(
    /** Native null pointer assertion precedes parsing. @returns Integer. */ () =>
      rtl_ustr_toInt64(null, 10),
  ).toThrow("assert(pStr)");
  expect(
    /** Native admitted radix assertion. @returns Integer. */ () =>
      rtl_ustr_toInt64(new Uint16Array([0]), 1),
  ).toThrow("nRadix");
});

it("supports original char-array literals and existing borrowed field views without a numeric adapter", /** New const integer query is available through the actual native reference surface. @returns Nothing. */ () => {
  const value = new OUString(new Uint8Array([49, 50, 51, 0]));
  const field = value.getDataAddress(),
    borrowed = OUString.unacquired(field);
  expect(borrowed).toBe(value);
  expect(borrowed.toInt64()).toBe(123n);
  const empty = new OUString(new Uint8Array([0]));
  expect(empty.toInt64()).toBe(0n);
  for (const invalid of [new Uint8Array([49, 0, 0]), new Uint8Array([49, 50])])
    expect(
      /** Original literal precondition. @returns Native owner. */ () => new OUString(invalid),
    ).toThrow("ConstCharArrayDetector");
  value.dispose();
  empty.dispose();
});

it("instantiates the original signed32 parser at its own overflow limits through C and OUString", /** Signed32 parsing is not a narrowing signed64 cast. @returns Nothing. */ () => {
  for (let radix = 2; radix <= 36; ++radix) {
    for (const value of [-2147483649, -2147483648, -42, 0, 42, 2147483647, 2147483648]) {
      const source = value.toString(radix),
        data = terminated(source),
        string = new OUString(data, source.length);
      const expected = value < -2147483648 || value > 2147483647 ? 0 : value;
      expect(rtl_ustr_toInt32(data, radix)).toBe(expected);
      expect(string.toInt32(radix)).toBe(expected);
      string.dispose();
    }
  }
  const source = new OUString(terminated("12\0ignored"), 10);
  expect(OUString.unacquired(source.getDataAddress()).toInt32()).toBe(12);
  source.dispose();
  expect(
    /** Original pointer precondition. @returns Signed32. */ () => rtl_ustr_toInt32(null, 10),
  ).toThrow("assert(pStr)");
});
