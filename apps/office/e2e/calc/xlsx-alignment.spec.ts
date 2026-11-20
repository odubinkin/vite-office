/** @fileoverview Production Calc XLSX reading order through Open, the Worker and export. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../src/package/source/zippackage/document-archive";

test("Calc preserves both XLSX reading orders through Open and Download", /** Verifies native reading order on the displayed cells and the mobile reopen. @param fixtures - Real Chromium session. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/writingMode.xlsx",
      import.meta.url,
    ),
  );
  const picker = page
    .getByRole("tabpanel", { name: "On computer", exact: true })
    .locator('input[type="file"]');
  const left = page.getByRole("gridcell", { name: /^A4(?:\s|$)/u }).locator("[dir]");
  const right = page.getByRole("gridcell", { name: /^A5(?:\s|$)/u }).locator("[dir]");
  const name = page.getByRole("textbox", { name: "Name Box", exact: true });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await picker.setInputFiles(fixture);
  await expect(page.getByRole("dialog")).toBeHidden();
  await name.fill("A4");
  await name.press("Enter");
  await expect(left).toHaveAttribute("dir", "ltr");
  await expect(right).toHaveAttribute("dir", "rtl");

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Chromium did not expose the workbook download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  const styles = await archive.readTextEntry("xl/styles.xml");
  expect(styles).toContain('readingOrder="1"');
  expect(styles).toContain('readingOrder="2"');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await picker.setInputFiles({
    buffer: bytes,
    name: "reading-order-reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByText("reading-order-reopened", { exact: true })).toBeVisible();
  await name.fill("A4");
  await name.press("Enter");
  await expect(left).toHaveAttribute("dir", "ltr");
  await expect(right).toHaveAttribute("dir", "rtl");
});

test("Calc recalculates and exports the original XLSX text formula", /** Checks the real file UI and a worksheet's saved formula and string result. @param fixtures - Chromium session. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf123139_applyAlignment.xlsx",
      import.meta.url,
    ),
  );
  const picker = page
    .getByRole("tabpanel", { name: "On computer", exact: true })
    .locator('input[type="file"]');
  const result = page.getByRole("gridcell", { name: /^C1(?:\s|$)/u });
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await picker.setInputFiles(fixture);
  await expect(result).toContainText("hidden formula");

  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Chromium did not expose the workbook download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(sheet).toContain("<f>CONCATENATE(");
  expect(sheet).toContain("<v>hidden  formula</v>");
  expect(sheet).toContain('<sheetProtection sheet="true" objects="true" scenarios="true"/>');
  const styles = await archive.readTextEntry("xl/styles.xml");
  expect(styles).toContain('<protection locked="true" hidden="true"/>');
  expect(styles).toContain('<protection locked="false" hidden="false"/>');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await picker.setInputFiles({
    buffer: bytes,
    name: "text-formula-reopened.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  await expect(page.getByText("text-formula-reopened", { exact: true })).toBeVisible();
  await expect(result).toContainText("hidden formula");
});

test("Calc keeps legacy worksheet protection in the saved document and ODS download", /** Verifies the actual file picker, browser primary store and ODS Worker. @param fixtures - Chromium session. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const bytes = await readFile(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/ProtecteSheet1234Pass.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  const open = page.getByRole("button", { name: "Open", exact: true });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByRole("tabpanel", { name: "On computer" })
    .locator('input[type="file"]')
    .setInputFiles({
      buffer: bytes,
      name: "Legacy sheet.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  await expect(page.getByText("Legacy sheet", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.reload();
  await open.click();
  await page.getByRole("button", { name: "Legacy sheet", exact: true }).click();
  await expect(page.getByText("Legacy sheet", { exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODS" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Chromium did not expose the ODS download.");
  const archive = await DocumentArchive.open(await readFile(path));
  const content = await archive.readTextEntry("content.xml");
  expect(content).toContain('table:protected="true"');
  expect(content).toContain('table:protection-key="ibbcz2WONDGApdl1540bfATbEDc="');
  expect(content).toContain('loext:select-unprotected-cells="true"');
});

test("Calc enforces editable range exceptions from the opened XLSX", /** Exercises real keyboard admission and protected-range export. @param fixtures - Browser session. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/enhanced-protection.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByRole("tabpanel", { name: "On computer" })
    .locator('input[type="file"]')
    .setInputFiles(fixture);
  await expect(page.getByText("enhanced-protection", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  const locked = page.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  const editable = page.getByRole("gridcell", { name: /^A2(?:\s|$)/u });
  const password = page.getByRole("gridcell", { name: /^A4(?:\s|$)/u });
  const message = page
    .getByRole("alert")
    .filter({ hasText: "Protected cells can not be modified." });
  const name = page.getByRole("textbox", { name: "Name Box" });
  await name.fill("A1");
  await name.press("Enter");
  await page.getByRole("menuitem", { name: "Format", exact: true }).click();
  await page.getByRole("menuitem", { name: "Clear", exact: true }).click();
  await expect(message).toBeVisible();
  await page.keyboard.press("9");
  await expect(message).toBeVisible();
  await expect(locked).not.toContainText("9");
  await name.fill("A2");
  await name.press("Enter");
  await page.keyboard.type("123");
  await page.keyboard.press("Enter");
  await expect(editable).toContainText("123");
  await name.fill("A4");
  await name.press("Enter");
  await page.keyboard.press("9");
  await expect(message).toBeVisible();
  await expect(password).not.toContainText("9");
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download XLSX" }).click();
  const path = await (await download).path();
  if (!path) throw new Error("Chromium did not expose the workbook download.");
  const archive = await DocumentArchive.open(await readFile(path));
  const sheet = await archive.readTextEntry("xl/worksheets/sheet1.xml");
  expect(sheet).toContain('<protectedRange name="Range1_without_password" sqref="A2"/>');
  expect(sheet).toMatch(/<c r="A2"[^>]*><v>123<\/v><\/c>/u);
});

test("Calc applies the imported XLSX selection options to pointer and keyboard movement", /** Uses source style records and an explicit OOXML selection option through the real file dialog. @param fixtures - Browser session. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const archive = await DocumentArchive.open(
    await readFile(
      new URL(
        "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/tdf123139_applyAlignment.xlsx",
        import.meta.url,
      ),
    ),
  );
  const packaged = new DocumentArchiveWriter();
  for (const part of archive.getEntryNames()) {
    const data =
      part === "xl/worksheets/sheet1.xml"
        ? new TextEncoder().encode(
            (await archive.readTextEntry(part))
              .replace(
                '<sheetProtection sheet="1"',
                '<sheetProtection sheet="1" selectLockedCells="1"',
              )
              .replace("</sheetData>", '<row r="4"><c r="C4" s="5"><v>4</v></c></row></sheetData>'),
          )
        : await archive.readEntry(part);
    packaged.putNextEntry(part, data);
  }
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByRole("tabpanel", { name: "On computer" })
    .locator('input[type="file"]')
    .setInputFiles({
      buffer: Buffer.from(await packaged.finish()),
      name: "Selection protection.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  await expect(page.getByText("Selection protection", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  const name = page.getByRole("textbox", { name: "Name Box" });
  await name.fill("C2");
  await name.press("Enter");
  await expect(name).toHaveValue("C2");
  await page.keyboard.press("ArrowDown");
  await expect(name).toHaveValue("C4");
  await page.keyboard.press("Shift+ArrowUp");
  await expect(name).toHaveValue("C4");
  await page.keyboard.press("ArrowUp");
  await expect(name).toHaveValue("C2");
  await page.getByRole("gridcell", { name: /^C3(?:\s|$)/u }).click({ position: { x: 5, y: 4 } });
  await expect(name).toHaveValue("C2");
});

test("Calc expands a formula reference over a merge imported from Strict XLSX", /** Uses the untouched upstream Strict workbook and its E2:F3 merge in the real keyboard editor. @param fixtures - Browser session. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../../vendor/libreoffice-reference/sc/qa/unit/data/xlsx/universal-content-strict.xlsx",
      import.meta.url,
    ),
  );
  await page.goto("/calc");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page
    .getByRole("tabpanel", { name: "On computer" })
    .locator('input[type="file"]')
    .setInputFiles(fixture);
  await expect(page.getByText("universal-content-strict", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  const name = page.getByRole("textbox", { name: "Name Box" });
  await name.fill("D2");
  await name.press("Enter");
  await page.keyboard.press("=");
  const input = page.getByRole("textbox", { name: "Edit cell D2" });
  await expect(input).toHaveValue("=");
  await input.press("Shift+ArrowRight");
  await expect(input).toHaveValue("=D2:F3");
  await expect(name).toHaveValue("D2");
});
