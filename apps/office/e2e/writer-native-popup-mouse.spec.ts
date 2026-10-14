/** @fileoverview Exercises actual browser auxiliary buttons through original native Writer popup bindings. */
import { expect, test } from "@playwright/test";
for (const width of [1280, 390])
  test(
    "Writer native popup auxiliary mouse buttons width=" + width,
    /** Checks browser-native click/auxclick and actual paragraph dialog result. @param fixtures - Actual browser. @param fixtures.page - Current page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      const editor = page.getByRole("textbox", { name: "Writer document text" });
      await editor.fill("Native browser buttons");
      for (const button of ["middle", "right", "left"] as const) {
        await editor.press("Shift+F10");
        const root = page.getByRole("menu", { name: "Writer context menu" });
        await root.getByRole("menuitem", { name: "Paragraph", exact: true }).click({ button });
        await expect(page.getByRole("menu", { name: "Paragraph menu" })).toBeVisible();
        await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click({ button });
        await expect(root).toHaveCount(0);
        await expect(page.getByRole("dialog", { name: "Paragraph", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
        await expect(editor).toHaveText("Native browser buttons");
      }
    },
  );
