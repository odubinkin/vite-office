/** @fileoverview Checks real Chromium table row selection and cursor-owned context. */
import { test, expect } from "@playwright/test";
/** Inserts the existing default grid through its UI. @param page - Browser. @returns Completion. */
async function insert(page: import("@playwright/test").Page) {
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
}
test("Writer row selection paints core boxes and typing after caret kill preserves neighbors", /** Checks actual table selection behavior. @param root0 - Current owner. @param root0.page - Browser owner. @returns Operation result. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const body = page.getByRole("textbox", { name: "Writer document text" });
  await body.click();
  await page.keyboard.type("Body");
  await insert(page);
  const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }),
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("Keep");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Cell");
  await page.getByRole("button", { name: "Select row 1 in Table1" }).click();
  const table = page.getByRole("table", { name: "Table1" });
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await expect(table.locator("tr").first()).toHaveAttribute("aria-selected", "true");
  await second.click();
  await page.keyboard.type("X");
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
  await expect(first).toHaveText("Keep");
  await expect(second).toContainText("X");
  await expect(body).toHaveText("Body");
  await body.click();
  await expect(page.getByRole("button", { name: "Table Properties", exact: true })).toHaveCount(0);
});
test("Writer native keyboard box selection and caret properties context agree", /** Checks actual table selection behavior. @param root0 - Current owner. @param root0.page - Browser owner. @returns Operation result. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await insert(page);
  const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }),
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("First");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Second");
  await page.keyboard.press("Control+Home");
  await page.keyboard.press("Control+Shift+Home");
  const table = page.getByRole("table", { name: "Table1" });
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(2);
  await second.click();
  await expect(table.locator('[data-writer-editor-selected="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Table Properties", exact: true }).click();
  await expect(
    page
      .getByRole("dialog", { name: "Table Properties" })
      .getByLabel("Table width (cm)", { exact: true }),
  ).not.toHaveValue("0");
});
