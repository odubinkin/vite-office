/** @fileoverview XLSX tab colors through the production Calc file and tab controls. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../../src/package/source/zippackage/document-archive";

test("Calc keeps worksheet colors across XLSX, browser storage and a mobile reopen", /** Checks real color and selection painting, ODS persistence and the downloaded XLSX. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/sheet-tab-color.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  const open = page.getByRole("button", { name: "Open", exact: true });
  const tabs = page.getByRole("tablist", { name: "Sheets" });
  const green = tabs.getByRole("tab", { name: "Green", exact: true });
  const red = tabs.getByRole("tab", { name: "Red", exact: true });
  const yellow = tabs.getByRole("tab", { name: "Yellow", exact: true });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(green).toHaveAttribute("aria-current", "page");
  await expect(green).toHaveCSS("box-shadow", /rgb\(0, 176, 80\).*inset/u);
  await expect(red).toHaveCSS("background-color", "rgb(255, 0, 0)");
  await expect(red).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(yellow).toHaveCSS("color", "rgb(0, 0, 0)");

  await red.click();
  await expect(red).toHaveCSS("box-shadow", /rgb\(255, 0, 0\).*inset/u);
  await expect(green).toHaveCSS("background-color", "rgb(0, 176, 80)");
  await page.emulateMedia({ forcedColors: "active" });
  await expect(red).toHaveCSS("box-shadow", "none");
  await page.emulateMedia({ forcedColors: "none" });

  await yellow.click({ button: "right" });
  await page.getByRole("menuitem", { name: "Tab Color…" }).click();
  const colors = page.getByRole("dialog", { name: "Tab Color" });
  await colors.getByRole("radio", { name: "#2a6099", exact: true }).first().click();
  await colors.getByRole("button", { name: "OK" }).click();
  await expect(yellow).toHaveCSS("box-shadow", /rgb\(42, 96, 153\).*inset/u);
  await red.click();

  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await cell.click();
  await page.keyboard.type("42");
  await page.keyboard.press("Enter");
  await expect(cell).toHaveText("42");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Colored sheets copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Colored sheets copy", exact: true }).click();
  await expect(red).toHaveAttribute("aria-current", "page");
  await expect(red).toHaveCSS("box-shadow", /rgb\(255, 0, 0\).*inset/u);
  await expect(yellow).toHaveCSS("background-color", "rgb(42, 96, 153)");
  await expect(cell).toHaveText("42");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing colored worksheet download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  expect(await archive.readTextEntry("xl/worksheets/sheet2.xml")).toContain(
    '<tabColor rgb="FFFF0000"/>',
  );

  expect(await archive.readTextEntry("xl/worksheets/sheet4.xml")).toContain(
    '<tabColor rgb="FF2A6099"/>',
  );

  await page.setViewportSize({ width: 430, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Reopened colored sheets.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(red).toHaveAttribute("aria-current", "page");
  await expect(green).toHaveCSS("background-color", "rgb(0, 176, 80)");
  await expect(cell).toHaveText("42");
});
