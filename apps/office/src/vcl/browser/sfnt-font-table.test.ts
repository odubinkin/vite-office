/** @fileoverview Actual SFNT directory bounds, explicit collection faces and source-view table identity. */
import { expect, it } from "vitest";
import { resolve } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { readSfntFontTable } from "./sfnt-font-table";

/** Creates an explicit two-record container fixture with real binary offsets. @param type - Face signature. @returns Source buffer and directory view. */
function font(type = 0x10000) {
  const bytes = new Uint8Array(64),
    view = new DataView(bytes.buffer);
  view.setUint32(0, type);
  view.setUint16(4, 2);
  bytes.set([79, 83, 47, 50], 12);
  view.setUint32(20, 48);
  view.setUint32(24, 4);
  bytes.set([99, 109, 97, 112], 28);
  view.setUint32(36, 52);
  view.setUint32(40, 4);
  bytes.set([1, 2, 3, 4, 5, 6, 7, 8], 48);
  return { bytes, view };
}

it("reads actual table views in TrueType/OpenType/Apple containers without merging metadata or ignoring source view offsets", /** Checks supported signatures and exact source table identities. @returns Nothing. */ () => {
  for (const type of [0x10000, 0x4f54544f, 0x74727565]) {
    const { bytes } = font(type);
    expect(readSfntFontTable(bytes, "OS/2")).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(readSfntFontTable(bytes, "cmap")).toEqual(new Uint8Array([5, 6, 7, 8]));
    expect(readSfntFontTable(bytes, "name")).toBeUndefined();
    const backing = new Uint8Array(128);
    backing.set(bytes, 9);
    const table = readSfntFontTable(backing.subarray(9, 73), "OS/2");
    expect(table?.buffer).toBe(backing.buffer);
    expect(table).toEqual(new Uint8Array([1, 2, 3, 4]));
  }
});

it("keeps malformed or ambiguous table sources unknown", /** Exercises byte-boundary validation rather than a native glyph-support substitute. @returns Nothing. */ () => {
  const { bytes, view } = font();
  expect(readSfntFontTable(bytes.subarray(0, 11), "OS/2")).toBeUndefined();
  expect(readSfntFontTable(bytes, "OS2")).toBeUndefined();
  for (const index of [-1, 0.5, Number.NaN, 1])
    expect(readSfntFontTable(bytes, "OS/2", index)).toBeUndefined();
  view.setUint32(0, 0);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
  view.setUint32(0, 0x10000);
  view.setUint16(4, 100);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
  view.setUint16(4, 2);
  view.setUint32(20, 65);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
  view.setUint32(20, 48);
  view.setUint32(24, 100);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
  view.setUint32(24, 0);
  expect(readSfntFontTable(bytes, "OS/2")).toHaveLength(0);
  view.setUint32(24, 4);
  bytes.set([79, 83, 47, 50], 28);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
});

it("uses explicit TTC face indices and absolute table offsets", /** Pins collection bounds, versions and two distinct physical tables. @returns Nothing. */ () => {
  const bytes = new Uint8Array(128),
    view = new DataView(bytes.buffer);
  view.setUint32(0, 0x74746366);
  view.setUint32(4, 0x10000);
  view.setUint32(8, 2);
  view.setUint32(12, 24);
  view.setUint32(16, 64);
  for (const [base, offset] of [
    [24, 104],
    [64, 108],
  ] as const) {
    view.setUint32(base, 0x10000);
    view.setUint16(base + 4, 1);
    bytes.set([79, 83, 47, 50], base + 12);
    view.setUint32(base + 20, offset);
    view.setUint32(base + 24, 4);
  }
  bytes.set([1, 2, 3, 4, 5, 6, 7, 8], 104);
  expect(readSfntFontTable(bytes, "OS/2", 0)).toEqual(new Uint8Array([1, 2, 3, 4]));
  view.setUint32(4, 0x20000);
  expect(readSfntFontTable(bytes, "OS/2", 1)).toEqual(new Uint8Array([5, 6, 7, 8]));
  expect(readSfntFontTable(bytes, "OS/2", 2)).toBeUndefined();
  view.setUint32(4, 3);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
  view.setUint32(4, 0x10000);
  view.setUint32(8, 100);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
  view.setUint32(8, 2);
  view.setUint32(12, 120);
  expect(readSfntFontTable(bytes, "OS/2")).toBeUndefined();
});

it("extracts actual OS/2 and cmap tables from every bundled runtime font asset", /** Reads repository runtime assets without asserting glyph support from names. @returns Nothing. */ () => {
  const root = resolve(process.cwd(), "public/fonts/truetype");
  const files = readdirSync(root).filter(
    /** Selects actual font containers. @param name - Asset. @returns Whether supported runtime file. */ (
      name,
    ) => /\.(?:ttf|otf)$/i.test(name),
  );
  expect(files.length).toBeGreaterThan(100);
  for (const file of files) {
    const bytes = readFileSync(resolve(root, file));
    expect(readSfntFontTable(bytes, "OS/2")?.length, file).toBeGreaterThanOrEqual(78);
    expect(readSfntFontTable(bytes, "cmap")?.length, file).toBeGreaterThan(4);
  }
});
