/** @fileoverview Checks native Paragraph panel Escape focus routing in Chromium. */
import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`Paragraph panel Escape returns to title then document at width ${viewport.width}`, /** Checks real browser cancellation, retained state and subsequent editing. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/writer");
    const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
    const title = sidebar.getByRole("button", { name: "Paragraph", exact: true });
    const editor = page.getByLabel("Writer document body", { exact: true });
    for (const label of ["Start", "No List"]) {
      const control = sidebar.getByRole("button", { name: label, exact: true });
      await control.focus();
      await control.press("Escape");
      await expect(title).toBeFocused();
      await title.press("Escape");
      await expect(editor).toBeFocused();
    }
    await title.focus();
    await title.press("Space");
    await expect(title).toHaveAttribute("aria-expanded", "false");
    for (const control of [
      title,
      sidebar.getByRole("button", { name: "More Options", exact: true }),
    ]) {
      await control.focus();
      await control.press("Escape");
      await expect(editor).toBeFocused();
      await expect(title).toHaveAttribute("aria-expanded", "false");
      await expect(
        sidebar.getByRole("button", { name: "Properties", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
    await page.keyboard.insertText("SidebarEscapeProof");
    await expect(editor).toContainText("SidebarEscapeProof");
    await expect(title).toHaveAttribute("aria-expanded", "false");
  });
}
