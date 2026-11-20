/** @fileoverview Native Excel 1904 date mode through Calc browser storage and download. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

for (const representation of ["serial", "ISO date"] as const)
  test(`Calc preserves the XLSX date system and locale for a ${representation} cell`, /** Checks actual rendered dates and the downloaded workbook on desktop and mobile widths. @param fixtures - Browser test state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
    page,
  }) => {
    const input = fileURLToPath(
      new URL(
        "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf165180_date1904.xlsx",
        import.meta.url,
      ),
    );
    const date = page.getByText("Tuesday, March 1, 1904", { exact: true });
    const upload = page
      .getByRole("tabpanel", { name: "On computer", exact: true })
      .locator('input[type="file"]');
    const name = page.getByRole("textbox", { name: "Name Box", exact: true });
    /** Reveals the date cell after Calc restores the workbook's saved viewport. @returns Completion. */
    async function showDateCell(): Promise<void> {
      await expect(page.getByRole("dialog")).toBeHidden();
      await name.fill("A1");
      await name.press("Enter");
      await expect(date).toBeVisible();
    }
    await page.goto("/calc");
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    if (representation === "serial") await upload.setInputFiles(input);
    else {
      const source = await DocumentArchive.open(new Uint8Array(await readFile(input)));
      const writer = new DocumentArchiveWriter();
      for (const entry of source.getEntryNames()) {
        if (entry === "xl/worksheets/sheet1.xml") {
          const xml = await source.readTextEntry(entry);
          const updated = xml
            .replace(/<c r="A1" s="1">\s*<v>60<\/v>/u, '<c r="A1" s="1" t="d"><v>1904-03-01</v>')
            .replace(
              "</sheetData>",
              '<row r="4"><c r="A4" t="b"><v>TrUe</v></c></row><row r="5"><c r="A5" t="e"><v>#DIV/0!</v></c></row></sheetData>',
            );
          expect(updated).toContain('t="d"><v>1904-03-01</v>');
          writer.putNextEntry(entry, new TextEncoder().encode(updated));
        } else writer.putNextEntry(entry, await source.readEntry(entry));
      }
      await upload.setInputFiles({
        buffer: Buffer.from(await writer.finish()),
        name: "tdf165180_date1904.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }
    await showDateCell();

    await page.reload();
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "In browser" }).click();
    await page.getByRole("button", { name: "tdf165180_date1904", exact: true }).click();
    await showDateCell();
    if (representation === "ISO date") {
      await expect(page.getByText("TRUE", { exact: true })).toBeVisible();
      await expect(page.getByText("#DIV/0!", { exact: true })).toBeVisible();
    }
    const finished = page.waitForEvent("download");
    await page.getByRole("menuitem", { name: "File" }).click();
    await page.getByRole("menuitem", { name: "Export…" }).click();
    await page.getByRole("button", { name: "Download XLSX" }).click();
    const path = await (await finished).path();
    if (path === null) throw new Error("Missing XLSX download.");
    const bytes = await readFile(path);
    const packageFile = await DocumentArchive.open(new Uint8Array(bytes));
    const workbook = await packageFile.readTextEntry("xl/workbook.xml");
    expect(workbook).toContain('<workbookPr date1904="true"/>');
    const sheet = await packageFile.readTextEntry("xl/worksheets/sheet1.xml");
    expect(sheet).toMatch(/<c r="A1"[^>]*><v>60<\/v><\/c>/u);
    if (representation === "ISO date") {
      expect(sheet).toMatch(/<c r="A4"[^>]*t="b"><f>TRUE\(\)<\/f><v>1<\/v><\/c>/u);
      expect(sheet).toMatch(/<c r="A5"[^>]*t="e"><f>#DIV\/0!<\/f><v>#DIV\/0!<\/v><\/c>/u);
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Open", exact: true }).click();
    await page.getByRole("tab", { name: "On computer" }).click();
    await upload.setInputFiles({
      buffer: bytes,
      name: "reopened-1904.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    await expect(page.getByText("reopened-1904", { exact: true })).toBeVisible();
    await showDateCell();
  });
