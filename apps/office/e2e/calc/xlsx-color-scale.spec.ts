/** @fileoverview Calc paints original XLSX color scales through primary storage and download. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("paints and reopens the original XLSX color scale", /** Checks the native rule in Chromium after import, saved-copy reopen and XLSX export. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf155321.xlsx",
      import.meta.url,
    ),
  );
  const green = page.getByRole("gridcell", { name: /^B1(?:\s|$)/u });
  const red = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  const open = page.getByRole("button", { name: "Open", exact: true });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(green).toHaveCSS("background-color", "rgb(99, 190, 123)");
  await expect(red).toHaveCSS("background-color", "rgb(248, 105, 107)");
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf155321", exact: true }).click();
  await expect(green).toHaveCSS("background-color", "rgb(99, 190, 123)");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(xml).toContain('<cfvo type="percentile" val="50"');
  expect(xml).toContain('<color rgb="FF63BE7B"');

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "Reopened scale.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(green).toHaveCSS("background-color", "rgb(99, 190, 123)");
});
