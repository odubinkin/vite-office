/** @fileoverview Checks native root rollover and first-motion admission in the actual shared Writer/Calc menubar. */
import { expect, test } from "@playwright/test";
for (const suite of ["writer", "calc"] as const)
  for (const width of [1280, 390]) {
    test(`${suite} root pointer admission at ${width}px`, /** Checks actual motion,highlight priority,popup reset,clicks and saved editor ownership. @param fixtures - Browser fixtures. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const errors: string[] = [];
      page.on(
        "pageerror",
        /** Records runtime exceptions. @param error - Browser error. @returns Nothing. */ (
          error,
        ) => {
          errors.push(error.message);
        },
      );
      await page.goto(`/${suite}`);
      const editor =
        suite === "writer"
          ? page.getByLabel("Writer document body", { exact: true })
          : page.getByRole("grid");
      await editor.focus();
      const bar = page.getByRole("menubar");
      const file = bar.getByRole("menuitem", { name: "File", exact: true });
      const edit = bar.getByRole("menuitem", { name: "Edit", exact: true });
      await file.hover();
      await expect(file).toHaveAttribute("data-menubar-highlighted", "true");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await file.click();
      const filePopup = page.getByRole("menu", { name: "File menu", exact: true });
      await expect(filePopup).toBeFocused();
      await edit.hover();
      await expect(filePopup).toBeFocused();
      await expect(edit).toHaveAttribute("data-menubar-rollover", "true");
      await expect(edit).not.toHaveAttribute("data-menubar-highlighted");
      await expect(file).toHaveAttribute("data-menubar-highlighted", "true");
      const rect = await edit.boundingBox();
      expect(rect).not.toBeNull();
      await page.mouse.move(
        (rect as NonNullable<typeof rect>).x + 10,
        (rect as NonNullable<typeof rect>).y + 10,
      );
      const editPopup = page.getByRole("menu", { name: "Edit menu", exact: true });
      await expect(editPopup).toBeFocused();
      await expect(filePopup).toHaveCount(0);
      await expect(editPopup.locator("[data-popup-highlighted]")).toHaveCount(0);
      await file.hover();
      await expect(editPopup).toBeFocused();
      await expect(file).not.toHaveAttribute("data-menubar-highlighted");
      const fileRect = await file.boundingBox();
      expect(fileRect).not.toBeNull();
      await page.mouse.move(
        (fileRect as NonNullable<typeof fileRect>).x + 10,
        (fileRect as NonNullable<typeof fileRect>).y + 10,
      );
      await expect(filePopup).toBeFocused();
      await file.click();
      await expect(page.getByRole("menu")).toHaveCount(0);
      await file.click();
      await expect(filePopup).toBeFocused();
      await filePopup.hover();
      await expect(file).not.toHaveAttribute("data-menubar-rollover");
      await expect(file).toHaveAttribute("data-menubar-highlighted", "true");
      await page.keyboard.press("Escape");
      await expect(editor).toBeFocused();
      await expect(page.getByRole("menu")).toHaveCount(0);
      await file.click();
      await file.click();
      await expect(editor).toBeFocused();
      await expect(page.getByRole("menu")).toHaveCount(0);
      await page.keyboard.press("F10");
      await expect(file).toBeFocused();
      await expect(file).toHaveAttribute("data-menubar-highlighted", "true");
      await edit.hover();
      await expect(edit).toHaveAttribute("data-menubar-highlighted", "true");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await page.mouse.move(
        (rect as NonNullable<typeof rect>).x + 10,
        (rect as NonNullable<typeof rect>).y + 10,
      );
      await expect(edit).toHaveAttribute("data-menubar-highlighted", "true");
      await expect(page.getByRole("menu")).toHaveCount(0);
      await page.keyboard.press("Enter");
      await expect(editPopup).toBeVisible();
      await page.screenshot({ path: `output/playwright/task31-menubar-${suite}-${width}.png` });
      await page.keyboard.press("Escape");
      await expect(editor).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
