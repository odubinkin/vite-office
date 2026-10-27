/** @fileoverview Tests real V8 maximum-length UnicodeString values and the native bogus-on-allocation-failure contract. */
import { constants } from "node:buffer";
import { expect, it } from "vitest";
import { UnicodeString, checkUnicodeStringLength } from "./unistr";

it("retains maximum readable host strings and converts rejected growth into a bogus owner", /** Allocates an actual readable V8 boundary string; no fabricated lengths or two-gigabyte strings are used. @returns Nothing. */ () => {
  const maximum = constants.MAX_STRING_LENGTH;
  const readable = "x".repeat(maximum);
  const full = new UnicodeString(readable, maximum);
  expect(full.length()).toBe(maximum);
  expect(full.isBogus()).toBe(false);
  expect(full.append(new UnicodeString())).toBe(full);
  expect(full.length()).toBe(maximum);
  expect(
    /** Exercises real host allocation rejection. @returns The receiver. */ () =>
      full.append(new UnicodeString("y")),
  ).not.toThrow();
  expect(full.isBogus()).toBe(true);
  expect(full.getBuffer()).toBeNull();
  const prefix = new UnicodeString(readable.slice(0, -1), maximum - 1);
  const exact = prefix.concat(new UnicodeString("y"));
  expect(exact.isBogus()).toBe(false);
  expect(exact.length()).toBe(maximum);
  expect(prefix.length()).toBe(maximum - 1);
  const over = exact.concat(new UnicodeString("z"));
  expect(over.isBogus()).toBe(true);
  expect(over.getBuffer()).toBeNull();
  expect(exact.isBogus()).toBe(false);
  expect(exact.length()).toBe(maximum);
  prefix.append(new UnicodeString("z"));
  expect(prefix.isBogus()).toBe(false);
  expect(prefix.length()).toBe(maximum);
}, 30000);

it("admits native signed32 allocation requests and rejects overflow before host allocation", /** The numeric request contract is tested without constructing an unreadable source string. @returns Nothing. */ () => {
  expect(checkUnicodeStringLength(0)).toBeUndefined();
  expect(checkUnicodeStringLength(constants.MAX_STRING_LENGTH)).toBeUndefined();
  expect(checkUnicodeStringLength(2147483647)).toBeUndefined();
  expect(
    /** Requests the first native overflowing capacity. @returns Allocation admission or failure. */ () =>
      checkUnicodeStringLength(2147483648),
  ).toThrow(RangeError);
});

it("keeps ordinary UTF16 value operations intact around the allocation boundary", /** Covers the original terminated constructor, comparison, scalar and bogus-reset contracts with readable values. @returns Nothing. */ () => {
  const text = new UnicodeString("a\0ignored");
  expect(text.getBuffer()).toBe("a");
  expect(text.charAt(0)).toBe(97);
  expect(text.charAt(-1)).toBe(0xffff);
  expect(text.charAt(1)).toBe(0xffff);
  expect(text.equals(new UnicodeString("a"))).toBe(true);
  expect(text.compare(new UnicodeString("b"))).toBe(-1);
  text.setToBogus();
  expect(text.remove()).toBe(text);
  expect(text.isBogus()).toBe(false);
  expect(text.getBuffer()).toBe("");
});
