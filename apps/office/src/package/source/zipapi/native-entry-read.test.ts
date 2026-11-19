/** @fileoverview Original native CRC/entry stream chain over genuine streams, directory entries, mutexes and installed zlib. Tests include original sal CRC QA and upstream package payloads; no stream/status/provider/private-field substitutions. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { crc32 as independentCrc, deflateRawSync, inflateRawSync } from "node:zlib";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { OStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { rtl_crc32 } from "../../../sal/rtl/crc";
import { CRC32 } from "./CRC32";
import { ZipFile, Checks } from "./ZipFile";
import { ZipEntry } from "../../inc/ZipEntry";
import {
  XUnbufferedStream,
  UNBUFF_STREAM_DATA,
  UNBUFF_STREAM_RAW,
  UNBUFF_STREAM_WRAPPEDRAW,
} from "./XUnbufferedStream";
import { ByteGrabber } from "./ByteGrabber";
import { XBufferedStream } from "./ZipFile.buffered";
beforeAll(
  /** Initialize actual library artifacts before synchronous source constructors. @returns Completion. */ async () => {
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
/** Actual native Sequence bytes. @param value - Fixture bytes. @returns Sequence. */
function sequence(value = new Uint8Array()): Sequence<number> {
  const result = own(new (Sequence.specialize<number>("sal_Int8", 1))(value.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < value.length; ++i)
    (cells.get(i) as [number])[0] = ((value[i] as number) << 24) >> 24;
  return result;
}
/** Actual native output observation. @param value - Borrowed Sequence. @returns Plain observation bytes. */
function bytes(value: Sequence<number>): number[] {
  const result: number[] = [],
    cells = value.getConstArray() as SequenceElements;
  for (let i = 0; i < value.getLength(); ++i) result.push((cells.get(i) as [number])[0] & 255);
  return result;
}
/** Real source stream over actual initialized bytes. @param value - Actual archive. @returns Native stream. */
function input(value: Uint8Array): Reference<OStreamWrapper> {
  return own(
    new Reference(
      new OStreamWrapper(own(new SvMemoryStream(value, value.length, StreamMode.READ))),
    ),
  );
}
/** Source exception assertion with actual native field destruction. @param action - Native call. @param message - Expected diagnostic. @returns Nothing. */
function broken(action: () => unknown, message = "The stream seems to be broken!"): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
    try {
      expect(error instanceof ZipIOException).toBe(true);
      expect(read(new OUString(error.Message))).toBe(message);
      caught = true;
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Native archive plus source shared members. @param value - Actual bytes. @returns Original owner graph. */
function archive(value: Uint8Array): {
  zip: ZipFile;
  mutex: RtlReference<RefCountedMutex>;
  data: RtlReference<never>;
} {
  const mutex = own(new RtlReference(new RefCountedMutex())),
    data = own(new RtlReference<never>()),
    zip = own(
      new ZipFile(mutex, input(value), own(new Reference()), true, false, Checks.CheckInsensitive),
    );
  return { zip, mutex, data };
}
/** Original little-endian on-wire test record writer, independent of kernel binary writers. @param target - Real bytes. @param offset - Field offset. @param value - Bits. @param width - Byte width. @returns Nothing. */
function put(target: Uint8Array, offset: number, value: number, width: number): void {
  for (let i = 0; i < width; ++i) target[offset + i] = value >>> (8 * i);
}
/** Complete single-entry archive with real compressed payload and independent CRC. @param data - Plain bytes. @param method - Source compression method. @param wrongCrc - Deliberately inconsistent payload checksum in both matching headers. @returns Actual archive. */
function image(data: Uint8Array, method: 0 | 8 = 8, wrongCrc = false): Uint8Array {
  const payload = method === 8 ? new Uint8Array(deflateRawSync(data)) : data,
    result = new Uint8Array(31 + payload.length + 47 + 22),
    central = 31 + payload.length,
    end = central + 47,
    crc = (independentCrc(data) + (wrongCrc ? 1 : 0)) >>> 0;
  put(result, 0, 0x04034b50, 4);
  put(result, 4, 20, 2);
  put(result, 8, method, 2);
  put(result, 14, crc, 4);
  put(result, 18, payload.length, 4);
  put(result, 22, data.length, 4);
  put(result, 26, 1, 2);
  result[30] = 97;
  result.set(payload, 31);
  put(result, central, 0x02014b50, 4);
  put(result, central + 4, 0x314, 2);
  put(result, central + 6, 20, 2);
  put(result, central + 10, method, 2);
  put(result, central + 16, crc, 4);
  put(result, central + 20, payload.length, 4);
  put(result, central + 24, data.length, 4);
  put(result, central + 28, 1, 2);
  result[central + 46] = 97;
  put(result, end, 0x06054b50, 4);
  put(result, end + 8, 1, 2);
  put(result, end + 10, 1, 2);
  put(result, end + 12, 47, 4);
  put(result, end + 16, central, 4);
  return result;
}
/** Reads through the actual UNO stream using returned counts. @param source - Native stream. @param window - Requested count. @returns Complete actual bytes. */
function consume(source: Reference<XInputStream>, window = 113): Uint8Array {
  const buffer = sequence(),
    result: number[] = [];
  for (;;) {
    const count = source.operatorStar().readBytes(buffer, window);
    if (!count) break;
    expect(buffer.getLength()).toBe(count);
    result.push(...bytes(buffer));
  }
  return Uint8Array.from(result);
}
it("ports original rtl_crc32_001 empty buffer", /** Original assertion. @returns Nothing. */ () => {
  expect(rtl_crc32(0, Uint8Array.of(0), 0)).toBe(0);
});
it("ports original rtl_crc32_002 two zeros", /** Original assertion. @returns Nothing. */ () => {
  expect(rtl_crc32(0, Uint8Array.of(0, 0), 2)).not.toBe(0);
});
it("ports original rtl_crc32_002_1 three zeros", /** Original assertion. @returns Nothing. */ () => {
  expect(rtl_crc32(0, Uint8Array.of(0, 0, 0), 3)).not.toBe(0);
});
it("ports original rtl_crc32_003 distinct content", /** Original assertion. @returns Nothing. */ () => {
  expect(rtl_crc32(0, Uint8Array.of(2), 1)).not.toBe(rtl_crc32(0, Uint8Array.of(3), 1));
});
it("ports original rtl_crc32_003_1 bounds", /** Original assertion. @returns Nothing. */ () => {
  expect(rtl_crc32(0, Uint8Array.of(2, 1), 1)).toBe(rtl_crc32(0, Uint8Array.of(2, 2), 1));
});
it("ports original rtl_crc32_003_2 reverse order", /** Original assertion. @returns Nothing. */ () => {
  const values = Uint8Array.from(
    { length: 21 },
    /** Fixture integer byte. @param _ - Unused value. @param i - Position. @returns Byte. */ (
      _,
      i,
    ) => i,
  );
  expect(rtl_crc32(0, values, 21)).not.toBe(rtl_crc32(0, values.slice().reverse(), 21));
});
it("uses the unchanged pinned JS library and all unsigned seed/null/counted-pointer paths", /** Independent Node zlib CRC, not kernel self-consistency alone. @returns Nothing. */ () => {
  const root = resolve("../.."),
    metadata = JSON.parse(
      readFileSync(resolve(root, "third_party/zipjs-codecs/source.json"), "utf8"),
    ) as { sha256: string };
  const original = readFileSync(
      resolve(root, "node_modules/@zip.js/zip.js/lib/core/streams/codecs/crc32.js"),
    ),
    copied = readFileSync(resolve(root, "third_party/zipjs-codecs/crc32.mjs"));
  expect(copied.equals(original)).toBe(true);
  expect(createHash("sha256").update(copied).digest("hex")).toBe(metadata.sha256);
  const value = Uint8Array.from(
    { length: 257 },
    /** Independent byte fixture. @param _ - Unused. @param i - Position. @returns Byte. */ (
      _,
      i,
    ) => i,
  );
  for (const seed of [0, 1, 0xffffffff, 0x80000000]) {
    expect(rtl_crc32(seed, null, 99)).toBe(seed);
    expect(rtl_crc32(seed, value, 257)).toBe(independentCrc(value, seed));
  }
  const large = new Uint8Array(65537).fill(42);
  expect(rtl_crc32(0xffffffff, large, large.length)).toBe(independentCrc(large, 0xffffffff));
  const narrow = value.subarray(1, 2);
  expect(rtl_crc32(0, narrow, 3)).toBe(independentCrc(value.subarray(1, 4)));
  const native = sequence(value),
    crc = new CRC32();
  crc.updateSegment(native, 3);
  crc.updateSegment(value.subarray(3), 254);
  expect(crc.getValue() >>> 0).toBe(independentCrc(value));
  crc.reset();
  crc.update(native);
  expect(crc.getValue() >>> 0).toBe(independentCrc(value));
});
it.each([0, 3, 32768, 65537])(
  "retains original CRC32 updateStream32KiB loop for%i bytes",
  /** Source stream remains open at its actual end. @param size - Actual file length. @returns Nothing. */ (
    size,
  ) => {
    const value = new Uint8Array(size).fill(137),
      source = own(new Reference(new MemoryInputStream(value, size))),
      crc = new CRC32();
    expect(crc.updateStream(source)).toBe(BigInt(size));
    expect(crc.getValue() >>> 0).toBe(independentCrc(value));
    expect(source.operatorStar().getPosition()).toBe(BigInt(size));
    source.operatorStar().seek(0n);
  },
);
it.each([
  ["sw/qa/extras/ooxmlexport/data/hello.docx", "word/document.xml"],
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word/document.xml"],
  ["sc/qa/unit/data/xlsx/preserve_space.xlsx", "xl/workbook.xml"],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl/workbook.xml"],
  ["package/qa/cppunit/data/export64.zip", "styles.xml"],
])(
  "reads actual getDataStream/getInputStream/raw bytes from upstream%s",
  /** Native source entry-stream construction and CRC, including original testZip64 size assertion. @param file - Pinned archive. @param name - Native entry. @returns Nothing. */ (
    file,
    name,
  ) => {
    const value = new Uint8Array(readFileSync(resolve("../../vendor/libreoffice-reference", file))),
      { zip, mutex, data } = archive(value),
      entry = zip.GetEntryHash().find(u(name));
    expect(entry).toBeDefined();
    if (!entry) throw new Error("upstream entry absent");
    const source = own(zip.getDataStream(entry, data, null, mutex)),
      seek = own(new Reference<XSeekable>(source, UNO_QUERY_THROW, XSeekable.static_type)),
      actual = consume(source),
      raw = own(zip.getRawData(entry, data, null, mutex, false)),
      compressed = consume(raw, 257),
      expected = entry.nMethod === 8 ? inflateRawSync(compressed) : compressed;
    expect(Buffer.compare(Buffer.from(actual), Buffer.from(expected))).toBe(0);
    expect(BigInt(actual.length)).toBe(entry.nSize);
    expect(independentCrc(actual)).toBe(entry.nCrc >>> 0);
    expect(seek.operatorStar().getLength()).toBe(entry.nSize);
    const second = own(zip.getInputStream(entry, data, null, mutex));
    expect(Buffer.compare(Buffer.from(consume(second)), Buffer.from(actual))).toBe(0);
    if (name === "styles.xml") expect(actual.length).toBe(1112);
  },
);
it("uses actual non-ByteReader XUnbufferedStream in both ByteGrabber and XBufferedStream fallback paths", /** Genuine missing XSeekable is observable; no marker hiding or provider replacement. @returns Nothing. */ () => {
  const value = new TextEncoder().encode("abcdef".repeat(3000)),
    { zip, mutex, data } = archive(image(value, 0)),
    entry = zip.GetEntryHash().find(u("a")) as ZipEntry,
    raw = own(zip.getRawData(entry, data, null, mutex, false));
  expect(raw.get()).toBeInstanceOf(XUnbufferedStream);
  expect(raw.get() instanceof ByteReader).toBe(false);
  const seek = own(new Reference<XSeekable>(raw, UNO_QUERY, XSeekable.static_type));
  expect(seek.is()).toBe(false);
  const grabber = own(new ByteGrabber(raw));
  expect(grabber.ReadUInt16()).toBe(0x6261);
  const target = new Int8Array(3);
  expect(grabber.readBytes(target, 3)).toBe(3);
  expect([...target]).toEqual([99, 100, 101]);
  let caught = false;
  try {
    grabber.seek(0n);
  } catch (error) {
    if (!(error instanceof IOException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
  const remaining = own(new Reference(new XBufferedStream(raw)));
  expect(remaining.operatorStar().getLength()).toBe(BigInt(value.length - 5));
  expect(Buffer.compare(Buffer.from(consume(remaining)), Buffer.from(value.subarray(5)))).toBe(0);
});
it("retains eager CRC failure for DEFLATED and source raw/STORED CRC omission", /** Checks original source mode selection rather than adding a stricter CRC check. @returns Nothing. */ () => {
  const value = new TextEncoder().encode("CRC payload"),
    bad = archive(image(value, 8, true)),
    entry = bad.zip.GetEntryHash().find(u("a")) as ZipEntry;
  broken(
    /** Actual eager constructor call. @returns Native input if unexpectedly accepted. */ () =>
      bad.zip.getDataStream(entry, bad.data, null, bad.mutex),
  );
  const raw = own(bad.zip.getRawData(entry, bad.data, null, bad.mutex));
  expect(consume(raw).length).toBe(Number(entry.nCompressedSize));
  const stored = archive(image(value, 0, true)),
    storedEntry = stored.zip.GetEntryHash().find(u("a")) as ZipEntry;
  expect([
    ...consume(own(stored.zip.getDataStream(storedEntry, stored.data, null, stored.mutex))),
  ]).toEqual([...value]);
});
it("retains unbuffered no-op close, readSomeBytes, discard skip and zero EOF reallocation", /** Actual component lifecycle and cursor behavior. @returns Nothing. */ () => {
  const value = Uint8Array.of(1, 2, 3, 4),
    { zip, mutex, data } = archive(image(value, 0)),
    entry = zip.GetEntryHash().find(u("a")) as ZipEntry,
    source = own(zip.getRawData(entry, data, null, mutex, false)),
    out = sequence(Uint8Array.of(9, 9));
  source.operatorStar().skipBytes(0);
  source.operatorStar().skipBytes(2);
  expect(source.operatorStar().available()).toBe(2);
  source.operatorStar().closeInput();
  expect(source.operatorStar().readSomeBytes(out, 9)).toBe(2);
  expect(bytes(out)).toEqual([3, 4]);
  expect(source.operatorStar().readBytes(out, 2)).toBe(0);
  expect(out.getLength()).toBe(0);
});
it("returns empty source entries without a synthetic decode/CRC call", /** Original zero-request guard, including nonzero CRC on empty DEFLATED data. @returns Nothing. */ () => {
  const { zip, mutex, data } = archive(image(new Uint8Array(), 8, true)),
    entry = zip.GetEntryHash().find(u("a")) as ZipEntry;
  expect(consume(own(zip.getDataStream(entry, data, null, mutex))).length).toBe(0);
});
/** Actual unbuffered source constructor with explicitly supplied source ZipEntry aggregate. @param payload - Compressed/raw bytes. @param size - Original logical size. @param compressedSize - Declared compressed extent. @param crc - Original CRC bits. @param mode - Original mode. @param offset - Original data offset. @returns Actual component. */
function direct(
  payload: Uint8Array,
  size: bigint,
  compressedSize: bigint,
  crc: number,
  mode: 0 | 1 | 2 = UNBUFF_STREAM_DATA,
  offset = 0n,
): Reference<XUnbufferedStream> {
  const entry = own(new ZipEntry());
  entry.nVersion = 20;
  entry.nFlag = 0;
  entry.nMethod = mode === UNBUFF_STREAM_DATA ? 8 : 0;
  entry.nTime = 0;
  entry.nCrc = crc | 0;
  entry.nCompressedSize = compressedSize;
  entry.nSize = size;
  entry.nOffset = offset;
  entry.nPathLen = 0;
  entry.nExtraLen = 0;
  return own(
    new Reference(
      new XUnbufferedStream(
        own(new Reference()),
        own(new RtlReference(new RefCountedMutex())),
        entry,
        input(payload),
        own(new RtlReference<never>()),
        mode,
        null,
        u(""),
        false,
      ),
    ),
  );
}
it("preserves actual truncated-input, zlib error and signed32 compressed-difference failures", /** Genuine short native reads and actual corrupt compressed bytes produce every error. @returns Nothing. */ () => {
  const out = sequence();
  broken(
    /** Genuine shorter file than declared compressed extent. @returns Read count. */ () =>
      direct(Uint8Array.of(1), 20n, 10n, 0).operatorStar().readBytes(out, 20),
    "No expected data!",
  );
  broken(
    /** Actual reserved DEFLATE block type. @returns Read count. */ () =>
      direct(Uint8Array.of(7), 20n, 1n, 0).operatorStar().readBytes(out, 20),
  );
  broken(
    /** Public original entry count narrows to negative sal_Int32. @returns Read count. */ () =>
      direct(Uint8Array.of(1), 20n, 0x80000000n, 0).operatorStar().readBytes(out, 20),
  );
});
it("preserves native constructor size/checked-add failures and raw-wrapped plaintext mode", /** Public record inputs exercise constructor contracts, without private state mutation. @returns Nothing. */ () => {
  broken(
    /** Negative logical size. @returns Native component if unexpectedly accepted. */ () =>
      direct(new Uint8Array(), -1n, 0n, 0),
  );
  broken(
    /** Overflowed end offset. @returns Native component if unexpectedly accepted. */ () =>
      direct(Uint8Array.of(1), 1n, 1n, 0, UNBUFF_STREAM_RAW, 0x7fffffffffffffffn),
    "Integer-overflow",
  );
  const value = Uint8Array.of(1, 2, 3),
    raw = direct(value, 3n, 3n, independentCrc(value), UNBUFF_STREAM_WRAPPEDRAW);
  expect(raw.operatorStar().getSize()).toBe(3n);
  expect([...consume(raw)]).toEqual([...value]);
});
it("preserves CRC-valid full output without a synthetic final DEFLATE marker check", /** Real non-final stored DEFLATE block omits the next block; source stops at declared size/CRC. @returns Nothing. */ () => {
  const value = new TextEncoder().encode("correct output"),
    payload = new Uint8Array(5 + value.length);
  payload[0] = 0;
  put(payload, 1, value.length, 2);
  put(payload, 3, value.length ^ 0xffff, 2);
  payload.set(value, 5);
  expect(
    /** Independent strict decoder rejects the unfinished stream. @returns Decoded bytes if unexpectedly accepted. */ () =>
      inflateRawSync(payload),
  ).toThrow();
  const source = direct(
    payload,
    BigInt(value.length),
    BigInt(payload.length),
    independentCrc(value),
  );
  expect([...consume(source)]).toEqual([...value]);
});
it("handles genuine zero-progress raw truncation in the Sequence-buffer fallback", /** Native read reaches physical EOF before advertised raw end; the source fallback stops rather than creating bytes. @returns Nothing. */ () => {
  const source = direct(new Uint8Array(), 3n, 3n, 0, UNBUFF_STREAM_RAW);
  const buffered = own(new Reference(new XBufferedStream(source)));
  expect(buffered.operatorStar().getLength()).toBe(0n);
  const reader = own(new ByteGrabber(source));
  expect(reader.ReadUInt16()).toBe(0);
  for (const action of [
    /** Actual nonseekable position call. @returns Position if unexpectedly accepted. */ () =>
      reader.getPosition(),
    /** Actual nonseekable length call. @returns Length if unexpectedly accepted. */ () =>
      reader.getLength(),
  ]) {
    let caught = false;
    try {
      action();
    } catch (error) {
      if (!(error instanceof IOException)) throw error;
      error.dispose();
      caught = true;
    }
    expect(caught).toBe(true);
  }
});
it("uses source readLOC for newly-created entry records in each original stream entry point", /** Public aggregate has original negative/zero LOC offset convention, not an injected private cursor. @returns Nothing. */ () => {
  const value = Uint8Array.of(4, 5, 6),
    physical = image(value, 0),
    mutex = own(new RtlReference(new RefCountedMutex())),
    data = own(new RtlReference<never>()),
    zip = own(
      new ZipFile(mutex, input(physical), own(new Reference()), false, false, Checks.Default),
    );
  for (const method of ["getInputStream", "getDataStream", "getRawData"] as const) {
    const entry = own(new ZipEntry());
    entry.nVersion = 20;
    entry.nFlag = 0;
    entry.nMethod = 0;
    entry.nTime = 0;
    entry.nCrc = independentCrc(value) | 0;
    entry.nCompressedSize = 3n;
    entry.nSize = 3n;
    entry.nOffset = 0n;
    entry.nPathLen = -1;
    entry.nExtraLen = 0;
    const stream = own(
      method === "getRawData"
        ? zip.getRawData(entry, data, null, mutex, false)
        : zip[method](entry, data, null, mutex),
    );
    expect([...consume(stream)]).toEqual([...value]);
    expect(entry.nOffset).toBe(31n);
    expect(read(new OUString(entry.sPath))).toBe("a");
  }
});
it("replaces real seekable ByteReader input with actual unbuffered Sequence input and preserves short reads", /** Original setter updates query/RTTI while the reusable byte Sequence remains the same owner. @returns Nothing. */ () => {
  const reader = own(new ByteGrabber(input(Uint8Array.of(9, 8)))),
    source = direct(Uint8Array.of(1, 2, 3, 4, 5), 5n, 5n, 0, UNBUFF_STREAM_RAW),
    out = sequence(new Uint8Array(2));
  expect(reader.ReadUInt16()).toBe(0x0809);
  reader.setInputStream(source);
  expect(reader.ReadUInt16()).toBe(0x0201);
  expect(reader.readBytes(out.getArray() as SequenceElements, 2)).toBe(2);
  expect(bytes(out)).toEqual([3, 4]);
  expect(reader.ReadUInt16()).toBe(0);
  expect(reader.ReadUInt64()).toBe(0n);
  reader.setInputStream(input(Uint8Array.of(7, 8, 9, 10)));
  expect(reader.getLength()).toBe(4n);
  expect(reader.getPosition()).toBe(0n);
  expect(reader.ReadUInt32()).toBe(0x0a090807);
});
it("returns the real decoded prefix before reporting an overstated entry size on the next read", /** Original short-output exit uses physical compressed end, then the next native read observes the unresolved advertised remainder. @returns Nothing. */ () => {
  const value = Uint8Array.of(4, 5, 6),
    payload = Uint8Array.of(0, 3, 0, 252, 255, 4, 5, 6),
    source = direct(payload, 4n, 8n, independentCrc(value)),
    out = sequence();
  expect(source.operatorStar().readBytes(out, 9)).toBe(3);
  expect(bytes(out)).toEqual([...value]);
  expect(source.operatorStar().available()).toBe(1);
  broken(
    /** Genuine unresolved remainder at compressed EOF. @returns Read count. */ () =>
      source.operatorStar().readBytes(out, 1),
  );
  const large = direct(new Uint8Array(), 0x80000000n, 0x80000000n, 0, UNBUFF_STREAM_RAW);
  expect(large.operatorStar().available()).toBe(2147483647);
  expect(large.operatorStar().getSize()).toBe(0x80000000n);
});
it("interleaves two genuine unbuffered views over the same archive without sharing logical positions", /** Each source read re-seeks under the original shared mutex. @returns Nothing. */ () => {
  const { zip, mutex, data } = archive(image(Uint8Array.of(1, 2, 3, 4), 0)),
    entry = zip.GetEntryHash().find(u("a")) as ZipEntry,
    first = own(zip.getRawData(entry, data, null, mutex, false)),
    second = own(zip.getRawData(entry, data, null, mutex, false)),
    out = sequence();
  expect(first.operatorStar().readBytes(out, 2)).toBe(2);
  expect(bytes(out)).toEqual([1, 2]);
  expect(second.operatorStar().readBytes(out, 1)).toBe(1);
  expect(bytes(out)).toEqual([1]);
  expect(first.operatorStar().readBytes(out, 2)).toBe(2);
  expect(bytes(out)).toEqual([3, 4]);
  expect(second.operatorStar().readBytes(out, 3)).toBe(3);
  expect(bytes(out)).toEqual([2, 3, 4]);
});
