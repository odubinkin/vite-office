/** @fileoverview Verifies Writer Page Style story toggles, confirmation and history in Chromium. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer Page Style enables both stories and confirms removal of an existing header", /** Exercises the actual command and physical page story paint. @param fixtures - Browser fixture. @param fixtures.page - Actual browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.locator("[data-writer-paragraph-id]").first().click();
  const dialog = page.getByRole("dialog", { name: "Page Style", exact: true });
  const header = page.locator('[data-writer-page-story="header"]');
  const footer = page.locator('[data-writer-page-story="footer"]');

  /** Opens the original Page Style command from Format. @returns Completion. */
  async function open(): Promise<void> {
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: /^Page Style…?$/ }).click();
    await expect(dialog).toBeVisible();
  }

  await open();
  await dialog.getByRole("tab", { name: "Header", exact: true }).click();
  await dialog.getByRole("checkbox", { name: "Header on" }).check();
  await expect(dialog.getByRole("checkbox", { name: "AutoFit height" })).toBeChecked();
  await dialog.getByRole("tab", { name: "Footer", exact: true }).click();
  await dialog.getByRole("checkbox", { name: "Footer on" }).check();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await expect(header).toHaveCount(1);
  await expect(footer).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(header).toHaveCount(0);
  await expect(footer).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(header).toHaveCount(1);

  await open();
  await dialog.getByRole("tab", { name: "Header", exact: true }).click();
  await dialog.getByRole("checkbox", { name: "Header on" }).click();
  const confirm = page.getByRole("alertdialog", { name: "Delete header?" });
  await expect(confirm).toBeVisible();
  await confirm.press("Escape");
  await expect(confirm).toBeHidden();
  await expect(dialog.getByRole("checkbox", { name: "Header on" })).toBeChecked();
  await dialog.getByRole("checkbox", { name: "Header on" }).click();
  await confirm.getByRole("button", { name: "Yes" }).click();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await expect(header).toHaveCount(0);
  await expect(footer).toHaveCount(1);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(header).toHaveCount(1);
});
