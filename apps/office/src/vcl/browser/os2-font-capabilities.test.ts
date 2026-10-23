/** @fileoverview Defined PhysicalFontFace OS/2 capability bits, short-read preservation and actual bundled table coverage. */
import { expect, it } from "vitest";
import { resolve } from "node:path";
import { readFileSync, readdirSync } from "node:fs";
import { readOs2FontCapabilities } from "../source/font/PhysicalFontFace";
import { Blob as NodeBlob } from "node:buffer";
import { readBrowserFontCapabilities, type BrowserPhysicalFont } from "./font-list";
import { readSfntFontTable } from "./sfnt-font-table";

/** Encodes actual big-endian coverage fields in a controlled OS/2 byte table. @param length - Actual available bytes. @param words - Unicode/codepage values. @returns Encoded table. */
function table(length: number, words: readonly number[]): Uint8Array {
  const bytes = new Uint8Array(length),
    data = new DataView(bytes.buffer);
  for (const [index, word] of words.entries()) {
    const offset = index < 4 ? 42 + index * 4 : 78 + (index - 4) * 4;
    if (offset + 4 <= length) data.setUint32(offset, word);
  }
  return bytes;
}

it("retains original bit ordering and separates an empty advertised bitset from unknown data", /** Checks high bits, both native word groups and exact source-view bounds. @returns Nothing. */ () => {
  const bytes = table(86, [0x80000001, 0x40000200, 0x80000000, 0x10000, 0x20001, 0x80000000]);
  const caps = readOs2FontCapabilities(bytes);
  expect([...(caps?.oUnicodeRange ?? [])]).toEqual([0, 31, 41, 62, 95, 112]);
  expect([...(caps?.oCodePageRange ?? [])]).toEqual([0, 17, 63]);
  expect(readOs2FontCapabilities(new Uint8Array(86))).toEqual({
    oUnicodeRange: new Set(),
    oCodePageRange: new Set(),
  });
  const backing = new Uint8Array(100);
  backing.set(bytes, 7);
  expect(readOs2FontCapabilities(backing.subarray(7, 93))).toEqual(caps);
  for (const length of [0, 42, 45])
    expect(readOs2FontCapabilities(new Uint8Array(length))).toBeUndefined();
});

it("preserves the last successful Unicode word after short reads instead of zero-filling or manufacturing codepages", /** Pins defined source stream failure outputs after at least one complete word. @returns Nothing. */ () => {
  expect(readOs2FontCapabilities(table(46, [1]))).toEqual({
    oUnicodeRange: new Set([0, 32, 64, 96]),
  });
  expect(readOs2FontCapabilities(table(50, [1, 2]))).toEqual({
    oUnicodeRange: new Set([0, 33, 65, 97]),
  });
  expect(readOs2FontCapabilities(table(57, [1, 2, 4]))).toEqual({
    oUnicodeRange: new Set([0, 33, 66, 98]),
  });
});

it("keeps native repeated codepage words when a valid version-zero or truncated OS/2 table has no complete codepage range", /** Documents the source quirk rather than correcting OS/2 version handling. @returns Nothing. */ () => {
  expect(readOs2FontCapabilities(table(78, [0, 0, 0, 0x20000]))).toEqual({
    oUnicodeRange: new Set([113]),
    oCodePageRange: new Set([17, 49]),
  });
  for (const length of [82, 85])
    expect(readOs2FontCapabilities(table(length, [0, 0, 0, 0, 0x80000000]))).toEqual({
      oUnicodeRange: new Set(),
      oCodePageRange: new Set([31, 63]),
    });
});

it("reads advertised coverage in every actual bundled font without deriving glyph support from these bitsets", /** Verifies direct binary table transport over repository runtime assets. @returns Nothing. */ () => {
  const root = resolve(process.cwd(), "public/fonts/truetype");
  for (const name of readdirSync(root).filter(
    /** Selects actual supported font files. @param name - Asset. @returns Whether font. */ (
      name,
    ) => /\.(?:ttf|otf)$/i.test(name),
  )) {
    const os2 = readSfntFontTable(readFileSync(resolve(root, name)), "OS/2") as Uint8Array;
    const caps = readOs2FontCapabilities(os2);
    expect(caps?.oUnicodeRange, name).toBeInstanceOf(Set);
    const data = new DataView(os2.buffer, os2.byteOffset, os2.byteLength);
    const expected = [];
    const combined = (data.getBigUint64(42) << 64n) | data.getBigUint64(50);
    // Original word order is low-to-high while every word itself is big-endian.
    for (let bit = 0; bit < 128; ++bit) {
      const position = BigInt(96 - Math.floor(bit / 32) * 32 + (bit % 32));
      if ((combined & (1n << position)) !== 0n) expected.push(bit);
    }
    expect([...(caps?.oUnicodeRange ?? [])], name).toEqual(expected);
  }
});

/** Exposes source bytes through the real Local Font Access blob method shape. @param bytes - Acquired file bytes. @returns Actual source boundary. */
function physical(bytes: Uint8Array): BrowserPhysicalFont {
  return {
    kind: "local",
    family: "Actual source",
    data: {
      family: "Actual source",
      blob: /** Supplies a source blob without asserting these bytes are installed. @returns Source blob. */ async () =>
        new NodeBlob([new Uint8Array(bytes)]) as unknown as Blob,
    },
  };
}

it("connects actual acquired bytes to native advertised capability data without guessing a collection face", /** Checks the public browser reader and explicit TTC identity boundary. @returns Completion. */ async () => {
  const bytes = readFileSync(resolve(process.cwd(), "public/fonts/truetype/opens___.ttf"));
  expect(await readBrowserFontCapabilities(physical(bytes))).toEqual(
    readOs2FontCapabilities(readSfntFontTable(bytes, "OS/2") as Uint8Array),
  );
  expect(
    await readBrowserFontCapabilities({
      kind: "local",
      family: "Names only",
      data: { family: "Names only" },
    }),
  ).toBeUndefined();
  const empty = new Uint8Array(12);
  new DataView(empty.buffer).setUint32(0, 0x10000);
  expect(await readBrowserFontCapabilities(physical(empty))).toBeUndefined();
  const collection = new Uint8Array(140),
    view = new DataView(collection.buffer);
  view.setUint32(0, 0x74746366);
  view.setUint32(4, 0x10000);
  view.setUint32(8, 1);
  view.setUint32(12, 24);
  view.setUint32(24, 0x10000);
  view.setUint16(28, 1);
  collection.set([79, 83, 47, 50], 36);
  view.setUint32(44, 52);
  view.setUint32(48, 86);
  view.setUint32(94, 1);
  expect(await readBrowserFontCapabilities(physical(collection))).toBeUndefined();
  expect(await readBrowserFontCapabilities(physical(collection), 0)).toEqual({
    oUnicodeRange: new Set([0]),
    oCodePageRange: new Set(),
  });
  expect(await readBrowserFontCapabilities(physical(collection), 1)).toBeUndefined();
});
