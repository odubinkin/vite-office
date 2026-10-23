/** @fileoverview Drives actual editable browser ComboBox popup ownership through aria-controls. */
import type { Locator } from "@playwright/test";
/** Picks an actual available row without native HTML select APIs or toolbar containment assumptions. @param input - Actual editable combo. @param name - Exact accessible row name. @returns Completion. */
export async function pickComboBoxEntry(input: Locator, name: string): Promise<void> {
  await input.locator("..").locator("[data-office-combobox-toggle]").click();
  const popupId = await input.getAttribute("aria-controls");
  await input.page().locator(`id=${popupId}`).getByRole("option", { name, exact: true }).click();
}
