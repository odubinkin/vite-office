/** @fileoverview Actual Canvas witness for source style-preview color decisions; not a live dropdown or native raster-parity certificate. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
/** Actual runtime exports compiled into the isolated device witness. */
type SourceExports = typeof import("../../src/svx/source/tbxctrls/tbcontrl.stylecolor") &
  typeof import("../../src/vcl/browser/style-preview-device") &
  typeof import("../../src/vcl/source/font/font") &
  typeof import("../../src/tools/inc/color") &
  typeof import("../../src/tools/inc/gen") &
  typeof import("../../src/offapi/com/sun/star/drawing/FillStyle");

test("actual style-preview colors preserve selection, rectangle and automatic-alpha contracts", /** Paints source decisions through real Canvas and samples actual pixels. @param fixtures - Browser page. @param testInfo - Witness artifacts. @returns Completion. */ async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Collects actual browser exceptions. @param error - Exception. @returns Nothing. */ (
      error,
    ) => {
      errors.push(error.message);
    },
  );
  await page.goto("/writer");
  await installKernelFixture(page, "StyleColorPaint", [
    {
      module: "src/svx/source/tbxctrls/tbcontrl.stylecolor.ts",
      names: ["applyStylePreviewColors", "initializeStylePreviewTextColor"],
    },
    { module: "src/vcl/browser/style-preview-device.ts", names: ["BrowserStylePreviewDevice"] },
    { module: "src/vcl/source/font/font.ts", names: ["Font"] },
    { module: "src/tools/inc/color.ts", names: ["Color", "COL_AUTO", "COL_BLACK", "COL_WHITE"] },
    { module: "src/tools/inc/gen.ts", names: ["Rectangle", "Point"] },
    { module: "src/offapi/com/sun/star/drawing/FillStyle.ts", names: ["FillStyle"] },
  ]);
  const result = await page.evaluate(
    /** Exercises explicit actual color/device values, independently of script analysis. @returns Measured pixels and paint state. */ async () => {
      const api = (globalThis as unknown as { StyleColorPaint: SourceExports }).StyleColorPaint;
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 120;
      canvas.setAttribute("aria-label", "Actual source style color device witness");
      canvas.style.cssText =
        "position:fixed;right:8px;bottom:8px;z-index:99999;border:1px solid #999";
      document.body.append(canvas);
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Missing Canvas");
      const ui = new api.Font();
      ui.SetFamilyName("Liberation Sans");
      ui.SetFontHeight(18);
      await document.fonts.load('18px "Liberation Sans"');
      const device = new api.BrowserStylePreviewDevice(context, ui, "#000000", {
        background: api.COL_WHITE,
        fillColor: api.COL_WHITE,
        lineColor: undefined,
      });
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 300, 120);
      api.initializeStylePreviewTextColor(device, false, api.COL_BLACK, api.COL_WHITE);
      api.applyStylePreviewColors(device, new api.Rectangle(0, 0, 299, 39), false, {
        foreground: api.COL_BLACK,
        fillStyle: api.FillStyle.SOLID,
        fillColor: api.COL_BLACK,
      });
      const adjusted = context.fillStyle;
      device.DrawText(new api.Point(8, 5), "Unselected style", 0, 16);
      context.fillStyle = "#0055aa";
      context.fillRect(0, 40, 300, 40);
      api.initializeStylePreviewTextColor(device, true, api.COL_BLACK, api.COL_WHITE);
      api.applyStylePreviewColors(device, new api.Rectangle(0, 40, 299, 79), true, {
        foreground: api.COL_BLACK,
        fillStyle: api.FillStyle.SOLID,
        fillColor: api.COL_BLACK,
      });
      const highlighted = context.fillStyle;
      device.DrawText(new api.Point(8, 45), "Selected style", 0, 14);
      api.initializeStylePreviewTextColor(device, false, api.COL_BLACK, api.COL_WHITE);
      api.applyStylePreviewColors(device, new api.Rectangle(0, 80, 299, 119), false, {
        fillStyle: api.FillStyle.SOLID,
        fillColor: api.COL_WHITE,
      });
      const automatic = context.fillStyle;
      device.DrawText(new api.Point(8, 85), "Automatic foreground", 0, 20);
      const pixels = context.getImageData(0, 0, 300, 120);
      const rgb =
        /** Reads one actual interior pixel. @param x - Pixel x. @param y - Pixel y. @returns RGB bytes. */ (
          x: number,
          y: number,
        ) => Array.from(pixels.data.slice((y * 300 + x) * 4, (y * 300 + x) * 4 + 3));
      let bottomNonWhite = 0;
      for (let y = 80; y < 120; ++y)
        for (let x = 0; x < 300; ++x) {
          const offset = (y * 300 + x) * 4;
          if (
            pixels.data[offset] !== 255 ||
            pixels.data[offset + 1] !== 255 ||
            pixels.data[offset + 2] !== 255
          )
            ++bottomNonWhite;
        }
      return {
        adjusted,
        highlighted,
        automatic,
        backgrounds: [rgb(290, 20), rgb(290, 60), rgb(290, 100)],
        bottomNonWhite,
      };
    },
  );
  expect(result.adjusted).toBe("#1e1e1e");
  expect(result.highlighted).toBe("#ffffff");
  expect(result.automatic).toBe("rgba(0, 0, 0, 0)");
  expect(result.backgrounds).toEqual([
    [0, 0, 0],
    [0, 85, 170],
    [255, 255, 255],
  ]);
  expect(result.bottomNonWhite).toBe(0);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("style-color-device.png") });
});
