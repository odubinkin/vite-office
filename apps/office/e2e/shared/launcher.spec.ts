/** @fileoverview Checks shared launcher routing and accessibility independently of Writer editing. */

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("shared launcher routes to the Calc foundation without a Writer session", /** Checks launcher and unimplemented-module chrome. @param fixtures - Browser fixtures. @param fixtures.page - Isolated page. @returns Completion of routing and accessibility assertions. */ async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Office applications" })).toBeVisible();
  await expect(page.locator("#workspace")).toHaveCount(0);
  const link = page.getByRole("link", { name: "Calc, Foundation only" });
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(/\/calc$/u);
  await expect(page.getByText("Calc: Foundation only")).toBeVisible();
  await expect(page.getByRole("region", { name: "Writer workspace" })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

test("shared launcher handles unknown application routes", /** Checks the fallback route. @param fixtures - Browser fixtures. @param fixtures.page - Isolated page. @returns Completion of fallback assertions. */ async ({
  page,
}) => {
  await page.goto("/unknown-app");
  await expect(page.getByRole("navigation", { name: "Office applications" })).toBeVisible();
  await expect(page.locator("#workspace")).toHaveCount(0);
});
