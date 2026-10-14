/** @fileoverview Verifies real native disabled popup navigation without importing pinned reference implementations. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "Writer native disabled popup entries remain selected without executing width=" + width,
    /** Checks real menu focus, native disabled state and Return cancellation. @param fixtures - Browser fixtures. @param fixtures.page - Actual page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      const editor = page.getByRole("textbox", { name: "Writer document text" });
      await editor.fill("Native plain text");
      await editor.press("Shift+F10");
      const menu = page.getByRole("menu", { name: "Writer context menu" }),
        remove = menu.getByRole("menuitem", { name: "Remove Hyperlink", exact: true }),
        edit = menu.getByRole("menuitem", { name: "Edit Hyperlink…", exact: true });
      await expect(remove).toBeDisabled();
      await expect(edit).toBeDisabled();
      await page.keyboard.press("End");
      await expect(menu.getByRole("menuitem", { name: "Page Style…", exact: true })).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expect(remove).toHaveAttribute("data-popup-highlighted", "true");
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute(
        "aria-activedescendant",
        (await remove.getAttribute("id")) as string,
      );
      await page.keyboard.press("ArrowUp");
      await expect(edit).toHaveAttribute("data-popup-highlighted", "true");
      await expect(remove).not.toHaveAttribute("data-popup-highlighted");
      await page.keyboard.press("Enter");
      await expect(menu).toHaveCount(0);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveText("Native plain text");
      await expect(page.getByRole("dialog", { name: "Hyperlink" })).toHaveCount(0);
    },
  );
