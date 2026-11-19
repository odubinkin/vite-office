/** @fileoverview Source-derived export-string contracts exercised only through real constructors/public value operations and actual serializers. */
import { expect, it } from "vitest";
import { XclExpString } from "../inc/xestring";
import { XclStrFlags, XclFormatRun, EXC_STR_MAXLEN } from "../inc/xlstring";
import { EXC_FONT_NOTFOUND } from "../inc/xlstyle";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { RTL_TEXTENCODING_UTF8, RTL_TEXTENCODING_MS_1252 } from "../../../../sal/inc/rtl/textenc";
import { XclXmlUtils } from "./xestream";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { readOwnedXml } from "../../../../test/oox-input";
/** Constructs through the actual Unicode owner. @param value - Text. @param flags - Flags. @param maximum - Maximum. @returns Export value. */
function string(value: string, flags = XclStrFlags.NONE, maximum = EXC_STR_MAXLEN) {
  const source = unicode(value);
  try {
    return new XclExpString(source, flags, maximum);
  } finally {
    source.dispose();
  }
}
/** Invokes original encoded assignment with actual SAL conversion. @param value - Text. @param flags - Flags. @param maximum - Maximum. @returns Byte string. */
function bytes(value: string, flags = XclStrFlags.NONE, maximum = EXC_STR_MAXLEN) {
  const result = new XclExpString(),
    source = unicode(value);
  try {
    result.AssignByte(source, RTL_TEXTENCODING_UTF8, flags, maximum);
  } finally {
    source.dispose();
  }
  return result;
}
/** Allocates the admitted native output span and writes actual bytes. @param value - String. @returns Encoded header and buffer. */
function memory(value: XclExpString) {
  const result = new Uint8Array(value.GetSize());
  value.WriteToMem(result);
  return Array.from(result);
}

it("retains original default, forced-Unicode, smart-empty and 8-bit header policies", /** Checks literal wire values. @returns Nothing. */ () => {
  expect(memory(new XclExpString())).toEqual([0, 0, 0]);
  expect(memory(new XclExpString(XclStrFlags.SmartFlags))).toEqual([0, 0]);
  expect(memory(string("", XclStrFlags.ForceUnicode))).toEqual([0, 0, 1]);
  expect(memory(new XclExpString(XclStrFlags.SmartFlags | XclStrFlags.EightBitLength))).toEqual([
    0,
  ]);
  expect(memory(string("A", XclStrFlags.NoHeader))).toEqual([1, 0, 0, 65]);
  expect(memory(string("é"))).toEqual([1, 0, 0, 233]);
  expect(memory(string("字"))).toEqual([1, 0, 1, 0x57, 0x5b]);
  expect(memory(string("😀"))).toEqual([2, 0, 1, 0x3d, 0xd8, 0, 0xde]);
  expect(memory(string("A", XclStrFlags.ForceUnicode | XclStrFlags.EightBitLength))).toEqual([
    1, 1, 65, 0,
  ]);
});

it("clips actual UTF16 units and encoded bytes with original defaults and reset rules", /** No surrogate repair or character-based byte limit is inserted. @returns Nothing. */ () => {
  const value = string("😀\n", XclStrFlags.NONE, 1);
  expect(value.Len()).toBe(1);
  expect(value.GetChar(0)).toBe(0xd83d);
  expect(value.HasNewline()).toBe(false);
  expect(string("x".repeat(40000)).Len()).toBe(32767);
  expect(string("x".repeat(300), XclStrFlags.EightBitLength, 65535).Len()).toBe(255);
  expect(string("abc", XclStrFlags.EightBitLength, 2).Len()).toBe(2);
  expect(string("abc", XclStrFlags.NONE, 0).IsEmpty()).toBe(true);
  const encoded = bytes("é", XclStrFlags.ForceUnicode | XclStrFlags.SmartFlags, 1);
  expect(memory(encoded)).toEqual([1, 0, 0xc3]);
  expect(encoded.GetUnicodeBuffer()).toHaveLength(0);
  expect(encoded.GetChar(0)).toBe(0xc3);
  value.AppendFormat(0, 4);
  value.SetSingleLineForMultipleParagraphs(true);
  value.Assign(10);
  expect(value.GetChar(0)).toBe(10);
  expect(value.HasNewline()).toBe(true);
  expect(value.IsRich()).toBe(false);
  expect(value.IsSingleLineForMultipleParagraphs()).toBe(false);
});

it("appends in the original mode, retaining Unicode and LF flags only for stored prefixes", /** Uses actual encoding including the NUL-character overload. @returns Nothing. */ () => {
  const value = string("a", XclStrFlags.NONE, 4),
    source = unicode("字\nbeyond");
  try {
    value.Append(source);
  } finally {
    source.dispose();
  }
  expect(Array.from(value.GetUnicodeBuffer())).toEqual([97, 0x5b57, 10, 98]);
  expect(value.HasNewline()).toBe(true);
  value.Append(Uint16Array.of(120));
  expect(value.Len()).toBe(4);
  expect(value.GetFlagField()).toBe(1);
  const byteValue = bytes("a", XclStrFlags.EightBitLength, 6),
    addition = unicode("é\n");
  try {
    byteValue.AppendByte(addition, RTL_TEXTENCODING_UTF8);
  } finally {
    addition.dispose();
  }
  byteValue.AppendByte(0, RTL_TEXTENCODING_UTF8);
  byteValue.AppendByte(0xe9, RTL_TEXTENCODING_UTF8);
  expect(memory(byteValue)).toEqual([6, 97, 0xc3, 0xa9, 10, 0, 0xc3]);
  expect(byteValue.HasNewline()).toBe(true);
  expect(byteValue.GetFlagField()).toBe(0);
  const before = memory(byteValue);
  byteValue.Append(Uint16Array.of(88));
  expect(memory(byteValue)).toEqual(before);
  value.AppendByte(88, RTL_TEXTENCODING_UTF8);
  expect(value.Len()).toBe(4);
  const empty = unicode("");
  try {
    byteValue.AppendByte(empty, RTL_TEXTENCODING_UTF8);
  } finally {
    empty.dispose();
  }
});

it("keeps single-byte SAL encoding and zero-length raw-buffer writes", /** Header and buffer output use their actual separate methods. @returns Nothing. */ () => {
  const value = new XclExpString(),
    source = unicode("€é\n");
  try {
    value.AssignByte(source, RTL_TEXTENCODING_MS_1252);
  } finally {
    source.dispose();
  }
  expect(memory(value)).toEqual([3, 0, 0x80, 0xe9, 10]);
  const output = Uint8Array.of(0xaa, 0xbb);
  new XclExpString().WriteBufferToMem(output);
  expect(Array.from(output)).toEqual([0xaa, 0xbb]);
});

it("retains native formatting-run deduplication, sentinels, caps, ordering and equality", /** Runs remain genuine values, never substitute font providers. @returns Nothing. */ () => {
  const value = string("abc");
  expect(value.GetLeadingFont()).toBe(EXC_FONT_NOTFOUND);
  expect(value.RemoveLeadingFont()).toBe(EXC_FONT_NOTFOUND);
  value.AppendFormat(1, 4);
  expect(value.GetLeadingFont()).toBe(EXC_FONT_NOTFOUND);
  value.AppendFormat(2, 4);
  expect(value.GetFormatsCount()).toBe(1);
  value.AppendTrailingFormat(4);
  expect(value.GetFormatsCount()).toBe(2);
  expect(value.GetFormats()[1]).toEqual(new XclFormatRun(3, 4));
  expect(value.GetFlagField()).toBe(8);
  expect(value.GetHeaderSize()).toBe(5);
  expect(value.GetSize()).toBe(16);
  value.LimitFormatCount(1);
  value.LimitFormatCount(4);
  expect(value.GetFormatsCount()).toBe(1);
  value.LimitFormatCount(0);
  value.AppendFormat(0, 9);
  expect(value.RemoveLeadingFont()).toBe(9);
  expect(value.IsRich()).toBe(false);
  const separate = string("abc", XclStrFlags.SeparateFormats);
  separate.AppendFormat(0, 1);
  expect(separate.GetFlagField()).toBe(0);
  expect(separate.GetHeaderSize()).toBe(3);
  expect(separate.GetSize()).toBe(6);
  const capped = bytes("a");
  for (let i = 0; i < 260; ++i) capped.AppendFormat(i, i, false);
  expect(capped.GetFormatsCount()).toBe(255);
  const uncapped = string("a");
  for (let i = 0; i < 32770; ++i) uncapped.AppendFormat(i, i, false);
  expect(uncapped.GetFormatsCount()).toBe(32767);
  expect(new XclFormatRun(1, 2).equals(new XclFormatRun(1, 3))).toBe(false);
  expect(new XclFormatRun(1, 2).lessThan(new XclFormatRun(1, 3))).toBe(true);
  expect(new XclFormatRun(1, 4).lessThan(new XclFormatRun(2, 0))).toBe(true);
});

it("preserves source comparisons and fixed folded hashes, including mixed-mode incomparability", /** Original mode assumptions are retained rather than normalized. @returns Nothing. */ () => {
  const a = string("a"),
    b = string("b"),
    same = string("a", XclStrFlags.NoHeader);
  expect(a.IsEqual(same)).toBe(true);
  same.SetSingleLineForMultipleParagraphs(true);
  expect(a.IsEqual(same)).toBe(true);
  expect(a.GetHash()).toBe(128);
  expect(string("").GetHash()).toBe(0);
  expect(a.IsLessThan(b)).toBe(true);
  expect(b.IsLessThan(a)).toBe(false);
  expect(a.IsLessThan(same)).toBe(false);
  expect(a.IsEqual(b)).toBe(false);
  expect(a.IsEqual(string("a", XclStrFlags.ForceUnicode))).toBe(false);
  const encoded = bytes("x");
  expect(a.IsEqual(encoded)).toBe(false);
  expect(a.IsLessThan(encoded)).toBe(false);
  expect(encoded.IsLessThan(a)).toBe(false);
  expect(bytes("a").IsLessThan(encoded)).toBe(true);
  expect(bytes("a").IsEqual(bytes("a"))).toBe(true);
  a.AppendFormat(0, 2);
  same.AppendFormat(0, 3);
  expect(a.GetHash()).toBe(161);
  expect(a.IsEqual(same)).toBe(false);
  expect(a.IsLessThan(same)).toBe(true);
  expect(same.IsLessThan(a)).toBe(false);
  const shorter = string("a");
  expect(shorter.IsLessThan(a)).toBe(true);
  expect(a.IsLessThan(shorter)).toBe(false);
});

it("connects the actual export string to both XML conversions without truncating NUL or Unicode", /** Byte-mode strings use the original empty Unicode buffer, not a new decoding fallback. @returns Nothing. */ () => {
  const source = string(" A\0字😀\n"),
    native = XclXmlUtils.ToOUString(source);
  try {
    expect(text(native)).toBe(" A\0字😀\n");
  } finally {
    native.dispose();
  }
  expect(new TextDecoder().decode(XclXmlUtils.ToOString(source))).toBe(" A\0字😀\n");
  const byteSource = bytes("abc"),
    byteNative = XclXmlUtils.ToOUString(byteSource);
  try {
    expect(byteNative.isEmpty()).toBe(true);
  } finally {
    byteNative.dispose();
  }
  expect(XclXmlUtils.ToOString(byteSource)).toHaveLength(0);
});

it("serializes genuine export text into a committed shared-string part and independently reopens it", /** Qualifies text emission, not a complete workbook or rich-font exporter. @returns Completion. */ async () => {
  const value = string(" A\0<&字😀\n"),
    filter = new XmlFilterBase(new ZipStorage()),
    serializer = filter.openFragmentStreamWithSerializer(
      "xl/sharedStrings.xml",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml",
    );
  serializer.startElement(
    token("sst"),
    token("xmlns"),
    "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
  );
  serializer.startElement(token("si"));
  serializer.startElement(token("t"), (token("xml") << 16) | token("space"), "preserve");
  serializer.writeEscaped(XclXmlUtils.ToOString(value));
  serializer.endElement(token("t"));
  serializer.endElement(token("si"));
  serializer.endElement(token("sst"));
  serializer.endDocument();
  const archive = await ZipStorage.open(await filter.commitStorage()),
    input = await archive.openInputStream("xl/sharedStrings.xml"),
    xml = readOwnedXml(input);
  expect(xml).toContain('xml:space="preserve"');
  expect(xml).toContain(" A_x0000_&lt;&amp;字😀&#10;");
});

it("copies the actual vectors, format values and append limits independently", /** Original implicit copy is a value copy, not a shared host-array view. @returns Nothing. */ () => {
  expect(new XclFormatRun()).toEqual({ mnChar: 0, mnFontIdx: 0 });
  expect(new XclFormatRun(65537, 65538)).toEqual({ mnChar: 1, mnFontIdx: 2 });
  const native = unicode("a");
  try {
    expect(new XclExpString(native).Len()).toBe(1);
  } finally {
    native.dispose();
  }
  const original = string("字\n", XclStrFlags.ForceUnicode, 3);
  original.AppendFormat(0, 1);
  original.SetSingleLineForMultipleParagraphs(true);
  const copy = new XclExpString(original);
  expect(copy.IsEqual(original)).toBe(true);
  expect(copy.GetUnicodeBuffer()).not.toBe(original.GetUnicodeBuffer());
  expect(copy.GetFormats()[0]).not.toBe(original.GetFormats()[0]);
  expect(copy.IsSingleLineForMultipleParagraphs()).toBe(true);
  copy.Append(Uint16Array.of(97, 98));
  copy.RemoveLeadingFont();
  expect(copy.Len()).toBe(3);
  expect(original.Len()).toBe(2);
  expect(original.GetFormatsCount()).toBe(1);
  const byteOriginal = bytes("é"),
    byteCopy = new XclExpString(byteOriginal);
  expect(byteCopy.IsEqual(byteOriginal)).toBe(true);
  byteCopy.AppendByte(0, RTL_TEXTENCODING_UTF8);
  expect(byteCopy.Len()).toBe(3);
  expect(byteOriginal.Len()).toBe(2);
});
