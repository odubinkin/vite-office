/** @fileoverview Checks equal, compact insets for Writer command and submenu labels. */
import { expect, test } from "@playwright/test";
import { hoverBrowserMenuItem } from "../test-support/menu-pointer-e2e";

test("menu commands and submenus align their labels", /** Checks rendered label positions and submenu interaction. @param fixtures - Browser fixtures. @returns Nothing. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("menuitem", { name: "Format" }).click();
  const paragraph = page.getByRole("menuitem", { name: "Paragraph…" });
  const lists = page.getByRole("menuitem", { name: "Lists" });
  const commandLabel = await paragraph.locator("span").nth(1).boundingBox();
  const submenuLabel = await lists.locator("span").nth(1).boundingBox();
  const commandX = commandLabel?.x ?? Number.NaN;
  const submenuX = submenuLabel?.x ?? Number.NaN;
  const rowX = (await paragraph.boundingBox())?.x ?? Number.NaN;
  expect(commandX).toBe(submenuX);
  expect(commandX - rowX).toBeLessThanOrEqual(20);
  await hoverBrowserMenuItem(page, lists);
  await expect(page.getByRole("menuitemradio", { name: "No List" })).toBeVisible();
  await hoverBrowserMenuItem(
    page,
    page.getByRole("menubar").getByRole("menuitem", { name: "View", exact: true }),
  );
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
  const checkmark = page
    .getByRole("menuitemcheckbox", { name: "Sidebar" })
    .locator("[data-menu-checkmark]");
  const glyphEnd = await checkmark.evaluate(
    /** Measures the glyph rather than its reserved column. @param element - Checkmark cell. @returns Right edge of the checkmark. */ (
      element,
    ) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().right;
    },
  );
  await expect(checkmark).toHaveText("✓");
  expect(sidebarX - glyphEnd).toBeGreaterThanOrEqual(4);
});
