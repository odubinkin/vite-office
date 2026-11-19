/** @fileoverview Original ZipPackageBuffer contracts over real UNO/Sequence, including native ZIP producer/consumer and source capacity bookkeeping. No injected stream or private-state access. */
import { beforeAll, afterEach, it, expect } from "vitest";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import { XSeekable } from "../../../udkapi/com/sun/star/io/XSeekable";
import { BufferSizeExceededException } from "../../../cppu/inc/com/sun/star/io/BufferSizeExceededException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { Reference as RtlReference } from "../../../sal/inc/rtl/ref";
import { RefCountedMutex } from "../../../comphelper/inc/refcountedmutex";
import { ZipPackageBuffer } from "./ZipPackageBuffer";
import { ZipOutputStream } from "../zipapi/ZipOutputStream";
import { ZipFile, Checks } from "../zipapi/ZipFile";
import { ZipEntry } from "../../inc/ZipEntry";
import { n_ConstBufferSize } from "../../inc/PackageConstants";
import { crc32 } from "node:zlib";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeZlib } from "../../../external/zlib/zlib";
beforeAll(
  /** Initialize actual component runtime. @returns Completion. */ async () => {
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
/** Actual native byte values. @param values - Input. @returns Sequence. */
function sequence(values: readonly number[]): Sequence<number> {
  const result = own(new Bytes(values.length)),
    target = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i) (target.get(i) as [number])[0] = values[i] as number;
  return result;
}
/** Read initialized native byte cells. @param data - Source. @returns Values. */
function values(data: Sequence<number>): number[] {
  const source = data.getConstArray() as SequenceElements,
    result: number[] = [];
  for (let i = 0; i < data.getLength(); ++i) result.push((source.get(i) as [number])[0]);
  return result;
}
/** Actual component and owning reference. @returns Component. */
function buffer(): ZipPackageBuffer {
  const reference = own(new Reference(new ZipPackageBuffer()));
  return reference.operatorStar();
}
it("publishes all original UNO interfaces and lazily initializes even on an empty first write", /** Actual UNO query and public Sequence size. @returns Nothing. */ () => {
  const b = buffer(),
    ref = own(new Reference(b));
  expect(own(new Reference(ref, UNO_QUERY, XInputStream.static_type)).get()).toBe(b);
  expect(own(new Reference(ref, UNO_QUERY, XOutputStream.static_type)).get()).toBe(b);
  expect(own(new Reference(ref, UNO_QUERY, XSeekable.static_type)).get()).toBe(b);
  expect(b.getSequence().getLength()).toBe(0);
  expect(b.getLength()).toBe(0n);
  b.writeBytes(sequence([]));
  expect(b.getSequence().getLength()).toBe(n_ConstBufferSize);
  expect(b.getLength()).toBe(0n);
  const out = sequence([9]);
  expect(b.readBytes(out, 1)).toBe(0);
  expect(out.getLength()).toBe(0);
});
it("retains a shared cursor across no-op closes and flush, bounds skips and overwrites without shortening", /** Source close semantics differ from UNOMemoryStream. @returns Nothing. */ () => {
  const b = buffer(),
    out = sequence([]);
  b.writeBytes(sequence([1, 2, 3, 4]));
  b.seek(1n);
  b.writeBytes(sequence([-1, -128]));
  expect(b.getLength()).toBe(4n);
  expect(b.getPosition()).toBe(3n);
  b.closeOutput();
  b.closeInput();
  b.flush();
  expect(b.getPosition()).toBe(3n);
  expect(b.available()).toBe(1);
  expect(b.readSomeBytes(out, 9)).toBe(1);
  expect(values(out)).toEqual([4]);
  b.seek(0n);
  b.skipBytes(1);
  expect(b.readBytes(out, 2)).toBe(2);
  expect(values(out)).toEqual([-1, -128]);
  b.skipBytes(99);
  expect(b.getPosition()).toBe(4n);
  expect(b.available()).toBe(0);
  expect(b.readBytes(out, 0)).toBe(0);
});
it("grows using end plus incoming length even during overwrite and preserves Sequence copy-on-write", /** Actual public capacity and copied Sequence. @returns Nothing. */ () => {
  const b = buffer(),
    data = own(new Bytes(n_ConstBufferSize));
  b.writeBytes(data);
  const snapshot = own(new Bytes(b.getSequence()));
  b.seek(0n);
  b.writeBytes(sequence([7]));
  expect(b.getSequence().getLength()).toBe(n_ConstBufferSize * 2);
  expect(b.getLength()).toBe(BigInt(n_ConstBufferSize));
  expect(values(snapshot)[0]).toBe(0);
  const large = own(new Bytes(n_ConstBufferSize * 5));
  b.seek(b.getLength());
  b.writeBytes(large);
  expect(b.getSequence().getLength()).toBe(n_ConstBufferSize * 8);
  expect(b.getLength()).toBe(BigInt(n_ConstBufferSize * 6));
});
it("keeps explicit realloc independent of logical end and capacity bookkeeping", /** Source public inline method only changes the Sequence. @returns Nothing. */ () => {
  const b = buffer();
  b.realloc(9);
  expect(b.getSequence().getLength()).toBe(9);
  b.writeBytes(sequence([3]));
  expect(b.getSequence().getLength()).toBe(n_ConstBufferSize);
  b.realloc(12);
  expect(b.getLength()).toBe(1n);
  expect(b.getPosition()).toBe(1n);
  expect(b.getSequence().getLength()).toBe(12);
});
it("throws original exception types, component Context and seek argument1 without moving", /** Actual generated exceptions. @returns Nothing. */ () => {
  const b = buffer(),
    out = sequence([]);
  for (const operation of [
    /** Negative read. @returns Nothing. */ () => b.readBytes(out, -1),
    /** Negative skip. @returns Nothing. */ () => b.skipBytes(-1),
  ]) {
    let caught = false;
    try {
      operation();
    } catch (e) {
      if (!(e instanceof BufferSizeExceededException)) throw e;
      expect(e.Context.get()).toBe(b);
      e.dispose();
      caught = true;
    }
    expect(caught).toBe(true);
  }
  for (const position of [-1n, 1n]) {
    let caught = false;
    try {
      b.seek(position);
    } catch (e) {
      if (!(e instanceof IllegalArgumentException)) throw e;
      expect(e.Context.is()).toBe(false);
      expect(e.ArgumentPosition).toBe(1);
      e.dispose();
      caught = true;
    }
    expect(caught).toBe(true);
  }
  expect(b.getPosition()).toBe(0n);
});
it("serves actual ZipOutputStream and ZipFile through original Sequence-only UNO IO", /** Complete container write/read, without a ByteReader substitute. @returns Nothing. */ () => {
  const b = buffer(),
    ref = own(new Reference(b)),
    writer = own(new ZipOutputStream(ref)),
    entry = new ZipEntry(),
    bytes = new Uint8Array([65, 66, 67]);
  entry.sPath.assign(u("word/document.xml"));
  entry.nTime = 0;
  entry.nMethod = 0;
  entry.nSize = 3n;
  entry.nCompressedSize = 3n;
  entry.nCrc = crc32(bytes) | 0;
  ZipOutputStream.setEntry(entry);
  writer.writeLOC(entry);
  writer.rawWrite(sequence([...bytes]));
  writer.rawCloseEntry();
  writer.finish();
  b.seek(0n);
  const mutex = own(new RtlReference(new RefCountedMutex())),
    zip = own(new ZipFile(mutex, ref, own(new Reference()), true, false, Checks.CheckInsensitive)),
    data = own(new RtlReference<never>()),
    record = zip.GetEntryHash().find(u("word/document.xml"));
  if (!record) throw new Error("native written entry absent");
  const stream = own(zip.getDataStream(record, data, null, mutex)),
    out = sequence([]);
  expect(stream.operatorStar().readBytes(out, 99)).toBe(3);
  expect(values(out)).toEqual([65, 66, 67]);
});
