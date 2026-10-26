/** @fileoverview Pinned SAL missing-converter fallback cases. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplDummyToUnicode, ImplUnicodeToDummy } from "./textcvt";

/** Runs the native dummy converter against one borrowed span.
 * @param source - Input bytes.
 * @param flags - Conversion flags.
 * @param capacity - Output capacity.
 * @returns UTF-16 units, status and consumed-byte count.
 */
function convert(source: readonly number[], flags = 0, capacity = source.length) {
  const destination = new Uint16Array(capacity);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const written = ImplDummyToUnicode(
    Uint8Array.from(source),
    source.length,
    destination,
    capacity,
    flags,
    info,
    consumed,
  );
  return { units: [...destination.subarray(0, written)], info: info[0], consumed: consumed[0] };
}

it("copies every byte to the same-numbered Unicode unit under default flags", /** Checks copies every byte to the same-numbered Unicode unit under default flags. @returns Test completion or assertion result. */ () => {
  expect(convert([0x41, 0x80, 0xa1, 0xdb, 0xff])).toEqual({
    units: [0x41, 0x80, 0xa1, 0xdb, 0xff],
    info: 0,
    consumed: 5,
  });
});

it("reports destination exhaustion after consuming only emitted bytes", /** Checks reports destination exhaustion after consuming only emitted bytes. @returns Test completion or assertion result. */ () => {
  expect(convert([0x41, 0x80], 0, 1)).toEqual({
    units: [0x41],
    info: cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 1,
  });
});

it("retains the source early-error flags for undefined conversion", /** Checks retains the source early-error flags for undefined conversion. @returns Test completion or assertion result. */ () => {
  const source = Uint8Array.from([0x80]);
  const output = new Uint16Array(1);
  const info: [number] = [0x40];
  const consumed: [number] = [17];
  expect(
    ImplDummyToUnicode(
      source,
      1,
      output,
      1,
      cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR,
      info,
      consumed,
    ),
  ).toBe(0);
  expect(info[0]).toBe(
    0x40 |
      cvt.RTL_TEXTTOUNICODE_INFO_ERROR |
      cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED |
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
  );
  expect(consumed[0]).toBe(17);
});

it("retains the multibyte-undefined early-error contract", /** Checks retains the multibyte-undefined early-error contract. @returns Test completion or assertion result. */ () => {
  expect(convert([0xff], cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR)).toEqual({
    units: [],
    info:
      cvt.RTL_TEXTTOUNICODE_INFO_ERROR |
      cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED |
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
    consumed: 0,
  });
});

it("converts a signed byte span and respects an explicit source length", /** Checks converts a signed byte span and respects an explicit source length. @returns Test completion or assertion result. */ () => {
  const destination = new Uint16Array(3);
  const info: [number] = [123];
  const consumed: [number] = [17];
  expect(
    ImplDummyToUnicode(new Int8Array([-1, 65, 66]), 2, destination, 3, 0, info, consumed),
  ).toBe(2);
  expect([...destination]).toEqual([255, 65, 0]);
  expect(info[0]).toBe(0);
  expect(consumed[0]).toBe(2);
});

it("preserves native low-byte truncation and source span in the reverse fallback", /** Checks preserves native low-byte truncation and source span in the reverse fallback. @returns Test completion or assertion result. */ () => {
  const destination = new Uint8Array(4);
  const info: [number] = [123];
  const consumed: [number] = [17];
  expect(
    ImplUnicodeToDummy(
      new Uint16Array([0x41, 0x20ac, 0xffff, 0x42]),
      3,
      destination,
      4,
      0,
      info,
      consumed,
    ),
  ).toBe(3);
  expect([...destination]).toEqual([0x41, 0xac, 0xff, 0]);
  expect(info[0]).toBe(0);
  expect(consumed[0]).toBe(3);
});

it("reports reverse destination exhaustion after only the emitted units", /** Checks reports reverse destination exhaustion after only the emitted units. @returns Test completion or assertion result. */ () => {
  const destination = new Uint8Array(1);
  const info: [number] = [123];
  const consumed: [number] = [17];
  expect(
    ImplUnicodeToDummy(new Uint16Array([0x41, 0x20ac]), 2, destination, 1, 0, info, consumed),
  ).toBe(1);
  expect([...destination]).toEqual([0x41]);
  expect(info[0]).toBe(
    cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
  );
  expect(consumed[0]).toBe(1);
});

it("retains reverse early-error status and leaves the consumed counter and output untouched", /** Checks retains reverse early-error status and leaves the consumed counter and output untouched. @returns Test completion or assertion result. */ () => {
  const destination = new Uint8Array([0x99]);
  const info: [number] = [0x40];
  const consumed: [number] = [17];
  expect(
    ImplUnicodeToDummy(
      new Uint16Array([0x41]),
      1,
      destination,
      1,
      cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,
      info,
      consumed,
    ),
  ).toBe(0);
  expect([...destination]).toEqual([0x99]);
  expect(info[0]).toBe(
    0x40 | cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED,
  );
  expect(consumed[0]).toBe(17);
});

it("resets status and consumed counts for empty spans in both directions", /** Checks resets status and consumed counts for empty spans in both directions. @returns Test completion or assertion result. */ () => {
  const info: [number] = [123];
  const consumed: [number] = [17];
  expect(ImplDummyToUnicode(new Uint8Array(), 0, new Uint16Array(), 0, 0, info, consumed)).toBe(0);
  expect([info[0], consumed[0]]).toEqual([0, 0]);
  info[0] = 123;
  consumed[0] = 17;
  expect(ImplUnicodeToDummy(new Uint16Array(), 0, new Uint8Array(), 0, 0, info, consumed)).toBe(0);
  expect([info[0], consumed[0]]).toEqual([0, 0]);
});
