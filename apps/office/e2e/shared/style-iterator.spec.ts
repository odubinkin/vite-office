/** @fileoverview Real SfxStyleSheetIterator search/cursor behavior in Chromium, over actual IndexedStyleSheets and actual reference-owned styles. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("preserves native style filtering and Find Next index behavior in Chromium", /** Runs original iterator and index modules. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeStyleIteratorFixture", [
    { module: "src/svl/source/items/style.ts", names: ["SfxStyleSheetIterator"] },
    { module: "src/svl/source/items/IndexedStyleSheets.ts", names: ["IndexedStyleSheets"] },
    { module: "src/svl/inc/style.ts", names: ["SfxStyleFamily", "SfxStyleSearchBits"] },
    { module: "src/svl/source/items/style-model.ts", names: ["SfxStyleSheetBase"] },
    { module: "src/cppu/inc/com/sun/star/uno/Reference.ts", names: ["Reference"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
  ]);
  const result = await page.evaluate(
    /** Observes native search state without a substitute pool owner. @returns Results. */ () => {
      const native = Reflect.get(window, "OfficeStyleIteratorFixture"),
        family = native.SfxStyleFamily,
        bits = native.SfxStyleSearchBits,
        index = new native.IndexedStyleSheets(),
        strings: { dispose(): void }[] = [];
      /** Creates native UTF16 value. @param text - Logical name. @returns String. */
      function unicode(text: string) {
        const units = Uint16Array.from(
            text.split(""),
            /** Reads unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
          ),
          value = new native.OUString(units, units.length);
        strings.push(value);
        return value;
      }
      /** Native style subclass supplies the original visibility and usage queries. */
      class IteratorFixtureStyle extends native.SfxStyleSheetBase {
        /** Initializes genuine style properties. @param name - Source name. @param fam - Native family. @param hidden - Visibility flag. @returns Style. */
        constructor(name: string, fam: number, hidden: boolean) {
          super(unicode(name), null, fam, bits.UserDefined);
          this.bHidden = hidden;
        }
        /** Supplies the original virtual model usage query. @returns False. */
        IsUsed() {
          return false;
        }
      }
      const a = new IteratorFixtureStyle("a", family.Char, false),
        b = new IteratorFixtureStyle("b", family.Para, true),
        c = new IteratorFixtureStyle("c", family.Para, false),
        references = [new native.Reference(a), new native.Reference(b), new native.Reference(c)];
      for (const value of [a, b, c]) index.AddStyleSheet(value);
      const pool = {
        /** Native borrowed friend view. @returns Actual index. */ GetIndexedStyleSheets() {
          return index;
        },
      };
      const all = new native.SfxStyleSheetIterator(pool, family.Para),
        filtered = new native.SfxStyleSheetIterator(pool, family.Para, bits.UserDefined),
        hidden = new native.SfxStyleSheetIterator(pool, family.Para, bits.Hidden);
      const normal = [all.First() === b, all.Next() === c],
        found = all.Find(unicode("b")) === b,
        afterFind = all.Next() === null;
      const filtering = [
        filtered.Count(),
        filtered.Find(unicode("b")) === b,
        filtered.Next() === c,
        hidden.Count(),
        hidden.First() === b,
      ];
      index.Dispose();
      for (const reference of references) reference.dispose();
      for (const value of strings) value.dispose();
      return { normal, found, afterFind, filtering };
    },
  );
  expect(result).toEqual({
    normal: [true, true],
    found: true,
    afterFind: true,
    filtering: [2, true, true, 1, true],
  });
});
