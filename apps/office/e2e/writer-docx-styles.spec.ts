/** @fileoverview Production Writer DOCX styles and tables through Chromium file import and export. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../src/package/source/zippackage/document-archive";

test("Writer preserves the original Strict numbering indent after browser restore", /** Opens a Strict package and checks the exported number-level properties. @param fixtures - Playwright fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf82065_Ind_start_strict.docx",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(editor).toContainText("RTL with indent");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf82065_Ind_start_strict", exact: true }).click();
  await expect(editor).toContainText("RTL with indent");

  const pendingDownload = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await pendingDownload).path();
  if (path === null) throw new Error("Chromium did not expose the DOCX download.");
  const archive = await DocumentArchive.open(new Uint8Array(await readFile(path)));
  expect(await archive.readTextEntry("word/numbering.xml")).toContain(
    '<w:ind w:left="3402" w:hanging="1134"/>',
  );
});

test("Writer downloads and reopens the named styles from a DOCX", /** Verifies the shipped file dialog at desktop and mobile widths. @param root0 - Browser fixtures. @param root0.page - Actual Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf138345_charStyleHighlight.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(editor).toHaveText("An orange background is so nice.");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf138345_charStyleHighlight", exact: true }).click();
  await expect(editor).toHaveText("An orange background is so nice.");

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const download = await finished;
  const path = await download.path();
  if (path === null) throw new Error("Chromium did not expose the completed DOCX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  const document = await archive.readTextEntry("word/document.xml");
  expect(document).toContain('<w:rStyle w:val="charBackground"/>');
  expect(document).toMatch(/<w:pgSz w:orient="landscape" w:w="\d+" w:h="\d+"\/>/);
  expect(document).toContain('<w:pgMar w:left="1134" w:right="1134"');
  expect(await archive.readTextEntry("word/styles.xml")).not.toContain("<w:highlight");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reopened-named-styles.docx",
  });
  await expect(page.getByText("reopened-named-styles", { exact: true })).toBeVisible();
  await expect(editor).toHaveText("An orange background is so nice.");
});

test("Writer downloads and reopens nested DOCX tables", /** Exercises the existing Writer file UI with the pinned nested-table fixture. @param browser - Playwright fixtures. @param browser.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const file = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf131260.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(file);
  const tables = page.locator("[data-writer-table] > table");
  await expect(tables).toHaveCount(3);

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (path === null) throw new Error("Chromium did not expose the completed DOCX download.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  expect((await archive.readTextEntry("word/document.xml")).match(/<w:tbl>/gu)).toHaveLength(3);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reopened-nested-tables.docx",
  });
  await expect(page.getByText("reopened-nested-tables", { exact: true })).toBeVisible();
  await expect(tables).toHaveCount(3);
});

test("Writer paints a floating DOCX header picture after opening and restoring it", /** Tests the actual browser decoder and page paint with an adapted upstream picture. @param browser - Playwright fixtures. @param browser.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = new URL(
    "../../../vendor/libreoffice-reference/sw/qa/extras/layout/data/testHeaderImageAlignment.docx",
    import.meta.url,
  );
  const source = await DocumentArchive.open(new Uint8Array(await readFile(fixture)));
  const writer = new DocumentArchiveWriter();
  const headerPath = "word/header1.xml";
  const header = (await source.readTextEntry(headerPath))
    .replace(/<w:framePr[^>]*\/>/u, "")
    .replace(
      "<wp:inline",
      '<wp:anchor simplePos="0" relativeHeight="0" behindDoc="1" locked="0" layoutInCell="1" allowOverlap="1"',
    )
    .replace(
      "<wp:extent",
      '<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="column"><wp:posOffset>-63500</wp:posOffset></wp:positionH>' +
        '<wp:positionV relativeFrom="paragraph"><wp:posOffset>127000</wp:posOffset></wp:positionV><wp:extent',
    )
    .replace("<wp:docPr", "<wp:wrapNone/><wp:docPr")
    .replace("</wp:inline>", "</wp:anchor>");
  for (const name of source.getEntryNames()) {
    writer.putNextEntry(
      name,
      name === headerPath ? new TextEncoder().encode(header) : await source.readEntry(name),
    );
  }

  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(await writer.finish()),
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "floating-header.docx",
  });

  const sheet = page.locator('[data-writer-page="1"]');
  const image = sheet.locator('[data-writer-page-story="header"] img');
  /** Confirms the original picture decoded and was placed from the paragraph origin. @returns Completion. */
  async function expectPicture(): Promise<void> {
    await expect(sheet.getByText("Sample Header text")).toBeVisible();
    await expect(image).toBeVisible();
    await expect
      .poll(
        /** Reads the size once the browser decodes the embedded pixels. @returns Decoded raster width. */
        () =>
          image.evaluate(
            /** Gets the decoded raster width. @param element - Mounted image. @returns Decoded raster pixels. */
            (element: HTMLImageElement) => element.naturalWidth,
          ),
      )
      .toBeGreaterThan(0);
    const bounds = await image.boundingBox();
    const pageBounds = await sheet.boundingBox();
    if (!bounds || !pageBounds) throw new Error("Writer did not paint the expected page.");
    expect(bounds.x - pageBounds.x).toBeCloseTo((1304 - 100) / 15, 0);
    expect(bounds.y - pageBounds.y).toBeCloseTo((567 + 200) / 15, 0);
  }
  await expectPicture();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );
  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "floating-header", exact: true }).click();
  await expectPicture();
});

test("Writer opens and downloads the original tdf134114 square-wrapped pictures", /** Exercises the unchanged input, browser storage, real DOCX download and mobile reopen. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf134114_allowOverlap.docx",
      import.meta.url,
    ),
  );
  const open = page.getByRole("button", { name: "Open", exact: true });
  const pictures = page.locator("[data-writer-graphic-fly] img");
  await page.goto("/writer");
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(pictures).toHaveCount(2);
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await open.click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf134114_allowOverlap", exact: true }).click();
  await expect(pictures).toHaveCount(2);

  const pending = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await pending).path();
  if (path === null) throw new Error("Missing DOCX download.");
  const buffer = await readFile(path);
  const archive = await DocumentArchive.open(buffer);
  const xml = await archive.readTextEntry("word/document.xml");
  expect(xml.match(/<wp:wrapSquare wrapText="bothSides"\/>/gu)).toHaveLength(2);
  expect(xml.match(/allowOverlap="[01]"/gu)).toEqual(['allowOverlap="1"', 'allowOverlap="0"']);

  await page.setViewportSize({ width: 390, height: 844 });
  await open.click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "square-wrap-reopened.docx",
  });
  await expect(page.getByText("square-wrap-reopened", { exact: true })).toBeVisible();
  await expect(pictures).toHaveCount(2);
});
