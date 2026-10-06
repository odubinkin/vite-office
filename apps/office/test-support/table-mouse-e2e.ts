/** @fileoverview Sends real Chromium table edge mouse selection without model injection. */
import { expect, type Page, type Locator } from "@playwright/test";

/** Exposes the native table edge using actual horizontal canvas scrolling when the fixed ruler covers it. @param page - Browser page. @param element - Original frame. @returns Current physical bounds. */
export async function exposeBrowserTableEdge(
  page: Page,
  element: Locator,
): Promise<{ x: number; y: number; width: number; height: number }> {
  await element.scrollIntoViewIfNeeded();
  for (let attempt = 0; attempt < 4; attempt++) {
    const bounds = await element.boundingBox();
    if (bounds === null) throw new Error("Missing original row frame geometry");
    const exposed = await page.evaluate(
      /** Reads actual native event target, including the fixed ruler occlusion. @param point - Device point. @returns Whether the editing host receives the gesture. */
      (point) =>
        Boolean(document.elementFromPoint(point.x, point.y)?.closest("[data-writer-editing-host]")),
      { x: bounds.x - 7, y: bounds.y + bounds.height / 2 },
    );
    if (exposed) return bounds;
    await page.mouse.move(
      Math.max(40, Math.min((page.viewportSize()?.width ?? 1280) - 15, bounds.x + 20)),
      bounds.y + bounds.height / 2,
    );
    await page.mouse.wheel(bounds.x - 80, 0);
    await expect
      .poll(
        /** Waits for actual platform scroll movement. @returns Current edge. */
        async () => (await element.boundingBox())?.x,
      )
      .not.toBe(bounds.x);
  }
  throw new Error("Native table edge remains covered by the fixed ruler");
}
/** Selects an original row at the source10px table edge. @param page - Real browser page. @param name - Native table name. @param row - One-based original row. @returns Nothing. */
export async function selectBrowserTableRow(page: Page, name: string, row: number): Promise<void> {
  const table = page.getByRole("table", { name, exact: true }).filter({
    has: page.locator(
      `tr[data-writer-table-row="${row - 1}"]:not([data-writer-repeated-headline])`,
    ),
  });
  const element = table.locator(
    `tr[data-writer-table-row="${row - 1}"]:not([data-writer-repeated-headline])`,
  );
  const bounds = await exposeBrowserTableEdge(page, element);
  await page.mouse.click(bounds.x - 7, bounds.y + bounds.height / 2);
}
