/** @fileoverview Drives the actual editable style-box popup instead of native select-only test APIs. */
import type { Locator } from "@playwright/test";
/** Picks an original style row by visible name. @param input - Actual style combo. @param name - Native displayed name. @returns Completion. */
export async function pickWriterStyle(input: Locator, name: string): Promise<void> {
  const combo = input.locator("..");
  await combo.getByRole("button", { name: "Show Paragraph style", exact: true }).click();
  await combo.getByRole("option", { name, exact: true }).click();
}
