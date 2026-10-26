/** @fileoverview Native CSV filter token compatibility from asciiopt.cxx and imoptdlg.cxx. */
import { expect, it } from "vitest";
import { RTL_TEXTENCODING_DONTKNOW, RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvStream } from "../../../../tools/source/stream/stream";
import { ScGlobal } from "../../../inc/global";
import { ScAsciiOptions } from "./asciiopt";
import { ScImportOptions } from "./imoptdlg";

it("retains the native CSV defaults and 15-token option ordering", /** Checks retains the native CSV defaults and 15-token option ordering. @returns Test completion or assertion result. */ () => {
  const options = new ScAsciiOptions();
  expect(options.aFieldSeps).toBe(";");
  expect(options.bDetectSpecialNumber).toBe(false);
  expect(options.bDetectScientificNumber).toBe(true);
  expect(options.bEvaluateFormulas).toBe(true);
  expect(options.bSaveAsShown).toBe(true);
  const serialized = options.WriteToString();
  const restored = new ScAsciiOptions();
  restored.ReadFromString(serialized);
  expect(restored.aFieldSeps).toBe(";");
  expect(restored.bDetectScientificNumber).toBe(true);
  expect(restored.bDetectSpecialNumber).toBe(false);
  expect(serialized.split(",")).toHaveLength(15);
});

it("preserves legacy token defaults and weighted multi-separator selection", /** Checks preserves legacy token defaults and weighted multi-separator selection. @returns Test completion or assertion result. */ () => {
  const options = new ScAsciiOptions();
  options.ReadFromString("59/44/MRG,34,UTF-8,2,,0,false");
  expect(options.aFieldSeps).toBe(";,");
  expect(options.bMergeFieldSeps).toBe(true);
  expect(options.nStartRow).toBe(2);
  expect(options.bDetectSpecialNumber).toBe(true);
  expect(ScAsciiOptions.GetWeightedFieldSep(options.aFieldSeps, false)).toBe(",");
  expect(ScAsciiOptions.GetWeightedFieldSep("9/59/32", true)).toBe("\t");
  const exportOptions = new ScImportOptions(options.WriteToString());
  expect(exportOptions.nFieldSepCode).toBe(",");
  expect(exportOptions.bSaveAsShown).toBe(true);
});

it("serializes each UTF-16 separator unit as source OUString indexing does", /** Checks serializes each UTF-16 separator unit as source OUString indexing does. @returns Test completion or assertion result. */ () => {
  const options = new ScAsciiOptions();
  options.aFieldSeps = "😀";
  const encoded = options.WriteToString();
  expect(encoded.split(",")[0]).toBe("55357/56832");
  const restored = new ScAsciiOptions();
  restored.ReadFromString(encoded);
  expect(restored.aFieldSeps).toBe("😀");
});

it("routes DETECT separators through SfxObjectShell's stream scanner", /** Checks routes DETECT separators through SfxObjectShell's stream scanner. @returns Test completion or assertion result. */ () => {
  const source = new TextEncoder().encode('"a,b";1\n"c,d";2\n');
  const stream = new SvStream(source, RTL_TEXTENCODING_UTF8);
  const options = new ScAsciiOptions();
  options.ReadFromString("DETECT,34,UTF-8", stream);
  expect(options.aFieldSeps).toBe(";");
  expect(stream.Tell()).toBe(0);
});

it("keeps the source BOM position when separator and encoding tokens request DETECT", /** Checks keeps the source BOM position when separator and encoding tokens request DETECT. @returns Test completion or assertion result. */ () => {
  const input = new TextEncoder().encode("\uFEFFsep=;\na;b\n");
  const stream = new SvStream(input, RTL_TEXTENCODING_DONTKNOW);
  const options = new ScAsciiOptions();
  options.ReadFromString("DETECT,34,DETECT", stream);
  expect(options.eCharSet).toBe(RTL_TEXTENCODING_UTF8);
  expect(options.aFieldSeps).toBe(";");
  expect(stream.Tell()).toBe(3);
});

it("keeps distinct default and serialized export defaults", /** Checks keeps distinct default and serialized export defaults. @returns Test completion or assertion result. */ () => {
  expect(new ScImportOptions().bSaveAsShown).toBe(false);
  const shortFilter = new ScImportOptions("44,34");
  expect(shortFilter.nFieldSepCode).toBe("");
  expect(shortFilter.nTextSepCode).toBe("");
  expect(shortFilter.eCharSet).toBe(RTL_TEXTENCODING_DONTKNOW);
  expect(shortFilter.aStrFont).toBe("");
  expect(shortFilter.bSaveAsShown).toBe(true);
  const options = new ScImportOptions("44,34,UTF-8,1,,0,false,true,true,false,false,0,true,false");
  expect(options.bSaveAsShown).toBe(true);
  expect(options.BuildString()).toBe("44,34,UTF-8,1,,0,false,true,true,false,false,0,true,false");
});

it("ignores export filter tokens beyond the native fourteen positions", /** Checks ignores export filter tokens beyond the native fourteen positions. @returns Test completion or assertion result. */ () => {
  const source = "44,34,UTF-8,1,,0,false,true,true,false,false,0,true,false";
  const expected = new ScImportOptions(source);
  const withUnknownTokens = new ScImportOptions(`${source},unsupported,another`);
  expect(withUnknownTokens).toEqual(expected);
  expect(withUnknownTokens.BuildString()).toBe(source);
});

it("recognizes FIX using source ASCII-only case comparison", /** Checks recognizes FIX using source ASCII-only case comparison. @returns Test completion or assertion result. */ () => {
  expect(new ScImportOptions("fIx,34,UTF-8").bFixedWidth).toBe(true);
  expect(new ScImportOptions("ﬁx,34,UTF-8").bFixedWidth).toBe(false);
});

it("preserves upstream's sheet token errors while accepting empty and ASCII numeric tokens", /** Checks preserves upstream's sheet token errors while accepting empty and ASCII numeric tokens. @returns Test completion or assertion result. */ () => {
  const prefix = "44,34,UTF-8,1,,0,false,true,true,false,false,";
  expect(new ScImportOptions(`${prefix},true,false`).nSheetToExport).toBe(0);
  expect(new ScImportOptions(`${prefix}12,true,false`).nSheetToExport).toBe(12);
  expect(new ScImportOptions(`${prefix}١,true,false`).nSheetToExport).toBe(-23);
});

it("parses numeric filter tokens through source o3tl::toInt32 semantics", /** Checks parses numeric filter tokens through source o3tl::toInt32 semantics. @returns Test completion or assertion result. */ () => {
  const options = new ScAsciiOptions();
  options.ReadFromString("44x,34x,UTF-8,2x,1x/300x,65537x,false");
  expect(options.aFieldSeps).toBe(",");
  expect(options.cTextSep).toBe('"');
  expect(options.nStartRow).toBe(2);
  expect(options.mvColStart).toEqual([1]);
  expect(options.mvColFormat).toEqual([44]);
  expect(options.eLang).toBe(1);
  expect(ScGlobal.GetCharsetValue("4294967296")).toBe(ScGlobal.GetCharsetValue("0"));

  const legacy = new ScImportOptions("44x,34x,UTF-8,invalid");
  expect(legacy.nFieldSepCode).toBe(",");
  expect(legacy.nTextSepCode).toBe('"');
  expect(legacy.bSaveAsShown).toBe(false);
  expect(
    new ScImportOptions("44,34,UTF-8,1,,0,false,true,true,false,false,4294967296").nSheetToExport,
  ).toBe(0);
});
