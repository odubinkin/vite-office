/** @fileoverview Replays every complete unchanged SAL/o3tl signed integer and whitespace observation without original source access. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import fixture from "../../cppu/source/typelib/native-type-primitives-cases.json";
import { implIsWhitespace, toInt32 } from "./string_view";
import { DivMod, implGetDigit } from "../../sal/rtl/strtmpl";
import { rtl_ustr_toInt64_WithLength } from "../../sal/inc/rtl/ustring.h";
import { RTL_STR_MIN_RADIX, RTL_STR_MAX_RADIX } from "../../sal/inc/rtl/string.h";
import { SAL_MIN_INT32, SAL_MAX_INT32 } from "../../sal/inc/types";

describe("original bounded signed integer conversion", /** Groups the actual shared native dependency observations. @returns Nothing. */ () => {
  it("adapts JavaScript UTF-16 strings to the same bounded source view", () => {
    for (const token of ["2x", "-7suffix", "2147483648", "4294967296", "😀12", "  +19!"]) {
      const units = Uint16Array.from({ length: token.length }, (_, index) =>
        token.charCodeAt(index),
      );
      expect(toInt32(token)).toBe(toInt32(units));
    }
  });
  it("matches every complete original integer, predicate, prefix and default result", /** Observes all original output bytes using actual shared runtime owners. @returns Nothing. */ () => {
    const expected = gunzipSync(Buffer.from(fixture.integer.gzipBase64, "base64")),
      actual = Buffer.alloc(expected.length);
    let offset = 0;
    /** Records one complete original signed32 word. @param value - Original word. @returns Nothing. */
    function emit(value: number | boolean): void {
      actual.writeInt32LE(Number(value), offset);
      offset += 4;
    }
    /** Records a complete original signed64 result and its independently converted signed32 value. @param value - Exact signed64 word. @param narrow - Original signed32 word. @returns Nothing. */
    function pair(value: bigint, narrow: number): void {
      actual.writeBigInt64LE(value, offset);
      offset += 8;
      emit(narrow);
    }
    /** Calls original C and o3tl owners for the selected complete input prefix. @param data - Borrowed original input. @param length - Logical prefix. @param radix - Original radix. @returns Nothing. */
    function observe(data: Uint16Array, length: number, radix: number): void {
      pair(
        rtl_ustr_toInt64_WithLength(data, radix, length),
        toInt32(data.subarray(0, length), radix),
      );
    }
    for (const value of [RTL_STR_MIN_RADIX, RTL_STR_MAX_RADIX, SAL_MIN_INT32, SAL_MAX_INT32])
      emit(value);
    for (let radix = 2; radix <= 36; radix++)
      for (const negative of [false, true]) {
        const [div, mod] = DivMod(radix, negative);
        pair(div, mod);
        emit(div > 0n);
      }
    for (let c = 0; c < 65536; c++) {
      emit(implIsWhitespace(c));
      for (let radix = 2; radix <= 36; radix++) emit(implGetDigit(c, radix));
      for (const radix of [2, 10, 16, 36]) {
        observe(Uint16Array.from([c, 49]), 2, radix);
        observe(Uint16Array.from([49, c]), 2, radix);
        observe(Uint16Array.from([32, 45, c, 49]), 4, radix);
      }
    }
    for (const input of fixture.integer.inputs) {
      const data = Uint16Array.from(input.units),
        before = data.slice();
      for (let length = 0; length <= data.length; length++) observe(data, length, input.radix);
      emit(toInt32(data));
      expect(data).toEqual(before);
    }
    expect(offset).toBe(expected.length);
    expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.integer.rawHash);
    expect(actual.equals(expected)).toBe(true);
    expect(rtl_ustr_toInt64_WithLength(null, 10, 0)).toBe(0n);
  });
  it("preserves each genuine checked integer assertion and original guard order", /** Separates fatal outcomes from defined returned values. @returns Nothing. */ () => {
    const invalid = [-32768, -1, 0, 1, 37, 32767],
      data = Uint16Array.from([49, 50, 51]);
    expect(fixture.integerAssertions).toHaveLength(9);
    for (const observed of fixture.integerAssertions) {
      let actual: unknown;
      try {
        if (observed.index < 6)
          rtl_ustr_toInt64_WithLength(data, invalid[observed.index] as number, 3);
        else if (observed.index === 6) rtl_ustr_toInt64_WithLength(data, 10, -1);
        else if (observed.index === 7) rtl_ustr_toInt64_WithLength(data, 0, -1);
        else toInt32(data, 37);
      } catch (error) {
        actual = error;
      }
      expect(observed.signal).toBe("SIGABRT");
      expect(actual).toBeInstanceOf(Error);
      expect((actual as Error).message.replace(/\s/g, "")).toBe(
        `assert(${observed.expression})`.replace(/\s/g, ""),
      );
      expect(data).toEqual(Uint16Array.from([49, 50, 51]));
    }
  });
});
