/** @fileoverview Checks Writer's generated Default tab markers and their noninteractive hit behavior in Chromium. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Writer default ruler tabs at width ${width}`, /** Checks default glyphs, actual free-surface admission, cancellation and one undo. @param fixtures - Browser fixtures. @param testInfo - Owned screenshot destination. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.focus();
    await page.keyboard.insertText("DefaultRulerProof");
    const paragraph = page.getByRole("textbox", { name: "Writer document text" });
    await expect(paragraph).toHaveText("DefaultRulerProof");
    const toolbar = page.getByRole("toolbar", { name: "Writer horizontal ruler" });
    const defaults = toolbar.locator("[data-ruler-default-tab]");
    await expect(defaults).toHaveCount(7);
    expect(
      await defaults.evaluateAll(
        /** Reads displayed logical offsets independently of product generation. @param markers - Default owners. @returns Ordered offsets. */ (
          markers,
        ) =>
          markers.map(
            /** Reads one Default marker. @param marker - Display-only owner. @returns Twips. */ (
              marker,
            ) => Number(marker.getAttribute("data-ruler-default-tab")),
          ),
      ),
    ).toEqual([1134, 2268, 3402, 4536, 5670, 6804, 7938]);
    expect(
      await defaults.evaluateAll(
        /** Reads the native rounded DPI1 positions. @param markers - Default owners. @returns Pixel positions. */ (
          markers,
        ) =>
          markers.map(
            /** Reads one marker anchor. @param marker - HTMLElement. @returns Inline position. */ (
              marker,
            ) => (marker as HTMLElement).style.left,
          ),
      ),
    ).toEqual(["196px", "271px", "347px", "422px", "498px", "574px", "649px"]);
    await expect(defaults.first()).toHaveAttribute("aria-hidden", "true");
    await expect(defaults.first()).toHaveCSS("pointer-events", "none");
    await expect(toolbar.getByRole("button", { name: /^Tab stop/ })).toHaveCount(0);
    expect(
      await defaults
        .first()
        .locator("rect")
        .evaluateAll(
          /** Reads the Default glyph's two rectangles. @param rects - SVG rectangles. @returns Primitive shape. */ (
            rects,
          ) =>
            rects.map(
              /** Projects a rendered rectangle. @param rect - SVG element. @returns Coordinates. */ (
                rect,
              ) =>
                ["x", "y", "width", "height"].map(
                  /** Reads one shape value. @param name - Attribute name. @returns Numeric value. */ (
                    name,
                  ) => Number(rect.getAttribute(name)),
                ),
            ),
        ),
    ).toEqual([
      [-2, 0, 5, 1],
      [0, -3, 1, 4],
    ]);
    await toolbar.screenshot({ path: testInfo.outputPath("default-tab-glyphs.png"), scale: "css" });
    const box = await defaults.first().locator("svg").boundingBox();
    if (box === null) throw new Error("Default tab glyph is missing");
    const point = { x: box.x + 6, y: box.y + 5 };
    expect(
      await page.evaluate(
        /** Confirms a painted Default has no editing hit target. @param point - Glyph pixel. @returns Whether the free ruler surface owns input. */ (
          point,
        ) =>
          document.elementFromPoint(point.x, point.y) ===
          document.querySelector('[aria-label="Writer horizontal ruler"] > div'),
        point,
      ),
    ).toBe(true);
    await page.mouse.move(point.x, point.y);
    await page.mouse.down();
    await expect(toolbar.locator('[data-ruler-new-tab="true"]')).toHaveCount(1);
    await expect(defaults).toHaveCount(7);
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(toolbar.getByRole("button", { name: /^Tab stop/ })).toHaveCount(0);
    await expect(defaults).toHaveCount(7);
    await page.mouse.down();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    const handle = toolbar.getByRole("button", { name: "Tab stop 1", exact: true });
    await expect(handle).toBeVisible();
    expect(
      await handle.evaluate(
        /** Reads the accepted click converted back to twips and projected to pixels. @param marker - Explicit tab. @returns Anchor. */ (
          marker,
        ) => Number.parseFloat(marker.style.left),
      ),
    ).toBe(196);
    await expect(defaults).toHaveCount(6);
    await expect(defaults.first()).toHaveAttribute("data-ruler-default-tab", "2268");
    await editor.press("Control+z");
    await expect(handle).toHaveCount(0);
    await expect(defaults).toHaveCount(7);
    await expect(defaults.first()).toHaveAttribute("data-ruler-default-tab", "1134");
    await expect(paragraph).toHaveText("DefaultRulerProof");
    await editor.press("Control+Shift+z");
    await expect(handle).toBeVisible();
    await expect(defaults).toHaveCount(6);
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await editor.press("Control+a");
    await page.keyboard.insertText("DefaultRulerInputProof");
    await expect(editor).toContainText("DefaultRulerInputProof");
  });
}
