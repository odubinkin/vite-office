/** @fileoverview Actual byte RTL formatter/OString ownership and source formatting witnesses, independent of host toString output. */
import { expect, it } from "vitest";
import { OString } from "../inc/rtl/string";
import { rtl_stringbuffer_newFromStr_WithLength } from "../inc/rtl/strbuf.h";
import { rtl_string_release, type rtl_StringSlot } from "../inc/rtl/string.h";
import { rtl_math_doubleToString, rtl_math_StringFormat as F } from "../inc/rtl/math.h";
/** Reads actual counted native byte storage. @param value - Actual native owner. @returns ASCII output. */
function ascii(value: OString): string {
  return new TextDecoder().decode(value.getStr().subarray(0, value.getLength()));
}
it("preserves existing upstream-derived decimal/exception witnesses through the byte number(double) facade", /** Actual owners must contain byte storage, not Unicode buffers relabelled as byte slots. @returns Nothing. */ () => {
  for (const [value, expected] of [
    [0, "0"],
    [-0, "-0"],
    [NaN, "NaN"],
    [Infinity, "INF"],
    [-Infinity, "-INF"],
    [9.9999999999999929, "9.99999999999999"],
    [1.2345678901234567, "1.23456789012346"],
    [12.25, "12.25"],
    [Number.MIN_VALUE, "5E-324"],
    [Number.MAX_VALUE, "1.7976931348623157E+308"],
  ] as const) {
    const number = OString.numberDouble(value);
    try {
      expect(ascii(number)).toBe(expected);
      expect(number.getStr()).toBeInstanceOf(Uint8Array);
      expect(number.getStr().BYTES_PER_ELEMENT).toBe(1);
    } finally {
      number.dispose();
    }
  }
});
it("inserts formatted bytes through the actual byte-buffer declaration and masks char separators", /** Exercises native mutable capacity and actual buffer data, not injected formatter state. @returns Nothing. */ () => {
  const input = new Uint8Array([97, 98]),
    slot: rtl_StringSlot = [null],
    capacity: [number] = [input.length + 16];
  rtl_stringbuffer_newFromStr_WithLength(slot, input, input.length);
  try {
    rtl_math_doubleToString(
      slot,
      capacity,
      1,
      1234.5,
      F.rtl_math_StringFormat_F,
      1,
      0x12c,
      [3, 0],
      0x12e,
      true,
    );
    const value = new OString(slot[0] as NonNullable<(typeof slot)[0]>);
    try {
      expect(ascii(value)).toBe("a1.234,5b");
      expect(value.getStr()).toBeInstanceOf(Uint8Array);
    } finally {
      value.dispose();
    }
  } finally {
    if (slot[0] !== null) rtl_string_release(slot[0]);
  }
});
