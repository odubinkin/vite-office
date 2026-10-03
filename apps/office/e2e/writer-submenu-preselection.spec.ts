/** @fileoverview Verifies pointer popup focus and keyboard preselection in actual Writer menus. */
import { expect, test } from "@playwright/test";

test("pointer submenu owns focus without a selected Writer command", /** Checks actual pointer opening, boundary navigation and no-command dismissal. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  const trigger = page.getByRole("menuitem", { name: "Text", exact: true });
  await trigger.hover();
  const popup = page.getByRole("menu", { name: "Text menu" });
  const first = page.getByRole("menuitemcheckbox", { name: "Bold", exact: true });
  const last = page.getByRole("menuitemcheckbox", { name: "Single Underline", exact: true });
  await expect(popup).toBeFocused();
  await expect(first).not.toBeFocused();
  await expect(first).toHaveAttribute("aria-checked", "false");
  await page.mouse.move(0, 0);
  await expect(popup).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.hover();
  await expect(popup).toBeFocused();
  await popup.press("ArrowUp");
  await expect(last).toBeFocused();
  await last.press("ArrowLeft");
  await expect(trigger).toBeFocused();
  await page.mouse.move(0, 0);
  await trigger.hover();
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
  await page.getByRole("button", { name: "Format", exact: true }).click();
  const trigger = page.getByRole("menuitem", { name: "Text", exact: true });
  await trigger.hover();
  const popup = page.getByRole("menu", { name: "Text menu" });
  await expect(popup).toBeFocused();
  await popup.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("ArrowRight");
  const bold = page.getByRole("menuitemcheckbox", { name: "Bold", exact: true });
  await expect(bold).toBeFocused();
  await bold.press("Enter");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await trigger.focus();
  await trigger.press("Enter");
  await expect(bold).toBeFocused();
  await expect(bold).toHaveAttribute("aria-checked", "true");
});
