/** @fileoverview Verifies actual document and dialog focus after Writer menu dismissal and execution. */
import { expect, test } from "@playwright/test";

test("root Escape returns focus and typing to the saved Writer editor", /** Checks actual pointer entry and document focus restoration. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByLabel("Writer document body", { exact: true });
  await editor.focus();
  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.getByRole("menu", { name: "View menu" }).press("Escape");
  await expect(editor).toBeFocused();
  await page.keyboard.insertText("MenuFocusProof");
  await expect(editor).toContainText("MenuFocusProof");
});

test("root and nested commands restore the saved editor before dispatch", /** Checks actual command state without I/O changes. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByLabel("Writer document body", { exact: true });
  await editor.focus();
  await page.getByRole("button", { name: "View", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Status Bar", exact: true }).click();
  await expect(editor).toBeFocused();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toHaveCount(0);
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Text", exact: true }).hover();
  const bold = page.getByRole("menuitemcheckbox", { name: "Bold", exact: true });
  await bold.focus();
  await bold.press("Enter");
  await expect(editor).toBeFocused();
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Text", exact: true }).hover();
  await expect(bold).toHaveAttribute("aria-checked", "true");
});

test("a menu command leaves focus in its newly opened Hyperlink dialog", /** Checks command-owned focus after root teardown. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByLabel("Writer document body", { exact: true }).focus();
  await page.getByRole("button", { name: "Insert", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hyperlink…", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "URL", exact: true })).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("outside pointer focus belongs to the clicked Writer control", /** Checks menu restoration cannot override pointer default focus. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByLabel("Writer document body", { exact: true }).focus();
  await page.getByRole("button", { name: "View", exact: true }).click();
  const control = page.getByRole("combobox", { name: "Paragraph style", exact: true });
  await control.click();
  await expect(control).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});
