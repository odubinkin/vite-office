/** @fileoverview Actual low-level JS zlib and original Deflater lifecycle, native Sequence COW and independent decompression. */
import { inflateRawSync, inflateSync } from "node:zlib";
import { afterEach, beforeAll, expect, it } from "vitest";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { own, releaseDomScope } from "../../../test/native-dom";
import { Deflater } from "./Deflater";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Initialize actual native Sequence runtime. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
/** Marshal initialized native bytes. @param input - Source image. @returns Owned Sequence. */
function sequence(input: Uint8Array): Sequence<number> {
  const result = own(new Bytes(input.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < input.length; ++i)
    (cells.get(i) as [number])[0] = ((input[i] as number) << 24) >> 24;
  return result;
}
/** Drain original owner, preserving unused destination cells. @param owner - Actual compressor. @param final - Finish until end instead of input exhaustion. @param capacity - Small output extent. @returns Produced image. */
function drain(owner: Deflater, final: boolean, capacity: number): Uint8Array {
  const output = sequence(new Uint8Array(capacity + 3).fill(91)),
    bytes: number[] = [];
  for (let calls = 0; calls < 100000; ++calls) {
    const produced = owner.doDeflateSegment(output, capacity),
      cells = output.getConstArray() as SequenceElements;
    for (let i = 0; i < produced; ++i) bytes.push((cells.get(i) as [number])[0] & 255);
    for (let i = capacity; i < output.getLength(); ++i)
      expect((cells.get(i) as [number])[0]).toBe(91);
    if (final ? owner.finished() : owner.needsInput()) return Uint8Array.from(bytes);
  }
  throw new Error("real deflate did not make bounded progress");
}
it.each([-1, 0, 1, 6, 9])(
  "compresses raw and wrapped streams at source level %s using tiny output",
  /** Independent system zlib consumes the actual emitted bytes. @param level - Original compression level. @returns Nothing. */ (
    level,
  ) => {
    const input = new TextEncoder().encode("Unicode 字 and binary \0\u00ff ".repeat(100));
    for (const raw of [false, true]) {
      const owner = own(new Deflater(level, raw));
      expect(owner.needsInput()).toBe(true);
      expect(owner.finished()).toBe(false);
      owner.setInputSegment(sequence(input));
      owner.finish();
      expect(owner.finished()).toBe(false);
      const packed = drain(owner, true, 7);
      expect([...(raw ? inflateRawSync(packed) : inflateSync(packed))]).toEqual([...input]);
      expect(owner.getTotalIn()).toBe(BigInt(input.length));
      expect(owner.getTotalOut()).toBe(BigInt(packed.length));
      expect(owner.needsInput()).toBe(true);
      owner.end();
      owner.end();
    }
  },
);
it("retains native input COW across segments and resets the same library stream for reuse", /** Caller mutation must detach its native Sequence. @returns Nothing. */ () => {
  const owner = own(new Deflater(-1, true)),
    first = new TextEncoder().encode("first".repeat(200)),
    second = new TextEncoder().encode("second".repeat(200));
  for (let run = 0; run < 2; ++run) {
    const source = sequence(first);
    owner.setInputSegment(source);
    ((source.getArray() as SequenceElements).get(0) as [number])[0] = 0;
    const prefix = drain(owner, false, 11);
    owner.setInputSegment(sequence(second));
    owner.finish();
    const suffix = drain(owner, true, 11),
      packed = new Uint8Array(prefix.length + suffix.length);
    packed.set(prefix);
    packed.set(suffix, prefix.length);
    expect(Uint8Array.from(inflateRawSync(packed))).toEqual(Uint8Array.from([...first, ...second]));
    expect(owner.getTotalIn()).toBe(BigInt(first.length + second.length));
    expect(owner.getTotalOut()).toBe(BigInt(packed.length));
    owner.reset();
    expect(owner.finished()).toBe(false);
    expect(owner.needsInput()).toBe(true);
    expect(owner.getTotalIn()).toBe(0n);
    expect(owner.getTotalOut()).toBe(0n);
  }
});
it("finishes empty streams and preserves pending-input bookkeeping on library error", /** No replacement error result or eager finish behavior. @returns Nothing. */ () => {
  const owner = own(new Deflater(-1, true));
  owner.finish();
  const packed = drain(owner, true, 1);
  expect(inflateRawSync(packed).length).toBe(0);
  owner.setInputSegment(sequence(Uint8Array.of(1, 2, 3)));
  expect(owner.doDeflateSegment(sequence(new Uint8Array(10)), 10)).toBe(0);
  expect(owner.needsInput()).toBe(false);
  expect(owner.getTotalIn()).toBe(0n);
});
it("allows original end and destruction after invalid-level initialization", /** Invalid native-state operations remain outside the source contract. @returns Nothing. */ () => {
  const owner = own(new Deflater(100, true));
  expect(owner.needsInput()).toBe(true);
  owner.end();
});
