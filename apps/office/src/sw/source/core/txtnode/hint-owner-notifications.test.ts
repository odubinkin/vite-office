/** @fileoverview Verifies native attribute-owner notifications and lazy primary-map sorting without upstream access. */
import { afterEach, describe, expect, it, vi } from "vitest";
import { SvxWeightItem } from "../../../../editeng/source/items/textitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwDoc } from "../doc/doc";
import { SwpHints } from "./ndhints";
import { SwTextAttr, SwFormatAutoFormat } from "./txatbase";
import { SwFormatINetFormat } from "./fmtatr2";
afterEach(/** Restores per-owner spies. @returns Nothing. */ () => vi.restoreAllMocks());
/** Creates a concrete ranged family. @param doc - Owner. @param which - Literal family. @param start - Start. @param end - End. @param mask - Flags. @returns Unowned input. */
function attr(
  doc: SwDoc,
  which: number,
  start: number,
  end: number,
  mask = 0,
): SwTextAttr<SwFormatAutoFormat | SwFormatINetFormat> {
  const set = new SfxItemSet(doc.GetAttrPool(), [[1, 49]]);
  set.Put(new SvxWeightItem(8, 15));
  const hint = new SwTextAttr(
    which === 53
      ? new SwFormatAutoFormat(set)
      : new SwFormatINetFormat({ url: "https://example.test/notify" }),
    start,
    end,
  );
  hint.dontExpand = Boolean(mask & 1);
  hint.dontExpandStart = Boolean(mask & 2);
  hint.dontMoveAttr = Boolean(mask & 4);
  return hint;
}
describe("hint owner range notifications", /** Registers literal mutation and ownership cases. @returns Nothing. */ () => {
  for (const which of [53, 54])
    it.each([0, 1, 2, 3, 4, 5, 6, 7])(
      "notifies actual owner for family " + which + " mask %s",
      /** Checks native no-op/end/start semantics and stable raw iteration. @param mask - Independent flags. @returns Nothing. */ (
        mask,
      ) => {
        const doc = new SwDoc(),
          caller = attr(doc, which, 4, 6, mask),
          other = attr(doc, which === 53 ? 54 : 53, 1, 3, mask),
          hints = new SwpHints(doc.GetAttrPool(), [caller, other]),
          snapshot = hints.clone(),
          moving = hints.Get(1),
          stationary = hints.Get(0);
        expect(caller.m_pHints).toBeUndefined();
        expect(other.m_pHints).toBeUndefined();
        expect(moving).not.toBe(caller);
        expect(moving.m_pHints).toBe(hints);
        expect(stationary.m_pHints).toBe(hints);
        expect(snapshot.Get(1).m_pHints).toBe(snapshot);
        const starts = vi.spyOn(hints, "StartPosChanged"),
          ends = vi.spyOn(hints, "EndPosChanged");
        moving.SetStart(0);
        expect(starts).toHaveBeenCalledTimes(1);
        expect(hints.Count()).toBe(2);
        expect(hints.GetWithoutResorting(0)).toBe(stationary);
        expect(hints.GetWithoutResorting(1)).toBe(moving);
        expect(hints.Get(0)).toBe(moving);
        moving.SetEnd(6);
        expect(ends).not.toHaveBeenCalled();
        moving.start = 1;
        moving.SetEnd(2);
        expect(ends).toHaveBeenLastCalledWith(which, 1, 6, 2);
        expect(hints.GetWithoutResorting(0)).toBe(moving);
        expect(hints.Get(0)).toBe(stationary);
        moving.end = 5;
        expect(ends).toHaveBeenLastCalledWith(which, 1, 2, 5);
        expect(hints.GetWithoutResorting(0)).toBe(stationary);
        expect(hints.entries()[0]).toBe(moving);
        moving.end = 3;
        expect(ends).toHaveBeenLastCalledWith(which, 1, 5, 3);
        expect(hints.Get(0).Which()).toBe(54);
        moving.SetStart(1);
        moving.SetEnd(3);
        expect(starts).toHaveBeenCalledTimes(3);
        expect(ends).toHaveBeenCalledTimes(3);
        expect(moving.m_pHints).toBe(hints);
        expect(moving).toMatchObject({
          dontExpand: Boolean(mask & 1),
          dontExpandStart: Boolean(mask & 2),
          dontMoveAttr: Boolean(mask & 4),
        });
        expect(snapshot.Get(1)).toMatchObject({ start: 4, end: 6 });
        const detached = moving.clone();
        expect(detached.m_pHints).toBeUndefined();
        expect(detached.format).not.toBe(moving.format);
        detached.start = 0;
        detached.end = 2;
        expect(starts).toHaveBeenCalledTimes(3);
        expect(ends).toHaveBeenCalledTimes(3);
        expect(moving).toMatchObject({ start: 1, end: 3 });
        expect(
          /** Attempts invalid end before notification. @returns Nothing. */ () => moving.SetEnd(0),
        ).toThrow("end is invalid");
        expect(
          /** Attempts fractional end before notification. @returns Nothing. */ () =>
            moving.SetEnd(1.5),
        ).toThrow("end is invalid");
        expect(ends).toHaveBeenCalledTimes(3);
      },
    );
  it.each([0, 2, 3, 6, 8, 9])(
    "resorts only a dirty start interval bounded at %s",
    /** Checks lower/upper bounds around absent and present start groups. @param start - Dirty interval. @returns Nothing. */ (
      start,
    ) => {
      const doc = new SwDoc(),
        hints = new SwpHints(doc.GetAttrPool(), [attr(doc, 53, 2, 4), attr(doc, 54, 6, 8)]),
        first = hints.Get(0),
        last = hints.Get(1);
      hints.EndPosChanged(53, start, 3, 4);
      hints.ResortStartMap();
      expect(hints.Get(0)).toBe(first);
      expect(hints.Get(1)).toBe(last);
      expect(first.m_pHints).toBe(hints);
      expect(last.m_pHints).toBe(hints);
    },
  );
  it("releases merged and removed owners while preserving the surviving actual object", /** Checks ownership normalization and empty-map notifications. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      a = attr(doc, 53, 0, 2),
      b = new SwTextAttr(a.format.Clone(), 4, 6),
      hints = new SwpHints(doc.GetAttrPool(), [a, b]),
      head = hints.Get(0),
      tail = hints.Get(1);
    expect(hints.Cut(2, 4).Count()).toBe(0);
    expect(hints.Count()).toBe(1);
    expect(hints.Get(0)).toBe(head);
    expect(head).toMatchObject({ start: 0, end: 4 });
    expect(head.m_pHints).toBe(hints);
    expect(tail.m_pHints).toBeUndefined();
    hints.replace([]);
    expect(head.m_pHints).toBeUndefined();
    expect(hints.Count()).toBe(0);
    const starts = vi.spyOn(hints, "StartPosChanged");
    head.SetStart(0);
    expect(starts).not.toHaveBeenCalled();
    hints.StartPosChanged();
    hints.ResortStartMap();
    hints.EndPosChanged(53, 0, 1, 2);
    hints.ResortStartMap();
    expect(
      /** Attempts raw read from empty container. @returns No attribute. */ () =>
        hints.GetWithoutResorting(0),
    ).toThrow("Unknown SwpHints position");
  });
  it("sorts actual edits without normalizing or replacing owned hints", /** Checks sort-only behavior and replacement detachment. @returns Nothing. */ () => {
    const doc = new SwDoc(),
      a = attr(doc, 53, 0, 2),
      b = new SwTextAttr(a.format.Clone(), 4, 6),
      hints = new SwpHints(doc.GetAttrPool(), [a, b]),
      head = hints.Get(0),
      tail = hints.Get(1);
    tail.SetStart(0);
    expect(hints.Get(0)).toBe(tail);
    expect(hints.Get(1)).toBe(head);
    expect(hints.Count()).toBe(2);
    tail.SetStart(4);
    const replacement = hints.entries();
    hints.replace(replacement);
    expect(head.m_pHints).toBeUndefined();
    expect(tail.m_pHints).toBeUndefined();
    expect(hints.Get(0)).not.toBe(head);
    expect(hints.Get(1)).not.toBe(tail);
    expect(hints.Get(0).m_pHints).toBe(hints);
    expect(hints.Get(1).m_pHints).toBe(hints);
  });
});
