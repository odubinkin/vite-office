/** @fileoverview Original Shift-JIS descriptor identity, MS-932 distinction and actual RTL encode/decode entrypoints. */
import { expect, it } from "vitest";
import { aImplSJISDBCSCvtData, aSJISUniLeadTab, aSJISDBCSHighTab } from "./tcvtjp6.sjis";
import { aImplMS932DBCSCvtData, aImplSJISDBCSEUDCTab } from "./tcvtjp6.ms932";
import { getTextToUnicodeData } from "./tables";
import * as C from "./textcvt";
import * as F from "../inc/rtl/textcvt.h";
import { RTL_TEXTENCODING_SHIFT_JIS } from "../inc/rtl/textenc";
it("binds original SJIS lead/reverse pointers and the shared EUDC table", /** The native descriptor has no MS932 table substitution. @returns Nothing. */ () => {
  expect(aSJISUniLeadTab.length).toBe(256);
  expect(aSJISDBCSHighTab.length).toBe(256);
  expect(aImplSJISDBCSCvtData.mpToUniLeadTab).toBe(aSJISUniLeadTab);
  expect(aImplSJISDBCSCvtData.mpToDBCSHighTab).toBe(aSJISDBCSHighTab);
  expect(aImplSJISDBCSCvtData.mpEUDCTab).toBe(aImplSJISDBCSEUDCTab);
  expect(aImplMS932DBCSCvtData.mpEUDCTab).toBe(aImplSJISDBCSEUDCTab);
  expect(aImplSJISDBCSCvtData).not.toBe(aImplMS932DBCSCvtData);
  const descriptor = getTextToUnicodeData(RTL_TEXTENCODING_SHIFT_JIS);
  expect(descriptor?.kind).toBe("dbcs");
  if (descriptor?.kind === "dbcs") expect(descriptor.data).toBe(aImplSJISDBCSCvtData);
});
it("uses original wave-dash and private-use mappings through both RTL conversion directions", /** These initialized caller buffers exercise real converter descriptors and contexts. @returns Nothing. */ () => {
  const converter = C.rtl_createTextToUnicodeConverter(RTL_TEXTENCODING_SHIFT_JIS),
    context = C.rtl_createTextToUnicodeContext(converter),
    reverse = C.rtl_createUnicodeToTextConverter(RTL_TEXTENCODING_SHIFT_JIS),
    reverseContext = C.rtl_createUnicodeToTextContext(reverse),
    out = new Uint16Array(4),
    encoded = new Uint8Array(8),
    info: [number] = [0],
    consumed: [number] = [0];
  try {
    const count = C.rtl_convertTextToUnicode(
      converter,
      context,
      Uint8Array.of(0x81, 0x60, 0xf0, 0x40),
      4,
      out,
      4,
      F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT |
        F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
        F.RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,
      info,
      consumed,
    );
    expect(count).toBe(2);
    expect([...out.subarray(0, count)]).toEqual([0xff5e, 0xe000]);
    expect(consumed[0]).toBe(4);
    const n = C.rtl_convertUnicodeToText(
      reverse,
      reverseContext,
      out,
      count,
      encoded,
      encoded.length,
      F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT | F.RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT,
      info,
      consumed,
    );
    expect([...encoded.subarray(0, n)]).toEqual([0x81, 0x60, 0xf0, 0x40]);
    expect(consumed[0]).toBe(2);
  } finally {
    C.rtl_destroyUnicodeToTextContext(reverse, reverseContext);
    C.rtl_destroyUnicodeToTextConverter(reverse);
    C.rtl_destroyTextToUnicodeContext(converter, context);
    C.rtl_destroyTextToUnicodeConverter(converter);
  }
});
