/** @fileoverview Source-backed Symbol converter boundaries. */
import { expect, it } from "vitest";
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
