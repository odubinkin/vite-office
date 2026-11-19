/** @fileoverview Native original ZIP output headers/raw-copy/descriptors over real UNO memory streams; native input and independent zlib verify on-wire results. No fake stream, scheduled task, encoder, private-state or clock provider. Synchronous compression lives in a separate source owner. */
import { ZipReader, Uint8ArrayReader, Uint8ArrayWriter } from "@zip.js/zip.js";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { deflateRawSync, crc32, inflateRawSync } from "node:zlib";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeZlib } from "../../../external/zlib/zlib";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ByteReader } from "../../../comphelper/inc/bytereader";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { ZipOutputStream } from "./ZipOutputStream";
import { Deflater } from "./Deflater";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { ZipOutputEntry } from "./ZipOutputEntry";
import { ZipFile, Checks } from "./ZipFile";
import { ZipEntry } from "../../inc/ZipEntry";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { ZipException } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { OUString } from "../../../sal/inc/rtl/ustring";
beforeAll(
  /** Initialize actual native artifacts. @returns Completion. */ async () => {
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
/** Actual byte Sequence. @param values - Initialized bytes. @returns Native owner. */
function sequence(values: Uint8Array): Sequence<number> {
  const result = own(new (Sequence.specialize<number>("sal_Int8", 1))(values.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i)
    (cells.get(i) as [number])[0] = ((values[i] as number) << 24) >> 24;
  return result;
}
/** Actual writer and caller-owned memory. @returns Source graph. */
function output(): { writer: ZipOutputStream; memory: Reference<UNOMemoryStream> } {
  const memory = own(new Reference(new UNOMemoryStream())),
    writer = own(new ZipOutputStream(memory));
  return { writer, memory };
}
/** Allocates the source public record; it transfers to writeLOC. @param name - Original path. @param data - Plain content. @param method - Compression choice. @param unknown - Original unknown CRC/compressed-size convention. @returns Actual record. */
function entry(name: string, data: Uint8Array, method: 0 | 8 = 8, unknown = false): ZipEntry {
  const result = new ZipEntry();
  result.sPath.assign(u(name));
  result.nVersion = 0;
  result.nFlag = 0;
  result.nMethod = method;
  result.nTime = 0;
  result.nCrc = unknown ? -1 : crc32(data) | 0;
  result.nSize = BigInt(data.length);
  result.nCompressedSize = unknown
    ? -1n
    : BigInt(method === 8 ? deflateRawSync(data).length : data.length);
  result.nOffset = -1n;
  result.nPathLen = -1;
  result.nExtraLen = -1;
  ZipOutputStream.setEntry(result);
  return result;
}
/** Copies actual emitted bytes from native source storage. @param memory - Real output. @returns Byte image. */
function bytes(memory: Reference<UNOMemoryStream>): Uint8Array {
  const size = Number(memory.operatorStar().getLength()),
    result = new Uint8Array(size);
  memory.operatorStar().seek(0n);
  memory.operatorStar().readSomeBytes(result, size);
  return result;
}
/** Creates the actual original reader on the same memory stream. @param memory - Actual completed archive. @returns Native reader and shared members. */
function reopen(memory: Reference<UNOMemoryStream>) {
  memory.operatorStar().seek(0n);
  const mutex = own(new RtlReference(new RefCountedMutex())),
    data = own(new RtlReference<never>()),
    zip = own(
      new ZipFile(mutex, memory, own(new Reference()), true, false, Checks.CheckInsensitive),
    );
  return { mutex, data, zip };
}
/** Actual native error observation/destruction. @param action - Original operation. @returns Nothing. */
function invalidName(action: () => unknown): void {
  let caught = false;
  try {
    action();
  } catch (error) {
    if (!(error instanceof IOException)) throw error;
    expect(read(new OUString(error.Message))).toBe("Unexpected character is used in file name.");
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
}
it("writes a complete native STORED archive, raw-copies DEFLATED bytes and reopens through original data streams", /** Real compressed bytes come from an independent encoder; this owner is the original byte/header producer. @returns Nothing. */ () => {
  const { writer, memory } = output(),
    files = [
      ["word/document.xml", new TextEncoder().encode("<w:p>字</w:p>"), 8],
      ["mimetype", new TextEncoder().encode("application/test"), 0],
      ["empty", new Uint8Array(), 0],
    ] as const;
  expect(writer.getStream().get()).toBe(memory.get());
  for (const [name, data, method] of files) {
    const record = entry(name, data, method);
    writer.writeLOC(record);
    writer.rawWrite(sequence(method === 8 ? deflateRawSync(data) : data));
    writer.rawCloseEntry();
  }
  writer.finish();
  const wire = bytes(memory),
    view = new DataView(wire.buffer);
  expect(view.getUint32(0, true)).toBe(0x04034b50);
  expect(view.getUint32(wire.length - 22, true)).toBe(0x06054b50);
  expect(view.getUint16(wire.length - 12, true)).toBe(3);
  const reopened = reopen(memory);
  for (const [name, data] of files) {
    const record = reopened.zip.GetEntryHash().find(u(name));
    expect(record).toBeDefined();
    if (!record) throw new Error("written native entry absent");
    const stream = own(reopened.zip.getDataStream(record, reopened.data, null, reopened.mutex)),
      actual = new Uint8Array(data.length);
    const nativeInput = stream.get();
    if (!(nativeInput instanceof ByteReader))
      throw new Error("native buffered input lacks source ByteReader");
    expect(nativeInput.readSomeBytes(actual, data.length)).toBe(data.length);
    expect([...actual]).toEqual([...data]);
  }
});
it("writes source unknown-size descriptors after the caller updates the same consumed record", /** Original alias is a borrowed source record, not a snapshot of final metadata. @returns Nothing. */ () => {
  const { writer, memory } = output(),
    data = new TextEncoder().encode("repeat ".repeat(100)),
    packed = deflateRawSync(data),
    record = entry("a", data, 8, true);
  writer.writeLOC(record);
  expect(record.nOffset).toBe(0n);
  writer.rawWrite(sequence(packed));
  record.nCompressedSize = BigInt(packed.length);
  record.nSize = BigInt(data.length);
  record.nCrc = crc32(data) | 0;
  writer.rawCloseEntry();
  writer.finish();
  const wire = bytes(memory),
    view = new DataView(wire.buffer);
  expect(view.getUint16(6, true) & 8).toBe(8);
  expect(view.getUint32(14, true)).toBe(0);
  expect(view.getUint32(31 + packed.length, true)).toBe(0x08074b50);
  expect([...inflateRawSync(wire.subarray(31, 31 + packed.length))]).toEqual([...data]);
  expect(reopen(memory).zip.GetEntryHash().find(u("a"))?.nSize).toBe(BigInt(data.length));
});
it("preserves source sentinel defaults, flag reset and actual UTC DOS timestamp", /** Original live platform clock, without Date replacement. @returns Nothing. */ () => {
  const record = own(new ZipEntry());
  record.nTime = -1;
  record.nMethod = -1;
  record.nFlag = 0xffff;
  record.nSize = 7n;
  record.nCompressedSize = -1n;
  record.nCrc = 0;
  const before = Date.now();
  ZipOutputStream.setEntry(record);
  const after = Date.now(),
    time = record.nTime >>> 0,
    stamp = Date.UTC(
      1980 + (time >>> 25),
      ((time >>> 21) & 15) - 1,
      (time >>> 16) & 31,
      (time >>> 11) & 31,
      (time >>> 5) & 63,
      (time & 31) * 2,
    );
  expect(stamp).toBeGreaterThanOrEqual(before - 2000);
  expect(stamp).toBeLessThanOrEqual(after);
  expect(record.nMethod).toBe(8);
  expect(record.nVersion).toBe(20);
  expect(record.nFlag).toBe(0x808);
  expect(record.nCompressedSize).toBe(0n);
  const releaseOnly = own(new ZipEntry());
  releaseOnly.nTime = 0;
  releaseOnly.nMethod = 0;
  releaseOnly.nSize = -1n;
  releaseOnly.nCompressedSize = 0n;
  releaseOnly.nCrc = 0;
  ZipOutputStream.setEntry(releaseOnly);
  expect(releaseOnly.nSize).toBe(0n);
  expect(releaseOnly.nFlag & 8).toBe(8);
});
it("preserves name validation and source post-LOC name revalidation in CEN", /** Actual public record aliases exercise both source guards. @returns Nothing. */ () => {
  const first = output();
  invalidName(
    /** Invalid native path at LOC. @returns Nothing. */ () =>
      first.writer.writeLOC(entry("../bad", new Uint8Array(), 0)),
  );
  const second = output(),
    record = entry("good", new Uint8Array(), 0);
  second.writer.writeLOC(record);
  second.writer.rawCloseEntry();
  record.sPath.assign(u("../changed"));
  invalidName(/** Original CEN revalidation. @returns Nothing. */ () => second.writer.finish());
});
it("retains source32768-byte name narrowing and corresponding offset arithmetic", /** Complete physical bytes are written despite the negative signed16 header count. @returns Nothing. */ () => {
  const { writer, memory } = output(),
    record = entry("a".repeat(32768), new Uint8Array(), 0);
  writer.writeLOC(record);
  expect(record.nOffset).toBe(65536n);
  writer.rawCloseEntry();
  writer.finish();
  const wire = bytes(memory),
    view = new DataView(wire.buffer);
  expect(view.getInt16(26, true)).toBe(-32768);
  expect(view.getUint32(32798, true)).toBe(0x02014b50);
  let caught = false;
  try {
    reopen(memory);
  } catch (error) {
    if (!(error instanceof ZipException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
});
it.each([0xffffffffn, 0x100000000n])(
  "writes original ZIP64 fields and descriptor boundary for%s",
  /** Public large metadata qualifies header encoding only, not a physical multi-gigabyte archive roundtrip. @param size - Source size. @returns Nothing. */ (
    size,
  ) => {
    const { writer, memory } = output(),
      record = entry("a", new Uint8Array(), 8, true);
    record.nSize = size;
    record.nCompressedSize = size;
    writer.writeLOC(record);
    writer.rawCloseEntry();
    writer.finish();
    const wire = bytes(memory),
      view = new DataView(wire.buffer),
      descriptor = 63,
      descriptorSize = size >= 0x100000000n ? 24 : 16,
      central = descriptor + descriptorSize;
    expect(view.getUint16(28, true)).toBe(32);
    expect(view.getUint16(31, true)).toBe(1);
    expect(view.getUint16(33, true)).toBe(28);
    expect(view.getBigUint64(35, true)).toBe(0n);
    expect(view.getBigUint64(43, true)).toBe(0n);
    expect(view.getUint32(descriptor, true)).toBe(0x08074b50);
    expect(view.getUint32(central, true)).toBe(0x02014b50);
    expect(view.getUint32(central + 20, true)).toBe(0xffffffff);
    expect(view.getUint16(central + 30, true)).toBe(32);
    expect(view.getBigUint64(central + 51, true)).toBe(size);
  },
);
it("writes known ZIP64 LOC sizes and preserves signed negative non-sentinel field casts", /** Original getTruncated only sets its flag for >=FFFFFFFF, not signed negative values. @returns Nothing. */ () => {
  const large = output(),
    record = entry("a", new Uint8Array(), 0);
  record.nSize = 0xffffffffn;
  record.nCompressedSize = 0xffffffffn;
  large.writer.writeLOC(record);
  large.writer.rawCloseEntry();
  large.writer.finish();
  const wire = bytes(large.memory),
    view = new DataView(wire.buffer);
  expect(view.getUint32(18, true)).toBe(0xffffffff);
  expect(view.getBigUint64(35, true)).toBe(0xffffffffn);
  const negative = output(),
    other = entry("a", new Uint8Array(), 0);
  other.nSize = -2n;
  other.nCompressedSize = -2n;
  negative.writer.writeLOC(other);
  negative.writer.rawCloseEntry();
  negative.writer.finish();
  expect(new DataView(bytes(negative.memory).buffer).getUint32(18, true)).toBe(0xfffffffe);
});
it("retains source STORED CRC-1 sentinel behavior and does not synthesize a descriptor", /** Real four-FF payload has CRCFFFFFFFF and reaches the original signed unknown sentinel. @returns Nothing. */ () => {
  const data = Uint8Array.of(255, 255, 255, 255);
  expect(crc32(data)).toBe(0xffffffff);
  const { writer, memory } = output(),
    record = entry("a", data, 0);
  expect(record.nFlag & 8).toBe(8);
  writer.writeLOC(record);
  writer.rawWrite(sequence(data));
  writer.rawCloseEntry();
  writer.finish();
  const wire = bytes(memory),
    view = new DataView(wire.buffer);
  expect(view.getUint32(35, true)).toBe(0x02014b50);
  expect(view.getUint32(35 + 20, true)).toBe(0);
});
it("keeps original release-profile empty finish bytes, EOF admission and caller output lifetime", /** Native assertion-enabled empty-finish domain is unqualified; selected debug0 body emits END. @returns Nothing. */ () => {
  const memory = own(new Reference(new UNOMemoryStream())),
    writer = new ZipOutputStream(memory);
  writer.finish();
  expect(memory.operatorStar().getLength()).toBe(22n);
  const wire = bytes(memory);
  expect(new DataView(wire.buffer).getUint16(10, true)).toBe(0);
  writer.dispose();
  memory.operatorStar().seek(22n);
  memory.operatorStar().writeBytes(sequence(Uint8Array.of(1)));
  expect(memory.operatorStar().getLength()).toBe(23n);
});
it.each(
  [
    "sw/qa/extras/ooxmlexport/data/hello.docx",
    "sw/qa/extras/ooxmlexport/data/strict.docx",
    "sc/qa/unit/data/xlsx/preserve_space.xlsx",
    "sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
  ].flatMap(
    /** Qualify raw-copy and actual compression paths for every pinned package. @param file - Source fixture. @returns Both paths. */ (
      file,
    ) => [
      { file, recompress: false },
      { file, recompress: true },
    ],
  ),
)(
  "reopens every source part from$file through native ZIP output, recompress=$recompress",
  /** Exercises actual raw-copy and Deflater over unchanged source payloads. @param profile - Upstream package and mode. @returns Verification. */ async ({
    file,
    recompress,
  }) => {
    const original = new Uint8Array(
        readFileSync(resolve("../../vendor/libreoffice-reference", file)),
      ),
      source = own(new Reference(new MemoryInputStream(original, original.length))),
      mutex = own(new RtlReference(new RefCountedMutex())),
      empty = own(new RtlReference<never>()),
      input = own(
        new ZipFile(mutex, source, own(new Reference()), true, false, Checks.CheckInsensitive),
      ),
      { writer, memory } = output(),
      buffer = sequence(new Uint8Array(32768));
    const names: string[] = [],
      plaintext = new Map<string, Uint8Array>();
    for (const record of input.GetEntryHash().values()) {
      const name = read(new OUString(record.sPath));
      names.push(name);
      const data = own(input.getDataStream(record, empty, null, mutex)),
        raw = new Uint8Array(Number(record.nSize)),
        reader = data.get();
      if (!(reader instanceof ByteReader))
        throw new Error("original eager data lacks source ByteReader");
      expect(reader.readSomeBytes(raw, raw.length)).toBe(raw.length);
      plaintext.set(name, raw);
      const copy = new ZipEntry(record);
      if (recompress) {
        copy.nMethod = 8;
        copy.nSize = copy.nCompressedSize = -1n;
        copy.nCrc = -1;
      }
      ZipOutputStream.setEntry(copy);
      writer.writeLOC(copy);
      if (recompress) {
        const entryWriter = own(
          new ZipOutputEntry(
            writer.getStream(),
            own(new Reference<XComponentContext>()),
            copy,
            null,
            false,
          ),
        );
        const plainInput = own(new Reference(new MemoryInputStream(raw, raw.length)));
        entryWriter.writeStream(plainInput);
      } else {
        const compressed = own(input.getRawData(record, empty, null, mutex, false));
        for (;;) {
          const count = compressed.operatorStar().readBytes(buffer, 32768);
          writer.rawWrite(buffer);
          if (count !== 32768) break;
        }
      }
      writer.rawCloseEntry();
    }
    writer.finish();
    const wire = bytes(memory),
      native = reopen(memory);
    expect(native.zip.GetEntryHash().size()).toBe(names.length);
    const independent = new ZipReader(new Uint8ArrayReader(wire), {
      useWebWorkers: false,
      checkCrc32: true,
    });
    try {
      const entries = await independent.getEntries();
      expect(
        entries
          .map(
            /** Actual decoded path. @param value - Independent entry. @returns Path. */ (value) =>
              value.filename,
          )
          .sort(),
      ).toEqual([...names].sort());
      for (const item of entries) {
        const expected = plaintext.get(item.filename);
        if (!expected) throw new Error("independent entry unknown");
        if (!item.directory) {
          const actual = await item.getData(new Uint8ArrayWriter());
          expect(Buffer.compare(Buffer.from(actual), Buffer.from(expected))).toBe(0);
        }
        const nativeEntry = native.zip.GetEntryHash().find(u(item.filename));
        expect(nativeEntry?.nSize).toBe(BigInt(expected.length));
      }
    } finally {
      await independent.close();
    }
  },
);

it("writes actual Deflater output and independently reopens completed OOXML part entries", /** Exercise real compression, original headers and native plus independent readers. @returns Completion. */ async () => {
  const { writer, memory } = output(),
    data = new TextEncoder().encode("<w:document>字 repeated</w:document>".repeat(200)),
    compressor = own(new Deflater(-1, true)),
    target = sequence(new Uint8Array(29));
  for (const name of ["word/document.xml", "xl/workbook.xml"]) {
    const record = entry(name, data, 8, true);
    writer.writeLOC(record);
    compressor.setInputSegment(sequence(data));
    compressor.finish();
    let calls = 0;
    while (!compressor.finished()) {
      if (++calls > 10000) throw new Error("compression did not finish");
      const count = compressor.doDeflateSegment(target, target.getLength()),
        chunk = own(new (Sequence.specialize<number>("sal_Int8", 1))(target));
      chunk.realloc(count);
      writer.rawWrite(chunk);
    }
    record.nSize = compressor.getTotalIn();
    record.nCompressedSize = compressor.getTotalOut();
    record.nCrc = crc32(data) | 0;
    writer.rawCloseEntry();
    compressor.reset();
  }
  writer.finish();
  const reader = new ZipReader(new Uint8ArrayReader(bytes(memory)));
  try {
    const entries = await reader.getEntries();
    expect(
      entries.map(
        /** Public ZIP names. @param value - Independent entry. @returns Name. */ (value) =>
          value.filename,
      ),
    ).toEqual(["word/document.xml", "xl/workbook.xml"]);
    for (const item of entries) {
      if (item.directory) throw new Error("expected compressed file entry");
      expect([...(await item.getData(new Uint8ArrayWriter()))]).toEqual([...data]);
    }
  } finally {
    await reader.close();
  }
  const native = reopen(memory);
  for (const name of ["word/document.xml", "xl/workbook.xml"]) {
    const record = native.zip.GetEntryHash().find(u(name));
    if (!record) throw new Error("native ZIP entry missing");
    const stream = own(native.zip.getDataStream(record, native.data, null, native.mutex)),
      input = stream.get(),
      actual = new Uint8Array(data.length);
    if (!(input instanceof ByteReader)) throw new Error("expected real ByteReader");
    expect(input.readSomeBytes(actual, actual.length)).toBe(data.length);
    expect([...actual]).toEqual([...data]);
  }
});
