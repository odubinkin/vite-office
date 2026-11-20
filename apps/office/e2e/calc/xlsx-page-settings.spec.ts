/** @fileoverview Actual Calc file controls retain native page styles across primary ODS and XLSX. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc keeps XLSX print geometry through browser storage and a mobile reopen", /** Opens the pinned page setup regression and verifies the actual downloaded XLSX. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf136721_letter_sized_paper.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(cell).toHaveText("Start");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Print layout copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Print layout copy", exact: true }).click();
  await expect(cell).toHaveText("Start");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing page setup download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  const xml = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(xml).toMatch(/<pageSetup[^>]*paperSize="70"[^>]*orientation="landscape"/u);
  expect(xml).toContain('<printOptions headings="true" gridLines="true"');
  expect(xml).toMatch(/<pageMargins[^>]*left="0\.1965[^"]*"[^>]*\/>/u);
  expect(xml).toContain("<oddHeader>&amp;L&amp;18Left&amp;R&amp;18Right</oddHeader>");
  expect(xml).toContain("<oddFooter>&amp;LLeft&amp;RRight</oddFooter>");

  await page.setViewportSize({ width: 430, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Print layout reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Name Box" })).toHaveValue("G9");
  await expect(page.getByRole("gridcell", { name: /^G9(?:\s|$)/u })).toHaveText("End");
});
