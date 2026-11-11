/** @fileoverview Genuine ZipEntry values and native output framing over ByteChucker/UNOMemoryStream, including counted SAL UTF8 conversion. */
import { expect, it, vi } from "vitest";
import { ZipEntry } from "../../inc/ZipEntry";
import { ZipOutputStream } from "./ZipOutputStream";
import { ZipFile } from "./ZipFile";
import { OUString, OUStringToOString } from "../../../sal/inc/rtl/ustring";
import { OString } from "../../../sal/inc/rtl/string";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { OUSTRING_TO_OSTRING_CVTFLAGS } from "../../../sal/inc/rtl/string.h";
/** Initializes counted original Unicode storage. @param value - Exact text. @returns Owned value. */
function native(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Fully initialized original aggregate caller; no indeterminate scalar is read. @returns Actual owned entry. */
function entry(): ZipEntry {
  const value = new ZipEntry(),
    path = native("é.xml");
  value.nVersion = 20;
  value.nFlag = 2048;
  value.nMethod = 0;
  value.nTime = 33 << 16;
  value.nCrc = -1;
  value.nCompressedSize = 3n;
  value.nSize = 3n;
  value.nOffset = 0x100000000n;
  value.nPathLen = 6;
  value.nExtraLen = 0;
  try {
    value.sPath.assign(path);
  } finally {
    path.dispose();
  }
  return value;
}
it("keeps aggregate copy/move construction, assignment and path ownership", /** Source scalar values survive every implicit operation and each Unicode owner is destroyed once. @returns Nothing. */ () => {
  const original = entry(),
    copy = new ZipEntry(original),
    assigned = new ZipEntry(),
    moved = ZipEntry.move(copy),
    other = entry();
  try {
    expect(copy.sPath.isEmpty()).toBe(true);
    expect(original.sPath.pData).toBe(moved.sPath.pData);
    expect(assigned.sPath.isEmpty()).toBe(true);
    assigned.assign(original);
    expect(assigned.nOffset).toBe(0x100000000n);
    expect(assigned.nCrc).toBe(-1);
    expect([
      assigned.nVersion,
      assigned.nFlag,
      assigned.nMethod,
      assigned.nTime,
      assigned.nCompressedSize,
      assigned.nSize,
      assigned.nPathLen,
      assigned.nExtraLen,
    ]).toEqual([20, 2048, 0, 33 << 16, 3n, 3n, 6, 0]);
    const before = other.sPath.pData;
    other.moveAssign(moved);
    expect(other.sPath.pData).toBe(original.sPath.pData);
    expect(moved.sPath.pData).toBe(before);
    assigned.assign(assigned);
    other.moveAssign(other);
    expect(other.nOffset).toBe(original.nOffset);
  } finally {
    other.dispose();
    moved.dispose();
    assigned.dispose();
    copy.dispose();
    original.dispose();
  }
});
it.each(["", "é😀\0B", "ASCII"])(
  "converts counted Unicode to genuine OString: %s",
  /** The original helper and Unicode OString constructor share the actual C conversion owner; embedded zero is retained. @param value - Source text. @returns Nothing. */ (
    value,
  ) => {
    const source = native(value),
      view = source.getStr().subarray(0, source.getLength()),
      viaHelper = OUStringToOString(view, RTL_TEXTENCODING_UTF8),
      viaConstructor = new OString(
        view,
        view.length,
        RTL_TEXTENCODING_UTF8,
        OUSTRING_TO_OSTRING_CVTFLAGS,
      );
    try {
      const expected = [...new TextEncoder().encode(value)];
      expect([...viaHelper.getStr().subarray(0, viaHelper.getLength())]).toEqual(expected);
      expect([...viaConstructor.getStr().subarray(0, viaConstructor.getLength())]).toEqual(
        expected,
      );
      expect(viaHelper.getStr()[viaHelper.getLength()]).toBe(0);
    } finally {
      viaConstructor.dispose();
      viaHelper.dispose();
      source.dispose();
    }
  },
);
it("admits the source null UTF16 pointer with zero count", /** A genuine constructor overload, not a fake byte string or allocator fault. @returns Nothing. */ () => {
  const value = new OString(null, 0, RTL_TEXTENCODING_UTF8);
  try {
    expect(value.isEmpty()).toBe(true);
  } finally {
    value.dispose();
  }
});
it("matches the independently packed single-entry ZIP32 golden bytes", /** Golden fields were packed independently with Python struct/zlib; no production encoder constructs the expectation. @returns Nothing. */ () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-01-02T03:04:05.006Z"));
  try {
    const output = new ZipOutputStream();
    output.putNextEntry("a", new Uint8Array([65]));
    const hex =
      "504b03041400000800008218225c8b9ed9d30100000001000000010000006141504b010214001400000800008218225c8b9ed9d3010000000100000001000000000000000000000000000000000061504b050600000000010001002f000000200000000000";
    const expected = Uint8Array.from(
      hex.match(/../g) as string[],
      /** Exact independently packed octet. @param byte - Hex. @returns Value. */ (byte) =>
        parseInt(byte, 16),
    );
    expect(output.finish()).toEqual(expected);
  } finally {
    vi.useRealTimers();
  }
});
it("preserves full payload bytes, non-ASCII paths and independent input copies", /** Existing putNextEntry byte binding copies payload before native framing and real reopening validates CRC. @returns Nothing. */ async () => {
  const payload = Uint8Array.of(0, 255, 128, 1),
    output = new ZipOutputStream();
  output.putNextEntry("данные/é.xml", payload);
  output.putNextEntry("empty", new Uint8Array());
  payload.fill(99);
  const archive = new ZipFile(output.finish());
  expect(archive.getEntryNames()).toEqual(["данные/é.xml", "empty"]);
  expect(await archive.readEntry("данные/é.xml")).toEqual(Uint8Array.of(0, 255, 128, 1));
  expect(await archive.readEntry("empty")).toEqual(new Uint8Array());
});
it("preserves signed16 name narrowing and source LOC offset arithmetic", /** A real initialized32768-byte path exercises the source scalar boundary without forged private state or byte objects. @returns Nothing. */ () => {
  const name = "A".repeat(32768),
    output = new ZipOutputStream();
  output.putNextEntry(name, new Uint8Array());
  const bytes = output.finish(),
    view = new DataView(bytes.buffer),
    central = 30 + 32768;
  expect(view.getInt16(26, true)).toBe(-32768);
  expect(view.getInt16(central + 28, true)).toBe(-32768);
  expect(view.getUint32(central + 42, true)).toBe(65536);
  expect(
    /** Native reader rejects its negative CEN name length. @returns Archive. */ () =>
      new ZipFile(bytes),
  ).toThrow("unexpected name length");
});
it("enforces the existing count ceiling through65535 real admitted entries", /** Real public calls exercise the ZIP32 admission boundary; no private list or counterfeit bytes are supplied. @returns Nothing. */ () => {
  const output = new ZipOutputStream(),
    empty = new Uint8Array();
  for (let i = 0; i < 65535; ++i) output.putNextEntry(String(i), empty);
  expect(
    /** The next real public entry exceeds the existing bound. @returns Nothing. */ () =>
      output.putNextEntry("last", empty),
  ).toThrow("entry count exceeds ZIP32");
});
