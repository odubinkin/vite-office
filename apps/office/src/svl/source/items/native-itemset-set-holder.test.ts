/** @fileoverview Native replacing Set and GC-backed pool/value holder contracts from itemset.cxx. */
import { expect, it } from "vitest";
import { SfxItemSet, SfxPoolItemHolder, SfxItemState } from "../../inc/itemset";
import {
  SfxItemPool,
  ItemInfoStatic,
  ItemInfoDynamic,
  ItemInfoPackage,
  type ItemInfo,
} from "../../inc/itempool";
import type { SfxPoolItem } from "./poolitem";
import { SfxInt16Item } from "./intitem";
import { SvxSetItem } from "../../../svx/inc/pageitem";
/** Real item subtype exercising the original nonshareable extension point. */
class IndependentItem extends SfxInt16Item {
  /** Initializes a nonshareable value. @param which - Identity. @param value - Value. @returns Item. */
  constructor(which: number, value: number) {
    super(which, value);
    this.setNonShareable();
  }
  /** Original concrete copy operation. @returns Independent item. */
  override Clone(): IndependentItem {
    return new IndependentItem(this.Which(), this.GetValue());
  }
}
/** Real metadata package supplying pool-specific defaults through its original virtual boundary. */
class Defaults extends ItemInfoPackage {
  private readonly info = new ItemInfoStatic(1, null, 0, 0);
  /** Original one-entry package. @returns Count. */
  override size(): number {
    return 1;
  }
  /** Original static metadata. @param index - Entry index. @returns Metadata. */
  protected override getItemInfoStatic(index: number): ItemInfoStatic {
    void index;
    return this.info;
  }
  /** Original pool-dependent metadata resolver. @param index - Entry index. @param pool - Actual pool. @returns Dynamic metadata. */
  override getItemInfo(index: number, pool: SfxItemPool): ItemInfo {
    void index;
    void pool;
    return new ItemInfoDynamic(this.info, new SfxInt16Item(1, 7));
  }
}
it("preserves empty associations, logical identities and independent nonshareable values", /** GC references replace lifetime machinery without fabricating counters. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    empty = new SfxPoolItemHolder(),
    emptyCopy = new SfxPoolItemHolder(empty);
  expect([empty.is(), empty.not(), empty.Which(), empty.getItem()]).toEqual([false, true, 0, null]);
  expect(emptyCopy.equals(empty)).toBe(true);
  const nullBound = new SfxPoolItemHolder(pool, null);
  expect(nullBound.getPool()).toBe(pool);
  expect(nullBound.equals(empty)).toBe(false);
  const item = new SfxInt16Item(1, 4),
    a = new SfxPoolItemHolder(pool, item),
    b = new SfxPoolItemHolder(a),
    adopted = new SfxPoolItemHolder(pool, item, true);
  expect(a.is()).toBe(true);
  expect(a.not()).toBe(false);
  expect(a.Which()).toBe(1);
  expect(a.getItem()).not.toBe(item);
  expect(a.getItem()?.QueryValue()).toBe(4);
  expect(b.getItem()).toBe(a.getItem());
  expect(b.equals(a)).toBe(true);
  expect(adopted.getItem()).toBe(item);
  expect(a.assign(a)).toBe(a);
  expect(a.assign(b)).toBe(a);
  expect(a.assign(adopted).getItem()).toBe(item);
  expect(a.equals(b)).toBe(false);
  expect(new SfxPoolItemHolder(new SfxItemPool(), item, true).equals(adopted)).toBe(false);
  const value = new IndependentItem(2, 9),
    one = new SfxPoolItemHolder(pool, value),
    two = new SfxPoolItemHolder(one);
  expect(one.getItem()).not.toBe(value);
  expect(two.getItem()).not.toBe(one.getItem());
  expect(two.getItem()?.QueryValue()).toBe(9);
  a.assign(one);
  expect(a.getItem()).not.toBe(one.getItem());
  expect(a.getItem()?.QueryValue()).toBe(9);
  a.assign(empty);
  expect(a.getItem()).toBeNull();
});
it("retains static and own dynamic defaults but copies foreign dynamic values", /** Uses actual metadata marking and registered pool defaults. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    staticValue = new SfxInt16Item(2, 3);
  new ItemInfoStatic(2, staticValue, 0, 0);
  expect(new SfxPoolItemHolder(pool, staticValue).getItem()).toBe(staticValue);
  pool.registerItemInfoPackage(new Defaults());
  const dynamic = pool.GetPoolDefaultItem(1);
  expect(new SfxPoolItemHolder(pool, dynamic).getItem()).toBe(dynamic);
  const foreign = new SfxItemPool();
  foreign.registerItemInfoPackage(new Defaults());
  const copied = new SfxPoolItemHolder(foreign, dynamic);
  expect(copied.getItem()).not.toBe(dynamic);
  expect(copied.getItem()?.QueryValue()).toBe(7);
});
it("preserves request-value cloning and targets nested sets at the actual destination pool", /** Passing an existing foreign set still requires a target-pool copy. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    other = new SfxItemPool(),
    set = new SfxItemSet(pool, [[1, 2]]);
  set.Put(new SfxInt16Item(1, 8));
  const request = new SvxSetItem(0, set),
    held = new SfxPoolItemHolder(other, request),
    copy = new SfxPoolItemHolder(held);
  expect(held.getItem()).not.toBe(request);
  expect(copy.getItem()).not.toBe(held.getItem());
  expect((held.getItem() as SvxSetItem).GetItemSet().GetPool()).toBe(pool);
  expect(new SfxPoolItemHolder(other, request, true).getItem()).toBe(request);
  const item = new SvxSetItem(2, set);
  for (const passing of [false, true]) {
    const h = new SfxPoolItemHolder(other, item, passing);
    expect(h.getItem()).not.toBe(item);
    expect((h.getItem() as SvxSetItem).GetItemSet().GetPool()).toBe(other);
    expect((h.getItem() as SvxSetItem).GetItemSet().Get(1).QueryValue()).toBe(8);
  }
  const local = new SfxPoolItemHolder(pool, item, true);
  expect(local.getItem()).toBe(item);
  expect(new SfxPoolItemHolder(local).getItem()).toBe(item);
});
it("replaces only effective SET values in intersected declared ranges", /** Deep Set flattens original inherited values while ignoring invalid and disabled states. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    parent = new SfxItemSet(pool, [[1, 7]]),
    source = new SfxItemSet(pool, [[2, 6]], parent),
    target = new SfxItemSet(new SfxItemPool(), [
      [1, 5],
      [7, 7],
    ]);
  parent.Put(new SfxInt16Item(1, 1));
  parent.Put(new SfxInt16Item(2, 2));
  parent.Put(new SfxInt16Item(3, 3));
  parent.Put(new SfxInt16Item(6, 6));
  source.InvalidateItem(3);
  source.DisableItem(4);
  source.Put(new SfxInt16Item(5, 5));
  target.Put(new SfxInt16Item(7, 7));
  expect(target.Set(source)).toBe(true);
  expect(target.Count()).toBe(2);
  expect(target.Get(2).QueryValue()).toBe(2);
  expect(target.Get(5).QueryValue()).toBe(5);
  expect(target.GetItemState(1, false)).toBe(SfxItemState.DEFAULT);
  expect(target.GetItemState(3, false)).toBe(SfxItemState.DEFAULT);
  expect(target.GetItemState(4, false)).toBe(SfxItemState.DEFAULT);
  expect(target.GetItemState(7, false)).toBe(SfxItemState.DEFAULT);
  const shallow = new SfxItemSet(pool, [[2, 6]]);
  expect(shallow.Set(source, false)).toBe(true);
  expect(shallow.GetItemState(3, false)).toBe(SfxItemState.INVALID);
  expect(shallow.GetItemState(4, false)).toBe(SfxItemState.DEFAULT);
  expect(shallow.GetItemState(2, false)).toBe(SfxItemState.DEFAULT);
  const invalid = new SfxItemSet(pool, [[2, 6]]);
  invalid.InvalidateItem(3);
  expect(shallow.Set(invalid, false)).toBe(false);
  expect(shallow.GetItemState(3, false)).toBe(SfxItemState.INVALID);
  expect(target.Set(new SfxItemSet(pool, []))).toBe(false);
  expect(target.Count()).toBe(0);
  expect(target.Set(target)).toBe(false);
  target.Put(new SfxInt16Item(2, 9));
  expect(target.Set(target)).toBe(false);
  expect(target.Count()).toBe(0);
});
it("copies nested set items into destination pools through both Put and Set", /** Exercises actual concrete pool-targeted Clone rather than a test double. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    other = new SfxItemPool(),
    nested = new SfxItemSet(pool, [[1, 1]]);
  nested.Put(new SfxInt16Item(1, 4));
  const source = new SfxItemSet(pool, [[2, 2]]);
  source.Put(new SvxSetItem(2, nested));
  const target = new SfxItemSet(other, [[2, 2]]);
  expect(target.Set(source)).toBe(true);
  expect((target.Get(2) as SvxSetItem).GetItemSet().GetPool()).toBe(other);
  expect((target.Get(2) as SvxSetItem).GetItemSet().Get(1).QueryValue()).toBe(4);
  expect((source.Get(2) as SvxSetItem).GetItemSet().GetPool()).toBe(pool);
});

it("preserves replacing-set no-op returns and all Differentiate empty/self cases", /** Equal direct puts return false without erasing their value. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    a = new SfxItemSet(pool, [[1, 2]]),
    b = new SfxItemSet(pool, [[1, 2]]);
  a.Differentiate(b);
  a.Put(new SfxInt16Item(1, 4));
  a.Differentiate(b);
  expect(a.Count()).toBe(1);
  b.Put(new SfxInt16Item(1, 4));
  expect(a.PutSet(b)).toBe(false);
  a.Differentiate(a);
  expect(a.Count()).toBe(0);
});

/** Real item-set subclass using the original Changed notification extension point. */
class NotifyingSet extends SfxItemSet {
  /** Installs a second value during the first insertion notification. @param oldItem - Prior delta. @param newItem - Pending delta. @returns Nothing. */
  protected override Changed(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
  ): void {
    void oldItem;
    if (newItem?.Which() === 1) this.Put(new SfxInt16Item(2, 2));
  }
}
it("retains the earlier Set change when a notification supplies a later equal value", /** Native Changed can install another accepted delta before the next Which iteration. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    source = new SfxItemSet(pool, [[1, 2]]),
    target = new NotifyingSet(pool, [[1, 2]]);
  source.Put(new SfxInt16Item(1, 1));
  source.Put(new SfxInt16Item(2, 2));
  expect(target.Set(source)).toBe(true);
  expect(target.Count()).toBe(2);
  expect(target.Get(2).QueryValue()).toBe(2);
});

it("clones native slot items on holder copy while retaining explicit reference adoption", /** The original slot branch precedes already-shared value reuse. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    item = new SfxInt16Item(6000, 4),
    a = new SfxPoolItemHolder(pool, item),
    b = new SfxPoolItemHolder(a);
  expect(a.getItem()).not.toBe(item);
  expect(b.getItem()).not.toBe(a.getItem());
  expect(b.getItem()?.QueryValue()).toBe(4);
  expect(new SfxPoolItemHolder(pool, item, true).getItem()).toBe(item);
});

it("deep self Set can recover effective parent values after clearing direct deltas", /** Self assignment has no shortcut in the original replacing operation. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    parent = new SfxItemSet(pool, [[1, 2]]),
    value = new SfxItemSet(pool, [[1, 2]], parent);
  parent.Put(new SfxInt16Item(2, 7));
  value.Put(new SfxInt16Item(1, 3));
  expect(value.Set(value)).toBe(true);
  expect(value.Count()).toBe(1);
  expect(value.GetItemIfSet(1, false)).toBeUndefined();
  expect(value.Get(2, false).QueryValue()).toBe(7);
});
