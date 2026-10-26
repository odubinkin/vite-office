/** @fileoverview Markdown table tokenization preserves escaped pipes and code-span delimiters. */
import { expect, it } from "vitest";
import { readMarkdownTableAlignment, readMarkdownTableRow, splitMarkdownTableRow } from "./mdtab";

it("splits only pipes outside escapes and matching backtick spans", /** Checks single and multi-backtick spans with unmatched interior fences. @returns Nothing. */ () => {
  expect(splitMarkdownTableRow(String.raw`| A\|B | C |`)).toEqual(["A|B", "C"]);
  expect(splitMarkdownTableRow("| `A|B` | C |")).toEqual(["`A|B`", "C"]);
  expect(splitMarkdownTableRow("| ``A`|B`` | C |")).toEqual(["``A`|B``", "C"]);
  expect(splitMarkdownTableRow("A||C")).toEqual(["A", "", "C"]);
});

it("rejects malformed alignment rows and preserves the header column count", /** Checks centered, right and left alignment together with short and oversized rows. @returns Nothing. */ () => {
  expect(readMarkdownTableAlignment(":---: | ---: | :---")).toEqual(["center", "right", "left"]);
  expect(readMarkdownTableAlignment("--- | invalid")).toBeUndefined();
  expect(readMarkdownTableAlignment("")).toBeUndefined();
  expect(readMarkdownTableRow("| A |", ["left", "right"])).toEqual([
    { text: "A", alignment: "left" },
    { text: "", alignment: "right" },
  ]);
  expect(readMarkdownTableRow("| A | B | C |", ["center"])).toEqual([
    { text: "A", alignment: "center" },
  ]);
});
