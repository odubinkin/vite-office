/** @fileoverview Replays authenticated original full native Unicode-to-byte,undefined-handler and legacy classification observations. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import { convertUnicodeToChar } from "./convertsimple.hxx";
import { handleUndefinedUnicodeToTextChar } from "./handleundefinedunicodetotextchar.hxx";
import { ImplIsControlOrFormat, ImplIsPrivateUse, ImplIsZeroWidth } from "./unichars.hxx";
import type { ImplByteConvertData } from "./tenchelp";
import * as data from "./textenc";
import * as flags from "../inc/rtl/textcvt.h";
import fixture from "./native-singlebyte-reverse-cases.json";
/** Authenticates genuine original observation bytes. @param mode - Native capture name. @returns Unmodified original output. */
function nativeBytes(mode: keyof typeof fixture.captures): Buffer {
  const capture = fixture.captures[mode];
  const bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(bytes.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(capture.digest);
  return bytes;
}
/** Uses actual ported core data and original captured additional encoding descriptors. @returns Native descriptor association. */
function descriptors(): Map<number, ImplByteConvertData> {
  const original = JSON.parse(
    `[${nativeBytes("descriptors").toString().trimEnd().replaceAll("\n", ",")}]`,
  ) as [number, ImplByteConvertData][];
  const result = new Map(original);
  for (const [id, core] of [
    [1, data.aImplMS1252ByteCvtData],
    [11, data.aImplUSASCIIByteCvtData],
    [12, data.aImplISO88591ByteCvtData],
  ] as const) {
    expect(result.get(id)).toEqual(core);
    result.set(id, core);
  }
  expect(result.has(40)).toBe(true);
  const second = [...(data.aImplISO88591ByteCvtData.mpToCharTab2 as readonly number[])];
  second[5] = 0;
  result.set(1000, { ...data.aImplISO88591ByteCvtData, mpToCharTab2: second });
  return result;
}

it("matches whole original reverse conversion across BMP,real descriptors,flags and sentinel capacities", /** Compares real native consumed/written/info and every initialized destination byte. @returns Nothing. */ function replaysReverse(): void {
  const encodings = descriptors();
  const rows = nativeBytes("values").toString().trimEnd().split("\n");
  for (const row of rows) {
    const [id, source, capacity, mask, expected] = JSON.parse(row) as [
      number,
      number[],
      number,
      number,
      number[],
    ];
    const destination = new Uint8Array(12).fill(0xbe),
      info: [number] = [0xdeadbeef],
      consumed: [number] = [0xcafe];
    const written = convertUnicodeToChar(
      encodings.get(id) as ImplByteConvertData,
      null,
      new Uint16Array(source),
      source.length,
      destination,
      capacity,
      mask,
      info,
      consumed,
    );
    const actual = [written, info[0], consumed[0], ...destination];
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      expect({ id, source, capacity, mask, actual }).toEqual({
        id,
        source,
        capacity,
        mask,
        actual: expected,
      });
  }
  expect(rows.length).toBeGreaterThan(524288);
}, 30_000);

it("matches original undefined handler pointer cells and existing status bits", /** Replays independent native handler calls with nonzero initial offsets. @returns Nothing. */ function replaysUndefined(): void {
  const rows = nativeBytes("handlers").toString().trimEnd().split("\n");
  for (const row of rows) {
    const [source, capacity, mask, expected] = JSON.parse(row) as [
      number[],
      number,
      number,
      number[],
    ];
    const sourceOffset: [number] = [1],
      destinationOffset: [number] = [1],
      info: [number] = [0x8000];
    const destination = new Int8Array(8).fill(0xbe);
    const result = handleUndefinedUnicodeToTextChar(
      new Uint16Array([80, ...source, 83]),
      sourceOffset,
      1 + source.length,
      destination,
      destinationOffset,
      1 + capacity,
      mask,
      info,
    );
    const actual = [
      Number(result),
      sourceOffset[0],
      destinationOffset[0],
      info[0],
      ...new Uint8Array(destination.buffer),
    ];
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      expect({ source, capacity, mask, actual }).toEqual({
        source,
        capacity,
        mask,
        actual: expected,
      });
  }
  expect(rows.length).toBeGreaterThan(1900);
});

it("matches all original legacy classifier points and unsigned32 boundaries", /** Compares actual original predicate bits without modern host Unicode categories. @returns Nothing. */ function replaysClassifiers(): void {
  const expected = nativeBytes("classifiers");
  const points = [...Array(0x110002).keys(), 0x7fffffff, 0x80000000, 0xffffffff];
  const actual = Buffer.from(
    points.map(
      /** Encodes the three production predicate results exactly as observed natively. @param point - Native unsigned32 point. @returns Original output byte representation. */ (
        point,
      ) =>
        48 +
        Number(ImplIsControlOrFormat(point)) +
        2 * Number(ImplIsPrivateUse(point)) +
        4 * Number(ImplIsZeroWidth(point)),
    ),
  );
  expect(actual).toEqual(expected);
  expect(ImplIsPrivateUse(-1)).toBe(false);
  expect(ImplIsControlOrFormat(0x1_0000_0000)).toBe(true);
});

it("retains every original Unicode-to-text flag and info macro", /** Authenticates the original complete macro capture. @returns Nothing. */ function replaysFlags(): void {
  const rows = nativeBytes("constants").toString().trimEnd().split("\n");
  for (const row of rows) {
    const [name, value] = JSON.parse(row) as [keyof typeof flags, number];
    expect(flags[name]).toBe(value);
  }
  expect(rows).toHaveLength(28);
  expect(
    Object.keys(flags)
      .filter(
        /** Retains exhaustive original Unicode-to-text names alongside the forward direction contract. @param name - Exported macro. @returns Whether reverse macro. */
        (name) => name.startsWith("RTL_UNICODETOTEXT_"),
      )
      .sort(),
  ).toEqual(
    rows
      .map(
        /** Reads the independently observed native macro identity. @param row - Original JSON observation. @returns Native name. */
        (row) => (JSON.parse(row) as [string, number])[0],
      )
      .sort(),
  );
});
