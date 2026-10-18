/** @fileoverview Original rich-text section partitioning over genuine ContentInfo and pool-bound attributes;no fake text object or renderer. */
import { expect, it } from "vitest";
import { GetAllSections, ContentInfo, XEditAttribute } from "./editobj2";
import { SvxWeightItem } from "../../inc/wghtitem";
import { SvxPostureItem } from "../../inc/postitem";
import { FontWeight, FontItalic } from "../../../tools/inc/fontenum";
import { EE_CHAR_WEIGHT, EE_CHAR_ITALIC } from "../../inc/eeitem";
import { Section } from "../../inc/section";
import { SfxItemPool } from "../../../svl/inc/itempool";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { SfxPoolItemHolder } from "../../../svl/inc/itemset";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Actual initialized paragraph producer. @param pool - Owner. @param text - UTF16. @returns Paragraph. */ function paragraph(
  pool: SfxItemPool,
  text: string,
): ContentInfo {
  const c = new ContentInfo(pool),
    s = new OUString(
      Uint16Array.from(
        text
          .split("")
          .map(/** UTF16 unit. @param c - Character. @returns Unit. */ (c) => c.charCodeAt(0)),
      ),
      text.length,
    );
  c.SetText(s);
  s.dispose();
  return c;
}
/** Actual shared item association. @param pool - Owner. @param c - Paragraph. @param which - Which. @param start - Start. @param end - End. @param value - Data. @returns Borrowed stored item. */ function attribute(
  pool: SfxItemPool,
  c: ContentInfo,
  which: number,
  start: number,
  end: number,
  value = 1,
) {
  const a = new XEditAttribute(pool, new SfxInt16Item(which, value), start, end);
  c.GetCharAttribs().push(a);
  return a.GetItem();
}
it("partitions all paragraph boundaries and overlapping spans with original first-Which duplicate suppression", /** Preserves unformatted sections and borrowed item identities. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    a = paragraph(pool, "abcdef"),
    b = paragraph(pool, "xy"),
    empty = paragraph(pool, "");
  const first = attribute(pool, a, 4042, 0, 4),
    second = attribute(pool, a, 4043, 2, 6);
  attribute(pool, a, 4042, 2, 4, 9);
  const last = attribute(pool, b, 4044, 1, 2);
  const result = [new Section(99, 99, 99)];
  GetAllSections([a, b, empty], result);
  expect(
    result.map(
      /** Projects native result values. @param s - Section. @returns Coordinates/items. */ (s) => [
        s.mnParagraph,
        s.mnStart,
        s.mnEnd,
        s.maAttributes.map(
          /** Reads identity. @param i - Item. @returns Which. */ (i) => i.Which(),
        ),
      ],
    ),
  ).toEqual([
    [0, 0, 2, [4042]],
    [0, 2, 4, [4042, 4043]],
    [0, 4, 6, [4043]],
    [1, 0, 1, []],
    [1, 1, 2, [4044]],
    [2, 0, 0, []],
  ]);
  expect(result[0]?.maAttributes[0]).toBe(first);
  expect(result[1]?.maAttributes[0]).toBe(first);
  expect(result[1]?.maAttributes[1]).toBe(second);
  expect(result[4]?.maAttributes[0]).toBe(last);
});
it("keeps caller output unchanged for no contents and native missing-start early returns", /** Zero-span end attributes can select the source assertion/release return path. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    a = paragraph(pool, "ab"),
    b = paragraph(pool, "c"),
    sentinel = new Section(7, 8, 9),
    result = [sentinel];
  GetAllSections([], result);
  expect(result).toEqual([sentinel]);
  attribute(pool, a, 4042, 2, 2);
  GetAllSections([a, b], result);
  expect(result).toEqual([sentinel]);
  expect(result[0]).toBe(sentinel);
});
it("retains zero spans,source unsigned border ordering and out-of-text borders without clipping", /** Uses source value boundaries,not an invented layout validation. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    a = paragraph(pool, "abcd"),
    empty = paragraph(pool, "");
  attribute(pool, a, 4042, 1, 1);
  attribute(pool, a, 4043, 3, 8);
  attribute(pool, a, 4044, -2, -1);
  attribute(pool, empty, 4045, 0, 0);
  const result: Section[] = [];
  GetAllSections([a, empty], result);
  expect(
    result.map(
      /** Reads original signed32 section coordinates after unsigned sorting. @param s - Section. @returns Tuple. */ (
        s,
      ) => [s.mnParagraph, s.mnStart, s.mnEnd],
    ),
  ).toEqual([
    [0, 0, 1],
    [0, 1, 3],
    [0, 3, 4],
    [0, 4, 8],
    [0, 8, -2],
    [0, -2, -1],
    [1, 0, 0],
  ]);
  expect(
    result[5]?.maAttributes.map(
      /** Native attribute order. @param item - Format. @returns Which. */ (item) => item.Which(),
    ),
  ).toEqual([4043, 4044]);
  expect(result[6]?.maAttributes[0]?.Which()).toBe(4045);
});
it("ignores null-holder spans in both border collection and attribute application", /** The actual holder can be assigned to absence. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    a = paragraph(pool, "abcd"),
    attr = new XEditAttribute(pool, new SfxInt16Item(4042, 1), 1, 3);
  attr.GetItemHolder().assign(new SfxPoolItemHolder());
  a.GetCharAttribs().push(attr);
  const result: Section[] = [];
  GetAllSections([a], result);
  expect(result).toHaveLength(1);
  expect([result[0]?.mnStart, result[0]?.mnEnd, result[0]?.maAttributes]).toEqual([0, 4, []]);
});

it("replays native testSectionAttributes partition assertions through actual content and format values", /** Native EditEngine construction is not claimed;its constructed paragraph/attribute inputs are supplied at the implemented boundary. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    bold = new SvxWeightItem(FontWeight.WEIGHT_BOLD, EE_CHAR_WEIGHT),
    italic = new SvxPostureItem(FontItalic.ITALIC_NORMAL, EE_CHAR_ITALIC),
    c = paragraph(pool, "aaabbbccc");
  c.GetCharAttribs().push(
    new XEditAttribute(pool, bold, 0, 6),
    new XEditAttribute(pool, italic, 3, 9),
  );
  const result: Section[] = [];
  GetAllSections([c], result);
  expect(
    result.map(
      /** Original native QA span and Which assertions. @param s - Section. @returns Values. */ (
        s,
      ) => [
        s.mnParagraph,
        s.mnStart,
        s.mnEnd,
        s.maAttributes.map(
          /** Native item identity. @param item - Format. @returns Which. */ (item) => item.Which(),
        ),
      ],
    ),
  ).toEqual([
    [0, 0, 3, [EE_CHAR_WEIGHT]],
    [0, 3, 6, [EE_CHAR_WEIGHT, EE_CHAR_ITALIC]],
    [0, 6, 9, [EE_CHAR_ITALIC]],
  ]);
  const lines = ["one", "", "two", "", "three"].map(
    /** Native five-paragraph input. @param t - Text. @returns Content. */ (t) =>
      paragraph(pool, t),
  );
  for (const i of [0, 2, 4]) {
    const line = lines[i] as ContentInfo;
    line.GetCharAttribs().push(new XEditAttribute(pool, bold, 0, line.GetTextLen()));
  }
  GetAllSections(lines, result);
  expect(
    result.map(
      /** Native empty paragraphs remain independent sections. @param s - Section. @returns Values. */ (
        s,
      ) => [s.mnParagraph, s.mnStart, s.mnEnd, s.maAttributes.length],
    ),
  ).toEqual([
    [0, 0, 3, 1],
    [1, 0, 0, 0],
    [2, 0, 3, 1],
    [3, 0, 0, 0],
    [4, 0, 5, 1],
  ]);
});
