/** @fileoverview Production Calc UI for the original quoted SpreadsheetML text rules. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("preserves the original XLSX quoted text conditions through browser storage and export", /** Exercises matching cell styles and the downloaded compatibility formulas. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf166413.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const matching = page.getByRole("gridcell", { name: /^C1(?:\s|$)/u });
  const other = page.getByRole("gridcell", { name: /^B1(?:\s|$)/u });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(matching).toHaveCSS("font-weight", "700");
  await expect(other).toHaveCSS("font-weight", "400");
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf166413", exact: true }).click();
  await expect(matching).toHaveCSS("font-weight", "700");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(sheet).toContain('operator="notContains" text="&quot;ABC&quot;"');

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "Reopened text rules.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(matching).toHaveCSS("font-weight", "700");
  await expect(other).toHaveCSS("font-weight", "400");
});
