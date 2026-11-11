/** @fileoverview Real external ZIP bytes exercise source LOC descriptors, CEN extent partitioning and generated ZipIOException ownership. */
import { deflateRawSync } from "node:zlib";
import { expect, it } from "vitest";
import { ZipFile } from "./ZipFile";
import { ZipOutputStream } from "./ZipOutputStream";
import { CRC32 } from "./CRC32";
import {
  ZipIOException,
  getCppuType,
} from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import {
  IOException,
  getCppuType as getIOExceptionType,
} from "../../../cppu/inc/com/sun/star/io/IOException";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
/** Real deterministic source archive with one-byte names. @param names - Actual paths. @returns Complete archive bytes. */
function archive(names: readonly string[] = ["a"]): Uint8Array {
  const output = new ZipOutputStream();
  for (const name of names) output.putNextEntry(name, new Uint8Array([65]));
  return output.finish();
}
/** Reads source UTF16 without retaining a borrowed value after destruction. @param value - Actual string. @returns Host observation. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); ++i)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Inserts actual bytes before CEN and adjusts END's corresponding offset. @param source - Real archive. @param insertion - Actual extra bytes. @param at - Physical insertion offset. @returns Changed external archive. */
function insert(source: Uint8Array, insertion: Uint8Array, at: number): Uint8Array {
  const bytes = new Uint8Array(source.length + insertion.length);
  bytes.set(source.subarray(0, at));
  bytes.set(insertion, at);
  bytes.set(source.subarray(at), at + insertion.length);
  const view = new DataView(bytes.buffer),
    end = bytes.length - 22;
  view.setUint32(end + 16, view.getUint32(end + 16, true) + insertion.length, true);
  return bytes;
}
/** Independent descriptor fixture, including Excel version45-without-extra and actual DEFLATE bytes. @param signature - Optional PK78 signature. @param wide - Descriptor scalar width. @param method - Actual method. @returns Archive bytes. */
function descriptor(signature: boolean, wide: boolean, method: 0 | 8 = 0): Uint8Array {
  const plain = new Uint8Array([65]);
  const payload = method === 0 ? plain : Uint8Array.from(deflateRawSync(plain));
  let bytes = archive();
  if (method === 8) {
    bytes = insert(bytes, payload.subarray(1), 32);
    bytes[31] = payload[0] as number;
  }
  const central = new DataView(bytes.buffer).getUint32(bytes.length - 6, true);
  const dd = new Uint8Array((signature ? 4 : 0) + (wide ? 20 : 12)),
    data = new DataView(dd.buffer);
  let at = 0;
  if (signature) {
    data.setUint32(at, 0x08074b50, true);
    at += 4;
  }
  data.setUint32(at, CRC32.compute(plain), true);
  at += 4;
  if (wide) {
    data.setBigUint64(at, BigInt(payload.length), true);
    data.setBigUint64(at + 8, 1n, true);
  } else {
    data.setUint32(at, payload.length, true);
    data.setUint32(at + 4, 1, true);
  }
  bytes = insert(bytes, dd, central);
  const view = new DataView(bytes.buffer),
    cen = central + dd.length;
  view.setUint16(4, wide ? 45 : 20, true);
  view.setUint16(6, 0x808, true);
  view.setUint16(cen + 8, 0x808, true);
  view.setUint16(8, method, true);
  view.setUint16(cen + 10, method, true);
  view.setUint32(14, 0, true);
  view.setUint32(18, 0, true);
  view.setUint32(22, 0, true);
  view.setUint32(cen + 20, payload.length, true);
  return bytes;
}
it.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
] as const)(
  "reads descriptor signature=%s ZIP64=%s with original Excel version fallback",
  /** All four real record lengths and both actual supported methods. @param signed - Optional signature. @param wide -64-bit sizes. @returns Nothing. */
  async (signed, wide) => {
    for (const method of [0, 8] as const)
      expect(await new ZipFile(descriptor(signed, wide, method)).readTextEntry("a")).toBe("A");
  },
);
it.each([false, true])(
  "accepts consistent duplicated LOC metadata, signature=%s",
  /** Source accepts superfluous descriptors with matching duplicated values. @param signed - Optional signature. @returns Nothing. */ async (
    signed,
  ) => {
    const bytes = descriptor(signed, false),
      view = new DataView(bytes.buffer);
    view.setUint32(14, CRC32.compute(new Uint8Array([65])), true);
    view.setUint32(18, 1, true);
    view.setUint32(22, 1, true);
    expect(await new ZipFile(bytes).readTextEntry("a")).toBe("A");
  },
);
it.each([14, 18, 22, 32, 36, 40])(
  "rejects inconsistent LOC/DD scalar at%i",
  /** External fields disagree with actual CEN values. @param offset - Actual scalar offset. @returns Nothing. */ (
    offset,
  ) => {
    const bytes = descriptor(false, false);
    new DataView(bytes.buffer).setUint32(offset, 7, true);
    expect(
      /** Opens malformed external bytes. @returns Archive. */ () => new ZipFile(bytes),
    ).toThrow("The stream seems to be broken!");
  },
);
it("preserves zero descriptor values rather than inventing mandatory nonzero comparisons", /** Native final comparisons are conditional on nonzero values; actual payload CRC still validates on read. @returns Nothing. */ async () => {
  const bytes = descriptor(false, false);
  bytes.fill(0, 32, 44);
  expect(await new ZipFile(bytes).readTextEntry("a")).toBe("A");
});
it("accepts actual Zip64 extra-field UINT64_MAX placeholders but rejects 32-bit all-ones", /** Original placeholder comparison is sal_uInt64(-1), not UINT32_MAX. @returns Nothing. */ async () => {
  const source = descriptor(true, true),
    extra = new Uint8Array(20),
    field = new DataView(extra.buffer);
  field.setUint16(0, 1, true);
  field.setUint16(2, 16, true);
  field.setBigUint64(4, 0xffffffffffffffffn, true);
  field.setBigUint64(12, 0xffffffffffffffffn, true);
  const bytes = insert(source, extra, 31),
    view = new DataView(bytes.buffer);
  view.setUint16(4, 20, true);
  view.setUint16(28, 20, true);
  expect(await new ZipFile(bytes).readTextEntry("a")).toBe("A");
  const narrow = descriptor(true, false);
  new DataView(narrow.buffer).setUint32(18, 0xffffffff, true);
  expect(
    /** Native UINT64 comparison rejects these distinct bits. @returns Archive. */ () =>
      new ZipFile(narrow),
  ).toThrow("The stream seems to be broken!");
});
it.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
] as const)(
  "rejects forgotten bit3, signature=%s wide=%s",
  /** Unclaimed descriptor intervals produce the original specialized12/16-byte or generic hole diagnostics. @param signed - Optional signature. @param wide - Scalar width. @returns Nothing. */ (
    signed,
    wide,
  ) => {
    const bytes = descriptor(signed, wide),
      view = new DataView(bytes.buffer),
      central = view.getUint32(bytes.length - 6, true);
    view.setUint16(6, 0x800, true);
    view.setUint16(central + 8, 0x800, true);
    expect(
      /** Actual descriptor remains physically unclaimed. @returns Archive. */ () =>
        new ZipFile(bytes),
    ).toThrow(
      wide
        ? "Zip file has holes! It will leak!"
        : "Zip file has holes the size of data descriptors; producer forgot to set flag bit 3?",
    );
  },
);
it("consumes out-of-order CEN extents by all native interval split/end cases", /** No assumption of ordered entries; three independent physical records remain contiguous. @returns Nothing. */ () => {
  for (const order of [
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [0, 2, 1],
  ]) {
    const bytes = archive(["a", "b", "c"]),
      view = new DataView(bytes.buffer),
      central = view.getUint32(bytes.length - 6, true),
      records = bytes.slice(central, central + 141);
    for (let i = 0; i < 3; ++i)
      bytes.set(
        records.subarray((order[i] as number) * 47, ((order[i] as number) + 1) * 47),
        central + i * 47,
      );
    expect(new ZipFile(bytes).getEntryNames()).toEqual(
      order.map(
        /** Maps fixture ordering. @param index - Physical entry. @returns Name. */ (index) =>
          ["a", "b", "c"][index],
      ),
    );
  }
});
it("rejects overlapping physical records before duplicate-name insertion", /** Second actual CEN record points at an already consumed valid local record. @returns Nothing. */ () => {
  const bytes = archive(["a", "b"]),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  bytes[central + 47 + 46] = 97;
  view.setUint32(central + 47 + 42, 0, true);
  expect(
    /** Duplicate physical extent is invalid even with a valid local header. @returns Archive. */ () =>
      new ZipFile(bytes),
  ).toThrow("overlapping entries");
});
it("rejects an unclaimed leading range", /** External prepended bytes update every offset correctly but still leave a hole. @returns Nothing. */ () => {
  const source = archive(),
    bytes = insert(source, new Uint8Array(3), 0),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  view.setUint32(central + 42, 3, true);
  expect(
    /** Leading source bytes have no entry owner. @returns Archive. */ () => new ZipFile(bytes),
  ).toThrow("Zip file has holes! It will leak!");
});
it("skips FAT-compatible empty directories only after consuming their extents", /** Empty directory attributes remove the catalog entry; Unix producer keeps the same physical entry. @returns Nothing. */ () => {
  const output = new ZipOutputStream();
  output.putNextEntry("dir/", new Uint8Array());
  const bytes = output.finish(),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  view.setUint16(central + 4, 20, true);
  view.setUint32(central + 38, 16, true);
  expect(new ZipFile(bytes).getEntryNames()).toEqual([]);
  view.setUint16(central + 4, 0x314, true);
  expect(new ZipFile(bytes).getEntryNames()).toEqual(["dir/"]);
});
it("owns ZipIOException as the actual generated IOException child", /** Complete native generated value/copy/move/type operations. @returns Nothing. */ () => {
  const empty = new ZipIOException(),
    copy = new ZipIOException(empty),
    message = new OUString(Uint16Array.of(105, 111), 2),
    context = new Reference(),
    populated = new ZipIOException(message, context),
    moved = ZipIOException.move(populated),
    type = getCppuType(),
    name = type.getTypeName();
  try {
    expect(empty).toBeInstanceOf(IOException);
    expect(empty.Message.getLength()).toBe(0);
    expect(copy.Context.is()).toBe(false);
    expect(text(name)).toBe("com.sun.star.packages.zip.ZipIOException");
    expect(getCppuType()).toBe(type);
    expect(getIOExceptionType().isAssignableFrom(type)).toBe(true);
    expect(type.equals(getIOExceptionType())).toBe(false);
    expect(text(moved.Message)).toBe("io");
    expect(populated.Message.getLength()).toBe(0);
    empty.assign(moved);
    expect(text(empty.Message)).toBe("io");
  } finally {
    name.dispose();
    moved.dispose();
    populated.dispose();
    copy.dispose();
    empty.dispose();
    context.dispose();
    message.dispose();
  }
});

it("retains source short-header RuntimeException as primitive diagnostics", /** A valid seek with fewer than30 remaining bytes hits the source header read-count check. @returns Nothing. */ () => {
  const bytes = archive(),
    view = new DataView(bytes.buffer),
    central = view.getUint32(bytes.length - 6, true);
  view.setUint32(central + 42, bytes.length - 5, true);
  try {
    new ZipFile(bytes);
    throw new Error("missing expected RuntimeException");
  } catch (error) {
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("");
    expect((error as Error).cause).toEqual({
      type: "com.sun.star.uno.RuntimeException",
      Message: "",
    });
  }
});
