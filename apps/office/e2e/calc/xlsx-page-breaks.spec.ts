/** @fileoverview Calc XLSX manual page breaks through the production file UI and primary storage. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

/** Builds a small input with row and column breaks outside the used cell area. @returns Complete XLSX. */
async function inputFile(): Promise<Buffer> {
  const archive = new DocumentArchiveWriter();
  const sheet = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const officeRel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const packageRel = "http://schemas.openxmlformats.org/package/2006/relationships";
  const entries = {
    "[Content_Types].xml":
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels": `<Relationships xmlns="${packageRel}"><Relationship Id="rId1" Type="${officeRel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    "xl/workbook.xml": `<workbook xmlns="${sheet}" xmlns:r="${officeRel}"><sheets><sheet name="Breaks" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<Relationships xmlns="${packageRel}"><Relationship Id="rId1" Type="${officeRel}/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
    "xl/worksheets/sheet1.xml": `<worksheet xmlns="${sheet}"><sheetData><row r="1"><c r="A1"><v>42</v></c></row></sheetData><rowBreaks count="1" manualBreakCount="1"><brk id="20" min="0" max="16383" man="1"/></rowBreaks><colBreaks count="1" manualBreakCount="1"><brk id="7" min="0" max="1048575" man="true"/></colBreaks></worksheet>`,
  };
  const encoder = new TextEncoder();
  for (const [name, content] of Object.entries(entries))
    archive.putNextEntry(name, encoder.encode(content));
  return Buffer.from(await archive.finish());
}

test("Calc retains XLSX manual page breaks across browser storage and download", /** Exercises both file dialog paths and opens the resulting download at mobile width. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "page-breaks.xlsx",
    mimeType,
    buffer: await inputFile(),
  });
  await expect(page.getByText("page-breaks", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "page-breaks", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await finished).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const worksheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(worksheet).toContain(
    '<rowBreaks count="1" manualBreakCount="1"><brk id="20" man="true" max="16383" min="0"/></rowBreaks>',
  );
  expect(worksheet).toContain(
    '<colBreaks count="1" manualBreakCount="1"><brk id="7" man="true" max="65535" min="0"/></colBreaks>',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "page-breaks-reopened.xlsx",
    mimeType,
    buffer: bytes,
  });
  await expect(page.getByText("page-breaks-reopened", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
