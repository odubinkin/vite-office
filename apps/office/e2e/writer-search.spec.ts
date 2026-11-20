/** @fileoverview Verifies Writer search shortcuts, focus, and replacement history in Chromium. */

import { expect, test } from "@playwright/test";

test("Writer Find and Replace restores editor focus and undoes all replacements together", /** Drives the browser shortcuts and checks the visible document. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Test completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await editor.fill("cat scatter cat");
  await page.keyboard.press("Control+f");

  const findBar = page.getByRole("toolbar", { name: "Find", exact: true });
  const query = findBar.getByRole("combobox", { name: "Find", exact: true });
  await expect(query).toBeFocused();
  await query.fill("cat");
  await findBar.getByRole("button", { name: "Find and Replace", exact: true }).click();

  const dialog = page.getByRole("dialog", { name: "Find and Replace", exact: true });
  await expect(dialog.getByLabel("Find", { exact: true })).toHaveValue("cat");
  await dialog.getByLabel("Replace with", { exact: true }).fill("dog");
  await dialog.getByRole("checkbox", { name: "Whole words only" }).check();
  await dialog.getByRole("button", { name: "Replace All", exact: true }).click();
  await expect(dialog.getByRole("status")).toHaveText("Search key replaced 2 times.");
  await expect(editor).toHaveText("dog scatter dog");

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByLabel("Writer document body", { exact: true })).toBeFocused();
  await page.keyboard.press("Control+z");
  await expect(editor).toHaveText("cat scatter cat");
});
