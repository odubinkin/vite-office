/** @fileoverview Verifies Page Style register controls and the separate screen-only baseline grid. */
import { expect, test } from "@playwright/test";
import { hoverBrowserMenuItem, openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer selects a page line-spacing reference and paints the View baseline grid on screen only", /** Drives the Word Processor view and original menu path. @param fixtures - Browser fixtures. @param fixtures.page - Current page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  await page.locator("[data-writer-paragraph-id]").first().click();
  await openBrowserMenu(page, "Format");
  await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Page Style", exact: true });
  await dialog.getByRole("checkbox", { name: "Use page line-spacing", exact: true }).check();
  await expect(dialog.getByRole("combobox", { name: "Reference Style:" })).toBeEnabled();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await openBrowserMenu(page, "Format");
  await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
  const paragraph = page.getByRole("dialog", { name: "Paragraph", exact: true });
  await paragraph
    .getByRole("checkbox", { name: "Activate page line-spacing", exact: true })
    .check();
  await paragraph.getByRole("button", { name: "OK", exact: true }).click();
  await openBrowserMenu(page, "View");
  await hoverBrowserMenuItem(
    page,
    page.getByRole("menuitem", { name: "Grids and Helplines", exact: true }),
  );
  const toggle = page.getByRole("menuitemcheckbox", { name: "Display Baseline Grid", exact: true });
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  await toggle.click();
  const grid = page.locator('[data-writer-page="1"] [data-writer-baseline-grid]');
  await expect(grid).toBeVisible();
  await expect(grid).toHaveCSS("background-image", /repeating-linear-gradient/);
  await page.emulateMedia({ media: "print" });
  await expect(grid).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(grid).toBeVisible();
});
