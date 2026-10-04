/** @fileoverview Verifies Writer menu-key activation, focus restoration and modal input eligibility. */
import { expect, test } from "@playwright/test";

test("F10 activates the first Writer root without opening and closes its keyboard popup", /** Checks actual activation, navigation and document input. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByLabel("Writer document body", { exact: true });
  await editor.focus();
  await page.keyboard.press("F10");
  const first = page.getByRole("button", { name: "File", exact: true });
  await expect(first).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await first.press("ArrowRight");
  const edit = page.getByRole("button", { name: "Edit", exact: true });
  await expect(edit).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await edit.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Cut", exact: true })).toBeFocused();
  await page.keyboard.press("F10");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(editor).toBeFocused();
  await page.keyboard.insertText("MenuKeyProof");
  await expect(editor).toContainText("MenuKeyProof");
});

test("repeated F10 restores a saved Writer toolbar owner", /** Checks a no-popup cycle preserves its original control. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const owner = page.getByRole("combobox", { name: "Paragraph style", exact: true });
  await owner.focus();
  await page.keyboard.press("F10");
  await expect(page.getByRole("button", { name: "File", exact: true })).toBeFocused();
  await page.keyboard.press("F10");
  await expect(owner).toBeFocused();
});

test("F10 leaves a modal Writer Hyperlink dialog's focus untouched", /** Checks native modal input gating. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert", exact: true }).click();
  await page.getByRole("menuitem", { name: "Hyperlink…", exact: true }).click();
  const url = page.getByRole("textbox", { name: "URL", exact: true });
  await expect(url).toBeFocused();
  await page.keyboard.press("F10");
  await expect(url).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});
