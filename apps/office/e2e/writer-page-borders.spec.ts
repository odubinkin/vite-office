/** @fileoverview Verifies physical page border and shadow paint through Writer Page Style. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer Page Style paints the authored page border and shadow and undoes both together", /** Runs the original Writer page style command and physical browser paint. @param fixtures - Browser fixtures. @param fixtures.page - Current page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer", { waitUntil: "domcontentloaded" });
  await page.locator("[data-writer-paragraph-id]").first().click();
  const dialog = page.getByRole("dialog", { name: "Page Style", exact: true });
  const border = page.locator("[data-writer-page='1'] [data-writer-page-border]");

  /** Opens the Page Style Borders tab from the Format menu. @returns Completion. */
  async function open(): Promise<void> {
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: "Page Style…", exact: true }).click();
    await dialog.getByRole("tab", { name: "Borders", exact: true }).click();
  }

  await expect(border).toHaveCount(0);
  await open();
  await dialog.getByRole("button", { name: "All Four Borders" }).click();
  await dialog
    .getByRole("combobox", { name: "Position" })
    .selectOption({ label: "Cast Shadow to Top Right" });
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  await expect(border).toHaveCSS("border-top-style", "solid");
  await expect(border).toHaveCSS("box-shadow", /-[\d.]+px 0px 0px/);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(border).toHaveCount(0);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(border).toHaveCSS("border-top-style", "solid");

  await open();
  await expect(
    dialog.getByRole("combobox", { name: "Position" }).locator("option:checked"),
  ).toHaveText("Cast Shadow to Top Right");
  await dialog.getByRole("button", { name: "No Borders" }).click();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(border).toHaveCSS("border-top-style", "solid");
});
