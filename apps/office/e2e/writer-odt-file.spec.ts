/** @fileoverview Exercises Writer ODT Open, Save As, and New through real Chromium file boundaries. */

import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { ZipFile } from "../src/package/source/zipapi/ZipFile";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh";

test("Writer opens and saves a bounded ODT file" /** Verifies the browser platform boundary feeds SwDocShell and receives its serialized package. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns A promise fulfilled after the downloaded ODT is inspected. */, async function opensAndSavesOdt({
  page,
}): Promise<void> {
  const metadata = createDocument({
    id: "e2e-odt",
    suiteId: "writer",
    title: "Browser ODT Fixture",
  });
  const source = createWriterDocument("fixture-paragraph");
  const docShell = new SwDocShell(source, metadata);
  const shell = new SwWrtShell(docShell);
  shell.InsertText(
    "fixture-paragraph",
    "BrowserODTContent",
    "BrowserODTContent".length,
    "insertText",
  );
  shell.SetParagraphStyle("heading-1");
  shell.SetParagraphAlignment("center");
  shell.SetSelection({
    mark: { offset: 0, paragraphId: "fixture-paragraph" },
    point: { offset: "BrowserODTContent".length, paragraphId: "fixture-paragraph" },
  });
  shell.SetParagraphListKind("numbered");
  shell.ChangeParagraphListLevel("demote");
  const sourceBytes = writeOdtDocument(source, docShell.GetDocumentState());

  await page.goto("/writer");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Open" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    buffer: Buffer.from(sourceBytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "browser-fixture.odt",
  });

  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Opened browser-fixture.odt.",
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(editor).toHaveText("BrowserODTContent");
  await expect(editor).toHaveCSS("font-size", "24px");
  await expect(editor).toHaveCSS("text-align", "center");
  await expect(editor.locator("strong")).toHaveText("BrowserODTContent");
  await expect(editor).toHaveAttribute("data-list-kind", "numbered");
  await expect(editor).toHaveAttribute("data-list-level", "1");
  await expect(page.getByTestId("writer-list-marker-writer-paragraph-1")).toHaveText("1.");
  await expect(page.getByText("Browser ODT Fixture")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save As" }).click();
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
  await expect(page.getByRole("menuitem", { name: "Open Local Copy…" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Save Local Copy" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export…" })).toBeVisible();
  await page.getByRole("menuitem", { name: "New Document" }).click();
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText("");
  await expect(page.getByText("Untitled Writer Document", { exact: true })).toBeVisible();
});
