/** @fileoverview Verifies the ordinary Writer Paragraph Borders command and native item history. */
import { expect, test } from "@playwright/test";
import { openBrowserMenu } from "../test-support/menu-pointer-e2e";

test("Writer applies real paragraph borders and reopens their controls", /** Ports the upstream Paragraph Borders interaction to the browser command. @param fixtures - Writer browser fixtures. @param fixtures.page - Browser page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  const paragraph = page.locator("[data-writer-paragraph-id]").first();
  await paragraph.click();
  const dialog = page.getByRole("dialog", { name: "Paragraph", exact: true });
  /** Opens the real format menu and paragraph border tab. @returns Completion. */
  async function open(): Promise<void> {
    await openBrowserMenu(page, "Format");
    await page.getByRole("menuitem", { name: "Paragraph…", exact: true }).click();
    await dialog.getByRole("tab", { name: "Borders", exact: true }).click();
  }
  await open();
  await dialog.getByRole("button", { name: "All Four Borders", exact: true }).click();
  await dialog.getByRole("checkbox", { name: "Synchronize", exact: true }).uncheck();
  const left = dialog.getByRole("spinbutton", { name: /^Left padding/u });
  await left.fill("0.2 in");
  await left.blur();
  const merge = dialog.getByRole("checkbox", { name: "Merge with next paragraph", exact: true });
  await merge.uncheck();
  await dialog.getByRole("button", { name: "OK", exact: true }).click();
  const paragraphFrame = paragraph.locator("../..");
  await expect(paragraphFrame).not.toHaveCSS("border-left-width", "0px");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(paragraphFrame).toHaveCSS("border-left-width", "0px");
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(paragraphFrame).not.toHaveCSS("border-left-width", "0px");
  await open();
  await expect(left).toHaveValue(/0[.,]20/u);
  await expect(merge).not.toBeChecked();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(paragraphFrame).not.toHaveCSS("border-left-width", "0px");
});
