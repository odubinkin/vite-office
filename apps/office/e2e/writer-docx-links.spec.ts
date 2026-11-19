/** @fileoverview Writer DOCX link and bookmark persistence through the shipped file dialogs. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../src/package/source/zippackage/document-archive";

test("Writer preserves a DOCX internal link and bookmark through browser storage", /** Checks both Open dialog routes and reopens the actual exported package at mobile width. @param fixture - Browser fixtures. @param fixture.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const input = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/fdo69548.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(input);
  const link = page.getByRole("link", { name: "Link", exact: true });
  await expect(link).toHaveAttribute("href", "#this is a bookmark");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "fdo69548", exact: true }).click();
  await expect(link).toHaveAttribute("href", "#this is a bookmark");
  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (path === null) throw new Error("Missing DOCX download.");
  const bytes = await readFile(path);
  const document = await (
    await DocumentArchive.open(new Uint8Array(bytes))
  ).readTextEntry("word/document.xml");
  expect(document).toContain('<w:hyperlink w:anchor="this_is_a_bookmark">');
  expect(document).toContain('<w:bookmarkStart w:id="0" w:name="this_is_a_bookmark"/>');
  expect(document).toContain('<w:bookmarkEnd w:id="0"/>');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reopened-links.docx",
  });
  await expect(link).toHaveAttribute("href", "#this_is_a_bookmark");
  await expect(page.getByText("reopened-links", { exact: true })).toBeVisible();
});

test("Writer preserves a ranged bookmark in stored ODT and reopened DOCX", /** Drives original file and bookmark commands at desktop and mobile widths. @param fixture - Browser fixtures. @param fixture.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const input = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf65955_2.odt",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(input);
  await expect(editor).toHaveText("foo bar");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf65955_2", exact: true }).click();
  await expect(editor).toHaveText("foo bar");
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await download).path();
  if (path === null) throw new Error("Missing DOCX download.");
  const bytes = await readFile(path);
  const xml = await (
    await DocumentArchive.open(new Uint8Array(bytes))
  ).readTextEntry("word/document.xml");
  expect(xml).toMatch(
    /<w:bookmarkStart w:id="0" w:name="test"\/>[\s\S]*foo[\s\S]*bar[\s\S]*<w:bookmarkEnd w:id="0"\/>/u,
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    name: "reopened-range.docx",
  });
  await expect(page.getByText("reopened-range", { exact: true })).toBeVisible();
  await page.getByRole("menuitem", { name: "Insert", exact: true }).click();
  await page.getByRole("menuitem", { name: /^Bookmark/ }).click();
  const dialog = page.getByRole("dialog", { name: "Bookmark", exact: true });
  await dialog.getByRole("listbox", { name: "Existing bookmarks" }).selectOption("test");
  await dialog.getByRole("button", { name: "Go to", exact: true }).click();
  await dialog.getByRole("button", { name: "Close", exact: true }).last().click();
  await page.keyboard.type("!");
  await expect(editor).toHaveText("!");
});

test("Writer preserves overlapping bookmarks and the paragraph mark through browser storage", /** Opens the upstream fixture in Writer and checks the DOCX downloaded after reload. @param fixture - Browser fixtures. @param fixture.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const input = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/fdo85542.docx",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text", exact: true });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(input);
  await expect(editor).toHaveText("AAABBCCCDDD");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "fdo85542", exact: true }).click();
  await expect(editor).toHaveText("AAABBCCCDDD");
  const download = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export…", exact: true }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await download).path();
  if (path === null) throw new Error("Missing DOCX download.");
  const xml = await (
    await DocumentArchive.open(new Uint8Array(await readFile(path)))
  ).readTextEntry("word/document.xml");
  expect(xml.match(/<w:bookmarkStart\b/gu)).toHaveLength(3);
  expect(xml.match(/<w:bookmarkEnd\b/gu)).toHaveLength(3);
  const properties = xml.match(/<w:pPr>[\s\S]*?<\/w:pPr>/u)?.[0];
  expect(properties).toMatch(/<w:rPr>[^]*?<w:lang w:val="de-DE"\/>[^]*?<\/w:rPr>/u);
});

test("Writer renders the paragraph mark color on the DOCX list label after browser reload", /** Exercises the imported native compatibility setting and normal text rendering. @param fixture - Browser fixtures. @param fixture.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const input = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/core/unocore/data/paragraph-marker-formatted-run.docx",
      import.meta.url,
    ),
  );
  const label = page.locator("[data-writer-list-label]");
  const run = page.getByText("numbering with a formatted run", { exact: true });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(input);
  await expect(label).toHaveCSS("color", "rgb(0, 128, 0)");
  await expect(label).toHaveCSS("font-weight", "400");
  await expect(run).toHaveCSS("font-weight", "700");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.getByRole("button", { name: "Open", exact: true }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "paragraph-marker-formatted-run", exact: true }).click();
  await expect(label).toHaveCSS("color", "rgb(0, 128, 0)");
  await expect(label).toHaveCSS("font-weight", "400");
  await expect(run).toHaveCSS("font-weight", "700");
});
