/** @fileoverview Existing Calc file controls retain a non-first active worksheet through primary storage. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

test("Calc preserves frozen panes and the moved cursor through its file controls", /** Uses the existing Calc file UI and Name Box through XLSX, local ODS and mobile reopen. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const path = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/freezePaneStartCell.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const name = page.getByRole("textbox", { name: "Name Box", exact: true });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(path);
  await expect(name).toHaveValue("F11");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Cursor view copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Cursor view copy", exact: true }).click();
  await expect(name).toHaveValue("F11");
  await name.fill("D7");
  await name.press("Enter");
  await expect(name).toHaveValue("D7");

  const downloaded = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const exportPath = await (await downloaded).path();
  if (!exportPath) throw new Error("Missing XLSX download.");
  const buffer = await readFile(exportPath);
  const archive = await DocumentArchive.open(buffer);
  const settings = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(settings).toContain(
    '<pane xSplit="5" ySplit="10" topLeftCell="F11" activePane="bottomRight" state="frozen"/>',
  );
  expect(settings).toContain(
    '<selection pane="bottomRight" activeCell="D7" activeCellId="0" sqref="D7"/>',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Cursor view reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(name).toHaveValue("D7");
});

test("Calc restores unsplit XLSX viewport origins independently of the cursor", /** Checks both native sheet origins through the actual grid, local storage and XLSX output. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = await readFile(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/sheet-names.xlsx",
      import.meta.url,
    ),
  );
  const archive = await DocumentArchive.open(fixture);
  const writer = new DocumentArchiveWriter();
  for (const part of archive.getEntryNames()) {
    const origin =
      part === "xl/worksheets/sheet5.xml"
        ? "E31"
        : part === "xl/worksheets/sheet1.xml"
          ? "B19"
          : undefined;
    if (!origin) {
      writer.putNextEntry(part, await archive.readEntry(part));
      continue;
    }
    let xml = (await archive.readTextEntry(part)).replace(
      "<sheetView ",
      `<sheetView topLeftCell="${origin}" `,
    );
    if (origin === "E31")
      xml = xml
        .replace(
          "/></sheetViews>",
          '><selection activeCell="A1" sqref="A1"/></sheetView></sheetViews>',
        )
        .replace("<sheetData/>", '<sheetData><row r="1"><c r="A1"><v>42</v></c></row></sheetData>');
    writer.putNextEntry(part, new TextEncoder().encode(xml));
  }
  const open = page.getByRole("button", { name: "Open", exact: true });
  const grid = page.getByRole("grid", { name: "Spreadsheet" });
  const firstCell = grid.getByRole("gridcell").first();
  const name = page.getByRole("textbox", { name: "Name Box", exact: true });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(await writer.finish()),
    name: "Unsplit origins.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(firstCell).toHaveAttribute("aria-label", "E31");
  await expect(name).toHaveValue("A1");
  await page.getByRole("tab", { name: "S&P", exact: true }).click();
  await expect(firstCell).toHaveAttribute("aria-label", "B19");
  await grid.evaluate(
    /** Moves the first sheet independently of its cursor and the fifth sheet. @param element - Native browser scroll container. @returns Nothing. */ (
      element,
    ) => {
      element.scrollTop += 37;
    },
  );
  await expect(firstCell).not.toHaveAttribute("aria-label", "B19");
  const scrolled = await firstCell.getAttribute("aria-label");
  if (!scrolled) throw new Error("Missing first visible cell after scrolling.");
  await expect(name).toHaveValue("B19");
  await page.getByRole("tab", { name: "C>D", exact: true }).click();
  await expect(firstCell).toHaveAttribute("aria-label", "E31");

  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Unsplit origins copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Unsplit origins copy", exact: true }).click();
  await expect(firstCell).toHaveAttribute("aria-label", "E31");
  await page.getByRole("tab", { name: "S&P", exact: true }).click();
  await expect(firstCell).toHaveAttribute("aria-label", scrolled);
  await expect(name).toHaveValue("B19");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const downloaded = await (await pending).path();
  if (!downloaded) throw new Error("Missing workbook download.");
  const buffer = await readFile(downloaded);
  const output = await DocumentArchive.open(buffer);
  expect(await output.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
    `topLeftCell="${scrolled}"`,
  );
  expect(await output.readTextEntry("xl/worksheets/sheet5.xml")).toContain('topLeftCell="E31"');
  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Unsplit origins exported.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(firstCell).toHaveAttribute("aria-label", scrolled);
  await expect(name).toHaveValue("B19");
});

test("Calc restores the XLSX active sheet when several sheets are visible", /** Exercises local Open, primary ODS, XLSX export and mobile reopen. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/sheet-names.xlsx",
      import.meta.url,
    ),
  );
  const sheets = page.getByRole("tablist", { name: "Sheets" });
  const activeSheet = sheets.getByRole("tab", { name: "C>D", exact: true });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(sheets.getByRole("tab")).toHaveText([
    "S&P",
    "Sam's Club",
    '"The Sheet"',
    "A<B",
    "C>D",
  ]);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await cell.click();
  await page.keyboard.type("42");
  await page.keyboard.press("Enter");
  await expect(cell).toHaveText("42");
  const lookup = page.getByRole("gridcell", { name: /^B1(?:\s|$)/u });
  await lookup.click();
  await page.keyboard.type("=VLOOKUP(42;A1:A1;1;0)");
  await page.keyboard.press("Enter");
  await expect(lookup).toHaveText("42");

  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Active view copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Active view copy", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(cell).toHaveText("42");
  await expect(lookup).toHaveText("42");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(buffer));
  expect(await archive.readTextEntry("xl/workbook.xml")).toContain(
    '<workbookView activeTab="4" showSheetTabs="true"/>',
  );
  expect(await archive.readTextEntry("xl/worksheets/sheet5.xml")).toMatch(
    /<f>VLOOKUP\(42,A1(?::A1)?,1,0\)<\/f>/u,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Active view reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(activeSheet).toHaveAttribute("aria-current", "page");
  await expect(cell).toHaveText("42");
  await expect(lookup).toHaveText("42");
});

test("Calc restores the XLSX sheet grid setting in the browser", /** Ports the interactive grid fixture through primary ODS, XLSX download, and mobile reopen. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf126541_GridOff.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("gridcell", { name: /^D4(?:\s|$)/u });
  const hiddenBorder = /border-right:\s*1px solid transparent/u;
  await page.goto("/calc");
  await expect(cell).not.toHaveAttribute("style", hiddenBorder);
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cell).toHaveAttribute("style", hiddenBorder);

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf126541_GridOff", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cell).toHaveAttribute("style", hiddenBorder);

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
    'showGridLines="false"',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Grid settings reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(cell).toHaveAttribute("style", hiddenBorder);
  await page.getByRole("menuitem", { name: "View", exact: true }).click();
  await page.getByRole("menuitemcheckbox", { name: "View Grid Lines", exact: true }).click();
  await expect(cell).not.toHaveAttribute("style", hiddenBorder);
});

test("Calc imports and exports XLSX with row and column headers hidden", /** Checks the worksheet's display option, primary ODS and mobile reopen. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf126541_GridOff.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const rowHeaders = page.getByRole("rowheader");
  const columnHeaders = page.getByRole("columnheader");
  const template = await DocumentArchive.open(await readFile(fixture));
  const input = new DocumentArchiveWriter();
  for (const entry of template.getEntryNames()) {
    if (entry === "xl/worksheets/sheet1.xml") {
      const xml = await template.readTextEntry(entry);
      input.putNextEntry(
        entry,
        new TextEncoder().encode(xml.replace("<sheetView ", '<sheetView showRowColHeaders="0" ')),
      );
    } else input.putNextEntry(entry, await template.readEntry(entry));
  }
  await page.goto("/calc");
  await expect(columnHeaders.first()).toBeVisible();
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(await input.finish()),
    name: "Hidden headers.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(rowHeaders).toHaveCount(0);
  await expect(columnHeaders).toHaveCount(0);

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Hidden headers", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(columnHeaders).toHaveCount(0);

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  expect(await archive.readTextEntry("xl/worksheets/sheet1.xml")).toContain(
    'showRowColHeaders="false"',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Hidden headers reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(rowHeaders).toHaveCount(0);
  await expect(columnHeaders).toHaveCount(0);
});

test("Calc opens the pinned XLSX with external names and exports its caches", /** Exercises the original testTdf130959 workbook through production file controls. @param fixtures - Browser state. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf130959.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const tabs = page.getByRole("tablist", { name: "Sheets" });
  await expect(tabs.getByRole("tab", { name: "Sheet 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await cell.click();
  await page.keyboard.type("='file:///bad(1).xlsx'#$Referens.$A$7");
  await page.keyboard.press("Enter");
  await expect(cell).toHaveText("Alla fakturor ska i detta flöde");
  const lookup = page.getByRole("gridcell", { name: /^B1(?:\s|$)/u });
  await lookup.click();
  await page.keyboard.type(`=VLOOKUP("referens";'file:///bad(1).xlsx'#$Referens.$A$1:.$A$7;1;0)`);
  await page.keyboard.press("Enter");
  await expect(lookup).toHaveText("Referens");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("External cache copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "External cache copy", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(tabs.getByRole("tab")).toHaveCount(1);
  await expect(cell).toHaveText("Alla fakturor ska i detta flöde");
  await expect(lookup).toHaveText("Referens");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const workbook = await DocumentArchive.open(buffer);
  expect(await workbook.readTextEntry("xl/workbook.xml")).toContain("[1]Referens!$A$1:$A$7");
  const sheetXml = await workbook.readTextEntry("xl/worksheets/sheet1.xml");
  expect(sheetXml).toContain("<f>[1]Referens!$A$7</f>");
  expect(sheetXml).toMatch(/<f>VLOOKUP\([^<]+,\[1\]Referens!\$A\$1:\$A\$7,1,0\)<\/f>/u);
  expect(await workbook.readTextEntry("xl/externalLinks/externalLink1.xml")).toContain(
    '<cell r="A7" t="str"><v>Alla fakturor ska i detta flöde</v></cell>',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "External names reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("External names reopened", { exact: true })).toBeVisible();
  await expect(cell).toHaveText("Alla fakturor ska i detta flöde");
  await expect(lookup).toHaveText("Referens");
  await expect(tabs.getByRole("tab", { name: "Sheet 1", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("Calc opens and recalculates the original tdf70455 workbook", /** Ports the pinned workbook regression through existing local Open, ODS and XLSX controls. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const original = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf70455.xlsx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const result = page.getByRole("gridcell", { name: /^H8(?:\s|$)/u });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(original);
  await expect(result).toHaveText("€780.00");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Dynamic range copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Dynamic range copy", exact: true }).click();
  await expect(result).toHaveText("€780.00");

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Dynamic range reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const name = page.getByRole("textbox", { name: "Name Box" });
  await expect(name).toHaveValue("F13");
  await name.fill("H8");
  await name.press("Enter");
  await expect(result).toHaveText("€780.00");
});

test("Calc exports the long sheet name in tdf79998 without changing the open ODS", /** Reopens the actual XLSX download on mobile after verifying its native sheet references. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf79998.ods",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const sheets = page.getByRole("tablist", { name: "Sheets" });
  const longName = "Utilities (FX Kurse, Kreditkarten etc)";
  const shortName = "Utilities (FX Kurse, Kreditkart";
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(sheets.getByRole("tab", { name: longName, exact: true })).toBeVisible();

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  expect(await archive.readTextEntry("xl/workbook.xml")).toContain('name="' + shortName + '"');
  await expect(sheets.getByRole("tab", { name: longName, exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Long sheet name reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(sheets.getByRole("tab", { name: shortName, exact: true })).toBeVisible();
});
