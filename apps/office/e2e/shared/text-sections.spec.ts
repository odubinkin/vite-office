/** @fileoverview Actual rich-text section extraction in Chromium from shared ContentInfo and pooled format values. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("extracts ordered rich-text sections using actual shared values in Chromium", /** Uses actual source modules. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeSectionsFixture", [
    {
      module: "src/editeng/source/editeng/editobj2.ts",
      names: ["ContentInfo", "XEditAttribute", "GetAllSections"],
    },
    { module: "src/svl/inc/itempool.ts", names: ["SfxItemPool"] },
    { module: "src/svl/source/items/intitem.ts", names: ["SfxInt16Item"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
  ]);
  const result = await page.evaluate(
    /** Builds genuine paragraph and attribute values. @returns Section projection. */ () => {
      const n = Reflect.get(globalThis, "OfficeSectionsFixture"),
        pool = new n.SfxItemPool(),
        c = new n.ContentInfo(pool),
        text = new n.OUString(new Uint16Array([97, 97, 97, 98, 98, 98, 99, 99, 99]), 9);
      c.SetText(text);
      text.dispose();
      c.GetCharAttribs().push(
        new n.XEditAttribute(pool, new n.SfxInt16Item(4042, 1), 0, 6),
        new n.XEditAttribute(pool, new n.SfxInt16Item(4043, 1), 3, 9),
      );
      const output: { mnStart: number; mnEnd: number; maAttributes: { Which(): number }[] }[] = [];
      n.GetAllSections([c], output);
      return output.map(
        /** Reads native order. @param s - Section. @returns Coordinates/formats. */ (s) => [
          s.mnStart,
          s.mnEnd,
          s.maAttributes.map(
            /** Native identity. @param a - Item. @returns Which. */ (a) => a.Which(),
          ),
        ],
      );
    },
  );
  expect(result).toEqual([
    [0, 3, [4042]],
    [3, 6, [4042, 4043]],
    [6, 9, [4043]],
  ]);
});
