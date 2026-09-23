/** @fileoverview Verifies that the Writer sidebar command matches the reachable narrow-screen panel. */

import { expect, test } from "@playwright/test";

test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

test("sidebar remains reachable and its checked state follows visibility on a touch viewport", /** Runs the focused test callback. @param argument1 - Input for this operation. @returns Operation result. */ async ({
  page,
}): Promise<void> => {
  await page.goto("/writer");

  const sidebar = page.getByRole("complementary", { name: "Writer properties sidebar" });
  await expect(sidebar).toBeVisible();
  await expect(sidebar.getByRole("heading", { name: "Paragraph" })).toBeVisible();

  await page.getByRole("button", { name: "View" }).click();
  const toggle = page.getByRole("menuitemcheckbox", { name: "Sidebar" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");
  await toggle.click();
  await expect(sidebar).toHaveCount(0);

  await page.getByRole("button", { name: "View" }).click();
  await expect(page.getByRole("menuitemcheckbox", { name: "Sidebar" })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.getByRole("menuitemcheckbox", { name: "Sidebar" }).click();
  await expect(sidebar).toBeVisible();
  await sidebar.getByRole("button", { name: "Start" }).focus();
  await expect(sidebar.getByRole("button", { name: "Start" })).toBeFocused();
});
