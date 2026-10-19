/** @fileoverview Exercises original popup pointer admission through the actual shared Writer/Calc menus. */
import { expect, test } from "@playwright/test";
for (const suite of ["writer", "calc"] as const)
  for (const width of [1280, 390]) {
    test(`${suite} popup pointer ownership at ${width}px`, /** Checks actual motion,delayed submenu admission,unselected focus and sibling ownership. @param fixtures - Browser fixtures. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const errors: string[] = [];
      page.on(
        "pageerror",
        /** Records actual browser failures. @param error - Page exception. @returns Nothing. */ (
          error,
        ) => errors.push(error.message),
      );
      await page.goto(`/${suite}`);
      const editor =
        suite === "writer"
          ? page.getByLabel("Writer document body", { exact: true })
          : page.getByRole("grid");
      await editor.focus();
      const bar = page.getByRole("menubar");
      await bar.getByRole("menuitem", { name: "Format", exact: true }).click();
      const trigger = page.getByRole("menuitem", { name: "Text", exact: true });
      await trigger.hover();
      const popup = page.getByRole("menu", { name: "Text menu", exact: true });
      await expect(popup).toHaveCount(0);
      const rect = await trigger.boundingBox();
      expect(rect).not.toBeNull();
      await page.mouse.move(
        (rect as NonNullable<typeof rect>).x + 10,
        (rect as NonNullable<typeof rect>).y + 10,
      );
      await expect(popup).toBeFocused();
      await expect(popup.locator("[data-popup-highlighted]")).toHaveCount(0);
      await expect(trigger).toHaveAttribute("data-popup-highlighted", "true");
      const first = popup.locator('[role^="menuitem"]').first();
      await first.hover();
      const entry = await first.boundingBox();
      expect(entry).not.toBeNull();
      await page.mouse.move(
        (entry as NonNullable<typeof entry>).x + 10,
        (entry as NonNullable<typeof entry>).y + 10,
      );
      await expect(first).toHaveAttribute("data-popup-highlighted", "true");
      if (suite === "calc") await expect(first).toBeDisabled();
      await page.screenshot({ path: `output/playwright/task29-popup-${suite}-${width}.png` });
      await expect(trigger).toHaveAttribute("data-popup-highlighted", "true");
      await page.mouse.move(0, 0);
      await expect(popup).toBeVisible();
      const sibling = page.getByRole("menuitem", {
        name: suite === "writer" ? "Spacing" : "Align Text",
        exact: true,
      });
      await sibling.hover();
      const other = page.getByRole("menu", {
        name: suite === "writer" ? "Spacing menu" : "Align Text menu",
        exact: true,
      });
      await expect(other).toBeFocused();
      await expect(popup).toHaveCount(0);
      await expect(other.locator("[data-popup-highlighted]")).toHaveCount(0);
      await other.press("Escape");
      await expect(sibling).toBeFocused();
      await sibling.press("ArrowRight");
      await expect(other).toBeVisible();
      await expect(other.locator("[data-popup-highlighted]")).toHaveCount(1);
      await page.keyboard.press("Escape");
      await bar.getByRole("menuitem", { name: "Format", exact: true }).click();
      await expect(page.getByRole("menu")).toHaveCount(0);
      expect(errors).toEqual([]);
    });
  }
