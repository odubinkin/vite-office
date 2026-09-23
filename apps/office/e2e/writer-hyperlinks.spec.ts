/** @fileoverview Exercises Writer hyperlink UI and ODT persistence through real Chromium boundaries. */

import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { ZipFile } from "../src/package/source/zipapi/ZipFile";

test("Writer creates, edits, and round-trips hyperlinks", /** Verifies upstream-aligned hyperlink surfaces and ODT text:a persistence. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns Completion after the saved ODT is reopened. */ async function roundTripsWriterHyperlinks({
  page,
}): Promise<void> {
  const pageErrors: string[] = [];
  page.on(
    "pageerror",
    /** Retains one uncaught browser error. @param error - Browser error. @returns Nothing. */ (
      error,
    ) => pageErrors.push(error.message),
  );
  await page.goto("/writer");
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await editor.fill("Linked text");
  await editor.evaluate(
    /** Selects the complete Writer paragraph. @param element - Editable paragraph. @returns Nothing. */ (
      element,
    ) => {
      const selection = window.getSelection();
      if (selection === null) throw new Error("Writer hyperlink test requires Selection.");
      const range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    },
  );

  await page.getByRole("button", { name: "Hyperlink" }).click();
  await page.getByLabel("URL").fill("https://example.test/first");
  await page.getByLabel("Target").selectOption("_blank");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(editor.getByRole("link", { name: "Linked text" })).toHaveAttribute(
    "href",
    "https://example.test/first",
  );

  await page.getByRole("button", { exact: true, name: "Edit" }).click();
  await page.getByRole("menuitem", { name: "Hyperlink…" }).click();
  await page.getByLabel("URL").fill("https://example.test/updated");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(editor.getByRole("link", { name: "Linked text" })).toHaveAttribute(
    "href",
    "https://example.test/updated",
  );

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  if (downloadPath === null) throw new Error("Chromium did not expose the saved ODT path.");
  const archive = new ZipFile(new Uint8Array(await readFile(downloadPath)));
  const contentXml = await archive.readTextEntry("content.xml");
  expect(contentXml).toContain(
    '<text:a xlink:type="simple" xlink:href="https://example.test/updated" office:target-frame-name="_blank" xlink:show="new">Linked<text:s/>text</text:a>',
  );

  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(downloadPath);
  await expect(editor.getByRole("link", { name: "Linked text" })).toHaveAttribute(
    "href",
    "https://example.test/updated",
  );
  expect(pageErrors).toEqual([]);
});
