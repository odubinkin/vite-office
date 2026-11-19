/** @fileoverview Actual TempFileFast lifetime and original fast-service IO contracts over MEMFS/SvFileStream; no substitute file, stream or RNG provider. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { XTempFile } from "../../../udkapi/com/sun/star/io/XTempFile";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { XTruncate } from "../../../udkapi/com/sun/star/io/XTruncate";
import { ByteReader, ByteWriter } from "../../../comphelper/inc/bytereader";
import { setAllowedPaths } from "../../../sal/osl/unx/file.access";
import { SvFileStream, StreamMode } from "../../../tools/inc/stream";
import { TempFileFast, TempFileFastService } from "../../inc/tempfile";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(initializeRuntime);
beforeAll(initializeExceptionAbi);
afterEach(
  /** Restores the real public file policy before releasing actual owners. @returns Nothing. */ () => {
    setAllowedPaths(new Uint16Array());
    releaseDomScope();
  },
);
/** Initializes real signed byte cells. @param values - Original bytes. @returns Owned native sequence. */
function bytes(values: readonly number[]) {
  const result = own(new Bytes(values.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i)
    (cells.get(i) as [number])[0] = ((values[i] as number) << 24) >> 24;
  return result;
}
/** Reads native cells without replacing their owners. @param value - Native sequence. @returns Signed values. */
function values(value: Sequence<number>) {
  const fields = value.getConstArray() as SequenceElements;
  const result: number[] = [];
  for (let i = 0; i < value.getLength(); ++i) result.push((fields.get(i) as [number])[0]);
  return result;
}
/** Checks an original exception and releases its native fields. @param action - Actual operation. @param kind - Source exception class. @returns Nothing. */
function fails(action: () => unknown, kind: { prototype: Exception }) {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error).toBeInstanceOf(kind);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
it("retains lazy file creation, source UUID names, mode caching, move and repeated close", /** Actual file names and backend handles prove original lifetime rather than a memory fallback. @returns Nothing. */ () => {
  const before = getFileSystem().readdir("/tmp").length,
    original = own(new TempFileFast());
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
  const stream = original.GetStream(StreamMode.READWRITE);
  expect(stream).toBeInstanceOf(SvFileStream);
  if (!(stream instanceof SvFileStream)) throw new Error("source file stream absent");
  const name = String.fromCharCode(
    ...stream.GetFileName().getStr().subarray(0, stream.GetFileName().getLength()),
  );
  expect(name).toMatch(
    /lu\d+\{[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}\}\.tmp$/u,
  );
  expect(stream.IsOpen()).toBe(true);
  expect(getFileSystem().readdir("/tmp").length).toBe(before + 1);
  expect(original.GetStream(StreamMode.READ)).toBe(stream);
  stream.WriteBytes(Uint8Array.of(1, 2, 3), 3);
  const moved = own(TempFileFast.move(original));
  original.CloseStream();
  expect(moved.GetStream(StreamMode.READ)).toBe(stream);
  expect(stream.Tell()).toBe(3n);
  moved.CloseStream();
  moved.CloseStream();
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
  expect(
    /** Actual native filesystem no longer contains the closed file. @returns Native stat result. */ () =>
      getFileSystem().stat(name),
  ).toThrow();
  const next = moved.GetStream(StreamMode.READWRITE);
  expect(next).not.toBe(stream);
});
it("ports original generic IO assertions with actual fast-reader/writer facets and endpoint closure", /** Both endpoints share source state and a real eager file, without named-file service properties. @returns Nothing. */ () => {
  const before = getFileSystem().readdir("/tmp").length,
    ref = own(new Reference(new TempFileFastService())),
    value = ref.operatorStar();
  expect(getFileSystem().readdir("/tmp").length).toBe(before + 1);
  for (const type of [
    XStream.static_type,
    XInputStream.static_type,
    XOutputStream.static_type,
    XSeekable.static_type,
    XTruncate.static_type,
  ])
    expect(own(new Reference(ref, UNO_QUERY, type)).get()).toBe(value);
  expect(value instanceof ByteReader).toBe(true);
  expect(value instanceof ByteWriter).toBe(true);
  expect(own(new Reference(ref, UNO_QUERY, XTempFile.static_type)).is()).toBe(false);
  expect(own(value.getInputStream()).get()).toBe(value);
  expect(own(value.getOutputStream()).get()).toBe(value);
  value.writeBytes(bytes([0, 127, -128, -1]));
  value.flush();
  expect(value.getPosition()).toBe(4n);
  expect(value.getLength()).toBe(4n);
  value.seek(0n);
  const data = bytes([9, 9, 9, 9, 9]);
  expect(value.available()).toBe(4);
  expect(value.readBytes(data, 2)).toBe(2);
  expect(values(data)).toEqual([0, 127]);
  value.skipBytes(-1);
  expect(value.getPosition()).toBe(1n);
  const raw = new Int8Array(3);
  expect(value.readSomeBytes(raw, 3)).toBe(3);
  expect([...raw]).toEqual([127, -128, -1]);
  expect(value.readSomeBytes(data, 3)).toBe(0);
  expect(data.getLength()).toBe(0);
  expect(value.readSomeBytes(data, 3)).toBe(0);
  const unchanged = Int8Array.of(99);
  expect(value.readSomeBytes(unchanged, 1)).toBe(0);
  expect([...unchanged]).toEqual([99]);
  value.closeOutput();
  expect(value.getPosition()).toBe(0n);
  expect(value.readSomeBytes(data, 9)).toBe(4);
  expect(values(data)).toEqual([0, 127, -128, -1]);
  value.closeInput();
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
  fails(
    /** Original non-idempotent close. @returns Nothing. */ () => value.closeInput(),
    NotConnectedException,
  );
  fails(
    /** Original non-idempotent close. @returns Nothing. */ () => value.closeOutput(),
    NotConnectedException,
  );
  expect(own(value.getInputStream()).get()).toBe(value);
  expect(own(value.getOutputStream()).get()).toBe(value);
});
it("retains pointer writes, negative-count errors, UInt32 seek mutation and truncate semantics", /** Original narrowing can change position before IllegalArgumentException. @returns Nothing. */ () => {
  const value = own(new Reference(new TempFileFastService())).operatorStar(),
    data = bytes([]);
  value.writeBytes(Int8Array.of(1, 2, 3), 3);
  fails(
    /** Original negative sequence count. @returns Count. */ () => value.readBytes(data, -1),
    BufferSizeExceededException,
  );
  fails(
    /** Original negative sequence maximum. @returns Count. */ () => value.readSomeBytes(data, -1),
    BufferSizeExceededException,
  );
  fails(
    /** Original negative pointer count. @returns Count. */ () =>
      value.readSomeBytes(new Int8Array(1), -1),
    BufferSizeExceededException,
  );
  fails(
    /** Original negative seek. @returns Nothing. */ () => value.seek(-1n),
    IllegalArgumentException,
  );
  fails(
    /** Source narrows before comparing resulting offset. @returns Nothing. */ () =>
      value.seek(0x100000001n),
    IllegalArgumentException,
  );
  expect(value.getPosition()).toBe(1n);
  value.seek(0n);
  expect(value.readSomeBytes(data, 2)).toBe(2);
  expect(values(data)).toEqual([1, 2]);
  value.truncate();
  expect(value.getPosition()).toBe(0n);
  expect(value.getLength()).toBe(0n);
  value.closeInput();
  value.writeBytes(bytes([8]));
  value.closeOutput();
  for (const action of [
    /** Closed availability. @returns Count. */ () => value.available(),
    /** Closed read. @returns Count. */ () => value.readBytes(data, 0),
    /** Closed raw read. @returns Count. */ () => value.readSomeBytes(new Int8Array(1), 0),
    /** Closed write. @returns Nothing. */ () => value.writeBytes(data),
    /** Closed raw write. @returns Nothing. */ () => value.writeBytes(new Int8Array(0), 0),
    /** Closed flush. @returns Nothing. */ () => value.flush(),
    /** Closed seek. @returns Nothing. */ () => value.seek(0n),
    /** Closed position. @returns Position. */ () => value.getPosition(),
    /** Closed size. @returns Size. */ () => value.getLength(),
    /** Closed truncate. @returns Nothing. */ () => value.truncate(),
    /** Closed skip. @returns Nothing. */ () => value.skipBytes(0),
    /** Closed some read. @returns Count. */ () => value.readSomeBytes(data, 0),
  ])
    fails(action, NotConnectedException);
});
it("retains real file-open failure and different read precheck order without a fallback provider", /** The public original allowed-path gate produces an actual failed SvFileStream; no hidden stream state is changed. @returns Nothing. */ () => {
  setAllowedPaths(u("/not-the-temp-directory").getStr());
  const value = own(new Reference(new TempFileFastService())).operatorStar(),
    data = bytes([]);
  fails(
    /** Sequence negative count precedes existing stream error. @returns Count. */ () =>
      value.readBytes(data, -1),
    BufferSizeExceededException,
  );
  fails(
    /** Some-read checks stream error before negative count. @returns Count. */ () =>
      value.readSomeBytes(data, -1),
    NotConnectedException,
  );
  fails(
    /** Pointer some-read also checks existing error first. @returns Count. */ () =>
      value.readSomeBytes(new Int8Array(1), -1),
    NotConnectedException,
  );
  fails(
    /** Actual failed write. @returns Nothing. */ () => value.writeBytes(bytes([1])),
    NotConnectedException,
  );
  setAllowedPaths(new Uint16Array());
});
