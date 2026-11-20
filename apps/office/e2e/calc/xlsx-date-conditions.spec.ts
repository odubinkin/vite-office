/** @fileoverview Real Calc rendering, primary storage and XLSX export of native date conditions. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

/** Reuses the pinned red DXF and changes the rule to the original tomorrow case. @returns Complete workbook bytes. */
async function createDateRuleWorkbook(): Promise<Buffer> {
  const fixture = new URL(
    "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf167019.xlsx",
    import.meta.url,
  );
  const source = await DocumentArchive.open(new Uint8Array(await readFile(fixture)));
  const target = new DocumentArchiveWriter();
  const serial = (Date.UTC(2026, 5, 17) - Date.UTC(1899, 11, 30)) / 86400000;
  for (const part of source.getEntryNames()) {
    if (part === "xl/worksheets/sheet1.xml") {
      const xml = await source.readTextEntry(part);
      const changed = xml
        .replace(/<c r="F4"[^>]*>[\s\S]*?<\/c>/u, `<c r="F4"><v>${serial + 0.75}</v></c>`)
        .replace(
          /<conditionalFormatting sqref="F4 [^"]*">[\s\S]*?<\/conditionalFormatting>/u,
          '<conditionalFormatting sqref="F4"><cfRule type="timePeriod" dxfId="1" priority="4" timePeriod="tomorrow"/></conditionalFormatting>',
        );
      expect(changed).toContain('timePeriod="tomorrow"');
      target.putNextEntry(part, new TextEncoder().encode(changed));
    } else target.putNextEntry(part, await source.readEntry(part));
  }
  return Buffer.from(await target.finish());
}

test("Calc evaluates and round-trips a tomorrow date rule through the existing file UI", /** Verifies the date rule's matching cell, clock changes at repaint and mobile download reopen. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date(2026, 5, 16, 12));
  await page.goto("/calc");
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("gridcell", { name: /^F4(?:\s|$)/u });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await createDateRuleWorkbook(),
    name: "Tomorrow condition.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cell).toHaveCSS("background-color", "rgb(204, 0, 0)");
  await page.clock.setFixedTime(new Date(2026, 5, 17, 12));
  await page.getByRole("gridcell", { name: /^A1(?:\s|$)/u }).click();
  await expect(cell).not.toHaveCSS("background-color", "rgb(204, 0, 0)");
  await page.clock.setFixedTime(new Date(2026, 5, 16, 12));
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Tomorrow condition", exact: true }).click();
  await expect(cell).toHaveCSS("background-color", "rgb(204, 0, 0)");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
    'timePeriod="tomorrow"',
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "Reopened date rule.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Name Box" }).fill("F4");
  await page.getByRole("textbox", { name: "Name Box" }).press("Enter");
  await expect(cell).toHaveCSS("background-color", "rgb(204, 0, 0)");
});
