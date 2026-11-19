/** @fileoverview Actual source-internal XBufferedStream over genuine native MemoryInputStream/UNO facets/ByteReader and pointer/Sequence buffers. No RTTI suppression, fake stream or private field injection. Non-ByteReader constructor coverage waits for the actual unbuffered ZIP input. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XBufferedStream } from "./ZipFile.buffered";
import { ByteGrabber } from "./ByteGrabber";
beforeAll(initializeExceptionAbi);
afterEach(releaseDomScope);
/** Native byte Sequence initialized through actual cells. @param values - Initial bytes. @returns Actual byte sequence. */
function sequence(values: number[] = []): Sequence<number> {
  const result = own(new (Sequence.specialize<number>("sal_Int8", 1))(values.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (cells.get(i) as [number])[0] = values[i] as number;
  return result;
}
/** Observes the actual native Sequence. @param value - Borrowed sequence. @returns Signed byte values. */
function bytes(value: Sequence<number>): number[] {
  const cells = value.getConstArray() as SequenceElements,
    result: number[] = [];
  for (let i = 0; i < value.getLength(); ++i) result.push((cells.get(i) as [number])[0]);
  return result;
}
/** Actual input snapshot from current source position. @param contents - Native initialized bytes. @returns Source and buffered result. */
function buffer(contents: Int8Array): {
  source: Reference<MemoryInputStream>;
  stream: Reference<XBufferedStream>;
} {
  const source = own(new Reference(new MemoryInputStream(contents, contents.length))),
    stream = own(new Reference(new XBufferedStream(source)));
  return { source, stream };
}
it("eagerly consumes available bytes through real ByteReader RTTI and isolates later source changes", /** Actual source is consumed but not retained/closed by the buffered owner. @returns Nothing. */ () => {
  const contents = Int8Array.of(1, -128, -1, 42),
    { source, stream } = buffer(contents),
    out = sequence();
  expect(source.get() instanceof ByteReader).toBe(true);
  expect(stream.get() instanceof ByteReader).toBe(true);
  expect(source.operatorStar().getPosition()).toBe(4n);
  contents.fill(0);
  source.operatorStar().closeInput();
  expect(stream.operatorStar().readBytes(out, 9)).toBe(4);
  expect(bytes(out)).toEqual([1, -128, -1, 42]);
  expect(stream.operatorStar().getLength()).toBe(4n);
  expect(stream.operatorStar().getPosition()).toBe(4n);
});
it("retains actual UNO input/seekable identity and shares scalar/raw/Sequence positions", /** Native queries and ByteGrabber use the same buffered object. @returns Nothing. */ () => {
  const { stream } = buffer(Int8Array.of(1, 2, 3, 4, 5)),
    input = own(new Reference<XInputStream>(stream, UNO_QUERY_THROW, XInputStream.static_type)),
    seek = own(new Reference<XSeekable>(input, UNO_QUERY_THROW, XSeekable.static_type)),
    reader = own(new ByteGrabber(input));
  expect(input.get()).toBe(stream.get());
  expect(seek.get()).toBe(stream.get());
  expect(reader.ReadUInt16()).toBe(513);
  expect(seek.operatorStar().getPosition()).toBe(2n);
  const out = sequence();
  expect(input.operatorStar().readSomeBytes(out, 1)).toBe(1);
  expect(bytes(out)).toEqual([3]);
  const raw = new Int8Array(4);
  expect(stream.operatorStar().readSomeBytes(raw.subarray(1, 2), 2)).toBe(2);
  expect([...raw]).toEqual([0, 4, 5, 0]);
  expect(reader.getPosition()).toBe(5n);
  seek.operatorStar().seek(0n);
  expect(reader.ReadUInt32()).toBe(0x04030201);
});
it("preserves EOF output storage and original no-op closeInput", /** Existing output is not resized on EOF; close does not invalidate buffered bytes. @returns Nothing. */ () => {
  const { stream } = buffer(Int8Array.of(7)),
    out = sequence([11, 12]);
  stream.operatorStar().seek(1n);
  expect(stream.operatorStar().readBytes(out, 4)).toBe(0);
  expect(bytes(out)).toEqual([11, 12]);
  expect(stream.operatorStar().readSomeBytes(new Int8Array(1), 1)).toBe(0);
  stream.operatorStar().closeInput();
  stream.operatorStar().seek(0n);
  expect(stream.operatorStar().readBytes(out, 1)).toBe(1);
  expect(bytes(out)).toEqual([7]);
});
it("retains source unchecked skip including over-end position and wasm32 unsigned wrap", /** No clamping or invented negative-skip exception. @returns Nothing. */ () => {
  const { stream } = buffer(Int8Array.of(1, 2, 3));
  stream.operatorStar().skipBytes(10);
  expect(stream.operatorStar().getPosition()).toBe(10n);
  expect(stream.operatorStar().available()).toBe(0);
  stream.operatorStar().skipBytes(2);
  expect(stream.operatorStar().getPosition()).toBe(10n);
  stream.operatorStar().seek(0n);
  stream.operatorStar().skipBytes(-1);
  expect(stream.operatorStar().getPosition()).toBe(0xffffffffn);
  stream.operatorStar().seek(2n);
  stream.operatorStar().skipBytes(-1);
  expect(stream.operatorStar().getPosition()).toBe(1n);
  expect(stream.operatorStar().available()).toBe(2);
});
it("uses native Sequence-cell raw destinations and source zero/negative pointer-count arithmetic", /** A negative raw count copies no bytes and still adjusts unsigned source position, as upstream. @returns Nothing. */ () => {
  const { stream } = buffer(Int8Array.of(5, 6, 7)),
    out = sequence([9, 9]),
    cells = out.getArray() as SequenceElements;
  expect(stream.operatorStar().readSomeBytes(cells, 2)).toBe(2);
  expect(bytes(out)).toEqual([5, 6]);
  expect(stream.operatorStar().readSomeBytes(cells, 0)).toBe(0);
  expect(stream.operatorStar().getPosition()).toBe(2n);
  expect(stream.operatorStar().readSomeBytes(cells, -1)).toBe(-1);
  expect(stream.operatorStar().getPosition()).toBe(1n);
});
it("preserves source seek bounds and generated ArgumentPosition=1", /** Both failures are actual generated IllegalArgumentException values. @returns Nothing. */ () => {
  const { stream } = buffer(Int8Array.of(1, 2));
  for (const location of [-1n, 3n]) {
    let caught = false;
    try {
      stream.operatorStar().seek(location);
    } catch (error) {
      if (!(error instanceof IllegalArgumentException)) throw error;
      try {
        expect(error.ArgumentPosition).toBe(1);
        caught = true;
      } finally {
        error.dispose();
      }
    }
    expect(caught).toBe(true);
    expect(stream.operatorStar().getPosition()).toBe(0n);
  }
  stream.operatorStar().seek(2n);
  expect(stream.operatorStar().available()).toBe(0);
});
it("snapshots remaining source rather than rewinding and handles the genuine empty input", /** Original available count determines the copied window. @returns Nothing. */ () => {
  const source = own(new Reference(new MemoryInputStream(Int8Array.of(1, 2, 3, 4), 4)));
  source.operatorStar().seek(2n);
  const stream = own(new Reference(new XBufferedStream(source))),
    out = sequence();
  expect(stream.operatorStar().getLength()).toBe(2n);
  expect(stream.operatorStar().readBytes(out, 2)).toBe(2);
  expect(bytes(out)).toEqual([3, 4]);
  const empty = buffer(new Int8Array()).stream;
  expect(empty.operatorStar().getLength()).toBe(0n);
  expect(empty.operatorStar().readBytes(out, 1)).toBe(0);
  expect(bytes(out)).toEqual([3, 4]);
});
