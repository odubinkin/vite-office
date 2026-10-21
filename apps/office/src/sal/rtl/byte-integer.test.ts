/** @fileoverview Source-derived byte RTL integral template and o3tl string-view boundaries, including unsigned64 precision and permissive prefixes. */
import { expect, it } from "vitest";
import { rtl_str_toInt64, rtl_str_toInt64_WithLength, rtl_str_toUInt64 } from "../inc/rtl/string.h";
import { toInt32, toUInt32, toInt64 } from "../../o3tl/inc/string_view";
/** Exact Latin1 byte caller with optional terminator. @param text - Native lexical bytes. @param terminated - Include final NUL. @returns Input. */
function bytes(text: string, terminated = false): Uint8Array {
  return Uint8Array.from(
    (text + (terminated ? "\0" : "")).split(""),
    /** Encodes bytes. @param c - Unit. @returns Byte. */ (c) => c.charCodeAt(0),
  );
}
it.each([
  ["9223372036854775807", 9223372036854775807n],
  ["-9223372036854775808", -9223372036854775808n],
  ["9223372036854775808", 0n],
  ["-9223372036854775809", 0n],
  ["  +42tail", 42n],
  ["-0", 0n],
  ["garbage", 0n],
  ["+", 0n],
  ["\xa0123", 0n],
  ["12\x0034", 12n],
  ["1 2", 1n],
] as const)(
  "preserves signed byte prefix %j",
  /** Uses original signed64 source limits. @param text - Lexical input. @param expected - Native value. @returns Nothing. */ (
    text,
    expected,
  ) => {
    expect(rtl_str_toInt64(bytes(text, true), 10)).toBe(expected);
    expect(rtl_str_toInt64_WithLength(bytes(text), 10, text.length)).toBe(expected);
    expect(toInt64(bytes(text))).toBe(expected);
  },
);
it.each([
  ["18446744073709551615", 18446744073709551615n],
  ["18446744073709551616", 0n],
  ["-1", 0n],
  [" +19x", 19n],
  ["garbage", 0n],
  ["+", 0n],
  ["", 0n],
] as const)(
  "preserves unsigned byte prefix %j",
  /** Minus is not consumed for an unsigned specialization. @param text - Native bytes. @param expected - Native value. @returns Nothing. */ (
    text,
    expected,
  ) => {
    expect(rtl_str_toUInt64(bytes(text, true), 10)).toBe(expected);
  },
);
it("retains hexadecimal64 limits and complete radix families without Number precision loss", /** Tests source boundary values in every admitted radix. @returns Nothing. */ () => {
  expect(rtl_str_toUInt64(bytes("ffffffffffffffff", true), 16)).toBe(0xffffffffffffffffn);
  expect(rtl_str_toUInt64(bytes("10000000000000000", true), 16)).toBe(0n);
  for (let radix = 2; radix <= 36; radix++)
    for (const n of [0n, 1n, 1234567890123456789n, (1n << 63n) - 1n]) {
      expect(
        rtl_str_toInt64_WithLength(bytes(n.toString(radix)), radix, n.toString(radix).length),
      ).toBe(n);
      expect(rtl_str_toUInt64(bytes(((1n << 64n) - 1n).toString(radix), true), radix)).toBe(
        (1n << 64n) - 1n,
      );
    }
});
it("keeps view/C-string termination and signed/unsigned32 range distinctions", /** Empty, high-byte and invalid assertion boundaries remain explicit. @returns Nothing. */ () => {
  expect(rtl_str_toInt64(bytes("12\x0034", true), 10)).toBe(12n);
  expect(rtl_str_toInt64_WithLength(null, 10, 0)).toBe(0n);
  expect(toInt32(bytes("2147483648"))).toBe(0);
  expect(toInt32(bytes("-2147483648"))).toBe(-2147483648);
  expect(toUInt32(bytes("4294967295"))).toBe(4294967295);
  expect(toUInt32(bytes("4294967296"))).toBe(0);
  expect(toUInt32(bytes("-1"))).toBe(0);
  expect(toUInt32(new Uint16Array([49, 50]))).toBe(12);
  expect(
    /** Invokes native terminated-pointer assertion. @returns BigInt. */ () =>
      rtl_str_toUInt64(null, 10),
  ).toThrow("assert(pStr)");
  expect(
    /** Invokes native range assertion first. @returns BigInt. */ () =>
      rtl_str_toInt64_WithLength(null, 1, -1),
  ).toThrow("assert(len >= 0)");
});
