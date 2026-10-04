/** @fileoverview Checks existing Writer ruler tracking termination in real Chromium. */
import { expect, test } from "@playwright/test";

for (const width of [1280, 390]) {
  test(`Writer ruler tracking at width ${width}`, /** Checks cancellation, key ownership, accepted history and later editing. @param fixtures - Browser fixtures. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/writer");
    const editor = page.getByLabel("Writer document body", { exact: true });
    await editor.focus();
    await page.keyboard.insertText("RulerTrackingProof");
    const content = await editor.textContent();
    if (content === null) throw new Error("Writer editing host is missing");
    const handle = page.getByRole("button", { name: "Left page margin", exact: true });
    const original = await handle.evaluate(
      /** Reads page-owned CSS geometry. @param element - Ruler handle. @returns Horizontal coordinate. */ (
        element,
      ) => Number.parseFloat(element.style.left),
    );
    const begin =
      /** Starts a measured primary-pointer drag on the existing handle. @returns Completion. */ async () => {
        const box = await handle.boundingBox();
        expect(box).not.toBeNull();
        if (box === null) throw new Error("Ruler handle has no visible geometry");
        const x = box.x + box.width / 2,
          y = box.y + box.height / 2;
        await page.mouse.move(x, y);
        await page.mouse.down({ button: "left" });
        await page.mouse.move(x + 20, y, { steps: 3 });
        await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(1);
        return { x, y };
      };
    await begin();
    await page.keyboard.press("Control+b");
    await page.keyboard.press("Control+z");
    await expect(editor).toHaveText(content);
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    await page.mouse.up();
    await expect(page.getByRole("button", { name: /^Tab stop \d+$/ })).toHaveCount(0);
    expect(
      await handle.evaluate(
        /** Reads final model geometry. @param element - Ruler handle. @returns Coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(original);
    await editor.press("Control+z");
    await expect(editor).not.toContainText("RulerTrackingProof");
    await editor.press("Control+Shift+z");
    await expect(editor).toHaveText(content);

    const position = await begin();
    await page.keyboard.press("Enter");
    await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(0);
    const committed = await handle.evaluate(
      /** Reads the accepted margin. @param element - Ruler handle. @returns Coordinate. */ (
        element,
      ) => Number.parseFloat(element.style.left),
    );
    expect(committed).toBeCloseTo(original + 283 / 15, 3);
    await page.mouse.move(position.x + 60, position.y);
    await page.mouse.up();
    expect(
      await handle.evaluate(
        /** Reads geometry after stale release. @param element - Ruler handle. @returns Coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(committed);
    await editor.press("Control+z");
    expect(
      await handle.evaluate(
        /** Reads restored margin. @param element - Ruler handle. @returns Coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBe(original);
    await expect(editor).toHaveText(content);

    await begin();
    await page.mouse.up();
    expect(
      await handle.evaluate(
        /** Reads pointer-accepted margin. @param element - Ruler handle. @returns Coordinate. */ (
          element,
        ) => Number.parseFloat(element.style.left),
      ),
    ).toBeCloseTo(original + 283 / 15, 3);
    await editor.press("Control+z");

    const surface = page
      .getByRole("toolbar", { name: "Writer horizontal ruler" })
      .locator(":scope > div");
    const startTab =
      /** Begins a new tab at a measured free ruler position. @returns Completion. */ async () => {
        const box = await surface.boundingBox();
        if (box === null) throw new Error("Ruler surface is missing");
        await page.mouse.move(box.x + 200, box.y + box.height / 2);
        await page.mouse.down();
        await expect(page.locator("[data-ruler-new-tab]")).toHaveCount(1);
        await expect(page.locator('[data-ruler-guide="x"]')).toHaveCount(1);
        await expect(page.getByRole("button", { name: /^Tab stop \d+$/ })).toHaveCount(0);
      };
    await startTab();
    await page.keyboard.press("Escape");
    await page.mouse.up();
    await expect(page.locator("[data-ruler-new-tab]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Tab stop \d+$/ })).toHaveCount(0);
    await editor.press("Control+z");
    await expect(editor).not.toContainText("RulerTrackingProof");
    await editor.press("Control+Shift+z");
    await expect(editor).toHaveText(content);
    await startTab();
    await page.keyboard.press("Enter");
    await page.mouse.up();
    await expect(page.locator("[data-ruler-new-tab]")).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^Tab stop \d+$/ })).toHaveCount(1);
    await editor.press("Control+z");
    await expect(page.getByRole("button", { name: /^Tab stop \d+$/ })).toHaveCount(0);
    await expect(editor).toHaveText(content);
    await editor.press("Control+a");
    await page.keyboard.insertText("RulerInputProof");
    await expect(editor).toContainText("RulerInputProof");
  });
}
