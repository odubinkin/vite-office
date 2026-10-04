/** @fileoverview Verifies Writer Home/End root-popup synchronization against the built browser app. */
import { expect, test } from "@playwright/test";

for (const key of ["Home", "End"] as const) {
  test(`${key} replaces the active Writer root popup and returns to editing on Escape`, /** Checks root boundary navigation changes the actual visible popup. @param fixtures - Browser fixture. @returns Nothing. */ async ({
    page,
  }) => {
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.focus();
    const view = page.getByRole("button", { name: "View", exact: true });
    await view.click();
    await view.focus();
    await view.press(key);
    const root = page.getByRole("button", { name: key === "Home" ? "File" : "Tools", exact: true });
    await expect(root).toHaveAttribute("aria-expanded", "true");
    await expect(view).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("menu")).toHaveCount(1);
    const item = page.getByRole("menuitem", {
      name: key === "Home" ? "New Document" : "Line Numbering…",
      exact: true,
    });
    await expect(item).toBeFocused();
    await item.press("Escape");
    await expect(editor).toBeFocused();
    await page.keyboard.insertText("BoundaryKeyProof");
    await expect(editor).toContainText("BoundaryKeyProof");
  });
}

test("Writer F10 boundary navigation stays unopened until an explicit popup key", /** Checks inactive auto-popup stays disabled. @param fixtures - Browser fixture. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const editor = page.getByLabel("Writer document body", { exact: true });
  await editor.focus();
  await page.keyboard.press("F10");
  const file = page.getByRole("button", { name: "File", exact: true });
  await file.press("End");
  const tools = page.getByRole("button", { name: "Tools", exact: true });
  await expect(tools).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await tools.press("Home");
  await expect(file).toBeFocused();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await file.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "New Document", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(editor).toBeFocused();
});
