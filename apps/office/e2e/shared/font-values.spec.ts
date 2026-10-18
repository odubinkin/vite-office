/** @fileoverview Actual stored VCL Font values in Chromium without a native font/provider or ownership engine. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("uses native stored font colors alignment and size in Chromium", /** Loads actual shared sources. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeFontValuesFixture", [
    { module: "src/vcl/source/font/font.ts", names: ["Font"] },
    { module: "src/tools/inc/color.ts", names: ["Color", "COL_TRANSPARENT"] },
    { module: "src/tools/inc/gen.ts", names: ["Size"] },
    { module: "src/tools/inc/fontenum.ts", names: ["TextAlign"] },
  ]);
  const result = await page.evaluate(
    /** Uses actual shared value owners. @returns Stored values. */ () => {
      const n = Reflect.get(globalThis, "OfficeFontValuesFixture"),
        font = new n.Font(),
        copy = new n.Font(font);
      font.SetTransparent(false);
      font.SetFillColor(n.COL_TRANSPARENT);
      const sameFill = font.IsTransparent();
      font.SetColor(new n.Color(0x123456));
      font.SetFillColor(new n.Color(0xffffff));
      font.SetAlignment(n.TextAlign.ALIGN_BOTTOM);
      font.SetFontSize(new n.Size(12, 24));
      const independent = new n.Font();
      independent.SetTransparent(false);
      independent.SetColor(new n.Color(0x123456));
      independent.SetFillColor(new n.Color(0xffffff));
      independent.SetAlignment(n.TextAlign.ALIGN_BOTTOM);
      independent.SetFontSize(new n.Size(12, 24));
      const independentEqual = font.IsSameInstance(independent);
      const held = new n.Font(font);
      font.SetFontSize(new n.Size(12, 24));
      const same = font.IsSameInstance(held);
      font.SetFontHeight(25);
      return {
        independentEqual,
        sameFill,
        same,
        color: font.GetColor().toUInt32(),
        alignment: font.GetAlignment(),
        size: [font.GetAverageFontWidth(), font.GetFontHeight()],
        copy: [copy.GetAlignment(), copy.GetFontHeight(), copy.IsTransparent()],
        heldHeight: held.GetFontHeight(),
      };
    },
  );
  expect(result).toEqual({
    independentEqual: true,
    sameFill: false,
    same: true,
    color: 0x123456,
    alignment: 2,
    size: [12, 25],
    copy: [0, 0, true],
    heldHeight: 24,
  });
});
