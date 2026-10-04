/** @fileoverview Checks existing Paragraph panel expander and source-owned More Options in Chromium. */
import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`Paragraph panel expansion and More Options at width ${viewport.width}`, /** Checks actual panel state, title keys, dialog route and editing. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/writer");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const title = sidebar.getByRole("button", { name: "Paragraph", exact: true });
    const start = sidebar.getByRole("button", { name: "Start", exact: true });
    const options = sidebar.getByRole("button", { name: "More Options", exact: true });
    await title.focus();
    await title.press("Space");
    await expect(title).toHaveAttribute("aria-expanded", "false");
    await expect(start).not.toBeVisible();
    await expect(options).toBeVisible();
    await options.click();
    const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(title).toHaveAttribute("aria-expanded", "false");
    await sidebar.getByRole("button", { name: "Close Sidebar Deck" }).click();
    await sidebar.getByRole("button", { name: "Properties", exact: true }).click();
    await expect(title).toHaveAttribute("aria-expanded", "false");
    await title.focus();
    await title.press("Enter");
    await expect(start).toBeVisible();
    await expect(start).toBeFocused();
    await title.focus();
    await title.press("Enter");
    await expect(title).toHaveAttribute("aria-expanded", "true");
    await expect(start).toBeFocused();
    const editor = page.getByLabel("Writer document body", { exact: true });
    await start.press("Control+F6");
    await expect(editor).toBeFocused();
    await page.keyboard.insertText("ParagraphPanelProof");
    await expect(editor).toContainText("ParagraphPanelProof");
    expect(
      await page.evaluate(
        /** Reads page containment. @returns Width equality. */ () =>
          document.documentElement.scrollWidth === innerWidth,
      ),
    ).toBe(true);
  });
}
