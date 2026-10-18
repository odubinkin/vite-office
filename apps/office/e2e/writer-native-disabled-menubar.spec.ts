/** @fileoverview Exercises original native disabled menubar selection and actual document history in Chromium. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "Writer native disabled menubar traversal preserves focus and history width=" + width,
    /** Checks real keyboard ownership, disabled states and subsequent native editing. @param fixtures - Browser fixtures. @param fixtures.page - Original browser. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      const editor = page.getByLabel("Writer document body", { exact: true });
      await editor.focus();
      await page.keyboard.press("F10");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowDown");
      const menu = page.getByRole("menu", { name: "Edit menu" }),
        undo = menu.getByRole("menuitem", { name: "Undo", exact: true }),
        redo = menu.getByRole("menuitem", { name: "Redo", exact: true });
      await expect(undo).toBeDisabled();
      await expect(undo).toHaveAttribute("data-popup-highlighted", "true");
      await expect(menu).toBeFocused();
      await expect(menu).toHaveAttribute(
        "aria-activedescendant",
        (await undo.getAttribute("id")) as string,
      );
      await page.keyboard.press("ArrowDown");
      await expect(redo).toHaveAttribute("data-popup-highlighted", "true");
      await expect(undo).not.toHaveAttribute("data-popup-highlighted");
      await expect(menu).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(menu.getByRole("menuitem", { name: "Cut", exact: true })).toBeFocused();
      await page.keyboard.press("Home");
      await expect(undo).toHaveAttribute("data-popup-highlighted", "true");
      await page.keyboard.press("Enter");
      await expect(menu).toHaveCount(0);
      await expect(editor).toBeFocused();
      await expect(editor).toHaveText("");
      await page.keyboard.type("NativeMenus");
      await page.getByRole("menuitem", { name: "Edit", exact: true }).click();
      await page.keyboard.press("Home");
      const activeUndo = page.getByRole("menuitem", { name: "Undo", exact: true });
      await expect(activeUndo).toBeEnabled();
      await expect(activeUndo).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(editor).toBeFocused();
      await expect(editor).toHaveText("");
      await page.keyboard.press("Control+y");
      await expect(editor).toHaveText("NativeMenus");
    },
  );
