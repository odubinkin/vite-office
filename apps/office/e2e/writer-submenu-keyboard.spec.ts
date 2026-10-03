/** @fileoverview Verifies single keyboard activation of the existing Writer ruler submenu. */
import { expect, test } from "@playwright/test";

for (const key of ["Enter", "Space"]) {
  test(`nested Writer ruler toggles once with ${key}`, /** Checks actual Writer state after nested keyboard activation. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.goto("/writer");
    await expect(page.getByLabel("Writer horizontal ruler")).toBeVisible();
    await page.getByRole("button", { name: "View", exact: true }).click();
    const submenu = page.getByRole("menuitem", { name: "Rulers", exact: true });
    await submenu.focus();
    await submenu.press("ArrowRight");
    const command = page.getByRole("menuitemcheckbox", { name: "Rulers", exact: true });
    await expect(command).toHaveAttribute("aria-checked", "true");
    await command.focus();
    await command.press(key);
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByLabel("Writer horizontal ruler")).toHaveCount(0);
    await page.getByRole("button", { name: "View", exact: true }).click();
    await submenu.focus();
    await submenu.press("ArrowRight");
    await expect(command).toHaveAttribute("aria-checked", "false");
    await command.focus();
    await command.press(key);
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByLabel("Writer horizontal ruler")).toBeVisible();
  });
}
