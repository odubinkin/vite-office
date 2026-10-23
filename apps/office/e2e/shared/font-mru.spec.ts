/** @fileoverview Actual font-history rows, duplicate-row travel and profile persistence in Writer and Calc. */
import { expect, test } from "@playwright/test";
import { FONT_MRU_STORAGE_KEY } from "../../src/svtools/browser/font-mru-store";

for (const app of ["writer", "calc"] as const)
  for (const width of [1280, 390])
    test(`${app} recent font rows width=${width}`, /** Checks production widgets and real page teardown. @param fixtures - Browser page. @param testInfo - Artifact output. @returns Completion. */ async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on(
        "pageerror",
        /** Collects actual browser exceptions. @param error - Exception. @returns Nothing. */ (
          error,
        ) => {
          errors.push(error.message);
        },
      );
      await page.addInitScript(
        /** Seeds only a fresh profile, preserving actual teardown writes on reload. @param key - Profile key. @returns Nothing. */ (
          key,
        ) => {
          if (localStorage.getItem(key) === null)
            localStorage.setItem(key, "Liberation Serif;Liberation Mono\n\n");
        },
        FONT_MRU_STORAGE_KEY,
      );
      await page.goto(`/${app}`);
      const font =
        app === "writer"
          ? page
              .getByRole("toolbar", { name: "Writer formatting toolbar" })
              .getByRole("combobox", { name: "Font name", exact: true })
          : page.getByRole("combobox", { name: "Font Name", exact: true });
      await expect(font).toBeEnabled();
      const toggle = font.locator("..").locator("[data-office-combobox-toggle]");
      await toggle.click();
      const popup = page.locator(`id=${await font.getAttribute("aria-controls")}`);
      const recent = popup.locator("[data-office-combobox-recent-option]");
      await expect(recent).toHaveText(["Liberation Mono", "Liberation Serif"]);
      await font.press("PageUp");
      await expect(font).toHaveAttribute(
        "aria-activedescendant",
        (await recent.nth(0).getAttribute("id")) as string,
      );
      await font.press("ArrowDown");
      await expect(font).toHaveAttribute(
        "aria-activedescendant",
        (await recent.nth(1).getAttribute("id")) as string,
      );
      await font.press("ArrowDown");
      await expect(font).toHaveAttribute(
        "aria-activedescendant",
        (await popup
          .locator("[data-office-combobox-main-option]")
          .first()
          .getAttribute("id")) as string,
      );
      await font.press("Escape");
      await toggle.click();
      await popup.getByRole("option", { name: "Liberation Sans", exact: true }).click();
      await expect(font).toHaveValue("Liberation Sans");
      await toggle.click();
      await expect(recent).toHaveText(["Liberation Sans", "Liberation Mono", "Liberation Serif"]);
      await expect(popup.getByRole("option", { name: "Liberation Sans", exact: true })).toHaveCount(
        2,
      );
      await font.press("PageUp");
      await page.screenshot({ path: testInfo.outputPath("font-history.png"), fullPage: true });
      await font.press("Escape");
      if (app === "calc") {
        await page.reload();
        await expect(font).toBeEnabled();
        await toggle.click();
        await expect(recent).toHaveText(["Liberation Serif", "Liberation Mono", "Liberation Sans"]);
      }
      expect(errors).toEqual([]);
    });
