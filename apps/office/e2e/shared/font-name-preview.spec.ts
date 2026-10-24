/** @fileoverview Production Writer/Calc font-name Canvas rows,actual private file faces,keyboard selection and viewport geometry. */
import { expect, test } from "@playwright/test";
for (const app of ["writer", "calc"])
  for (const width of [1280, 390])
    test(`${app} physical font previews width=${width}`, /** Checks actual application widgets and raster output without a replacement preview UI. @param fixtures - Browser page. @param testInfo - Evidence output. @returns Completion. */ async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on(
        "pageerror",
        /** Records real browser exceptions. @param error - Exception. @returns Nothing. */ (
          error,
        ) => errors.push(error.message),
      );
      await page.goto(`/${app}`);
      const input =
        app === "writer"
          ? page
              .getByRole("toolbar", { name: "Writer formatting toolbar" })
              .getByRole("combobox", { name: "Font name", exact: true })
          : page.getByRole("combobox", { name: "Font Name", exact: true });
      await expect(input).toBeEnabled();
      await input.locator("..").locator("[data-office-combobox-toggle]").click();
      const popup = page.locator(`id=${await input.getAttribute("aria-controls")}`);
      for (const family of [
        "Liberation Serif",
        "Liberation Sans",
        "OpenSymbol",
        "Noto Sans Arabic",
      ]) {
        const row = popup.getByRole("option", { name: family, exact: true }).last();
        const canvas = row.locator("canvas");
        await expect(canvas).toBeAttached();
        expect(
          await canvas.evaluate(
            /** Counts actual nontransparent raster pixels,not inferred glyph support. @param element - Real preview canvas. @returns Raster population. */ (
              element,
            ) => {
              const node = element as HTMLCanvasElement,
                ctx = node.getContext("2d") as CanvasRenderingContext2D,
                data = ctx.getImageData(0, 0, node.width, node.height).data;
              let pixels = 0;
              for (let i = 3; i < data.length; i += 4) if (data[i]) ++pixels;
              return pixels;
            },
          ),
        ).toBeGreaterThan(20);
      }
      const box = await popup.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width + 1);
      await input.press("ArrowDown");
      await expect(input).toBeFocused();
      await page.screenshot({
        path: testInfo.outputPath("font-name-previews.png"),
        fullPage: true,
      });
      await input.press("Escape");
      await input.locator("..").locator("[data-office-combobox-toggle]").click();
      expect(await popup.getByRole("option").count()).toBeGreaterThan(20);
      await expect(popup.getByRole("option", { name: /office-font-preview-/u })).toHaveCount(0);
      expect(errors).toEqual([]);
    });
