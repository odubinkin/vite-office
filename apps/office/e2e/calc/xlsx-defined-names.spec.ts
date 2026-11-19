/** @fileoverview Production Calc XLSX named-expression retention through primary ODS storage. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc keeps the scoped Print Titles definition through browser storage", /** Drives file commands against the pinned source fixture. @param fixture - Browser fixtures. @param fixture.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const input = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf115159.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(input);
  await expect(page.getByText("tdf115159", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf115159", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const complete = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await complete).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const xml = await archive.readTextEntry("xl/workbook.xml");
  expect(xml.match(/<definedName\s/gu)).toHaveLength(1);
  expect(xml).toMatch(/name="_xlnm\.Print_Titles" localSheetId="0">Munka1!\$1:\$1<\/definedName>/u);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "reopened-names.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByText("reopened-names", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Calc generates XLSX print titles from an ODS file", /** Imports the pinned ODS with header wrappers and checks the generated XLSX. @param fixture - Browser fixtures. @param fixture.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const input = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf112567.ods",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(input);
  await expect(page.getByText("tdf112567", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const archive = await DocumentArchive.open(new Uint8Array(await readFile(path)));
  const xml = await archive.readTextEntry("xl/workbook.xml");
  expect(xml.match(/<definedName\s/gu)).toHaveLength(1);
  expect(xml).toContain(
    'name="_xlnm.Print_Titles" localSheetId="0">Sheet1!$A:$A,Sheet1!$1:$1</definedName>',
  );
});
