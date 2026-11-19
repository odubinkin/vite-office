/** @fileoverview Original InflateZlib status/Sequence state machine over the installed actual zlib WASM library. Node zlib supplies independent compressed fixtures and expected decoded bytes; no decoder/status/native-state substitution. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { deflateRawSync, deflateSync, inflateRawSync, crc32 } from "node:zlib";
import { afterEach, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { InflateState, initializeZlib } from "../../../external/zlib/zlib";
import { InflateZlib } from "./InflateZlib";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { OStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { ZipFile, Checks } from "./ZipFile";
import { u } from "../../../test/native-dom";
afterEach(releaseDomScope);
/** Native initialized bytes. @param bytes - Actual input. @returns Native Sequence. */
function sequence(bytes: Uint8Array): Sequence<number> {
  const result = own(new (Sequence.specialize<number>("sal_Int8", 1))(bytes.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < bytes.length; ++i)
    (cells.get(i) as [number])[0] = ((bytes[i] as number) << 24) >> 24;
  return result;
}
/** Reads actual output cells. @param bytes - Native output. @param offset - First byte. @param count - Count. @returns Independent observation bytes. */
function output(bytes: Sequence<number>, offset: number, count: number): Uint8Array {
  const result = new Uint8Array(count),
    cells = bytes.getConstArray() as SequenceElements;
  for (let i = 0; i < count; ++i) result[i] = (cells.get(i + offset) as [number])[0];
  return result;
}
it("loads the installed real library once, before synchronous original core construction", /** Actual artifact bootstrap, without overriding native exports. @returns Initialization. */ async () => {
  expect(
    /** Actual synchronous precondition. @returns Native inflater if initialized unexpectedly. */ () =>
      new InflateState(true),
  ).toThrow("zlib must be initialized");
  await initializeExceptionAbi();
  await initializeRuntime();
  const bytes = new Uint8Array(
      readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
    ),
    promise = initializeZlib(bytes);
  expect(initializeZlib(bytes)).toBe(promise);
  await promise;
});
it.each([true, false])(
  "inflates actual raw=%s bytes into a native segment and retains untouched output",
  /** Original wrapped/raw constructors and output displacement. @param raw - Header mode. @returns Nothing. */ (
    raw,
  ) => {
    const expected = new TextEncoder().encode("word 字 and repeated repeated repeated text"),
      compressed = raw ? deflateRawSync(expected) : deflateSync(expected),
      inflater = own(new InflateZlib(raw)),
      out = sequence(new Uint8Array(100).fill(9)),
      input = sequence(compressed);
    inflater.setInput(input);
    expect(inflater.doInflateSegment(out, 3, 90)).toBe(expected.length);
    expect([...output(out, 3, expected.length)]).toEqual([...expected]);
    expect(output(out, 0, 3)).toEqual(Uint8Array.of(9, 9, 9));
    expect(output(out, 3 + expected.length, 1)[0]).toBe(9);
    expect(inflater.finished()).toBe(true);
    expect(inflater.needsDictionary()).toBe(false);
    expect(inflater.getLastInflateError()).toBe(0);
  },
);
it("preserves actual Sequence COW, partial output, retained compressed input and multiple source chunks", /** Uses genuine native input/output lvalues and small output windows. @returns Nothing. */ () => {
  const expected = new TextEncoder().encode("hello world ".repeat(1000)),
    compressed = deflateRawSync(expected),
    inflater = own(new InflateZlib(true)),
    out = sequence(new Uint8Array(71)),
    decoded: number[] = [];
  for (let start = 0; start < compressed.length; start += 3) {
    const input = sequence(compressed.subarray(start, start + 3));
    inflater.setInput(input);
    // getArray detaches the caller's native Sequence after the inflater assignment.
    const fields = input.getArray() as SequenceElements;
    for (let i = 0; i < input.getLength(); ++i) (fields.get(i) as [number])[0] = 0;
    for (;;) {
      const count = inflater.doInflateSegment(out, 0, 71);
      decoded.push(...output(out, 0, count));
      if (!count || inflater.finished()) break;
    }
  }
  expect(decoded).toEqual([...expected]);
  expect(inflater.finished()).toBe(true);
  expect(inflater.getLastInflateError()).toBe(0);
});
it("retains original invalid-segment guards, end/error and zero-input status suppression", /** Does not invent a source reset API. @returns Nothing. */ () => {
  const inflater = own(new InflateZlib(true)),
    out = sequence(new Uint8Array(4));
  for (const [offset, count] of [
    [-1, 1],
    [0, -1],
    [3, 2],
  ])
    expect(inflater.doInflateSegment(out, offset as number, count as number)).toBe(0);
  expect(inflater.getLastInflateError()).toBe(0);
  expect(inflater.doInflateSegment(out, 0, 4)).toBe(0);
  expect(inflater.getLastInflateError()).toBe(0);
  inflater.setInput(sequence(Uint8Array.of(7)));
  expect(inflater.doInflateSegment(out, 0, 0)).toBe(0);
  expect(inflater.getLastInflateError()).toBe(0);
  expect(inflater.doInflateSegment(out, 0, 4)).toBe(0);
  expect(inflater.getLastInflateError()).toBe(-3);
  expect(inflater.finished()).toBe(false);
  expect(inflater.doInflateSegment(out, -1, 4)).toBe(0);
  expect(inflater.getLastInflateError()).toBe(-3);
  inflater.end();
  inflater.end();
  expect(inflater.doInflateSegment(out, 0, 4)).toBe(0);
  expect(inflater.getLastInflateError()).toBe(-2);
});
it("retains genuine zlib NEED_DICT without substituting dictionary handling", /** Real wrapped zlib input carries a preset dictionary identifier. @returns Nothing. */ () => {
  const dictionary = Buffer.from("shared dictionary text"),
    compressed = deflateSync(Buffer.from("shared dictionary text value"), { dictionary }),
    inflater = own(new InflateZlib(false)),
    out = sequence(new Uint8Array(100));
  inflater.setInput(sequence(compressed));
  expect(inflater.doInflateSegment(out, 0, 100)).toBe(0);
  expect(inflater.needsDictionary()).toBe(true);
  expect(inflater.finished()).toBe(false);
  expect(inflater.getLastInflateError()).toBe(0);
  inflater.end();
  expect(inflater.needsDictionary()).toBe(true);
});
it("preserves full output and end status across the library24-bit packed-count boundary", /** Direct actual external ABI test avoids allocating millions of native Sequence address cells. @returns Nothing. */ () => {
  const expected = new Uint8Array(0x1000000 + 127).fill(65),
    compressed = deflateRawSync(expected),
    engine = new InflateState(true),
    decoded = new Uint8Array(expected.length + 31);
  try {
    const result = engine.inflate(compressed, decoded);
    expect(result).toEqual({ code: 1, consumed: compressed.length, produced: expected.length });
    expect(
      Buffer.compare(Buffer.from(decoded.subarray(0, expected.length)), Buffer.from(expected)),
    ).toBe(0);
    expect(decoded.subarray(expected.length)).toEqual(new Uint8Array(31));
  } finally {
    engine.end();
    engine.end();
  }
});
it("crosses native input windows with actual incompressible data and exact consumption", /** Independent deterministic high-entropy fixture exercises input exhaustion before output exhaustion. @returns Nothing. */ () => {
  const expected = new Uint8Array(1024 * 1024);
  let state = 123456789;
  for (let i = 0; i < expected.length; ++i) {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    expected[i] = state >>> 24;
  }
  const compressed = deflateRawSync(expected),
    engine = new InflateState(true),
    decoded = new Uint8Array(expected.length + 10);
  try {
    const result = engine.inflate(compressed, decoded);
    expect(result).toEqual({ code: 1, consumed: compressed.length, produced: expected.length });
    expect(
      Buffer.compare(Buffer.from(decoded.subarray(0, expected.length)), Buffer.from(expected)),
    ).toBe(0);
  } finally {
    engine.end();
  }
});
it.each([
  ["sw/qa/extras/ooxmlexport/data/hello.docx", "word/document.xml"],
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word/document.xml"],
  ["sc/qa/unit/data/xlsx/preserve_space.xlsx", "xl/workbook.xml"],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl/workbook.xml"],
  ["package/qa/cppunit/data/export64.zip", "styles.xml"],
])(
  "inflates real native directory entry from unchanged upstream %s",
  /** Original testZip64 styles length plus Strict/Transitional main parts at the consumed owner boundary; complete service/model QA is still separate. @param path - Source fixture. @param name - Native entry name. @returns Nothing. */ (
    path,
    name,
  ) => {
    const bytes = new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", path))),
      input = own(
        new Reference(
          new OStreamWrapper(own(new SvMemoryStream(bytes, bytes.length, StreamMode.READ))),
        ),
      ),
      zip = own(
        new ZipFile(
          own(new RtlReference(new RefCountedMutex())),
          input,
          own(new Reference()),
          true,
          false,
          Checks.CheckInsensitive,
        ),
      ),
      entry = zip.GetEntryHash().find(u(name));
    expect(entry).toBeDefined();
    if (!entry) throw new Error("source fixture entry missing");
    expect(entry.nMethod).toBe(8);
    const compressed = bytes.subarray(
        Number(entry.nOffset),
        Number(entry.nOffset + entry.nCompressedSize),
      ),
      inflater = own(new InflateZlib(true)),
      out = sequence(new Uint8Array(8192)),
      decoded: number[] = [];
    inflater.setInput(sequence(compressed));
    for (;;) {
      const count = inflater.doInflateSegment(out, 0, 8192);
      decoded.push(...output(out, 0, count));
      if (inflater.finished()) break;
      expect(count).toBeGreaterThan(0);
    }
    expect(inflater.getLastInflateError()).toBe(0);
    expect(BigInt(decoded.length)).toBe(entry.nSize);
    expect(Buffer.compare(Buffer.from(decoded), inflateRawSync(compressed))).toBe(0);
    expect(crc32(Uint8Array.from(decoded))).toBe(entry.nCrc >>> 0);
    if (name === "styles.xml") expect(decoded.length).toBe(1112);
  },
);
