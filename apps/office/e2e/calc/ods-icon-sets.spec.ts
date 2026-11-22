/** @fileoverview Production Calc icon painting with the original ODS formula-threshold fixture. */
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";

test("paints original Calc ODS icon sets and updates a referenced threshold", /** Uses genuine cell input and the pinned native icon pixels. @param fixtures - Browser fixtures. @param fixtures.page - Calc page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf64401.ods",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const first = page.getByRole("gridcell", { name: "A1 1", exact: true });
  const second = page.getByRole("gridcell", { name: "A2 2", exact: true });
  const fourth = page.getByRole("gridcell", { name: "A4 4", exact: true });
  const eighth = page.getByRole("gridcell", { name: "A8 8", exact: true });
  const glyph = "[data-calc-conditional-icon]";
  await expect(first.locator(glyph)).toHaveAttribute(
    "data-calc-conditional-icon",
    "icon-set-colorarrows-down.png",
  );
  await expect(fourth.locator(glyph)).toHaveAttribute(
    "data-calc-conditional-icon",
    "icon-set-colorarrows-same.png",
  );
  await expect(eighth.locator(glyph)).toHaveAttribute(
    "data-calc-conditional-icon",
    "icon-set-colorarrows-up.png",
  );
  await expect(first.locator(glyph)).toHaveJSProperty("naturalWidth", 16);
  await page.getByRole("gridcell", { name: "B4 4", exact: true }).click();
  await page.getByRole("textbox", { name: "Input line" }).fill("2");
  await page.getByRole("button", { name: "Accept input", exact: true }).click();
  await expect(second.locator(glyph)).toHaveAttribute(
    "data-calc-conditional-icon",
    "icon-set-colorarrows-same.png",
  );
});
