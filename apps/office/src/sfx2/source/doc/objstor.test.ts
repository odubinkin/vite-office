/** @fileoverview Pinned SfxObjectShell CSV separator detection over the native stream reader. */
import { expect, it, vi } from "vitest";
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

it("defaults missing quote delimiters, skips blank lines and carries multiline quote state", /** Checks source field admission before occurrence statistics are updated. @returns Nothing. */ () => {
  expect(detect('\n\n"a,b";x\n"c,d";y\n', "")).toEqual([";", 0]);
  expect(detect('"a,b";x\n"c,d";y\n', "\0")).toEqual([";", 0]);
  expect(detect('"a\nb";c\n"d\ne";f\n')).toEqual([";", 0]);
  expect(detect("a,b;c\nx,y,z;f\n")).toEqual([";", 0]);
});

it("rewinds the original stream when the source detection time budget is exhausted", /** Checks the native 500ms deadline without making the test wait for a wall-clock timeout. @returns Nothing. */ () => {
  const clock = vi.spyOn(Date, "now").mockReturnValueOnce(0).mockReturnValue(500);
  try {
    expect(detect("a,b\nc,d\n")).toEqual(["", 0]);
  } finally {
    clock.mockRestore();
  }
});

it("counts common separators outside quoted fields and returns source priority order", /** Checks counts common separators outside quoted fields and returns source priority order. @returns Test completion or assertion result. */ () => {
  expect(detect('"a,b";x\n"c,d";y\n')).toEqual([";", 0]);
  expect(detect("a,b;c\nd,e;f\n")).toEqual([",;", 0]);
  expect(detect("a|b\nc|d\n")).toEqual(["|", 0]);
});
