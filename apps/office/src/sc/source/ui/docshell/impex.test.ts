/** @fileoverview CSV stream conversion using actual Calc document cells. */
import { assert, expect, it } from "vitest";
import { LANGUAGE_GERMAN } from "../../../../i18nlangtag/inc/lang";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_MS_1252,
  RTL_TEXTENCODING_UNICODE,
  RTL_TEXTENCODING_UTF8,
} from "../../../../sal/inc/rtl/textenc";
import { SvStream } from "../../../../tools/source/stream/stream";
import { ScAddress } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";
import { SC_COL_SKIP, SC_COL_STANDARD, SC_COL_TEXT, ScAsciiOptions } from "../dbgui/asciiopt";
import { ReadCsvLine, ScImportExport } from "./impex";

it.each([",", "\t", ";", " "])(
  "retries ReadCsvLine with the detected %j separator before joining quoted lines",
  /** Checks retries ReadCsvLine with the detected %j separator before joining quoted lines. @param separator - Separator. @returns Test completion or assertion result. */ (
    separator,
  ) => {
    const stream = new SvStream(
      new TextEncoder().encode(`"a"${separator}"b\nc"\nnext\n`),
      RTL_TEXTENCODING_UTF8,
    );
    const separators: [string] = ["|"],
      detect: [number] = [0];
    expect(ReadCsvLine(stream, true, separators, '"', detect)).toBe(`"a"${separator}"b\nc"`);
    expect(separators[0]).toBe(`|${separator}`);
    expect(detect[0]).toBe(separator.charCodeAt(0));
    expect(ReadCsvLine(stream, true, separators, '"', detect)).toBe("next");
  },
);

it("prefers punctuation after a closing quote over a possible blank separator and ignores escaped quotes", /** Checks prefers punctuation after a closing quote over a possible blank separator and ignores escaped quotes. @returns Test completion or assertion result. */ () => {
  const stream = new SvStream(new TextEncoder().encode('"a"",b" ;"c\nd"\n'), RTL_TEXTENCODING_UTF8);
  const separators: [string] = ["|"],
    detect: [number] = [0];
  expect(ReadCsvLine(stream, true, separators, '"', detect)).toBe('"a"",b" ;"c\nd"');
  expect(separators[0]).toBe("|;");
  expect(detect[0]).toBe(59);
});

it("treats NUL after a quote as a field end before the higher-level embedded-NUL removal", /** Checks treats NUL after a quote as a field end before the higher-level embedded-NUL removal. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"a"\0,"b\nc"\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("a");
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_EDIT);
  const value = doc
    .GetRefCellValue(new ScAddress(1, 0, 0))
    .getEditText()
    ?.GetText();
  assert(value);
  try {
    expect(text(value)).toBe("b\nc");
  } finally {
    value.dispose();
  }
});

it.each([1, 2])(
  "rewinds an open quoted field to its first physical line after the preview limit %i",
  /** Checks rewinds an open quoted field to its first physical line after the preview limit %i. @param limit - Limit. @returns Test completion or assertion result. */ (
    limit,
  ) => {
    const stream = new SvStream(
      new TextEncoder().encode('"a\nb\nc",2\nnext\n'),
      RTL_TEXTENCODING_UTF8,
    );
    const separators: [string] = [","],
      detect: [number] = [0xffff];
    expect(ReadCsvLine(stream, true, separators, '"', detect, limit)).toBe('"a');
    expect(ReadCsvLine(stream, true, separators, '"', detect)).toBe("b");
    expect(detect[0]).toBe(0xffff);
  },
);

it("advances the source ScanNextFieldFromString cursor through quotes, dirty suffixes and merged separators", /** Checks advances the source ScanNextFieldFromString cursor through quotes, dirty suffixes and merged separators. @returns Test completion or assertion result. */ () => {
  const overflow: [boolean] = [false];
  expect(
    ScImportExport.ScanNextFieldFromString('  "a,b"  ,x', 0, '"', ",", false, true, overflow),
  ).toEqual({ field: { value: "a,b", quoted: true }, next: 10 });
  expect(
    ScImportExport.ScanNextFieldFromString('"a""b",,x', 0, '"', ",", true, false, overflow),
  ).toEqual({ field: { value: 'a"b', quoted: true }, next: 8 });
  expect(
    ScImportExport.ScanNextFieldFromString('"open,more', 0, '"', ",", false, false, overflow),
  ).toEqual({ field: { value: '"open', quoted: true }, next: 6 });
  expect(overflow[0]).toBe(false);
});

it("applies lcl_appendLineData's limit across escaped quotes and dirty field suffixes", /** Checks applies lcl_appendLineData's limit across escaped quotes and dirty field suffixes. @returns Test completion or assertion result. */ () => {
  const overflow: [boolean] = [false];
  const escaped = ScImportExport.ScanNextFieldFromString(
    '"' + "x".repeat(65534) + '""",next',
    0,
    '"',
    ",",
    false,
    false,
    overflow,
  );
  expect(escaped.field.value).toBe("x".repeat(65534) + '"');
  expect(overflow[0]).toBe(false);
  const suffix = ScImportExport.ScanNextFieldFromString(
    '"' + "x".repeat(65534) + '"  ,next',
    0,
    '"',
    ",",
    false,
    false,
    overflow,
  );
  expect(suffix.field.value).toBe("x".repeat(65534) + " ");
  expect(overflow[0]).toBe(true);
});

it("keeps SetExtOptions' copied separators and column metadata after caller mutation", /** Checks keeps SetExtOptions' copied separators and column metadata after caller mutation. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.mvColStart = [2];
  options.mvColFormat = [SC_COL_SKIP];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  options.aFieldSeps = ";";
  options.mvColStart[0] = 1;
  options.mvColFormat[0] = SC_COL_TEXT;
  expect(converter.ImportStream(new TextEncoder().encode("7,discard,8\n"))).toBe(true);
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(7);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(8);
});

it("treats a zero text delimiter as disabled during CSV import", /** Checks treats a zero text delimiter as disabled during CSV import. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.cTextSep = "\0";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"A,B",C\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe('"A');
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe('B"');
  expect(text(doc.GetSharedString(new ScAddress(2, 0, 0)).getString())).toBe("C");
});

it("imports quoted separators, doubled quotes, skipped columns, BOM and numeric fields", /** Checks imports quoted separators, doubled quotes, skipped columns, BOM and numeric fields. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.eCharSet = RTL_TEXTENCODING_UTF8;
  options.mvColStart = [2, 3];
  options.mvColFormat = [SC_COL_SKIP, SC_COL_TEXT];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(
    converter.ImportStream(
      new TextEncoder().encode('\uFEFF"Hello, world",discard,"1",2\n"a""b",x,"3",4\n'),
    ),
  ).toBe(true);
  expect(converter.GetIncludeBOM()).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("Hello, world");
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("1");
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(2);
  expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe('a"b');
});

it("treats opposite CR/LF pairs as one physical line ending like SvStream", /** Checks treats opposite CR/LF pairs as one physical line ending like SvStream. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('A,1\n\r"B\n\rC",2\r\nD,3\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("A");
  const edit = doc.GetRefCellValue(new ScAddress(0, 1, 0)).getEditText();
  assert(edit);
  const value = edit.GetText();
  try {
    expect(text(value)).toBe("B\nC");
  } finally {
    value.dispose();
  }
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(2);
  expect(text(doc.GetSharedString(new ScAddress(0, 2, 0)).getString())).toBe("D");
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(3);
});

it("skips logical CSV records through ReadCsvLine before importing the start row", /** Checks skips logical CSV records through ReadCsvLine before importing the start row. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.nStartRow = 2;
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"skip\nthis",1\nA,2\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("A");
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
  expect(doc.GetCellType(new ScAddress(0, 1, 0))).toBe(CellType.CELLTYPE_NONE);
});

it("consumes separator-column format records in source order", /** Checks consumes separator-column format records in source order. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.mvColStart = [2, 1];
  options.mvColFormat = [SC_COL_TEXT, SC_COL_SKIP];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("7,8\n"))).toBe(true);
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(8);
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_NONE);
});

it("retains ExtText2Doc's pass-start last column across rows with trailing empty fields", /** Checks retains ExtText2Doc's pass-start last column across rows with trailing empty fields. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  doc.SetTextCell(new ScAddress(1, 0, 0), unicode("first-row-old"));
  doc.SetTextCell(new ScAddress(1, 1, 0), unicode("second-row-old"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("A,\nB,\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("first-row-old");
  expect(text(doc.GetSharedString(new ScAddress(1, 1, 0)).getString())).toBe("second-row-old");
});

it("does not extend the pass-start last column when a trailing source column is skipped", /** Checks does not extend the pass-start last column when a trailing source column is skipped. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  doc.SetTextCell(new ScAddress(1, 1, 0), unicode("old"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.mvColStart = [2];
  options.mvColFormat = [SC_COL_SKIP];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("A\nB,\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(1, 1, 0)).getString())).toBe("old");
});

it("reports separated-cell overflow after applying the source 65535-character limit", /** Checks reports separated-cell overflow after applying the source 65535-character limit. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("x".repeat(65536) + "\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress()).getString()).length).toBe(65535);
  expect(converter.IsOverflowCell()).toBe(true);
  expect(converter.IsOverflow()).toBe(true);
});

it("keeps the source fixed-width quoted-field boundary at 65536 characters", /** Checks keeps the source fixed-width quoted-field boundary at 65536 characters. @returns Test completion or assertion result. */ () => {
  for (const [length, expected, overflow] of [
    [65536, 65536, false],
    [65537, 65535, true],
  ] as const) {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Sheet1"));
    const options = new ScAsciiOptions();
    options.bFixedLen = true;
    options.mvColStart = [0];
    options.mvColFormat = [SC_COL_TEXT];
    const converter = new ScImportExport(doc);
    converter.SetExtOptions(options);
    expect(converter.ImportStream(new TextEncoder().encode('"' + "x".repeat(length) + '"\n'))).toBe(
      true,
    );
    expect(text(doc.GetSharedString(new ScAddress()).getString()).length).toBe(expected);
    expect(converter.IsOverflowCell()).toBe(overflow);
  }
});

it("does not scan a skipped fixed-width field for cell overflow", /** Checks does not scan a skipped fixed-width field for cell overflow. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.bFixedLen = true;
  options.mvColStart = [0];
  options.mvColFormat = [SC_COL_SKIP];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("x".repeat(65536) + "\n"))).toBe(true);
  expect(converter.IsOverflowCell()).toBe(false);
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
});

it("honors evaluate-formula and quoted-as-text options", /** Checks honors evaluate-formula and quoted-as-text options. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.bEvaluateFormulas = false;
  options.bQuotedFieldAsText = true;
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  converter.ImportStream(new TextEncoder().encode('=1+2,"42",42\n'));
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(42);
});
it("keeps a lone equals sign as text and multiline formula-looking input as an edit cell", /** Checks keeps a lone equals sign as text and multiline formula-looking input as an edit cell. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('=,=1+1,"=1\n+2"\n'))).toBe(true);
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("=");
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_FORMULA);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
  expect(doc.GetCellType(new ScAddress(2, 0, 0))).toBe(CellType.CELLTYPE_EDIT);
  const edit = doc.GetRefCellValue(new ScAddress(2, 0, 0)).getEditText();
  assert(edit);
  const content = edit.GetText();
  try {
    expect(text(content)).toBe("=1\n+2");
  } finally {
    content.dispose();
  }
});
it("imports a formula before the numeric cell it references through the document importer", /** Checks imports a formula before the numeric cell it references through the document importer. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("=B1*2,21\n"))).toBe(true);
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_FORMULA);
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(42);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(21);
});
it("decodes ANSI CSV through the original MS-1252 byte table", /** Checks decodes ANSI CSV through the original MS-1252 byte table. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.eCharSet = RTL_TEXTENCODING_MS_1252;
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new Uint8Array([0x43, 0x61, 0x66, 0xe9, 0x2c, 0x80, 0x0a]))).toBe(
    true,
  );
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("Café");
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("€");
});
it("decodes the source MS-1251 descriptor from the native numeric filter token", /** Checks decodes the source MS-1251 descriptor from the native numeric filter token. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.ReadFromString(`44,34,${RTL_TEXTENCODING_MS_1251},1,,0`);
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new Uint8Array([0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2, 0x0a]))).toBe(
    true,
  );
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("Привет");
});
it("recognizes both Unicode stream BOM byte orders before parsing cells", /** Checks recognizes both Unicode stream BOM byte orders before parsing cells. @returns Test completion or assertion result. */ () => {
  for (const bytes of [
    new Uint8Array([0xff, 0xfe, 0x41, 0, 0x2c, 0, 0x42, 0, 0x0a, 0]),
    new Uint8Array([0xfe, 0xff, 0, 0x41, 0, 0x2c, 0, 0x42, 0, 0x0a]),
  ]) {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Sheet1"));
    const options = new ScAsciiOptions();
    options.aFieldSeps = ",";
    options.eCharSet = RTL_TEXTENCODING_UNICODE;
    const converter = new ScImportExport(doc);
    converter.SetExtOptions(options);
    expect(converter.ImportStream(bytes)).toBe(true);
    expect(converter.GetIncludeBOM()).toBe(true);
    expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("A");
    expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("B");
  }
});

it("uses StartReadingUnicodeText's BOM-selected encoding when the charset is unknown", /** Checks uses StartReadingUnicodeText's BOM-selected encoding when the charset is unknown. @returns Test completion or assertion result. */ () => {
  for (const bytes of [
    new Uint8Array([0xef, 0xbb, 0xbf, 0xc3, 0xa9, 0x0a]),
    new Uint8Array([0xff, 0xfe, 0xe9, 0, 0x0a, 0]),
    new Uint8Array([0xfe, 0xff, 0, 0xe9, 0, 0x0a]),
  ]) {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Sheet1"));
    const options = new ScAsciiOptions();
    options.eCharSet = RTL_TEXTENCODING_DONTKNOW;
    const converter = new ScImportExport(doc);
    converter.SetExtOptions(options);
    expect(converter.ImportStream(bytes)).toBe(true);
    expect(converter.GetIncludeBOM()).toBe(true);
    expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("é");
  }
});

it("consumes only the first BOM and preserves a second U+FEFF as cell content", /** Checks consumes only the first BOM and preserves a second U+FEFF as cell content. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("\uFEFF\uFEFFA\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("\uFEFFA");
});

it("retains ExtText2Doc's BOM flag when the same importer reads another stream", /** Checks retains ExtText2Doc's BOM flag when the same importer reads another stream. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(new ScAsciiOptions());
  expect(converter.GetIncludeBOM()).toBe(false);
  expect(converter.ImportStream(new TextEncoder().encode("\uFEFFA\n"))).toBe(true);
  expect(converter.GetIncludeBOM()).toBe(true);
  expect(converter.ImportStream(new TextEncoder().encode("B\n"))).toBe(true);
  expect(converter.GetIncludeBOM()).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("B");
});

it("keeps quoted line breaks as native edit cells through CSV and ODS", /** Checks keeps quoted line breaks as native edit cells through CSV and ODS. @returns Test completion or assertion result. */ async () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"first\nsecond",7\n'))).toBe(true);
  const pos = new ScAddress(0, 0, 0);
  expect(doc.GetCellType(pos)).toBe(CellType.CELLTYPE_EDIT);
  const reload = await readOdsDocument(writeOdsDocument(doc));
  expect(reload.GetCellType(pos)).toBe(CellType.CELLTYPE_EDIT);
  const edit = reload.GetRefCellValue(pos).getEditText();
  assert(edit);
  const value = edit.GetText();
  try {
    expect(text(value)).toBe("first\nsecond");
  } finally {
    value.dispose();
  }
});
it("removes one terminal LF from a quoted field as ExtText2Doc does", /** Checks removes one terminal LF from a quoted field as ExtText2Doc does. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"A\n",2\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("A");
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
});
it("rewinds an unmatched opening quote to the first physical line as ReadCsvLine does", /** Checks rewinds an unmatched opening quote to the first physical line as ReadCsvLine does. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"open\nnext,2\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe('"open');
  expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("next");
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(2);
});
it("keeps quoted spaces and tabs while trimming only unquoted ASCII blanks", /** Checks keeps quoted spaces and tabs while trimming only unquoted ASCII blanks. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  options.bRemoveSpace = true;
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('  " a "  , \tb\t ,"x"tail  \n'))).toBe(
    true,
  );
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe(" a ");
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("\tb\t");
  expect(text(doc.GetSharedString(new ScAddress(2, 0, 0)).getString())).toBe('"x"tail');
});
it("splits fixed-width CSV at ICU visual columns rather than UTF-16 offsets", /** Checks splits fixed-width CSV at ICU visual columns rather than UTF-16 offsets. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.bFixedLen = true;
  options.mvColStart = [0, 1, 3];
  options.mvColFormat = [SC_COL_TEXT, SC_COL_TEXT, SC_COL_TEXT];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("A漢B\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("A");
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("漢");
  expect(text(doc.GetSharedString(new ScAddress(2, 0, 0)).getString())).toBe("B");
  const cursor: [number] = [0];
  expect(ScImportExport.CountVisualWidth("漢B", cursor, 1)).toBe(2);
  expect(cursor[0]).toBe(1);
  cursor[0] = 0;
  expect(ScImportExport.CountVisualWidth("A\u200dB", cursor, 1)).toBe(1);
  expect(cursor[0]).toBe(2);
});

it("retains a default-ignorable after the width boundary and strips fixed-field quotes", /** Checks retains a default-ignorable after the width boundary and strips fixed-field quotes. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.bFixedLen = true;
  options.bQuotedFieldAsText = true;
  options.mvColStart = [0, 2, 8];
  options.mvColFormat = [SC_COL_TEXT, SC_COL_STANDARD, SC_COL_TEXT];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('A\u200dB"42"  x\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("A\u200dB");
  expect(text(doc.GetSharedString(new ScAddress(1, 0, 0)).getString())).toBe("42");
  expect(text(doc.GetSharedString(new ScAddress(2, 0, 0)).getString())).toBe("x");
});

it("uses each fixed-width column's own format and skips its source field", /** Checks uses each fixed-width column's own format and skips its source field. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.bFixedLen = true;
  options.mvColStart = [0, 1, 2];
  options.mvColFormat = [SC_COL_SKIP, SC_COL_TEXT, SC_COL_STANDARD];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("x12\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("1");
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
});

it("keeps fixed-width physical lines separate even after an opening quote", /** Checks keeps fixed-width physical lines separate even after an opening quote. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.bFixedLen = true;
  options.mvColStart = [0];
  options.mvColFormat = [SC_COL_TEXT];
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode('"A\nB\n'))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe('"A');
  expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("B");
});

it("strips embedded NUL code units from the raw line before scanning fields", /** Checks strips embedded NUL code units from the raw line before scanning fields. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ",";
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("a\0b,2\0\n"))).toBe(true);
  expect(text(doc.GetSharedString(new ScAddress(0, 0, 0)).getString())).toBe("ab");
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(2);
});

it("uses the filter language's formatter separators for simple numbers", /** Checks uses the filter language's formatter separators for simple numbers. @returns Test completion or assertion result. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Sheet1"));
  const options = new ScAsciiOptions();
  options.aFieldSeps = ";";
  options.eLang = LANGUAGE_GERMAN;
  const converter = new ScImportExport(doc);
  converter.SetExtOptions(options);
  expect(converter.ImportStream(new TextEncoder().encode("1,5;1.234,5\n"))).toBe(true);
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(1.5);
  expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(1234.5);
});
