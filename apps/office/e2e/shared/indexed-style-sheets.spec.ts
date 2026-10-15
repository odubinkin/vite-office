/** @fileoverview Actual shared style index operations in Chromium, with caller name/family witnesses and no substitute style pool or Calc model. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("preserves native style name reindex and Clear family state in Chromium", /** Runs actual collection/value modules. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeIndexedStylesFixture", [
    { module: "src/svl/inc/IndexedStyleSheets.ts", names: ["IndexedStyleSheets"] },
    { module: "src/svl/inc/style.ts", names: ["SfxStyleFamily"] },
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
      /** Native QA-style caller witness provides the exact consumed operations. @param name - Name. @param family - Native family. @returns Identity. */
      function style(name: string, family: number) {
        return {
          name: unicode(name),
          /** Borrows current native name. @returns Name. */ GetName() {
            return this.name;
          },
          /** Borrows native family. @returns Family. */ GetFamily() {
            return family;
          },
        };
      }
      const index = new native.IndexedStyleSheets(),
        a = style("a\0b", native.SfxStyleFamily.Char),
        b = style("a\0b", native.SfxStyleFamily.Para);
      index.AddStyleSheet(a);
      index.AddStyleSheet(b);
      index.AddStyleSheet(a);
      const count = index.GetNumberOfStyleSheets(),
        duplicates = index.FindPositionsByName(unicode("a\0b")).sort();
      const old = new native.OUString(a.name);
      strings.push(old);
      a.name.assign(unicode("changed"));
      index.ReindexOnNameChange(a, old, a.name);
      const renamed = index.FindPositionsByName(unicode("changed")),
        family = index.GetStyleSheetsByFamily(native.SfxStyleFamily.Char);
      const cleared: number[] = [];
      index.Clear({
        /** Records source callback order before slot clearing. @param value - Caller identity. @returns Nothing. */ Dispose(
          value: unknown,
        ) {
          cleared.push(value === a ? 0 : 1);
        },
      });
      const afterClear = [
        index.GetNumberOfStyleSheets(),
        family.length,
        index.FindPositionsByName(unicode("changed")).length,
      ];
      index.Reindex();
      const afterReindex = family.length;
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
