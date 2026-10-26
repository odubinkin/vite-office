/** @fileoverview Pinned SfxObjectShell CSV separator detection over the native stream reader. */
import { expect, it } from "vitest";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { SvStream } from "../../../tools/source/stream/stream";
import { SfxObjectShell } from "./objsh";

/** Runs the source detector and observes its rewind contract.  @param value - Value. @param delimiter - Delimiter. @returns The [string, number] result. */
function detect(value: string, delimiter = '"'): [string, number] {
  const stream = new SvStream(new TextEncoder().encode(value), RTL_TEXTENCODING_UTF8);
  const result = SfxObjectShell.DetectCsvSeparators(stream, RTL_TEXTENCODING_UTF8, delimiter);
  return [result, stream.Tell()];
}

it("recognizes source sep= headers and preserves the initial stream position", /** Checks recognizes source sep= headers and preserves the initial stream position. @returns Test completion or assertion result. */ () => {
  expect(detect("sep=;\na;b\n")).toEqual([";", 0]);
  expect(detect("SEP=;\na;b\n")).toEqual([";", 0]);
  expect(detect('"sep=|"\na|b\n')).toEqual(["|", 0]);
});

it("counts common separators outside quoted fields and returns source priority order", /** Checks counts common separators outside quoted fields and returns source priority order. @returns Test completion or assertion result. */ () => {
  expect(detect('"a,b";x\n"c,d";y\n')).toEqual([";", 0]);
  expect(detect("a,b;c\nd,e;f\n")).toEqual([",;", 0]);
  expect(detect("a|b\nc|d\n")).toEqual(["|", 0]);
});
