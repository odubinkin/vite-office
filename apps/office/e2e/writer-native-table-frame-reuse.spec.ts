/** @fileoverview Exercises repeated native table measurements with real resizing, editing and history. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390])
  test(
    "Writer retained table devices resize and edit width=" + width,
    /** Checks native operations after repeated device samples. @param fixtures - Browser fixtures. @param fixtures.page - Actual browser. @returns Completion. */ async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/writer");
      await page.getByRole("button", { name: "Insert Table", exact: true }).click();
      await page
        .getByLabel("Table size")
        .locator("..")
        .getByRole("button", { name: "More Options" })
        .click();
      await page
        .getByRole("dialog", { name: "Insert Table" })
        .getByRole("button", { name: "Insert", exact: true })
        .click();
      const table = page.locator("[data-writer-table]").first(),
        paragraph = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" });
      await expect(paragraph).toBeVisible();
      await paragraph.click();
      await page.keyboard.type("Alive");
      /** Reads the native first column boundary from actual mounted geometry. @returns Physical rectangle. */
      async function geometry() {
        const rect = await table.locator("tr").first().locator("td,th").first().boundingBox();
        if (rect === null) throw Error("Missing mounted table device");
        return rect;
      }
      await table.locator("tr").first().locator("td,th").first().scrollIntoViewIfNeeded();
      const beforeScroll = await geometry();
      if (beforeScroll.x + beforeScroll.width + 50 > width) {
        await page.mouse.move(
          Math.min(width - 20, beforeScroll.x + 20),
          beforeScroll.y + beforeScroll.height / 2,
        );
        await page.mouse.wheel(150, 0);
        await expect
          .poll(
            /** Waits for native canvas scrolling to expose the measured border. @returns Current cell origin. */ async () =>
              (await geometry()).x,
          )
          .not.toBe(beforeScroll.x);
      }
      const initial = await geometry();
      let expected = initial.width;
      for (const delta of [20, 15]) {
        const rect = await geometry(),
          x = rect.x + rect.width,
          y = rect.y + rect.height / 2;
        for (let sample = 0; sample < 6; sample++) await page.mouse.move(x, y);
        await expect(table).toHaveCSS("cursor", "col-resize");
        await page.mouse.down();
        await page.mouse.move(x + delta, y, { steps: 6 });
        await expect(page.locator("[data-writer-table-column-guide]")).toBeVisible();
        await page.mouse.up();
        expected += delta;
        expect((await geometry()).width).toBeCloseTo(expected, 0);
        await expect(paragraph).toHaveText("Alive");
        await page.keyboard.press("Control+z");
        expect((await geometry()).width).toBeCloseTo(expected - delta, 0);
        await page.keyboard.press("Control+y");
        expect((await geometry()).width).toBeCloseTo(expected, 0);
      }
      await paragraph.click();
      await paragraph.press("End");
      await page.keyboard.type("X");
      await expect(paragraph).toHaveText("AliveX");
      await paragraph.press("Control+z");
      await expect(paragraph).toHaveText("Alive");
      expect((await geometry()).width).toBeCloseTo(expected, 0);
    },
  );
