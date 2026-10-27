/** @fileoverview Differential reverse UTF-7 evidence against unchanged, sanitizer-instrumented pinned C++. */
import { expect, it } from "vitest";
import { RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL } from "../inc/rtl/textcvt.h";
import native from "./tcvtutf7.encode.native.json";
import {
  ImplUnicodeToUTF7,
  ImplUTF7CreateUnicodeToTextContext,
  ImplUTF7DestroyUnicodeToTextContext,
  ImplUTF7ResetUnicodeToTextContext,
} from "./tcvtutf7";

/** Captures source output and final state. @param units - Input units. @param capacity - Destination capacity. @param flags - Conversion flags. @returns Native result shape. */
function convert(units: readonly number[], capacity: number, flags = 0) {
  const source = Uint16Array.from(units),
    destination = new Uint8Array(capacity);
  const context = ImplUTF7CreateUnicodeToTextContext();
  context.mbShifted = true;
  context.mnBitBuffer = 0xdeadbeef;
  context.mnBufferBits = 17;
  const info: [number] = [99],
    consumed: [number] = [99];
  const written = ImplUnicodeToUTF7(
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
    context: [Number(context.mbShifted), context.mnBitBuffer, context.mnBufferBits],
    bytes: [...destination.subarray(0, written)],
  };
}

/** Independent native fixture digest, mixing four little-endian bytes per integer. @param hash - Prior digest. @param value - Integer. @returns FNV1a32 digest. */
function mix(hash: number, value: number): number {
  for (let i = 0; i < 4; i++)
    hash = Math.imul((hash ^ ((value >>> (8 * i)) & 0xff)) >>> 0, 16777619) >>> 0;
  return hash;
}

it.each(
  native.digests.map(
    /** Verifies matches native bytes, status, consumption and context for all BMP units at capacity $capacity. @param hash - hash value. @param capacity - capacity value. @returns Callback result. */ (
      hash,
      capacity,
    ) => ({ hash, capacity }),
  ),
)(
  "matches native bytes, status, consumption and context for all BMP units at capacity $capacity",
  /** Verifies matches native bytes, status, consumption and context for all BMP units at capacity $capacity. @param value0 - hash, capacity value. @returns Nothing. */ ({
    hash,
    capacity,
  }) => {
    let digest = 2166136261;
    for (let unit = 0; unit < 65536; unit++) {
      const result = convert([unit], capacity);
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

it("matches native mixed-unit vectors and ignored conversion flags", /** Verifies matches native mixed-unit vectors and ignored conversion flags. @returns Nothing. */ () => {
  for (const entry of native.cases) {
    const { input, capacity, flags, ...result } = entry;
    expect(
      convert(native.inputs[input] as number[], capacity, flags),
      `${input}/${capacity}/${flags}`,
    ).toEqual(result);
  }
});

it("retains native shift-table control characters and partial plus writes", /** Verifies retains native shift-table control characters and partial plus writes. @returns Nothing. */ () => {
  expect(convert([0x0c, 0x0d], 12).bytes).toEqual([0x0c, 0x2b, 0x41, 0x41, 0x30, 0x2d]);
  expect(convert([0x2b], 1)).toMatchObject({
    bytes: [0x2b],
    consumed: 0,
    info: RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
  });
  expect(convert([0xd800], 8)).toMatchObject({
    bytes: [0x2b, 0x32, 0x41, 0x41, 0x2d],
    consumed: 1,
    info: 0,
  });
});

it("resets reverse context and accepts the source null-context contract", /** Verifies resets reverse context and accepts the source null-context contract. @returns Nothing. */ () => {
  const context = ImplUTF7CreateUnicodeToTextContext();
  context.mbShifted = true;
  context.mnBitBuffer = 123;
  context.mnBufferBits = 5;
  ImplUTF7ResetUnicodeToTextContext(context);
  expect(context).toEqual({ mbShifted: false, mnBitBuffer: 0, mnBufferBits: 0 });
  ImplUTF7DestroyUnicodeToTextContext(context);
  const destination = new Uint8Array(8),
    info: [number] = [99],
    consumed: [number] = [99];
  const written = ImplUnicodeToUTF7(
    null,
    null,
    Uint16Array.of(0xe9),
    1,
    destination,
    8,
    0,
    info,
    consumed,
  );
  expect([...destination.subarray(0, written)]).toEqual([0x2b, 0x41, 0x4f, 0x6b, 0x2d]);
  expect([info[0], consumed[0]]).toEqual([0, 1]);
});
