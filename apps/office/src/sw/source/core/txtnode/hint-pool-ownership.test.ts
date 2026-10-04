/** @fileoverview Checks destination hint ownership and separates native copying from retained state snapshots. */
import { describe, expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

const flags = [0, 1, 2, 3, 4, 5, 6, 7];
const metadata = {
  url: "https://example.test/copy",
  name: "Copied",
  targetFrame: "_blank",
  styleName: "Internet Link",
  visitedStyleName: "Visited Internet Link",
};

/** Builds source hints carrying both supported attribute families. @param doc - Source owner. @param mask - Flag combination. @returns Source hints. */
function sourceHints(doc: SwDoc, mask: number): SwpHints {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const hints = [
    new SwTextAttrEnd(new SwFormatAutoFormat(set), 1, 4),
    new SwTextAttrEnd(new SwFormatINetFormat(metadata), 1, 4),
  ];
  for (const hint of hints) {
    hint.dontExpand = Boolean(mask & 1);
    hint.dontExpandStart = Boolean(mask & 2);
    hint.dontMoveAttr = Boolean(mask & 4);
  }
  return new SwpHints(doc.GetAttrPool(), hints);
}

/** Verifies flags on every attribute. @param hints - Container. @param mask - Expected mask. @param fresh - Native constructor defaults. @returns Nothing. */
function expectFlags(hints: SwpHints, mask: number, fresh = false): void {
  expect(hints.Count()).toBe(2);
  for (const hint of hints.entries())
    expect(hint).toMatchObject({
      dontExpand: fresh && hint.Which() === 54 ? true : Boolean(mask & 1),
      dontExpandStart: fresh && hint.Which() === 54 ? true : Boolean(mask & 2),
      dontMoveAttr: Boolean(mask & 4),
    });
}

/** Reads the automatic handle. @param hints - Container with an automatic hint. @returns Handle. */
function handle(hints: SwpHints): SfxItemSet {
  const auto = hints.entries().find(
    /** Selects the automatic family independently of native range order. @param hint - Candidate hint. @returns Whether automatic. */
    (hint) => hint.Which() === 53,
  ) as SwTextAttrEnd<SwFormatAutoFormat>;
  return auto.format.GetStyleHandle();
}

describe("destination-owned hint copying", /** Registers ownership and snapshot cases. @returns Nothing. */ () => {
  it.each(flags)(
    "retains snapshot flags but reconstructs copied hints for mask %s",
    /** Checks same and foreign ownership without projections. @param mask - Flag combination. @returns Nothing. */ (
      mask,
    ) => {
      const source = new SwDoc(),
        target = new SwDoc(),
        hints = sourceHints(source, mask);
      const snapshot = hints.clone(),
        sameCopy = hints.CopyTo(source.GetAttrPool()),
        foreignCopy = hints.CopyTo(target.GetAttrPool()),
        foreignClone = hints.clone(target.GetAttrPool());
      expectFlags(snapshot, mask);
      expectFlags(sameCopy, 0, true);
      expectFlags(foreignCopy, 0, true);
      expectFlags(foreignClone, 0, true);
      expectFlags(hints, mask);
      expect(handle(snapshot)).toBe(handle(hints));
      expect(handle(sameCopy)).toBe(handle(hints));
      expect(handle(foreignCopy).GetPool()).toBe(target.GetAttrPool());
      expect(handle(foreignClone)).toBe(handle(foreignCopy));
      expect(handle(foreignCopy)).not.toBe(handle(hints));
      expect(handle(foreignCopy).Get(15).QueryValue()).toBe(8);
      for (const copy of [snapshot, sameCopy, foreignCopy, foreignClone]) {
        expect(copy.Get(0)).not.toBe(hints.Get(0));
        expect(copy.Get(0).format).not.toBe(hints.Get(0).format);
        expect(copy.Get(1).format).not.toBe(hints.Get(1).format);
        expect((copy.Get(0).format as SwFormatINetFormat).GetHyperlink()).toEqual(metadata);
        expect(copy.Get(0)).toMatchObject({ start: 1, end: 4 });
      }
      snapshot.Get(0).SetEnd(3);
      expect(hints.Get(0).end).toBe(4);
      handle(hints).ClearItem();
      expect(handle(foreignCopy).Count()).toBe(1);
    },
  );
  it("reuses destination styles and merges adjacent converted handles without foreign parents or sentinels", /** Checks pooled identity after concrete foreign conversion. @returns Nothing. */ () => {
    const source = new SwDoc(),
      target = new SwDoc(),
      hints = sourceHints(source, 7),
      foreign = handle(hints);
    const parent = foreign.Clone();
    foreign.SetParent(parent);
    foreign.InvalidateItem(11);
    foreign.DisableItem(14);
    const targetSet = new SfxItemSet(target.GetAttrPool(), [[1, 49]]);
    targetSet.Put(new SvxWeightItem(8, 15));
    const pooled = target
      .GetIStyleAccess()
      .getAutomaticStyle(targetSet, SwAutoStyleFamily.AUTO_STYLE_CHAR);
    const imported = hints.CopyTo(target.GetAttrPool());
    expect(handle(imported)).toBe(pooled);
    expect(handle(imported).GetParent()).toBeUndefined();
    expect(handle(imported).GetItemState(11, false)).toBe(SfxItemState.DEFAULT);
    expect(handle(imported).GetItemState(14, false)).toBe(SfxItemState.DEFAULT);
    expect(foreign.GetParent()).toBe(parent);
    expect(foreign.Count()).toBe(3);
    const leading = new SwpHints(target.GetAttrPool(), [
      new SwTextAttrEnd(new SwFormatAutoFormat(pooled), 0, 2),
    ]);
    const result = leading.concat(hints.slice(1, 4), 2);
    expect(result.Count()).toBe(2);
    expect(result.Get(0)).toMatchObject({ start: 0, end: 5 });
    expect(handle(result)).toBe(pooled);
    expect(result.Get(1)).toMatchObject({
      start: 2,
      end: 5,
      dontExpand: true,
      dontExpandStart: true,
      dontMoveAttr: false,
    });
    const third = hints.CopyTo(new SwDoc().GetAttrPool());
    expect(handle(third)).not.toBe(pooled);
  });
  it("converts raw foreign automatic hints before pruning marker-only sets", /** Checks raw arrays and converted emptiness. @returns Nothing. */ () => {
    const source = new SwDoc(),
      target = new SwDoc(),
      states = new SfxItemSet(source.GetAttrPool(), [[1, 49]]);
    states.InvalidateItem(11);
    states.DisableItem(14);
    const marker = new SwTextAttrEnd(new SwFormatAutoFormat(states), 0, 3);
    marker.dontExpand = marker.dontExpandStart = marker.dontMoveAttr = true;
    const original = new SwpHints(source.GetAttrPool(), [marker]);
    expect(original.Count()).toBe(1);
    expect(new SwpHints(target.GetAttrPool(), [marker]).Count()).toBe(0);
    expect(original.CopyTo(target.GetAttrPool()).Count()).toBe(0);
    expect(original.clone(target.GetAttrPool()).Count()).toBe(0);
    expect(states.Count()).toBe(2);
    const valid = sourceHints(source, 7).Get(1);
    const bound = new SwpHints(target.GetAttrPool(), [valid]);
    expect(handle(bound).GetPool()).toBe(target.GetAttrPool());
    expect(bound.Get(0)).toMatchObject({
      dontExpand: false,
      dontExpandStart: false,
      dontMoveAttr: false,
    });
    expect(valid.dontExpand).toBe(true);
  });
  it.each([false, true])(
    "binds internet-only foreign fragments through concat and replacement with foreign=%s",
    /** Checks header ownership when items have no style handle. @param foreign - Separate source pool. @returns Nothing. */ (
      foreign,
    ) => {
      const target = new SwDoc(),
        source = foreign ? new SwDoc() : target;
      const all = sourceHints(source, 7),
        internet = new SwpHints(source.GetAttrPool(), [all.Get(0)]).slice(1, 4);
      const empty = new SwpHints(target.GetAttrPool());
      const joined = empty.concat(internet, 2),
        replaced = empty.replaceRange(4, 1, 3, internet, 3);
      for (const result of [joined, replaced]) {
        expect(result.Count()).toBe(1);
        expect(result.Get(0)).toMatchObject({
          dontExpand: true,
          dontExpandStart: true,
          dontMoveAttr: !foreign,
        });
        expect(result.Get(0).format.QueryValue()).toBe(all.Get(0).format.QueryValue());
      }
      expect(joined.Get(0)).toMatchObject({ start: 2, end: 5 });
      expect(replaced.Get(0)).toMatchObject({ start: 1, end: 4 });
      expect(internet.Get(0).dontMoveAttr).toBe(true);
    },
  );
});
