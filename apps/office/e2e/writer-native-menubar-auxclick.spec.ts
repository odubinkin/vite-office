/** @fileoverview Exercises actual browser middle/right menubar clicks, disabled protection and Writer document history. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  for (const button of ["middle", "right"] as const)
    test(
      "Writer native auxiliary menubar history width=" + width + " button=" + button,
      /** Checks real browser click completion and original native undo. @param fixtures - Browser fixtures. @param fixtures.page - Original browser. @returns Completion. */ async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto("/writer");
        const editor = page.getByLabel("Writer document body", { exact: true }),
          edit = page.getByRole("menuitem", { name: "Edit", exact: true });
        await editor.focus();
        await edit.click({ button });
        const menu = page.getByRole("menu", { name: "Edit menu" }),
          undo = menu.getByRole("menuitem", { name: "Undo", exact: true });
        await expect(menu).toBeVisible();
        await expect(undo).toBeDisabled();
        const bounds = await undo.boundingBox();
        if (!bounds) throw Error("Missing original disabled Undo geometry");
        await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, {
          button,
        });
        await expect(menu).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(editor).toBeFocused();
        await page.keyboard.type("AuxMenus");
        await edit.click({ button });
        await expect(undo).toBeEnabled();
        await undo.click({ button });
        await expect(menu).toHaveCount(0);
        await expect(editor).toBeFocused();
        await expect(editor).toHaveText("");
        await page.keyboard.press("Control+y");
        await expect(editor).toHaveText("AuxMenus");
      },
    );
