/** @fileoverview Replays genuine original single-byte conversion,complete core descriptors and header constants. */
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import { convertCharToUnicode } from "./convertsimple.hxx";
import {
  ImplGetUndefinedUnicodeChar,
  RTL_TEXTCVT_BYTE_PRIVATE_START,
  RTL_TEXTCVT_BYTE_PRIVATE_END,
  type ImplByteConvertData,
} from "./tenchelp";
import { RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER } from "./unichars.hxx";
import * as core from "./textenc";
import * as constants from "../inc/rtl/textcvt.h";
import fixture from "./native-singlebyte-cases.json";
/** Decodes and authenticates original observations without calculating alternate expected outputs. @param mode - Actual native capture. @returns Original observation rows. */
function rows(mode: keyof typeof fixture.captures): unknown[] {
  const capture = fixture.captures[mode],
    data = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(data.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(data).digest("hex")).toBe(capture.digest);
  return data
    .toString()
    .trimEnd()
    .split("\n")
    .map(
      /** Reads one native JSON row. @param line - Native record. @returns Original row. */ (
        line,
      ) => JSON.parse(line),
    );
}
/** Selects ported production descriptors for the three core encodings;the additional descriptor is genuine captured native registry data. @returns Native encoding-to-data association. */
function descriptors(): Map<number, ImplByteConvertData> {
  const actual = new Map<number, ImplByteConvertData>([
    [1, core.aImplMS1252ByteCvtData],
    [11, core.aImplUSASCIIByteCvtData],
    [12, core.aImplISO88591ByteCvtData],
  ]);
  const captured = rows("descriptors") as [number, ImplByteConvertData][];
  expect(captured).toHaveLength(4);
  for (const [id, data] of captured) {
    if (actual.has(id)) expect(actual.get(id)).toEqual(data);
    else actual.set(id, data);
  }
  return actual;
}
it("matches original descriptor fields,null pointers,shared tables and flags", /** Validates native aggregates and true shared identity alongside every selected original macro. @returns Nothing. */ () => {
  descriptors();
  expect([
    Number(core.aImplUSASCIIByteCvtData.mpToUniTab1 === core.aImplMS1252ByteCvtData.mpToUniTab1),
    Number(core.aImplMS1252ByteCvtData.mpToCharTab1 === core.aImplISO88591ByteCvtData.mpToCharTab1),
    RTL_TEXTCVT_BYTE_PRIVATE_START,
    RTL_TEXTCVT_BYTE_PRIVATE_END,
    RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER,
  ]).toEqual(rows("aliases")[0]);
  const native = rows("constants") as [keyof typeof constants, number][];
  expect(
    Object.keys(constants)
      .filter(
        /** Keeps this original exhaustive direction-specific header contract independent of the newly added reverse direction. @param name - Exported macro. @returns Whether original text-to-Unicode macro. */
        (name) => name.startsWith("RTL_TEXTTOUNICODE_"),
      )
      .sort(),
  ).toEqual(
    native
      .map(
        /** Reads the original macro name. @param entry - Native name/value pair. @returns Macro name. */ ([
          name,
        ]) => name,
      )
      .sort(),
  );
  for (const [name, value] of native) expect(constants[name]).toBe(value);
  expect(core.aImplMS1252ByteCvtData.mpToUniTab1).toBe(core.aImplMS1252ToUniTab);
  expect(core.aImplMS1252ByteCvtData.mpToCharTab1).toBe(core.aImplA0FFSameToCharTab);
  expect(core.aImplMS1252ByteCvtData.mpToCharExTab).toBe(core.aImplMS1252ToCharTabEx);
  expect(core.aImplISO88591ByteCvtData.mpToUniTab1).toBe(core.aImplISO88591ToUniTab);
  expect(core.aImplISO88591ByteCvtData.mpToUniTab2).toBe(core.aImpl8090SameToUniTab);
  expect(core.aImplISO88591ByteCvtData.mpToCharTab2).toBe(core.aImpl8090SameToCharTab);
});
it("matches original conversion ordering,consumed counts,info and untouched sentinel storage", /** Exercises all native byte and boundary observations using the actual complete converter. @returns Nothing. */ () => {
  const data = descriptors();
  let count = 0;
  for (const row of rows("values")) {
    const [id, byte, pattern, capacity, flags, expected] = row as [
      number,
      number,
      number,
      number,
      number,
      number[],
    ];
    const source =
      pattern === 0 ? [] : pattern === 1 ? [byte] : pattern === 2 ? [65, byte, 0] : [byte, 0, byte];
    const bytes = count % 2 === 0 ? Uint8Array.from(source) : Int8Array.from(source),
      destination = new Uint16Array(6).fill(0xbeef),
      info: [number] = [0xdeadbeef],
      consumed: [number] = [0xcafe];
    const written = convertCharToUnicode(
      data.get(id) as ImplByteConvertData,
      null,
      bytes,
      bytes.length,
      destination,
      capacity,
      flags,
      info,
      consumed,
    );
    expect([written, info[0], consumed[0], ...destination], `native row ${count}`).toEqual(
      expected,
    );
    count++;
  }
  expect(count).toBeGreaterThan(40000);
});
it("matches original unsigned-byte private mapping and replacement defaults", /** Replays actual helper observations with signed JavaScript byte inputs too. @returns Nothing. */ () => {
  for (const row of rows("helpers")) {
    const [byte, flags, expected] = row as [number, number, number];
    expect(ImplGetUndefinedUnicodeChar(byte, flags)).toBe(expected);
    expect(ImplGetUndefinedUnicodeChar(byte > 127 ? byte - 256 : byte, flags)).toBe(expected);
  }
});
