/** @fileoverview Production Calc UI for original Excel extension rules and browser persistence. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("opens and downloads XLSX with live reference-backed conditional fills", /** Exercises the original ranges through the mounted file controls. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf120749.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const first = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  const third = page.getByRole("gridcell", { name: /^A3(?:\s|$)/u });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(first).toHaveCSS("background-color", "rgb(255, 255, 0)");
  await expect(third).toHaveCSS("background-color", "rgb(255, 0, 0)");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(sheet).toContain("<xm:f>LEFT(A1,LEN($B$1))=$B$1</xm:f><xm:f>$B$1</xm:f>");
  expect(sheet).toContain("<xm:sqref>A1</xm:sqref>");

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf120749", exact: true }).click();
  await expect(first).toHaveCSS("background-color", "rgb(255, 255, 0)");
  await expect(third).toHaveCSS("background-color", "rgb(255, 0, 0)");

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "Reopened extended conditions.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(first).toHaveCSS("background-color", "rgb(255, 255, 0)");
  await expect(third).toHaveCSS("background-color", "rgb(255, 0, 0)");
});
