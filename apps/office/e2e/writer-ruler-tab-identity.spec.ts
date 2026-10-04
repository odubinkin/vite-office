/** @fileoverview Checks a real ruler tab keeps its raw item identity across hidden defaults. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Writer ruler tab identity at width ${width}`, /** Checks accepted moves, cancellation and one undo transition in Chromium. @param fixtures - Browser fixtures. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.focus();
    await page.keyboard.insertText("RulerTabIdentityProof");
    const content = await editor.textContent();
    if (content === null) throw new Error("Writer editing host is missing");
    const surface = page
      .getByRole("toolbar", { name: "Writer horizontal ruler" })
      .locator(":scope > div");
    const box = await surface.boundingBox();
    if (box === null) throw new Error("Ruler surface is missing");
    // 1200 twips follows the pool's stored 1134-twip default tab.
    await page.mouse.move(box.x + 200, box.y + box.height / 2);
    await page.mouse.down();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    const handle = page.getByRole("button", { name: "Tab stop 1", exact: true });
    await expect(handle).toBeVisible();
    const original = await handle.evaluate(
      /** Reads accepted tab geometry. @param element - Marker. @returns Coordinate. */
      (element) => Number.parseFloat(element.style.left),
    );
    const begin =
      /** Drags the actual visible tab by one measured distance. @returns Completion. */ async () => {
        const bounds = await handle.boundingBox();
        if (bounds === null) throw new Error("Tab marker is missing");
        const x = bounds.x + bounds.width / 2,
          y = bounds.y + bounds.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + 20, y, { steps: 3 });
        await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(1);
      };
    await begin();
    await page.mouse.up();
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    expect(
      await handle.evaluate(
        /** Reads the moved explicit tab after model reprojection. @param element - Marker. @returns Coordinate. */
        (element) => Number.parseFloat(element.style.left),
      ),
    ).toBeCloseTo(original + 274 / 15, 3);
    await editor.press("Control+z");
    expect(
      await handle.evaluate(
        /** Reads geometry restored by one Undo. @param element - Marker. @returns Coordinate. */
        (element) => Number.parseFloat(element.style.left),
      ),
    ).toBe(original);
    await expect(editor).toHaveText(content);
    await editor.press("Control+Shift+z");
    expect(
      await handle.evaluate(
        /** Reads the reapplied explicit position. @param element - Marker. @returns Coordinate. */
        (element) => Number.parseFloat(element.style.left),
      ),
    ).toBeCloseTo(original + 274 / 15, 3);
    await begin();
    await page.keyboard.press("Escape");
    await page.mouse.up();
    expect(
      await handle.evaluate(
        /** Reads the unchanged accepted position after cancellation. @param element - Marker. @returns Coordinate. */
        (element) => Number.parseFloat(element.style.left),
      ),
    ).toBeCloseTo(original + 274 / 15, 3);
    await editor.press("Control+z");
    expect(
      await handle.evaluate(
        /** Checks cancellation added no extra history entry. @param element - Marker. @returns Coordinate. */
        (element) => Number.parseFloat(element.style.left),
      ),
    ).toBe(original);
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerTabInputProof");
    await expect(editor).toContainText("RulerTabInputProof");
  });
}
