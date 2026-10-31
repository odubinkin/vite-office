/** @fileoverview Native CSS1 pagination producers, original pending state and actual Markdown/Worker item delivery. */
import { afterEach, assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SvxCSS1Parser, aItemIds } from "./svxcss1";
import { SvxCSS1PageBreak as B, SvxCSS1PropertyInfo } from "./svxcss1.types";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { RES_PARATR_SPLIT, RES_PARATR_WIDOWS, RES_PARATR_ORPHANS } from "../../../inc/hintids";
import { MarkdownReader } from "../md/swmd";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

const docs: SwDoc[] = [];
afterEach(
  /** Releases actual document owners. @returns Nothing. */ () => {
    for (const doc of docs.splice(0)) doc.Dispose();
  },
);
/** Parses through the real grammar and returns copied scalar state/items, without keeping the parser's temporary set alive. @param style - Original declarations. @returns Native pending state and scalar outputs. */
function parse(style: string) {
  const doc = new SwDoc();
  docs.push(doc);
  const parser = new SvxCSS1Parser(doc.GetAttrPool(), ""),
    items = new SfxItemSet(doc.GetAttrPool(), parser.GetWhichMap()),
    info = new SvxCSS1PropertyInfo();
  try {
    parser.ParseStyleOption(style, items, info);
    return {
      info,
      split: (items.GetItemIfSet(RES_PARATR_SPLIT, false) as SfxBoolItem | undefined)?.GetValue(),
      widows: (
        items.GetItemIfSet(RES_PARATR_WIDOWS, false) as SfxInt16Item | undefined
      )?.GetValue(),
      orphans: (
        items.GetItemIfSet(RES_PARATR_ORPHANS, false) as SfxInt16Item | undefined
      )?.GetValue(),
    };
  } finally {
    items.Dispose();
    parser.SourceDispose();
  }
}

it.each([
  ["auto", B.AUTO],
  ["always", B.ALWAYS],
  ["avoid", B.AVOID],
  ["left", B.LEFT],
  ["right", B.RIGHT],
] as const)(
  "retains the original before/after enum for %s",
  /** Both original handlers consume the same enum table. @param name - CSS keyword. @param value - Native value. @returns Nothing. */ (
    name,
    value,
  ) => {
    const result = parse(`page-break-before:${name};page-break-after:${name}`);
    expect([result.info.m_ePageBreakBefore, result.info.m_ePageBreakAfter]).toEqual([value, value]);
    expect(result.split).toBeUndefined();
  },
);
it("preserves pending state on invalid values and copies/merges/clears the native enums", /** Invalid values do not reset the preceding accepted declaration. @returns Nothing. */ () => {
  const { info } = parse(
    'PAGE-BREAK-BEFORE:LeFt trailing;page-break-before:"right";page-break-after:right;page-break-after:unknown',
  );
  const copy = new SvxCSS1PropertyInfo(info),
    merged = new SvxCSS1PropertyInfo();
  merged.Merge(copy);
  expect([merged.m_ePageBreakBefore, merged.m_ePageBreakAfter]).toEqual([B.LEFT, B.RIGHT]);
  merged.Merge(new SvxCSS1PropertyInfo());
  expect([merged.m_ePageBreakBefore, merged.m_ePageBreakAfter]).toEqual([B.LEFT, B.RIGHT]);
  merged.Clear();
  expect([merged.m_ePageBreakBefore, merged.m_ePageBreakAfter]).toEqual([B.NONE, B.NONE]);
});
it.each([
  ["avoid", false],
  ["auto", true],
  ["avoid;page-break-inside:auto", true],
  ["avoid;page-break-inside:left", false],
  ["auto;page-break-inside:always", true],
  ["avoid;page-break-inside:'auto'", false],
  ["AVOID trailing", false],
] as const)(
  "produces the original split flag for %s",
  /** Only AUTO/AVOID write an actual split item. @param css - Declaration suffix. @param expected - Split permission. @returns Nothing. */ (
    css,
    expected,
  ) => {
    expect(parse(`page-break-inside:${css}`).split).toBe(expected);
    expect(aItemIds.nFormatSplit).toBe(RES_PARATR_SPLIT);
  },
);
it.each(["left", "right", "always", "unknown", "1", "'avoid'"])(
  "ignores non-split page-break-inside value %s",
  /** There is no write for these original enum/token branches. @param css - Value. @returns Nothing. */ (
    css,
  ) => expect(parse(`page-break-inside:${css}`).split).toBeUndefined(),
);
it.each([
  ["0", 0],
  ["1", 1],
  ["2.9", 2],
  ["255", 255],
  ["255.5", 255],
  ["70000", 255],
  ["-0.5", 0],
  ["3 trailing", 3],
] as const)(
  "uses original count conversion for %s",
  /** Counts accept NUMBER, truncate fractions and clamp the upper bound to uint8. @param css - Value. @param expected - Count. @returns Nothing. */ (
    css,
    expected,
  ) => {
    const result = parse(`widows:${css};orphans:${css}`);
    expect([result.widows, result.orphans]).toEqual([expected, expected]);
    expect([aItemIds.nWidows, aItemIds.nOrphans]).toEqual([RES_PARATR_WIDOWS, RES_PARATR_ORPHANS]);
  },
);
it.each(["3pt", "3px", "3%", "auto", "'3'", "999999"])(
  "leaves existing counts intact for token %s",
  /** The six-hex scanner priority is preserved as well as ordinary invalid token admission. @param css - Value. @returns Nothing. */ (
    css,
  ) => {
    const result = parse(`widows:7;orphans:8;widows:${css};orphans:${css}`);
    expect([result.widows, result.orphans]).toEqual([7, 8]);
  },
);
it("delivers pagination items from Markdown raw HTML through the existing Worker boundary", /** Tests real document insertion, deferred paragraph attrs, and existing UI transport. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    OUStringToOString('<p style="page-break-inside:avoid;widows:7;orphans:8">body</p>', UTF8),
  );
  docs.push(doc);
  const restored = decodeWriterDocument(encodeWriterDocument(doc));
  docs.push(restored);
  for (const document of [doc, restored]) {
    const paragraph = document.paragraphs[0];
    assert(paragraph);
    expect((paragraph.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue()).toBe(false);
    expect((paragraph.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue()).toBe(7);
    expect((paragraph.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue()).toBe(8);
  }
});
