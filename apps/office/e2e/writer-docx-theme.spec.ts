/** @fileoverview Writer DOCX theme through the production ODT storage and download flow. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { DocumentArchive } from "../src/package/source/zippackage/document-archive";

test("Writer preserves themed text across primary ODT and DOCX download", /** Exercises the existing file dialog, Worker-backed storage, and a mobile reopen. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/core/theme/data/ThemeColorInHeading.docx",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(editor).toContainText("Heading 1");
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "ThemeColorInHeading", exact: true }).click();
  await expect(editor).toContainText("Heading 1");

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (!path) throw new Error("Chromium did not expose the DOCX file.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(new Uint8Array(bytes));
  expect(await archive.readTextEntry("word/_rels/document.xml.rels")).toContain(
    'Target="theme/theme1.xml"',
  );
  expect(await archive.readTextEntry("word/theme/theme1.xml")).toContain("<a:accent1>");
  const styles = await archive.readTextEntry("word/styles.xml");
  expect(styles).toContain('w:themeColor="accent1"');
  expect(styles).toContain('w:ascii="Noto Sans"');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "reopened-theme.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  await expect(page.getByText("reopened-theme", { exact: true })).toBeVisible();
  await expect(editor).toContainText("Heading 1");
});

test("Writer preserves Word stylistic sets through the production file dialog", /** Opens unchanged native QA input, verifies the actual download and reopens it on mobile. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/TextEffects_StylisticSets_CntxtAlts.docx",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(editor).toContainText("StylisticSets1 StylisticSets2");
  await expect(page.getByText("ContextualAlternatives", { exact: true })).toBeVisible();

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (!path) throw new Error("Chromium did not expose the DOCX file.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  const document = await archive.readTextEntry("word/document.xml");
  expect(document).toContain('mc:Ignorable="w14 wp14 w15"');
  expect(document).toContain('<w14:styleSet w14:id="4"/>');
  expect(document).toContain('<w14:styleSet w14:id="2"/>');
  expect(document).toContain("<w14:cntxtAlts><w14:cntxtAlts/></w14:cntxtAlts>");
  const settings = await archive.readTextEntry("word/settings.xml");
  expect(settings.match(/<w:compatSetting\b/gu)).toHaveLength(5);
  expect(settings).toContain(
    'w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"',
  );
  expect(settings).toContain(
    'w:name="enableOpenTypeFeatures" w:uri="http://schemas.microsoft.com/office/word" w:val="1"',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    buffer: bytes,
    name: "reopened-stylistic-sets.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  await expect(page.getByText("reopened-stylistic-sets", { exact: true })).toBeVisible();
  await expect(editor).toContainText("StylisticSets1 StylisticSets2");
});

test("Writer downloads the original run theme and document ligatures through the Worker", /** Imports the unmodified Writer test package and downloads the current document. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const file = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/Test_ThemePortionLevel_CharColor.docx",
      import.meta.url,
    ),
  );
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(file);
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toContainText(
    "Sample Text",
  );

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (!path) throw new Error("Chromium did not expose the DOCX file.");
  const archive = await DocumentArchive.open(new Uint8Array(await readFile(path)));
  expect(await archive.readTextEntry("word/document.xml")).toContain('w:themeColor="accent2"');
  const styles = await archive.readTextEntry("word/styles.xml");
  expect(styles).toContain('<w14:ligatures w14:val="standardContextual"/>');
  expect(styles).toContain('w:asciiTheme="minorHAnsi"');
  expect(styles).toContain('w:ascii="Calibri"');
  expect(await archive.readTextEntry("word/settings.xml")).toContain(
    '<w:themeFontLang w:val="en-GB"',
  );
});

test("Writer keeps the DOCX tab grid through local ODT and DOCX download", /** Exercises the original ruler and the existing desktop and mobile file workflow. @param fixtures - Browser fixtures. @param fixtures.page - Chromium page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/fdo80902.docx",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  const ruler = page.getByLabel("Writer horizontal ruler");
  const tab = ruler.locator('[data-ruler-default-tab="840"]');
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(editor).toContainText("QA Testers");
  await expect(tab).toHaveCount(1);
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "fdo80902", exact: true }).click();
  await expect(tab).toHaveCount(1);

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (!path) throw new Error("Chromium did not expose the DOCX file.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  expect(await archive.readTextEntry("word/settings.xml")).toContain(
    '<w:defaultTabStop w:val="840"/>',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "tab-grid-reopened.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: bytes,
  });
  await expect(editor).toContainText("QA Testers");
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(tab).toHaveCount(1);
});

test("Writer keeps inherited and cleared DOCX tab positions on the ruler", /** Opens the pinned clearTabs fixture and checks the stored and downloaded forms. @param fixtures - Chromium fixtures. @param fixtures.page - Page. @returns Completion. */ async ({
  page,
}) => {
  const fixture = fileURLToPath(
    new URL(
      "../../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/tdf63561_clearTabs.docx",
      import.meta.url,
    ),
  );
  const editor = page.getByRole("textbox", { name: "Writer document text" });
  const tabs = page.getByRole("button", { name: /^Tab stop \d+$/u });
  await page.goto("/writer");
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles(fixture);
  await expect(editor).toHaveText(/^\s*Tab\s*$/u);
  await expect(tabs).toHaveCount(5);
  await expect(page.getByRole("status", { name: "Writer status bar" })).toContainText(
    "Saved locally in this browser.",
  );

  await page.reload();
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "In browser" }).click();
  await page.getByRole("button", { name: "tdf63561_clearTabs", exact: true }).click();
  await expect(tabs).toHaveCount(5);

  const finished = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "File" }).click();
  await page.getByRole("menuitem", { name: "Export…" }).click();
  await page.getByRole("button", { name: "Download DOCX" }).click();
  const path = await (await finished).path();
  if (!path) throw new Error("Chromium did not expose the DOCX file.");
  const bytes = await readFile(path);
  const archive = await DocumentArchive.open(bytes);
  expect(await archive.readTextEntry("word/document.xml")).toContain(
    '<w:tab w:val="clear" w:pos="144"/>',
  );

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open" }).click();
  await page.getByRole("tab", { name: "On computer" }).click();
  await page.getByLabel("Browse").setInputFiles({
    name: "paragraph-tabs-reopened.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    buffer: bytes,
  });
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(editor).toHaveText(/^\s*Tab\s*$/u);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(tabs).toHaveCount(5);
});
