/** @fileoverview Actual pool-first module initialization, registered metadata, chain defaults and native pool-only item-set ranges in Chromium. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("constructs native pool-only item sets and preserves range cache in Chromium", /** Runs actual core owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficePoolChainFixture", [
    {
      module: "src/svl/source/items/itempool.ts",
      names: ["SfxItemPool", "ItemInfoStatic", "ItemInfoPackage"],
    },
    { module: "src/svl/source/items/itemset.ts", names: ["SfxItemSet"] },
    { module: "src/svl/source/items/cenumitm.ts", names: ["SfxBoolItem"] },
  ]);
  const result = await page.evaluate(
    /** Binds real package subclass and pool/value operations. @returns Observations. */ () => {
      const native = Reflect.get(window, "OfficePoolChainFixture");
      /** Real native abstract metadata package implementation at the caller boundary. */
      class Package extends native.ItemInfoPackage {
        /** Borrows actual static entry. @param entry - Entry. @returns Package. */ constructor(
          private readonly entry: unknown,
        ) {
          super();
        }
        /** Original static getter. @returns Entry. */ getItemInfoStatic() {
          return this.entry;
        }
        /** Original count. @returns One. */ size() {
          return 1;
        }
        /** Original registration getter. @returns Entry. */ getItemInfo() {
          return this.entry;
        }
      }
      /** Registers actual original metadata. @param id - WhichId. @param slot - Slot. @returns Pool. */
      function pool(id: number, slot: number) {
        const p = new native.SfxItemPool();
        p.registerItemInfoPackage(
          new Package(new native.ItemInfoStatic(id, new native.SfxBoolItem(id, false), slot, 0)),
        );
        return p;
      }
      const a = pool(10, 6000),
        b = pool(1, 7000),
        c = pool(20, 8000);
      a.SetSecondaryPool(b);
      const set = new native.SfxItemSet(a),
        ranges = set.GetRanges();
      set.Put(new native.SfxBoolItem(1, true));
      const original = [
        a.GetMasterPool() === a,
        b.GetMasterPool() === a,
        set.Get(1).QueryValue(),
        set.Get(10).QueryValue(),
        a.GetWhichIDFromSlotID(7000),
        a.GetSlotId(1),
      ];
      a.SetSecondaryPool(c);
      const changed = [
        b.GetMasterPool() === b,
        c.GetMasterPool() === a,
        a.GetUserOrPoolDefaultItem(20).QueryValue(),
        a.GetWhichIDFromSlotID(8000),
      ];
      return { ranges, original, changed, cached: new native.SfxItemSet(a).GetRanges() };
    },
  );
  expect(result).toEqual({
    ranges: [
      [1, 1],
      [10, 10],
    ],
    original: [true, true, true, false, 1, 7000],
    changed: [true, true, false, 20],
    cached: [
      [1, 1],
      [10, 10],
    ],
  });
});
