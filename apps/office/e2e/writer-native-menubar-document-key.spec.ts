/** @fileoverview Checks actual Writer menubar Ctrl-F6 ownership before its global document-focus route. */
import { expect, test } from "@playwright/test";
test("native root Ctrl-F6 closes the Writer popup and focuses its document", /** Checks actual root cleanup despite a saved toolbar owner. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const owner = page.getByRole("combobox", { name: "Paragraph style", exact: true }),
    editor = page.getByLabel("Writer document body", { exact: true });
  await owner.focus();
  await page.keyboard.press("F10");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menu", { name: "File menu" })).toBeVisible();
  await page.keyboard.press("Control+F6");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(editor).toBeFocused();
  await page.keyboard.press("F10");
  await expect(page.getByRole("button", { name: "File", exact: true })).toBeFocused();
});
test("native menubar trigger Ctrl-F6 resets the Writer activation cycle", /** Checks no-popup deactivation and subsequent fresh native menu key. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const owner = page.getByRole("combobox", { name: "Paragraph style", exact: true }),
    editor = page.getByLabel("Writer document body", { exact: true });
  await owner.focus();
  await page.keyboard.press("F10");
  await page.keyboard.press("Control+F6");
  await expect(editor).toBeFocused();
  await page.keyboard.press("F10");
  await expect(page.getByRole("button", { name: "File", exact: true })).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
});
test("native child Ctrl-F6 closes only the Writer owning submenu", /** Checks nearest parent consumes input before Writer direct document routing. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  const trigger = page.getByRole("menuitem", { name: "Text", exact: true });
  await trigger.focus();
  await trigger.press("ArrowRight");
  await expect(page.getByRole("menu", { name: "Text menu" })).toBeVisible();
  await page.keyboard.press("Control+F6");
  await expect(page.getByRole("menu", { name: "Text menu" })).toHaveCount(0);
  await expect(page.getByRole("menu", { name: "Format menu" })).toBeVisible();
  await expect(trigger).toBeFocused();
});
