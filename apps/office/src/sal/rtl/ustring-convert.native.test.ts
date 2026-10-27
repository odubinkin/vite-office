/** @fileoverview Differential pinned forward Unicode conversion and actual allocation/refcount ownership. */
import { expect, it } from "vitest";
import native from "./ustring-convert.native.json";
import { type rtl_uStringSlot, OSTRING_TO_OUSTRING_CVTFLAGS } from "../inc/rtl/ustring.h";
import { rtl_stringAllocation } from "./strimp.hxx";
import {
  rtl_uString_alloc,
  rtl_uString_acquire,
  rtl_uString_release,
  rtl_string2UString,
  rtl_convertStringToUString,
} from "./ustring";
/** Replays the genuine native caller using the shared replaceable allocation slots. @param encoding - Native ID. @param bytes - Source byte prefix. @param flags - Source flags. @param checked - Checked wrapper selector. @returns Native result and complete allocation trace. */
function convert(encoding: number, bytes: readonly number[], flags: number, checked: boolean) {
  const original = { ...rtl_stringAllocation },
    live = new Map<object, { id: number; bytes: number }>();
  const events: number[][] = [];
  let next = 1;
  rtl_stringAllocation.rtl_allocateString =
    /** Evaluates the ustring-convert.native.test callback. @param bytes - bytes value. @returns Callback result. */ (
      bytes,
    ) => {
      const data = original.rtl_allocateString(bytes);
      if (data === null) throw new Error("Unexpected native allocation failure");
      live.set(data, { id: next++, bytes });
      events.push([0, live.get(data)?.id as number, bytes]);
      return data;
    };
  rtl_stringAllocation.rtl_freeString =
    /** Evaluates the ustring-convert.native.test callback. @param data - data value. @returns Nothing. */ (
      data,
    ) => {
      const entry = live.get(data);
      if (!entry) throw new Error("Unowned native free");
      events.push([1, entry.id, entry.bytes]);
      live.delete(data);
      original.rtl_freeString(data);
    };
  try {
    const old = rtl_uString_alloc(1);
    if (old === null) throw new Error("Unexpected native allocation failure");
    old.buffer[0] = 0x51;
    rtl_uString_acquire(old);
    const target: rtl_uStringSlot = [old],
      source = Uint8Array.from(bytes);
    let ok = true;
    if (checked) ok = rtl_convertStringToUString(target, source, source.length, encoding, flags);
    else rtl_string2UString(target, source, source.length, encoding, flags);
    const data = target[0];
    if (data === null) throw new Error("Unexpected null native target");
    const result = {
      ok: Number(ok),
      same: Number(data === old),
      ref: data.refCount,
      length: data.length,
      id: live.get(data)?.id ?? 0,
      units: [...data.buffer.subarray(0, data.length + 1)],
      events,
    };
    rtl_uString_release(data);
    rtl_uString_release(old);
    if (live.size !== 0) throw new Error("Native caller leaked an allocation");
    return result;
  } finally {
    Object.assign(rtl_stringAllocation, original);
  }
}

/** Mixes four LE bytes per source result integer. @param hash - Previous digest. @param value - Integer. @returns FNV1a32. */
function mix(hash: number, value: number): number {
  for (let i = 0; i < 4; i++)
    hash = Math.imul((hash ^ ((value >>> (8 * i)) & 255)) >>> 0, 16777619) >>> 0;
  return hash;
}

it.each(native.digests)(
  "matches original core byte-pair wrapper and ownership observations for $encoding, checked=$checked",
  /** Verifies matches original core byte-pair wrapper and ownership observations for $encoding, checked=$checked. @param value0 - encoding, checked, hash value. @returns Nothing. */ ({
    encoding,
    checked,
    hash,
  }) => {
    let digest = 2166136261;
    for (let unit = 0; unit < 65536; unit++) {
      const result = convert(
        encoding,
        [unit >> 8, unit & 255],
        OSTRING_TO_OUSTRING_CVTFLAGS,
        Boolean(checked),
      );
      for (const value of [
        unit,
        result.ok,
        result.same,
        result.ref,
        result.length,
        result.id,
        ...result.units,
        ...result.events.flat(),
      ])
        digest = mix(digest, value);
    }
    expect(digest).toBe(hash);
  },
);

it("matches original mixed vectors, flags, target identity and complete allocator/free order", /** Verifies matches original mixed vectors, flags, target identity and complete allocator/free order. @returns Nothing. */ () => {
  for (const entry of native.cases) {
    const { encoding, input, flags, checked, ...expected } = entry;
    expect(
      convert(encoding, native.inputs[input] as number[], flags, Boolean(checked)),
      `${encoding}/${input}/${flags}/${checked}`,
    ).toEqual(expected);
  }
});

it("keeps the source partial checked result instead of preserving the old target", /** Verifies keeps the source partial checked result instead of preserving the old target. @returns Nothing. */ () => {
  const target: rtl_uStringSlot = [rtl_uString_alloc(1)];
  const old = target[0];
  expect(rtl_convertStringToUString(target, Uint8Array.of(65, 255, 66), 3, 76, 0x111)).toBe(false);
  expect(target[0]).not.toBe(old);
  expect(target[0]?.length).toBe(1);
  expect(target[0]?.buffer[0]).toBe(65);
  if (target[0] !== null) rtl_uString_release(target[0]);
});
it("preserves the original allocation-failure target alias after releasing its former owned reference", /** Verifies preserves the original allocation-failure target alias after releasing its former owned reference. @returns Nothing. */ () => {
  const old = rtl_uString_alloc(1);
  if (old === null) throw new Error("Allocation failure");
  rtl_uString_acquire(old);
  const target: rtl_uStringSlot = [old],
    allocate = rtl_stringAllocation.rtl_allocateString;
  rtl_stringAllocation.rtl_allocateString =
    /** Verifies preserves the original allocation-failure target alias after releasing its former owned reference. @returns Callback result. */ () =>
      null;
  try {
    expect(rtl_convertStringToUString(target, Uint8Array.of(0xc2, 0xa9), 2, 76, 0x333)).toBe(false);
    expect(target[0]).toBe(old);
    expect(old.refCount).toBe(1);
  } finally {
    rtl_stringAllocation.rtl_allocateString = allocate;
    // The failed conversion already consumed the target's reference; only this separate owner survives.
    rtl_uString_release(old);
  }
});
