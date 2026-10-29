/** @fileoverview Replays pinned native observations where still current and checks merged upstream zero-rounding semantics (https://gerrit.libreoffice.org/c/core/+/213228). */
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
/** Recognizes only a superseded all-zero native result, never other historical formatting differences. @param text - Previously captured insertion text. @param separator - Original grouping unit. @returns Whether every output unit was a zero, grouping separator, or leading minus. */
function isSupersededZero(text: string, separator: number): boolean {
  const groupCharacter = String.fromCharCode(separator);
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character !== "0" && !(index === 0 && character === "-") && character !== groupCharacter)
      return false;
  }
  return true;
}
it("matches complete native normal and sanitized formatter states except merged zero-rounding corrections", /** Keeps historical native fixture as evidence but never requires the malformed old text as current output. @returns Nothing. */ () => {
  const capture = fixture.captures.values;
  const bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(bytes.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(capture.digest);
  const lines = bytes.toString().trimEnd().split("\n");
  expect(lines.length).toBe(fixture.rowCount);
  expect(lines.length).toBeGreaterThan(100000);
  const bits = new DataView(new ArrayBuffer(8));
  const mismatches: unknown[] = [];
  let correctedZeroCases = 0;
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
    const oldTextUnits = kind === 1 || kind === 2 ? units.slice(1, -2) : units.slice(0, -1);
    const oldText = String.fromCharCode(...oldTextUnits);
    const signedValue = bits.getFloat64(0, true);
    const modernZero = signedValue < 0 || Object.is(signedValue, -0) ? "-0" : "0";
    // Merged https://gerrit.libreoffice.org/c/core/+/213228 changes these old
    // outputs only when F (including Automatic becoming F) rounds all digits away.
    const wasIncorrectZero =
      (format === Format.rtl_math_StringFormat_F ||
        format === Format.rtl_math_StringFormat_Automatic) &&
      places < 0 &&
      oldText !== modernZero &&
      isSupersededZero(oldText, separator);
    if (wasIncorrectZero) {
      correctedZeroCases++;
      const expectedText = kind === 1 || kind === 2 ? "A" + modernZero + "B" : modernZero;
      const actualText = String.fromCharCode(...after.buffer.subarray(0, after.length));
      if (actualText !== expectedText && mismatches.length < 5)
        mismatches.push({ input: JSON.parse(line).slice(0, 8), actualText, expectedText });
    } else if (JSON.stringify(actual) !== JSON.stringify(expected) && mismatches.length < 5)
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
      const expectedUnits = wasIncorrectZero
        ? modernZero === "-0"
          ? [45, 48, 0]
          : [48, 0]
        : units;
      if (JSON.stringify(actualUnits) !== JSON.stringify(expectedUnits) && mismatches.length < 5)
        mismatches.push({
          nullHeldReplacement: JSON.parse(line).slice(0, 8),
          actualUnits,
          expectedUnits,
        });
      rtl_uString_release(data);
    }
  }
  expect(correctedZeroCases).toBeGreaterThan(0);
  expect(mismatches).toEqual([]);
});
it("formats zero rounding and the former overflow inputs as in merged LibreOffice upstream", /** Checks https://gerrit.libreoffice.org/c/core/+/213227 and https://gerrit.libreoffice.org/c/core/+/213228 across grouped and ungrouped Unicode string APIs. @returns Nothing. */ () => {
  const cases: {
    value: number;
    places: number;
    grouping: readonly number[] | null;
    expected: string;
  }[] = [
    { value: 0, places: -6, grouping: null, expected: "0" },
    { value: 5, places: -3, grouping: null, expected: "0" },
    { value: 12345, places: -6, grouping: null, expected: "0" },
    { value: 1e5, places: -6, grouping: null, expected: "0" },
    { value: 1e5, places: -6, grouping: [1, 0], expected: "0" },
    { value: -1e5, places: -6, grouping: [1, 0], expected: "-0" },
    { value: -0, places: -6, grouping: null, expected: "-0" },
    { value: 1e14, places: -15, grouping: [1, 0], expected: "0" },
    { value: 1e20, places: -21, grouping: [1, 0], expected: "0" },
    { value: 1e20, places: -15, grouping: null, expected: "100000000000000000000" },
    { value: 6e20, places: -21, grouping: null, expected: "1000000000000000000000" },
  ];
  for (const testCase of cases) {
    for (const erase of [false, true]) {
      const result: rtl_uStringSlot = [null];
      rtl_math_doubleToUString(
        result,
        null,
        0,
        testCase.value,
        Format.rtl_math_StringFormat_F,
        testCase.places,
        46,
        testCase.grouping,
        44,
        erase,
      );
      const owned = result[0] as rtl_uString;
      expect(String.fromCharCode(...owned.buffer.subarray(0, owned.length))).toBe(
        testCase.expected,
      );
      expect(owned.buffer[owned.length]).toBe(0);
      rtl_uString_release(owned);
    }
  }
  const insertion: rtl_uStringSlot = [null];
  rtl_uString_newFromStr_WithLength(insertion, Uint16Array.of(65, 66), 2);
  const capacity: [number] = [2];
  rtl_math_doubleToUString(
    insertion,
    capacity,
    1,
    1e5,
    Format.rtl_math_StringFormat_F,
    -6,
    46,
    [1, 0],
    44,
    true,
  );
  const inserted = insertion[0] as rtl_uString;
  expect(String.fromCharCode(...inserted.buffer.subarray(0, inserted.length))).toBe("A0B");
  rtl_uString_release(inserted);
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
