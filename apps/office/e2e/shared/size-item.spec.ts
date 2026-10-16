/** @fileoverview Actual shared size item and typed Any conversion in Chromium without native runtime dependencies. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("uses shared native geometry and typed size members in Chromium", /** Exercises actual source owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeSizeFixture", [
    { module: "src/editeng/inc/sizeitem.ts", names: ["SvxSizeItem"] },
    { module: "src/cppu/inc/com/sun/star/uno/Any.ts", names: ["Any"] },
    {
      module: "src/offapi/com/sun/star/awt/Size.ts",
      names: ["Size", "cppu_detail_getUnoType_Size"],
    },
  ]);
  const result = await page.evaluate(
    /** Uses only actual installed shared exports. @returns Native values. */ () => {
      const n = Reflect.get(globalThis, "OfficeSizeFixture"),
        item = new n.SvxSizeItem(170),
        out = new n.Any();
      item.SetWidth(1);
      item.SetHeight(-1);
      const borrowed = item.GetSize();
      item.QueryValue(out, 128);
      const v = new n.Size();
      if (!out.extract(v, n.cppu_detail_getUnoType_Size)) throw Error("Invalid size Any");
      const read = [v.Width, v.Height];
      item.ScaleMetrics(0.5);
      const bad = new n.Any(),
        heightResult = item.PutValue(bad, 2),
        widthResult = item.PutValue(bad, 1);
      return {
        read,
        borrowed: [borrowed.Width(), borrowed.Height()],
        heightResult,
        widthResult,
        metrics: item.HasMetrics(),
      };
    },
  );
  expect(result).toEqual({
    read: [2, -2],
    borrowed: [1, -1],
    heightResult: true,
    widthResult: false,
    metrics: true,
  });
});
