/** @fileoverview Source GetParaAttr partial-hint and collapsed-boundary contracts over actual registered automatic attributes. */
import { afterEach, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SfxItemSet, SfxItemState as State } from "../../../../svl/inc/itemset";
import { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import { FontStrikeout as S } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_CROSSEDOUT as WHICH } from "../../../inc/hintids";
import { MakeTextAttr } from "./thints";
import type { SwTextNode } from "./ndtxt";
import { createSwFormatAutoFormat, projectWriterCharacterAttributes } from "./txatbase";
import {
  RES_PARATR_ADJUST,
  RES_CHRATR_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
} from "../../../inc/hintids";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
const documents: SwDoc[] = [];
afterEach(
  /** Releases native document owners. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Creates original native text with independently supplied hint intervals. @param entries - Start,end,native enum. @returns Native fixture. */
function fixture(entries: readonly (readonly [number, number, number])[]) {
  const doc = new SwDoc();
  documents.push(doc);
  const node = doc.paragraphs[0] as SwTextNode;
  node.SetText("abcdef");
  for (const [start, end, value] of entries) {
    const items = new SfxItemSet(doc.GetAttrPool(), [[WHICH, WHICH]]);
    items.Put(new SvxCrossedOutItem(value, WHICH));
    node.GetOrCreateSwpHints().Insert(MakeTextAttr(doc, items, start, end));
  }
  return { doc, node };
}
/** Reads original SET/default/INVALID state without display conversion. @param node - Native owner. @param start - First offset. @param end - Last offset. @param onlyText - Original flag. @returns Native item state and enum. */
function query(node: SwTextNode, start: number, end: number, onlyText = false) {
  const state = new SfxItemSet(node.GetDoc().GetAttrPool(), [[WHICH, WHICH]]);
  node.GetParaAttr(state, start, end, onlyText);
  return [state.GetItemState(WHICH, false), (state.Get(WHICH) as SvxCrossedOutItem).GetStrikeout()];
}
it("keeps registered non-character items out of a character-only query", /** Original partial-hint array admission ignores a non-character item in a public automatic-style container. @returns Nothing. */ () => {
  const { doc, node } = fixture([]),
    items = new SfxItemSet(doc.GetAttrPool(), [[RES_PARATR_ADJUST, RES_PARATR_ADJUST]]);
  items.Put(node.GetAttr(RES_PARATR_ADJUST));
  node.GetOrCreateSwpHints().Insert(MakeTextAttr(doc, items, 0, 2));
  expect(query(node, 0, 4, true)).toEqual([State.DEFAULT, S.STRIKEOUT_NONE]);
});
it("preserves complete enums and explicit NONE at the existing character-value boundary", /** Boundary projections must retain authored off values over an inherited decoration. @returns Nothing. */ () => {
  const { doc } = fixture([]),
    pool = doc.GetAttrPool(),
    plain = { bold: false, italic: false, underline: false };
  const direct = createSwFormatAutoFormat(pool, {
    ...plain,
    strikeout: S.STRIKEOUT_DOUBLE,
  }).GetStyleHandle();
  expect(projectWriterCharacterAttributes(direct).strikeout).toBe(S.STRIKEOUT_DOUBLE);
  const same = createSwFormatAutoFormat(
    pool,
    { ...plain, strikeout: S.STRIKEOUT_DOUBLE },
    { ...plain, strikeout: S.STRIKEOUT_DOUBLE },
  ).GetStyleHandle();
  expect(same.GetItemIfSet(WHICH, false)).toBeUndefined();
  const off = createSwFormatAutoFormat(
    pool,
    { ...plain, strikeout: S.STRIKEOUT_NONE },
    { ...plain, strikeout: S.STRIKEOUT_DOUBLE },
  ).GetStyleHandle();
  expect(projectWriterCharacterAttributes(off, direct).strikeout).toBe(S.STRIKEOUT_NONE);
  expect(projectWriterCharacterAttributes(same, direct).strikeout).toBe(S.STRIKEOUT_DOUBLE);
  const defaults = new SfxItemSet(pool, [[WHICH, WHICH]]);
  expect(projectWriterCharacterAttributes(defaults).strikeout).toBeUndefined();
  const alternatePool = new SfxItemPool();
  for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_POSTURE, RES_CHRATR_UNDERLINE])
    alternatePool.RegisterDefaultItem(pool.GetPoolDefaultItem(which));
  alternatePool.RegisterDefaultItem(new SvxCrossedOutItem(S.STRIKEOUT_SINGLE, WHICH));
  expect(
    projectWriterCharacterAttributes(new SfxItemSet(alternatePool, [[WHICH, WHICH]])).strikeout,
  ).toBe(S.STRIKEOUT_SINGLE);
});
it.each([
  [[], State.DEFAULT, 0],
  [[[0, 4, 2]], State.SET, 2],
  [
    [
      [0, 2, 1],
      [2, 4, 1],
    ],
    State.SET,
    1,
  ],
  [
    [
      [0, 1, 1],
      [2, 4, 1],
    ],
    State.INVALID,
    0,
  ],
  [
    [
      [0, 2, 1],
      [2, 4, 2],
    ],
    State.INVALID,
    0,
  ],
  [[[1, 4, 1]], State.INVALID, 0],
  [[[0, 2, 1]], State.INVALID, 0],
  [
    [
      [0, 1, 1],
      [1, 3, 1],
    ],
    State.INVALID,
    0,
  ],
  [
    [
      [0, 4, 1],
      [1, 2, 1],
    ],
    State.SET,
    1,
  ],
  [
    [
      [0, 4, 2],
      [1, 2, 1],
      [2, 3, 1],
    ],
    State.INVALID,
    0,
  ],
] as const)(
  "collects literal native partial-hint state %j",
  /** Checks source adjacency,gap and complete-cover decisions. @param entries - Actual hint intervals. @param state - Native state. @param value - Full enum. @returns Nothing. */ (
    entries,
    state,
    value,
  ) => {
    const { node } = fixture(entries);
    expect(query(node, 0, 4)).toEqual([state, value]);
  },
);
it("keeps native collapsed start/end and DontExpand rules", /** Actual hint flags determine cursor state. @returns Nothing. */ () => {
  const { node } = fixture([
    [0, 2, 1],
    [2, 4, 2],
    [5, 6, 4],
  ]);
  expect(query(node, 0, 0)).toEqual([State.SET, 1]);
  expect(query(node, 2, 2)).toEqual([State.SET, 1]);
  node.GetpSwpHints()?.Get(0).SetDontExpand(true);
  expect(query(node, 2, 2)).toEqual([State.DEFAULT, 0]);
  expect(query(node, 4, 4)).toEqual([State.SET, 2]);
  expect(query(node, 4, 5)).toEqual([State.DEFAULT, 0]);
  expect(query(node, 3, 4)).toEqual([State.SET, 2]);
  const empty = fixture([[2, 2, 4]]).node;
  expect(query(empty, 2, 2)).toEqual([State.SET, 4]);
});
it("retains inherited values,only-text separation and source default-valued partial suppression", /** Preserves literal source comparison even when identical full/adjacent explicit defaults yield different state. @returns Nothing. */ () => {
  const { node } = fixture([]);
  node.GetTextFormatColl().SetFormatAttr(new SvxCrossedOutItem(S.STRIKEOUT_DOUBLE, WHICH));
  expect(query(node, 0, 4)).toEqual([State.SET, 2]);
  expect(query(node, 0, 4, true)).toEqual([State.DEFAULT, 0]);
  const split = fixture([
    [0, 2, 0],
    [2, 4, 0],
  ]).node;
  expect(query(split, 0, 4, true)).toEqual([State.DEFAULT, 0]);
  expect(query(fixture([[0, 4, 0]]).node, 0, 4, true)).toEqual([State.SET, 0]);
});
