/** @fileoverview Real legacy PN producer and malformed-list first-indent recovery contracts against native RTF resources. */
import { afterEach, expect, it, vi } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import type { SwDoc } from "../../core/doc/doc";
import { SvxNumType } from "../../core/doc/number";
import { RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";
import type { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { RTFSprms } from "./rtfsprm";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual native documents and spies. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports literal RTF using the production parser. @param source - Native text. @returns Actual document. */
function read(source: string): SwDoc {
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
it("creates native PN decimal numbering with source prefix, suffix, start and inherited paragraph references", /** Legacy PN emits ordinary abstract/concrete definitions and uses them through paragraph NumPr. @returns Nothing. */ () => {
  const doc = read(
      String.raw`{\rtf1{\*\pn\pnlvlbody\pndec\pnstart3{\pntxtb (}{\pntxta )}}{\pntext ignored label}First\par Second\par}`,
    ),
    first = doc.paragraphs[0],
    second = doc.paragraphs[1];
  expect(first?.GetText()).toBe("First");
  expect(first?.GetNumRule()?.GetName()).toBe("WWNum2");
  expect(first?.GetNumRule()?.Get(0).GetStart()).toBe(3);
  expect(first?.GetNumRule()?.Get(0).GetListFormat()).toBe("(%1%)");
  expect(second?.GetNumRule()).toBe(first?.GetNumRule());
  expect(first?.GetAttrListLevel()).toBe(0);
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(restored);
  expect(restored.paragraphs[0]?.GetNumRule()?.Get(0).GetStart()).toBe(3);
});
it("uses legacy bullet ID1 and its ASCII font property through actual list-level services", /** PNF reaches native label/bullet font production without changing text decoding. @returns Nothing. */ () => {
  const doc = read(
      String.raw`{\rtf1{\fonttbl{\f9 Legacy Labels;}}{\*\pn\pnlvlblt\pnf9{\pntxtb\u8226?}}Item\par}`,
    ),
    rule = doc.paragraphs[0]?.GetNumRule();
  expect(rule?.GetName()).toBe("WWNum1");
  expect(rule?.Get(0).GetNumberingType()).toBe(SvxNumType.SVX_NUM_CHAR_SPECIAL);
  expect(rule?.Get(0).GetBulletChar()).toBe(0x2022);
  expect(rule?.Get(0).GetBulletFont()?.GetFamilyName()).toBe("Legacy Labels");
});
it("keeps the first native duplicate PN ID instead of restarting or replacing its definition", /** Every PN callback retains its own table, but native lookup uses the first abstract and concrete ID2. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\pn\pnlvlbody\pndec\pnstart3}First\par{\pn\pnlvlbody\pndec\pnstart9}Second\par}`,
  );
  expect(doc.paragraphs[0]?.GetNumRule()).toBe(doc.paragraphs[1]?.GetNumRule());
  expect(doc.paragraphs[1]?.GetNumRule()?.Get(0).GetStart()).toBe(3);
  expect(doc.FindNumRulePtr("WWNum2a")).toBeDefined();
  expect(doc.paragraphs[1]?.IsListRestart()).toBe(false);
});
it("does not invent a list ID for a PN destination without a level flag", /** Original afterPopState requires NSID, even when a numbering format was present. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\pn\pndec\pnstart7{\pntxta .}}Plain\par}`);
  expect(doc.paragraphs[0]?.GetNumRule()).toBeUndefined();
  expect(doc.paragraphs[0]?.GetText()).toBe("Plain");
});
/** Makes a source invalid LEVELNUMBERS, with FI after invalidation, under original list-ID mapping. @param body - Paragraph controls. @returns Actual document. */
function malformed(body: string): SwDoc {
  return read(
    String.raw`{\rtf1{\*\listtable{\list{\listlevel\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\u59;}\fi-360\li720}\listid7}}{\*\listoverridetable{\listoverride\listid7\ls4}}` +
      body +
      "}",
  );
}
it.each([
  [-360, 0],
  [-180, -180],
] as const)(
  "applies invalid-list first-indent recovery to %i",
  /** Source dedup removes only an equal paragraph value; a differing value remains direct. @param input - Raw first indent. @param expected - Native item. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const dedup = vi.spyOn(RTFSprms.prototype, "deduplicateList"),
      doc = malformed(`\\ls4\\fi${input} Text\\par`),
      node = doc.paragraphs[0];
    expect(
      (node?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
    ).toBe(expected);
    expect(
      dedup.mock.calls.some(
        /** Finds the original global list-level0 recovery entry. @param call - Native invocation. @returns Source value match. */ (
          call,
        ) => call[0].get(0) === -360,
      ),
    ).toBe(true);
  },
);
it("does not apply one abstract list's recovery to an unknown concrete ID", /** Missing override mapping skips original numbering normalization. @returns Nothing. */ () => {
  const dedup = vi.spyOn(RTFSprms.prototype, "deduplicateList");
  malformed(String.raw`\ls99\fi-360 Plain\par`);
  expect(dedup).not.toHaveBeenCalled();
});

it("retains the actual destination-text pointer across a plain nested PN text group", /** pushState clears its own copied buffer while CurrentDestinationText still borrows the parent's buffer. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1{\pn\pnlvlbody\pndec{\pntxtb (a{b}c}{\pntxta )}}Text\par}`);
  expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetListFormat()).toBe("(abc%1%)");
});
it("retains source PN flags set before the PN destination", /** Global flag dispatch writes table state inherited by the following group. @returns Nothing. */ () => {
  const doc = read(String.raw`{\rtf1\pnlvlbody{\pn\pndec\pnstart5}Text\par}`);
  expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetStart()).toBe(5);
});
it("retains native ID collision between a modern concrete list and legacy PN", /** PN's fixed ID2 does not displace an already registered modern concrete ID2. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\*\listtable{\list{\listlevel\levelnfc0\levelstartat1}\listid7}}{\*\listoverridetable{\listoverride\listid7\ls2}}{\pn\pnlvlbody\pndec\pnstart9}Text\par}`,
  );
  expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetStart()).toBe(1);
  expect(doc.FindNumRulePtr("WWNum2a")?.Get(0).GetStart()).toBe(9);
});

it("keeps native destination buffers alive through first-run font initialization and later PN groups", /** Earlier body text stays unnumbered while a subsequent PN group uses its own destination buffers. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\deff0{\fonttbl{\f0 Body;}}Before\par{\pn\pnlvlbody\pndec{\pntxtb [}{\pntxta ]}}After\par}`,
  );
  expect(doc.paragraphs[0]?.GetNumRule()).toBeUndefined();
  expect(doc.paragraphs[1]?.GetNumRule()?.Get(0).GetListFormat()).toBe("[%1%]");
});
it("clears invalid-level recovery when moving to another abstract list", /** Per-list snapshots retain the bad first definition but do not leak into a later valid definition. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\*\listtable{\list{\listlevel\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\u59;}\fi-360}\listid7}{\list{\listlevel\levelnfc0\fi-720}\listid8}}{\*\listoverridetable{\listoverride\listid7\ls4}{\listoverride\listid8\ls5}}\ls4\fi-360 Bad\par\ls5\fi-360 Valid\par}`,
  );
  expect(
    (
      doc.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset(),
  ).toBe(0);
  expect(
    (
      doc.paragraphs[1]?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset(),
  ).toBe(-360);
});

it.each(["pnucrm", "pnlcrm", "pnfs60"])(
  "preserves upstream no-op for registered legacy switch %s",
  /** These spellings are registered by the native tokenizer but have no dispatch handler. @param keyword - Original switch. @returns Nothing. */ (
    keyword,
  ) => {
    const doc = read("{\\rtf1{\\pn\\pnlvlbody\\" + keyword + "}Text\\par}"),
      format = doc.paragraphs[0]?.GetNumRule()?.Get(0);
    expect(format?.GetNumberingType()).toBe(SvxNumType.SVX_NUM_ARABIC);
    const baseline = read(String.raw`{\rtf1{\pn\pnlvlbody}Text\par}`)
      .paragraphs[0]?.GetNumRule()
      ?.Get(0);
    expect(
      (
        format?.GetCharFormat()?.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
      ).GetHeight(),
    ).toBe(
      (
        baseline?.GetCharFormat()?.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem
      ).GetHeight(),
    );
  },
);
it("emits legacy PN numbering metadata from a paragraph stylesheet entry", /** Native destination dispatch precedes style-entry property dispatch and writes NumPr into the parent style. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1{\stylesheet{\s5 Named;{\pn\pnlvlbody\pndec\pnstart4}}}\s5 Styled text\par}`,
  );
  expect(doc.paragraphs[0]?.GetTextFormatColl().GetName()).toBe("Named");
  expect(doc.paragraphs[0]?.GetNumRule()?.Get(0).GetStart()).toBe(4);
});

import { RES_CHRATR_FONTSIZE } from "../../../inc/hintids";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";

it("preserves the global LISTID side channel separately from list-entry attributes", /** Original LISTID always updates parser indices; its abstract attribute is emitted only in LISTENTRY. @returns Nothing. */ () => {
  const doc = read(
    String.raw`{\rtf1\listid7{\*\listtable{\list{\listlevel\levelnfc0{\leveltext\'02\'00.;}{\levelnumbers\u59;}\fi-360}}}{\*\listoverridetable{\listoverride\listid7\ls4}}\ls4\fi-360 Text\par}`,
  );
  expect(
    (
      doc.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset(),
  ).toBe(0);
});
