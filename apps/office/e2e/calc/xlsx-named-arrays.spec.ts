/** @fileoverview Existing Calc file controls replay the pinned named-array workbook. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc opens and downloads the pinned XLSX with a named matrix", /** Checks formula results after browser storage and on mobile reopen. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/named-ranges-global.xlsx",
      import.meta.url,
    ),
  );
  const grid = page.getByRole("grid");
  const activeSheet = page
    .getByRole("tablist", { name: "Sheets" })
    .getByRole("tab", { name: "Sheet2", exact: true });
  const result = grid.getByRole("gridcell", { name: /^A4(?:\s|$)/u });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(result).toHaveText("1");

  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Named arrays copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Named arrays copy", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(result).toHaveText("1");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(buffer));
  expect(await archive.readTextEntry("xl/workbook.xml")).toMatch(
    /<definedName name="Global4"[^>]*>\{1,2,3;4,5,6\}<\/definedName>/u,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Named arrays reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(result).toHaveText("1");
});
