/** @fileoverview Actual Calc file controls retain native page styles across primary ODS and XLSX. */
import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

test("Calc keeps XLSX print geometry through browser storage and a mobile reopen", /** Opens the pinned page setup regression and verifies the actual downloaded XLSX. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = new URL(
    "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf136721_letter_sized_paper.xlsx",
    import.meta.url,
  );
  const source = await DocumentArchive.open(await readFile(fixture));
  const worksheet = "xl/worksheets/sheet1.xml";
  const workbook = new DocumentArchiveWriter();
  for (const part of source.getEntryNames()) {
    if (part === worksheet) {
      const xml = await source.readTextEntry(part);
      expect(xml).toContain("</oddFooter>");
      workbook.putNextEntry(
        part,
        new TextEncoder().encode(
          xml.replace("</oddFooter>", "&amp;C&amp;D &amp;T &amp;Z&amp;F</oddFooter>"),
        ),
      );
    } else workbook.putNextEntry(part, await source.readEntry(part));
  }
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(await workbook.finish()),
    name: "Print layout.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
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
  const xml = await archive.readTextEntry(worksheet);
  expect(xml).toMatch(/<pageSetup[^>]*paperSize="70"[^>]*orientation="landscape"/u);
  expect(xml).toContain('<printOptions headings="true" gridLines="true"');
  expect(xml).toMatch(/<pageMargins[^>]*left="0\.1965[^"]*"[^>]*\/>/u);
  expect(xml).toContain("<oddHeader>&amp;L&amp;18Left&amp;R&amp;18Right</oddHeader>");
  expect(xml).toContain(
    "<oddFooter>&amp;LLeft&amp;C&amp;D &amp;T &amp;Z&amp;F&amp;RRight</oddFooter>",
  );

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

test("opens the unmodified tdf58243 workbook and preserves the named reference error", /** Exercises the existing file dialog, browser copy and exported Workbook definitions. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = new URL(
    "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf58243.xlsx",
    import.meta.url,
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const cell = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(fixture),
    name: "tdf58243.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(cell).toHaveText("NOM");

  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Reference error copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Reference error copy", exact: true }).click();
  await expect(cell).toHaveText("NOM");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const buffer = await readFile(path);
  const workbook = await DocumentArchive.open(buffer);
  expect(await workbook.readTextEntry("xl/workbook.xml")).toContain(
    '<definedName name="Excel_BuiltIn_Database" localSheetId="0">#REF!</definedName>',
  );
  await page.setViewportSize({ width: 430, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    name: "Reference error reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Reference error reopened" })).toBeVisible();
  const nameBox = page.getByRole("textbox", { name: "Name Box" });
  await expect(nameBox).toHaveValue("F7");
  await nameBox.fill("A1");
  await nameBox.press("Enter");
  await expect(cell).toHaveText("NOM");
});

test("recalculates the original tdf167019 formulas after browser storage reopen", /** Exercises the unmodified XLSX and preserves its formulas in the downloaded workbook. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = new URL(
    "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf167019.xlsx",
    import.meta.url,
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const nameBox = page.getByRole("textbox", { name: "Name Box" });
  await page.goto("/calc");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(fixture),
    name: "tdf167019.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const minimum = page.getByRole("gridcell", { name: /^D4(?:\s|$)/u });
  const conditional = page.getByRole("gridcell", { name: /^F4(?:\s|$)/u });
  await expect(page.getByRole("heading", { name: "tdf167019" })).toBeVisible();
  await nameBox.fill("D4");
  await nameBox.press("Enter");
  await expect(minimum).toHaveText("117");
  await expect(conditional).toHaveCSS("background-color", "rgb(204, 0, 0)");
  await expect(conditional).toHaveCSS("color", "rgb(255, 255, 255)");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Save As…" }).click();
  await page.getByRole("textbox", { name: "New copy name" }).fill("Conditional values copy");
  await page.getByRole("button", { name: "Save copy" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "Conditional values copy", exact: true }).click();
  await expect(minimum).toHaveText("117");
  await expect(conditional).toHaveCSS("background-color", "rgb(204, 0, 0)");
  await expect(conditional).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(page.getByRole("gridcell", { name: /^D5(?:\s|$)/u })).toHaveText("123");
  await expect(page.getByRole("gridcell", { name: /^D6(?:\s|$)/u })).toHaveText("127");

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await pending).path();
  if (!path) throw new Error("Missing XLSX download.");
  const saved = await DocumentArchive.open(await readFile(path));
  const xml = await saved.readTextEntry("xl/worksheets/sheet1.xml");
  expect(xml).toContain("_xlfn.MINIFS(D7:D10,D7:D10,&quot;&gt;0&quot;)");
  expect(xml).toContain("AVERAGEIF(D7:D10,&quot;&gt;0&quot;)");
  expect(xml).toMatch(/<c r="D5"[^>]*><f>[^<]+<\/f><v>123\.25<\/v><\/c>/u);
  expect(xml).toContain("_xlfn.MAXIFS(D7:D10,D7:D10,&quot;&gt;0&quot;)");
  expect(xml.match(/<cfRule [^>]*operator="notBetween"/gu)).toHaveLength(3);
  expect(xml).toContain("<formula>100</formula><formula>152</formula>");
  expect(await saved.readTextEntry("xl/styles.xml")).toContain('rgb="FFCC0000"');
});
