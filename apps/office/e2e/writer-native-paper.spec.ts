/** @fileoverview Shared native physical paper values through the actual Writer page dialog and page layout. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";
for (const width of [1280, 390]) {
  test(`Writer shared native paper geometry at ${width}px`, /** Exercises the production dialog and persistence in the actual document. @param fixtures - Browser page. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
    await page.getByLabel("Paper format", { exact: true }).selectOption("Letter");
    await expect(page.getByLabel("Width (cm)", { exact: true })).toHaveValue("21.59 cm");
    await expect(page.getByLabel("Height (cm)", { exact: true })).toHaveValue("27.94 cm");
    await page.getByLabel("Landscape", { exact: true }).check();
    await page.getByLabel("Paper format", { exact: true }).selectOption("A4");
    await expect(page.getByLabel("Width (cm)", { exact: true })).toHaveValue("29.70 cm");
    await expect(page.getByLabel("Height (cm)", { exact: true })).toHaveValue("21.00 cm");
    await page.getByRole("button", { name: "OK", exact: true }).click();
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
    await expect(page.getByLabel("Paper format", { exact: true })).toHaveValue("A4");
    await expect(page.getByLabel("Landscape", { exact: true })).toBeChecked();
    await expect(page.getByLabel("Width (cm)", { exact: true })).toHaveValue("29.70 cm");
    await page.screenshot({ path: test.info().outputPath(`writer-native-paper-${width}.png`) });
  });
}
