/** @fileoverview Verifies the pinned SvxTabStopItem value and ordered container contract. */

import { describe, expect, it } from "vitest";

import { SfxBoolItem } from "../../../svl/source/items/poolitem";
import { SvxTabAdjust, SvxTabStop, SvxTabStopItem } from "./paraitem";

const which = 200;

describe("SvxTabStopItem", /** Groups upstream tab-stop contract checks. @returns Nothing. */ () => {
  it("uses pinned default counts, spacing, ordering and position replacement", /** Checks item construction and sorted insertion. @returns Nothing. */ () => {
    const poolDefault = new SvxTabStopItem(1, 1134, SvxTabAdjust.Default, which);
    expect(poolDefault.Count()).toBe(1);
    expect(poolDefault.At(0).GetTabPos()).toBe(1134);
    expect(poolDefault.At(0).GetAdjustment()).toBe(SvxTabAdjust.Default);
    expect(new SvxTabStopItem(which).Count()).toBe(10);
    const item = SvxTabStopItem.FromStops(which, [new SvxTabStop(1440), new SvxTabStop(720)]);
    expect(
      item.GetStops().map(
        /** Projects a stop position. @param stop - Tab stop. @returns Twips. */
        (stop) => stop.GetTabPos(),
      ),
    ).toEqual([720, 1440]);
    expect(item.GetPos(720)).toBe(0);
    expect(item.GetPos(new SvxTabStop(999))).toBe(65535);
    expect(item.Insert(new SvxTabStop(720, SvxTabAdjust.Right))).toBe(true);
    expect(item.Count()).toBe(2);
    expect(item.At(0).GetAdjustment()).toBe(SvxTabAdjust.Right);
    expect(item.GetStops()).not.toBe(item.GetStops());
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
    const base = SvxTabStopItem.FromStops(
      which,
      [new SvxTabStop(720, SvxTabAdjust.Decimal, ".", ".")],
      1134,
    );
    expect(SvxTabStopItem.FromValue(which, base.QueryValue()).equals(base)).toBe(true);
    expect(base.equals(new SfxBoolItem(which, true))).toBe(false);
    expect(base.equals(SvxTabStopItem.FromStops(which + 1, base.GetStops(), 1134))).toBe(false);
    expect(base.equals(SvxTabStopItem.FromStops(which, base.GetStops(), 720))).toBe(false);
    expect(base.equals(SvxTabStopItem.FromStops(which, [], 1134))).toBe(false);
    for (const stop of [
      new SvxTabStop(721, SvxTabAdjust.Decimal, ".", "."),
      new SvxTabStop(720, SvxTabAdjust.Left, ".", "."),
      new SvxTabStop(720, SvxTabAdjust.Decimal, ",", "."),
      new SvxTabStop(720, SvxTabAdjust.Decimal, ".", "_"),
    ])
      expect(base.equals(SvxTabStopItem.FromStops(which, [stop], 1134))).toBe(false);
  });

  it("rejects invalid stop and snapshot values", /** Keeps tab positions, enums and characters in the upstream domain. @returns Nothing. */ () => {
    for (const position of [-1, 1.5, 2147483648])
      expect(
        /** Builds an invalid position. @returns Rejected tab. */ () => new SvxTabStop(position),
      ).toThrow("position");
    for (const adjustment of [-1, 1.5, SvxTabAdjust.End])
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
      [1, 1, -1],
      [1, 1, SvxTabAdjust.End],
    ] as const)
      expect(
        /** Builds an invalid item. @returns Rejected item. */ () =>
          new SvxTabStopItem(args[0], args[1], args[2] as SvxTabAdjust, which),
      ).toThrow("constructor");
    expect(
      /** Omits the adjustment. @returns Rejected item. */ () =>
        new SvxTabStopItem(1, 1, undefined, which),
    ).toThrow("constructor");
    const item = SvxTabStopItem.FromStops(which, []);
    expect(/** Reads a missing stop. @returns Rejected stop. */ () => item.At(0)).toThrow("index");
    for (const distance of [-1, 0.5])
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
          SvxTabStopItem.FromValue(which, value),
      ).toThrow("invalid");
  });
});
