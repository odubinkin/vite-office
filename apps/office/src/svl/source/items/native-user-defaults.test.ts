/** @fileoverview Native ItemInfoUser and pool original/effective default contracts over real metadata/items/sets; JS value association erases allocator/refcount/cache machinery. */
import { expect, it } from "vitest";
import {
  SfxItemPool,
  ItemInfoPackage,
  ItemInfoStatic,
  ItemInfoDynamic,
  ItemInfoUser,
  type ItemInfo,
} from "../../inc/itempool";
import { SfxItemSet, SfxPoolItemHolder, implCreateItemEntry } from "../../inc/itemset";
import { SfxBoolItem } from "./cenumitm";
import { SvxSetItem } from "../../../svx/inc/pageitem";
/** Original package fixture with actual contiguous metadata and optional dynamic resolver. */
class Package extends ItemInfoPackage {
  /** Supplies source metadata. @param entries - Original entries. @param resolve - Optional original resolver. @returns Package. */ constructor(
    public readonly entries: ItemInfoStatic[],
    private readonly resolve?: (index: number, pool: SfxItemPool) => ItemInfo,
  ) {
    super();
  }
  /** Original static getter. @param index - Position. @returns Entry. */ protected override getItemInfoStatic(
    index: number,
  ): ItemInfoStatic {
    return this.entries[index] as ItemInfoStatic;
  }
  /** Original count. @returns Count. */ public override size(): number {
    return this.entries.length;
  }
  /** Original metadata resolver. @param index - Position. @param pool - Actual target. @returns Metadata. */ public override getItemInfo(
    index: number,
    pool: SfxItemPool,
  ): ItemInfo {
    return this.resolve?.(index, pool) ?? (this.entries[index] as ItemInfoStatic);
  }
}
/** Registers an actual static/dynamic boolean metadata package. @param dynamic - Whether original default is dynamic. @param which - Original ID. @returns Actual owner and metadata. */
function pool(dynamic = false, which = 1) {
  const p = new SfxItemPool(),
    info = new ItemInfoStatic(which, dynamic ? null : new SfxBoolItem(which, false), 6000, 1),
    pkg = new Package([info]);
  p.registerItemInfoPackage(
    pkg,
    /** Original dynamic default constructor. @param id - Which. @returns Item. */ (id) =>
      new SfxBoolItem(id, false),
  );
  return { p, info, pkg };
}

it("retains original pool defaults while effective sets observe user overrides", /** Checks actual API separation and reset. @returns Nothing. */ () => {
  const { p } = pool(),
    original = p.GetPoolDefaultItem(1),
    set = new SfxItemSet(p),
    input = new SfxBoolItem(1, true);
  expect(p.GetUserDefaultItem(1)).toBeNull();
  expect(set.Get(1)).toBe(original);
  p.SetUserDefaultItem(input);
  const user = p.GetUserDefaultItem(1) as SfxBoolItem;
  expect(user).not.toBe(input);
  expect(user.GetValue()).toBe(true);
  expect([user.isStaticDefault(), user.isDynamicDefault()]).toEqual([false, false]);
  expect(p.GetPoolDefaultItem(1)).toBe(original);
  expect(p.GetUserOrPoolDefaultItem(1)).toBe(user);
  expect(set.Get(1)).toBe(user);
  input.SetValue(false);
  expect(user.GetValue()).toBe(true);
  expect(p.GetSlotId(1)).toBe(6000);
  expect(p.GetWhichIDFromSlotID(6000)).toBe(1);
  p.SetUserDefaultItem(new SfxBoolItem(1, true));
  expect(p.GetUserDefaultItem(1)).toBe(user);
  p.SetUserDefaultItem(new SfxBoolItem(1, false));
  expect(p.GetUserDefaultItem(1)?.QueryValue()).toBe(false);
  expect(p.GetPoolDefaultItem(1)).toBe(original);
  p.ResetUserDefaultItem(1);
  expect(p.GetUserDefaultItem(1)).toBeNull();
  expect(set.Get(1)).toBe(original);
  p.ResetUserDefaultItem(1);
  expect(p.GetPoolDefaultItem(1)).toBe(original);
});
it("creates a first override even when its value equals the original pool default", /** Native first insertion does not use the replacement equality shortcut. @returns Nothing. */ () => {
  const { p } = pool(),
    original = p.GetPoolDefaultItem(1);
  p.SetUserDefaultItem(new SfxBoolItem(1, false));
  expect(p.GetUserDefaultItem(1)).not.toBeNull();
  expect(p.GetUserDefaultItem(1)).not.toBe(original);
  expect(p.GetPoolDefaultItem(1)).toBe(original);
  p.ResetUserDefaultItem(1);
  p.SetUserDefaultItem(original);
  expect(p.GetUserDefaultItem(1)).toBe(original);
  expect(p.GetPoolDefaultItem(1)).toBe(original);
  p.ResetUserDefaultItem(1);
  expect(p.GetUserDefaultItem(1)).toBeNull();
});
it("restores the actual dynamic original and recognizes it during effective overrides", /** Reuses the unchanged binder rather than cloning the wrong effective default. @returns Nothing. */ () => {
  const { p } = pool(true),
    original = p.GetPoolDefaultItem(1);
  expect(original.isDynamicDefault()).toBe(true);
  p.SetUserDefaultItem(new SfxBoolItem(1, true));
  expect(p.GetPoolDefaultItem(1)).toBe(original);
  const held = new SfxPoolItemHolder(p, original);
  expect(held.getItem()).toBe(original);
  p.SetUserDefaultItem(original);
  expect(p.GetUserDefaultItem(1)).toBe(original);
  p.ResetUserDefaultItem(1);
  expect(p.GetPoolDefaultItem(1)).toBe(original);
  expect(p.GetUserOrPoolDefaultItem(1)).toBe(original);
});
it("routes original/effective overrides to the actual secondary metadata owner", /** Tests master versus child lookup without manufacturing ranges. @returns Nothing. */ () => {
  const { p: master } = pool(false, 10),
    { p: secondary } = pool(true, 1);
  master.SetSecondaryPool(secondary);
  const original = master.GetPoolDefaultItem(1);
  master.SetUserDefaultItem(new SfxBoolItem(1, true));
  expect(master.GetUserDefaultItem(1)).toBe(secondary.GetUserDefaultItem(1));
  expect(master.GetPoolDefaultItem(1)).toBe(original);
  expect(master.GetUserOrPoolDefaultItem(1)?.QueryValue()).toBe(true);
  master.ResetUserDefaultItem(1);
  expect(secondary.GetUserDefaultItem(1)).toBeNull();
  expect(master.GetPoolDefaultItem(1)).toBe(original);
});
it("binds ItemInfoUser through the shared native entry without new default tags or lifetime counts", /** Checks metadata and adoption/value semantics. @returns Nothing. */ () => {
  const { p, info } = pool(),
    input = new SfxBoolItem(1, true),
    copied = new ItemInfoUser(info, p, input),
    adopted = new ItemInfoUser(info, p, input, true);
  expect([copied.getWhich(), copied.getSlotID(), copied.getItemInfoFlags()]).toEqual([1, 6000, 1]);
  expect(copied.getItem()).not.toBe(input);
  expect(copied.getItem()?.QueryValue()).toBe(true);
  expect(adopted.getItem()).toBe(input);
  expect(implCreateItemEntry(p, null, false)).toBeNull();
});
it("copies foreign set-item defaults into the target pool and preserves original dynamic metadata", /** Uses actual nested sets/items and package callbacks. @returns Nothing. */ () => {
  /** Creates real per-pool dynamic set metadata. @returns Actual pool. */ function setPool() {
    const p = new SfxItemPool(),
      entries = [
        new ItemInfoStatic(1, new SfxBoolItem(1, false), 0, 0),
        new ItemInfoStatic(2, null, 7000, 1),
      ],
      pkg = new Package(
        entries,
        /** Creates the original pool-dependent set default. @param i - Position. @param owner - Target. @returns Metadata. */ (
          i,
          owner,
        ) =>
          i === 0
            ? (entries[0] as ItemInfoStatic)
            : new ItemInfoDynamic(
                entries[1] as ItemInfoStatic,
                new SvxSetItem(2, new SfxItemSet(owner, [[1, 1]])),
              ),
      );
    p.registerItemInfoPackage(pkg);
    return p;
  }
  const source = setPool(),
    target = setPool(),
    original = target.GetPoolDefaultItem(2),
    set = new SfxItemSet(source, [[1, 1]]);
  set.Put(new SfxBoolItem(1, true));
  const item = new SvxSetItem(2, set);
  target.SetUserDefaultItem(item);
  const current = target.GetUserDefaultItem(2) as SvxSetItem;
  expect(current.GetItemSet().GetPool()).toBe(target);
  expect(current.GetItemSet().Get(1).QueryValue()).toBe(true);
  expect(item.GetItemSet().GetPool()).toBe(source);
  expect(target.GetPoolDefaultItem(2)).toBe(original);
  target.ResetUserDefaultItem(2);
  expect(target.GetPoolDefaultItem(2)).toBe(original);
});
it("preserves an existing user override when its replacement clone throws", /** Covers the defined native new-before-delete replacement path. @returns Nothing. */ () => {
  /** Actual concrete item with a deterministic virtual clone failure. */ class Fragile extends SfxBoolItem {
    public fail = false;
    /** Native clone extension. @returns Value. */ public override Clone(): Fragile {
      if (this.fail) throw new Error("clone failure");
      return new Fragile(this.Which(), this.GetValue());
    }
  }
  const { p, info } = pool(),
    first = new Fragile(1, true);
  p.SetUserDefaultItem(first);
  const current = p.GetUserDefaultItem(1),
    replacement = new Fragile(1, false);
  replacement.fail = true;
  expect(
    /** Fails before replacing existing metadata. @returns Nothing. */ () =>
      p.SetUserDefaultItem(replacement),
  ).toThrow("clone failure");
  expect(p.GetUserDefaultItem(1)).toBe(current);
  expect(current?.QueryValue()).toBe(true);
  expect(p.GetPoolDefaultItem(1)).toBe(info.getItem());
  p.ResetUserDefaultItem(1);
  expect(p.GetUserDefaultItem(1)).toBeNull();
});
it("keeps native unknown-ID preconditions and unregistered zero-state early returns explicit", /** Does not infer native metadata from browser defaults. @returns Nothing. */ () => {
  const { p } = pool();
  expect(
    /** Violates native target assertion. @returns Nothing. */ () =>
      p.SetUserDefaultItem(new SfxBoolItem(3, true)),
  ).toThrow("Unknown WhichId");
  expect(
    /** Violates native getter assertion. @returns Item. */ () => p.GetUserDefaultItem(3),
  ).toThrow("Unknown WhichId");
  expect(
    /** Violates native reset assertion. @returns Nothing. */ () => p.ResetUserDefaultItem(3),
  ).toThrow("Unknown WhichId");
  const empty = new SfxItemPool();
  expect(empty.GetUserDefaultItem(0)).toBeNull();
  empty.ResetUserDefaultItem(0);
  expect(
    /** Reaches original missing ItemInfo assertion without inventing metadata. @returns Nothing. */ () =>
      empty.SetUserDefaultItem(new SfxBoolItem(0, true)),
  ).toThrow("Missing original ItemInfo");
});
it("preserves the bounded registry original while applying a user default", /** Checks existing Writer registry and original-getter preconditions. @returns Nothing. */ () => {
  const p = new SfxItemPool();
  p.RegisterDefaultItem(new SfxBoolItem(7, false));
  expect(p.GetPoolDefaultItem(7)).toBe(p.GetUserOrPoolDefaultItem(7));
  expect(
    /** Rejects an unknown original default. @returns Item. */ () => p.GetPoolDefaultItem(99),
  ).toThrow("Unknown pool default");
  p.SetUserDefaultItem(new SfxBoolItem(7, true));
  expect(p.GetPoolDefaultItem(7).QueryValue()).toBe(false);
  expect(p.GetUserOrPoolDefaultItem(7).QueryValue()).toBe(true);
  p.ResetUserDefaultItem(7);
  expect(p.GetUserOrPoolDefaultItem(7).QueryValue()).toBe(false);
  const native = pool().p;
  expect(
    /** Rejects unknown original native metadata. @returns Item. */ () =>
      native.GetPoolDefaultItem(3),
  ).toThrow("Unknown pool default");
});

it("uses the master pool for scalar and slot clones from secondary owners", /** Observes virtual Clone arguments on an actual concrete value. @returns Nothing. */ () => {
  /** Concrete item retaining its native clone target for observation. */ class PoolAware extends SfxBoolItem {
    public clonePool: SfxItemPool | undefined;
    /** Copies value into the supplied pool. @param target - Native master target. @returns Copy. */ public override Clone(
      target?: SfxItemPool,
    ): PoolAware {
      const copy = new PoolAware(this.Which(), this.GetValue());
      copy.clonePool = target;
      return copy;
    }
  }
  const { p: master } = pool(false, 10),
    { p: secondary } = pool();
  master.SetSecondaryPool(secondary);
  secondary.SetUserDefaultItem(new PoolAware(1, true));
  expect((secondary.GetUserDefaultItem(1) as PoolAware).clonePool).toBe(master);
  const slot = new PoolAware(7000, true);
  expect((implCreateItemEntry(secondary, slot, false) as PoolAware).clonePool).toBe(master);
  expect(implCreateItemEntry(secondary, slot, true)).toBe(slot);
  const set = new SfxItemSet(secondary);
  set.Put(new PoolAware(1, false));
  expect((set.Get(1) as PoolAware).clonePool).toBe(master);
});
it("preserves original static and dynamic defaults inserted explicitly over effective overrides", /** Put uses canonical entry construction and original classification. @returns Nothing. */ () => {
  for (const dynamic of [false, true]) {
    const { p } = pool(dynamic),
      original = p.GetPoolDefaultItem(1),
      set = new SfxItemSet(p);
    p.SetUserDefaultItem(new SfxBoolItem(1, true));
    set.Put(original);
    expect(set.Get(1)).toBe(original);
    expect(set.Get(1).QueryValue()).toBe(false);
    expect(set.Get(1).isDynamicDefault()).toBe(dynamic);
    expect(set.Get(1).isStaticDefault()).toBe(!dynamic);
    expect(p.GetUserDefaultItem(1)?.QueryValue()).toBe(true);
  }
});
it("normalizes foreign nested sets to the master and preserves held copies already using it", /** Exercises actual set items through a secondary pool. @returns Nothing. */ () => {
  const { p: master } = pool(false, 10),
    { p: secondary } = pool(),
    { p: foreign } = pool();
  master.SetSecondaryPool(secondary);
  const nested = new SfxItemSet(foreign, [[1, 1]]);
  nested.Put(new SfxBoolItem(1, true));
  const input = new SvxSetItem(1, nested),
    holder = new SfxPoolItemHolder(secondary, input);
  const current = holder.getItem() as SvxSetItem;
  expect(current.GetItemSet().GetPool()).toBe(master);
  expect(current.GetItemSet().Get(1).QueryValue()).toBe(true);
  expect(input.GetItemSet().GetPool()).toBe(foreign);
  const copied = new SfxPoolItemHolder(holder);
  expect(copied.getItem()).toBe(current);
  secondary.SetUserDefaultItem(input);
  expect((secondary.GetUserDefaultItem(1) as SvxSetItem).GetItemSet().GetPool()).toBe(master);
});
