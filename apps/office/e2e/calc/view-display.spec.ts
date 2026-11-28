/** @fileoverview Calc display options through the actual grid and Options dialog. */
import { expect, test } from "@playwright/test";

test("colors the actual formula and paints one hint marker at the merged cell edge", /** Exercises native View and Options menu commands in Chromium. @param fixtures - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  const input = page.getByRole("textbox", { name: "Input line", exact: true });
  await input.fill("=1+2");
  await page.getByRole("button", { name: "Accept input", exact: true }).click();
  const cell = page.getByRole("gridcell", { name: "A1 3", exact: true });
  const marker = cell.locator("[data-calc-formula-mark]");
  await expect(marker).toHaveCount(0);

  await page.getByRole("menuitem", { name: "View", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "Value Highlighting", exact: true }).click();
  await expect(cell).toHaveCSS("color", "rgb(0, 128, 0)");

  const name = page.getByRole("textbox", { name: "Name Box", exact: true });
  await name.fill("A1:B2");
  await name.press("Enter");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Merge and Unmerge Cells", exact: true }).click();
  await page.getByRole("menuitem", { name: "Merge Cells", exact: true }).click();
  await expect(cell).toHaveAttribute("aria-rowspan", "2");
  await expect(cell).toHaveAttribute("aria-colspan", "2");

  await page.getByRole("menuitem", { name: "Tools", exact: true }).click();
  await page.getByRole("menuitem", { name: /^Options/ }).click();
  const dialog = page.getByRole("dialog", { name: "Options" });
  await dialog.getByRole("treeitem", { name: "View", exact: true }).click();
  await expect(dialog.getByRole("checkbox", { name: "Value highlighting" })).toBeChecked();
  await dialog.getByRole("checkbox", { name: "Formula indicator and hint" }).check();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();

  await expect(page.locator("[data-calc-formula-mark]")).toHaveCount(1);
  await expect(marker).toBeVisible();
  await expect(cell).toHaveAttribute("title", "=1+2");
  await expect(marker).toHaveCSS("bottom", "2px");
  await expect(marker).toHaveCSS("left", "0px");
});
