/** @fileoverview Exercises Writer Page Style grid control, paint and print settings in Chromium. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer Page Style keeps the grid settings and applies distinct screen and print paint", /** Drives the native Page Style exchange and physical body layer. @param fixtures - Browser fixtures. @param fixtures.page - Current page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  await page.locator("[data-writer-paragraph-id]").first().click();
  const dialog = page.getByRole("dialog", { name: "Page Style", exact: true });
  const grid = page.locator('[data-writer-page="1"] [data-writer-page-text-grid="page"]');
  await expect(grid).toHaveCount(0);
  await openBrowserMenu(page, "Format");
  await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
  await dialog.getByRole("tab", { name: "Text Grid", exact: true }).click();
  await dialog.getByRole("radio", { name: "Grid (lines and characters)", exact: true }).check();
  await expect(dialog.locator('[data-writer-page-text-grid="preview"]')).toBeVisible();
  await dialog.getByRole("checkbox", { name: "Print grid", exact: true }).uncheck();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await expect(grid).toBeVisible();
  await expect(grid).toHaveCSS("background-image", /repeating-linear-gradient/);
  await page.emulateMedia({ media: "print" });
  await expect(grid).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(grid).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(grid).toBeVisible();
});
