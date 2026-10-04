/** @fileoverview Checks MakeTextAttr real document owners, concrete pool conversion, copied items and fresh range flags. */
import { describe, expect, it } from "vitest";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import { SwDoc } from "../doc/doc";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwFormatAutoFormat } from "./txatbase";
import { MakeTextAttr } from "./thints";

/** Builds concrete character items. @param doc - Owner. @returns Input set. */
function input(doc: SwDoc): SfxItemSet {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  return set;
}

describe("native MakeTextAttr construction", /** Groups actual owner/item/factory tests. @returns Nothing. */ () => {
  it("interns set inputs and creates fresh independent items with shared handles and false flags", /** Checks both native overload boundaries. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      set = input(doc),
      a = MakeTextAttr(doc, set, 2, 6),
      b = MakeTextAttr(doc, set.Clone(), 6, 9);
    const first = a.format as SwFormatAutoFormat,
      second = b.format as SwFormatAutoFormat;
    expect(a).toMatchObject({
      start: 2,
      end: 6,
      dontExpand: false,
      dontExpandStart: false,
      dontMoveAttr: false,
    });
    expect(b).toMatchObject({
      start: 6,
      end: 9,
      dontExpand: false,
      dontExpandStart: false,
      dontMoveAttr: false,
    });
    expect(first).not.toBe(second);
    expect(first.GetStyleHandle()).toBe(second.GetStyleHandle());
    expect(first.GetStyleHandle()).not.toBe(set);
    expect(first.isShareable()).toBe(false);
    set.ClearItem();
    expect(first.GetStyleHandle().Get(15).QueryValue()).toBe(8);
    expect(a.clone().format).not.toBe(first);
    expect((a.clone().format as SwFormatAutoFormat).GetStyleHandle()).toBe(first.GetStyleHandle());
  });
  it.each([1, 15, 48])(
    "wraps character WhichId %s in the native fixed set and document pool",
    /** Checks native numeric boundary and inclusive set range. @param which - Concrete character identity. @returns Nothing. */ (
      which,
    ) => {
      const doc = new SwDoc(),
        item = new SfxInt16Item(which, 7),
        hint = MakeTextAttr(doc, item, 0, 4);
      const format = hint.format as SwFormatAutoFormat,
        handle = format.GetStyleHandle();
      expect(hint.Which()).toBe(53);
      expect(handle.GetPool()).toBe(doc.GetAttrPool());
      expect(handle.GetRanges()).toEqual([[1, 49]]);
      expect(handle.Count()).toBe(1);
      expect(handle.Get(which).QueryValue()).toBe(7);
      expect(handle.Get(which)).not.toBe(item);
      expect(
        (MakeTextAttr(doc, item.Clone(), 4, 7).format as SwFormatAutoFormat).GetStyleHandle(),
      ).toBe(handle);
    },
  );
  it("copies a same-pool automatic item without replacing or interning its explicit handle", /** Checks the item overload separately from set insertion. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      set = input(doc),
      format = new SwFormatAutoFormat(set),
      hint = MakeTextAttr(doc, format, 1, 3);
    expect(hint.format).not.toBe(format);
    expect((hint.format as SwFormatAutoFormat).GetStyleHandle()).toBe(set);
    expect(hint.format.equals(format)).toBe(true);
    expect(hint.clone(2)).toMatchObject({ start: 3, end: 5 });
    expect((hint.clone(2).format as SwFormatAutoFormat).GetStyleHandle()).toBe(set);
  });
  it.each([false, true])(
    "converts foreign automatic handle into destination-owned concrete items with sentinels=%s",
    /** Checks native cross-pool clone value/parent/state ownership. @param sentinels - Whether raw foreign input carries excluded state markers. @returns Nothing. */ (
      sentinels,
    ) => {
      const source = new SwDoc(),
        destination = new SwDoc(),
        set = input(source),
        parent = input(source);
      set.SetParent(parent);
      if (sentinels) {
        set.InvalidateItem(11);
        set.DisableItem(14);
      }
      const format = new SwFormatAutoFormat(set),
        converted = MakeTextAttr(destination, format, 2, 6).format as SwFormatAutoFormat;
      const handle = converted.GetStyleHandle();
      expect(handle.GetPool()).toBe(destination.GetAttrPool());
      expect(handle).not.toBe(set);
      expect(handle.GetParent()).toBeUndefined();
      expect(handle.Count()).toBe(1);
      expect(handle.GetItemState(11, false)).toBe(SfxItemState.DEFAULT);
      expect(handle.GetItemState(14, false)).toBe(SfxItemState.DEFAULT);
      expect(handle.Get(15).QueryValue()).toBe(8);
      expect(set.GetPool()).toBe(source.GetAttrPool());
      expect(set.GetParent()).toBe(parent);
      expect(set.Count()).toBe(sentinels ? 3 : 1);
      expect(
        (MakeTextAttr(destination, format, 6, 8).format as SwFormatAutoFormat).GetStyleHandle(),
      ).toBe(handle);
      expect(
        destination
          .GetIStyleAccess()
          .getAutomaticStyle(input(destination), SwAutoStyleFamily.AUTO_STYLE_CHAR),
      ).toBe(handle);
    },
  );
  it("copies non-shareable internet metadata into a fresh hint without fabricating an automatic style", /** Checks supported native internet item construction. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      format = new SwFormatINetFormat({
        url: "https://example.test/factory",
        name: "Factory",
        targetFrame: "_blank",
        styleName: "Internet Link",
        visitedStyleName: "Visited Internet Link",
      });
    const hint = MakeTextAttr(doc, format, 0, 5);
    expect(hint.Which()).toBe(54);
    expect(hint.format).not.toBe(format);
    expect(hint.format.equals(format)).toBe(true);
    expect(hint.format.QueryValue()).toEqual(format.QueryValue());
    expect(format.isShareable()).toBe(false);
    expect(hint.format.isShareable()).toBe(false);
    expect(hint).toMatchObject({ dontExpand: true, dontExpandStart: true, dontMoveAttr: false });
  });
  it.each([0, 49, 52, 55])(
    "rejects unimplemented hint WhichId %s without misclassifying it as a character item",
    /** Checks explicit unsupported-domain guards. @param which - Outside implemented hint families. @returns Nothing. */ (
      which,
    ) => {
      const doc = new SwDoc();
      expect(
        /** Attempts unsupported hint construction. @returns No hint. */ () =>
          MakeTextAttr(doc, new SfxInt16Item(which, 1), 0, 2),
      ).toThrow("hint type is not implemented");
    },
  );
  it("preserves inherited parent identity for same-document set insertion", /** Checks pool root ownership rather than projected inherited values. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      parent = input(doc),
      set = input(doc);
    parent.Put(new SvxPostureItem(2, 11));
    set.SetParent(parent);
    const handle = (MakeTextAttr(doc, set, 0, 2).format as SwFormatAutoFormat).GetStyleHandle();
    expect(handle.GetParent()).toBe(parent);
    expect(handle.Get(11).QueryValue()).toBe(2);
    set.SetParent(parent.Clone());
    expect((MakeTextAttr(doc, set, 2, 4).format as SwFormatAutoFormat).GetStyleHandle()).not.toBe(
      handle,
    );
  });
});
