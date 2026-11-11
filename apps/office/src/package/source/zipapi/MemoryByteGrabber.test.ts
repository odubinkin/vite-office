/** @fileoverview Original borrowed memory-reader constructors, literal integer widths, cursor/pointer arithmetic and short-field semantics; actual CEN integration is exercised through real ZIP archives. */
import { expect, it } from "vitest";
import { MemoryByteGrabber } from "./MemoryByteGrabber";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ZipFile } from "./ZipFile";
import { ZipOutputStream } from "./ZipOutputStream";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
const fields = [
  ["ReadUInt8", [127], 127],
  ["ReadUInt8", [128], -128],
  ["ReadUInt8", [255], -1],
  ["ReadInt16", [0, 128], -32768],
  ["ReadInt16", [255, 127], 32767],
  ["ReadInt16", [255, 255], -1],
  ["ReadUInt16", [0, 128], -32768],
  ["ReadUInt16", [255, 127], 32767],
  ["ReadUInt16", [255, 255], -1],
  ["ReadInt32", [0, 0, 0, 128], -2147483648],
  ["ReadInt32", [255, 255, 255, 255], -1],
  ["ReadUInt32", [239, 205, 171, 137], 0x89abcdef],
  ["ReadUInt32", [255, 255, 255, 255], 0xffffffff],
  ["ReadUInt64", [239, 205, 171, 137, 103, 69, 35, 1], 0x0123456789abcdefn],
  ["ReadUInt64", [255, 255, 255, 255, 255, 255, 255, 255], 0xffffffffffffffffn],
] as const;
it.each(fields)(
  "reads literal %s with original return width",
  /** Integer names do not override their declared signed return types. @param method - Source method. @param octets - Encoded field. @param expected - Literal scalar. @returns Nothing. */ (
    method,
    octets,
    expected,
  ) => {
    const storage = Int8Array.from([77, ...octets, 66]),
      reader = new MemoryByteGrabber([storage, 1], octets.length);
    expect(reader[method]()).toBe(expected);
    expect(reader.remainingSize()).toBe(0);
    expect(reader.getCurrentPos()).toEqual([storage, octets.length + 1]);
    expect(reader[method]()).toBe(typeof expected === "bigint" ? 0n : 0);
    expect(reader.getCurrentPos()[1]).toBe(octets.length + 1);
  },
);
it.each([
  ["ReadUInt8", 1],
  ["ReadInt16", 2],
  ["ReadUInt16", 2],
  ["ReadInt32", 4],
  ["ReadUInt32", 4],
  ["ReadUInt64", 8],
] as const)(
  "does not advance a short %s",
  /** The buffer length, not physical trailing bytes, bounds each field. @param method - Source method. @param width - Required count. @returns Nothing. */ (
    method,
    width,
  ) => {
    const storage = new Uint8Array(10).fill(255);
    for (const available of [0, width - 1]) {
      const reader = new MemoryByteGrabber([storage, 1], available);
      expect(reader[method]()).toBe(width === 8 ? 0n : 0);
      expect(reader.remainingSize()).toBe(available);
      expect(reader.getCurrentPos()).toEqual([storage, 1]);
    }
  },
);
it("borrows the actual Sequence pointer without acquiring or copying its storage", /** Caller retains the owner; getArray changes the same initialized lvalues because no Sequence copy was introduced. @returns Nothing. */ () => {
  const bytes = new Bytes(4),
    cells = bytes.getArray() as SequenceElements;
  (cells.get(0) as [number])[0] = 1;
  (cells.get(1) as [number])[0] = 2;
  const reader = new MemoryByteGrabber(bytes);
  try {
    expect(reader.getCurrentPos()[0]).toBe(bytes.getConstArray());
    expect(reader.ReadInt16()).toBe(513);
    reader.skipBytes(-2);
    (cells.get(0) as [number])[0] = -1;
    (cells.get(1) as [number])[0] = -1;
    expect(reader.ReadUInt16()).toBe(-1);
    expect(reader.remainingSize()).toBe(2);
    const nested = new MemoryByteGrabber(reader.getCurrentPos(), 2);
    expect(nested.ReadUInt16()).toBe(0);
    expect(reader.remainingSize()).toBe(2);
  } finally {
    bytes.dispose();
  }
});
it("preserves unchecked skips and signed remainders without inventing seek exceptions", /** Keep all formed pointers within the actual three-byte allocation, including one-past. @returns Nothing. */ () => {
  const storage = Int8Array.of(1, 2, 3),
    reader = new MemoryByteGrabber([storage, 0], 2);
  reader.skipBytes(3);
  expect(reader.remainingSize()).toBe(-1);
  expect(reader.getCurrentPos()).toEqual([storage, 3]);
  expect(reader.ReadUInt8()).toBe(0);
  reader.skipBytes(-2);
  expect(reader.ReadUInt8()).toBe(2);
  expect(reader.remainingSize()).toBe(0);
});
it.each([
  [28, "unexpected name length"],
  [30, "unexpected extra header info length"],
  [32, "unexpected comment length"],
] as const)(
  "applies native signed CEN length at field %i",
  /** Actual external ZIP bytes, without private parser state. @param field - CEN field offset. @param message - Native diagnostic retained by the bounded host envelope. @returns Nothing. */ (
    field,
    message,
  ) => {
    const output = new ZipOutputStream();
    output.putNextEntry("a", new Uint8Array());
    const bytes = output.finish(),
      view = new DataView(bytes.buffer),
      central = view.getUint32(bytes.length - 6, true);
    view.setUint16(central + field, 0x8000, true);
    expect(
      /** Parses actual changed CEN bytes. @returns Archive. */ () => new ZipFile(bytes),
    ).toThrow(message);
  },
);
it("rejects native negative signed filename length while retaining the32767-byte boundary", /** Current bounded writer can produce larger unsigned ZIP names; source CEN parser rejects their signed length. @returns Nothing. */ () => {
  const accepted = new ZipOutputStream(),
    rejected = new ZipOutputStream();
  accepted.putNextEntry("a".repeat(32767), new Uint8Array());
  rejected.putNextEntry("a".repeat(32768), new Uint8Array());
  expect(new ZipFile(accepted.finish()).getEntryNames()[0]?.length).toBe(32767);
  expect(
    /** Parses source-negative32768-byte name length. @returns Archive. */ () =>
      new ZipFile(rejected.finish()),
  ).toThrow("unexpected name length");
});
it("uses source UTF8 conversion for actual non-ASCII names without the UTF8 flag", /** Native readCEN explicitly ignores that flag for name decoding. @returns Nothing. */ async () => {
  const output = new ZipOutputStream(),
    name = "文档/таблица.xml";
  output.putNextEntry(name, new Uint8Array([65]));
  const bytes = output.finish(),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  view.setUint16(6, 0, true);
  view.setUint16(central + 8, 0, true);
  const archive = new ZipFile(bytes);
  expect(archive.getEntryNames()).toEqual([name]);
  expect(await archive.readTextEntry(name)).toBe("A");
});
