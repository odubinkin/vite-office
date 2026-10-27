/** @fileoverview Validates actual ICU C locale facades, buffer lengths, termination and sticky error boundaries. */
import { expect, it } from "vitest";
import * as locale from "./uloc.buffer";
import { locale_get_default } from "./locid.default";
import { UErrorCode as E } from "./unicode/utypes";

const cases = [
  [locale.uloc_getName, "en_Latn_US_POSIX@calendar=gregorian"],
  [locale.uloc_getBaseName, "en_Latn_US_POSIX"],
  [locale.uloc_canonicalize, "en_Latn_US_POSIX@calendar=gregorian"],
  [locale.uloc_getLanguage, "en"],
  [locale.uloc_getScript, "Latn"],
  [locale.uloc_getCountry, "US"],
  [locale.uloc_getVariant, "POSIX"],
] as const;

it.each(cases)(
  "preserves native terminated and preflight output for %s",
  /** Checks C truncation and null-terminated source semantics through real sinks. @param call - Actual C facade. @param expected - Independent normalized result. @returns Nothing. */ (
    call,
    expected,
  ) => {
    const id = "en_Latn_US_POSIX@calendar=gregorian\0ignored",
      length = expected.length;
    for (const capacity of [1, length, length + 1, length + 5]) {
      const output = new Uint8Array(capacity).fill(0x7f),
        status: [number] = [0];
      expect(call(id, output, capacity, status)).toBe(length);
      expect(new TextDecoder().decode(output.subarray(0, Math.min(capacity, length)))).toBe(
        expected.slice(0, capacity),
      );
      if (capacity > length) {
        expect(output[length]).toBe(0);
        expect(status[0]).toBe(0);
      } else
        expect(status[0]).toBe(
          capacity === length ? E.U_STRING_NOT_TERMINATED_WARNING : E.U_BUFFER_OVERFLOW_ERROR,
        );
    }
    const preflight: [number] = [0];
    expect(call(id, null, 0, preflight)).toBe(length);
    expect(preflight[0]).toBe(E.U_BUFFER_OVERFLOW_ERROR);
    const invalid: [number] = [0];
    expect(call(id, null, -1, invalid)).toBe(length);
    // Original CheckedArrayByteSink clamps negative capacity to zero before conversion.
    expect(invalid[0]).toBe(E.U_BUFFER_OVERFLOW_ERROR);
    const output = new Uint8Array(100).fill(0x7f),
      sticky: [number] = [E.U_ILLEGAL_ARGUMENT_ERROR];
    expect(call(id, output, output.length, sticky)).toBe(0);
    expect(
      output.every(
        /** Confirms failed admission does not modify caller storage. @param value - Output byte. @returns Whether untouched. */ (
          value,
        ) => value === 0x7f,
      ),
    ).toBe(true);
  },
);

it("uses the current locale for null IDs before normalizing C prefixes", /** Binds the shared default locale rather than a test-only default provider. @returns Nothing. */ () => {
  const implicit = new Uint8Array(256),
    explicit = new Uint8Array(256),
    a: [number] = [0],
    b: [number] = [0];
  const first = locale.uloc_getName(null, implicit, implicit.length, a),
    second = locale.uloc_getName(locale_get_default(), explicit, explicit.length, b);
  expect([first, a[0]]).toEqual([second, b[0]]);
  expect(implicit).toEqual(explicit);
});
