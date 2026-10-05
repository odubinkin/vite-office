/** @fileoverview Checks actual Chromium cell list-level commands,delta history and ODT persistence without upstream access. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
test("Writer cell list levels use native commands and survive history and ODT reopen", /** Exercises actual product list-level behavior. @param fixtures - Browser fixture. @param fixtures.page - Chromium page. @returns Completion. */ async ({
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
    neighbor = page.getByRole("textbox", { name: "Row 1 column 2 paragraph 1", exact: true }),
    toolbar = page.getByRole("toolbar", { name: "Writer formatting toolbar" });
  await cell.click();
  await page.keyboard.type("NestedCell");
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  await page.getByRole("menuitemradio", { name: "Ordered List", exact: true }).click();
  await expect(toolbar.getByRole("button", { name: "Decrease", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Lists", exact: true }).click();
  const demote = page.getByRole("menuitem", { name: "Demote Outline Level", exact: true });
  await expect(demote).toBeEnabled();
  await demote.click();
  await expect(cell).toHaveAttribute("data-list-level", "1");
  expect(
    await cell.evaluate(
      /** Reads actual list wrapper geometry. @param p - Editable cell. @returns Inline start. */ (
        p,
      ) => p.parentElement?.style.marginInlineStart,
    ),
  ).toBe("36pt");
  await expect(neighbor).toHaveAttribute("data-list-kind", "none");
  await cell.press("Control+z");
  await expect(cell).toHaveAttribute("data-list-level", "0");
  await cell.press("Control+y");
  await expect(cell).toHaveAttribute("data-list-level", "1");
  await toolbar.getByRole("button", { name: "Decrease", exact: true }).click();
  await expect(cell).toHaveAttribute("data-list-level", "0");
  await toolbar.getByRole("button", { name: "Increase", exact: true }).click();
  await expect(cell).toHaveAttribute("data-list-level", "1");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing ODT");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(path),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "cell-level.odt",
  });
  await expect(cell).toHaveText("NestedCell");
  await expect(cell).toHaveAttribute("data-list-level", "1");
  await expect(neighbor).toHaveAttribute("data-list-kind", "none");
});
