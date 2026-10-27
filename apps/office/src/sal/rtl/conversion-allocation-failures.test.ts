/** @fileoverview Allocation-failure ownership and argument guards for SAL conversion entry points. */
import { expect, it } from "vitest";
import { rtl_stringAllocation } from "./strimp.hxx";
import { rtl_convertStringToUString, rtl_string2UString } from "./ustring";
import { rtl_convertUStringToString, rtl_uString2String, rtl_string_alloc } from "./string";
import type { rtl_uStringSlot } from "../inc/rtl/ustring.h";
import type { rtl_StringSlot } from "../inc/rtl/string.h";

it.each([11, 76, 1])(
  "retains a null result on forward allocator failure for encoding %i",
  /** Checks checked and unchecked wrappers without an old owned target. @param encoding - Native ASCII/UTF8/singlebyte encoding. @returns Nothing. */ (
    encoding,
  ) => {
    const allocate = rtl_stringAllocation.rtl_allocateString;
    rtl_stringAllocation.rtl_allocateString =
      /** Injects the original nullable allocator contract. @returns Allocation failure. */ () =>
        null;
    try {
      const target: rtl_uStringSlot = [null];
      expect(rtl_convertStringToUString(target, Uint8Array.of(65), 1, encoding, 0)).toBe(false);
      expect(target[0]).toBeNull();
      rtl_string2UString(target, Uint8Array.of(65), 1, encoding, 0);
      expect(target[0]).toBeNull();
    } finally {
      rtl_stringAllocation.rtl_allocateString = allocate;
    }
  },
);

it.each([
  [76, [65], "assert(*pTarget != nullptr)"],
  [76, [0x416], "assert(pTemp != nullptr)"],
  [64, Array(20).fill(65), "assert(pTemp2 != nullptr)"],
] as const)(
  "preserves reverse allocation failure diagnostics %i",
  /** Checks fast, conversion and shrink allocations with real source spans. @param encoding - Native encoding. @param source - Borrowed UTF16 units. @param message - Original assertion. @returns Nothing. */ (
    encoding,
    source,
    message,
  ) => {
    const allocate = rtl_stringAllocation.rtl_allocateString,
      free = rtl_stringAllocation.rtl_freeString,
      live: NonNullable<rtl_uStringSlot[0]>[] = [];
    let calls = 0;
    rtl_stringAllocation.rtl_allocateString =
      /** Fails the selected original allocation call. @param bytes - Native size. @returns Original storage or failure. */ (
        bytes,
      ) => {
        calls++;
        if (calls === (message.includes("pTemp2") ? 2 : 1)) return null;
        const data = allocate(bytes);
        if (data) live.push(data);
        return data;
      };
    try {
      const target: rtl_StringSlot = [null],
        units = Uint16Array.from(source);
      expect(
        /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
          rtl_uString2String(target, units, units.length, encoding, 0),
      ).toThrow(message);
      expect(target[0]).toBeNull();
    } finally {
      rtl_stringAllocation.rtl_allocateString = allocate;
      for (const data of live) free(data);
    }
  },
);

it("rejects null output slots and negative lengths before allocation", /** Checks source argument diagnostics of all conversion wrappers. @returns Nothing. */ () => {
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_string_alloc(-1),
  ).toThrow("assert(nLen >= 0)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_string2UString(null, null, 0, 76, 0),
  ).toThrow("assert(ppThis)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_convertStringToUString(null, null, 0, 76, 0),
  ).toThrow("assert(target)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_string2UString([null], null, -1, 76, 0),
  ).toThrow("assert(nLen >= 0)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_convertStringToUString([null], null, -1, 76, 0),
  ).toThrow("assert(length >= 0)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_uString2String(null, null, 0, 76, 0),
  ).toThrow("assert(pTarget != nullptr)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_convertUStringToString([null], null, 1, 76, 0),
  ).toThrow("assert(pSource != nullptr || nLength == 0)");
  expect(
    /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
      rtl_convertUStringToString([null], new Uint16Array(), -1, 76, 0),
  ).toThrow("assert(nLength >= 0)");
});

it("shrinks a successful multibyte conversion to its actual owned byte length", /** Checks successful capacity shrink after the independent allocation-failure case. @returns Nothing. */ () => {
  const target: rtl_StringSlot = [null],
    source = new Uint16Array(20).fill(65);
  expect(rtl_convertUStringToString(target, source, source.length, 64, 0)).toBe(true);
  expect(target[0]?.length).toBe(20);
  expect(target[0]?.buffer.length).toBe(21);
  const data = target[0];
  if (!data) throw new Error("Successful conversion must own its output");
  expect([...data.buffer.subarray(0, 20)]).toEqual(Array(20).fill(65));
  if (target[0])
    rtl_stringAllocation.rtl_freeString(target[0] as unknown as NonNullable<rtl_uStringSlot[0]>);
});
