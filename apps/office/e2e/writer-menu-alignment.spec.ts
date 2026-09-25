/** @fileoverview Checks equal, compact insets for Writer command and submenu labels. */
import { expect, test } from "@playwright/test";

test("menu commands and submenus align their labels", /** Checks rendered label positions and submenu interaction. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Format" }).click();
  const paragraph = page.getByRole("menuitem", { name: "Paragraph…" });
  const lists = page.getByRole("menuitem", { name: "Lists" });
  const commandLabel = await paragraph.locator("span").nth(1).boundingBox();
  const submenuLabel = await lists.locator("span").nth(1).boundingBox();
  const commandX = commandLabel?.x ?? Number.NaN;
  const submenuX = submenuLabel?.x ?? Number.NaN;
  const rowX = (await paragraph.boundingBox())?.x ?? Number.NaN;
  expect(commandX).toBe(submenuX);
  expect(commandX - rowX).toBeLessThanOrEqual(20);
  await lists.hover();
  await expect(page.getByRole("menuitemradio", { name: "No List" })).toBeVisible();
  await page.getByRole("button", { name: "View" }).hover();
  const sidebarX =
    (
      await page
        .getByRole("menuitemcheckbox", { name: "Sidebar" })
        .locator("span")
        .nth(1)
        .boundingBox()
    )?.x ?? Number.NaN;
  const rulersX =
    (await page.getByRole("menuitem", { name: "Rulers" }).locator("span").nth(1).boundingBox())
      ?.x ?? Number.NaN;
  expect(sidebarX).toBe(rulersX);
});
