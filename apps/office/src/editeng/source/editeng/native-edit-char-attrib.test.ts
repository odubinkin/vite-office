/** @fileoverview Original pooled EditCharAttrib ranges and CharAttribList queries/merging over real EditEngine items and holders. Enclosing text-engine admission is not replaced by fixtures. */
import { expect, it } from "vitest";
import {
  EditCharAttrib,
  EditCharAttribTab,
  EditCharAttribLineBreak,
  CH_FEATURE,
} from "../../inc/editattr";
import { CharAttribList } from "./ContentNode.attribs";
import { EditEngineItemPool } from "../../inc/editdoc";
import { SvxColorItem } from "../../inc/colritem";
import { Color } from "../../../tools/inc/color";
import { SfxVoidItem } from "../../../svl/source/items/voiditem";
import {
  EE_CHAR_COLOR,
  EE_CHAR_BKGCOLOR,
  EE_FEATURE_TAB,
  EE_FEATURE_LINEBR,
} from "../../inc/eeitem";
/** Creates an ordinary source range with an actual matching color item. @param pool - Actual edit pool. @param start - Source start. @param end - Source end. @param color - Original color. @param which - Original color ID. @returns Owned attribute. */
function range(
  pool: EditEngineItemPool,
  start: number,
  end: number,
  color = 0x123456,
  which = EE_CHAR_COLOR,
): EditCharAttrib {
  const item = new SvxColorItem(new Color(color), which);
  try {
    return new EditCharAttrib(pool, item, start, end);
  } finally {
    item.Dispose();
  }
}

it("owns the actual pooled item independently of the source value and retains mutable endpoint identities", /** Checks real item retention, not a plain item/position record. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    item = new SvxColorItem(new Color(0x123456), EE_CHAR_COLOR),
    attribute = new EditCharAttrib(pool, item, 2, 5);
  try {
    item.SetValue(new Color(0x654321));
    expect((attribute.GetItem() as SvxColorItem).GetValue().toInt32()).toBe(0x123456);
    expect(attribute.Which()).toBe(EE_CHAR_COLOR);
    const start = attribute.GetStart(true),
      end = attribute.GetEnd(true);
    attribute.MoveForward(3);
    attribute.MoveBackward(1);
    attribute.Expand(2);
    attribute.Collaps(1);
    expect(start).toBe(attribute.GetStart(true));
    expect(end).toBe(attribute.GetEnd(true));
    expect([attribute.GetStart(), attribute.GetEnd(), attribute.GetLen()]).toEqual([4, 8, 4]);
    expect([
      attribute.IsIn(4),
      attribute.IsIn(8),
      attribute.IsInLeftClosedRightOpen(8),
      attribute.IsInside(4),
      attribute.IsInside(5),
    ]).toEqual([true, true, false, false, true]);
    attribute.SetEdge(true);
    attribute.SetExpandable(false);
    expect(attribute.IsEdge()).toBe(true);
    expect(attribute.IsExpandable()).toBe(false);
  } finally {
    attribute.dispose();
    item.Dispose();
  }
});

it.each([
  [EditCharAttribTab, EE_FEATURE_TAB],
  [EditCharAttribLineBreak, EE_FEATURE_LINEBR],
] as const)(
  "constructs original one-unit feature %s",
  /** A feature remains nonexpandable even with its independent flag enabled. @param Constructor - Source subtype. @param which - Source feature ID. @returns Nothing. */ (
    Constructor,
    which,
  ) => {
    const pool = new EditEngineItemPool(),
      item = new SfxVoidItem(which),
      feature = new Constructor(pool, item, 3);
    try {
      expect(CH_FEATURE).toBe(1);
      expect([
        feature.GetStart(),
        feature.GetEnd(),
        feature.GetLen(),
        feature.IsFeature(),
        feature.IsExpandable(),
      ]).toEqual([3, 4, 1, true, false]);
      feature.SetExpandable(true);
      expect(feature.IsExpandable()).toBe(false);
      feature.SetFeature(false);
      expect(feature.IsExpandable()).toBe(true);
    } finally {
      feature.dispose();
      item.Dispose();
    }
  },
);

it("uses source start ordering, reverse boundary precedence and half-open queries", /** Shared boundaries select the starting range; no endpoint normalization is added. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    list = new CharAttribList(),
    first = range(pool, 0, 2),
    second = range(pool, 2, 4);
  list.InsertAttrib(second);
  list.InsertAttrib(first);
  try {
    expect(list.GetAttribs()).toEqual([first, second]);
    expect(list.Count()).toBe(2);
    expect(list.FindAttrib(EE_CHAR_COLOR, 2)).toBe(second);
    expect(list.FindAttribRightOpen(EE_CHAR_COLOR, 4)).toBeNull();
    expect(list.FindNextAttrib(EE_CHAR_COLOR, 1)).toBe(second);
    expect(list.HasAttrib(1, 3)).toBe(true);
    expect(list.HasAttrib(4, 5)).toBe(false);
    first.GetStart(true)[0] = 3;
    first.GetEnd(true)[0] = 5;
    list.ResortAttribs();
    expect(list.GetAttribs()[0]).toBe(second);
  } finally {
    list.dispose();
  }
});

it("retains the source stale empty flag until its explicit cleanup", /** Pointer erase does not recompute the original cached flag. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    list = new CharAttribList(),
    empty = range(pool, 2, 2);
  list.InsertAttrib(empty);
  list.InsertAttrib(range(pool, 0, 4));
  try {
    expect(list.FindEmptyAttrib(EE_CHAR_COLOR, 2)).toBe(empty);
    list.Remove(empty);
    expect(list.HasEmptyAttribs()).toBe(true);
    expect(list.FindEmptyAttrib(EE_CHAR_COLOR, 2)).toBeNull();
    list.InsertAttrib(range(pool, 3, 3));
    list.DeleteEmptyAttribs();
    expect(list.Count()).toBe(1);
    expect(list.HasEmptyAttribs()).toBe(false);
  } finally {
    list.dispose();
  }
});

it("keeps the original first-match merge rather than repeatedly coalescing adjacent triples", /** OptimizeRanges does not revisit the first expanded range after its unconditional break. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    list = new CharAttribList();
  for (let i = 0; i < 3; i++) list.InsertAttrib(range(pool, i, i + 1));
  try {
    list.OptimizeRanges();
    expect(
      list
        .GetAttribs()
        .map(
          /** Reads source scalar span. @param value - Actual attribute. @returns Endpoints. */ (
            value,
          ) => [value.GetStart(), value.GetEnd()],
        ),
    ).toEqual([
      [0, 2],
      [2, 3],
    ]);
  } finally {
    list.dispose();
  }
});

it("preserves reverse early termination in bounding lookup and forward feature lower bounds", /** These are original ordered scans, not an interval-tree replacement. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    list = new CharAttribList();
  list.InsertAttrib(range(pool, 0, 10));
  list.InsertAttrib(range(pool, 5, 6, 0x111111, EE_CHAR_BKGCOLOR));
  const item = new SfxVoidItem(EE_FEATURE_TAB),
    feature = new EditCharAttribTab(pool, item, 12);
  item.Dispose();
  list.InsertAttrib(feature);
  try {
    expect(list.HasBoundingAttrib(10)).toBe(false);
    expect(list.FindFeature(0)).toBe(feature);
    expect(list.FindFeature(12)).toBe(feature);
    expect(list.FindFeature(13)).toBeNull();
  } finally {
    list.dispose();
  }
});
