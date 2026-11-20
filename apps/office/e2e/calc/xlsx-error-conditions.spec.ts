/** @fileoverview Production Calc formula-error conditional shading and XLSX file routing. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

/** Preserves the original worksheet palette and installs one native error condition. @returns Loadable workbook. */
async function errorRuleWorkbook(): Promise<Buffer> {
  const fixture = new URL(
    "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf167019.xlsx",
    import.meta.url,
  );
  const source = await DocumentArchive.open(new Uint8Array(await readFile(fixture)));
  const target = new DocumentArchiveWriter();
  for (const part of source.getEntryNames()) {
    if (part !== "xl/worksheets/sheet1.xml")
      target.putNextEntry(part, await source.readEntry(part));
    else {
      const xml = await source.readTextEntry(part);
      const changed = xml
        .replace(/<c r="F4"[^>]*>[\s\S]*?<\/c>/u, '<c r="F4" t="e"><f>1/0</f><v>#DIV/0!</v></c>')
        .replace(
          /<conditionalFormatting sqref="F4 [^"]*">[\s\S]*?<\/conditionalFormatting>/u,
          '<conditionalFormatting sqref="F4"><cfRule type="containsErrors" dxfId="1" priority="4"/></conditionalFormatting>',
        );
      expect(changed).toContain('type="containsErrors"');
      target.putNextEntry(part, new TextEncoder().encode(changed));
    }
  }
  return Buffer.from(await target.finish());
}

test("Calc paints formula errors from XLSX and updates the condition after editing", /** Checks native recalculation, file export and mobile reopen through regular controls. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/calc");
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("gridcell", { name: /^F4(?:\s|$)/u });
  const line = page.getByRole("textbox", { name: "Input line" });
  const name = page.getByRole("textbox", { name: "Name Box" });
  /** Selects the source cell without scrolling its frozen pane. @returns Completion. */
  async function selectFormulaCell(): Promise<void> {
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await name.fill("F4");
    await name.press("Enter");
  }
  const mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByLabel("Browse")
    .setInputFiles({ buffer: await errorRuleWorkbook(), name: "Error condition.xlsx", mimeType });
  await expect(cell).toHaveCSS("background-color", "rgb(204, 0, 0)");

  await selectFormulaCell();
  await line.fill("=7");
  await line.press("Enter");
  await expect(cell).toHaveText("7");
  await expect(cell).not.toHaveCSS("background-color", "rgb(204, 0, 0)");
  await selectFormulaCell();
  await line.fill("=1/0");
  await line.press("Enter");
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
    "<formula>ISERROR(F4)</formula>",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByLabel("Browse")
    .setInputFiles({ buffer: bytes, name: "Reopened error condition.xlsx", mimeType });
  await selectFormulaCell();
  await expect(cell).toHaveCSS("background-color", "rgb(204, 0, 0)");
});
