/** @fileoverview Actual native metadata user defaults, effective item sets and original-default restoration in Chromium. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("separates original and effective native pool defaults and restores them in Chromium", /** Runs real shared pool/value owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeUserDefaultsFixture", [
    {
      module: "src/svl/inc/itempool.ts",
      names: ["SfxItemPool", "ItemInfoStatic", "ItemInfoPackage"],
    },
    { module: "src/svl/inc/itemset.ts", names: ["SfxItemSet"] },
    { module: "src/svl/source/items/cenumitm.ts", names: ["SfxBoolItem"] },
  ]);
  const result = await page.evaluate(
    /** Observes actual metadata replacement rather than a snapshot DTO. @returns Results. */ () => {
      const n = Reflect.get(window, "OfficeUserDefaultsFixture");
      /** Actual source package override. */ class Package extends n.ItemInfoPackage {
        private readonly entry = new n.ItemInfoStatic(1, new n.SfxBoolItem(1, false), 6000, 1);
        /** Native static metadata. @returns Entry. */ getItemInfoStatic() {
          return this.entry;
        }
        /** Native count. @returns One. */ size() {
          return 1;
        }
        /** Native registration metadata. @returns Entry. */ getItemInfo() {
          return this.entry;
        }
      }
      const pool = new n.SfxItemPool();
      pool.registerItemInfoPackage(new Package());
      const original = pool.GetPoolDefaultItem(1),
        set = new n.SfxItemSet(pool),
        input = new n.SfxBoolItem(1, true),
        before = [pool.GetUserDefaultItem(1) === null, set.Get(1) === original];
      pool.SetUserDefaultItem(input);
      const current = pool.GetUserDefaultItem(1);
      input.SetValue(false);
      pool.SetUserDefaultItem(new n.SfxBoolItem(1, true));
      const changed = [
        pool.GetPoolDefaultItem(1) === original,
        pool.GetUserOrPoolDefaultItem(1) === current,
        set.Get(1).QueryValue(),
        current.QueryValue(),
        pool.GetUserDefaultItem(1) === current,
        current !== input,
        pool.GetSlotId(1),
        pool.GetWhichIDFromSlotID(6000),
      ];
      pool.SetUserDefaultItem(new n.SfxBoolItem(1, false));
      const replacement = pool.GetUserDefaultItem(1).QueryValue();
      pool.ResetUserDefaultItem(1);
      pool.ResetUserDefaultItem(1);
      return {
        before,
        changed,
        replacement,
        reset: [
          pool.GetUserDefaultItem(1) === null,
          pool.GetPoolDefaultItem(1) === original,
          set.Get(1) === original,
          set.Get(1).QueryValue(),
        ],
      };
    },
  );
  expect(result).toEqual({
    before: [true, true],
    changed: [true, true, true, true, true, true, 6000, 1],
    replacement: false,
    reset: [true, true, true, false],
  });
});
