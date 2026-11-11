/** @fileoverview Native ZIP/ZIP64 END and extra-field boundaries on real archives; genuine primitive memory-input and SDK exception owners. */
import { readFileSync } from "node:fs";
import { URL as NodeURL } from "node:url";
import { expect, it } from "vitest";
import { ZipFile } from "./ZipFile";
import { ZipOutputStream } from "./ZipOutputStream";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ZipException, getCppuType } from "../../../offapi/com/sun/star/packages/zip/ZipException";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { OUString } from "../../../sal/inc/rtl/ustring";
const Bytes = Sequence.specialize<number>("sal_Int8", 1);
/** Reads unchanged committed ZIP64 source data without depending on ignored vendor checkout. @returns Actual archive. */
function sourceZip64(): Uint8Array {
  return new Uint8Array(
    readFileSync(new NodeURL("../../qa/cppunit/data/tdf163341.ods", import.meta.url)),
  );
}
/** Exact native string observation. @param value - Owned/borrowed value. @returns UTF16. */
function text(value: OUString): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Builds literal little-endian64 fields independently of production readers. @param value - Field. @returns Octets. */
function u64(value: bigint): Uint8Array {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, value, true);
  return bytes;
}
/** Joins authored field bytes. @param arrays - Actual arrays. @returns Combined bytes. */
function join(...arrays: Uint8Array[]): Uint8Array {
  const result = new Uint8Array(
    arrays.reduce(
      /** Counts field bytes. @param total - Previous. @param bytes - Field. @returns Sum. */ (
        total,
        bytes,
      ) => total + bytes.length,
      0,
    ),
  );
  let at = 0;
  for (const bytes of arrays) {
    result.set(bytes, at);
    at += bytes.length;
  }
  return result;
}
/** Creates one native TLV extra field. @param id - Header ID. @param payload - Actual field payload. @param advertised - Optional source-declared size. @returns Raw bytes. */
function extra(id: number, payload: Uint8Array, advertised = payload.length): Uint8Array {
  const header = new Uint8Array(4),
    view = new DataView(header.buffer);
  view.setUint16(0, id, true);
  view.setUint16(2, advertised, true);
  return join(header, payload);
}
/** Inserts real CEN/LOC extras into a valid archive, updating all physical offsets and sizes. @param cenExtra - CEN fields. @param locExtra - LOC fields. @param payload - Actual entry bytes. @returns Complete actual ZIP. */
function withExtra(
  cenExtra: Uint8Array,
  locExtra: Uint8Array = new Uint8Array(),
  payload: Uint8Array = new Uint8Array([65]),
): Uint8Array {
  const output = new ZipOutputStream();
  output.putNextEntry("entry", payload);
  const base = output.finish(),
    view = new DataView(base.buffer),
    end = base.length - 22,
    central = view.getUint32(end + 16, true),
    nameEnd = 35;
  const result = join(
    base.subarray(0, nameEnd),
    locExtra,
    base.subarray(nameEnd, central),
    base.subarray(central, end),
    cenExtra,
    base.subarray(end),
  );
  const changed = new DataView(result.buffer),
    newCentral = central + locExtra.length,
    newEnd = end + locExtra.length + cenExtra.length;
  changed.setUint16(28, locExtra.length, true);
  changed.setUint16(newCentral + 30, cenExtra.length, true);
  changed.setUint32(newEnd + 12, view.getUint32(end + 12, true) + cenExtra.length, true);
  changed.setUint32(newEnd + 16, newCentral, true);
  return result;
}
const bad64 = [
  ["locator", 4, 4, 1n, "invalid Zip64 end locator (disk)"],
  ["locator", 8, 8, 0xffffffffffffffffn, "invalid Zip64 end locator (offset)"],
  ["locator", 16, 4, 2n, "invalid Zip64 end locator (number of disks)"],
  ["directory", 0, 4, 0n, "invalid Zip64 end (signature)"],
  ["directory", 4, 8, 0n, "invalid Zip64 end (size)"],
  ["directory", 16, 4, 1n, "invalid Zip64 end (disk)"],
  ["directory", 20, 4, 1n, "invalid Zip64 end (directory disk)"],
  ["directory", 24, 8, 0n, "invalid Zip64 end (entries)"],
  ["end", 12, 4, 1n, "inconsistent Zip/Zip64 end (size)"],
  ["end", 16, 4, 1n, "inconsistent Zip/Zip64 end (offset)"],
] as const;
it.each(bad64)(
  "rejects %s field%i using source %s-byte scalar",
  /** Actual malformed external record, no private parser state. @param record - Source record. @param offset - Field. @param width - Scalar width. @param value - Mutated bits. @param message - Source diagnostic. @returns Nothing. */ (
    record,
    offset,
    width,
    value,
    message,
  ) => {
    const bytes = sourceZip64(),
      view = new DataView(bytes.buffer),
      end = bytes.length - 22,
      locator = end - 20,
      directory = Number(view.getBigUint64(locator + 8, true)),
      at = (record === "locator" ? locator : record === "directory" ? directory : end) + offset;
    if (width === 8) view.setBigUint64(at, value, true);
    else view.setUint32(at, Number(value), true);
    expect(
      /** Parses actual malformed ZIP64 metadata. @returns Archive. */ () => new ZipFile(bytes),
    ).toThrow(message);
  },
);
it("retains source cross-record entry consistency and signed64 CEN arithmetic", /** Native comparisons are exercised with actual complete records. @returns Nothing. */ () => {
  const entries = sourceZip64(),
    entriesView = new DataView(entries.buffer),
    end = entries.length - 22;
  entriesView.setUint16(end + 8, 3, true);
  entriesView.setUint16(end + 10, 3, true);
  expect(
    /** Cross-record mismatch after matching disk counts. @returns Archive. */ () =>
      new ZipFile(entries),
  ).toThrow("inconsistent Zip/Zip64 end (entries)");
  for (const size of [1n, 0x7fffffffffffffffn, 0xffffffffffffffffn]) {
    const bytes = sourceZip64(),
      view = new DataView(bytes.buffer),
      e = bytes.length - 22,
      d = Number(view.getBigUint64(e - 12, true));
    view.setUint32(e + 12, 0xffffffff, true);
    view.setBigUint64(d + 40, size, true);
    expect(
      /** Rejects invalid signed sum/size correspondence. @returns Archive. */ () =>
        new ZipFile(bytes),
    ).toThrow("bad central directory size");
  }
});
it("preserves the original END directory-disk sentinel operand and ignored comment count", /** Surprising source checks are not normalized into a stricter disk/comment policy. @returns Nothing. */ () => {
  const bytes = sourceZip64(),
    view = new DataView(bytes.buffer),
    end = bytes.length - 22;
  view.setUint16(end + 4, 0xffff, true);
  view.setUint16(end + 6, 7, true);
  view.setUint16(end + 20, 123, true);
  expect(new ZipFile(bytes).hasEntry("content.xml")).toBe(true);
  expect(
    /** No END signature exists in these actual bytes. @returns Archive. */ () =>
      new ZipFile(new Uint8Array(30)),
  ).toThrow("Zip END signature not found!");
});
it.each([8, 16, 24, 28])(
  "loads original ZIP64 extra size%i even with ordinary END metadata",
  /** Source always reads size, then available compressed size and offset, and skips the optional disk suffix. @param size - Payload length. @returns Nothing. */ async (
    size,
  ) => {
    const data = join(u64(1n), u64(1n), u64(0n), new Uint8Array(4)).subarray(0, size),
      bytes = withExtra(extra(1, data)),
      view = new DataView(bytes.buffer),
      central = view.getUint32(bytes.length - 6, true);
    view.setUint32(central + 24, 0xffffffff, true);
    if (size >= 16) view.setUint32(central + 20, 0xffffffff, true);
    if (size >= 24) view.setUint32(central + 42, 0xffffffff, true);
    expect(await new ZipFile(bytes).readTextEntry("entry")).toBe("A");
  },
);
it("retains unconditional Zip64 extra overwrites rather than conditioning on32-bit sentinels", /** Raw source records deliberately contain old nonsentinel CEN sizes plus actual matching64-bit fields. @returns Nothing. */ async () => {
  const bytes = withExtra(
      extra(1, join(u64(2n), u64(2n))),
      new Uint8Array(),
      new Uint8Array([65, 66]),
    ),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  view.setUint32(central + 20, 1, true);
  view.setUint32(central + 24, 1, true);
  expect(await new ZipFile(bytes).readTextEntry("entry")).toBe("AB");
});
it("keeps unknown-field skipping and exact Unicode path matching with ignored redundant CRC", /** Same helper consumes CEN and LOC fields through genuine buffers. @returns Nothing. */ async () => {
  const name = new TextEncoder().encode("entry"),
    unicode = extra(0x7075, join(new Uint8Array([1, 0, 0, 0, 0]), name));
  const bytes = withExtra(join(extra(77, new Uint8Array([3, 4, 5])), unicode), unicode);
  expect(await new ZipFile(bytes).readTextEntry("entry")).toBe("A");
  const version = extra(0x7075, join(new Uint8Array([2, 0, 0, 0, 0]), name));
  const mismatch = extra(
    0x7075,
    join(new Uint8Array([1, 0, 0, 0, 0]), new TextEncoder().encode("other")),
  );
  const oversized = extra(0x7075, new Uint8Array([1, 0, 0, 0, 0]), 100);
  for (const field of [version, mismatch, oversized])
    expect(
      /** Parses real invalid Unicode-path metadata. @returns Archive. */ () =>
        new ZipFile(withExtra(field)),
    ).toThrow("Invalid Info-ZIP Unicode Path Extra Field");
});
it("preserves ignored LOC flag bits and zero duplicated CRC/size fields", /** Native readLOC ignores bits1,2,11 and only checks nonzero duplicated metadata. @returns Nothing. */ async () => {
  const output = new ZipOutputStream();
  output.putNextEntry("entry", new Uint8Array([65]));
  const bytes = output.finish(),
    view = new DataView(bytes.buffer);
  view.setUint16(6, 6, true);
  view.setUint32(14, 0, true);
  view.setUint32(18, 0, true);
  view.setUint32(22, 0, true);
  expect(await new ZipFile(bytes).readTextEntry("entry")).toBe("A");
});
it.each([new Uint8Array([255, 128, 7]), new Int8Array([-1, -128, 7])])(
  "reads actual typed const-byte storage through native MemoryInputStream",
  /** No per-byte provider, Sequence substitute or archive-sized logical map is supplied. @param storage - Actual primitive storage. @returns Nothing. */ (
    storage,
  ) => {
    const component = new MemoryInputStream(storage, storage.length),
      input = new Reference(component),
      data = new Bytes();
    try {
      expect(component.readBytes(data, 3)).toBe(3);
      const cells = data.getConstArray() as SequenceElements;
      expect([
        (cells.get(0) as [number])[0],
        (cells.get(1) as [number])[0],
        (cells.get(2) as [number])[0],
      ]).toEqual([-1, -128, 7]);
    } finally {
      data.dispose();
      input.dispose();
    }
  },
);
it("keeps the actual complete ZipException value/type inheritance and ownership", /** Genuine generated constructors and inherited base operations; no Error-shaped fake exception. @returns Nothing. */ () => {
  const value = new ZipException(),
    copy = new ZipException(value),
    message = new OUString(Uint16Array.of(122, 105, 112), 3),
    context = new Reference(),
    populated = new ZipException(message, context),
    moved = ZipException.move(populated),
    name = getCppuType().getTypeName();
  try {
    expect(value).toBeInstanceOf(Exception);
    expect(value.Message.getLength()).toBe(0);
    expect(copy.Context.is()).toBe(false);
    expect(text(name)).toBe("com.sun.star.packages.zip.ZipException");
    expect(text(moved.Message)).toBe("zip");
    expect(populated.Message.getLength()).toBe(0);
    value.assign(moved);
    expect(text(value.Message)).toBe("zip");
  } finally {
    name.dispose();
    moved.dispose();
    populated.dispose();
    copy.dispose();
    value.dispose();
    context.dispose();
    message.dispose();
  }
});
it("preserves native CEN count-to-length validation before reading records", /** Actual END metadata declares more complete records than can fit in its CEN bytes. @returns Nothing. */ () => {
  const output = new ZipOutputStream();
  output.putNextEntry("entry", new Uint8Array([65]));
  const bytes = output.finish(),
    view = new DataView(bytes.buffer),
    end = bytes.length - 22;
  view.setUint16(end + 8, 2, true);
  view.setUint16(end + 10, 2, true);
  expect(
    /** Source validates the declared entry extent. @returns Archive. */ () => new ZipFile(bytes),
  ).toThrow("invalid END header (bad entry count)");
});
it("preserves primitive native diagnostics without retaining a destroyed UNO cause", /** Host transport is explicit and never exposes an exception owner after destruction. @returns Nothing. */ () => {
  let caught: unknown;
  try {
    new ZipFile(new Uint8Array(3));
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(Error);
  const error = caught as Error;
  expect(error.cause).toEqual({
    type: "com.sun.star.packages.zip.ZipException",
    Message: "Zip too small!",
  });
  expect(error.cause).not.toBeInstanceOf(Exception);
});
it("validates the CEN filename before processing its extra fields as source", /** Both fields are invalid; source name-validation order determines the reported failure. @returns Nothing. */ () => {
  const bytes = withExtra(extra(0x7075, new Uint8Array([2, 0, 0, 0, 0]))),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  bytes[central + 46] = 63;
  expect(
    /** Opens real compound-invalid metadata in source order. @returns Archive. */ () =>
      new ZipFile(bytes),
  ).toThrow("Unsafe ZIP entry name");
});
