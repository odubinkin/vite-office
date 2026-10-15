/** @fileoverview Source-backed original merge/filter/pivot flag meanings and shared item transport; original full document QA remains unexecuted. */

import { expect, it } from "vitest";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { ScMF, ScMergeFlagAttr } from "../../../inc/attrib";
import { ATTR_MERGE_FLAG } from "../../../inc/scitems";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";

/** Observes every original represented predicate in declaration order. @param item - Actual attribute. @returns Nine booleans. */
function observe(item: ScMergeFlagAttr): boolean[] {
  return [
    item.IsHorOverlapped(),
    item.IsVerOverlapped(),
    item.IsOverlapped(),
    item.HasAutoFilter(),
    item.IsScenario(),
    item.HasPivotButton(),
    item.HasPivotPopupButton(),
    item.HasPivotToggle(),
    item.HasPivotMultiFieldPopupButton(),
  ];
}

it("retains original default identity and shared integer ownership" /** Verifies defaults and actual shared base. @returns Nothing. */, function (): void {
  const item = new ScMergeFlagAttr();
  expect(item).toBeInstanceOf(SfxInt16Item);
  expect(item.Which()).toBe(145);
  expect(item.Which()).toBe(ATTR_MERGE_FLAG);
  expect(item.GetValue()).toBe(0);
  expect(item.QueryValue()).toBe(0);
  expect(observe(item)).toEqual([false, false, false, false, false, false, false, false, false]);
});

it("distinguishes overlap, filter, scenario and all pivot control meanings" /** Checks source-backed named bits and independent controls. @returns Nothing. */, function (): void {
  const cases: readonly [ScMF, readonly boolean[]][] = [
    [ScMF.Hor, [true, false, true, false, false, false, false, false, false]],
    [ScMF.Ver, [false, true, true, false, false, false, false, false, false]],
    [ScMF.Auto, [false, false, false, true, false, false, false, false, false]],
    [ScMF.Button, [false, false, false, false, false, true, false, false, false]],
    [ScMF.Scenario, [false, false, false, false, true, false, false, false, false]],
    [ScMF.ButtonPopup, [false, false, false, false, false, false, true, false, false]],
    [ScMF.HiddenMember, [false, false, false, false, false, false, false, false, false]],
    [ScMF.DpTable, [false, false, false, false, false, false, false, false, false]],
    [ScMF.DpCollapse, [false, false, false, false, false, false, false, true, false]],
    [ScMF.DpExpand, [false, false, false, false, false, false, false, true, false]],
    [ScMF.ButtonPopup2, [false, false, false, false, false, false, false, false, true]],
    [ScMF.Hor | ScMF.Ver | ScMF.Auto, [true, true, true, true, false, false, false, false, false]],
    [ScMF.All, [true, true, true, true, true, true, true, true, true]],
  ];
  expect(
    Object.values(ScMF).filter(
      /** Reports numeric enum members. @param value - Enum member. @returns Whether numeric. */ (
        value,
      ) => typeof value === "number",
    ),
  ).toEqual([0, 1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2047]);
  for (const [flags, predicates] of cases) {
    const item = new ScMergeFlagAttr(flags);
    expect(item.GetValue()).toBe(flags);
    expect(observe(item)).toEqual(predicates);
  }
});

it("copies and clones flag payloads independently with original base identity" /** Checks independent item identities and signed field conversion. @returns Nothing. */, function (): void {
  const item = new ScMergeFlagAttr(ScMF.Auto | ScMF.DpExpand);
  item.SetWhich(146);
  const copy = new ScMergeFlagAttr(item),
    clone = item.Clone();
  expect(copy).not.toBe(item);
  expect(clone).not.toBe(item);
  expect(copy.equals(item)).toBe(true);
  expect(clone.equals(item)).toBe(true);
  item.SetWhich(145);
  expect(copy.Which()).toBe(146);
  expect(clone.Which()).toBe(146);
  expect(copy.QueryValue()).toBe(516);
  expect(copy.HasAutoFilter()).toBe(true);
  expect(clone.HasPivotToggle()).toBe(true);
  for (const [input, stored] of [
    [65535, -1],
    [32768, -32768],
    [65536, 0],
  ] as const) {
    expect(new ScMergeFlagAttr(input as ScMF).GetValue()).toBe(stored);
  }
});

it("transports the concrete flag owner through the existing shared item set" /** Verifies pool and itemset retain concrete clone behavior. @returns Nothing. */, function (): void {
  const pool = new SfxItemPool();
  pool.RegisterDefaultItem(
    new ScMergeFlagAttr(),
    /** Restores the registered concrete flag item. @param value - Shared scalar snapshot. @returns Actual attribute. */ function restore(
      value,
    ): ScMergeFlagAttr {
      return new ScMergeFlagAttr(Number(value) as ScMF);
    },
  );
  const set = new SfxItemSet(pool, [[ATTR_MERGE_FLAG, ATTR_MERGE_FLAG]]),
    item = new ScMergeFlagAttr(ScMF.Hor | ScMF.Auto);
  set.Put(item);
  const stored = set.GetItemIfSet(ATTR_MERGE_FLAG) as ScMergeFlagAttr;
  expect(stored).toBeInstanceOf(ScMergeFlagAttr);
  expect(stored.GetValue()).toBe(5);
  expect(stored.IsHorOverlapped()).toBe(true);
  expect(stored.HasAutoFilter()).toBe(true);
  expect(stored.Clone(pool).equals(stored)).toBe(true);
});

it("inherits native signed16 mutation and typed transport while preserving merge flag meanings", /** Actual derived owner reuses corrected shared base without a Calc compatibility branch. @returns Nothing. */ () => {
  const item = new ScMergeFlagAttr();
  item.SetValue(ScMF.Hor | ScMF.Ver | ScMF.Auto);
  expect(item.IsOverlapped()).toBe(true);
  expect(item.HasAutoFilter()).toBe(true);
  const copy = item.Clone(),
    output = new Any(),
    value: [number] = [0];
  expect(item.QueryValue(output, 255)).toBe(true);
  expect(output.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(7);
  expect(item.PutValue(new Any([ScMF.Button], "sal_Int16"), 128)).toBe(true);
  expect(item.HasPivotButton()).toBe(true);
  expect(item.IsOverlapped()).toBe(false);
  expect(item.HasAutoFilter()).toBe(false);
  expect(copy.GetValue()).toBe(7);
  const otherWhich = item.Clone();
  otherWhich.SetWhich(149);
  expect(item.equals(otherWhich)).toBe(true);
  expect(SfxPoolItem.areSame(item, otherWhich)).toBe(false);
  const base = new SfxInt16Item(item.Which(), item.GetValue());
  expect(base.equals(item)).toBe(false);
  expect(item.equals(base)).toBe(false);
  expect(item.supportsHashCode()).toBe(true);
  expect(item.hashCode()).toBe(BigInt(ScMF.Button));
});
