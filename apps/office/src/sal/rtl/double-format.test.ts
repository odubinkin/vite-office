/** @fileoverview Replays genuine original numeric formatting and Unicode replacement/insertion observations. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import {
  rtl_math_doubleToUString,
  rtl_math_StringFormat as Format,
  rtl_math_DecimalPlaces as Places,
} from "../inc/rtl/math.h";
import {
  rtl_uString_new,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_acquire,
  rtl_uString_release,
  type rtl_uStringSlot,
  type rtl_uString,
} from "../inc/rtl/ustring.h";
import { rtl_uStringbuffer_newFromStr_WithLength } from "../inc/rtl/ustrbuf.h";
import fixture from "./native-double-format-cases.json";
const groups = [[0], [3, 0], [3, 2, 0], [1, 0], [1, 2, 3, 0], [2, 4, 1, 0]];
it("matches complete native normal and sanitized formatter states with actual string ownership", /** Checks captured units,terminator,capacity,refs and relative identity for all native mode/precision/grouping/erase inputs. @returns Nothing. */ () => {
  const capture = fixture.captures.values;
  const bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(bytes.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(capture.digest);
  const lines = bytes.toString().trimEnd().split("\n");
  expect(lines.length).toBe(fixture.rowCount);
  expect(lines.length).toBeGreaterThan(100000);
  const bits = new DataView(new ArrayBuffer(8));
  const mismatches: unknown[] = [];
  for (const line of lines) {
    const [
      hex,
      format,
      places,
      groupIndex,
      decimal,
      separator,
      erase,
      kind,
      expectedCap,
      identity,
      oldRefs,
      refs,
      units,
    ] = JSON.parse(line) as [
      string,
      Format,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number[],
    ];
    bits.setBigUint64(0, BigInt("0x" + hex), true);
    const slot: rtl_uStringSlot = [null];
    const cap: [number] = [kind === 1 ? 18 : kind === 2 ? 2 : 0];
    const initial = Uint16Array.of(65, 66);
    if (kind === 1) rtl_uStringbuffer_newFromStr_WithLength(slot, initial, 2);
    else if (kind === 3) rtl_uString_new(slot);
    else rtl_uString_newFromStr_WithLength(slot, initial, 2);
    const before = slot[0] as rtl_uString;
    rtl_uString_acquire(before);
    rtl_math_doubleToUString(
      slot,
      kind === 0 ? null : cap,
      kind === 0 ? -7 : kind === 3 ? 0 : 1,
      bits.getFloat64(0, true),
      format,
      places,
      decimal,
      groupIndex < 0 ? null : (groups[groupIndex] as number[]),
      separator,
      Boolean(erase),
    );
    const after = slot[0] as rtl_uString;
    const actual = [
      cap[0],
      Number(before === after),
      before.refCount | 0,
      after.refCount | 0,
      [...after.buffer.subarray(0, after.length + 1)],
    ];
    const expected = [expectedCap, identity, oldRefs, refs, units];
    if (JSON.stringify(actual) !== JSON.stringify(expected) && mismatches.length < 5)
      mismatches.push({ input: JSON.parse(line).slice(0, 8), actual, expected });
    rtl_uString_release(before);
    rtl_uString_release(after);
    if (kind === 0) {
      const emptySlot: rtl_uStringSlot = [null];
      rtl_math_doubleToUString(
        emptySlot,
        null,
        -7,
        bits.getFloat64(0, true),
        format,
        places,
        decimal,
        groupIndex < 0 ? null : (groups[groupIndex] as number[]),
        separator,
        Boolean(erase),
      );
      const data = emptySlot[0] as rtl_uString;
      const actualUnits = [...data.buffer.subarray(0, data.length + 1)];
      if (JSON.stringify(actualUnits) !== JSON.stringify(units) && mismatches.length < 5)
        mismatches.push({ nullHeldReplacement: JSON.parse(line).slice(0, 8), actualUnits, units });
      rtl_uString_release(data);
    }
  }
  expect(mismatches).toEqual([]);
});
it("exports original numeric selector and decimal sentinel values", /** Rejects accidental reordered enum ABI or a host INT32_MAX substitution for the native28bit sentinel. @returns Nothing. */ () => {
  expect([
    Format.rtl_math_StringFormat_E,
    Format.rtl_math_StringFormat_F,
    Format.rtl_math_StringFormat_G,
    Format.rtl_math_StringFormat_Automatic,
    Format.rtl_math_StringFormat_E1,
    Format.rtl_math_StringFormat_E2,
    Format.rtl_math_StringFormat_G1,
    Format.rtl_math_StringFormat_G2,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  expect(Places.rtl_math_DecimalPlaces_Max).toBe(0x7ffffff);
  expect(Places.rtl_math_DecimalPlaces_DefaultSignificance).toBe(Places.rtl_math_DecimalPlaces_Max);
});
