/** @fileoverview Verifies literal native three-map hint order, dirty intervals and binary queries without upstream access. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttr, SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
afterEach(/** Releases map spies. @returns Nothing. */ () => vi.restoreAllMocks());
/** Builds a literal family/range with all flag combinations. @param doc - Owner. @param which - Family. @param start - Start. @param end - End. @param mask - Flags. @returns Detached input. */
function attr(
  doc: SwDoc,
  which: number,
  start: number,
  end: number,
  mask: number,
): SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat> {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const hint = new SwTextAttr(
    which === 53
      ? new SwFormatAutoFormat(set)
      : new SwFormatINetFormat({ url: "https://example.test/maps" }),
    start,
    end,
  );
  hint.dontExpand = Boolean(mask & 1);
  hint.dontExpandStart = Boolean(mask & 2);
  hint.dontMoveAttr = Boolean(mask & 4);
  return hint;
}
/** Constructs independent non-overlapping ranges with deliberate cross-family ties. @param mask - Flags. @param reverse - Input order. @returns Actual owner and named owned objects. */
function fixture(mask = 0, reverse = false) {
  const doc = new SwDoc(),
    input = [
      attr(doc, 53, 0, 2, mask),
      attr(doc, 54, 0, 2, mask),
      attr(doc, 53, 4, 6, mask),
      attr(doc, 54, 3, 6, mask),
      attr(doc, 53, 8, 10, mask),
      attr(doc, 54, 8, 12, mask),
    ];
  const hints = new SwpHints(doc.GetAttrPool(), reverse ? [...input].reverse() : input);
  return {
    doc,
    hints,
    input,
    a: hints.Get(1),
    b: hints.Get(0),
    c: hints.Get(3),
    d: hints.Get(2),
    e: hints.Get(5),
    f: hints.Get(4),
  };
}
/** Reads the full actual end map. @param hints - Owner. @returns Actual attributes. */
function endMap(hints: SwpHints) {
  return Array.from(
    { length: hints.Count() },
    /** Reads one sorted object. @param _value - Unused placeholder. @param index - Position. @returns Actual attribute. */ (
      _value,
      index,
    ) => hints.GetSortedByEnd(index),
  );
}
/** Reads the full actual Which/start map. @param hints - Owner. @returns Actual attributes. */
function whichMap(hints: SwpHints) {
  return Array.from(
    { length: hints.Count() },
    /** Reads one sorted object. @param _value - Unused placeholder. @param index - Position. @returns Actual attribute. */ (
      _value,
      index,
    ) => hints.GetSortedByWhichAndStart(index),
  );
}
describe("native secondary hint maps", /** Registers independent literal map cases. @returns Nothing. */ () => {
  for (const reverse of [false, true])
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "shares actual objects across all maps, reverse=" + reverse + " flags=%s",
      /** Checks all three independent native orders and map ownership. @param mask - Flags. @returns Nothing. */ (
        mask,
      ) => {
        const { hints, input, a, b, c, d, e, f } = fixture(mask, reverse);
        expect(hints.entries()).toEqual([b, a, d, c, f, e]);
        expect(endMap(hints)).toEqual([a, b, c, d, e, f]);
        expect(whichMap(hints)).toEqual([a, c, e, b, d, f]);
        for (const owned of hints.entries()) {
          expect(owned.m_pHints).toBe(hints);
          expect(input).not.toContain(owned);
          expect(owned).toMatchObject({
            dontExpand: Boolean(mask & 1),
            dontExpandStart: Boolean(mask & 2),
            dontMoveAttr: Boolean(mask & 4),
          });
        }
        for (const caller of input) expect(caller.m_pHints).toBeUndefined();
        hints.SortIfNeedBe();
        expect(endMap(hints)).toEqual([a, b, c, d, e, f]);
        expect(whichMap(hints)).toEqual([a, c, e, b, d, f]);
      },
    );
  it.each([
    [-1, -1],
    [0, -1],
    [1, -1],
    [2, 1],
    [3, 1],
    [5, 1],
    [6, 3],
    [9, 3],
    [10, 4],
    [11, 4],
    [12, 5],
    [13, 5],
  ])(
    "end upper bound %s returns last index %s",
    /** Checks inclusive native upper-bound contract. @param position - End boundary. @param expected - Last qualifying index. @returns Nothing. */ (
      position,
      expected,
    ) => {
      const { hints } = fixture();
      expect(hints.GetLastPosSortedByEnd(position)).toBe(expected);
    },
  );
  it.each([
    [0, 0],
    [52, 0],
    [53, 0],
    [54, 3],
    [55, 9007199254740991],
  ])(
    "Which lower bound %s returns %s",
    /** Checks missing/between/end family boundaries. @param which - Family. @param expected - Native lower-bound position with portable end sentinel. @returns Nothing. */ (
      which,
      expected,
    ) => {
      const { hints } = fixture();
      expect(hints.GetFirstPosSortedByWhichAndStart(which)).toBe(expected);
    },
  );
  it("sorts each dirty map independently after start changes", /** Checks full-map dirtiness and stable raw primary iteration. @returns Nothing. */ () => {
    const { hints, a, b, c, d, e, f } = fixture();
    c.SetStart(0);
    expect(endMap(hints)).toEqual([a, b, d, c, e, f]);
    expect(hints.GetWithoutResorting(0)).toBe(b);
    expect(whichMap(hints)).toEqual([c, a, e, b, d, f]);
    expect(hints.GetWithoutResorting(0)).toBe(b);
    expect(hints.entries()).toEqual([c, b, a, d, f, e]);
    c.SetStart(4);
    hints.SortIfNeedBe();
    expect(hints.entries()).toEqual([b, a, d, c, f, e]);
    expect(endMap(hints)).toEqual([a, b, c, d, e, f]);
    expect(whichMap(hints)).toEqual([a, c, e, b, d, f]);
  });
  it("reorders equal-start end changes through a partial Which interval", /** Checks old/new end bounds and same-family end reverse priority. @returns Nothing. */ () => {
    const { hints, a, b, c, d, e, f } = fixture();
    c.SetStart(0);
    hints.SortIfNeedBe();
    a.SetEnd(8);
    expect(whichMap(hints)).toEqual([a, c, e, b, d, f]);
    expect(hints.GetWithoutResorting(0)).toBe(c);
    expect(endMap(hints)).toEqual([b, d, c, a, e, f]);
    expect(hints.entries()).toEqual([a, c, b, d, f, e]);
    a.SetEnd(6);
    hints.SortIfNeedBe();
    expect(new Set(whichMap(hints))).toEqual(new Set([a, c, e, b, d, f]));
    expect(new Set(endMap(hints))).toEqual(new Set([a, b, c, d, e, f]));
    expect(whichMap(hints).slice(0, 2)).toContain(a);
    expect(whichMap(hints).slice(0, 2)).toContain(c);
  });
  it.each([0, 1, 2, 3, 4, 5, 6, 7])(
    "widens lexicographic and end intervals across families, flags=%s",
    /** Checks multiple dirty intervals and restoration without copies. @param mask - Flags. @returns Nothing. */ (
      mask,
    ) => {
      const { hints, a, b, c, d, e, f } = fixture(mask);
      a.SetEnd(1);
      f.SetEnd(14);
      expect(whichMap(hints)).toEqual([a, c, e, b, d, f]);
      expect(endMap(hints)).toEqual([a, b, c, d, e, f]);
      expect(hints.GetLastPosSortedByEnd(12)).toBe(4);
      expect(hints.GetFirstPosSortedByWhichAndStart(54)).toBe(3);
      a.SetEnd(2);
      f.SetEnd(12);
      hints.SortIfNeedBe();
      expect(hints.entries()).toEqual([b, a, d, c, f, e]);
      expect(endMap(hints)).toEqual([a, b, c, d, e, f]);
      expect(whichMap(hints)).toEqual([a, c, e, b, d, f]);
      for (const owned of endMap(hints)) expect(owned.m_pHints).toBe(hints);
    },
  );
  it("returns the next family rather than failure for an absent family below it", /** Checks native lower-bound semantics and real existing caret reads. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      hints = new SwpHints(doc.GetAttrPool(), [attr(doc, 54, 2, 4, 0)]),
      inherited = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
    expect(hints.GetFirstPosSortedByWhichAndStart(53)).toBe(0);
    expect(hints.GetSortedByWhichAndStart(0).Which()).toBe(54);
    expect(hints.getCharacterAttributes("abcdef", 3, inherited).bold).toBe(false);
    expect(hints.getHyperlink("abcdef", 2)).toBeUndefined();
    expect(hints.getHyperlink("abcdef", 3)?.url).toBe("https://example.test/maps");
    expect(hints.getHyperlink("abcdef", 6)).toBeUndefined();
  });
  it.each([0, -1, 0.5])(
    "rejects missing secondary index %s after clearing ownership",
    /** Checks empty maps release all references and keep native binary sentinels. @param position - Missing index. @returns Nothing. */ (
      position,
    ) => {
      const { hints, a, b, c, d, e, f } = fixture();
      hints.replace([]);
      for (const removed of [a, b, c, d, e, f]) expect(removed.m_pHints).toBeUndefined();
      expect(hints.GetLastPosSortedByEnd(0)).toBe(-1);
      expect(hints.GetFirstPosSortedByWhichAndStart(53)).toBe(9007199254740991);
      expect(
        /** Attempts an absent end-map read. @returns Nothing. */ () =>
          hints.GetSortedByEnd(position),
      ).toThrow("Unknown SwpHints end position");
      expect(
        /** Attempts an absent Which-map read. @returns Nothing. */ () =>
          hints.GetSortedByWhichAndStart(position),
      ).toThrow("Unknown SwpHints Which position");
      hints.StartPosChanged();
      hints.SortIfNeedBe();
      hints.EndPosChanged(54, 0, 2, 3);
      hints.SortIfNeedBe();
      expect(hints.Count()).toBe(0);
    },
  );
  it("keeps no-op ends clean and unchanged starts dirty on all maps", /** Checks notifications instead of falsely inferring dirtiness from unchanged output. @returns Nothing. */ () => {
    const { hints, a } = fixture(),
      starts = vi.spyOn(hints, "StartPosChanged"),
      ends = vi.spyOn(hints, "EndPosChanged");
    a.SetEnd(2);
    expect(ends).not.toHaveBeenCalled();
    a.SetStart(0);
    expect(starts).toHaveBeenCalledTimes(1);
    hints.SortIfNeedBe();
    a.SetEnd(3);
    expect(ends).toHaveBeenCalledWith(53, 0, 2, 3);
    expect(hints.GetLastPosSortedByEnd(2)).toBe(0);
    expect(hints.GetSortedByEnd(1)).toBe(a);
    expect(hints.GetSortedByWhichAndStart(0)).toBe(a);
  });
});
