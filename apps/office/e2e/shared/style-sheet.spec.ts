/** @fileoverview Actual native derived styles retain one identity across listener/broadcaster roles in Chromium, reusing shared algorithms and the canonical style header. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("preserves actual style role identity, inherited forwarding, copies and destruction in Chromium", /** Runs real derived owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeStyleSheetFixture", [
    {
      module: "src/svl/inc/style.ts",
      names: ["SfxStyleSheet", "SfxStyleSheetPool", "SfxStyleFamily"],
    },
    { module: "src/svl/inc/hint.ts", names: ["SfxHint", "SfxHintId"] },
    { module: "src/svl/source/notify/lstner.ts", names: ["SfxListener"] },
    {
      module: "src/svl/source/items/itempool.ts",
      names: ["SfxItemPool", "ItemInfoStatic", "ItemInfoPackage"],
    },
    { module: "src/svl/source/items/cenumitm.ts", names: ["SfxBoolItem"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
  ]);
  const result = await page.evaluate(
    /** Observes actual native pointer/role equivalents without proxies. @returns Results. */ () => {
      const n = Reflect.get(window, "OfficeStyleSheetFixture"),
        strings: { dispose(): void }[] = [];
      /** Creates original UTF16. @param value - Text. @returns String. */ function unicode(
        value: string,
      ) {
        const units = Uint16Array.from(
            value.split(""),
            /** Reads code. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
          ),
          s = new n.OUString(units, units.length);
        strings.push(s);
        return s;
      }
      /** Actual metadata package override. */ class Package extends n.ItemInfoPackage {
        private readonly entry = new n.ItemInfoStatic(1, new n.SfxBoolItem(1, false), 0, 0);
        /** Original metadata. @returns Entry. */ getItemInfoStatic() {
          return this.entry;
        }
        /** Original count. @returns One. */ size() {
          return 1;
        }
        /** Original registration. @returns Entry. */ getItemInfo() {
          return this.entry;
        }
      }
      const items = new n.SfxItemPool();
      items.registerItemInfoPackage(new Package());
      const pool = new n.SfxStyleSheetPool(items),
        parent = pool.Make(unicode("parent"), n.SfxStyleFamily.Char),
        other = pool.Make(unicode("other"), n.SfxStyleFamily.Char),
        child = pool.Make(unicode("child"), n.SfxStyleFamily.Char),
        values: { source: unknown; hint: { GetId(): number } }[] = [];
      /** Original virtual listener override. */ class Observer extends n.SfxListener {
        /** Captures original values. @param source - Source. @param hint - Hint. @returns Nothing. */ Notify(
          source: unknown,
          hint: { GetId(): number },
        ) {
          values.push({ source, hint });
        }
      }
      child.SetParent(parent.GetName());
      const observer = new Observer();
      observer.StartListening(child);
      const data = new n.SfxHint(n.SfxHintId.DataChanged);
      parent.Broadcast(data);
      const first = [
        values.length,
        values[0]?.source === parent,
        values[0]?.hint === data,
        child.GetBroadcasterJOE(0) === parent,
        observer.GetBroadcasterJOE(0) === child,
        child.IsSfxStyleSheet(),
        child.isUsedByModel(),
      ];
      const copy = new n.SfxStyleSheet(child),
        theme = new n.SfxHint(n.SfxHintId.ThemeColorsChanged);
      parent.Broadcast(theme);
      const copied = [
        copy.IsListening(parent),
        observer.IsListening(copy),
        values.length,
        values[1]?.source === parent,
        values[2]?.source === parent,
        values[1]?.hint === theme,
        values[2]?.hint === theme,
      ];
      child.SetParent(other.GetName());
      parent.Broadcast(data);
      other.Broadcast(data);
      const rebound = [child.IsListening(parent), child.IsListening(other), values.length];
      copy.Dispose();
      const destruction = values
          .slice(-2)
          .map(
            /** Checks actual final sources and IDs. @param entry - Record. @returns Observation. */ (
              entry,
            ) => [entry.source === copy, entry.hint.GetId()],
          ),
        expected = [n.SfxHintId.StyleSheetInDestruction, n.SfxHintId.Dying];
      const remaining = observer.GetBroadcasterCount();
      observer.Dispose();
      pool.Dispose();
      parent.Dispose();
      other.Dispose();
      child.Dispose();
      for (const s of strings) s.dispose();
      return {
        first,
        copied,
        rebound,
        destruction: destruction.map(
          /** Verifies ID against original declaration. @param entry - Observation. @param i - Position. @returns Match. */ (
            entry,
            i,
          ) => entry[0] && entry[1] === expected[i],
        ),
        remaining,
      };
    },
  );
  expect(result).toEqual({
    first: [1, true, true, true, true, true, true],
    copied: [true, true, 3, true, true, true, true],
    rebound: [false, true, 5],
    destruction: [true, true],
    remaining: 1,
  });
});
