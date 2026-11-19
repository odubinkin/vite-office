/** @fileoverview Existing Calc file controls retain a non-first active worksheet through primary storage. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc restores the XLSX active sheet when several sheets are visible", /** Exercises local Open, primary ODS, XLSX export and mobile reopen. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/sheet-names.xlsx",
      import.meta.url,
    ),
  );
  const sheets = page.getByRole("tablist", { name: "Sheets" });
  const activeSheet = sheets.getByRole("tab", { name: "C>D", exact: true });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(sheets.getByRole("tab")).toHaveText([
    "S&P",
    "Sam's Club",
    '"The Sheet"',
    "A<B",
    "C>D",
  ]);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await cell.click();
  await page.keyboard.type("42");
  await page.keyboard.press("Enter");
  await expect(cell).toHaveText("42");

  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Active view copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Active view copy", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(cell).toHaveText("42");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(buffer));
  expect(await archive.readTextEntry("xl/workbook.xml")).toContain('<workbookView activeTab="4"/>');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Active view reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(cell).toHaveText("42");
});
