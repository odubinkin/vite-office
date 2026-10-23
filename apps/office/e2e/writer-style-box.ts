/** @fileoverview Drives the actual editable style-box popup instead of native select-only test APIs. */
import { pickComboBoxEntry } from "./shared/combo-box";
import type { Locator } from "@playwright/test";
/** Picks an original style row by visible name. @param input - Actual style combo. @param name - Native displayed name. @returns Completion. */
export async function pickWriterStyle(input: Locator, name: string): Promise<void> {
  await pickComboBoxEntry(input, name);
}
