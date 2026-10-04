/** @fileoverview Checks pinned SfxItemSet Equals direct states, owner identity and non-comparison of ranges or inherited content. */
import { describe, expect, it } from "vitest";
import { SfxItemSet } from "./itemset";
import { SfxItemPool } from "./itempool";
import { SfxInt16Item } from "./intitem";

const kinds = ["value", "otherValue", "invalid", "disabled", "unset", "outside"] as const;
/** Builds independent native direct state fixtures. @param pool - Real pool. @param kind - State/value kind. @returns Real item set. */
function fixture(pool: SfxItemPool, kind: (typeof kinds)[number]): SfxItemSet {
  const set = new SfxItemSet(pool, kind === "outside" ? [[11, 11]] : [[1, 15]]);
  if (kind === "value" || kind === "otherValue")
    set.Put(new SfxInt16Item(15, kind === "value" ? 8 : 5));
  if (kind === "invalid") set.InvalidateItem(15);
  if (kind === "disabled") set.DisableItem(15);
  return set;
}

describe("native item-set equality", /** Groups literal state and ownership contracts. @returns Nothing. */ () => {
  for (const left of kinds)
    it.each(kinds)(
      "compares " + left + " with %s",
      /** Checks independent literal expected equality. @param right - Compared state kind. @returns Nothing. */ (
        right,
      ) => {
        const pool = new SfxItemPool(),
          a = fixture(pool, left),
          b = fixture(pool, right);
        const empty =
          (left === "unset" || left === "outside") && (right === "unset" || right === "outside");
        const expected = empty || left === right;
        expect(a.Equals(b, true)).toBe(expected);
        expect(b.Equals(a, true)).toBe(expected);
        expect(a.Equals(b, false)).toBe(expected);
        expect(a.Equals(a, true)).toBe(true);
        expect(a.Equals(a, false)).toBe(true);
        expect(a.Equals(a.Clone(), true)).toBe(true);
      },
    );
  it.each(["invalid", "disabled"] as const)(
    "compares the map key of %s markers rather than their zero WhichId",
    /** Checks marker positions. @param kind - Sentinel state. @returns Nothing. */ (kind) => {
      const pool = new SfxItemPool(),
        a = fixture(pool, kind),
        b = new SfxItemSet(pool, [[1, 15]]);
      if (kind === "invalid") b.InvalidateItem(11);
      else b.DisableItem(11);
      expect(a.Count()).toBe(1);
      expect(b.Count()).toBe(1);
      expect(a.Equals(b, true)).toBe(false);
      expect(b.Equals(a, false)).toBe(false);
    },
  );
  it.each(["unset", "value"] as const)(
    "compares pool identity for %s only when requested",
    /** Checks pool ownership on empty and populated sets. @param kind - Fixture kind. @returns Nothing. */ (
      kind,
    ) => {
      const a = fixture(new SfxItemPool(), kind),
        b = fixture(new SfxItemPool(), kind);
      expect(a.Equals(b, true)).toBe(false);
      expect(a.Equals(b, false)).toBe(true);
    },
  );
  it.each(["unset", "value"] as const)(
    "compares parent identity for %s only when requested",
    /** Checks parent identity without inherited content comparison. @param kind - Fixture kind. @returns Nothing. */ (
      kind,
    ) => {
      const pool = new SfxItemPool(),
        parent = new SfxItemSet(pool, [[1, 15]]),
        different = parent.Clone(),
        a = fixture(pool, kind),
        b = fixture(pool, kind);
      a.SetParent(parent);
      b.SetParent(different);
      expect(a.Equals(b, true)).toBe(false);
      expect(a.Equals(b, false)).toBe(true);
      b.SetParent(parent);
      expect(a.Equals(b, true)).toBe(true);
      parent.Put(new SfxInt16Item(11, 4));
      expect(a.Equals(b, true)).toBe(true);
      b.SetParent(undefined);
      expect(a.Equals(b, true)).toBe(false);
      expect(a.Equals(b, false)).toBe(true);
    },
  );
  it("ignores accepted ranges and insertion order while comparing all direct values", /** Checks direct map rather than projection/defaults. @returns Nothing. */ () => {
    const pool = new SfxItemPool(),
      a = new SfxItemSet(pool, [[1, 15]]),
      b = new SfxItemSet(pool, [
        [11, 11],
        [15, 15],
      ]);
    a.Put(new SfxInt16Item(11, 4));
    a.Put(new SfxInt16Item(15, 8));
    b.Put(new SfxInt16Item(15, 8));
    b.Put(new SfxInt16Item(11, 4));
    expect(a.Equals(b, true)).toBe(true);
    expect(b.Equals(a, false)).toBe(true);
    b.Put(new SfxInt16Item(15, 7));
    expect(a.Equals(b, true)).toBe(false);
    expect(a.GetItemIfSet(15, false)?.QueryValue()).toBe(8);
  });
});
