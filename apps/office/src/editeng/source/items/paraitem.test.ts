/** @fileoverview Verifies the pinned SvxTabStopItem value and ordered container contract. */

import { createTabs, tabStops } from "../../../../test/tab-item-fixtures";
import { describe, expect, it } from "vitest";

import { decodeSfxPoolItem, encodeSfxPoolItem } from "../../../sw/browser/filter/xml/item-codec";
import { RES_PARATR_TABSTOP } from "../../../sw/inc/hintids";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SvxTabStopItem, SvxTabStop, SvxTabAdjust } from "../../inc/tstpitem";

const which = RES_PARATR_TABSTOP;

describe("SvxTabStopItem", /** Groups upstream tab-stop contract checks. @returns Nothing. */ () => {
  it("uses pinned default counts, spacing, ordering and position replacement", /** Checks item construction and sorted insertion. @returns Nothing. */ () => {
    const poolDefault = new SvxTabStopItem(1, 1134, SvxTabAdjust.Default, which);
    expect(poolDefault.Count()).toBe(1);
    expect(poolDefault.At(0).GetTabPos()).toBe(1134);
    expect(poolDefault.At(0).GetAdjustment()).toBe(SvxTabAdjust.Default);
    expect(new SvxTabStopItem(which).Count()).toBe(10);
    const item = createTabs(which, [new SvxTabStop(1440), new SvxTabStop(720)]);
    expect(
      tabStops(item).map(
        /** Projects a stop position. @param stop - Tab stop. @returns Twips. */
        (stop) => stop.GetTabPos(),
      ),
    ).toEqual([720, 1440]);
    expect(item.GetPos(720)).toBe(0);
    expect(item.GetPos(new SvxTabStop(999))).toBe(65535);
    expect(item.Insert(new SvxTabStop(720, SvxTabAdjust.Right))).toBe(true);
    expect(item.Count()).toBe(2);
    expect(item.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
    expect(tabStops(item)).not.toBe(tabStops(item));
    item.Remove(0);
    expect(item.At(0).GetTabPos()).toBe(1440);
    item.SetDefaultDistance(1134);
    expect(item.GetDefaultDistance()).toBe(1134);
    const clone = item.Clone();
    expect(clone).not.toBe(item);
    expect(clone.equals(item)).toBe(true);
    clone.Remove(0);
    expect(item.Count()).toBe(1);
  });

  it("compares every tab value and restores complete snapshots", /** Checks value identity across persistence. @returns Nothing. */ () => {
    const base = createTabs(which, [new SvxTabStop(720, SvxTabAdjust.Decimal, ".", ".")], 1134);
    expect(restoreTabs(which, encodeSfxPoolItem(base).value).equals(base)).toBe(true);
    expect(base.equals(new SfxBoolItem(which, true))).toBe(false);
    expect(base.equals(createTabs(which + 1, tabStops(base), 1134))).toBe(true);
    expect(base.equals(createTabs(which, tabStops(base), 720))).toBe(false);
    expect(base.equals(createTabs(which, [], 1134))).toBe(false);
    for (const stop of [
      new SvxTabStop(721, SvxTabAdjust.Decimal, ".", "."),
      new SvxTabStop(720, SvxTabAdjust.Left, ".", "."),
      new SvxTabStop(720, SvxTabAdjust.Decimal, ",", "."),
      new SvxTabStop(720, SvxTabAdjust.Decimal, ".", "_"),
    ])
      expect(base.equals(createTabs(which, [stop], 1134))).toBe(false);
  });

  it("rejects invalid stop and snapshot values", /** Keeps tab positions, enums and characters in the upstream domain. @returns Nothing. */ () => {
    for (const position of [-2147483649, 1.5, 2147483648, NaN, Infinity, -Infinity])
      expect(
        /** Builds an invalid position. @returns Rejected tab. */ () => new SvxTabStop(position),
      ).toThrow("position");
    for (const adjustment of [1.5])
      expect(
        /** Builds an invalid adjustment. @returns Rejected tab. */ () =>
          new SvxTabStop(0, adjustment as SvxTabAdjust),
      ).toThrow("adjustment");
    expect(
      /** Builds an invalid decimal. @returns Rejected tab. */ () =>
        new SvxTabStop(0, SvxTabAdjust.Left, "ab"),
    ).toThrow("characters");
    expect(
      /** Builds an invalid leader. @returns Rejected tab. */ () =>
        new SvxTabStop(0, SvxTabAdjust.Left, ".", "ab"),
    ).toThrow("characters");
    for (const args of [
      [-1, 1, SvxTabAdjust.Default],
      [65536, 1, SvxTabAdjust.Default],
      [1.5, 1, SvxTabAdjust.Default],
      [1, -1, SvxTabAdjust.Default],
      [1, 1.5, SvxTabAdjust.Default],
    ] as const)
      expect(
        /** Builds an invalid item. @returns Rejected item. */ () =>
          new SvxTabStopItem(args[0], args[1], args[2] as SvxTabAdjust, which),
      ).toThrow("constructor");
    expect(
      /** Omits the adjustment. @returns Rejected item. */ () =>
        new SvxTabStopItem(1, 1, undefined as unknown as SvxTabAdjust, which),
    ).toThrow("constructor");
    const item = createTabs(which, []);

    for (const distance of [-2147483649, 0.5, 2147483648, NaN, Infinity, -Infinity])
      expect(
        /** Sets invalid spacing. @returns Nothing. */ () => item.SetDefaultDistance(distance),
      ).toThrow("distance");
    for (const value of [
      null,
      [],
      1,
      {},
      { stops: [], defaultDistance: 0.5 },
      { stops: [null], defaultDistance: 0 },
      { stops: [[]], defaultDistance: 0 },
      { stops: [{ position: "a", adjustment: 0, decimal: ".", fill: " " }], defaultDistance: 0 },
      { stops: [{ position: 0, adjustment: "a", decimal: ".", fill: " " }], defaultDistance: 0 },
      { stops: [{ position: 0, adjustment: 0, decimal: 1, fill: " " }], defaultDistance: 0 },
      { stops: [{ position: 0, adjustment: 0, decimal: ".", fill: 1 }], defaultDistance: 0 },
    ])
      expect(
        /** Restores an invalid snapshot. @returns Rejected item. */ () =>
          restoreTabs(which, value),
      ).toThrow("invalid");
  });

  it("preserves signed int32 positions and direct default distances through ordered items and codec", /** Verifies the native direct-storage domain independently of UNO property restrictions. @returns Nothing. */ () => {
    const pool = createWriterDocument().GetAttrPool();
    for (const value of [-2147483648, -720, -1, 0, 2147483647]) {
      const item = createTabs(
        RES_PARATR_TABSTOP,
        [new SvxTabStop(value, SvxTabAdjust.Decimal, ";", ".")],
        value,
      );
      expect(item.At(0).GetTabPos()).toBe(value);
      expect(item.GetDefaultDistance()).toBe(value);
      expect(encodeSfxPoolItem(item).value).toEqual({
        defaultDistance: value,
        stops: [{ position: value, adjustment: SvxTabAdjust.Decimal, decimal: ";", fill: "." }],
      });
      const clone = item.Clone();
      expect(clone).not.toBe(item);
      expect(clone.equals(item)).toBe(true);
      expect(restoreTabs(RES_PARATR_TABSTOP, encodeSfxPoolItem(item).value).equals(item)).toBe(
        true,
      );
      expect(decodeSfxPoolItem(pool, encodeSfxPoolItem(item)).equals(item)).toBe(true);
    }
    const mixed = createTabs(
      RES_PARATR_TABSTOP,
      [new SvxTabStop(360), new SvxTabStop(-360), new SvxTabStop(0), new SvxTabStop(-720)],
      -1134,
    );
    expect(
      tabStops(mixed).map(
        /** Projects the signed order. @param stop - Stored stop. @returns Twip position. */
        (stop) => stop.GetTabPos(),
      ),
    ).toEqual([-720, -360, 0, 360]);
    expect(mixed.GetPos(-360)).toBe(1);
    expect(mixed.Insert(new SvxTabStop(-360, SvxTabAdjust.Right))).toBe(true);
    expect(mixed.Count()).toBe(4);
    expect(mixed.At(1).GetAdjustment()).toBe(SvxTabAdjust.Right);
    const clone = mixed.Clone();
    clone.Remove(0);
    clone.SetDefaultDistance(-1);
    expect(mixed.Count()).toBe(4);
    expect(mixed.GetDefaultDistance()).toBe(-1134);
    expect(clone.GetDefaultDistance()).toBe(-1);
  });
  it("restores explicit post-construction nul decimal and fill fields through Writer persistence", /** Keeps exact saved value fields distinct from native constructor defaults. @returns Nothing. */ () => {
    const tab = new SvxTabStop(720, SvxTabAdjust.Decimal, ".", "\0");
    tab.GetDecimal(true)[0] = "\0";
    const item = createTabs(which, [tab], -1);
    const snapshot = encodeSfxPoolItem(item);
    expect(snapshot.value).toEqual({
      defaultDistance: -1,
      stops: [{ position: 720, adjustment: SvxTabAdjust.Decimal, decimal: "\0", fill: "\0" }],
    });
    const restored = restoreTabs(which, snapshot.value);
    expect(restored.equals(item)).toBe(true);
    expect(encodeSfxPoolItem(restored)).toEqual(snapshot);
  });
});

/** Uses the existing real Writer persistence factory, outside the native item. @param which - Registered identity. @param value - Candidate record. @returns Restored item. */
function restoreTabs(which: number, value: unknown): SvxTabStopItem {
  return decodeSfxPoolItem(createWriterDocument().GetAttrPool(), {
    which,
    value: value as never,
  }) as SvxTabStopItem;
}
