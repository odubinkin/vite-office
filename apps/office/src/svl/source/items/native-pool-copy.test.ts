/** @fileoverview Native named/copy pool metadata, secondary linkage,metrics and once-only shutdown over actual items,sets and listeners. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { MapUnit } from "../../../tools/inc/mapunit";
import { SfxItemPool, ItemInfoStatic, ItemInfoDynamic, ItemInfoPackage } from "./itempool";
import { SfxItemSet } from "./itemset";
import { SfxBoolItem } from "./cenumitm";
import { SvxSetItem } from "../../../svx/inc/pageitem";
import { SfxListener } from "../notify/lstner";
import type { SfxBroadcaster } from "../notify/SfxBroadcaster";
import { SfxHintId, type SfxHint } from "../../inc/hint";
/** Actual two-value metadata package with one pool-dependent set. */
class Package extends ItemInfoPackage {
  private readonly entries: ItemInfoStatic[];
  /** Declares a disjoint contiguous package. @param first - First native ID. @returns Package. */ constructor(
    private readonly first = 1,
  ) {
    super();
    this.entries = [
      new ItemInfoStatic(first, new SfxBoolItem(first, false), 6001, 0),
      new ItemInfoStatic(first + 1, null, 6002, 1),
    ];
  }
  /** Original count. @returns Count. */ public override size() {
    return this.entries.length;
  }
  /** Original static metadata. @param i - Index. @returns Entry. */ protected override getItemInfoStatic(
    i: number,
  ) {
    return this.entries[i] as ItemInfoStatic;
  }
  /** Original dynamic set metadata. @param i - Index. @param pool - Owner. @returns Metadata. */ public override getItemInfo(
    i: number,
    pool: SfxItemPool,
  ) {
    const info = this.getItemInfoStatic(i);
    return i === 0
      ? info
      : new ItemInfoDynamic(
          info,
          new SvxSetItem(this.first + 1, new SfxItemSet(pool, [[this.first, this.first]])),
        );
  }
}
/** Actual observer with synchronous action support. */
class Observer extends SfxListener {
  public readonly hints: SfxHintId[] = [];
  public action?: () => void;
  /** Observes real hint. @param source - Actual broadcaster. @param hint - Hint. @returns Nothing. */ public override Notify(
    source: SfxBroadcaster,
    hint: SfxHint,
  ): void {
    expect(this.IsListening(source)).toBe(true);
    this.hints.push(hint.GetId());
    this.action?.();
  }
}
/** Creates original declared metadata pool. @returns Actual pool. */ function pool() {
  const p = new SfxItemPool();
  p.registerItemInfoPackage(new Package());
  return p;
}
it("owns a stable native name and metric while keeping copied broadcaster registrations empty", /** Tests actual named constructor and independent copy state. @returns Nothing. */ () => {
  const name = new OUString(65),
    source = new SfxItemPool(name),
    listener = new Observer();
  expect(source.GetName()).not.toBe(name);
  expect(source.GetName().equals(name)).toBe(true);
  expect(source.GetName()).toBe(source.GetName());
  name.dispose();
  expect(source.GetName().getLength()).toBe(1);
  expect(source.GetMetric(0)).toBe(MapUnit.MapTwip);
  source.SetDefaultMetric(MapUnit.MapMM);
  listener.StartListening(source.BC());
  const copy = source.Clone();
  expect(copy.GetName().equals(source.GetName())).toBe(true);
  expect(copy.GetName()).not.toBe(source.GetName());
  expect(copy.GetMetric(999)).toBe(MapUnit.MapMM);
  expect(copy.GetMasterPool()).toBe(copy);
  expect(copy.GetSecondaryPool()).toBeNull();
  expect(copy.BC().HasListeners()).toBe(false);
  copy.SetDefaultMetric(MapUnit.MapPoint);
  expect(source.GetMetric(1)).toBe(MapUnit.MapMM);
  expect(copy.GetMetric(1)).toBe(MapUnit.MapPoint);
  copy.sendShutdownHint();
  expect(listener.hints).toEqual([]);
  listener.EndListeningAll();
  expect(new SfxItemPool().GetName().isEmpty()).toBe(true);
});
it("copies static metadata by identity and dynamic sets into the actual new pool", /** No metadata or pool facades. @returns Nothing. */ () => {
  const source = pool(),
    copy = new SfxItemPool(source);
  expect([copy.GetFirstWhich(), copy.GetLastWhich()]).toEqual([1, 2]);
  expect(copy.GetSlotId(2)).toBe(6002);
  expect(copy.GetWhichIDFromSlotID(6001)).toBe(1);
  expect(copy.GetPoolDefaultItem(1)).toBe(source.GetPoolDefaultItem(1));
  const dynamic = copy.GetPoolDefaultItem(2) as SvxSetItem;
  expect(dynamic).not.toBe(source.GetPoolDefaultItem(2));
  expect(dynamic.isDynamicDefault()).toBe(true);
  expect(dynamic.GetItemSet().GetPool()).toBe(copy);
  dynamic.GetItemSet().Put(new SfxBoolItem(1, true));
  expect((source.GetPoolDefaultItem(2) as SvxSetItem).GetItemSet().Count()).toBe(0);
});
it("copies both effective user entries and saved originals independently before reset", /** Exercises all metadata-copy category branches. @returns Nothing. */ () => {
  const source = pool();
  source.SetUserDefaultItem(new SfxBoolItem(1, true));
  const nested = new SfxItemSet(source, [[1, 1]]);
  nested.Put(new SfxBoolItem(1, true));
  source.SetUserDefaultItem(new SvxSetItem(2, nested));
  const copy = source.Clone();
  expect(copy.GetUserDefaultItem(1)?.QueryValue()).toBe(true);
  expect(copy.GetUserDefaultItem(1)).not.toBe(source.GetUserDefaultItem(1));
  expect(copy.GetPoolDefaultItem(1)).toBe(source.GetPoolDefaultItem(1));
  expect((copy.GetPoolDefaultItem(2) as SvxSetItem).GetItemSet().GetPool()).toBe(copy);
  expect((copy.GetUserDefaultItem(2) as SvxSetItem).GetItemSet().GetPool()).toBe(copy);
  copy.ResetUserDefaultItem(1);
  copy.ResetUserDefaultItem(2);
  expect(copy.GetUserDefaultItem(1)).toBeNull();
  expect(copy.GetUserDefaultItem(2)).toBeNull();
  expect(source.GetUserDefaultItem(1)?.QueryValue()).toBe(true);
  expect(source.GetUserDefaultItem(2)).not.toBeNull();
});
it("uses virtual secondary Clone and rebuilds links with an independent lazy range cache", /** Records actual virtual factory calls. @returns Nothing. */ () => {
  /** Actual derived pool with native virtual Clone extension. */ class Child extends SfxItemPool {
    public clones = 0;
    /** Native override. @returns Copied pool. */ public override Clone(): SfxItemPool {
      ++this.clones;
      return new Child(this);
    }
  }
  const source = pool(),
    secondary = new Child();
  secondary.registerItemInfoPackage(new Package(3));
  source.SetSecondaryPool(secondary);
  const oldRanges = source.GetMergedIdRanges(),
    copy = source.Clone();
  expect(secondary.clones).toBe(1);
  expect(copy.GetSecondaryPool()).toBeInstanceOf(Child);
  expect(copy.GetSecondaryPool()).not.toBe(secondary);
  expect(copy.GetSecondaryPool()?.GetMasterPool()).toBe(copy);
  expect(secondary.GetMasterPool()).toBe(source);
  expect(copy.GetMergedIdRanges()).toEqual(oldRanges);
  expect(copy.GetMergedIdRanges()).not.toBe(oldRanges);
});
it("gates shutdown before reentrant delivery and clears the range cache only afterward", /** Native timing and post-shutdown reusable cache are observable. @returns Nothing. */ () => {
  const source = pool(),
    before = source.GetMergedIdRanges(),
    listener = new Observer();
  listener.action = /** Reenters the native once gate. @returns Nothing. */ () => {
    expect(source.GetMergedIdRanges()).toBe(before);
    source.sendShutdownHint();
  };
  listener.StartListening(source.BC());
  source.sendShutdownHint();
  source.sendShutdownHint();
  expect(listener.hints).toEqual([SfxHintId.Dying]);
  expect(source.GetMergedIdRanges()).toEqual(before);
  expect(source.GetMergedIdRanges()).not.toBe(before);
  delete listener.action;
  const copy = source.Clone(),
    copyListener = new Observer();
  copyListener.StartListening(copy.BC());
  copy.sendShutdownHint();
  expect(copyListener.hints).toEqual([SfxHintId.Dying]);
  copyListener.EndListeningAll();
  listener.EndListeningAll();
});

it("stages all metadata before virtual Clone and exposes the original constructor-time metric", /** A concrete dynamic item queries the real destination pool during construction. @returns Nothing. */ () => {
  const observations: unknown[] = [];
  /** Actual dynamic value with an observing virtual copy. */ class Observing extends SfxBoolItem {
    /** Observes destination before returning its value copy. @param target - Actual copy owner. @returns Value. */ public override Clone(
      target?: SfxItemPool,
    ): Observing {
      const owner = target as SfxItemPool;
      observations.push([
        owner.GetMetric(1),
        owner.GetPoolDefaultItem(3).QueryValue(),
        owner.GetPoolDefaultItem(2).QueryValue(),
        owner.GetUserDefaultItem(2)?.QueryValue(),
      ]);
      return new Observing(this.Which(), this.GetValue());
    }
  }
  /** Real package placing the dynamic entry before later values. */ class Ordered extends ItemInfoPackage {
    private readonly entries = [
      new ItemInfoStatic(1, null, 0, 0),
      new ItemInfoStatic(2, new SfxBoolItem(2, false), 0, 0),
      new ItemInfoStatic(3, new SfxBoolItem(3, true), 0, 0),
    ];
    /** Original count. @returns Count. */ public override size() {
      return this.entries.length;
    }
    /** Original static entry. @param i - Position. @returns Entry. */ protected override getItemInfoStatic(
      i: number,
    ) {
      return this.entries[i] as ItemInfoStatic;
    }
    /** Original dynamic metadata. @param i - Position. @returns Metadata. */ public override getItemInfo(
      i: number,
    ) {
      const info = this.getItemInfoStatic(i);
      return i === 0 ? new ItemInfoDynamic(info, new Observing(1, true)) : info;
    }
  }
  const source = new SfxItemPool();
  source.registerItemInfoPackage(new Ordered());
  source.SetUserDefaultItem(new SfxBoolItem(2, true));
  source.SetDefaultMetric(MapUnit.MapMM);
  const copy = source.Clone();
  expect(observations).toEqual([[MapUnit.MapCM, true, false, true]]);
  expect(copy.GetMetric(1)).toBe(MapUnit.MapMM);
  expect(copy.GetPoolDefaultItem(1).isDynamicDefault()).toBe(true);
});
