/** @fileoverview Exercises source-valid ICU ownership, counted narrow bytes and UTF16 boundary contracts. */
import { expect, it } from "vitest";
import { UnicodeString } from "./unistr";
import { ByteSink, CheckedArrayByteSink, asByteSink } from "./bytestream";
import { ResourceDataValue } from "./uresdata";
import { ResourceArray, ResourceTable } from "./resource";
import { UResourceBundle } from "./uresimp";
import { getTableItemByKeyPath } from "./uresbund.path";
import { ures_openDirect, ures_getByKey, ures_close, ures_getName } from "./uresbund";

it("preserves nullable construction, bogus copying and lone-surrogate boundaries", /** Public value operations retain original UTF16 semantics. @returns Nothing. */ () => {
  const empty = new UnicodeString(null);
  expect(empty.isEmpty()).toBe(true);
  expect(empty.assign(empty)).toBe(empty);
  const bogus = new UnicodeString("discarded");
  bogus.setToBogus();
  expect(bogus.getBuffer()).toBeNull();
  expect(new UnicodeString(bogus).equals(bogus)).toBe(true);
  expect(empty.equals(bogus)).toBe(false);
  expect(bogus.equals(empty)).toBe(false);
  expect(bogus.compare(bogus)).toBe(0);
  expect(empty.compare(bogus)).toBe(1);
  expect(bogus.compare(empty)).toBe(-1);
  expect(bogus.append(new UnicodeString("kept"))).toBe(bogus);
  expect(bogus.getBuffer()).toBeNull();
  expect(empty.concat(bogus).getBuffer()).toBe("");
  expect(new UnicodeString("abc").compare(new UnicodeString("ab"))).toBe(1);
  expect(new UnicodeString("ab").compare(new UnicodeString("abc"))).toBe(-1);
  expect(new UnicodeString("abc").compare(new UnicodeString("abc"))).toBe(0);
  for (const [text, index, expected] of [
    ["\ud800A", 0, 0xd800],
    ["A\udc00", 1, 0xdc00],
    ["\udc00", 0, 0xdc00],
    ["\ud800", 0, 0xd800],
    ["\ud800\udc00", 0, 0x10000],
    ["\ud800\udc00", 1, 0x10000],
    ["", 0, 0xffff],
    ["A", -1, 0xffff],
  ] as const)
    expect(new UnicodeString(text).char32At(index)).toBe(expected);
});

/** Minimal actual append-only sink exposes the original default virtual methods. */
class RecordingSink extends ByteSink {
  output = "";
  /** Receives counted bytes. @param bytes - Narrow storage. @param count - Optional readable count. @returns Nothing. */
  Append(bytes: string | Uint8Array | null, count?: number): void {
    const length = count ?? (bytes as string).length;
    if (typeof bytes === "string") this.output += bytes.slice(0, length);
    else
      for (let i = 0; i < length; i++)
        this.output += String.fromCharCode((bytes as Uint8Array)[i] as number);
  }
}
it("retains default flush and the immutable sink projection for counted bytes", /** Exercises the public narrow byte adapter without modifying its internal state. @returns Nothing. */ () => {
  const direct = new RecordingSink();
  expect(asByteSink(direct)).toBe(direct);
  direct.Append("abc");
  expect(direct.Flush()).toBeUndefined();
  expect(direct.output).toBe("abc");
  let output = "";
  const projected = asByteSink({
    /** Retains the immutable byte projection. @param bytes - Counted span. @returns Nothing. */ Append(
      bytes: string,
    ) {
      output += bytes;
    },
  });
  projected.Append(Uint8Array.of(0, 127, 255), 3);
  projected.Append("abc", 2);
  projected.Append(null, 0);
  projected.Append("ignored", -1);
  expect(output).toBe("\0\x7f\xffab");
});
it("saturates the attempted byte count while retaining an empty borrowed output", /** Repeated real readable chunks reach signed32 overflow without allocating an oversized buffer. @returns Nothing. */ () => {
  const sink = new CheckedArrayByteSink(null, 0),
    chunk = new Uint8Array(4096);
  for (let i = 0; i < 524290; i++) sink.Append(chunk, chunk.length);
  expect(sink.NumberOfBytesAppended()).toBe(2147483647);
  expect(sink.NumberOfBytesWritten()).toBe(0);
  expect(sink.Overflowed()).toBe(true);
});
it("exposes original Unicode resource conveniences and keyed value writes", /** Uses actual pinned resources and default empty views. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = ures_openDirect(null, "root", status);
  const version = ures_getByKey(root, "Version", null, status),
    value = new ResourceDataValue();
  if (!version?.resource) throw new Error("Missing pinned Version resource");
  value.setResource(version.resource);
  expect(value.getUnicodeString(status)).toBe("48");
  expect(ures_getName(root)).toBe("root");
  expect(ures_getName(null)).toBeNull();
  if (!root?.resource) throw new Error("Missing pinned root resource");
  value.setResource(root.resource);
  const rootTable = value.getTable([0]);
  expect(rootTable.findValue("Version", value)).toBe(true);
  expect(value.getUnicodeString([0])).toBe("48");
  const rawAlias = getTableItemByKeyPath(root.resource, "calendar/gregorian/AmPmMarkers");
  if (!rawAlias) throw new Error("Missing pinned raw alias");
  value.setResource(rawAlias);
  expect(value.getAliasUnicodeString([0])).toContain("AmPmMarkersAbbr");

  const table = new ResourceTable();
  expect(table.findValue("Version", value)).toBe(false);
  expect(new ResourceArray().getSize()).toBe(0);
  const alias = ures_getByKey(root, "calendar", null, [0]);
  if (!alias?.resource) throw new Error("Missing pinned calendar resource");
  value.setResource(alias.resource);
  expect(value.getUnicodeString([0])).toBe("");
  expect(value.getAliasUnicodeString([0])).toBe("");
  const bundle = new UResourceBundle();
  bundle.resource = value.getResource();
  bundle.key = "calendar";
  expect(bundle.resource).toBe(value.getResource());
  expect(bundle.key).toBe("calendar");
  ures_close(alias);
  ures_close(version);
  ures_close(root);
});
