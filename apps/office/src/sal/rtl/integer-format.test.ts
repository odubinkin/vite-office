/** @fileoverview Complete original integral formatting streams replayed through actual shared SAL C declarations and source template ownership. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import fixture from "./native-integer-format-cases.json";
import {
  rtl_ustr_valueOfInt32,
  rtl_ustr_valueOfInt64,
  rtl_ustr_valueOfUInt64,
  RTL_USTR_MAX_VALUEOFINT32,
  RTL_USTR_MAX_VALUEOFINT64,
  RTL_USTR_MAX_VALUEOFUINT64,
} from "../inc/rtl/ustring.h";

/** Calls the genuine C contract selected by the original observation caller, retaining exact integral widths. @param kind - Original integral type. @param buffer - Sufficient borrowed output buffer. @param bits - Complete original64-bit input bits. @param radix - Original radix. @returns Original written length. */
function format(kind: number, buffer: Uint16Array | null, bits: bigint, radix: number): number {
  if (kind === 0) return rtl_ustr_valueOfInt32(buffer, Number(BigInt.asIntN(32, bits)), radix);
  if (kind === 1) return rtl_ustr_valueOfInt64(buffer, BigInt.asIntN(64, bits), radix);
  return rtl_ustr_valueOfUInt64(buffer, BigInt.asUintN(64, bits), radix);
}

it("matches every original integer-format digit, terminator, length and untouched initialized buffer unit" /** Replays the complete original initialized native buffer stream. @returns Nothing. */, () => {
  const expected = gunzipSync(Buffer.from(fixture.captures.values.gzipBase64, "base64"));
  const words = new Int32Array(expected.buffer, expected.byteOffset, expected.length / 4);
  const actual = new Int32Array(words.length);
  actual.set([RTL_USTR_MAX_VALUEOFINT32, RTL_USTR_MAX_VALUEOFINT64, RTL_USTR_MAX_VALUEOFUINT64]);
  let observations = 0;
  for (let cursor = 3; cursor < words.length; cursor += 101) {
    const kind = words[cursor] as number,
      radix = words[cursor + 1] as number;
    const low = words[cursor + 2] as number,
      high = words[cursor + 3] as number;
    const bits = BigInt(low >>> 0) | (BigInt(high >>> 0) << 32n);
    const buffer = new Uint16Array(96).fill(0xbeef);
    const length = format(kind, buffer, bits, radix);
    actual.set([kind, radix, low, high, length], cursor);
    actual.set(buffer, cursor + 5);
    observations++;
  }
  const output = Buffer.from(actual.buffer);
  expect(observations).toBe(120031);
  expect(output.length).toBe(fixture.captures.values.byteLength);
  expect(createHash("sha256").update(output).digest("hex")).toBe(fixture.captures.values.digest);
  expect(output.equals(expected)).toBe(true);
});

it("retains original checked null and radix guards for all three C wrappers" /** Replays original checked process assertions through the portable C boundary. @returns Nothing. */, () => {
  expect(fixture.assertions).toHaveLength(9);
  for (const observation of fixture.assertions) {
    const kind = Math.floor(observation.code / 3),
      which = observation.code % 3;
    const radix = which === 1 ? 1 : which === 2 ? 37 : 10;
    const buffer = which === 0 ? null : new Uint16Array(96).fill(0xbeef);
    const expression =
      which === 0 ? "pStr" : "nRadix >= RTL_STR_MIN_RADIX && nRadix <= RTL_STR_MAX_RADIX";
    expect(observation.signal).toBe("SIGABRT");
    expect(observation.stderr).toContain(expression);
    expect(
      /** Invokes the original guarded boundary with its observed invalid argument. @returns Original unreachable length. */
      () => format(kind, buffer, 1n, radix),
    ).toThrow(expression);
    if (buffer !== null) expect([...buffer]).toEqual(new Array<number>(96).fill(0xbeef));
  }
});
