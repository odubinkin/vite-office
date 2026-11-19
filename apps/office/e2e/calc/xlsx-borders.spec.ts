/** @fileoverview Calc themed XLSX borders through the existing Open, ODS storage and download UI. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc retains themed XLSX borders through browser storage and mobile reopen", /** Checks actual grid rendering and the downloaded workbook. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/Test_ThemeColor_Text_Background_Border.xlsx",
      import.meta.url,
    ),
  );
  const upload = page
    .getByRole("tabpanel", { name: "On computer", exact: true })
    .locator('input[type="file"]');
  const cell = page.getByRole("gridcell", { name: /^C1(?:\s|$)/u });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await upload.setInputFiles(fixture);
  await expect(cell).toHaveCSS("border-top-color", "rgb(62, 136, 83)");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page
    .getByRole("button", { name: "Test_ThemeColor_Text_Background_Border", exact: true })
    .click();
  await expect(cell).toHaveCSS("border-top-color", "rgb(62, 136, 83)");

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Chromium did not expose the downloaded workbook.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  expect(await archive.readTextEntry("xl/styles.xml")).toMatch(
    /<top style="[^"]+"><color theme="8"\/><\/top>/u,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await upload.setInputFiles({
    buffer: bytes,
    name: "reopened-themed-borders.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByText("reopened-themed-borders", { exact: true })).toBeVisible();
  await expect(cell).toHaveCSS("border-top-color", "rgb(62, 136, 83)");
});
