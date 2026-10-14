/** @fileoverview Source-backed Span/Pad alias/value histories and broad native strict UTF8 correspondence without a converter/memory library. */
import { expect, it } from "vitest";
import { Span } from "../inc/span";
import { Pad } from "../inc/pad";
import { Span as SourceSpan } from "./span";
import { Pad as SourcePad } from "./pad";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";

/** Reads logical unsigned span bytes through its actual borrowed view. @param span - Actual span. @returns Byte values. */
function bytes(span: Span): number[] {
  const result: number[] = [];
  for (let i = 0; i < span.length; i++)
    result.push(((span.begin as ArrayLike<number>)[i] as number) & 0xff);
  return result;
}
/** Independently materializes source-defined scalar UTF8 and expected UTF16 for one plane, excluding surrogate scalars. @param plane - Unicode plane0..16. @returns Exact bytes and expected units. */
function scalarPlane(plane: number) {
  const encoded = new Uint8Array(4 * 65536),
    units = new Uint16Array(2 * 65536);
  let byteCount = 0,
    unitCount = 0;
  for (let cp = plane * 65536; cp < (plane + 1) * 65536; cp++) {
    if (cp >= 0xd800 && cp <= 0xdfff) continue;
    if (cp < 0x80) encoded[byteCount++] = cp;
    else if (cp < 0x800) {
      encoded[byteCount++] = 0xc0 | (cp >> 6);
      encoded[byteCount++] = 0x80 | (cp & 63);
    } else if (cp < 0x10000) {
      encoded[byteCount++] = 0xe0 | (cp >> 12);
      encoded[byteCount++] = 0x80 | ((cp >> 6) & 63);
      encoded[byteCount++] = 0x80 | (cp & 63);
    } else {
      encoded[byteCount++] = 0xf0 | (cp >> 18);
      encoded[byteCount++] = 0x80 | ((cp >> 12) & 63);
      encoded[byteCount++] = 0x80 | ((cp >> 6) & 63);
      encoded[byteCount++] = 0x80 | (cp & 63);
    }
    if (cp < 0x10000) units[unitCount++] = cp;
    else {
      units[unitCount++] = 0xd800 + ((cp - 0x10000) >> 10);
      units[unitCount++] = 0xdc00 + ((cp - 0x10000) & 1023);
    }
  }
  return { encoded: encoded.subarray(0, byteCount), units: units.subarray(0, unitCount) };
}

it("preserves real span defaults literal length shallow copies retained clear length and byte equality", /** Uses only initialized valid byte ranges when reading data. @returns Nothing. */ () => {
  expect(Span).toBe(SourceSpan);
  expect(Pad).toBe(SourcePad);
  const empty = new Span();
  expect([empty.begin, empty.length, empty.is()]).toEqual([null, 0, false]);
  expect(new Span(null, 0).is()).toBe(false);
  const input = new Uint8Array([65, 0, 66, 0]);
  const first = new Span(input, 3),
    copy = new Span(first),
    literal = new Span(input);
  expect(copy.begin).toBe(input);
  expect(literal.length).toBe(3);
  expect(first.operatorEquals(copy)).toBe(true);
  expect(first.operatorEquals(input)).toBe(true);
  expect(first.equals(input, 3)).toBe(true);
  expect(first.equals(input, 1)).toBe(false);
  expect(first.operatorNotEquals(new Span(new Uint8Array([65, 0, 67, 0])))).toBe(true);
  expect(first.operatorNotEquals(input)).toBe(false);
  expect(new Span(new Int8Array([-1, 0])).operatorEquals(new Uint8Array([255, 0]))).toBe(true);
  expect(new Span(new Uint8Array([65, 90])).length).toBe(1);
  input[2] = 67;
  expect(bytes(copy)).toEqual([65, 0, 67]);
  first.clear();
  expect([first.begin, first.length, first.is()]).toEqual([null, 3, false]);
  expect([copy.begin, copy.length, copy.is()]).toEqual([input, 3, true]);
  first.length = 4294967295;
  expect(first.length).toBe(-1);
  // No byte access/comparison/conversion is performed on the cleared or negative-length descriptor.
});

it.each(
  Array.from(
    { length: 17 },
    /** Names one independent bounded Unicode plane. @param _unused - Empty slot. @param plane - Index. @returns Plane. */ (
      _unused,
      plane,
    ) => plane,
  ),
)(
  "matches native strict UTF8 conversion for every scalar in plane%d",
  /** Covers all1112064Unicode scalars across the17cases. @param plane - Unicode plane. @returns Nothing. */ (
    plane,
  ) => {
    const expected = scalarPlane(plane);
    const actual = new Span(expected.encoded, expected.encoded.length).convertFromUtf8();
    expect(actual.getLength()).toBe(expected.units.length);
    const units = actual.getStr();
    for (let i = 0; i < expected.units.length; i++)
      if (units[i] !== expected.units[i])
        throw new Error("UTF16 scalar mismatch at plane " + plane + " unit " + i);
  },
);

it("matches all two-byte accept-reject classifications and preserves BOM and bounded input", /** The independent source classification includes ASCII pairs and valid two-byte scalars only. @returns Nothing. */ () => {
  const decoder = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
  const pair = new Uint8Array(2);
  let accepted = 0,
    rejected = 0;
  for (let a = 0; a < 256; a++)
    for (let b = 0; b < 256; b++) {
      pair[0] = a;
      pair[1] = b;
      const expected = (a < 128 && b < 128) || (a >= 0xc2 && a <= 0xdf && b >= 0x80 && b <= 0xbf);
      let valid = true;
      try {
        decoder.decode(pair);
      } catch {
        valid = false;
      }
      if (valid !== expected) throw new Error("UTF8 pair mismatch " + a + "," + b);
      if (valid) accepted++;
      else rejected++;
    }
  expect([accepted, rejected]).toEqual([18304, 47232]);
  const bom = new Uint8Array([0xef, 0xbb, 0xbf, 65, 0xef, 0xbb, 0xbf, 0]);
  const result = new Span(bom, bom.length).convertFromUtf8();
  expect([...result.getStr().subarray(0, result.getLength())]).toEqual([0xfeff, 65, 0xfeff, 0]);
  const bounded = new Span(new Uint8Array([65, 0xc2, 0xa2, 66]), 3).convertFromUtf8();
  expect([...bounded.getStr().subarray(0, bounded.getLength())]).toEqual([65, 0xa2]);
  expect(new Span(new Uint8Array([0])).convertFromUtf8().isEmpty()).toBe(true);
});

it("throws the original real UNO error for malformed truncated overlong surrogate and out-of-range UTF8", /** No fake decoder or invalid native pointer is supplied. @returns Nothing. */ () => {
  const cases = [
    [0x80],
    [0xc0, 0x80],
    [0xc1, 0xbf],
    [0xc2],
    [0xc2, 65],
    [0xe0, 0x80, 0x80],
    [0xed, 0xa0, 0x80],
    [0xed, 0xbf, 0xbf],
    [0xe2, 0x82],
    [0xe2, 0x28, 0xa1],
    [0xf0, 0x80, 0x80, 0x80],
    [0xf4, 0x90, 0x80, 0x80],
    [0xf0, 0x90, 0x80],
    [0xf5, 0x80, 0x80, 0x80],
    [0xf8, 0x88, 0x80, 0x80, 0x80],
    [0xfc, 0x84, 0x80, 0x80, 0x80, 0x80],
    [0xfe],
    [0xff],
    [0xef, 0xbb],
  ];
  for (const input of cases) {
    let caught: unknown;
    try {
      new Span(new Uint8Array(input), input.length).convertFromUtf8();
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(RuntimeException);
    const message = (caught as RuntimeException).Message;
    expect(String.fromCharCode(...message.getStr().subarray(0, message.getLength()))).toBe(
      "cannot convert from UTF-8",
    );
  }
});

it("borrows first stable input and returns independent span values until a nonzero flush", /** Zero stable/ephemeral input leaves the existing borrowed input untouched. @returns Nothing. */ () => {
  const pad = new Pad(),
    input = new Uint8Array([65, 66, 0]);
  const initial = pad.get();
  expect([initial.is(), initial.length, initial.begin?.[0]]).toEqual([true, 0, 0]);
  pad.add(input);
  const first = pad.get(),
    second = pad.get();
  expect(first).not.toBe(second);
  expect(first.begin).toBe(input);
  expect(second.begin).toBe(input);
  input[0] = 67;
  expect(bytes(pad.get())).toEqual([67, 66]);
  first.length = 1;
  first.clear();
  expect(bytes(pad.get())).toEqual([67, 66]);
  pad.add(new Uint8Array([0]));
  pad.add(input, 0);
  pad.addEphemeral(input, 0);
  input[1] = 68;
  expect(pad.get().begin).toBe(input);
  const tail = new Uint8Array([69, 70, 99]);
  pad.add(tail, 2);
  const owned = pad.get();
  expect(owned.begin).not.toBe(input);
  expect(bytes(owned)).toEqual([67, 68, 69, 70]);
  expect(owned.begin?.[owned.length]).toBe(0);
  input[0] = 88;
  tail[0] = 89;
  expect(bytes(pad.get())).toEqual([67, 68, 69, 70]);
  expect(pad.get().begin).toBe(owned.begin);
});

it("copies ephemeral chunks and reuses an empty pad without a buffer allocation library", /** Does not read old owned borrowed spans after mutating the Pad. @returns Nothing. */ () => {
  const pad = new Pad(),
    input = new Uint8Array([1, 2, 3]);
  pad.addEphemeral(input, 3);
  input[0] = 99;
  expect(bytes(pad.get())).toEqual([1, 2, 3]);
  pad.add(new Uint8Array([4, 0]));
  expect(bytes(pad.get())).toEqual([1, 2, 3, 4]);
  pad.clear();
  expect(pad.get().length).toBe(0);
  expect(pad.get().begin?.[0]).toBe(0);
  const next = new Uint8Array([7, 8]);
  pad.add(next, 2);
  expect(pad.get().begin).toBe(next);
  pad.clear();
  pad.addEphemeral(new Int8Array([-1, -128]), 2);
  expect(bytes(pad.get())).toEqual([255, 128]);
});

it("accumulates UTF8 split across borrowed and ephemeral token chunks before decoding", /** Native Pad is a byte accumulator and does not decode partial chunks. @returns Nothing. */ () => {
  const pad = new Pad(),
    middle = new Uint8Array([0x82]);
  pad.add(new Uint8Array([0xe2]), 1);
  pad.addEphemeral(middle, 1);
  middle[0] = 0;
  pad.add(new Uint8Array([0xac]), 1);
  expect(bytes(pad.get())).toEqual([0xe2, 0x82, 0xac]);
  const result = pad.get().convertFromUtf8();
  expect([result.getLength(), result.getStr()[0]]).toEqual([1, 0x20ac]);
});
