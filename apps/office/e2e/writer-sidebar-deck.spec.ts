/** @fileoverview Checks Properties deck collapse/reopen separately from Sidebar visibility. */
import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`Properties deck closes and reopens with document focus at width ${viewport.width}`, /** Checks deck lifecycle in the actual browser app. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/writer");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const paragraph = sidebar.getByRole("heading", { name: "Paragraph" });
    const editor = page.getByLabel("Writer document body", { exact: true });
    const activation = sidebar.getByRole("button", { name: "Properties", exact: true });
    await expect(paragraph).toBeVisible();
    await sidebar.getByRole("button", { name: "Close Sidebar Deck" }).click();
    await expect(paragraph).not.toBeVisible();
    await expect(activation).toBeVisible();
    await expect(activation).toHaveAttribute("aria-pressed", "false");
    await page.getByRole("button", { name: "View", exact: true }).click();
    await expect(page.getByRole("menuitemcheckbox", { name: "Sidebar" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await page.keyboard.press("Escape");
    await activation.click();
    await expect(editor).toBeFocused();
    await expect(paragraph).toBeVisible();
    await page.keyboard.insertText("SidebarDeckProof");
    await expect(editor).toContainText("SidebarDeckProof");
    await activation.click();
    await expect(paragraph).not.toBeVisible();
    await activation.focus();
    await activation.press("Escape");
    await expect(editor).toBeFocused();
    await expect(paragraph).not.toBeVisible();
    await activation.click();
    const close = sidebar.getByRole("button", { name: "Close Sidebar Deck" });
    await close.focus();
    await close.press("Escape");
    await expect(editor).toBeFocused();
    await expect(paragraph).toBeVisible();
    expect(
      await page.evaluate(
        /** Reads document containment. @returns Width equality. */ () =>
          document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
  });
}
