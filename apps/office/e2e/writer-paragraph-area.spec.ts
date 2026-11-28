/** @fileoverview Verifies native Writer Paragraph Area and Transparency commands in Chromium. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer renders and reopens a translucent paragraph fill", /** Exercises the ordinary menu, two page exchanges, paint and history. @param fixtures - Writer browser fixtures. @param fixtures.page - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const paragraph = page.locator("[data-writer-paragraph-id]").first();
  await paragraph.click();
  const frame = paragraph.locator("../..");
  const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });

  /** Opens the real Format menu and Paragraph dialog. @returns Completion. */
  async function open(): Promise<void> {
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
    await expect(dialog).toBeVisible();
  }

  await open();
  await dialog.getByRole("tab", { name: "Area", exact: true }).click();
  await dialog.getByRole("button", { name: "Color", exact: true }).click();
  await dialog
    .getByRole("group", { name: "Palette colors" })
    .getByRole("button", { name: "Red", exact: true })
    .click();
  await dialog.getByRole("tab", { name: "Transparency", exact: true }).click();
  await dialog.getByRole("radio", { name: "Transparency", exact: true }).check();
  await dialog.getByRole("spinbutton", { name: "Transparency", exact: true }).press("ArrowUp");
  await dialog.getByRole("button", { name: "OK", exact: true }).click();

  await expect(frame).toHaveCSS("background-color", "rgba(255, 0, 0, 0.49)");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(frame).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(frame).toHaveCSS("background-color", "rgba(255, 0, 0, 0.49)");

  await open();
  await dialog.getByRole("tab", { name: "Transparency", exact: true }).click();
  await expect(dialog.getByRole("spinbutton", { name: "Transparency", exact: true })).toHaveValue(
    "51",
  );
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
});
