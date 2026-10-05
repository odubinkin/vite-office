/** @fileoverview Checks real Chromium cell alignment, native list labels, history and ODT persistence through the shared paragraph renderer. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
test("Writer cell paragraph alignment and native list display survive history and ODT reopen", /** Checks product commands and actual cell display owners. @param root0 - Fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert Table" }).click();
  await page
    .getByLabel("Table size")
    .locator("..")
    .getByRole("button", { name: "More Options" })
    .click();
  await page
    .getByRole("dialog", { name: "Insert Table" })
    .getByRole("button", { name: "Insert" })
    .click();
  const cell = page.getByRole("textbox", { name: "Row 1 column 1 paragraph 1", exact: true }),
    neighbor = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true });
  await cell.click();
  await page.keyboard.type("ListCell");
  await page
    .getByRole("toolbar", { name: "Writer formatting toolbar" })
    .getByRole("button", { name: "Center", exact: true })
    .click();
  await expect(cell).toHaveCSS("text-align", "center");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
  const id = await cell.getAttribute("data-writer-paragraph-id"),
    marker = page.locator('[data-writer-list-marker="' + id + '"]');
  await expect(marker).toHaveText("1.");
  await expect(cell).toHaveAttribute("data-list-kind", "numbered");
  await expect(cell).toHaveAccessibleDescription(/Paragraph list: Ordered List/);
  await cell.press("Control+z");
  await expect(marker).toHaveCount(0);
  await expect(cell).toHaveCSS("text-align", "center");
  await cell.press("Control+z");
  await expect(cell).toHaveCSS("text-align", "left");
  await cell.press("Control+y");
  await cell.press("Control+y");
  await expect(cell).toHaveCSS("text-align", "center");
  await expect(marker).toHaveText("1.");
  await expect(neighbor).toHaveCSS("text-align", "left");
  await expect(neighbor).toHaveAttribute("data-list-kind", "none");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing downloaded ODT");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "cell-style.odt",
  });
  await expect(cell).toHaveText("ListCell");
  await expect(cell).toHaveCSS("text-align", "center");
  await expect(cell).toHaveAttribute("data-list-kind", "numbered");
  const reopenedId = await cell.getAttribute("data-writer-paragraph-id");
  await expect(page.locator('[data-writer-list-marker="' + reopenedId + '"]')).toHaveText("1.");
  await expect(neighbor).toHaveText("");
});
