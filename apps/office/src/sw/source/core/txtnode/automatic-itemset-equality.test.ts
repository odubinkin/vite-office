/** @fileoverview Checks real automatic item and adjacent hint preservation through the corrected base item-set state/owner comparison. */
import { describe, expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SvxWeightItem, SvxPostureItem } from "../../../../editeng/source/items/textitem";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttr, SwFormatAutoFormat } from "./txatbase";

/** Requires an actual owner. @param value - Optional value. @returns Owned value. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing equality owner");
  return value;
}
/** Builds a real adjacent pair without browser projections. @param doc - Real owner. @param left - Left style. @param right - Right style. @returns Real hints. */
function pair(doc: SwDoc, left: SfxItemSet, right: SfxItemSet): SwpHints {
  return new SwpHints(doc.GetAttrPool(), [
    new SwTextAttr(new SwFormatAutoFormat(left), 0, 2),
    new SwTextAttr(new SwFormatAutoFormat(right), 2, 4),
  ]);
}

describe("automatic item-set equality consumers", /** Tests actual hint owners and inherited item access. @returns Nothing. */ () => {
  it.each(["differentState", "differentKey", "differentCount"])(
    "retains %s markers across real adjacent hints and cloning",
    /** Checks sentinel identity/range preservation. @param kind - Independent distinction. @returns Nothing. */ (
      kind,
    ) => {
      const doc = new SwDoc(),
        left = new SfxItemSet(doc.GetAttrPool(), [[1, 15]]),
        right = new SfxItemSet(doc.GetAttrPool(), [[1, 15]]);
      left.InvalidateItem(11);
      if (kind === "differentState") right.DisableItem(11);
      else if (kind === "differentKey") right.InvalidateItem(15);
      else {
        right.InvalidateItem(11);
        right.DisableItem(15);
      }
      const hints = pair(doc, left, right);
      expect(hints.Count()).toBe(2);
      expect(hints.Get(0)).toMatchObject({ start: 0, end: 2 });
      expect(hints.Get(1)).toMatchObject({ start: 2, end: 4 });
      const a = hints.Get(0).format as SwFormatAutoFormat,
        b = hints.Get(1).format as SwFormatAutoFormat;
      expect(a.equals(b)).toBe(false);
      expect(a.Clone().equals(a)).toBe(true);
      expect(hints.clone().equals(hints)).toBe(true);
      const changed = new SfxItemSet(doc.GetAttrPool(), [[1, 15]]);
      changed.DisableItem(11);
      expect(hints.equals(pair(doc, changed, right))).toBe(false);
      expect(a.GetStyleHandle().GetItemState(11, false)).toBe(SfxItemState.INVALID);
      const node = required(doc.paragraphs[0]);
      node.SetText("abcd");
      node.SetTextHints(hints);
      expect(required(node.GetpSwpHints()).Count()).toBe(2);
    },
  );
  it("retains distinct parent-owned formatting instead of extending the first style over both ranges", /** Checks actual inherited item access affected by old merge. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      pool = doc.GetAttrPool(),
      italic = new SfxItemSet(pool, [[1, 15]]),
      plain = new SfxItemSet(pool, [[1, 15]]);
    italic.Put(new SvxPostureItem(2, 11));
    plain.Put(new SvxPostureItem(0, 11));
    const left = new SfxItemSet(pool, [[1, 15]], italic),
      right = new SfxItemSet(pool, [[1, 15]], plain);
    left.Put(new SvxWeightItem(8, 15));
    right.Put(new SvxWeightItem(8, 15));
    expect(left.Equals(right, false)).toBe(true);
    expect(left.Equals(right, true)).toBe(false);
    const node = required(doc.paragraphs[0]);
    node.SetText("abcd");
    node.SetTextHints(pair(doc, left, right));
    const owned = required(node.GetpSwpHints());
    expect(owned.Count()).toBe(2);
    expect((owned.Get(0).format as SwFormatAutoFormat).GetStyleHandle().Get(11).QueryValue()).toBe(
      2,
    );
    expect((owned.Get(1).format as SwFormatAutoFormat).GetStyleHandle().Get(11).QueryValue()).toBe(
      0,
    );
    expect(owned.clone().equals(owned)).toBe(true);
  });
  it("preserves the real text projection of distinct direct values", /** Checks value inequality still preserves visible ranges. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      pool = doc.GetAttrPool();
    const left = new SfxItemSet(pool, [[1, 15]]),
      right = new SfxItemSet(pool, [[1, 15]]);
    left.Put(new SvxWeightItem(8, 15));
    right.Put(new SvxWeightItem(5, 15));
    expect(
      pair(doc, left, right)
        .toTextRuns("abcd", doc.GetDfltTextFormatColl().GetAttrSet())
        .map(
          /** Reads actual projected weight. @param run - Real run. @returns Text and bold. */
          (run) => ({ text: run.text, bold: run.attributes.bold }),
        ),
    ).toEqual([
      { text: "ab", bold: true },
      { text: "cd", bold: false },
    ]);
  });
  it("distinguishes pool owners and merges equal direct states independent of accepted ranges", /** Checks existing value comparator uses base ownership and count. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      left = new SfxItemSet(doc.GetAttrPool(), [[1, 15]]),
      right = new SfxItemSet(doc.GetAttrPool(), [[15, 15]]),
      foreign = new SfxItemSet(new SwDoc().GetAttrPool(), [[1, 15]]);
    for (const set of [left, right, foreign]) set.Put(new SvxWeightItem(8, 15));
    expect(new SwFormatAutoFormat(left).equals(new SwFormatAutoFormat(foreign))).toBe(false);
    expect(pair(doc, left, right).Count()).toBe(1);
    left.InvalidateItem(11);
    right.SetParent(left);
    expect(pair(doc, left, right).Count()).toBe(2);
  });
});
