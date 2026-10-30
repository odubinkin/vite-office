/** @fileoverview Native section lifecycle and deferred/synthetic PAGE transitions on real Writer documents, including pinned upstream QA expectations. */
import { afterEach, assert, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { RES_PAGEDESC, RES_BREAK } from "../../../inc/hintids";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual document owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports native lexical input through the actual parser and mapper. @param source - Literal RTF. @returns Actual model. */
function read(source: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
/** Reads document body text. @param doc - Actual model. @returns Paragraph strings. */
function texts(doc: SwDoc): string[] {
  return doc.paragraphs.map(
    /** Reads original node text. @param node - Native node. @returns Text. */ (node) =>
      node.GetText(),
  );
}
/** Queries direct native page-style attachment only. @param doc - Actual document. @returns Direct names or absence. */
function pages(doc: SwDoc): (string | undefined)[] {
  return doc.paragraphs.map(
    /** Reads the actual item rather than inferred effective page. @param node - Node. @returns Direct style name. */ (
      node,
    ) =>
      (
        node.GetpSwAttrSet()?.GetItemIfSet(RES_PAGEDESC, false) as SwFormatPageDesc | undefined
      )?.GetPageDescName(),
  );
}
it("does not create another page style for a terminal SECT's required final paragraph", /** Native needSect remains false after SECT while needPar still inserts an ordinary final paragraph. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\sect}`);
  expect(texts(doc)).toEqual(["A", ""]);
  expect(doc.GetPageDescCnt()).toBe(1);
  expect(pages(doc)).toEqual([undefined, undefined]);
});
it.each(["", String.raw`\unknownnativeword99`, String.raw`{\unknownnativeword99}`])(
  "keeps unknown words from starting a new section at EOF: %s",
  /** Unknown controls do not reach native dispatch handlers or setNeedSect. @param ending - Unknown/empty suffix. @returns Nothing. */ (
    ending,
  ) => {
    const doc = read(String.raw`{\rtf1 A\sect` + ending + "}");
    expect(texts(doc)).toEqual(["A", ""]);
    expect(doc.GetPageDescCnt()).toBe(1);
    expect(pages(doc)).toEqual([undefined, undefined]);
  },
);
it.each([String.raw`\sectd`, String.raw`\sbkpage`, String.raw`\pnfs10`, String.raw`{\b}`])(
  "starts a native final section for a recognized command, including a registered no-op: %s",
  /** Every recognized native dispatch kind calls setNeedSect, even if its property is unconsumed. @param ending - Recognized suffix. @returns Nothing. */ (
    ending,
  ) => {
    const doc = read(String.raw`{\rtf1 A\sect` + ending + "}");
    expect(texts(doc)).toEqual(["A", ""]);
    expect(doc.GetPageDescCnt()).toBe(2);
    expect(pages(doc)).toEqual([undefined, "Converted1"]);
  },
);
it("preserves the pinned continuous-section PAGE QA paragraph and page-style boundaries", /** Literal fixture corresponds to testContSectionPageBreak in pinned rtfimport.cxx. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\ansi\sectd\sbknone FIRST\par\sect SECOND\par\page\sect THIRD\par\sect}`,
  );
  expect(texts(doc)).toEqual(["FIRST", "SECOND", "", "THIRD", ""]);
  expect(pages(doc)).toEqual(["Standard", undefined, "Converted1", undefined, undefined]);
  for (const index of [1, 3])
    expect((doc.paragraphs[index]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
  expect(doc.GetPageDescCnt()).toBe(2);
});
const upstreamFixture =
  "../../vendor/libreoffice-reference/sw/qa/extras/rtfimport/data/cont-section-pagebreak.rtf";
it.skipIf(!existsSync(upstreamFixture))(
  "imports the unchanged upstream continuous-section PAGE fixture",
  /** Executes the actual pinned input in addition to the standalone required literal fixture. @returns Nothing. */ () => {
    const doc = new RtfDocumentImpl().ResolveBytes(new Uint8Array(readFileSync(upstreamFixture)));
    docs.push(doc);
    expect(texts(doc)).toEqual(["FIRST", "SECOND", "", "THIRD", ""]);
    expect(pages(doc)[1]).toBeUndefined();
    expect(pages(doc)[2]).toBeDefined();
    expect(pages(doc)[3]).toBeUndefined();
  },
);
it.each(["page", "column"])(
  "defers %s across an explicit PAR instead of creating another empty paragraph",
  /** Native default SplitPgBreakAndParaMark=false leaves the break for subsequent text. @param control - Native symbol. @returns Nothing. */ (
    control,
  ) => {
    const doc = read("{\\rtf1 A\\" + control + "\\par B}");
    expect(texts(doc)).toEqual(["A", "B"]);
    expect((doc.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
  },
);
it("creates the native leading empty paragraph when PAGE precedes first text", /** First-paragraph-in-section forces the mapper split even while its run is empty. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\page A}`);
  expect(texts(doc)).toEqual(["", "A"]);
  expect((doc.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
});
it("flushes consecutive PAGEs through the zero-length native text boundary", /** Zero-length utext changes first-run state, preserving both page breaks. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\page\page B}`);
  expect(texts(doc)).toEqual(["A", "", "B"]);
  for (const index of [1, 2])
    expect((doc.paragraphs[index]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
});
it("does not consume a trailing deferred PAGE into an invented final page paragraph", /** Root's ordinary PAR does not consume the deferred break in the default unsplit profile, and the extra mapper paragraph is removed. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\page}`);
  expect(texts(doc)).toEqual(["A"]);
  expect((doc.paragraphs[0]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(0);
});
it("does not synthesize a PAGE section from SBKNONE before the first SECT", /** Pinned PAGE explicitly requires hadSect before honoring continuous. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\sbknone A\page B}`);
  expect(texts(doc)).toEqual(["A", "B"]);
  expect(doc.GetPageDescCnt()).toBe(1);
  expect((doc.paragraphs[1]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
});
it("keeps TITLEPG's native synthetic-section exception", /** The title flag remains group-scoped section sprms and forces the ordinary deferred PAGE path. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1 A\sect\sbknone\titlepg B\page C}`);
  expect(texts(doc)).toEqual(["A", "B", "C"]);
  expect((doc.paragraphs[2]?.GetAttr(RES_BREAK) as SfxInt16Item).GetValue()).toBe(4);
  expect(doc.GetPageDescCnt()).toBe(1);
});
it("retains source section-control numeric defaults", /** Bare VALUE controls use native table defaults; flags ignore numeric parameters. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\paperw\paperh\margl\margr\margt\margb A}`);
  expect(doc.GetPageDesc().GetValue()).toMatchObject({
    width: 12240,
    height: 15840,
    leftMargin: 1800,
    rightMargin: 1800,
    topMargin: 1440,
    bottomMargin: 1440,
  });
  assert(doc.paragraphs[0]);
});

it.each(["\n", "\r", "\r\n"])(
  "routes the native escaped paragraph alias %j through PAR",
  /** Exact tokenizer aliases share the native PAR keyword index. @param newline - Original alias. @returns Nothing. */ (
    newline,
  ) => {
    const doc = read("{\\rtf1 A\\" + newline + "B}");
    expect(texts(doc)).toEqual(["A", "B"]);
  },
);
it.each(["\n", "\r\n", "\u0000"])(
  "ignores raw formatting byte %j after the final native group",
  /** No auxiliary character-boundary event may escape the root for a natively ignored raw byte. @param tail - Ignored lexical suffix. @returns Nothing. */ (
    tail,
  ) => {
    const doc = read(String.raw`{\rtf1 A}` + tail);
    expect(texts(doc)).toEqual(["A"]);
  },
);
