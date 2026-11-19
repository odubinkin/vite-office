/** @fileoverview Original background ZIP task constructor/work/temp-file/exception/entry-transfer contracts over genuine ThreadPool(0), TempFileFastService, UNO streams and actual package owners. Production worker scheduling and whole package threaded QA remain unqualified. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { crc32, inflateRawSync } from "node:zlib";
import { initializeRuntime, getFileSystem } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { ExceptionPtr } from "../../../external/libcxx/exception";
import { ThreadPool } from "../../../comphelper/inc/threadpool";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { NotConnectedException } from "../../../cppu/inc/com/sun/star/io/NotConnectedException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { OInputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { ZipOutputEntryInThread } from "./ZipOutputEntry";
import { ZipOutputStream } from "./ZipOutputStream";
import { ZipEntry } from "../../inc/ZipEntry";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Actual native runtime and exception execution ABI. @returns Completion. */ async () => {
    await initializeRuntime();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Real initialized output record transferred to its source owner. @returns Consumed record. */
function record(): ZipEntry {
  const value = new ZipEntry();
  value.sPath.assign(u("a"));
  value.nMethod = 8;
  value.nFlag = 8;
  value.nSize = value.nCompressedSize = -1n;
  value.nCrc = -1;
  return value;
}
/** Original actual background entry constructor. @param entry - Consumed record. @returns Owned entry. */
function background(entry = record()): ZipOutputEntryInThread {
  return own(
    new ZipOutputEntryInThread(
      own(new Reference(getProcessComponentContext().get())),
      entry,
      null,
      false,
    ),
  );
}
/** Actual signed-byte sequence extraction. @param bytes - Original sequence. @returns Bytes. */
function image(bytes: Sequence<number>): Uint8Array {
  const fields = bytes.getConstArray() as SequenceElements,
    result = new Uint8Array(bytes.getLength());
  for (let i = 0; i < result.length; ++i) result[i] = (fields.get(i) as [number])[0];
  return result;
}
/** Reads whole current source input through its real public interface. @param input - Actual input. @returns Image. */
function readAll(input: ReturnType<ZipOutputEntryInThread["getData"]>): Uint8Array {
  const bytes = own(new Bytes()),
    size = input.operatorStar().available();
  expect(input.operatorStar().readBytes(bytes, size + 1)).toBe(size);
  return image(bytes);
}
/** Actual weak liveness observation does not retain its result. @param weak - Source weak owner. @returns Liveness. */
function alive(weak: WeakReferenceHelper): boolean {
  const value = weak.get();
  try {
    return value.is();
  } finally {
    value.dispose();
  }
}
it.each([0, 1, 32768, 65537, 100001])(
  "executes the original temporary-file task at%s bytes",
  /** Original work body is run by the real explicit no-worker source queue; production background worker selection remains pending. @param size - Input length. @returns Nothing. */ (
    size,
  ) => {
    const before = getFileSystem().readdir("/tmp").length;
    const data = new Uint8Array(size);
    for (let i = 0; i < size; ++i) data[i] = (i * 71) ^ (i >> 5);
    const entry = background(),
      input = own(new Reference(new MemoryInputStream(data, size))),
      pool = own(new ThreadPool(0)),
      tag = own(ThreadPool.createThreadTaskTag());
    expect(entry.isFinished()).toBe(false);
    expect(entry.getParallelDeflateException().is()).toBe(false);
    pool.pushTask(entry.createTask(tag, input));
    expect(entry.isFinished()).toBe(false);
    pool.waitUntilDone(tag);
    expect(entry.isFinished()).toBe(true);
    expect(entry.getParallelDeflateException().is()).toBe(false);
    expect(tag.isDone()).toBe(true);
    const stream = own(entry.getData()),
      compressed = readAll(stream);
    expect([...inflateRawSync(compressed)]).toEqual([...data]);
    expect(entry.getZipEntry().nSize).toBe(BigInt(size));
    expect(entry.getZipEntry().nCompressedSize).toBe(BigInt(compressed.length));
    expect(entry.getZipEntry().nCrc).toBe(crc32(data) | 0);
    const same = own(entry.getData());
    expect(same.get()).toBe(stream.get());
    expect(same.operatorStar().available()).toBe(0);
    const seek = own(new Reference<XSeekable>(same, UNO_QUERY_THROW, XSeekable.static_type));
    seek.operatorStar().seek(0n);
    entry.deleteBufferFile();
    expect(getFileSystem().readdir("/tmp").length).toBe(before + 1);
    expect([...readAll(same)]).toEqual([...compressed]);
    seek.clear();
    same.clear();
    stream.clear();
    expect(getFileSystem().readdir("/tmp").length).toBe(before);
    input.operatorStar().seek(0n);
    expect(input.operatorStar().available()).toBe(size);
    pool.shutdown();
  },
);
it("captures an actual disconnected source failure and retains its Context after task destruction", /** Actual error, native temp cleanup and exception_ptr copy are observed without a fake input/provider. @returns Nothing. */ () => {
  const before = getFileSystem().readdir("/tmp").length;
  const backing = own(new SvMemoryStream(new Uint8Array([1, 2, 3]), 3, StreamMode.READ)),
    input = own(new Reference(new OInputStreamWrapper(backing))),
    weak = own(new WeakReferenceHelper(input)),
    entry = background(),
    pool = own(new ThreadPool(0)),
    tag = own(ThreadPool.createThreadTaskTag());
  input.operatorStar().closeInput();
  pool.pushTask(entry.createTask(tag, input));
  pool.waitUntilDone(tag);
  input.clear();
  expect(entry.isFinished()).toBe(true);
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
  expect(entry.getParallelDeflateException().is()).toBe(true);
  expect(alive(weak)).toBe(true);
  const saved = own(new ExceptionPtr(entry.getParallelDeflateException()));
  entry.setParallelDeflateException(own(new ExceptionPtr()));
  expect(alive(weak)).toBe(true);
  let caught = false;
  try {
    saved.rethrow();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      caught = true;
      expect(error).toBeInstanceOf(NotConnectedException);
      expect(read(new OUString(error.Message))).toBe("");
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
  saved.dispose();
  expect(alive(weak)).toBe(false);
  expect(entry.getParallelDeflateException().is()).toBe(false);
  pool.shutdown();
});
it("moves the owned original entry while retaining the base's borrowed record pointer", /** Public consumed move binding does not copy source metadata or delete the transferred record. @returns Nothing. */ () => {
  const original = record(),
    entry = background(original),
    moved = entry.moveZipEntry();
  expect(moved).toBe(original);
  expect(entry.getZipEntry()).toBe(original);
  expect(entry.moveZipEntry()).toBeNull();
  if (!moved) throw new Error("Actual moved record expected");
  own(moved);
  expect(read(new OUString(moved.sPath))).toBe("a");
});
it("retains an actual host exception pointer in the original entry field", /** Original exception_ptr assignment preserves host exception identity without converting it to UNO. @returns Nothing. */ () => {
  const entry = background(),
    error = new Error("task failure"),
    value = own(ExceptionPtr.capture(error));
  entry.setParallelDeflateException(value);
  value.dispose();
  expect(entry.getParallelDeflateException().is()).toBe(true);
  try {
    entry.getParallelDeflateException().rethrow();
  } catch (caught) {
    expect(caught).toBe(error);
  }
  entry.setParallelDeflateException(own(new ExceptionPtr()));
  expect(entry.getParallelDeflateException().is()).toBe(false);
});

it("retains the real input until queued work releases its original task member", /** Caller may release its input after enqueue; successful work releases that member before reporting finished. @returns Nothing. */ () => {
  const data = new TextEncoder().encode("owned input"),
    input = own(new Reference(new MemoryInputStream(data, data.length))),
    weak = own(new WeakReferenceHelper(input)),
    entry = background(),
    pool = own(new ThreadPool(0)),
    tag = own(ThreadPool.createThreadTaskTag());
  pool.pushTask(entry.createTask(tag, input));
  input.clear();
  expect(alive(weak)).toBe(true);
  pool.waitUntilDone(tag);
  expect(alive(weak)).toBe(false);
  expect(entry.isFinished()).toBe(true);
  expect(entry.getParallelDeflateException().is()).toBe(false);
  pool.shutdown();
});

it("rethrows the original scheduled failure after writing the archive footer", /** Exercises actual UNO disconnection and archive finalization. @returns Nothing. */ () => {
  const before = getFileSystem().readdir("/tmp").length;
  const output = own(new Reference(new UNOMemoryStream()));
  const zip = own(new ZipOutputStream(output));
  const good = record();
  good.nMethod = 0;
  good.nTime = -1;
  good.nSize = good.nCompressedSize = 0n;
  good.nCrc = 0;
  ZipOutputStream.setEntry(good);
  zip.writeLOC(good);
  zip.rawCloseEntry();

  const backing = own(new SvMemoryStream(Uint8Array.of(1), 1, StreamMode.READ));
  const input = own(new Reference(new OInputStreamWrapper(backing)));
  const failed = new ZipOutputEntryInThread(
    own(new Reference(getProcessComponentContext().get())),
    record(),
    null,
    false,
  );
  zip.addDeflatingThreadTask(failed, input);
  input.operatorStar().closeInput();
  try {
    zip.finish();
    expect.unreachable("Expected a disconnected scheduled input");
  } catch (error) {
    if (!(error instanceof NotConnectedException)) throw error;
    error.dispose();
  }
  const stream = output.operatorStar();
  const footer = new Uint8Array(22);
  stream.seek(stream.getLength() - 22n);
  expect(stream.readSomeBytes(footer, footer.length)).toBe(22);
  const fields = new DataView(footer.buffer);
  expect(fields.getUint32(0, true)).toBe(0x06054b50);
  expect(fields.getUint16(10, true)).toBe(1);
  expect(getFileSystem().readdir("/tmp").length).toBe(before);
});
