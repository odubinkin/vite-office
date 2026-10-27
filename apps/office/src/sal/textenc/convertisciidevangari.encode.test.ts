/** @fileoverview Reverse ISCII differential cases from unchanged pinned C++ and original shared helpers. */
import { expect, it } from "vitest";
import * as flags from "../inc/rtl/textcvt.h";
import native from "./convertisciidevangari.encode.native.json";
import {
  ImplConvertUnicodeToIsciiDevanagari,
  ImplCreateUnicodeToIsciiDevanagariContext,
  ImplResetUnicodeToIsciiDevanagariContext,
  ImplDestroyUnicodeToIsciiDevanagariContext,
} from "./convertisciidevangari";

/** Executes one native reverse call with optional saved-state seed. @param units - UTF-16 input. @param capacity - Output capacity. @param flags - Native flags. @param seed - Previous unit and pending surrogate. @returns Native output fields. */
function convert(
  units: readonly number[],
  capacity: number,
  flags = 0,
  seed: readonly number[] = [0, 0],
) {
  const source = Uint16Array.from(units),
    destination = new Uint8Array(capacity);
  const context = ImplCreateUnicodeToIsciiDevanagariContext();
  context.m_cPrevChar = seed[0] as number;
  context.m_cHighSurrogate = seed[1] as number;
  const info: [number] = [99],
    consumed: [number] = [99];
  const written = ImplConvertUnicodeToIsciiDevanagari(
    null,
    context,
    source,
    source.length,
    destination,
    capacity,
    flags,
    info,
    consumed,
  );
  return {
    written,
    info: info[0],
    consumed: consumed[0],
    context: [context.m_cPrevChar, context.m_cHighSurrogate],
    bytes: [...destination.subarray(0, written)],
  };
}

/** Mixes four little-endian bytes per native integer. @param hash - Prior digest. @param value - Integer. @returns FNV1a32. */
function mix(hash: number, value: number): number {
  for (let i = 0; i < 4; i++)
    hash = Math.imul((hash ^ ((value >>> (i * 8)) & 255)) >>> 0, 16777619) >>> 0;
  return hash;
}

it.each(native.digests)(
  "matches native BMP conversion at capacity $capacity, flags $flags",
  /** Verifies matches native BMP conversion at capacity $capacity, flags $flags. @param value0 - capacity, flags, hash value. @returns Nothing. */ ({
    capacity,
    flags,
    hash,
  }) => {
    let digest = 2166136261;
    for (let unit = 0; unit < 65536; unit++) {
      const result = convert([unit], capacity, flags);
      for (const value of [
        unit,
        result.written,
        result.info,
        result.consumed,
        ...result.context,
        ...result.bytes,
      ])
        digest = mix(digest, value);
    }
    expect(digest).toBe(hash);
  },
);

it("matches native multicharacter and saved-context vectors", /** Verifies matches native multicharacter and saved-context vectors. @returns Nothing. */ () => {
  for (const entry of native.cases) {
    const { input, seed, capacity, flags, ...result } = entry;
    expect(
      convert(native.inputs[input] as number[], capacity, flags, native.seeds[seed] as number[]),
      `${input}/${seed}/${capacity}/${flags}`,
    ).toEqual(result);
  }
});

it("preserves native pending-surrogate FLUSH behavior and source accounting", /** Verifies preserves native pending-surrogate FLUSH behavior and source accounting. @returns Nothing. */ () => {
  expect(convert([0xd800], 2, flags.RTL_UNICODETOTEXT_FLAGS_FLUSH)).toEqual({
    written: 0,
    bytes: [],
    consumed: 1,
    info: flags.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL,
    context: [0, 0xd800],
  });
  expect(convert([0xd800], 2)).toEqual({
    written: 1,
    bytes: [0x3f],
    consumed: 1,
    info: flags.RTL_UNICODETOTEXT_INFO_INVALID,
    context: [0, 0],
  });
  expect(convert([0x950], 1)).toMatchObject({
    written: 0,
    bytes: [],
    consumed: 0,
    info: flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
  });
  expect(convert([0x94d, 0x200c, 0x94d, 0x200d], 4)).toMatchObject({
    bytes: [0xe8, 0xe8, 0xe8, 0xe9],
    info: 0,
    consumed: 4,
  });
});

it("resets the original reverse context and accepts null output pointers", /** Verifies resets the original reverse context and accepts null output pointers. @returns Nothing. */ () => {
  const context = ImplCreateUnicodeToIsciiDevanagariContext();
  context.m_cPrevChar = 0x94d;
  context.m_cHighSurrogate = 0xd800;
  ImplResetUnicodeToIsciiDevanagariContext(context);
  expect(context).toEqual({ m_cPrevChar: 0, m_cHighSurrogate: 0 });
  const output = new Uint8Array(2);
  expect(
    ImplConvertUnicodeToIsciiDevanagari(
      null,
      context,
      Uint16Array.of(0x950),
      1,
      output,
      2,
      0,
      null,
      null,
    ),
  ).toBe(2);
  expect([...output]).toEqual([0xa1, 0xe9]);
  ImplDestroyUnicodeToIsciiDevanagariContext(context);
});
