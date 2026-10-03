/** @fileoverview Verifies root focus and first-entry opening with actual Writer commands. */
import { expect, test } from "@playwright/test";

test("pointer root popup owns focus and passes keyboard input to its first command", /** Verifies pointer-to-keyboard handoff and one Status Bar toggle. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const view = page.getByRole("button", { name: "View", exact: true });
  await view.click();
  const popup = page.getByRole("menu", { name: "View menu" });
  const first = page.getByRole("menuitemcheckbox", { name: "Status Bar", exact: true });
  await expect(popup).toBeFocused();
  await expect(first).not.toBeFocused();
  await popup.press("ArrowDown");
  await expect(first).toBeFocused();
  await first.press("Enter");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByRole("status", { name: "Writer status bar" })).toHaveCount(0);
  await view.click();
  await expect(first).toHaveAttribute("aria-checked", "false");
});

for (const key of ["ArrowDown", "ArrowUp", "Enter", "Space"]) {
  test(`root ${key} selects the first Writer command and executes one toggle`, /** Verifies browser key defaults cannot turn keyboard opening into pointer opening. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
    page,
  }) => {
    await page.goto("/writer");
    const view = page.getByRole("button", { name: "View", exact: true });
    await view.focus();
    await view.press(key);
    const first = page.getByRole("menuitemcheckbox", { name: "Status Bar", exact: true });
    await expect(first).toBeFocused();
    await first.press("Enter");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(page.getByRole("status", { name: "Writer status bar" })).toHaveCount(0);
    await view.focus();
    await view.press("Enter");
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("aria-checked", "false");
  });
}
