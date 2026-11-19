/** @fileoverview Actual source file URL charset/URI owners preserve escaped octets, UTF16 failures, chunking and native errno. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime, getRuntime } from "../../../external/emscripten/runtime";
import { OString } from "../../inc/rtl/string";
import { OUString } from "../../inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8, RTL_TEXTENCODING_ASCII_US } from "../../inc/rtl/textenc";
import { osl_setThreadTextEncoding } from "../../inc/osl/thread";
import { oslFileError } from "../../inc/osl/file";
import {
  decodeFromUtf8,
  convertPathnameToUrl,
  UnicodeToText,
  TextToUnicode,
} from "./file_url.encoding";
const owners: { dispose(): void }[] = [];
/** Tracks original string values. @param value - Original value. @returns Same value. */
function own<T extends { dispose(): void }>(value: T): T {
  owners.push(value);
  return value;
}
/** Creates logical UTF16 input. @param text - Fixture. @returns Units. */
function units(text: string): Uint16Array {
  return Uint16Array.from(
    text.split(""),
    /** Reads a UTF16 unit. @param unit - Unit. @returns Code. */ (unit) => unit.charCodeAt(0),
  );
}
/** Reads original output units. @param value - Original string. @returns Logical JS text for assertion. */
function text(value: OUString): string {
  return Array.from(
    value.getStr().subarray(0, value.getLength()),
    /** Converts a unit without a spread argument-size limit. @param unit - UTF16 code unit. @returns One-unit string. */ (
      unit,
    ) => String.fromCharCode(unit),
  ).join("");
}
/** Creates original byte string. @param data - Fixture bytes. @returns Actual value. */
function bytes(data: number[]): OString {
  return own(new OString(Uint8Array.from(data), data.length));
}
beforeAll(
  /** Initializes actual runtime and selects UTF8 before either singleton. @returns Completion. */ async () => {
    await initializeRuntime();
    osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8);
  },
);
afterEach(
  /** Releases actual local string values. @returns Nothing. */ () => {
    while (owners.length) owners.pop()?.dispose();
  },
);
it("preserves valid/raw UTF8, non-UTF8 octets, escapes and output-on-success", /** Calls original readUcs4 and text converters, retaining old output on failed decoding. @returns Nothing. */ () => {
  const output = bytes([111, 108, 100]);
  expect(decodeFromUtf8(units("/a%20b/%C3%A9/%FF%00"), output)).toBe(true);
  expect(Array.from(output.getStr().subarray(0, output.getLength()))).toEqual([
    47, 97, 32, 98, 47, 195, 169, 47, 255, 0,
  ]);
  for (const input of ["%", "%Q0", "%0", "a\ud800"]) {
    const prior = output.pData;
    expect(decodeFromUtf8(units(input), output)).toBe(false);
    expect(output.pData).toBe(prior);
  }
  expect(decodeFromUtf8(units("%ED%A0%80"), output)).toBe(true);
  expect(Array.from(output.getStr().subarray(0, output.getLength()))).toEqual([237, 160, 128]);
  expect(decodeFromUtf8(units("é😀"), output)).toBe(true);
  expect(Array.from(output.getStr().subarray(0, output.getLength()))).toEqual([
    195, 169, 240, 159, 152, 128,
  ]);
  expect(decodeFromUtf8(new Uint16Array(), output)).toBe(true);
  expect(output.isEmpty()).toBe(true);
});
it("preserves original URL scheme, slash class and invalid-byte escapes", /** Exercises actual Uri.encode over native bytes. @returns Nothing. */ () => {
  for (const [input, expected] of [
    [[], "file:"],
    [[47, 47, 97], "file:////a"],
    [[97, 32, 37, 35, 63], "file:a%20%25%23%3F"],
    [[47, 195, 169, 47, 255, 128], "file:///%C3%A9/%FF%80"],
    [[47, 0], "file:///%00"],
  ] as Array<[number[], string]>) {
    const output = own(new OUString());
    expect(convertPathnameToUrl(bytes(input), output)).toBe(oslFileError.None);
    expect(text(output)).toBe(expected);
  }
});
it("retains byte expansion chunking over PATH_MAX-sized windows", /** Multi-byte source characters require repeated actual conversions; invalid octets split Unicode chunks. @returns Nothing. */ () => {
  const source = "é".repeat(9000) + "%FF" + "中".repeat(9000),
    output = bytes([]);
  expect(decodeFromUtf8(units(source), output)).toBe(true);
  expect(output.getLength()).toBe(18000 + 1 + 27000);
  const result = own(new OUString());
  expect(convertPathnameToUrl(output, result)).toBe(oslFileError.None);
  expect(text(result)).toBe("file:" + "%C3%A9".repeat(9000) + "%FF" + "%E4%B8%AD".repeat(9000));
});
it("sets genuine native overflow errno and retains original best-effort terminator behavior", /** Real buffer shortages cover both source wrappers. @returns Nothing. */ () => {
  const unicode = units("é"),
    output = new Uint8Array(3),
    wide = new Uint16Array(2);
  expect(UnicodeToText(output, 2, unicode, 1)).toBe(2);
  expect(Array.from(output)).toEqual([195, 169, 0]);
  expect(UnicodeToText(output, 1, unicode, 1)).toBe(0);
  expect(getRuntime()?._office_file_errno()).toBe(61);
  expect(TextToUnicode(Uint8Array.of(195, 169), 2, wide, 1)).toBe(1);
  expect(Array.from(wide)).toEqual([233, 0]);
  expect(TextToUnicode(Uint8Array.of(65, 66), 2, wide, 1)).toBe(0);
  expect(getRuntime()?._office_file_errno()).toBe(61);
  osl_setThreadTextEncoding(RTL_TEXTENCODING_ASCII_US);
  expect(UnicodeToText(output, 2, unicode, 1)).toBe(2);
  expect(TextToUnicode(Uint8Array.of(195, 169), 2, wide, 1)).toBe(1);
});
