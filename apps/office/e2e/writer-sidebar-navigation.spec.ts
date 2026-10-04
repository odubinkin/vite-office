/** @fileoverview Checks managed Sidebar Tab and arrows in real Chromium. */
import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`Sidebar managed Tab and arrow navigation at width ${viewport.width}`, /** Checks native traversal, closed-deck entry and subsequent editing. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/writer");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const title = sidebar.getByRole("button", { name: "Paragraph", exact: true });
    const options = sidebar.getByRole("button", { name: "More Options", exact: true });
    const close = sidebar.getByRole("button", { name: "Close Sidebar Deck", exact: true });
    const rail = sidebar.getByRole("button", { name: "Properties", exact: true });
    await title.focus();
    await title.press("Space");
    await title.press("Tab");
    await expect(options).toBeFocused();
    await expect(title).toHaveAttribute("aria-expanded", "false");
    await options.press("Tab");
    await expect(sidebar.getByRole("button", { name: "Start", exact: true })).toBeFocused();
    await expect(title).toHaveAttribute("aria-expanded", "true");
    await close.focus();
    await close.press("Tab");
    await expect(rail).toBeFocused();
    await rail.press("Shift+Tab");
    await expect(close).toBeFocused();
    await close.press("Shift+Tab");
    await expect(rail).toBeFocused();
    await rail.press("Tab");
    await expect(title).toBeFocused();
    for (const control of [title, options]) {
      for (const key of ["ArrowUp", "ArrowLeft"]) {
        await control.focus();
        await control.press(key);
        await expect(close).toBeFocused();
      }
      for (const key of ["ArrowDown", "ArrowRight"]) {
        await control.focus();
        await control.press(key);
        await expect(rail).toBeFocused();
      }
    }
    for (const key of ["ArrowUp", "ArrowDown"]) {
      await rail.press(key);
      await expect(rail).toBeFocused();
      await expect(rail).toHaveAttribute("aria-pressed", "true");
    }
    await title.focus();
    await title.press("Space");
    await close.click();
    await expect(rail).toHaveAttribute("aria-pressed", "false");
    await rail.focus();
    await rail.press("Tab");
    await expect(title).toBeFocused();
    await expect(title).toHaveAttribute("aria-expanded", "true");
    await expect(rail).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await title.press("Escape");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await expect(editor).toBeFocused();
    await page.keyboard.insertText("SidebarNavigationProof");
    await expect(editor).toContainText("SidebarNavigationProof");
  });
}
