/** @fileoverview Actual native const-reference target-Which clone and insertion contracts. */
import { expect, it, vi } from "vitest";
import { SfxItemPool } from "./itempool";
import { SfxItemSet } from "./itemset";
import { SfxBoolItem } from "./cenumitm";
import { ScHyphenateCell } from "../../../sc/inc/attrib";
it("retains source identity,clones for the actual target pool,and adopts the remapped clone without cloning its fixed Which back", /** Exercises real existing Clone behavior that reconstructs a native fixed identity. @returns Nothing. */ () => {
  const pool = new SfxItemPool(),
    set = new SfxItemSet(pool, [[1, 2000]]),
    source = new ScHyphenateCell(true),
    clone = vi.spyOn(source, "Clone");
  const result = set.PutAsTargetWhich(source, 1000);
  expect(clone).toHaveBeenCalledWith(pool);
  expect(source.Which()).toBe(125);
  expect(result?.Which()).toBe(1000);
  expect(result).toBe(set.Get(1000));
  expect(result).toBeInstanceOf(ScHyphenateCell);
  expect((result as SfxBoolItem).GetValue()).toBe(true);
  expect(set.PutAsTargetWhich(source, 1000)).toBeUndefined();
  expect(set.PutAsTargetWhich(source, 3000)).toBeUndefined();
  const ordinary = new SfxBoolItem(1, true);
  expect(set.PutAsTargetWhich(ordinary, 0)?.Which()).toBe(1);
  expect(set.PutAsTargetWhich(ordinary, 1)).toBeUndefined();
  expect(ordinary.Which()).toBe(1);
  set.ClearItem();
});
it("uses the original private insertion for zero or unchanged Which rather than dispatching a shadowed nonvirtual Put", /** Native Put is not virtual;the target-Which entry invokes PutImpl directly. @returns Nothing. */ () => {
  /** Models a derived method shadow while retaining the real native base item store. */
  class Derived extends SfxItemSet {
    /** This shadow must not participate in the native nonvirtual call. @param item - Input. @returns No completion. */
    public override Put(item: import("./poolitem").SfxPoolItem): never {
      void item;
      throw Error("Shadowed Put");
    }
  }
  const set = new Derived(new SfxItemPool(), [[1, 2]]);
  expect(set.PutAsTargetWhich(new SfxBoolItem(1, true), 0)).toBe(set.Get(1));
  expect(set.PutAsTargetWhich(new SfxBoolItem(1, false), 1)).toBe(set.Get(1));
  expect((set.Get(1) as SfxBoolItem).GetValue()).toBe(false);
  set.ClearItem();
});
