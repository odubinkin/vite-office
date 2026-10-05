/** @fileoverview Verifies actual Chromium Enter ends an empty cell list through native owners. */
import { expect, test } from "@playwright/test";
test("Writer Enter ends an empty cell list without inserting a paragraph", /** Exercises native Enter and history with real DOM selection. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert Table" }).click();
  await page
    .getByLabel("Table size")
    .locator("..")
    .getByRole("button", { name: "More Options" })
    .click();
  await page
    .getByRole("dialog", { name: "Insert Table" })
    .getByRole("button", { name: "Insert" })
    .click();
  const cell = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
    tail = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 2", exact: true }),
    neighbor = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
  await cell.click();
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
  await page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("button", { name: "Increase", exact: true })
    .click();
  await expect(cell).toHaveAttribute("data-list-level", "1");
  await cell.press("Enter");
  await expect(cell).toHaveAttribute("data-list-kind", "none");
  await expect(cell).toHaveAttribute("data-list-level", "0");
  await expect(tail).toHaveCount(0);
  await expect(neighbor).toHaveAttribute("data-list-kind", "none");
  await cell.press("Control+z");
  await expect(cell).toHaveAttribute("data-list-kind", "numbered");
  await expect(cell).toHaveAttribute("data-list-level", "1");
  await expect(tail).toHaveCount(0);
  await cell.press("Control+y");
  await expect(cell).toHaveAttribute("data-list-kind", "none");
  await cell.press("Enter");
  await expect(tail).toBeVisible();
  await expect(tail).toHaveAttribute("data-list-kind", "none");
  await page.keyboard.type("After");
  await expect(tail).toHaveText("After");
  await expect(neighbor).toHaveText("");
});
