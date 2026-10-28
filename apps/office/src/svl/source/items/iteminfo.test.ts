/** @fileoverview Actual native item metadata/default package contracts, GC-owned references and single-pool registration. */
import { expect, it } from "vitest";
import {
  ItemInfo,
  ItemInfoStatic,
  ItemInfoDynamic,
  ItemInfoPackage,
  SfxItemPool,
  SFX_ITEMINFOFLAG_NONE,
  SFX_ITEMINFOFLAG_SUPPORT_SURROGATE,
} from "../../inc/itempool";
import { SfxItemPool as PoolOwner } from "./itempool";
import { SfxBoolItem } from "./cenumitm";
import type { SfxPoolItem } from "./poolitem";
/** Real metadata-package fixture exposing only original protected operations for tests. */
class TestPackage extends ItemInfoPackage {
  public reads = 0;
  public readonly requestingPools: SfxItemPool[] = [];
  /** Configures static metadata and optional actual pool-dependent resolver. @param infos - Original metadata entries. @param resolver - Optional original getItemInfo implementation. @returns Package. */
  constructor(
    private readonly infos: ItemInfoStatic[],
    private readonly resolver?: (index: number, pool: SfxItemPool) => ItemInfo,
  ) {
    super();
  }
  /** Counts real static-map source reads. @param index - Original index. @returns Metadata entry. */
  protected override getItemInfoStatic(index: number): ItemInfoStatic {
    ++this.reads;
    return this.infos[index] as ItemInfoStatic;
  }
  /** Returns actual metadata count. @returns Count. */
  public override size(): number {
    return this.infos.length;
  }
  /** Supplies actual static or pool-dependent metadata. @param index - Original index. @param pool - Actual requesting pool. @returns Entry. */
  public override getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    this.requestingPools.push(pool);
    return this.resolver === undefined
      ? (this.infos[index] as ItemInfoStatic)
      : this.resolver(index, pool);
  }
  /** Exposes original protected static-default replacement to its owning package. @param index - Entry index. @param item - Nullable new default. @returns Nothing. */
  public replace(index: number, item: SfxPoolItem | null): void {
    TestPackage.setItemAtItemInfoStatic(item, this.infos[index] as ItemInfoStatic);
  }
}
it("retains native metadata copies, uint16 fields, default tags and original default object identity", /** Default classifications are ordinary booleans with no lifetime actions. @returns Nothing. */ () => {
  expect(SfxItemPool).toBe(PoolOwner);
  expect([SFX_ITEMINFOFLAG_NONE, SFX_ITEMINFOFLAG_SUPPORT_SURROGATE]).toEqual([0, 1]);
  const item = new SfxBoolItem(1, true);
  expect([item.isStaticDefault(), item.isDynamicDefault()]).toEqual([false, false]);
  const info = new ItemInfoStatic(1, item, 6000, 1);
  expect(info.getItem()).toBe(item);
  expect(item.isStaticDefault()).toBe(true);
  expect(item.isDynamicDefault()).toBe(false);
  const dynamicItem = new SfxBoolItem(1, false),
    dynamic = new ItemInfoDynamic(info, dynamicItem);
  expect([dynamic.getWhich(), dynamic.getSlotID(), dynamic.getItemInfoFlags()]).toEqual([
    1, 6000, 1,
  ]);
  expect(dynamic.getItem()).toBe(dynamicItem);
  expect([dynamicItem.isStaticDefault(), dynamicItem.isDynamicDefault()]).toEqual([false, true]);
  for (const source of [item, dynamicItem]) {
    const clone = source.Clone();
    expect([clone.isStaticDefault(), clone.isDynamicDefault()]).toEqual([false, false]);
  }
  const narrow = new ItemInfoStatic(65537, null, -1, 65539),
    copy = new ItemInfoDynamic(narrow, null);
  expect([narrow.getWhich(), narrow.getSlotID(), narrow.getItemInfoFlags()]).toEqual([1, 65535, 3]);
  expect([copy.getWhich(), copy.getSlotID(), copy.getItemInfoFlags(), copy.getItem()]).toEqual([
    1,
    65535,
    3,
    null,
  ]);
  expect(narrow.getItem()).toBeNull();
  const pkg = new TestPackage([info]),
    replacement = new SfxBoolItem(1, false);
  pkg.replace(0, replacement);
  expect(info.getItem()).toBe(replacement);
  expect(replacement.isStaticDefault()).toBe(true);
  expect(dynamic.getItem()).toBe(dynamicItem);
  pkg.replace(0, null);
  expect(info.getItem()).toBeNull();
  // Close the original logical package scope after its static entry is detached.
  pkg.Dispose();
});
it("shares original EMPTY metadata and caches only a nonempty slot map", /** Zero-slot rescans preserve the actual source empty-map condition. @returns Nothing. */ () => {
  const a = new TestPackage([
      new ItemInfoStatic(1, null, 0, 0),
      new ItemInfoStatic(2, null, 6000, 1),
      new ItemInfoStatic(3, null, 6001, 0),
    ]),
    b = new TestPackage([]);
  const empty = a.getExistingItemInfo(7);
  expect(empty).toBe(b.getExistingItemInfo(99));
  expect([empty.getWhich(), empty.getSlotID(), empty.getItemInfoFlags(), empty.getItem()]).toEqual([
    0,
    0,
    0,
    null,
  ]);
  const map = a.getSlotIDToWhichIDMap();
  expect(map).toEqual(
    new Map([
      [6000, 2],
      [6001, 3],
    ]),
  );
  expect(a.reads).toBe(3);
  expect(a.getSlotIDToWhichIDMap()).toBe(map);
  expect(a.reads).toBe(3);
  const zero = new TestPackage([new ItemInfoStatic(1, null, 0, 0)]),
    zeroMap = zero.getSlotIDToWhichIDMap();
  expect(zeroMap.size).toBe(0);
  expect(zero.getSlotIDToWhichIDMap()).toBe(zeroMap);
  expect(zero.reads).toBe(2);
  const duplicate = new TestPackage([
    new ItemInfoStatic(1, null, 6000, 0),
    new ItemInfoStatic(2, null, 6000, 0),
  ]);
  expect(
    /** Native debug precondition rejects duplicate nonzero slots. @returns Nothing. */ () =>
      duplicate.getSlotIDToWhichIDMap(),
  ).toThrow("Duplicate SlotID");
});
it("registers real metadata/default identities and original single-pool slot conversions", /** Actual static entries and callback-created dynamic entries share one real metadata table. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    item = new SfxBoolItem(1, false),
    dynamic = new SfxBoolItem(2, true),
    pkg = new TestPackage([
      new ItemInfoStatic(1, item, 6000, 1),
      new ItemInfoStatic(2, null, 0, 0),
    ]);
  expect([pool.GetFirstWhich(), pool.GetLastWhich(), pool.IsInRange(0), pool.IsInRange(1)]).toEqual(
    [0, 0, true, false],
  );
  expect(pool.GetWhichIDFromSlotID(6000)).toBe(6000);
  pool.registerItemInfoPackage(
    pkg,
    /** Original default callback receives the missing entry identity. @param which - Missing WhichId. @returns Actual dynamic default. */ (
      which,
    ) => {
      expect(which).toBe(2);
      return dynamic;
    },
  );
  expect(pkg.requestingPools).toEqual([pool, pool]);
  expect([pool.GetFirstWhich(), pool.GetLastWhich()]).toEqual([1, 2]);
  expect(pool.IsInRange(1)).toBe(true);
  expect(pool.IsInRange(2)).toBe(true);
  expect(pool.IsInRange(3)).toBe(false);
  expect(pool.GetUserOrPoolDefaultItem(1)).toBe(item);
  expect(pool.GetUserOrPoolDefaultItem(2)).toBe(dynamic);
  expect(dynamic.isDynamicDefault()).toBe(true);
  for (const deep of [undefined, false]) {
    expect(pool.GetWhichIDFromSlotID(6000, deep)).toBe(1);
    expect(pool.GetWhichIDFromSlotID(6001, deep)).toBe(6001);
  }
  expect(pool.GetWhichIDFromSlotID(1)).toBe(1);
  expect(pool.GetWhichIDFromSlotID(0)).toBe(0);
  expect(pool.GetSlotId(1)).toBe(6000);
  expect(pool.GetSlotId(2)).toBe(2);
  expect(pool.GetSlotId(6000)).toBe(6000);
  expect(pool.GetSlotId(0)).toBe(0);
  expect([SfxItemPool.IsSlot(0), SfxItemPool.IsSlot(4999), SfxItemPool.IsSlot(5000)]).toEqual([
    false,
    false,
    true,
  ]);
  expect(
    /** Native out-of-range slot precondition is a host error. @returns Nothing. */ () =>
      pool.GetSlotId(3),
  ).toThrow("Unknown WhichId");
  expect(
    /** Native out-of-range default precondition is a host error. @returns Nothing. */ () =>
      pool.GetUserOrPoolDefaultItem(3),
  ).toThrow("Unknown pool default");
  expect(
    /** Native second-package precondition is rejected. @returns Nothing. */ () =>
      pool.registerItemInfoPackage(pkg),
  ).toThrow("Only one");
  const resolved = new SfxBoolItem(1, true),
    alreadyDynamic = new ItemInfoDynamic(new ItemInfoStatic(1, null, 6000, 0), resolved),
    p = new SfxItemPool();
  p.registerItemInfoPackage(
    new TestPackage(
      [new ItemInfoStatic(1, null, 6000, 0)],
      /** Supplies an actual dynamic entry directly, as a native package may. @returns Real entry. */ () =>
        alreadyDynamic,
    ),
  );
  expect(p.GetUserOrPoolDefaultItem(1)).toBe(resolved);
});
it("rejects original invalid registration inputs without inventing replacement defaults", /** These host errors bind native invalid/debug cases and do not certify post-error pool recovery. @returns Nothing. */ () => {
  expect(
    /** Native empty-package input has no first/last entry. @returns Nothing. */ () =>
      new SfxItemPool().registerItemInfoPackage(new TestPackage([])),
  ).toThrow("must not be empty");
  expect(
    /** An empty native callback cannot construct a missing default. @returns Nothing. */ () =>
      new SfxItemPool().registerItemInfoPackage(
        new TestPackage([new ItemInfoStatic(1, null, 0, 0)]),
      ),
  ).toThrow("callback");
  expect(
    /** Native missing-default assertion rejects null callback output. @returns Nothing. */ () =>
      new SfxItemPool().registerItemInfoPackage(
        new TestPackage([new ItemInfoStatic(1, null, 0, 0)]),
        /** Actual nullable native pointer result. @returns Null. */ () => null,
      ),
  ).toThrow("dynamic-default item");
  expect(
    /** Native contiguous-order assertion rejects a gap. @returns Nothing. */ () =>
      new SfxItemPool().registerItemInfoPackage(
        new TestPackage([
          new ItemInfoStatic(1, new SfxBoolItem(1), 0, 0),
          new ItemInfoStatic(3, new SfxBoolItem(3), 0, 0),
        ]),
      ),
  ).toThrow("contiguous");
});
