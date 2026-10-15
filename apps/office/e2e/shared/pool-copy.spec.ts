/** @fileoverview Actual native pool copies and shutdown notification in Chromium. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("copies native pool metadata and preserves independent shutdown state in Chromium", /** Runs real owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficePoolCopyFixture", [
    {
      module: "src/svl/inc/itempool.ts",
      names: ["SfxItemPool", "ItemInfoPackage", "ItemInfoStatic"],
    },
    { module: "src/svl/source/items/cenumitm.ts", names: ["SfxBoolItem"] },
    { module: "src/svl/source/notify/lstner.ts", names: ["SfxListener"] },
  ]);
  const result = await page.evaluate(
    /** Uses real package and listener classes. @returns Observations. */ () => {
      const n = Reflect.get(window, "OfficePoolCopyFixture");
      /** Actual metadata package. */ class Package extends n.ItemInfoPackage {
        private readonly entry = new n.ItemInfoStatic(1, new n.SfxBoolItem(1, false), 6001, 0);
        /** Original count. @returns One. */ size() {
          return 1;
        }
        /** Original static entry. @returns Metadata. */ getItemInfoStatic() {
          return this.entry;
        }
        /** Original metadata. @returns Entry. */ getItemInfo() {
          return this.entry;
        }
      }
      /** Actual notification receiver. */ class Listener extends n.SfxListener {
        public count = 0;
        /** Receives actual native hint. @returns Nothing. */ Notify() {
          ++this.count;
        }
      }
      const source = new n.SfxItemPool();
      source.registerItemInfoPackage(new Package());
      source.SetUserDefaultItem(new n.SfxBoolItem(1, true));
      source.SetDefaultMetric(2);
      const oldListener = new Listener();
      oldListener.StartListening(source.BC());
      source.sendShutdownHint();
      source.sendShutdownHint();
      const copy = source.Clone(),
        listener = new Listener();
      listener.StartListening(copy.BC());
      const result = [
        copy.GetName().isEmpty(),
        copy.GetMetric(1),
        copy.GetMasterPool() === copy,
        copy.GetPoolDefaultItem(1) === source.GetPoolDefaultItem(1),
        copy.GetUserDefaultItem(1).QueryValue(),
        oldListener.count,
      ];
      copy.ResetUserDefaultItem(1);
      copy.sendShutdownHint();
      copy.sendShutdownHint();
      result.push(
        copy.GetUserDefaultItem(1) === null,
        source.GetUserDefaultItem(1).QueryValue(),
        listener.count,
      );
      oldListener.EndListeningAll();
      listener.EndListeningAll();
      return result;
    },
  );
  expect(result).toEqual([true, 2, true, true, true, 1, true, true, 1]);
});
