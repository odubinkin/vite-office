/** @fileoverview Real Calc UI ODS storage and XLSX outline round trip. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc retains sheet outlines across browser storage and XLSX export", /** Opens a pinned workbook, reopens its browser copy and validates the mobile download. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/ods/outline.ods",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "outline", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const download = await finished;
  const path = await download.path();
  if (path === null) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const worksheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(worksheet).toContain('outlineLevelRow="4" outlineLevelCol="4"');
  expect(worksheet).toMatch(
    /<col min="20" max="20"[^>]*hidden="true" outlineLevel="3" collapsed="true"/u,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "outline-reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("outline-reopened", { exact: true })).toBeVisible();
});
