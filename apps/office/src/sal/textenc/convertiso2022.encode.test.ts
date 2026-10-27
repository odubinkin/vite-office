/** @fileoverview Differential reverse ISO-2022 evidence from unchanged sanitizer-instrumented original C++. */
import { expect, it } from "vitest";
import native from "./convertiso2022.encode.native.json";
import * as jp from "./convertiso2022jp";
import * as kr from "./convertiso2022kr";
import * as flags from "../inc/rtl/textcvt.h";
import { aJIS0208DBCSHighTab } from "./tcvtjp6.eucjp";
import { aKSC5601DBCSHighTab } from "./tcvtkr6.ms949";

/** Captures an actual source-style reverse call. @param codec - JP=0, KR=1. @param units - UTF-16 source. @param capacity - Output capacity. @param conversionFlags - Native flags. @param seed - Pending surrogate and source designation state; negative means null context. @returns Native result shape. */
function convert(
  codec: number,
  units: readonly number[],
  capacity: number,
  conversionFlags = 0,
  seed: readonly number[] = [0, 0],
) {
  const source = Uint16Array.from(units),
    destination = new Uint8Array(capacity);
  const info: [number] = [99],
    consumed: [number] = [99];
  let written: number, context: number[];
  if (codec === 0) {
    const state = (seed[0] as number) < 0 ? null : jp.ImplCreateUnicodeToIso2022JpContext();
    if (state) {
      state.m_nHighSurrogate = seed[0] as number;
      state.m_b0208 = Boolean(seed[1]);
    }
    written = jp.ImplConvertUnicodeToIso2022Jp(
      null,
      state,
      source,
      source.length,
      destination,
      capacity,
      conversionFlags,
      info,
      consumed,
    );
    context = state ? [state.m_nHighSurrogate, Number(state.m_b0208)] : [-1, -1];
  } else {
    const state = (seed[0] as number) < 0 ? null : kr.ImplCreateUnicodeToIso2022KrContext();
    if (state) {
      state.m_nHighSurrogate = seed[0] as number;
      state.m_eSet = seed[1] as kr.ImplUnicodeToIso2022KrSet;
    }
    written = kr.ImplConvertUnicodeToIso2022Kr(
      null,
      state,
      source,
      source.length,
      destination,
      capacity,
      conversionFlags,
      info,
      consumed,
    );
    context = state ? [state.m_nHighSurrogate, state.m_eSet] : [-1, -1];
  }
  return {
    written,
    info: info[0],
    consumed: consumed[0],
    context,
    bytes: [...destination.subarray(0, written)],
  };
}

/** Mixes four little-endian bytes for each native result integer. @param hash - Prior digest. @param value - Result integer. @returns FNV1a32 digest. */
function mix(hash: number, value: number): number {
  for (let i = 0; i < 4; i++)
    hash = Math.imul((hash ^ ((value >>> (8 * i)) & 255)) >>> 0, 16777619) >>> 0;
  return hash;
}

it("independently classifies original table ranges exceeding their physical arrays", /** Verifies independently classifies original table ranges exceeding their physical arrays. @returns Nothing. */ () => {
  for (const [codec, table] of [aJIS0208DBCSHighTab, aKSC5601DBCSHighTab].entries()) {
    const undefinedUnits: number[] = [];
    for (let unit = 128; unit < 65536; unit++) {
      const entry = table[unit >>> 8] as (typeof table)[number],
        low = unit & 255;
      if (
        low >= entry.mnLowStart &&
        low <= entry.mnLowEnd &&
        (entry.mpToUniTrailTab === null || low - entry.mnLowStart >= entry.mpToUniTrailTab.length)
      )
        undefinedUnits.push(unit);
    }
    expect(undefinedUnits).toEqual(native.undefinedUnits[codec]);
  }
});

it.each(native.digests)(
  "matches original BMP outputs for codec $codec, capacity $capacity, flags $flags",
  /** Verifies matches original BMP outputs for codec $codec, capacity $capacity, flags $flags. @param value0 - codec, capacity, flags, hash value. @returns Nothing. */ ({
    codec,
    capacity,
    flags,
    hash,
  }) => {
    const undefinedUnits = new Set(native.undefinedUnits[codec]);
    let digest = 2166136261;
    for (let unit = 0; unit < 65536; unit++) {
      if (undefinedUnits.has(unit)) continue;
      const result = convert(codec, [unit], capacity, flags);
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

it("matches original mixed, null-context and saved-state vectors", /** Verifies matches original mixed, null-context and saved-state vectors. @returns Nothing. */ () => {
  for (const entry of native.cases) {
    const { codec, input, seed, capacity, flags, ...result } = entry;
    expect(
      convert(
        codec,
        native.inputs[input] as number[],
        capacity,
        flags,
        native.seeds[seed] as number[],
      ),
      `${codec}/${input}/${seed}/${capacity}/${flags}`,
    ).toEqual(result);
  }
});

it("preserves partial designations without consuming the pending character", /** Verifies preserves partial designations without consuming the pending character. @returns Nothing. */ () => {
  expect(convert(0, [0x65e5], 3)).toEqual({
    written: 3,
    bytes: [0x1b, 0x24, 0x42],
    info: flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
    consumed: 0,
    context: [0, 1],
  });
  expect(convert(1, [0xac00], 5)).toEqual({
    written: 5,
    bytes: [0x1b, 0x24, 0x29, 0x43, 0x0e],
    info: flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
    consumed: 0,
    context: [0, 2],
  });
  expect(convert(0, [0x65e5], 8, flags.RTL_UNICODETOTEXT_FLAGS_FLUSH).bytes).toEqual([
    0x1b, 0x24, 0x42, 0x46, 0x7c, 0x1b, 0x28, 0x42,
  ]);
  expect(convert(1, [0xac00], 8, flags.RTL_UNICODETOTEXT_FLAGS_FLUSH).bytes).toEqual([
    0x1b, 0x24, 0x29, 0x43, 0x0e, 0x30, 0x21, 0x0f,
  ]);
});

it("keeps original reverse reset and null optional output contracts", /** Verifies keeps original reverse reset and null optional output contracts. @returns Nothing. */ () => {
  const j = jp.ImplCreateUnicodeToIso2022JpContext(),
    k = kr.ImplCreateUnicodeToIso2022KrContext();
  j.m_nHighSurrogate = k.m_nHighSurrogate = 0xd800;
  j.m_b0208 = true;
  k.m_eSet = kr.ImplUnicodeToIso2022KrSet.KSC_1001;
  jp.ImplResetUnicodeToIso2022JpContext(j);
  kr.ImplResetUnicodeToIso2022KrContext(k);
  expect(j).toEqual({ m_nHighSurrogate: 0, m_b0208: false });
  expect(k).toEqual({ m_nHighSurrogate: 0, m_eSet: kr.ImplUnicodeToIso2022KrSet.NONE });
  jp.ImplResetUnicodeToIso2022JpContext(null);
  kr.ImplResetUnicodeToIso2022KrContext(null);
  const bytes = new Uint8Array(8);
  expect(
    jp.ImplConvertUnicodeToIso2022Jp(null, null, Uint16Array.of(0x41), 1, bytes, 8, 0, null, null),
  ).toBe(1);
  expect(
    kr.ImplConvertUnicodeToIso2022Kr(null, null, Uint16Array.of(0x41), 1, bytes, 8, 0, null, null),
  ).toBe(5);
  jp.ImplDestroyUnicodeToIso2022JpContext(j);
  kr.ImplDestroyUnicodeToIso2022KrContext(k);
});
