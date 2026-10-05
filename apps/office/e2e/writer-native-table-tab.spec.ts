/** @fileoverview Checks native table Tab traversal,append and UndoRedo in real Chromium. */
import { expect, test } from "@playwright/test";
test("Writer Tab traverses native cell sections and appends one row with history", /** Checks actual browser keyboard,DOM caret and subsequent typing. @param root0 - Browser fixture. @param root0.page - Chromium page. @returns Completion. */ async ({
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
  const first = page.getByLabel("Row 1 column 1 paragraph 1", { exact: true }),
    second = page.getByLabel("Row 1 column 2 paragraph 1", { exact: true }),
    third = page.getByLabel("Row 2 column 1 paragraph 1", { exact: true }),
    last = page.getByLabel("Row 2 column 2 paragraph 1", { exact: true });
  await first.click();
  await page.keyboard.type("ABC");
  await page.keyboard.press("Tab");
  await page.keyboard.type("DEF");
  await expect(first).toHaveText("ABC");
  await expect(second).toHaveText("DEF");
  await page.keyboard.press("Enter");
  const tail = page.getByLabel("Row 1 column 2 paragraph 2", { exact: true });
  await page.keyboard.type("Tail");
  await expect(tail).toHaveText("Tail");
  await page.keyboard.press("Tab");
  await page.keyboard.type("GHI");
  await expect(third).toHaveText("GHI");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.type("X");
  await expect(second).toHaveText("XDEF");
  await expect(tail).toHaveText("Tail");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.type("Y");
  await expect(first).toHaveText("YABC");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.type("JKL");
  await expect(last).toHaveText("JKL");
  await page.keyboard.press("Tab");
  const fresh = page.getByLabel("Row 3 column 1 paragraph 1", { exact: true });
  await expect(fresh).toBeVisible();
  await page.keyboard.type("New");
  await expect(fresh).toHaveText("New");
  await page.keyboard.press("Control+z");
  await expect(fresh).toHaveText("");
  await page.keyboard.press("Control+z");
  await expect(fresh).toHaveCount(0);
  await expect(last).toHaveText("JKL");
  await page.keyboard.press("Control+y");
  await expect(fresh).toBeVisible();
  await page.keyboard.press("Control+y");
  await expect(fresh).toHaveText("New");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.type("Z");
  await expect(last).toHaveText("ZJKL");
  await expect(fresh).toHaveText("New");
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText("");
});
