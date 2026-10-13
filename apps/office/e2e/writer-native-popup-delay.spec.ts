/** @fileoverview Exercises real Writer popup delay and immediate keyboard activation with native commands. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "Writer native submenu pointer delay and keyboard activation width=" + width,
    /** Checks native placement, selected command and actual dialog result. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      const editor = page.getByRole("textbox", { name: "Writer document text" });
      await editor.fill("Native paragraph");
      await editor.press("Shift+F10");
      const root = page.getByRole("menu", { name: "Writer context menu" }),
        paragraph = root.getByRole("menuitem", { name: "Paragraph", exact: true });
      await paragraph.hover();
      await expect(page.getByRole("menu", { name: "Paragraph menu" })).toBeVisible();
      await expect(page.getByRole("menu", { name: "Paragraph menu" })).toBeFocused();
      await expect(page.getByRole("menu", { name: "Paragraph menu" })).not.toHaveAttribute(
        "aria-activedescendant",
      );
      await page.keyboard.press("Escape");
      await expect(paragraph).toBeFocused();
      await page.keyboard.press("ArrowRight");
      const command = page.getByRole("menuitem", { name: "Paragraph…", exact: true });
      await expect(command).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(root).toHaveCount(0);
      await expect(page.getByRole("dialog", { name: "Paragraph", exact: true })).toBeVisible();
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await expect(editor).toHaveText("Native paragraph");
    },
  );
