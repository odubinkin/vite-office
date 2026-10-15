/** @fileoverview Actual core style/pool owners through the canonical style header in Chromium; no substitute model or browser test globals in production. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("uses actual native styles for rename, attributes, clear and dying in Chromium", /** Runs shared owners through the original header boundary. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeStyleModelFixture", [
    {
      module: "src/svl/inc/style.ts",
      names: [
        "SfxStyleSheetBasePool",
        "SfxStyleSheetIterator",
        "SfxStyleFamily",
        "SfxStyleSearchBits",
      ],
    },
    { module: "src/svl/inc/hint.ts", names: ["SfxHintId"] },
    { module: "src/svl/source/notify/lstner.ts", names: ["SfxListener"] },
    {
      module: "src/svl/source/items/itempool.ts",
      names: ["SfxItemPool", "ItemInfoStatic", "ItemInfoPackage"],
    },
    { module: "src/svl/source/items/cenumitm.ts", names: ["SfxBoolItem"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
  ]);
  const result = await page.evaluate(
    /** Observes original owner contracts. @returns Results. */ () => {
      const n = Reflect.get(window, "OfficeStyleModelFixture"),
        strings: { dispose(): void }[] = [];
      /** Creates native logical UTF16. @param value - Text. @returns Value. */ function unicode(
        value: string,
      ) {
        const units = Uint16Array.from(
            value.split(""),
            /** Reads unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
          ),
          s = new n.OUString(units, units.length);
        strings.push(s);
        return s;
      }
      /** Reads exact native const value. @param value - String. @returns Text. */ function text(value: {
        getStr(): Uint16Array;
        getLength(): number;
      }) {
        return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
      }
      /** Actual original package override. */ class Package extends n.ItemInfoPackage {
        private readonly entry = new n.ItemInfoStatic(1, new n.SfxBoolItem(1, false), 0, 0);
        /** Native static access. @returns Entry. */ getItemInfoStatic() {
          return this.entry;
        }
        /** Native count. @returns One. */ size() {
          return 1;
        }
        /** Native metadata. @returns Entry. */ getItemInfo() {
          return this.entry;
        }
      }
      const items = new n.SfxItemPool();
      items.registerItemInfoPackage(new Package());
      const pool = new n.SfxStyleSheetBasePool(items),
        ids: number[] = [];
      /** Original listener override. */ class Listener extends n.SfxListener {
        /** Reads synchronous hint. @param _source - Source. @param hint - Hint. @returns Nothing. */ Notify(
          _source: unknown,
          hint: { GetId(): number },
        ) {
          void _source;
          ids.push(hint.GetId());
        }
      }
      const listener = new Listener();
      listener.StartListening(pool);
      const a = pool.Make(unicode("a"), n.SfxStyleFamily.Char),
        child = pool.Make(
          unicode("child"),
          n.SfxStyleFamily.Char,
          n.SfxStyleSearchBits.All,
          unicode("a"),
        ),
        creation = ids.length;
      a.GetItemSet().Put(new n.SfxBoolItem(1, true));
      a.SetName(unicode("renamed"));
      const rename = [
        text(child.GetParent()),
        text(a.GetFollow()),
        pool.Find(unicode("a"), n.SfxStyleFamily.Char) === null,
        pool.Find(unicode("renamed"), n.SfxStyleFamily.Char) === a,
        ids[0] === n.SfxHintId.StyleSheetModifiedExtended,
      ];
      const cycle = a.SetParent(unicode("child")),
        preview = a.GetItemSetForPreview();
      preview.Put(new n.SfxBoolItem(1, false));
      const values = [a.GetItemSet().Get(1).QueryValue(), preview.Get(1).QueryValue()];
      pool.Clear();
      const cleared = [
        pool.GetIndexedStyleSheets().GetNumberOfStyleSheets(),
        pool.GetIndexedStyleSheets().GetStyleSheetsByFamily(n.SfxStyleFamily.Char).length,
        ids.filter(
          /** Counts erase hints. @param id - ID. @returns Match. */ (id) =>
            id === n.SfxHintId.StyleSheetErased,
        ).length,
      ];
      pool.Dispose();
      const dying = ids.filter(
          /** Counts original derived/base hints. @param id - ID. @returns Match. */ (id) =>
            id === n.SfxHintId.Dying,
        ).length,
        registered = listener.GetBroadcasterCount();
      a.Dispose();
      child.Dispose();
      for (const s of strings) s.dispose();
      return { creation, rename, cycle, values, cleared, dying, registered };
    },
  );
  expect(result).toEqual({
    creation: 0,
    rename: ["renamed", "renamed", true, true, true],
    cycle: false,
    values: [true, false],
    cleared: [0, 2, 2],
    dying: 2,
    registered: 0,
  });
});
