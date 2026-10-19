/** @fileoverview Verifies pointer popup focus and keyboard preselection in actual Writer menus. */
import { expect, test, type Locator, type Page } from "@playwright/test";

/** Delivers actual window-relative movement beyond the original first-move guard. @param page - Browser page. @param trigger - Original submenu entry. @returns Completion. */
async function hoverEntry(page: Page, trigger: Locator): Promise<void> {
  const root = page.getByRole("menu", { name: "Format menu", exact: true });
  const rect = await root.boundingBox();
  expect(rect).not.toBeNull();
  await page.mouse.move(
    (rect as NonNullable<typeof rect>).x + (rect as NonNullable<typeof rect>).width / 2,
    (rect as NonNullable<typeof rect>).y + 2,
  );
  await trigger.hover();
  const entry = await trigger.boundingBox();
  expect(entry).not.toBeNull();
  await page.mouse.move(
    (entry as NonNullable<typeof entry>).x + 10,
    (entry as NonNullable<typeof entry>).y + 10,
  );
}

test("pointer submenu owns focus without a selected Writer command", /** Checks actual pointer opening, boundary navigation and no-command dismissal. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  const trigger = page.getByRole("menuitem", { name: "Text", exact: true });
  await hoverEntry(page, trigger);
  const popup = page.getByRole("menu", { name: "Text menu" });
  const first = page.getByRole("menuitemcheckbox", { name: "Bold", exact: true });
  const last = page.getByRole("menuitemcheckbox", { name: "Single Underline", exact: true });
  await expect(popup).toBeFocused();
  await expect(first).not.toBeFocused();
  await expect(first).toHaveAttribute("aria-checked", "false");
  await page.mouse.move(0, 0);
  await expect(popup).toBeVisible();
  await popup.press("ArrowLeft");
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await hoverEntry(page, trigger);
  await expect(popup).toBeFocused();
  await popup.press("ArrowUp");
  await expect(last).toBeFocused();
  await last.press("ArrowLeft");
  await expect(trigger).toBeFocused();
  await page.mouse.move(0, 0);
  await hoverEntry(page, trigger);
  await expect(popup).toBeFocused();
  await popup.press("Enter");
  await expect(popup).toHaveCount(0);
  await expect(page.getByRole("menu", { name: "Format menu" })).toBeVisible();
  await expect(trigger).toBeFocused();
});

test("keyboard opening still preselects and executes one Writer command", /** Checks pointer-to-keyboard reopening and actual formatting state. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  const trigger = page.getByRole("menuitem", { name: "Text", exact: true });
  await hoverEntry(page, trigger);
  const popup = page.getByRole("menu", { name: "Text menu" });
  await expect(popup).toBeFocused();
  await popup.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("ArrowRight");
  const bold = page.getByRole("menuitemcheckbox", { name: "Bold", exact: true });
  await expect(bold).toBeFocused();
  await bold.press("Enter");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await trigger.focus();
  await trigger.press("Enter");
  await expect(bold).toBeFocused();
  await expect(bold).toHaveAttribute("aria-checked", "true");
});
