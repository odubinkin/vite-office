/** @fileoverview Differential native byte ownership and UTF16-to-byte wrapper behavior, including allocation/free order. */
import { expect, it, vi } from "vitest";
import native from "./string-convert.native.json";
import type { rtl_StringSlot } from "../inc/rtl/string.h";
import { rtl_stringAllocation } from "./strimp.hxx";
import {
  rtl_string_alloc,
  rtl_string_acquire,
  rtl_string_release,
  rtl_uString2String,
  rtl_convertUStringToString,
  rtl_string_new,
  rtl_string_new_WithLength,
} from "./string";
import {
  RTL_TEXTENCODING_MS_1258,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_MS_932,
  RTL_TEXTENCODING_EUC_JP,
} from "../inc/rtl/textenc";
import { OUSTRING_TO_OSTRING_CVTFLAGS } from "../inc/rtl/string.h";
import { OUStringToOString } from "./ustring-convert";

/** Replays the genuine native caller using the shared replaceable allocation slots. @param encoding - Native ID. @param units - UTF16 input. @param flags - Source flags. @param checked - Checked wrapper selector. @returns Native result and complete allocation trace. */
function convert(encoding: number, units: readonly number[], flags: number, checked: boolean) {
  const original = { ...rtl_stringAllocation },
    live = new Map<object, { id: number; bytes: number }>();
  const events: number[][] = [];
  let next = 1;
  rtl_stringAllocation.rtl_allocateString = (bytes) => {
    const data = original.rtl_allocateString(bytes);
    if (data === null) throw new Error("Unexpected native allocation failure");
    live.set(data, { id: next++, bytes });
    events.push([0, live.get(data)?.id as number, bytes]);
    return data;
  };
  rtl_stringAllocation.rtl_freeString = (data) => {
    const entry = live.get(data);
    if (!entry) throw new Error("Unowned native free");
    events.push([1, entry.id, entry.bytes]);
    live.delete(data);
    original.rtl_freeString(data);
  };
  try {
    const old = rtl_string_alloc(1);
    if (old === null) throw new Error("Unexpected native allocation failure");
    old.buffer[0] = 0x51;
    rtl_string_acquire(old);
    const target: rtl_StringSlot = [old],
      source = Uint16Array.from(units);
    let ok = true;
    if (checked) ok = rtl_convertUStringToString(target, source, source.length, encoding, flags);
    else rtl_uString2String(target, source, source.length, encoding, flags);
    const data = target[0];
    if (data === null) throw new Error("Unexpected null native target");
    const result = {
      ok: Number(ok),
      same: Number(data === old),
      ref: data.refCount,
      length: data.length,
      id: live.get(data)?.id ?? 0,
      bytes: [...data.buffer.subarray(0, data.length + 1)],
      events,
    };
    rtl_string_release(data);
    rtl_string_release(old);
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
  "matches original core BMP wrapper and ownership observations for $encoding, checked=$checked",
  ({ encoding, checked, hash }) => {
    let digest = 2166136261;
    for (let unit = 0; unit < 65536; unit++) {
      const result = convert(encoding, [unit], OUSTRING_TO_OSTRING_CVTFLAGS, Boolean(checked));
      for (const value of [
        unit,
        result.ok,
        result.same,
        result.ref,
        result.length,
        result.id,
        ...result.bytes,
        ...result.events.flat(),
      ])
        digest = mix(digest, value);
    }
    expect(digest).toBe(hash);
  },
);

it("matches original mixed vectors, flags, target identity and complete allocator/free order", () => {
  for (const entry of native.cases) {
    const { encoding, input, flags, checked, ...expected } = entry;
    expect(
      convert(encoding, native.inputs[input] as number[], flags, Boolean(checked)),
      `${encoding}/${input}/${flags}/${checked}`,
    ).toEqual(expected);
  }
});

it("preserves checked failure before retry for an encodable two-byte MS1258 mapping", () => {
  const target: rtl_StringSlot = [rtl_string_alloc(1)],
    old = target[0];
  if (old === null) throw new Error("Allocation failure");
  old.buffer[0] = 0x51;
  expect(
    rtl_convertUStringToString(
      target,
      Uint16Array.of(0x1eaf),
      1,
      RTL_TEXTENCODING_MS_1258,
      OUSTRING_TO_OSTRING_CVTFLAGS,
    ),
  ).toBe(false);
  expect(target[0]).toBe(old);
  expect([old.refCount, old.length, old.buffer[0]]).toEqual([1, 1, 0x51]);
  rtl_uString2String(
    target,
    Uint16Array.of(0x1eaf),
    1,
    RTL_TEXTENCODING_MS_1258,
    OUSTRING_TO_OSTRING_CVTFLAGS,
  );
  expect(target[0]?.buffer.subarray(0, target[0].length)).toEqual(Uint8Array.of(0xe3, 0xec));
  if (target[0]) rtl_string_release(target[0]);
});

it("connects actual multibyte conversion to the existing OUString byte adapter", () => {
  expect([...OUStringToOString("漢", RTL_TEXTENCODING_MS_932)]).toEqual([0x8a, 0xbf]);
  expect([...OUStringToOString("漢", RTL_TEXTENCODING_EUC_JP)]).toEqual([0xb4, 0xc1]);
  expect([...OUStringToOString("ắ", RTL_TEXTENCODING_MS_1258)]).toEqual([0xe3, 0xec]);
});

it("retains static byte-empty identity, reserve capacity and UTF8 fast-path flag bypass", () => {
  const first: rtl_StringSlot = [null],
    second: rtl_StringSlot = [null];
  rtl_string_new(first);
  rtl_string_new(second);
  expect(first[0]).toBe(second[0]);
  expect(first[0]?.refCount).toBe(0x40000001);
  rtl_string_acquire(first[0] as NonNullable<rtl_StringSlot[0]>);
  rtl_string_release(first[0] as NonNullable<rtl_StringSlot[0]>);
  expect(first[0]?.refCount).toBe(0x40000001);
  rtl_string_new_WithLength(first, 3);
  expect(first[0]).toMatchObject({ refCount: 1, length: 0 });
  expect(first[0]?.buffer.length).toBe(4);
  expect(first[0]?.buffer[0]).toBe(0);
  rtl_string_new(first);
  expect(first[0]).toBe(second[0]);
  expect(
    rtl_convertUStringToString(first, Uint16Array.of(65), 1, RTL_TEXTENCODING_UTF8, 0x20000),
  ).toBe(true);
  expect(first[0]?.buffer[0]).toBe(65);
  if (first[0]) rtl_string_release(first[0]);
  expect(rtl_convertUStringToString(first, null, 0, 9999, 0x20000)).toBe(true);
  expect(first[0]).toBe(second[0]);
});

import { runInNewContext } from "node:vm";
import { Alloc, new_, new_WithLength, release } from "./strtmpl";
it("binds the original byte template width across constructor realms", () => {
  const foreign = runInNewContext("Uint8Array") as typeof Uint8Array;
  expect(foreign).not.toBe(Uint8Array);
  const data = Alloc(3, foreign);
  if (data === null) throw new Error("Unexpected native allocation failure");
  expect(data.buffer.BYTES_PER_ELEMENT).toBe(1);
  expect(data.buffer.length).toBe(4);
  release(data);
  const slot: rtl_StringSlot = [null];
  new_(slot, foreign);
  expect(slot[0]?.refCount).toBe(0x40000001);
  new_WithLength(slot, 3, foreign);
  expect(slot[0]?.buffer.BYTES_PER_ELEMENT).toBe(1);
  expect(slot[0]?.buffer.length).toBe(4);
  if (slot[0]) release(slot[0]);
});

it("initializes native empty flags when the private C header is the import root", async () => {
  vi.resetModules();
  const declarations = await import("./strimp.hxx");
  const byte = await import("./string");
  const unicode = await import("./ustring");
  const byteSlot: rtl_StringSlot = [null];
  const unicodeSlot: import("../inc/rtl/ustring.h").rtl_uStringSlot = [null];
  byte.rtl_string_new(byteSlot);
  unicode.rtl_uString_new(unicodeSlot);
  expect(declarations.SAL_STRING_STATIC_FLAG).toBe(0x40000000);
  expect(byteSlot[0]?.refCount).toBe(0x40000001);
  expect(unicodeSlot[0]?.refCount).toBe(0xc0000001 | 0);
  if (byteSlot[0]) byte.rtl_string_release(byteSlot[0]);
  if (unicodeSlot[0]) unicode.rtl_uString_release(unicodeSlot[0]);
  vi.resetModules();
});
