/** @fileoverview Checks real Chromium hyperlink menu state respects native DontExpand at the end of the original attribute. */
import { expect, test } from "@playwright/test";
test("Chromium hyperlink state distinguishes original interior and non-expanding end", /** Checks actual DOM caret synchronization and menu enablement. @param fixtures - Real browser fixture. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("abc");
  await editor.press("ControlOrMeta+A");
  await page.getByRole("button", { name: "Hyperlink", exact: true }).click();
  await page.getByLabel("URL").fill("https://example.test/end");
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await editor.focus();
  await editor.press("End");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Hyperlink…" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await editor.focus();
  await editor.press("ArrowLeft");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Hyperlink…" })).toBeEnabled();
  await expect(editor.locator('a[href="https://example.test/end"]')).toHaveText("abc");
});
