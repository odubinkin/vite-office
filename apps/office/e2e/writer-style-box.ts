/** @fileoverview Drives the actual editable style-box popup instead of native select-only test APIs. */
import type { Locator } from "@playwright/test";
/** Picks an original style row by visible name. @param input - Actual style combo. @param name - Native displayed name. @returns Completion. */
export async function pickWriterStyle(input: Locator, name: string): Promise<void> {
  const combo = input.locator("..");
  await combo.getByRole("button", { name: "Show Paragraph style", exact: true }).click();
  // The browser popup is owned through aria-controls and lives outside toolbar clipping.
  const popupId = await input.getAttribute("aria-controls");
  await input.page().locator(`id=${popupId}`).getByRole("option", { name, exact: true }).click();
}
