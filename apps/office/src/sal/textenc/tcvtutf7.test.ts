/** @fileoverview Pinned SAL UTF-7 text-to-Unicode converter cases. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  ImplUTF7CreateUTF7TextToUnicodeContext,
  ImplUTF7ResetTextToUnicodeContext,
  ImplUTF7ToUnicode,
} from "./tcvtutf7";

/** Runs one source chunk through the native converter.
 * @param source - Encoded source bytes.
 * @param flags - Conversion flags.
 * @param capacity - Destination capacity.
 * @returns Converted units, status and consumed bytes.
 */
function convert(source: readonly number[], flags = 0, capacity = source.length) {
  const destination = new Uint16Array(capacity);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const written = ImplUTF7ToUnicode(
    null,
    null,
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

/** Converts ASCII source text to bytes. @param text - Source text. @returns Byte values. */
function ascii(text: string): number[] {
  return [...text].map((character) => character.charCodeAt(0));
}

it("decodes direct bytes, shifted UTF-16 units and escaped plus", () => {
  expect(convert(ascii("A+-+AOk-Z"))).toEqual({
    units: [0x41, 0x2b, 0x00e9, 0x5a],
    info: 0,
    consumed: 9,
  });
});

it("keeps pinned empty-shift and incomplete-bit error behavior", () => {
  expect(convert(ascii("+"))).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 1,
  });
  expect(convert(ascii("+B-x"))).toEqual({
    units: [0xfffd, 0x78],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 4,
  });
});

it("reports direct invalid bytes and destination exhaustion with SAL status", () => {
  expect(convert([0x80])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 1,
  });
  expect(convert(ascii("A"), 0, 0)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(
    convert([0x80], cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH),
  ).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 0,
  });
});

it("preserves the pinned disabled context restore across chunks", () => {
  const context = ImplUTF7CreateUTF7TextToUnicodeContext();
  const first = new Uint16Array(2);
  const info: [number] = [0];
  const consumed: [number] = [0];
  ImplUTF7ToUnicode(null, context, Uint8Array.from(ascii("+A")), 2, first, 2, 0, info, consumed);
  expect(context.mbShifted).toBe(false);
  expect(context.mnBufferBits).toBe(0);
  context.mbShifted = true;
  context.mnBitBuffer = 0x12345678;
  const second = new Uint16Array(1);
  expect(
    ImplUTF7ToUnicode(null, context, Uint8Array.from(ascii("A")), 1, second, 1, 0, info, consumed),
  ).toBe(1);
  expect([...second]).toEqual([0x41]);
  ImplUTF7ResetTextToUnicodeContext(context);
  expect(context.mbShifted).toBe(false);
  expect(context.mnBitBuffer).toBe(0);
});
