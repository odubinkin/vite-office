/** @fileoverview Actual shared style index operations in Chromium, with actual retained style owners and no substitute style pool or Calc model. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("preserves native style name reindex and Clear family state in Chromium", /** Runs actual collection/value modules. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeIndexedStylesFixture", [
    { module: "src/svl/inc/IndexedStyleSheets.ts", names: ["IndexedStyleSheets"] },
    { module: "src/svl/inc/style.ts", names: ["SfxStyleFamily", "SfxStyleSearchBits"] },
    { module: "src/svl/source/items/style-model.ts", names: ["SfxStyleSheetBase"] },
    { module: "src/cppu/inc/com/sun/star/uno/Reference.ts", names: ["Reference"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
  ]);
  const result = await page.evaluate(
    /** Observes the actual source index through its borrowed callback boundary. @returns Observations. */ () => {
      const native = Reflect.get(window, "OfficeIndexedStylesFixture"),
        strings: { dispose(): void }[] = [];
      /** Creates genuine logical UTF16. @param text - Name. @returns Native value. */
      function unicode(text: string) {
        const units = new Uint16Array(text.length);
        for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
        const value = new native.OUString(units, units.length);
        strings.push(value);
        return value;
      }
      /** Native QA style subclass exposes the actual owned name for direct reindexing. */
      class IndexedFixtureStyle extends native.SfxStyleSheetBase {
        /** Constructs a native style with no associated item pool. @param name - Source name. @param family - Native family. @returns Style. */
        constructor(name: string, family: number) {
          super(unicode(name), null, family, native.SfxStyleSearchBits.Auto);
        }
        /** Changes the owned name before direct index notification. @param name - New name. @returns Nothing. */
        Rename(name: string) {
          this.aName.assign(unicode(name));
        }
      }
      const index = new native.IndexedStyleSheets(),
        a = new IndexedFixtureStyle("a\0b", native.SfxStyleFamily.Char),
        b = new IndexedFixtureStyle("a\0b", native.SfxStyleFamily.Para),
        references = [new native.Reference(a), new native.Reference(b)];
      index.AddStyleSheet(a);
      index.AddStyleSheet(b);
      index.AddStyleSheet(a);
      const count = index.GetNumberOfStyleSheets(),
        duplicates = index.FindPositionsByName(unicode("a\0b")).sort();
      const old = new native.OUString(a.GetName());
      strings.push(old);
      a.Rename("changed");
      index.ReindexOnNameChange(a, old, a.GetName());
      const renamed = index.FindPositionsByName(unicode("changed")),
        family = index.GetStyleSheetsByFamily(native.SfxStyleFamily.Char);
      const cleared: number[] = [];
      index.Clear({
        /** Records source callback order before slot clearing. @param value - Actual reference argument. @returns Nothing. */ Dispose(value: {
          get(): unknown;
        }) {
          const style = value.get();
          if (style !== a && style !== b) throw Error("Unexpected reference in Clear callback");
          cleared.push(style === a ? 0 : 1);
        },
      });
      const afterClear = [
        index.GetNumberOfStyleSheets(),
        family.length,
        index.FindPositionsByName(unicode("changed")).length,
      ];
      index.Reindex();
      const afterReindex = family.length;
      index.Dispose();
      for (const reference of references) reference.dispose();
      for (const value of strings) value.dispose();
      return { count, duplicates, renamed, cleared, afterClear, afterReindex };
    },
  );
  expect(result).toEqual({
    count: 2,
    duplicates: [0, 1],
    renamed: [0],
    cleared: [0, 1],
    afterClear: [0, 1, 0],
    afterReindex: 0,
  });
});
