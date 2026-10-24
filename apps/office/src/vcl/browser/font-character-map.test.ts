/** @fileoverview Real acquired SFNT bytes, explicit TTC identity and native character-map projection without CSS glyph probes. */
import { createHash } from "node:crypto";
import native from "../../external/harfbuzz/src/native-font-charmaps.json";
import { expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { Blob as NodeBlob } from "node:buffer";
import { readBrowserFontCharMap } from "./font-character-map";
import type { BrowserPhysicalFont } from "./font-list";
import { makeFontCharMap } from "../source/font/PhysicalFontFace";

/** Supplies actual acquired bytes at the Local Font Access boundary. @param bytes - Font file. @returns Real source-shaped record. */
function physical(bytes: Uint8Array): BrowserPhysicalFont {
  return {
    kind: "local",
    family: "Acquired",
    data: {
      family: "Acquired",
      blob: /** Supplies acquired bytes without installing a synthetic face. @returns Source blob. */ async () =>
        new NodeBlob([new Uint8Array(bytes)]) as unknown as Blob,
    },
  };
}

it("converts collected source sets to ordered half-open ranges and uses actual backend defaults", /** Pins half-open ranges and both native empty-set defaults. @returns Nothing. */ () => {
  const map = makeFontCharMap(new Set([100, 67, 65, 66, 0x1f600]), false);
  expect(map.GetCharCount()).toBe(5);
  expect(map.GetFirstChar()).toBe(65);
  expect(map.GetLastChar()).toBe(0x1f600);
  expect(map.HasChar(68)).toBe(false);
  expect(map.GetNextChar(67)).toBe(100);
  expect(makeFontCharMap(new Set([65]), true).GetCharCount()).toBe(1);
  expect(makeFontCharMap(new Set(), false).IsDefaultMap()).toBe(true);
  expect(makeFontCharMap(new Set(), true).HasChar(0xf020)).toBe(true);
});

it("reads actual character coverage from every bundled font instead of inferring it from advertised OS/2 bits", /** Verifies complete codepoint digests against original HarfBuzz observations for every actual asset. @returns Completion. */ async () => {
  const directory = resolve(process.cwd(), "public/fonts/truetype");
  const names = readdirSync(directory).filter(
    /** Selects actual bundled SFNT files. @param name - Asset filename. @returns Whether supported. */ (
      name,
    ) => /\.(ttf|otf)$/iu.test(name),
  );
  expect(names.length).toBe(Object.keys(native.fonts).length);
  for (const name of names) {
    const bytes = readFileSync(resolve(directory, name));
    const expected = native.fonts[name as keyof typeof native.fonts];
    expect(createHash("sha256").update(bytes).digest("hex"), name).toBe(expected.fontSha256);
    const map = await readBrowserFontCharMap(physical(bytes), false);
    const codes: number[] = [];
    if (map !== undefined)
      for (let code = map.GetFirstChar(); ; code = map.GetNextChar(code)) {
        codes.push(code);
        if (code === map.GetLastChar()) break;
      }
    expect(createHash("sha256").update(JSON.stringify(codes)).digest("hex"), name).toBe(
      expected.unicodesSha256,
    );
    expect(map?.GetCharCount(), name).toBe(expected.characters);
    expect(map?.IsDefaultMap(), name).toBe(false);
    expect(map?.GetCharCount(), name).toBeGreaterThan(0);
    expect(map?.HasChar(map.GetFirstChar()), name).toBe(true);
  }
});

it("keeps unavailable bytes and unresolved collections unknown and retains native empty-map defaults", /** Checks actual byte availability and explicit collection identity. @returns Completion. */ async () => {
  expect(
    await readBrowserFontCharMap(
      { kind: "local", family: "Names only", data: { family: "Names only" } },
      false,
    ),
  ).toBeUndefined();
  const font = readFileSync(resolve(process.cwd(), "public/fonts/truetype/opens___.ttf"));
  const empty = new Uint8Array(12);
  new DataView(empty.buffer).setUint32(0, 0x10000);
  expect((await readBrowserFontCharMap(physical(empty), true))?.HasChar(0xf020)).toBe(true);
  const collection = new Uint8Array(font.length + 16),
    data = new DataView(collection.buffer);
  data.setUint32(0, 0x74746366);
  data.setUint32(4, 0x10000);
  data.setUint32(8, 1);
  data.setUint32(12, 16);
  collection.set(font, 16);
  const records = data.getUint16(20);
  for (let i = 0; i < records; ++i) {
    const offset = 16 + 12 + 16 * i + 8;
    data.setUint32(offset, data.getUint32(offset) + 16);
  }
  expect(await readBrowserFontCharMap(physical(collection), false)).toBeUndefined();
  expect((await readBrowserFontCharMap(physical(collection), false, 0))?.GetCharCount()).toBe(
    (await readBrowserFontCharMap(physical(font), false, 0))?.GetCharCount(),
  );
  expect((await readBrowserFontCharMap(physical(collection), false, 1))?.IsDefaultMap()).toBe(true);
});
