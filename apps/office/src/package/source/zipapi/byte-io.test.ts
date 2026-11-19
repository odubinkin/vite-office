/** @fileoverview Native ZIP binary readers/writers over actual source stream owners, pointer contracts, scalar edge/short-read behavior and unchanged pinned DOCX/XLSX local-file headers. No fake stream or archive provider. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeAll, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { ByteGrabber } from "./ByteGrabber";
import { ByteChucker } from "./ByteChucker";
import { MemoryByteGrabber } from "./MemoryByteGrabber";
import { SvMemoryStream, StreamMode } from "../../../tools/source/stream/stream.native";
import { OInputStreamWrapper, OStreamWrapper } from "../../../unotools/source/streaming/streamwrap";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ByteReader, ByteWriter } from "../../../comphelper/inc/bytereader";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { SwitchablePersistenceStream } from "../xstor/switchpersistencestream";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { initializeRuntime } from "../../../external/emscripten/runtime";
beforeAll(initializeRuntime);
beforeAll(initializeExceptionAbi);
afterEach(releaseDomScope);
/** Source native scalar fixture. @param values - Signed or unsigned input bit patterns. @returns Actual native sequence. */
function bytes(values: readonly number[]): Sequence<number> {
  const result = own(new (Sequence.specialize<number>("sal_Int8", 1))(values.length)),
    fields = result.getArray() as SequenceElements;
  for (let i = 0; i < values.length; ++i)
    (fields.get(i) as [number])[0] = ((values[i] as number) << 24) >> 24;
  return result;
}
/** Actual borrowed initialized memory and native full stream wrapper. @param values - File bytes. @returns Actual source wrapper. */
function input(values: Uint8Array): Reference<OStreamWrapper> {
  return own(
    new Reference(
      new OStreamWrapper(own(new SvMemoryStream(values, values.length, StreamMode.READ))),
    ),
  );
}
it("writes original little-endian scalar byte images through cached native Sequence addresses", /** Independent expected bytes validate output rather than only reading it back through the same decoder. @returns Nothing. */ () => {
  const memory = own(new SvMemoryStream()),
    wrapper = own(new Reference(new OStreamWrapper(memory))),
    writer = own(new ByteChucker(wrapper));
  writer.WriteInt16(-2);
  writer.WriteInt32(-2147483648);
  writer.WriteUInt32(0xfedcba98);
  writer.WriteUInt64(0xfedcba9876543210n);
  writer.WriteBytes(bytes([9, 8]));
  expect(writer.GetPosition()).toBe(20n);
  expect(memory.GetSize()).toBe(20n);
  expect([...(memory.GetData() as Uint8Array).subarray(0, 20)]).toEqual([
    254, 255, 0, 0, 0, 128, 152, 186, 220, 254, 16, 50, 84, 118, 152, 186, 220, 254, 9, 8,
  ]);
  const reader = own(new ByteGrabber(wrapper));
  reader.seek(0n);
  expect(reader.ReadInt16()).toBe(-2);
  expect(reader.ReadInt32()).toBe(-2147483648);
  expect(reader.ReadUInt32()).toBe(0xfedcba98);
  expect(reader.ReadUInt64()).toBe(0xfedcba9876543210n);
  expect(reader.getPosition()).toBe(18n);
  expect(reader.getLength()).toBe(20n);
});
it("retains source fast ByteReader RTTI, short scalar reads consuming available bytes and replacement", /** Real native streams establish every read/seek and source lifetime. @returns Nothing. */ () => {
  const first = input(Uint8Array.of(255)),
    reader = own(new ByteGrabber(first));
  expect(first.get() instanceof ByteReader).toBe(true);
  expect(reader.ReadUInt16()).toBe(0);
  expect(reader.getPosition()).toBe(1n);
  const second = input(Uint8Array.of(1, 2, 3, 4, 5, 6, 7));
  reader.setInputStream(second);
  expect(reader.ReadUInt64()).toBe(0n);
  expect(reader.getPosition()).toBe(7n);
  reader.seek(0n);
  expect(reader.ReadUInt32()).toBe(0x04030201);
  const raw = new Uint8Array(4);
  expect(reader.readBytes(raw, 4)).toBe(3);
  expect([...raw]).toEqual([5, 6, 7, 0]);
  const memory = own(new SvMemoryStream(Uint8Array.of(9), 1, StreamMode.READ)),
    unseekable = own(new Reference(new OInputStreamWrapper(memory)));
  reader.setInputStream(unseekable);
  for (const action of [
    /** Missing source seek. @returns Nothing. */ () => reader.seek(0n),
    /** Missing source position. @returns Offset. */ () => reader.getPosition(),
    /** Missing source length. @returns Length. */ () => reader.getLength(),
  ]) {
    let caught = false;
    try {
      action();
    } catch (error) {
      if (!(error instanceof IOException)) throw error;
      caught = true;
      error.dispose();
    }
    expect(caught).toBe(true);
  }
});
it("retains memory reader signed UInt8/UInt16 result types, borrowing, short reads and unchecked skip", /** Actual source declaration returns signed values even when method names suggest unsigned. @returns Nothing. */ () => {
  const sequence = bytes([
      255, 255, 255, 0, 0, 0, 128, 255, 255, 255, 255, 16, 50, 84, 118, 152, 186, 220, 254,
    ]),
    reader = new MemoryByteGrabber(sequence);
  expect(reader.getCurrentPos()).toEqual([sequence.getConstArray(), 0]);
  expect(reader.ReadUInt8()).toBe(-1);
  expect(reader.ReadUInt16()).toBe(-1);
  expect(reader.ReadInt32()).toBe(-2147483648);
  expect(reader.ReadUInt32()).toBe(0xffffffff);
  expect(reader.ReadUInt64()).toBe(0xfedcba9876543210n);
  expect(reader.remainingSize()).toBe(0);
  expect(reader.ReadUInt64()).toBe(0n);
  expect(reader.remainingSize()).toBe(0);
  reader.skipBytes(-2);
  expect(reader.ReadInt16()).toBe(-292);
  reader.skipBytes(3);
  expect(reader.remainingSize()).toBe(-3);
  const raw = Uint8Array.of(0, 255, 255),
    pointer = new MemoryByteGrabber(raw.subarray(1, 2), 2);
  expect(pointer.ReadUInt16()).toBe(-1);
});
it("supports native typed byte pointers through every existing real ByteReader/Writer chain", /** Pointer views preserve byteOffset/underlying storage and signed sal_Int8 bits, with no Sequence-only intermediate provider. @returns Nothing. */ () => {
  const source = own(
      new Reference(new MemoryInputStream(Uint8Array.of(0, 128, 255, 127).subarray(1, 2), 3)),
    ),
    target = new Uint8Array(5);
  expect(source.operatorStar().readSomeBytes(target.subarray(1, 2), 3)).toBe(3);
  expect([...target]).toEqual([0, 128, 255, 127, 0]);
  const memory = own(new Reference(new UNOMemoryStream()));
  expect(memory.get() instanceof ByteWriter).toBe(true);
  memory.operatorStar().writeBytes(Uint8Array.of(128, 255, 127), 3);
  memory.operatorStar().seek(0n);
  const persistence = own(new Reference(new SwitchablePersistenceStream(memory, "stream"))),
    input = own(persistence.operatorStar().getInputStream()),
    raw = new Int8Array(3);
  expect((input.get() as unknown as ByteReader).readSomeBytes(raw, 3)).toBe(3);
  expect([...raw]).toEqual([-128, -1, 127]);
});
it.each([
  "sw/qa/extras/ooxmlexport/data/hello.docx",
  "sw/qa/extras/ooxmlexport/data/strict.docx",
  "sc/qa/unit/data/xlsx/preserve_space.xlsx",
  "sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
])(
  "reads actual original local-file binary headers from%s",
  /** This proves genuine archive byte IO only, not native directory/decompression/model import acceptance. @param file - Pinned package. @returns Nothing. */ (
    file,
  ) => {
    const contents = new Uint8Array(
        readFileSync(resolve("../../vendor/libreoffice-reference", file)),
      ),
      reader = own(new ByteGrabber(input(contents))),
      independent = new DataView(contents.buffer, contents.byteOffset, contents.length);
    expect(reader.ReadUInt32()).toBe(0x04034b50);
    for (const offset of [4, 6, 8, 10, 12])
      expect(reader.ReadUInt16()).toBe(independent.getUint16(offset, true));
    for (const offset of [14, 18, 22])
      expect(reader.ReadUInt32()).toBe(independent.getUint32(offset, true));
    const nameLength = reader.ReadUInt16(),
      extraLength = reader.ReadUInt16(),
      name = new Int8Array(nameLength);
    expect(nameLength).toBe(independent.getUint16(26, true));
    expect(extraLength).toBe(independent.getUint16(28, true));
    expect(reader.readBytes(name, nameLength)).toBe(nameLength);
    expect([...new Uint8Array(name.buffer)]).toEqual([...contents.subarray(30, 30 + nameLength)]);
    expect(reader.getPosition()).toBe(BigInt(30 + nameLength));
    expect(reader.getLength()).toBe(BigInt(contents.length));
  },
);
