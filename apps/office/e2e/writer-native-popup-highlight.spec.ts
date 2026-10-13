/** @fileoverview Exercises original native popup parent highlight and current timer selection in Chromium. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "Writer native popup current parent highlight width=" + width,
    /** Checks original resource selection and actual dialog command. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      const editor = page.getByRole("textbox", { name: "Writer document text" });
      await editor.fill("Current parent");
      await editor.press("Shift+F10");
      const root = page.getByRole("menu", { name: "Writer context menu" }),
        paragraph = root.getByRole("menuitem", { name: "Paragraph", exact: true }),
        list = root.getByRole("menuitem", { name: "List", exact: true });
      await paragraph.hover();
      const child = page.getByRole("menu", { name: "Paragraph menu" });
      await expect(child).toBeFocused();
      await list.hover();
      await page.keyboard.press("ArrowDown");
      await expect(paragraph).toHaveAttribute("data-popup-highlighted", "true");
      await expect(list).not.toHaveAttribute("data-popup-highlighted");
      await page.waitForTimeout(200);
      await expect(child).toBeVisible();
      await expect(page.getByRole("menu", { name: "List menu" })).toHaveCount(0);
      await expect(page.getByRole("menuitem", { name: "Paragraph…", exact: true })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(root).toHaveCount(0);
      await expect(page.getByRole("dialog", { name: "Paragraph", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(editor).toHaveText("Current parent");
    },
  );
