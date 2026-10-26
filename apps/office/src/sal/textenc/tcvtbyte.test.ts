/** @fileoverview Source-backed Symbol converter boundaries. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
  RTL_TEXTTOUNICODE_INFO_ERROR,
} from "../inc/rtl/textcvt.h";
import { ImplSymbolToUnicode, ImplUnicodeToSymbol } from "./tcvtbyte";

it("maps Symbol controls directly and printable bytes to private use", /** Checks maps Symbol controls directly and printable bytes to private use. @returns Test completion or assertion result. */ () => {
  const output = new Uint16Array(4);
  const info: [number] = [123];
  const consumed: [number] = [123];
  const written = ImplSymbolToUnicode(
    null,
    null,
    Uint8Array.of(0, 0x1f, 0x20, 0xff),
    4,
    output,
    4,
    0,
    info,
    consumed,
  );
  expect(written).toBe(4);
  expect(consumed[0]).toBe(4);
  expect(info[0]).toBe(0);
  expect([...output]).toEqual([0, 0x1f, 0xf020, 0xf0ff]);
});

it("preserves Symbol destination exhaustion and undefined-character policies", /** Checks native counters for full buffers, replacement, ignore and error stops. @returns Nothing. */ () => {
  const cases: [number[], number, number, number[], number, number][] = [
    [
      [0x41],
      0,
      0,
      [],
      0,
      cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
    ],
    [
      [0x41, 0x42],
      1,
      0,
      [0x41],
      1,
      cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
    ],
    [
      [0xf100],
      1,
      cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,
      [],
      0,
      cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED,
    ],
    [
      [0x100, 0x41],
      2,
      cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE,
      [0x41],
      2,
      cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED,
    ],
    [[0x100, 0x41], 2, 0, [0x3f, 0x41], 2, cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED],
  ];
  for (const [units, capacity, flags, expected, consumed, status] of cases) {
    const output = new Uint8Array(capacity);
    const info: [number] = [123];
    const count: [number] = [123];
    const written = ImplUnicodeToSymbol(
      null,
      null,
      Uint16Array.from(units),
      units.length,
      output,
      capacity,
      flags,
      info,
      count,
    );
    expect([...output.subarray(0, written)], JSON.stringify(units)).toEqual(expected);
    expect(count[0]).toBe(consumed);
    expect(info[0]).toBe(status);
  }
});

it("stops Symbol conversion at destination capacity before consuming source", /** Checks stops Symbol conversion at destination capacity before consuming source. @returns Test completion or assertion result. */ () => {
  const output = new Uint16Array(1);
  const info: [number] = [0];
  const consumed: [number] = [0];
  expect(
    ImplSymbolToUnicode(null, null, Uint8Array.of(0x41, 0x42), 2, output, 1, 0, info, consumed),
  ).toBe(1);
  expect(consumed[0]).toBe(1);
  expect(info[0]).toBe(RTL_TEXTTOUNICODE_INFO_ERROR | RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL);
});

it("reverses Symbol private-use units and accepted low-byte aliases", /** Checks reverses Symbol private-use units and accepted low-byte aliases. @returns Test completion or assertion result. */ () => {
  const output = new Uint8Array(3);
  const info: [number] = [5];
  const consumed: [number] = [5];
  expect(
    ImplUnicodeToSymbol(
      null,
      null,
      Uint16Array.of(0xf041, 0x0041, 0xf0ff),
      3,
      output,
      3,
      0,
      info,
      consumed,
    ),
  ).toBe(3);
  expect([...output]).toEqual([0x41, 0x41, 0xff]);
  expect(info[0]).toBe(0);
  expect(consumed[0]).toBe(3);
});
