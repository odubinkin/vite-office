/** @fileoverview Actual RTF text-symbol dispatch, forced MS1252 punctuation and PN destination/run routing. */
import { afterEach, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import type { SwDoc } from "../../core/doc/doc";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual document owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Resolves real native RTF. @param input - Original controls. @returns Actual document. */
function read(input: string) {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(input));
  docs.push(doc);
  return doc;
}
it.each([
  ["emdash", "\u2014"],
  ["endash", "\u2013"],
  ["bullet", "\u2022"],
  ["lquote", "\u2018"],
  ["rquote", "\u2019"],
  ["ldblquote", "\u201c"],
  ["rdblquote", "\u201d"],
  ["tab", "\t"],
  ["~", "\u00a0"],
  ["_", "\u2011"],
  ["-", "\u00ad"],
])(
  "emits native %s with the original character independently of ansicpg932",
  /** Native trivial bytes use fixed MS1252; linguistic symbols retain actual SVT constants. @param keyword - Control. @param expected - Native Unicode. @returns Nothing. */ (
    keyword,
    expected,
  ) => {
    const doc = read("{\\rtf1\\ansicpg932 A\\" + keyword + " B\\par}");
    expect(doc.paragraphs[0]?.GetText()).toBe("A" + expected + (keyword.length === 1 ? " B" : "B"));
  },
);
it.each([
  ["tab", "\t"],
  ["~", "\u00a0"],
  ["_", "\u2011"],
  ["emdash", "\u2014"],
])(
  "routes %s into the actual PN prefix buffer",
  /** General text() symbols belong to the destination buffer, not visible body runs. @param keyword - Original control. @param prefix - Native prefix. @returns Nothing. */ (
    keyword,
    prefix,
  ) => {
    const doc = read("{\\rtf1{\\pn\\pnlvlbody\\pndec{\\pntxtb\\" + keyword + "}}Text\\par}");
    expect(doc.paragraphs[0]?.GetText()).toBe("Text");
    expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetListFormat()).toBe(prefix + "%1%");
  },
);
it("preserves the special LINE singleChar path outside the PN destination buffer", /** LINE emits a direct run with runProps and bypasses checkNeedPap; PN's later paragraph properties still apply. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\pn\pnlvlbody\pndec{\pntxtb A\line B}}Text\par}`);
  expect(doc.paragraphs[0]?.GetText()).toBe("\nText");
  expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetListFormat()).toBe("AB%1%");
});
