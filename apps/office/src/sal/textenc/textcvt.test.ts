/** @fileoverview Pinned SAL missing-converter fallback cases. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplDummyToUnicode } from "./textcvt";

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

it("copies every byte to the same-numbered Unicode unit under default flags", () => {
  expect(convert([0x41, 0x80, 0xa1, 0xdb, 0xff])).toEqual({
    units: [0x41, 0x80, 0xa1, 0xdb, 0xff],
    info: 0,
    consumed: 5,
  });
});

it("reports destination exhaustion after consuming only emitted bytes", () => {
  expect(convert([0x41, 0x80], 0, 1)).toEqual({
    units: [0x41],
    info: cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 1,
  });
});

it("retains the source early-error flags for undefined conversion", () => {
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
