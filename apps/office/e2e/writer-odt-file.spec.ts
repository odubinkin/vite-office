/** @fileoverview Exercises Writer ODT Open, Save As, and New through real Chromium file boundaries. */

import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { ZipFile } from "../src/package/source/zipapi/ZipFile";
import { createDocument } from "../src/sfx2/source/doc/docfac";
import {
  createWriterDocument,
  insertWriterText,
  setWriterParagraphAlignment,
  setWriterParagraphStyle,
  toggleWriterParagraphCharacterFormat,
} from "../src/sw/source/core/doc/writer";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";

test("Writer opens and saves a bounded ODT file" /** Verifies the browser platform boundary feeds SwDocShell and receives its serialized package. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns A promise fulfilled after the downloaded ODT is inspected. */, async function opensAndSavesOdt({
  page,
}): Promise<void> {
  const metadata = createDocument({
    id: "e2e-odt",
    suiteId: "writer",
    title: "Browser ODT Fixture",
  });
  let source = insertWriterText(
    createWriterDocument(metadata, "fixture-paragraph"),
    "fixture-paragraph",
    0,
    "BrowserODTContent",
  );
  source = setWriterParagraphStyle(source, "fixture-paragraph", "heading-1");
  source = setWriterParagraphAlignment(source, "fixture-paragraph", "center");
  source = toggleWriterParagraphCharacterFormat(
    source,
    "fixture-paragraph",
    0,
    "BrowserODTContent".length,
    "bold",
  );
  source.paragraphs[0]?.SetParagraphList({ kind: "numbered", level: 1 });
  const sourceBytes = writeOdtDocument(source);

  await page.goto("/writer");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open ODT" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    buffer: Buffer.from(sourceBytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "browser-fixture.odt",
  });

  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(editor).toHaveText("BrowserODTContent");
  await expect(editor).toHaveCSS("font-size", "24px");
  await expect(editor).toHaveCSS("text-align", "center");
  await expect(editor.locator("strong")).toHaveText("BrowserODTContent");
  await expect(editor).toHaveAttribute("data-list-kind", "numbered");
  await expect(editor).toHaveAttribute("data-list-level", "1");
  await expect(page.getByTestId("writer-list-marker-paragraph-1")).toHaveText("1.");
  await expect(page.getByText("Browser ODT Fixture")).toBeVisible();
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Opened browser-fixture.odt.",
  );

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save as ODT" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("Browser ODT Fixture.odt");
  const downloadPath = await download.path();
  if (downloadPath === null) throw new Error("Chromium did not expose the completed ODT download.");
  const downloadedBytes = new Uint8Array(await readFile(downloadPath));
  const archive = new ZipFile(downloadedBytes);
  expect(await archive.readTextEntry("mimetype")).toBe("application/vnd.oasis.opendocument.text");
  const contentXml = await archive.readTextEntry("content.xml");
  expect(contentXml).toContain("BrowserODTContent");
  expect(contentXml).toContain("<text:list-style");
  expect(contentXml).toContain("<text:list-item>");

  await page.getByRole("button", { name: "File" }).click();
  await expect(page.getByRole("menuitem", { name: "Open local copy…" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Save local copy" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Save as text…" })).toBeVisible();
  await page.getByRole("menuitem", { name: "New" }).click();
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText("");
  await expect(page.getByText("Untitled Writer Document", { exact: true })).toBeVisible();
});
