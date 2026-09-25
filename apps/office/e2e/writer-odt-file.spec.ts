/** @fileoverview Exercises Writer ODT Open, Save As, and New through real Chromium file boundaries. */

import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

import { ZipFile } from "../src/package/source/zipapi/ZipFile";
import { createDocument } from "../src/sfx2/source/doc/objsh";
import { createWriterDocument } from "../src/sw/source/core/doc/doc";
import { SwPosition } from "../src/sw/source/core/crsr/pam";
import { writeOdtDocument } from "../src/sw/source/filter/xml/wrtxml";
import { SwDocShell } from "../src/sw/source/uibase/app/docsh";
import { SwWrtShell } from "../src/sw/source/uibase/wrtsh/wrtsh1";

test("Writer opens and saves a bounded ODT file" /** Verifies the browser platform boundary feeds SwDocShell and receives its serialized package. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns A promise fulfilled after the downloaded ODT is inspected. */, async function opensAndSavesOdt({
  page,
}): Promise<void> {
  const metadata = createDocument({
    id: "e2e-odt",
    suiteId: "writer",
    title: "Browser ODT Fixture",
  });
  const source = createWriterDocument();
  const docShell = new SwDocShell(source, metadata);
  const shell = new SwWrtShell(docShell);
  shell.Insert("BrowserODTContent");
  shell.SetParagraphStyle("heading-1");
  shell.SetParagraphAlignment("center");
  const sourceParagraph = source.paragraphs[0];
  if (sourceParagraph === undefined) throw new Error("ODT fixture has no paragraph.");
  shell.SetPaM(
    new SwPosition(sourceParagraph, "BrowserODTContent".length),
    new SwPosition(sourceParagraph, 0),
  );
  shell.SetParagraphListKind("numbered");
  shell.ChangeParagraphListLevel("demote");
  const sourceBytes = writeOdtDocument(source, docShell.GetDocumentState());

  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(sourceBytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "browser-fixture.odt",
  });

  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await expect(editor).toHaveText("BrowserODTContent");
  await expect(editor).toHaveCSS("font-size", "24px");
  await expect(editor).toHaveCSS("text-align", "center");
  await expect(editor.locator("strong")).toHaveText("BrowserODTContent");
  await expect(editor).toHaveAttribute("data-list-kind", "numbered");
  await expect(editor).toHaveAttribute("data-list-level", "1");
  const projectionId = await editor.getAttribute("data-writer-paragraph-id");
  await expect(page.locator(`[data-writer-list-marker="${projectionId}"]`)).toHaveText("1.");
  await expect(page.getByText("Browser ODT Fixture")).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
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
  await expect(page.getByRole("menuitem", { name: "Open Local Copy…" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "Save Local Copy" })).toHaveCount(0);
  await expect(page.getByRole("menuitem", { name: "Export…" })).toBeVisible();
  await page.getByRole("menuitem", { name: "New Document" }).click();
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toHaveText("");
  await expect(page.getByText("Untitled Writer Document", { exact: true })).toBeVisible();
});

test("Writer keeps one ODT text node across visible page fragments after reopen" /** Checks long-paragraph pagination and persisted source text in Chromium. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns A promise resolved after reopen. */, async function reopensPaginatedParagraph({
  page,
}): Promise<void> {
  const text = "Writer measured paragraph with shaped text. ".repeat(130);
  const metadata = createDocument({ id: "e2e-pages", suiteId: "writer", title: "Paginated ODT" });
  const document = createWriterDocument();
  const shell = new SwWrtShell(new SwDocShell(document, metadata));
  shell.Insert(text);
  const sourceBytes = writeOdtDocument(document, metadata);

  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: Buffer.from(sourceBytes),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "pages.odt",
  });
  const fragments = page.locator("[data-writer-page] [data-writer-paragraph-id]");
  await expect
    .poll(
      /** Waits for browser line measurement and Writer page-frame creation. @returns Fragment count. */ () =>
        fragments.count(),
    )
    .toBeGreaterThan(1);
  const id = await fragments.first().getAttribute("data-writer-paragraph-id");
  expect((await fragments.allTextContents()).join("")).toBe(text);
  for (const fragment of await fragments.all())
    expect(await fragment.getAttribute("data-writer-paragraph-id")).toBe(id);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const savedPath = await (await downloadPromise).path();
  if (savedPath === null) throw new Error("Chromium did not expose the paginated ODT download.");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(savedPath),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "reopened-pages.odt",
  });
  await expect
    .poll(
      /** Waits for reopened browser page fragments. @returns Fragment count. */ () =>
        fragments.count(),
    )
    .toBeGreaterThan(1);
  expect((await fragments.allTextContents()).join("")).toBe(text);
});

test("Writer types in a table cell and reopens the edited ODT", /** Checks native cell keyboard input and package persistence. @param root0 - Playwright fixtures. @param root0.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await page.getByRole("button", { name: "Insert Table" }).click();
  await page
    .getByRole("dialog", { name: "Insert Table" })
    .getByRole("button", { name: "Insert" })
    .click();
  const cell = page.locator("[data-writer-table-cell]").first();
  await cell.click();
  await expect(cell).toBeFocused();
  await page.keyboard.type("typed cell");
  await expect(cell).toHaveText("typed cell");

  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download ODT" }).click();
  const savedPath = await (await pending).path();
  if (savedPath === null) throw new Error("Chromium did not expose the table ODT download.");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: await readFile(savedPath),
    mimeType: "application/vnd.oasis.opendocument.text",
    name: "edited-table.odt",
  });
  await expect(page.locator("[data-writer-table-row]")).toHaveCount(2);
  await expect(page.locator("[data-writer-table] td, [data-writer-table] th")).toHaveCount(4);
  await expect(page.locator("[data-writer-table-cell]").first()).toHaveText("typed cell");
});
