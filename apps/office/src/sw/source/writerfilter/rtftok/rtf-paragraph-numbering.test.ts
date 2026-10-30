/** @fileoverview Verifies actual RTF paragraph NumPr resources, native style/direct precedence and list cancellation. */
import { afterEach, expect, it } from "vitest";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import type { SwDoc } from "../../core/doc/doc";
import { RES_MARGIN_TEXTLEFT, RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT } from "../../../inc/hintids";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { RtfExport } from "../../filter/ww8/rtfexport";
const docs: SwDoc[] = [];
afterEach(
  /** Releases actual document ownership. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Imports complete literal native resources. @param body - Paragraph controls. @param styles - Optional original style table. @returns Actual document. */
function read(body: string, styles = String.raw`{\s0 Normal;}`): SwDoc {
  const levels = String.raw`{\listlevel\levelnfc0\li720\fi-360{\leveltext\'02\'00.;}{\levelnumbers\'01;}}{\listlevel\levelnfc0\li1440\fi-360{\leveltext\'02\'01.;}{\levelnumbers\'01;}}{\listlevel\levelnfc0\li2160\fi-360{\leveltext\'02\'02.;}{\levelnumbers\'01;}}`;
  const source =
    String.raw`{\rtf1` +
    (styles ? `{\\stylesheet${styles}}` : "") +
    String.raw`{\*\listtable{\list` +
    levels +
    String.raw`\listid7}}{\*\listoverridetable{\listoverride\listid7\ls4}{\listoverride\listid7\ls5}}` +
    body +
    "}";
  const doc = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(source));
  docs.push(doc);
  return doc;
}
it("uses style numbering and its level without any direct list controls", /** Native finishParagraph applies actual style metadata, not a default scalar level0. @returns Nothing. */ () => {
  const doc = read(
      String.raw`\s4 Style list\par`,
      String.raw`{\s0 Normal;}{\s4\ls4\ilvl2\li-720\fi-180 Styled;}`,
    ),
    node = doc.paragraphs[0];
  expect(node?.GetNumRule()?.GetName()).toBe("WWNum4");
  expect(node?.GetAttrListLevel()).toBe(2);
  expect(node?.GetParagraphTextLeftMargin()).toBe(-720);
  expect(node?.GetParagraphFirstLineIndent()).toBe(-180);
  const restored = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
  docs.push(restored);
  expect(restored.paragraphs[0]?.GetAttrListLevel()).toBe(2);
  expect(restored.paragraphs[0]?.GetNumRule()?.GetName()).toBe("WWNum4");
});
it.each([0, 99])(
  "cancels style numbering for missing direct numId%i",
  /** Missing direct lists emit empty NumberingStyleName plus native zero direct margins. @param id - Missing ID. @returns Nothing. */ (
    id,
  ) => {
    const doc = read(
        `\\s4\\ls${id} Cancel\\par`,
        String.raw`{\s0 Normal;}{\s4\ls4\ilvl2\li1080\fi-180 Styled;}`,
      ),
      node = doc.paragraphs[0];
    expect(node?.GetNumRule()).toBeUndefined();
    expect(node?.GetNumRuleName()).toBe("");
    expect(node?.GetParagraphTextLeftMargin()).toBe(0);
    expect(node?.GetParagraphFirstLineIndent()).toBe(0);
  },
);
it("converts direct body level9 to empty numbering when a source paragraph entry resolves", /** The native rule property remains present while finishParagraph clears the style name and erases NumberingLevel. @returns Nothing. */ () => {
  const doc = read(String.raw`\ls4\ilvl9 Body\par\pard\ls4\ilvl1 Numbered\par`);
  expect(doc.paragraphs[0]?.GetNumRule()).toBeUndefined();
  expect(doc.paragraphs[1]?.GetNumRule()?.GetName()).toBe("WWNum4");
  expect(doc.paragraphs[1]?.GetAttrListLevel()).toBe(1);
});
it.each([-1, 10, 32768])(
  "ignores unsupported ilvl%i instead of clamping",
  /** Native DomainMapper accepts only0 through9 and then uses its original absent-level default. @param level - Invalid input. @returns Nothing. */ (
    level,
  ) => {
    const doc = read(`\\ls4\\ilvl${level} Text\\par`);
    expect(doc.paragraphs[0]?.GetNumRule()?.GetName()).toBe("WWNum4");
    expect(doc.paragraphs[0]?.GetAttrListLevel()).toBe(0);
  },
);
it("preserves source level9 as the tenth level when no stylesheet entry resolves", /** Native finishParagraph cancellation is guarded by pEntry; do not add a synthetic default entry. @returns Nothing. */ () => {
  const doc = read(String.raw`\ls4\ilvl9 Tenth\par`, "");
  expect(doc.paragraphs[0]?.GetNumRule()?.GetName()).toBe("WWNum4");
  expect(doc.paragraphs[0]?.GetAttrListLevel()).toBe(9);
});
it.each([String.raw`\li-720\fi-180\ri-360\ls4`, String.raw`\ls4\li-720\fi-180\ri-360`])(
  "preserves native direct geometry regardless of LS token position: %s",
  /** LS ReplaceAtStart keeps numPr before direct indents so its erase phase cannot discard them. @param controls - Native controls. @returns Nothing. */ (
    controls,
  ) => {
    const doc = read(controls + String.raw` Text\par`),
      node = doc.paragraphs[0];
    expect(node?.GetParagraphTextLeftMargin()).toBe(-720);
    expect(node?.GetParagraphFirstLineIndent()).toBe(-180);
    expect(node?.GetParagraphRightMargin()).toBe(-360);
    for (const id of [RES_MARGIN_TEXTLEFT, RES_MARGIN_FIRSTLINE, RES_MARGIN_RIGHT])
      expect(node?.GetSwAttrSet().GetItemIfSet(id, false)).toBeDefined();
  },
);
it("shares native abstract list identity for style and direct concrete references", /** Both paths reach original MapListId after actual property application. @returns Nothing. */ () => {
  const doc = read(
      String.raw`\s4 First\par\pard\ls5 Second\par`,
      String.raw`{\s0 Normal;}{\s4\ls4\ilvl2 Styled;}`,
    ),
    first = doc.paragraphs[0],
    second = doc.paragraphs[1];
  expect(first?.GetNumRule()?.GetName()).toBe("WWNum4");
  expect(second?.GetNumRule()?.GetName()).toBe("WWNum5");
  expect(first?.GetListId()).not.toBe("");
  expect(first?.GetListId()).toBe(second?.GetListId());
  const exported = RtfExport.WriteDocument(doc),
    restored = new RtfDocumentImpl().ResolveBytes(exported);
  docs.push(restored);
  expect(restored.paragraphs[0]?.GetAttrListLevel()).toBe(2);
  expect(restored.paragraphs[0]?.GetNumRule()).toBeDefined();
  // ww8atr.cxx remaps a shared SwList to its abstract rule only for DOCX; RTF emits one abstract per concrete rule.
  expect(restored.paragraphs[0]?.GetListId()).not.toBe(restored.paragraphs[1]?.GetListId());
});

it.each([
  [32767, 32767],
  [32768, 0],
  [-40000, -40000],
] as const)(
  "preserves source first-line admission for %i twips",
  /** ConversionHelper rejects only positive values at or above32768; negative values retain native conversion. @param input - Raw value. @param expected - Native item value. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const doc = read(`\\ls4\\fi${input} Wide\\par`),
      item = doc.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
    expect(item.ResolveTextFirstLineOffset()).toBe(expected);
  },
);
it("omits direct geometry equal to the current numbering format", /** Native nonzero equality suppression preserves list-level indentation priority. @returns Nothing. */ () => {
  const doc = read(String.raw`\ls4\li720\fi-360 Equal\par`),
    node = doc.paragraphs[0];
  expect(node?.GetSwAttrSet().GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
  expect(node?.GetSwAttrSet().GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
  expect(node?.GetNumRule()?.Get(0).GetIndentAt()).toBe(720);
});
import type { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
