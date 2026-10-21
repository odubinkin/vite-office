/** @fileoverview Built Calc source sheet-tab popup,shared Writer focus/geometry and accessibility. */
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 600 },
]) {
  test(`native sheet context menu at ${viewport.width}x${viewport.height}`, /** Uses actual built controls and the unfiltered axe ruleset. @param root0 - Isolated fixture. @param root0.page - Actual browser page. @returns Completion. */ async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on(
      "pageerror",
      /** Records real application errors. @param error - Browser error. @returns Nothing. */ (
        error,
      ) => {
        errors.push(error.message);
      },
    );
    await page.goto("/calc");
    await page.getByRole("button", { name: "Insert Sheet" }).click();
    await page.getByRole("button", { name: "Insert Sheet" }).click();
    const first = page.getByRole("tab", { name: "Sheet1" }),
      second = page.getByRole("tab", { name: "Sheet2" });
    await first.click({ button: "right" });
    const menu = page.getByRole("menu", { name: "Calc sheet context menu" });
    await expect(menu).toBeFocused();
    await expect(menu.getByRole("menuitem")).toHaveCount(13);
    await expect(menu.getByRole("menuitemcheckbox")).toHaveCount(1);
    await expect(
      menu.getByRole("menuitemcheckbox", { name: "View Grid Lines", exact: true }),
    ).toBeChecked();
    await expect(menu.getByRole("menuitem", { name: "Insert Sheet…" })).toBeDisabled();
    await menu.getByRole("menuitem", { name: "Select All Sheets", exact: true }).click();
    for (const name of ["Sheet1", "Sheet2", "Sheet3"])
      await expect(page.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
    await second.click({ button: "right" });
    await expect(first).toHaveAttribute("aria-current", "page");
    await expect(menu).toBeFocused();
    await expect(menu.getByRole("menuitem", { name: "Tab Color…" })).toBeVisible();
    const bounds = await menu.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds?.x).toBeGreaterThanOrEqual(0);
    expect(bounds?.y).toBeGreaterThanOrEqual(0);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(viewport.width + 1);
    expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(viewport.height + 1);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await menu.press("Escape");
    await expect(second).toBeFocused();
    await second.press("Shift+F10");
    await expect(menu).toBeFocused();
    await menu.getByRole("menuitem", { name: "Deselect All Sheets", exact: true }).click();
    await expect(first).toHaveAttribute("aria-selected", "true");
    await expect(second).toHaveAttribute("aria-selected", "false");
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByRole("tab")).toHaveCount(2);
    expect(errors).toEqual([]);
  });
}
