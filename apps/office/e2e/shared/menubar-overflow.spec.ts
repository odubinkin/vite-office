/** @fileoverview Native hidden-suffix popup reachability through the actual shared Writer/Calc menubar. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
const roots = {
  writer: ["File", "Edit", "View", "Insert", "Format", "Styles", "Table", "Tools"],
  calc: [
    "File",
    "Edit",
    "View",
    "Insert",
    "Format",
    "Styles",
    "Sheet",
    "Data",
    "Tools",
    "Window",
    "Help",
  ],
};
for (const suite of ["writer", "calc"] as const)
  for (const width of [1280, 390]) {
    test(`${suite} top menus remain reachable at ${width}px`, /** Exercises real resources,native suffix nesting and keyboard/focus ownership. @param fixtures - Browser fixture. @param fixtures.page - Actual page. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      const errors: string[] = [];
      page.on(
        "pageerror",
        /** Records actual production failures. @param error - Browser exception. @returns Nothing. */ (
          error,
        ) => errors.push(error.message),
      );
      await page.goto(`/${suite}`);
      const bar = page.getByRole("menubar");
      const editor =
        suite === "writer"
          ? page.getByLabel("Writer document body", { exact: true })
          : page.getByRole("grid");
      await editor.focus();
      await expect(bar.getByRole("menuitem", { name: "File", exact: true })).toBeVisible();
      const more = bar.getByRole("menuitem", { name: "More menus", exact: true });
      if (width === 390) {
        await expect(more).toBeVisible();
        const visible = await bar.locator(":scope > div > button").allTextContents();
        const prefix = roots[suite].filter(
          /** Matches actual visible native roots. @param label - Original label. @returns Visibility. */ (
            label,
          ) => visible.includes(label),
        );
        const hidden = roots[suite].slice(prefix.length);
        expect(hidden.length).toBeGreaterThan(0);
        for (const label of hidden) {
          await more.click();
          const popup = page.getByRole("menu", { name: "More menus menu", exact: true });
          expect(
            await popup.locator(":scope > div > button > span:nth-child(2)").allTextContents(),
          ).toEqual(hidden);
          await popup.getByRole("menuitem", { name: label, exact: true }).click();
          await expect(
            page.getByRole("menu", { name: `${label} menu`, exact: true }),
          ).toBeVisible();
          await more.click();
          await expect(page.getByRole("menu")).toHaveCount(0);
          await expect(more).toHaveAttribute("aria-expanded", "false");
        }
        await page.mouse.move(0, 0);
        await editor.focus();
        await more.press("ArrowDown");
        await page.keyboard.press("End");
        await expect(
          page
            .getByRole("menu", { name: "More menus menu", exact: true })
            .getByRole("menuitem", { name: roots[suite].at(-1) as string, exact: true }),
        ).toBeFocused();
        await page.keyboard.press("ArrowRight");
        await expect(
          page.getByRole("menu", { name: `${roots[suite].at(-1)} menu`, exact: true }),
        ).toBeVisible();
        await page.keyboard.press("Escape");
        await page.keyboard.press("Escape");
        await expect(editor).toBeFocused();
        expect((await more.boundingBox())?.x).toBeLessThan(width - 20);
        expect(
          await page.evaluate(
            /** Reads actual viewport constraint. @returns Document width. */ () =>
              document.documentElement.scrollWidth,
          ),
        ).toBeLessThanOrEqual(width);
        expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
        await page.screenshot({ path: test.info().outputPath(`${suite}-menus-${width}.png`) });
        await more.click();
        await page.setViewportSize({ width: 1280, height: 800 });
        await expect(more).toHaveCount(0);
        await expect(page.getByRole("menu")).toHaveCount(0);
        await expect(editor).toBeFocused();
      } else await expect(more).toHaveCount(0);
      for (const label of roots[suite])
        await expect(bar.getByRole("menuitem", { name: label, exact: true })).toBeVisible();
      expect(errors).toEqual([]);
    });
  }
