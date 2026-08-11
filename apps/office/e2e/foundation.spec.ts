/**
 * @fileoverview Exercises the built foundation workbench in Chromium and checks its accessibility tree with axe.
 */

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("loads the Writer structural workspace and supports keyboard-visible suite selection" /**
 * Verifies the production bundle, targetable Writer chrome, accessible editing, keyboard suite selection, and configured axe rules.
 *
 * @param root0 - Playwright fixture object provided for the isolated test.
 * @param root0.page - Isolated Chromium page used for navigation and accessibility assertions.
 * @returns A promise that resolves after all browser and accessibility assertions pass.
 */, async function verifyStaticFoundation({ page }): Promise<void> {
  await page.goto("/");

  await expect(page.getByRole("region", { name: "Writer workspace" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Writer menu bar" })).toBeVisible();
  await expect(page.getByRole("toolbar", { name: "Writer standard toolbar" })).toBeVisible();
  await expect(page.getByRole("toolbar", { name: "Writer formatting toolbar" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
  await expect(page.getByRole("article", { name: "Writer document body" })).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Writer properties sidebar" }),
  ).toBeVisible();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toBeVisible();
  const writerEditor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(writerEditor).toBeVisible();
  await expect(writerEditor).toHaveAttribute("contenteditable", "true");
  await writerEditor.fill("A browser-authored paragraph.");
  await expect(page.getByRole("button", { name: "Undo" })).toBeEnabled();
  await page.getByRole("button", { name: "Styles" }).click();
  await page.getByRole("menuitem", { name: "Heading 1" }).click();
  await expect(writerEditor).toHaveCSS("font-size", "24px");
  await expect(writerEditor).toHaveCSS("font-weight", "700");
  await expect(
    page.getByRole("complementary", { name: "Writer properties sidebar" }),
  ).toContainText("Heading 1");
  await page.getByRole("button", { name: "Format" }).click();
  await page.getByRole("menuitem", { name: "Align center" }).click();
  await expect(writerEditor).toHaveCSS("text-align", "center");
  await expect(page.getByRole("button", { name: "Align center" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("Centered")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add paragraph" })).toHaveCount(0);
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Undo" }).click();
  await expect(writerEditor).toHaveCSS("text-align", "left");

  const calcButton = page.getByRole("button", { name: "Calc, Foundation only" });
  await calcButton.focus();
  await expect(calcButton).toBeFocused();
  await calcButton.press("Enter");
  await expect(page.getByRole("heading", { name: "Browser workbench foundation" })).toBeVisible();
  await expect(page.getByText("Calc: Foundation only")).toBeVisible();
  await expect(writerEditor).toBeHidden();
  await expect(page.getByText("No editor features enabled")).toBeVisible();

  const accessibilityResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityResults.violations).toEqual([]);
});
