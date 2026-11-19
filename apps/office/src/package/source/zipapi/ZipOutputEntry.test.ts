/** @fileoverview Original synchronous entry compression/CRC/borrowed-record contracts over actual native streams and independent system zlib. */
import { crc32, inflateRawSync } from "node:zlib";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { OOutputStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { ZipEntry } from "../../inc/ZipEntry";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { ZipOutputEntry, ZipOutputEntryBase } from "./ZipOutputEntry";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
beforeAll(
  /** Initialize actual native types/exception ABI. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
/** Deterministic nontrivial input without an RNG provider. @param length - Native input length. @returns Payload. */
function payload(length: number): Uint8Array {
  const result = new Uint8Array(length);
  for (let i = 0; i < length; ++i) result[i] = (i * 73) ^ (i >> 4);
  return result;
}
/** Native input sequence. @param input - Actual source image. @returns Owner. */
function sequence(input: Uint8Array): Sequence<number> {
  const result = own(new Bytes(input.length)),
    cells = result.getArray() as SequenceElements;
  for (let i = 0; i < input.length; ++i)
    (cells.get(i) as [number])[0] = ((input[i] as number) << 24) >> 24;
  return result;
}
/** Source record with explicit caller-provided values. @param descriptor - Original bit3. @returns Owner. */
function record(descriptor: boolean): ZipEntry {
  const entry = own(new ZipEntry());
  entry.nMethod = 8;
  entry.nFlag = descriptor ? 8 : 0;
  entry.nSize = 123n;
  entry.nCompressedSize = 456n;
  entry.nCrc = 789;
  return entry;
}
/** Actual output image, preserving the source cursor after observation. @param memory - Real UNO storage. @returns Emitted bytes. */
function bytes(memory: Reference<UNOMemoryStream>): Uint8Array {
  const value = memory.operatorStar(),
    position = value.getPosition(),
    result = new Uint8Array(Number(value.getLength()));
  value.seek(0n);
  value.readSomeBytes(result, result.length);
  value.seek(position);
  return result;
}
it.each([0, 1, 32767, 32768, 32769, 65536])(
  "compresses original readBytes boundaries at%s bytes without closing either stream",
  /** Original loop includes EOF for exact32768 multiples. @param length - Source length. @returns Nothing. */ (
    length,
  ) => {
    const data = payload(length),
      input = own(new Reference(new MemoryInputStream(data, data.length))),
      memory = own(new Reference(new UNOMemoryStream())),
      entry = record(true),
      writer = own(
        new ZipOutputEntry(memory, own(new Reference<XComponentContext>()), entry, null, false),
      );
    expect(writer).toBeInstanceOf(ZipOutputEntryBase);
    expect(writer.getZipEntry()).toBe(entry);
    expect(writer.getZipPackageStream()).toBeNull();
    expect(writer.isEncrypt()).toBe(false);
    writer.writeStream(input);
    const packed = bytes(memory);
    expect([...inflateRawSync(packed)]).toEqual([...data]);
    expect(entry.nSize).toBe(BigInt(length));
    expect(entry.nCompressedSize).toBe(BigInt(packed.length));
    expect(entry.nCrc).toBe(crc32(data) | 0);
    expect(input.operatorStar().available()).toBe(0);
    input.operatorStar().seek(0n);
    expect(input.operatorStar().available()).toBe(length);
    memory.operatorStar().writeBytes(sequence(Uint8Array.of(1)));
    expect(memory.operatorStar().getLength()).toBe(BigInt(packed.length + 1));
  },
);
it("keeps known size and CRC even on mismatch, correcting only compressed size", /** Release-mode OSL_FAIL diagnostics do not repair caller metadata. @returns Nothing. */ () => {
  const memory = own(new Reference(new UNOMemoryStream())),
    entry = record(false),
    writer = own(
      new ZipOutputEntry(memory, own(new Reference<XComponentContext>()), entry, null, false),
    ),
    data = payload(64001);
  writer.write(sequence(data.subarray(0, 32768)));
  writer.write(sequence(new Uint8Array()));
  writer.write(sequence(data.subarray(32768)));
  writer.closeEntry();
  expect(entry.nSize).toBe(123n);
  expect(entry.nCrc).toBe(789);
  const packed = bytes(memory);
  expect(entry.nCompressedSize).toBe(BigInt(packed.length));
  expect([...inflateRawSync(packed)]).toEqual([...data]);
  writer.write(sequence(data));
  writer.closeEntry();
  expect(entry.nCompressedSize).toBe(BigInt(packed.length));
  expect([...inflateRawSync(bytes(memory).subarray(packed.length))]).toEqual([...data]);
});
it("resets both CRC and deflate between source closeEntry calls on the same borrowed record", /** Reuse retains the same stream, context and record owners. @returns Nothing. */ () => {
  const memory = own(new Reference(new UNOMemoryStream())),
    entry = record(true),
    writer = own(
      new ZipOutputEntry(
        memory,
        own(new Reference<XComponentContext>()),
        entry,
        null,
        false,
        false,
      ),
    );
  let offset = 0;
  for (const length of [1000, 0, 65537]) {
    const data = payload(length);
    writer.write(sequence(data));
    writer.closeEntry();
    const packed = bytes(memory).subarray(offset);
    expect([...inflateRawSync(packed)]).toEqual([...data]);
    expect(entry.nSize).toBe(BigInt(length));
    expect(entry.nCompressedSize).toBe(BigInt(packed.length));
    expect(entry.nCrc).toBe(crc32(data) | 0);
    offset += packed.length;
  }
});
it("propagates a genuine output error before metadata/reset, and skips writes after deflate has finished", /** Real readonly SvMemoryStream rejects the compressed final bytes; no output provider or status injection. @returns Nothing. */ () => {
  const storage = own(new SvMemoryStream(new Uint8Array(), 0, StreamMode.READ)),
    output = own(new Reference(new OOutputStreamWrapper(storage))),
    entry = record(true),
    writer = own(
      new ZipOutputEntry(output, own(new Reference<XComponentContext>()), entry, null, false),
    );
  writer.write(sequence(payload(10)));
  let caught = false;
  try {
    writer.closeEntry();
  } catch (error) {
    if (!(error instanceof BufferSizeExceededException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
  expect(entry.nSize).toBe(123n);
  expect(entry.nCompressedSize).toBe(456n);
  expect(entry.nCrc).toBe(789);
  writer.write(sequence(payload(5)));
  // Source does not retry the failed output once deflate reports stream end.
  writer.closeEntry();
  expect(entry.nSize).toBe(10n);
  expect(entry.nCrc).toBe(crc32(payload(10)) | 0);
});
