/** @fileoverview Original SAL byte conversion and missing-converter behavior used by Calc CSV. */
import { expect, it } from "vitest";
import {
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
  RTL_TEXTENCODING_MS_932,
  RTL_TEXTENCODING_UTF7,
  RTL_TEXTENCODING_ISO_2022_JP,
} from "../inc/rtl/textenc";
import { OStringToOUString, OUStringToOString } from "./ustring-convert";

it("uses the original single-byte descriptor for a selected native encoding", /** Checks uses the original single-byte descriptor for a selected native encoding. @returns Test completion or assertion result. */ () => {
  const bytes = OUStringToOString("Привет", RTL_TEXTENCODING_MS_1251);
  expect([...bytes]).toEqual([0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2]);
  expect(OStringToOUString(bytes, RTL_TEXTENCODING_MS_1251)).toBe("Привет");
});

it("decodes little-endian UTF-16 including BOM and supplementary characters", /** Checks code-unit ordering and BOM preservation at the string boundary. @returns Nothing. */ () => {
  const bytes = new Uint8Array([0xff, 0xfe, 0x41, 0, 0x3d, 0xd8, 0, 0xde]);
  expect(OStringToOUString(bytes, RTL_TEXTENCODING_UNICODE)).toBe("\ufeffA😀");
  expect([...OUStringToOString("\ufeffA😀", RTL_TEXTENCODING_UNICODE)]).toEqual([...bytes]);
  expect(OStringToOUString(new Uint8Array([0x41]), RTL_TEXTENCODING_UNICODE)).toBe("�");
});

it("preserves the original SAL dummy conversion when no converter exists", /** Checks preserves the original SAL dummy conversion when no converter exists. @returns Test completion or assertion result. */ () => {
  const missingEncoding = 9999;
  expect([...OUStringToOString("A€", missingEncoding)]).toEqual([0x41, 0xac]);
  expect(OStringToOUString(new Uint8Array([0x41, 0xac]), missingEncoding)).toBe("A¬");
});

it.each([
  [[0xe0, 0x80, 0x80], "\ufffd"],
  [[0xed, 0xa0, 0x80], "\ufffd"],
  [[0xf4, 0x90, 0x80, 0x80], "\ufffd"],
  [[0xf8, 0x88, 0x80, 0x80, 0x80], "\ufffd"],
  [[0xc2, 0x41], "\ufffdA"],
  [[0xe2, 0x82], "\ufffd"],
  [[0xef, 0xbb, 0xbf, 0x41], "\ufeffA"],
] as const)(
  "uses native UTF-8 broken-sequence grouping and final flush for %s",
  /** Checks the source converter rather than the host UTF-8 replacement grammar. @param input - Original bytes. @param expected - Native converted text. @returns Nothing. */ (
    input,
    expected,
  ) => {
    expect(OStringToOUString(Uint8Array.from(input), RTL_TEXTENCODING_UTF8)).toBe(expected);
  },
);

it("uses the native UTF-8 encoder including malformed UTF-16 grouping", /** Checks the string wrapper uses SAL conversion rather than host replacement characters. @returns Nothing. */ () => {
  expect([...OUStringToOString("A😀é", RTL_TEXTENCODING_UTF8)]).toEqual([
    65, 0xf0, 0x9f, 0x98, 0x80, 0xc3, 0xa9,
  ]);
  expect([...OUStringToOString("A\ud800B", RTL_TEXTENCODING_UTF8)]).toEqual([65, 63]);
  expect([...OUStringToOString("A\ud800", RTL_TEXTENCODING_UTF8)]).toEqual([65]);
  expect([...OUStringToOString("\udc00", RTL_TEXTENCODING_UTF8)]).toEqual([63]);
});

it.each([
  [RTL_TEXTENCODING_MS_932, [0x82, 0xa0], "あ"],
  [RTL_TEXTENCODING_UTF7, [0x2b, 0x41, 0x4f, 0x6b, 0x2d], "é"],
  [RTL_TEXTENCODING_ISO_2022_JP, [0x1b, 0x24, 0x42, 0x24, 0x22, 0x1b, 0x28, 0x42], "あ"],
] as const)(
  "uses the common native dispatch for encoding %s",
  /** Verifies uses the common native dispatch for encoding %s. @param encoding - encoding value. @param bytes - bytes value. @param expected - expected value. @returns Nothing. */ (
    encoding,
    bytes,
    expected,
  ) => {
    expect(OStringToOUString(Uint8Array.from(bytes), encoding)).toBe(expected);
  },
);
