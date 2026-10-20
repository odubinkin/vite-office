/** @fileoverview Complete genuine native Unicode float-format output streams replayed through original C/header/macro owners. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import fixture from "./native-float-format-cases.json";
import { rtl_ustr_valueOfFloat, RTL_USTR_MAX_VALUEOFFLOAT } from "../inc/rtl/ustring.h";
it("matches every byte of native float output buffers under the original normal and sanitized observations", /** Preserves complete buffer writes,terminator and untouched sentinels for all captured binary32 inputs. @returns Nothing. */ () => {
  const expected = gunzipSync(Buffer.from(fixture.capture.gzipBase64, "base64"));
  expect(expected.length).toBe(fixture.capture.byteLength);
  expect(createHash("sha256").update(expected).digest("hex")).toBe(fixture.capture.digest);
  expect(expected.readInt32LE(0)).toBe(RTL_USTR_MAX_VALUEOFFLOAT);
  expect(RTL_USTR_MAX_VALUEOFFLOAT).toBe(15);
  const actual = Buffer.alloc(expected.length);
  actual.writeInt32LE(RTL_USTR_MAX_VALUEOFFLOAT, 0);
  const scalar = new DataView(new ArrayBuffer(4));
  let offset = 4,
    rows = 0;
  while (offset < expected.length) {
    const bits = expected.readUInt32LE(offset);
    scalar.setUint32(0, bits, true);
    const buffer = new Uint16Array(RTL_USTR_MAX_VALUEOFFLOAT).fill(0xbeef);
    const count = rtl_ustr_valueOfFloat(buffer, scalar.getFloat32(0, true));
    actual.writeUInt32LE(bits, offset);
    actual.writeInt32LE(count, offset + 4);
    for (let unit = 0; unit < buffer.length; unit++)
      actual.writeUInt16LE(buffer[unit] as number, offset + 8 + 2 * unit);
    offset += 8 + 2 * RTL_USTR_MAX_VALUEOFFLOAT;
    rows++;
  }
  expect(rows).toBe(37026);
  expect(offset).toBe(expected.length);
  if (!actual.equals(expected)) {
    const mismatch = actual.findIndex(
      /** Finds the first independently captured differing byte. @param value - Actual byte. @param index - Byte offset. @returns Difference. */ (
        value,
        index,
      ) => value !== expected[index],
    );
    const start = 4 + Math.floor((mismatch - 4) / 38) * 38;
    throw new Error(
      `Native float mismatch bits=${expected.readUInt32LE(start).toString(16)} at${mismatch}:actual=${actual.subarray(start, start + 38).toString("hex")} expected=${expected.subarray(start, start + 38).toString("hex")}`,
    );
  }
});
it("retains the original checked null destination assertion rather than reporting a formatted value", /** Separates genuine original assertion termination from returned output. @returns Nothing. */ () => {
  expect(fixture.assertion).toEqual({ signal: "SIGABRT", expression: "pStr" });
  expect(
    /** Calls the actual C declaration with the original invalid pointer. @returns No value. */ () =>
      rtl_ustr_valueOfFloat(null, 1),
  ).toThrow("assert(pStr)");
});
