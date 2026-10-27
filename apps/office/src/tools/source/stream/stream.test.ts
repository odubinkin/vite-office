/** @fileoverview Consumed SvStream text-reader contracts used by Calc CSV import. */
import { expect, it } from "vitest";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
} from "../../../sal/inc/rtl/textenc";
import { SvStream } from "./stream";

it("consumes only permitted BOMs and keeps a second BOM as input text", /** Checks consumes only permitted BOMs and keeps a second BOM as input text. @returns Test completion or assertion result. */ () => {
  const bytes = new TextEncoder().encode("\uFEFF\uFEFFé\n");
  const stream = new SvStream(bytes, RTL_TEXTENCODING_DONTKNOW);
  stream.StartReadingUnicodeText(RTL_TEXTENCODING_DONTKNOW);
  expect(stream.Tell()).toBe(3);
  expect(stream.ReadUniOrByteStringLine()).toBe("\uFEFFé");
  expect(stream.eof()).toBe(false);
  expect(stream.ReadUniOrByteStringLine()).toBe("");
  expect(stream.eof()).toBe(true);

  const unchanged = new SvStream(bytes, RTL_TEXTENCODING_MS_1252);
  unchanged.StartReadingUnicodeText(RTL_TEXTENCODING_MS_1252);
  expect(unchanged.Tell()).toBe(0);
  expect(unchanged.ReadUniOrByteStringLine()).toBe("ï»¿ï»¿Ã©");
});

it("reads UTF-16 lines in BOM-selected byte order", /** Checks reads UTF-16 lines in BOM-selected byte order. @returns Test completion or assertion result. */ () => {
  const stream = new SvStream(
    new Uint8Array([0xfe, 0xff, 0, 65, 0, 10, 0, 13, 0, 66, 0, 13]),
    RTL_TEXTENCODING_UNICODE,
  );
  stream.StartReadingUnicodeText(RTL_TEXTENCODING_UNICODE);
  expect(stream.Tell()).toBe(2);
  expect(stream.ReadUniOrByteStringLine()).toBe("A");
  expect(stream.ReadUniOrByteStringLine()).toBe("B");
  expect(stream.ReadUniOrByteStringLine()).toBe("");
  expect(stream.eof()).toBe(true);
});

it("preserves ReadUniStringLine's swapped-buffer behavior after a UTF-16BE NUL", /** Checks preserves ReadUniStringLine's swapped-buffer behavior after a UTF-16BE NUL. @returns Test completion or assertion result. */ () => {
  const stream = new SvStream(
    new Uint8Array([0xfe, 0xff, 0, 65, 0, 0, 0, 10, 0, 13, 0, 66, 0, 13]),
    RTL_TEXTENCODING_UNICODE,
  );
  stream.StartReadingUnicodeText(RTL_TEXTENCODING_UNICODE);
  expect(stream.ReadUniOrByteStringLine()).toBe("A\u0A00\u0D00\u4200\u0D00");
  expect(stream.ReadUniOrByteStringLine()).toBe("");
  expect(stream.eof()).toBe(true);

  const littleEndian = new SvStream(
    new Uint8Array([0xff, 0xfe, 65, 0, 0, 0, 10, 0, 66, 0]),
    RTL_TEXTENCODING_UNICODE,
  );
  littleEndian.StartReadingUnicodeText(RTL_TEXTENCODING_UNICODE);
  expect(littleEndian.ReadUniOrByteStringLine()).toBe("A");
  expect(littleEndian.ReadUniOrByteStringLine()).toBe("B");
});

it("treats both opposite newline pairs as one byte-stream terminator", /** Checks treats both opposite newline pairs as one byte-stream terminator. @returns Test completion or assertion result. */ () => {
  const stream = new SvStream(new TextEncoder().encode("A\n\rB\r\nC\n"), RTL_TEXTENCODING_UTF8);
  expect(stream.ReadUniOrByteStringLine()).toBe("A");
  expect(stream.ReadUniOrByteStringLine()).toBe("B");
  expect(stream.ReadUniOrByteStringLine()).toBe("C");
  expect(stream.ReadUniOrByteStringLine()).toBe("");
  expect(stream.eof()).toBe(true);
});

it("uses the native byte limit and advances one source byte beyond a truncated line", /** Checks uses the native byte limit and advances one source byte beyond a truncated line. @returns Test completion or assertion result. */ () => {
  const stream = new SvStream(new TextEncoder().encode("ABCDE\nZ"), RTL_TEXTENCODING_UTF8);
  expect(stream.ReadUniOrByteStringLine(3)).toBe("ABC");
  expect(stream.Tell()).toBe(4);
  expect(stream.ReadUniOrByteStringLine(3)).toBe("E");
  expect(stream.ReadUniOrByteStringLine(3)).toBe("Z");
});

it("uses the native UTF-16 unit limit and advances one unit beyond a truncated line", /** Checks uses the native UTF-16 unit limit and advances one unit beyond a truncated line. @returns Test completion or assertion result. */ () => {
  const stream = new SvStream(
    new Uint8Array([0xff, 0xfe, 65, 0, 66, 0, 67, 0, 68, 0, 10, 0, 90, 0]),
    RTL_TEXTENCODING_UNICODE,
  );
  stream.StartReadingUnicodeText(RTL_TEXTENCODING_UNICODE);
  expect(stream.ReadUniOrByteStringLine(2)).toBe("AB");
  expect(stream.Tell()).toBe(8);
  expect(stream.ReadUniOrByteStringLine(2)).toBe("D");
  expect(stream.ReadUniOrByteStringLine(2)).toBe("Z");
});

it("writes source Unicode-or-byte text, characters, and byte-order marks", /** Checks writes source Unicode-or-byte text, characters, and byte-order marks. @returns Test completion or assertion result. */ () => {
  const unicode = new SvStream(new Uint8Array(), RTL_TEXTENCODING_UNICODE);
  unicode.StartWritingUnicodeText();
  expect(unicode.WriteUnicodeOrByteText("A", RTL_TEXTENCODING_UNICODE, true)).toBe(true);
  expect(unicode.WriteUniOrByteChar(10)).toBe(true);
  expect([...unicode.GetData()]).toEqual([0xff, 0xfe, 65, 0, 0, 0, 10, 0]);
  expect(unicode.Tell()).toBe(8);

  const bytes = new SvStream(new Uint8Array(), RTL_TEXTENCODING_MS_1252);
  bytes.WriteUChar(0xef).WriteUChar(0xbb).WriteUChar(0xbf);
  expect(bytes.WriteUnicodeOrByteText("Café")).toBe(true);
  expect(bytes.WriteUniOrByteChar(10)).toBe(true);
  expect([...bytes.GetData()]).toEqual([0xef, 0xbb, 0xbf, 67, 97, 102, 233, 10]);
  expect(bytes.Tell()).toBe(8);

  const rawBom = new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8);
  rawBom.StartWritingUnicodeText();
  expect([...rawBom.GetData()]).toEqual([0xff, 0xfe]);

  const bigEndian = new SvStream(Uint8Array.of(0xfe, 0xff), RTL_TEXTENCODING_UNICODE);
  bigEndian.StartReadingUnicodeText(RTL_TEXTENCODING_UNICODE);
  bigEndian.WriteUniOrByteChar(65);
  expect([...bigEndian.GetData()]).toEqual([0xfe, 0xff, 0, 65]);
});

it("writes raw string views including NUL and high bytes without Unicode recoding", /** Verifies writes raw string views including NUL and high bytes without Unicode recoding. @returns Nothing. */ () => {
  const stream = new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8);
  expect(stream.WriteOString("A\0\xff\xe9")).toBe(stream);
  expect(stream.WriteChar(0x180).WriteChar("}").WriteNumberAsString(-32768)).toBe(stream);
  expect([...stream.GetData()]).toEqual([65, 0, 255, 233, 128, 125, 45, 51, 50, 55, 54, 56]);
});
