/** @fileoverview Drives actual shared menu controls through native hidden-root and first-pointer-move admission. */
import { expect, type Locator, type Page } from "@playwright/test";
/** Opens an original root through its visible prefix or actual More parent popup. @param page - Production page. @param label - Original root label. @returns Completion. */
export async function openBrowserMenu(page: Page, label: string): Promise<void> {
  const bar = page.getByRole("menubar"),
    entry = bar.getByRole("menuitem", { name: label, exact: true });
  if ((await entry.count()) === 0)
    await bar.getByRole("menuitem", { name: "More menus", exact: true }).click();
  await entry.click();
}
/** Moves twice within the actual original entry,retaining first-move suppression and native admission delay without sleeping or forcing actions. @param page - Production page. @param entry - Original submenu entry. @returns Completion. */
export async function hoverBrowserMenuItem(page: Page, entry: Locator): Promise<void> {
  await entry.hover();
  const box = await entry.boundingBox();
  expect(box).not.toBeNull();
  const bounds = box as NonNullable<typeof box>;
  await page.mouse.move(bounds.x + Math.min(10, bounds.width / 2), bounds.y + bounds.height / 2);
}
