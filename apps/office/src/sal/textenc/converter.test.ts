/** @fileoverview Original bad-input SAL policy across output exhaustion, private mapping and error admission. */
import { expect, it } from "vitest";
import * as flags from "../inc/rtl/textcvt.h";
import { BadInputConversionAction, handleBadInputTextToUnicodeConversion } from "./converter";

it("retains bad-input status without overwriting a full destination", /** Checks the shared conversion contract before a caller retries the same source byte. @returns Nothing. */ () => {
  const destination = new Uint16Array([0x5555]);
  const offset: [number] = [1],
    info: [number] = [0x80];
  expect(
    handleBadInputTextToUnicodeConversion(true, false, 0xff, 0, destination, offset, 1, info),
  ).toBe(BadInputConversionAction.NO_OUTPUT);
  expect([...destination]).toEqual([0x5555]);
  expect(offset[0]).toBe(1);
  expect(info[0]).toBe(0x80 | flags.RTL_TEXTTOUNICODE_INFO_UNDEFINED);
});

it("widens the original undefined byte into the private range only when requested", /** Checks native MAPTOPRIVATE output and the mutable destination cursor. @returns Nothing. */ () => {
  const destination = new Uint16Array([0x5555, 0x5555]);
  const offset: [number] = [0],
    info: [number] = [0];
  expect(
    handleBadInputTextToUnicodeConversion(
      true,
      false,
      0xa5,
      flags.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE,
      destination,
      offset,
      2,
      info,
    ),
  ).toBe(BadInputConversionAction.CONTINUE);
  expect([...destination]).toEqual([0xf1a5, 0x5555]);
  expect(offset[0]).toBe(1);
  expect(info[0]).toBe(flags.RTL_TEXTTOUNICODE_INFO_UNDEFINED);
});
