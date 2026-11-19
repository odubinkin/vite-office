/** @fileoverview Source-contract byte-buffer tests through actual C wrappers and SAL allocations. */
import { expect, it } from "vitest";
import * as api from "../inc/rtl/strbuf.h";
import { rtl_string_release, type rtl_String, type rtl_StringSlot } from "../inc/rtl/string.h";
/** Reads initialized byte units including terminator. @param slot - Native allocation slot. @returns Observable bytes. */
function bytes(slot: rtl_StringSlot): number[] {
  const data = slot[0] as rtl_String;
  return [...data.buffer.subarray(0, data.length + 1)];
}
it("retains byte type, embedded zeros and high bytes through growth, shifts, copy and removal", /** Checks that retains byte type, embedded zeros and high bytes through growth, shifts, copy and removal. @returns Nothing. */ () => {
  const slot: rtl_StringSlot = [null],
    cap: [number] = [19];
  api.rtl_stringbuffer_newFromStr_WithLength(slot, Uint8Array.of(0xff, 0, 0x80), 3);
  try {
    expect((slot[0] as rtl_String).buffer.BYTES_PER_ELEMENT).toBe(1);
    expect(bytes(slot)).toEqual([255, 0, 128, 0]);
    const initial = slot[0];
    api.rtl_stringbuffer_ensureCapacity(slot, cap, -1);
    expect(slot[0]).toBe(initial);
    api.rtl_stringbuffer_insert(slot, cap, 1, Uint8Array.of(0xfe, 0x81), 2);
    expect(bytes(slot)).toEqual([255, 254, 129, 0, 128, 0]);
    expect(slot[0]).toBe(initial);
    api.rtl_stringbuffer_ensureCapacity(slot, cap, 20);
    expect(cap[0]).toBe(20);
    expect(slot[0]).not.toBe(initial);
    expect(bytes(slot)).toEqual([255, 254, 129, 0, 128, 0]);
    const grown = slot[0];
    api.rtl_stringbuffer_remove(slot, 1, 2);
    expect(bytes(slot)).toEqual([255, 0, 128, 0]);
    expect(slot[0]).toBe(grown);
    for (const requested of [0, 3, 9]) {
      const copy: rtl_StringSlot = [null];
      expect(api.rtl_stringbuffer_newFromStringBuffer(copy, requested, slot[0])).toBe(
        Math.max(3, requested),
      );
      try {
        expect(copy[0]).not.toBe(slot[0]);
        expect(bytes(copy)).toEqual(bytes(slot));
        expect((copy[0] as rtl_String).buffer.BYTES_PER_ELEMENT).toBe(1);
      } finally {
        rtl_string_release(copy[0] as rtl_String);
      }
    }
    api.rtl_stringbuffer_insert(slot, cap, 0, null, 0);
    api.rtl_stringbuffer_insert(slot, cap, 1, null, 2);
    expect(bytes(slot)).toEqual([255, 0, 128, 0, 128, 0]);
    api.rtl_stringbuffer_remove(slot, 0, 99);
    expect(bytes(slot)).toEqual([0]);
    expect(cap[0]).toBe(20);
  } finally {
    rtl_string_release(slot[0] as rtl_String);
  }
});
it("preserves null-source construction and original logical-length capacity growth", /** Checks that preserves null-source construction and original logical-length capacity growth. @returns Nothing. */ () => {
  const slot: rtl_StringSlot = [null],
    cap: [number] = [16];
  api.rtl_stringbuffer_newFromStr_WithLength(slot, null, 7);
  try {
    expect(bytes(slot)).toEqual([0]);
    api.rtl_stringbuffer_ensureCapacity(slot, cap, 17);
    expect(cap[0]).toBe(17);
    api.rtl_stringbuffer_insert(
      slot,
      cap,
      0,
      Uint8Array.from(
        { length: 17 },
        /** Builds consecutive code units for the fixture. @param _ - Unused array element. @param i - Zero-based fixture index. @returns Index used as the code unit. */ (
          _,
          i,
        ) => i,
      ),
      17,
    );
    api.rtl_stringbuffer_insert(slot, cap, 17, Uint8Array.of(0xff), 1);
    expect(cap[0]).toBe(36);
    expect(bytes(slot)).toEqual([
      ...Array.from(
        { length: 17 },
        /** Builds consecutive code units for the fixture. @param _ - Unused array element. @param i - Zero-based fixture index. @returns Index used as the code unit. */ (
          _,
          i,
        ) => i,
      ),
      255,
      0,
    ]);
    const copy: rtl_StringSlot = [null];
    api.rtl_stringbuffer_remove(slot, 0, 99);
    expect(api.rtl_stringbuffer_newFromStringBuffer(copy, 0, slot[0])).toBe(0);
    try {
      expect(bytes(copy)).toEqual([0]);
    } finally {
      rtl_string_release(copy[0] as rtl_String);
    }
  } finally {
    rtl_string_release(slot[0] as rtl_String);
  }
});
