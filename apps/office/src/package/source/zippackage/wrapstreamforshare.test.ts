/** @fileoverview Original shared-cursor wrapper contracts over actual UNO memory/native package buffers, ZIP input and OSL mutex. No fake stream, mutex, RTTI or private-state provider. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeZlib } from "../../../external/zlib/zlib";
import { ZipFile, Checks } from "../zipapi/ZipFile";
import { u } from "../../../test/native-dom";
import { beforeAll, afterEach, it, expect } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { WrapStreamForShare } from "./wrapstreamforshare";
import { ZipPackageBuffer } from "./ZipPackageBuffer";
beforeAll(
  /** Actual native mutex/UNO runtime. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
    await initializeZlib(
      new Uint8Array(
        readFileSync(resolve("../../node_modules/@zip.js/zip.js/dist/zip-module.wasm")),
      ),
    );
  },
);
afterEach(releaseDomScope);
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Actual byte sequence. @param values - Data. @returns Native sequence. */
function sequence(values: readonly number[] = []): Sequence<number> {
  const data = own(new Bytes(values.length)),
    cells = data.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (cells.get(i) as [number])[0] = values[i] as number;
  return data;
}
/** Native cells to observed bytes. @param data - Actual output. @returns Values. */
function values(data: Sequence<number>): number[] {
  const cells = data.getConstArray() as SequenceElements,
    result: number[] = [];
  for (let i = 0; i < data.getLength(); ++i) result.push((cells.get(i) as [number])[0]);
  return result;
}
/** Actual memory and shared source wrappers. @returns Source graph. */
function graph() {
  const memory = own(new Reference(new UNOMemoryStream())),
    mutex = own(new RtlReference(new RefCountedMutex()));
  memory.operatorStar().writeBytes(sequence([10, 20, 30, 40, 50]));
  // Source starts at EOF. Each original wrapper still starts at zero.
  const a = own(new Reference(new WrapStreamForShare(memory, mutex))),
    b = own(new Reference(new WrapStreamForShare(memory, mutex)));
  return { memory, mutex, a, b };
}
/** Observe and dispose original generated exception. @param action - Actual call. @param expected - Expected constructor. @returns Nothing. */
function fails(
  action: () => unknown,
  expected: typeof IOException | typeof RuntimeException | typeof Exception,
): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof expected)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
}
it("exposes original independent ByteReader and UNO bases and interleaves all read overloads", /** Actual wrapper cursors and source positions. @returns Nothing. */ () => {
  const { a, b, memory } = graph(),
    x = a.operatorStar(),
    y = b.operatorStar(),
    data = sequence();
  expect(x instanceof ByteReader).toBe(true);
  expect(own(new Reference(a, UNO_QUERY, XInputStream.static_type)).get()).toBe(x);
  expect(own(new Reference(a, UNO_QUERY, XSeekable.static_type)).get()).toBe(x);
  expect(x.getPosition()).toBe(0n);
  expect(x.available()).toBe(0); // Source remains at EOF until a read/seek.
  expect(x.readBytes(data, 2)).toBe(2);
  expect(values(data)).toEqual([10, 20]);
  expect(y.readSomeBytes(data, 1)).toBe(1);
  expect(values(data)).toEqual([10]);
  const raw = new Int8Array(3);
  expect(x.readSomeBytes(raw.subarray(1), 2)).toBe(2);
  expect([...raw]).toEqual([0, 30, 40]);
  expect(y.readSomeBytes(data, 3)).toBe(3);
  expect(values(data)).toEqual([20, 30, 40]);
  expect(x.getPosition()).toBe(4n);
  expect(y.getPosition()).toBe(4n);
  expect(memory.operatorStar().getPosition()).toBe(4n);
  expect(x.getLength()).toBe(5n);
});
it("retains source-position availability instead of reporting remaining bytes at the wrapper cursor", /** Original available omits the seek performed by reads. @returns Nothing. */ () => {
  const { a, b } = graph(),
    x = a.operatorStar(),
    y = b.operatorStar(),
    data = sequence();
  x.seek(1n);
  y.seek(4n);
  expect(x.getPosition()).toBe(1n);
  expect(x.available()).toBe(1);
  expect(x.readBytes(data, 1)).toBe(1);
  expect(values(data)).toEqual([20]);
  expect(y.available()).toBe(3);
  y.skipBytes(99);
  expect(y.getPosition()).toBe(5n);
  expect(x.getPosition()).toBe(2n);
  expect(x.available()).toBe(0);
  x.skipBytes(1);
  expect(x.getPosition()).toBe(3n);
});
it("propagates genuine source seek/read/skip errors without advancing its cursor and releases guards", /** Actual source invalid-count and seek exceptions, no injected errors. @returns Nothing. */ () => {
  const { a } = graph(),
    x = a.operatorStar(),
    data = sequence();
  x.seek(2n);
  fails(/** Native negative seek. @returns Nothing. */ () => x.seek(-1n), Exception);
  expect(x.getPosition()).toBe(2n);
  fails(/** Native negative read. @returns Nothing. */ () => x.readBytes(data, -1), IOException);
  fails(
    /** Native negative readSome. @returns Nothing. */ () => x.readSomeBytes(data, -1),
    IOException,
  );
  fails(
    /** Native pointer negative read. @returns Nothing. */ () =>
      x.readSomeBytes(new Int8Array(1), -1),
    IOException,
  );
  fails(/** Native negative skip. @returns Nothing. */ () => x.skipBytes(-1), IOException);
  expect(x.getPosition()).toBe(2n);
  expect(x.readBytes(data, 1)).toBe(1);
  expect(values(data)).toEqual([30]);
});
it("disconnects only this wrapper, retains the real source and throws on every post-close operation", /** Original close does not close/reset UNOMemoryStream. @returns Nothing. */ () => {
  const { a, b, memory } = graph(),
    x = a.operatorStar(),
    data = sequence();
  x.seek(3n);
  x.closeInput();
  expect(memory.operatorStar().getPosition()).toBe(3n);
  expect(b.operatorStar().readBytes(data, 1)).toBe(1);
  expect(values(data)).toEqual([10]);
  for (const action of [
    /** Closed sequence read. @returns Result. */ () => x.readBytes(data, 1),
    /** Closed Some read. @returns Result. */ () => x.readSomeBytes(data, 1),
    /** Closed pointer read. @returns Result. */ () => x.readSomeBytes(new Int8Array(1), 1),
    /** Closed skip. @returns Nothing. */ () => x.skipBytes(1),
    /** Closed available. @returns Result. */ () => x.available(),
    /** Closed seek. @returns Nothing. */ () => x.seek(0n),
    /** Closed position. @returns Result. */ () => x.getPosition(),
    /** Closed length. @returns Result. */ () => x.getLength(),
    /** Repeated close. @returns Nothing. */ () => x.closeInput(),
  ])
    fails(action, IOException);
});
it("retains default RuntimeException initialization failures and actual borrowed memory input", /** Missing refs and real seekable MemoryInputStream. @returns Nothing. */ () => {
  const mutex = own(new RtlReference(new RefCountedMutex())),
    memory = own(new Reference(new UNOMemoryStream()));
  fails(
    /** Missing input. @returns Never. */ () => new WrapStreamForShare(own(new Reference()), mutex),
    RuntimeException,
  );
  fails(
    /** Missing mutex. @returns Never. */ () =>
      new WrapStreamForShare(memory, own(new RtlReference())),
    RuntimeException,
  );
  const input = own(new Reference(new MemoryInputStream(new Uint8Array([1]), 1)));
  // The pointer/count constructor borrows actual initialized bytes.
  const wrapped = own(new Reference(new WrapStreamForShare(input, mutex)));
  expect(wrapped.operatorStar().getLength()).toBe(1n);
});
it("keeps release-build Sequence-only operation on a real source lacking ByteReader without inventing a fast fallback", /** Original debug assertion/raw null-pointer domain remains unqualified. @returns Nothing. */ () => {
  const memory = own(new Reference(new ZipPackageBuffer())),
    mutex = own(new RtlReference(new RefCountedMutex()));
  memory.operatorStar().writeBytes(sequence([7, 8, 9]));
  expect(memory.get() instanceof ByteReader).toBe(false);
  const wrapped = own(new Reference(new WrapStreamForShare(memory, mutex))),
    out = sequence();
  expect(wrapped.operatorStar().readBytes(out, 2)).toBe(2);
  expect(values(out)).toEqual([7, 8]);
  expect(wrapped.operatorStar().readSomeBytes(out, 2)).toBe(1);
  expect(values(out)).toEqual([9]);
});

/** Consumes a real ByteReader through repeated bounded pointer reads. @param input - Actual reader. @returns Read bytes. */
function consume(input: ByteReader): number[] {
  const part = new Int8Array(257),
    result: number[] = [];
  for (;;) {
    const count = input.readSomeBytes(part, part.length);
    if (!count) return result;
    for (let i = 0; i < count; ++i) result.push((part[i] as number) & 255);
  }
}
it.each([
  ["sw/qa/extras/ooxmlexport/data/hello.docx", "word/document.xml"],
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word/document.xml"],
  ["sc/qa/unit/data/xlsx/preserve_space.xlsx", "xl/workbook.xml"],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl/workbook.xml"],
])(
  "independently reads the same native part from%s and preserves nonseekable query failure",
  /** Actual ZIP entry/CRC/buffered source and independent wrapper cursors. @param file - Upstream fixture. @param path - Native entry. @returns Nothing. */
  (file, path) => {
    const wire = new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", file))),
      source = own(new Reference(new MemoryInputStream(wire, wire.length))),
      mutex = own(new RtlReference(new RefCountedMutex())),
      zip = own(
        new ZipFile(mutex, source, own(new Reference()), true, false, Checks.CheckInsensitive),
      ),
      empty = own(new RtlReference<never>()),
      entry = zip.GetEntryHash().find(u(path));
    if (!entry) throw new Error("original fixture entry absent");
    const shared = own(zip.getDataStream(entry, empty, null, mutex)),
      a = own(new Reference(new WrapStreamForShare(shared, mutex))),
      b = own(new Reference(new WrapStreamForShare(shared, mutex))),
      prefix = new Int8Array(19);
    const first = a.operatorStar().readSomeBytes(prefix, prefix.length);
    const all = consume(b.operatorStar()),
      rest = consume(a.operatorStar());
    expect(
      [...prefix.subarray(0, first)]
        .map(/** Unsigned wire byte. @param value - Byte. @returns Value. */ (value) => value & 255)
        .concat(rest),
    ).toEqual(all);
    expect(all.length).toBe(Number(entry.nSize));
    expect(new TextDecoder().decode(new Uint8Array(all))).toContain(
      path.startsWith("word") ? "document" : "workbook",
    );
    const raw = own(zip.getRawData(entry, empty, null, mutex, false));
    expect(own(new Reference(raw, UNO_QUERY, XSeekable.static_type)).is()).toBe(false);
    fails(
      /** Actual native unbuffered stream lacks XSeekable. @returns Never. */ () =>
        new WrapStreamForShare(raw, mutex),
      RuntimeException,
    );
  },
);
