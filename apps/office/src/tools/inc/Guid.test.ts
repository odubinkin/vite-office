/** @fileoverview Pinned tools GuidTest and SAL createUuid_001 assertions over actual browser UUID generation and native string owners. Named/MD5 UUID QA is outside the consumed API profile. */
import { expect, it } from "vitest";
import { Guid } from "./Guid";
import { rtl_createUuid, rtl_compareUuid } from "../../sal/inc/rtl/uuid";
/** Observes the actual source ASCII formatter and releases its value. @param value - Source Guid. @returns Source text. */
function text(value: Guid): string {
  const string = value.getString();
  try {
    return String.fromCharCode(...string.getStr().subarray(0, string.getLength()));
  } finally {
    string.dispose();
  }
}
it("ports GuidTest testGetString", /** Exact source byte order and uppercase/braced output. @returns Nothing. */ () => {
  const value = new Guid(Uint8Array.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16));
  expect(text(value)).toBe("{01020304-0506-0708-090A-0B0C0D0E0F10}");
  const unicode = value.getOUString();
  try {
    expect(String.fromCharCode(...unicode.getStr().subarray(0, unicode.getLength()))).toBe(
      text(value),
    );
  } finally {
    unicode.dispose();
  }
});
it("ports GuidTest testCreate and SAL createUuid_001 without a random provider mock", /** Actual native API creates20 distinct source UUIDs with v4/variant bits. @returns Nothing. */ () => {
  const first = new Guid(Guid.Generate),
    second = new Guid(Guid.Generate);
  expect(first.isEmpty()).toBe(false);
  expect(first.equals(first)).toBe(true);
  expect(second.equals(second)).toBe(true);
  expect(first.notEquals(second)).toBe(true);
  const values: Uint8Array[] = [];
  for (let index = 0; index < 20; ++index) {
    const data = new Uint8Array(16);
    rtl_createUuid(data, index % 2 ? first.begin() : null, index % 2 === 0);
    expect((data[6] as number) & 0xf0).toBe(0x40);
    expect((data[8] as number) & 0xc0).toBe(0x80);
    for (const previous of values) expect(rtl_compareUuid(data, previous)).not.toBe(0);
    values.push(data);
  }
  const cells = new Map<number, [number]>();
  for (let i = 0; i < 16; ++i) cells.set(i, [0]);
  rtl_createUuid(cells, null, false);
  expect((cells.get(6) as [number])[0] & 0xf0).toBe(0x40);
  expect(rtl_compareUuid(cells, cells)).toBe(0);
});
it("ports GuidTest testParse/testEmpty/testCopyAndAssign", /** Original valid/invalid views and value copies retain fixed array identity. @returns Nothing. */ () => {
  const original = new Guid(Uint8Array.of(1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5));
  expect(original.equals(new Guid("{01010101-0202-0303-0404-050505050505}"))).toBe(true);
  const all = new Guid(new Uint8Array(16).fill(255));
  expect(all.equals(new Guid("{FFffFFff-FFff-FFff-FFff-FFffFFffFFff}"))).toBe(true);
  expect(all.equals(new Guid("{FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF}"))).toBe(true);
  for (const invalid of [
    "01010101-0202-0303-0404-0505050505005",
    "Random",
    "{0G010101-0202-0303-0404-050505050505}",
    "{FFAAFFAA?FFAA-FFAA-FFAA-FF00FF11FF22}",
  ])
    expect(new Guid(invalid).isEmpty()).toBe(true);
  expect(new Guid("{FFAAFFAA-FFAA-FFAA-FFAA-FF00FF11FF22}").isEmpty()).toBe(false);
  expect(new Guid(new Uint8Array(16)).isEmpty()).toBe(true);
  const nonempty = new Uint8Array(16);
  nonempty[6] = 1;
  expect(new Guid(nonempty).isEmpty()).toBe(false);
  const copy = new Guid(original),
    assigned = new Guid(),
    begin = assigned.begin(),
    end = assigned.end();
  assigned.assign(original);
  expect(copy.equals(original)).toBe(true);
  expect(assigned.equals(original)).toBe(true);
  expect([...copy.cbegin()]).toEqual([...original.cbegin()]);
  expect(assigned.begin()).toBe(begin);
  expect(assigned.end()).toBe(end);
  expect(assigned.cend()).toBe(end);
  expect(end.byteOffset - begin.byteOffset).toBe(16);
  copy.begin()[0] = 99;
  expect(assigned.notEquals(copy)).toBe(true);
});
it("retains each strict source separator/hex position and exact lexical signs", /** Source validation completes before writes; all16 compare byte positions retain network order. @returns Nothing. */ () => {
  const valid = "{01020304-0506-0708-090A-0B0C0D0E0F10}";
  for (let index = 0; index < 38; ++index) {
    const chars = valid.split("");
    chars[index] = "?";
    expect(new Guid(chars.join("")).isEmpty()).toBe(true);
  }
  for (let index = 0; index < 16; ++index) {
    const first = new Uint8Array(16),
      second = new Uint8Array(16);
    second[index] = 255;
    expect(rtl_compareUuid(first, second)).toBe(-1);
    expect(rtl_compareUuid(second, first)).toBe(1);
    expect(rtl_compareUuid(second, second)).toBe(0);
  }
});
